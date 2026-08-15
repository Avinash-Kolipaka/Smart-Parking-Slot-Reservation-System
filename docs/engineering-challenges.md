# Engineering Challenges — ParkOps

Documentation of the key engineering challenges encountered and how they were solved.

---

## 1. Preventing Double Booking Under Concurrency

### Problem
In a high-demand scenario (e.g., a popular event parking lot going live), hundreds of users might attempt to book the same slot in the same time window simultaneously. A naive implementation using a simple "check then insert" pattern would allow multiple bookings to succeed — resulting in double-booking.

### Approach
**Two-layer defense:**

**Layer 1 — Redis Distributed Lock:**
```
Acquire: SET slot-lock:{slotId}:{startMs}-{endMs} LOCKED NX EX 30
```
- Atomic operation: succeeds only if the key doesn't exist
- 30s TTL ensures the lock is released even if the server crashes mid-transaction
- If lock is held, return 409 immediately without touching the database

**Layer 2 — Database Overlap Query (with compound index):**
```javascript
{ slotId, bookingStatus: { $in: ['Pending','Confirmed','Active'] },
  startTime: { $lt: requestedEnd },
  endTime: { $gt: requestedStart } }
```
- Compound index: `{ slotId, bookingStatus, startTime, endTime }`
- Catches edge cases where different time granularities slip through the lock

**Layer 3 — State machine:**
- Booking status transitions are enforced: Pending → Confirmed → Active → Completed
- A cancelled or expired booking cannot be transitioned into Active

### Trade-off
- Redis introduces an additional failure point. Mitigated with graceful degradation (in-memory lock for single instance) and `STRICT_REDIS_LOCKS=true` for multi-node production (rejects all lock requests if Redis is unavailable, trading availability for correctness).

### Result
Zero double-bookings possible when the implementation is followed correctly. Concurrent booking attempts on the same slot return a clear 409 CONFLICT.

---

## 2. Real-Time Slot Synchronization

### Problem
When a slot is booked, cancelled, or checked out, every user currently viewing that parking location's slot map needs to see the change immediately — without polling.

### Approach
Socket.IO with Redis pub/sub adapter:
1. Every booking event emits to a named room: `parking:{locationId}`
2. Clients join this room when they open a parking location page
3. The Redis pub/sub adapter ensures the event is broadcast to clients on **all** ECS task instances, not just the one that processed the booking

**Client reconciliation on reconnect:**
- Socket.IO auto-reconnects with exponential backoff
- On reconnect, the frontend re-fetches slot state via REST API to catch any missed events during disconnection

### Trade-off
- Socket events are not persisted — if a client is disconnected when an event fires, they miss it. The REST reconciliation on reconnect compensates.
- Redis adapter is required for multi-node. Without it, Socket.IO only broadcasts to clients connected to the same server instance.

### Result
Slot map updates within <100ms of a booking event being processed. Works across multiple ECS task instances via Redis pub/sub.

---

## 3. Multi-Tenant Data Isolation Without Database-Per-Tenant

### Problem
ParkOps serves multiple independent parking operator organizations (tenants). Their data must be completely isolated — users in Tenant A should never see Tenant B's bookings, locations, or analytics.

### Approach
Shared database with application-layer tenant scoping:
- Every tenant-owned document has a `tenantId` field (indexed)
- The `resolveTenant()` middleware validates `X-Tenant-Id` header and verifies user membership before every controller
- Every query is automatically scoped: `{ ...filter, tenantId: req.tenant._id }`

This prevents BOLA/IDOR:
- Even if a user knows another tenant's resource ObjectId, the `tenantId` filter causes a miss

### Trade-off
- Isolation is enforced at the application layer, not the database layer — a query bug that omits `tenantId` could expose cross-tenant data. Mitigated by the consistent middleware pattern and code review.
- Database-per-tenant would offer stronger isolation but at much higher operational cost.

### Result
Cross-tenant data access is prevented at the API middleware layer. Security tests validate this.

---

## 4. Payment Consistency Without a Real Gateway

### Problem
Even in simulation mode, the payment flow must be atomically consistent — a payment must not be recorded without a corresponding booking state update, and vice versa. The client must not be able to fake payment success.

### Approach
Server-side payment state machine:
1. Verify booking ownership
2. Check booking is not already paid (idempotency)
3. Create Payment record server-side (server generates transactionId)
4. Update booking: `paymentStatus='Paid'`, `bookingStatus='Confirmed'`
5. Send confirmation email (async, non-blocking)

