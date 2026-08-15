# ADR-004: Socket.IO for Real-Time Communication

## Status
Accepted

## Context
ParkOps needs to broadcast slot availability changes instantly to all users viewing a parking location page. When a slot is booked, cancelled, or changed in status, every connected client on that page should reflect the change without manual refresh.

## Decision
Use **Socket.IO** with a **Redis pub/sub adapter** for real-time bidirectional event broadcasting.

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| Polling (setInterval) | Creates excessive API load; introduces latency (up to poll interval); wastes bandwidth |
| Server-Sent Events (SSE) | Unidirectional only; more complex for room/namespace management |
| Native WebSocket | Lower-level, no room abstraction, no auto-reconnect, no fallback |
| Long-polling only | High latency for real-time feel; complex server-side session management |

## Reasons
1. **Room abstraction** — clients join a `parking:{locationId}` room. Updates are broadcast only to clients viewing that specific location.
2. **Auto-reconnect** with exponential backoff built in — no custom reconnection logic
3. **Fallback** — degrades to long-polling in environments that block WebSocket
4. **Redis adapter** — enables multi-node deployment (ECS autoscaling) without message loss
5. **Mature ecosystem** — battle-tested; excellent documentation

## Consequences
- Requires sticky sessions OR a shared pub/sub layer for multi-node (solved by Redis adapter)
- Additional operational concern (Redis dependency for scaling)
- Client reconnects must re-sync state via REST call (Socket.IO events are not persisted)

## Scaling Path
- Single node: works without Redis adapter
- Multi-node (ECS autoscaling): Redis pub/sub adapter required — already implemented
- Beyond Redis: Kafka or NATS could replace Redis pub/sub for very high-volume event streams (thousands of bookings/minute)
