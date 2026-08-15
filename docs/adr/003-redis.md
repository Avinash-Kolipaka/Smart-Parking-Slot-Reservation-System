# ADR 003: Redis for Caching and Background Jobs

**Status:** Accepted

## Context
Sending emails (for QR passes) and processing background analytics can block the main Node.js event loop, resulting in high latency for user-facing API requests. Furthermore, repetitive read-heavy queries (like fetching parking rules) place unnecessary load on MongoDB.

## Decision
We chose Redis (via AWS ElastiCache) to serve dual purposes:
1. **Message Queue / Job Broker:** Using a library like BullMQ, we offload heavy tasks (emails, notifications, long-running reports) to dedicated worker containers that listen to Redis queues.
2. **Key-Value Cache:** We cache semi-static application configurations and heavily-read aggregates.

## Consequences
- **Positive:** API response times remain low. Resilience to email provider timeouts.
- **Negative:** Introduces another stateful piece of infrastructure to monitor and maintain.