The client cannot provide `status: 'Paid'` — it's never read from the request body.

### Trade-off
Without a real payment gateway, there's no actual fund movement. Payment webhook verification would be required for production financial integration.

### Result
Payment and booking state are always consistent. No orphaned payment records or conflicting states.

---

## 5. QR Code Replay Protection

### Problem
A QR code is used once — for check-in. If the code were static and unauthenticated, someone could:
- Copy the QR image and use it again after check-out
- Forge a QR for a cancelled booking
- Fabricate a QR with a made-up bookingId

### Approach
**HMAC-SHA256 signed QR:**
- Payload contains: `{ bookingId, userId, slotId, verificationToken, timestamp, signature }`
- Signature uses `JWT_SECRET` — unforgeable without the key
- Server recomputes signature on verification; uses `timingSafeEqual` to prevent timing attacks
- `verificationToken` (UUID) is stored in the booking document — verified server-side

**State machine enforcement:**
- Already checked-in booking → verify-qr returns error
- Cancelled/Expired → verify-qr returns error
- Only `Confirmed` status can be checked in

### Trade-off
- QR validity is not time-limited (no expiry in the payload). Adding a short expiry window (e.g., 30 minutes) would add replay protection but require time-synchronized clocks and user re-generation.

### Result
Forged QRs fail signature verification. Replayed QRs fail state machine check. Timing attack resistance via `timingSafeEqual`.

---

## 6. Background Job Reliability

### Problem
The booking expiration job must reliably expire `Pending` bookings after 15 minutes and release their slots — even if the server restarts, even under load.

### Approach
`node-cron` running within the Express process:
- Scheduled every 5 minutes
- Queries: `{ bookingStatus: 'Pending', endTime: { $lt: now - 15min } }`
- Bulk update expired records
- Broadcasts Socket.IO events for each released slot
- Fully idempotent — running twice produces the same result

### Trade-off
- The cron job runs inside the API process. Under ECS autoscaling (multiple tasks), the same job runs in all tasks simultaneously — both would process the same records. This is idempotent for the status update (MongoDB `findOneAndUpdate` is atomic) but could cause duplicate Socket.IO broadcasts.
- A proper solution would use a distributed job queue (BullMQ) with Redis to ensure exactly-once execution. This is a documented known improvement.

### Result
Expired bookings are reliably cleaned up every 5 minutes. Slots are released and the slot map updates in real-time.

---

## 7. Production Deployment with Zero Hardcoded Credentials

### Problem
A common mistake in early-stage projects is hardcoding secrets (DB passwords, API keys, JWT secrets) in source code or Docker images. This creates an irreversible security risk once pushed to a public repository.

### Approach
- All secrets in AWS Secrets Manager → injected into ECS tasks at runtime
- Application validates at startup — throws clear error if `MONGO_URI` or `JWT_SECRET` is missing
- QR service throws if `JWT_SECRET` is absent (removed hardcoded fallback in final hardening)
- `.env` is gitignored; `.env.example` documents all required variables
- CI/CD uses GitHub Actions secrets for AWS credentials — never in plaintext in YAML

### Result
No credentials exist in the codebase, Docker images, or CI/CD configuration files. The application fails fast and clearly if a required secret is missing.

---

## 8. Observability in Production

### Problem
Without proper observability, failures in production are invisible until users report them. By then, significant damage may have occurred.

### Approach
Multi-layer observability:
- **Structured JSON logs** (Winston) — every request is logged with `requestId`, method, URL, statusCode, duration
- **Health endpoints** — `/api/health/live` (process alive) and `/api/health/ready` (DB + Redis connected)
- **ALB health checks** — ECS replaces unhealthy tasks automatically
- **CloudWatch alarms** — 5xx error rate, p95 latency, container CPU/memory
- **Audit logs** — security-relevant admin actions logged to MongoDB `AdminLog` collection

### Trade-off
- No distributed tracing (e.g., X-Ray, Jaeger). For a monolith, structured logging with request IDs provides sufficient traceability. Distributed tracing would be needed for microservices.
- CloudWatch Insights queries are available but not pre-built dashboards — requires setup.

### Result
Failures are detectable within minutes through CloudWatch alarms. Request traces can be correlated via `requestId` in logs. Health checks prevent routing traffic to unhealthy instances.
