# ADR-002: Redis for Caching, Locking, and Real-Time Coordination

## Status
Accepted

## Context
ParkOps requires:
1. **Low-latency reads** for the parking list (most-read endpoint, changes rarely)
2. **Concurrency control** when two users attempt to book the same slot simultaneously
3. **Idempotency** for booking creation under mobile client retries
4. **Real-time** Socket.IO event coordination across multiple API instances

## Decision
Use **Redis** (AWS ElastiCache) for:
- Response caching (parking list, individual locations)
- Distributed slot locking (`SET NX EX`)
- Idempotency key storage
- Socket.IO pub/sub adapter for multi-node coordination

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| MongoDB as cache | Too slow for sub-millisecond cache lookups; no atomic NX semantics |
| In-memory (Node.js) | Does not work in multi-instance deployments; no distributed locking |
| Memcached | No pub/sub; no atomic operations for locking; no persistence |
| Database-level locks | Mongo distributed locks are complex; adds latency to the DB critical path |

## Reasons
1. **Atomic `SET NX EX`** — a single Redis command acquires a lock only if the key doesn't exist, with automatic expiry. This is the standard distributed lock pattern.
2. **Sub-millisecond latency** — cache hits serve parking list responses without touching MongoDB
3. **Socket.IO adapter** — the `socket.io-redis` adapter uses Redis pub/sub to fan out events across all ECS task instances, enabling horizontal scaling of WebSocket connections
4. **Graceful degradation** — the implementation falls back to in-memory for non-critical operations (cache) when Redis is unavailable

## Redis Usage Map
| Use | Key Pattern | TTL |
| :--- | :--- | :--- |
| Parking list cache | `parking:list:{city}:{page}` | 60s |
| Slot detail cache | `parking:{id}` | 60s |
| Slot booking lock | `slot-lock:{slotId}:{startMs}-{endMs}` | 30s |
| Idempotency | `idempotency:{key}` | 300s |
| Socket.IO adapter | Internal | — |

## Consequences
- Adds operational complexity (another service to manage/monitor)
- Redis is a single point of failure for slot locking in production — mitigated by:
  - ElastiCache automatic failover
  - The `STRICT_REDIS_LOCKS=true` env var that causes lock requests to fail-safe (reject) when Redis is down in multi-node production
- Cache invalidation on location update/delete is implemented but TTL-based drift is possible in edge cases
