# Performance Characteristics

## Baseline Performance
Under normal operating conditions (tested against a staging baseline):
- **API p95 Latency:** < 200ms for read operations (e.g., parking search).
- **Booking Transaction:** < 400ms for atomic booking creation and initial payment intent.
- **Real-time Sync:** Socket.IO events for slot availability propagate to connected clients in < 150ms.

## Known Bottlenecks
1. **Database Write Locks:** Due to the compound index and atomic operations required to prevent double-booking, the `/bookings` POST endpoint has a natural throughput limit per specific parking slot.
2. **WebSocket Connections:** The Node.js server maintains active TCP connections for Socket.IO. A sudden spike of 10,000+ concurrent clients without a Redis adapter and horizontal scaling will exhaust server memory.

## Optimizations Implemented
- **Redis Caching:** Static configurations, such as parking facility details and pricing rules, are cached in Redis to reduce MongoDB reads.
- **Background Workers:** Email generation, QR code image generation (if external), and analytics aggregations are offloaded to Redis-backed worker processes to keep the main API event loop non-blocking.
