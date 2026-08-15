# Interview Preparation — ParkOps

Complete preparation for technical, system design, DevOps, and security interviews.

---

## System Design Questions

### Q: Walk me through the architecture of ParkOps.

**2-Minute Answer:**
> ParkOps is a multi-tenant smart parking SaaS. Users — both drivers and parking operators — interact with a React frontend hosted on CloudFront. API requests go through an AWS Application Load Balancer to Node.js/Express running on ECS Fargate containers. The primary database is MongoDB Atlas — I chose it for its flexible document model and native geospatial support. Redis handles three things: response caching for parking list queries, distributed slot locking to prevent double-booking, and Socket.IO pub/sub for real-time availability across multiple containers.
>
> Real-time updates work via Socket.IO — when a slot is booked or released, the server broadcasts to all clients viewing that parking location. Infrastructure is defined as code with Terraform, deployed via GitHub Actions CI/CD. Secrets live in AWS Secrets Manager, never in environment files.

---

### Q: How does your booking system prevent double booking?

**Answer:**
> Two-layer defense. First, when a booking request arrives, the server acquires a Redis distributed lock using `SET NX EX` — this is an atomic operation that only succeeds if the key doesn't exist. The key is `slot-lock:{slotId}:{startTime}-{endTime}`. If another request has the lock, the second request gets a 409 immediately.
>
> The second layer is a database overlap query with a compound index: `{ slotId, bookingStatus, startTime, endTime }`. It finds any existing active booking where the time windows intersect. This catches the case where two requests passed the lock at different time window granularities.
>
> The lock is released in a `finally` block after the booking is committed to the database. TTL on the lock ensures cleanup even if the server crashes mid-transaction.

---

### Q: Why MongoDB instead of PostgreSQL?

**Answer:**
> Three reasons. First, the parking location document has variable metadata — some have multi-floor layouts, some are open lots, some have EV chargers. A relational schema would need many nullable columns or a complex EAV pattern. MongoDB's document model handles this naturally.
>
> Second, MongoDB has native 2dsphere geolocation index support. The `$near` operator for proximity search works out of the box. PostgreSQL would require the PostGIS extension.
>
> Third, the user's vehicle array is embedded in the user document. That's a natural fit for MongoDB and avoids a separate JOIN table.
>
> That said, for the payment and booking domain specifically, a relational database's ACID transactions and foreign key constraints would have been useful. That's a trade-off I made consciously — documented in ADR-001.

---

### Q: Why Redis in addition to MongoDB?

**Answer:**
> MongoDB is too slow for distributed locking — an acquire-and-release round-trip to MongoDB takes 5-20ms under load. Redis is sub-millisecond. The atomic `SET NX EX` primitive in Redis is exactly what distributed locking needs.
>
> For caching, the parking list endpoint is the most-read endpoint and the data changes rarely. A 60-second Redis cache means most requests hit Redis at <1ms instead of hitting MongoDB at 20-50ms.
>
> For Socket.IO scaling, the Redis pub/sub adapter ensures that a socket event emitted on ECS Task 1 is received by a client connected to ECS Task 2. Without this, horizontal scaling breaks Socket.IO.

---

### Q: How does Socket.IO scale across multiple instances?

**Answer:**
> By default, Socket.IO only broadcasts to clients connected to the same server instance. When ECS autoscales to multiple tasks, a booking on Task 1 would only update clients on Task 1 — not Task 2.
>
> The solution is the Socket.IO Redis adapter. It uses Redis pub/sub. When Task 1 emits a room event, it publishes to a Redis channel. Task 2 subscribes to that channel and re-emits the event to its local clients. The Redis adapter handles this transparently.
>
> Client reconnects also re-sync state — on reconnect, the frontend re-fetches slot state via REST to catch any missed events during the disconnection window.

---

### Q: How does multi-tenancy work?

**Answer:**
> Every request to a tenant-scoped endpoint must include an `X-Tenant-Id` header. The `resolveTenant` middleware runs after JWT authentication. It:
> 1. Loads the Tenant document — returns 404 if not found, 403 if suspended
> 2. Checks TenantMembership — returns 403 if the user isn't an active member
> 3. Attaches `req.tenant` to the request
>
> Every controller query then explicitly includes `tenantId: req.tenant._id`. A user can't access another tenant's data because even if they know the resource ID, the `tenantId` filter causes a miss. Cross-tenant data leakage is prevented at the API layer.

---

### Q: How does payment verification work? Why don't you trust the frontend?

**Answer:**
> The payment flow is: client sends `{ bookingId, paymentMethod }`. The server verifies booking ownership (`userId === req.user.id`), checks it's not already paid, then creates a Payment record server-side with a server-generated `transactionId`. The client can't pass a `status: 'Paid'` field or their own `transactionId` — those are ignored.
>
> In a real gateway integration, the server would verify the payment webhook signature from the payment provider (Stripe signature, for example) before marking the booking as paid. This prevents a frontend that intercepts the confirmation from claiming payment succeeded.

---

## DevOps Questions

### Q: Why Docker?

**Answer:**
> Docker gives a consistent runtime environment across local development, CI, staging, and production. "Works on my machine" disappears when every environment runs the same container image built from the same Dockerfile. It also makes the CI/CD pipeline straightforward — build the image once, push to ECR, deploy the same artifact everywhere.

---

### Q: Why Terraform?

**Answer:**
> Because infrastructure is code. Every AWS resource — ECS task definitions, ALB listeners, security groups, ElastiCache clusters, CloudWatch alarms — is defined in HCL and version-controlled in Git. `terraform plan` shows exactly what will change before `apply` touches anything. This means infrastructure changes go through code review, not console clicks. It also means staging and production are identical by design.

---

### Q: Why ECS instead of Kubernetes?

**Answer:**
> For a single containerized application, ECS Fargate is significantly simpler to operate than EKS. No control plane management, no custom ingress controllers, no RBAC configuration, no cert-manager setup. ECS integrates natively with ALB, CloudWatch, and Secrets Manager. At the point where the complexity of ECS becomes a bottleneck — multiple services, different scaling requirements, complex networking — Kubernetes would be the right move.

---

### Q: How are secrets managed?

**Answer:**
> Secrets are stored in AWS Secrets Manager and injected as environment variables into ECS tasks at container start. The task definition references secret ARNs, not actual values. This means secrets never appear in:
> - Source code
> - Docker images
> - GitHub repository
> - CloudWatch logs
> - Environment files committed to Git
>
> The application validates at startup that required secrets (`MONGO_URI`, `JWT_SECRET`) are present. If not, it throws and refuses to start.

---

### Q: How does rollback work?

**Answer:**
> ECS keeps the previous task definition version. If a deployment fails health checks, ECS doesn't shift traffic to the new task. In CI/CD, the pipeline deploys to staging first and runs smoke tests. If smoke tests fail, production deploy is blocked.
>
> For emergency rollback: update the ECS service to point to the previous task definition revision. Because Docker images are tagged (not overwritten), the previous image is still in ECR. This takes about 2-3 minutes.

---

### Q: How do you detect failures in production?

**Answer:**
> Four layers:
> 1. **ALB health checks** — if the container fails `/api/health/live`, ECS replaces it
> 2. **CloudWatch Alarms** — set on 5xx error rate, p95 latency, container CPU/memory
> 3. **Structured logs** — Winston JSON logs to CloudWatch Logs; searchable via CloudWatch Insights
> 4. **Readiness endpoint** — `/api/health/ready` checks MongoDB and Redis connectivity; reported to the ALB before traffic shifts

---

## Security Questions

### Q: How is your JWT implementation secured?

**Answer:**
> Access tokens are short-lived — 15 minutes. This limits the damage window if a token is stolen. Refresh tokens are 7-day lived but stored in the database and can be revoked. On logout, the specific refresh token is removed. On password change or account ban, ALL refresh tokens are cleared.
>
> Only `HS256` is accepted — the `jwt.verify()` call doesn't allow arbitrary algorithm selection from the token header, which prevents the `alg:none` attack.
>
> Stack traces are not exposed in production responses — the error handler strips them in production.

---

### Q: How do you prevent IDOR (Insecure Direct Object Reference)?

**Answer:**
> Every resource fetch verifies ownership or tenant membership before returning data. A user can only access their own bookings — `{ userId: req.user.id }` is always part of the query. An admin can access all bookings within their tenant — `{ tenantId: req.tenant._id }` is always part of the query.
>
> A user from Tenant A cannot access Tenant B's bookings even if they know the booking ObjectId, because the tenantId filter causes a miss. The security test suite (`tests/security.test.js`) verifies this explicitly.

---

### Q: How is the QR code secured against tampering?

**Answer:**
> The QR payload is HMAC-SHA256 signed using the same `JWT_SECRET` as JWTs. The payload contains: bookingId, userId, slotId, a `verificationToken` (UUID stored in the booking), and a timestamp. Scanning the QR re-computes the signature and compares it using `crypto.timingSafeEqual` — not string equality, to prevent timing attacks.
>
> Even if someone reverse-engineers the QR data format, they can't forge a valid signature without the secret. And the verificationToken stored in the booking adds a server-side check that the QR actually matches a real booking in the database.

---

## Database Questions

### Q: What indexes does your Booking model have?

**Answer:**
> Four compound indexes:
> 1. `{ userId: 1, bookingStatus: 1 }` — for fast user booking list fetches
> 2. `{ tenantId: 1, bookingStatus: 1 }` — for admin tenant-scoped queries
> 3. `{ slotId: 1, bookingStatus: 1, startTime: 1, endTime: 1 }` — critical for the double-booking overlap check
> 4. `{ bookingStatus: 1, endTime: 1 }` — for the background expiration job (finds expired pending bookings)
>
> Without index #3, the overlap check would be a full collection scan. With it, it's an index scan over a very small set of documents.

---

### Q: How do you handle pagination?

**Answer:**
> All list endpoints support `page` and `limit` query params. Default is 20 per page. The implementation uses MongoDB `.skip().limit()`. For very large collections, cursor-based pagination (using `_id` as a cursor) would be more performant, but offset pagination is sufficient at current scale and simpler to implement.

---

## Failure Scenarios

### Q: What happens if Redis goes down?

**Answer:**
> The application has a graceful degradation mode. For caching operations, it falls back to an in-memory Map with TTL. For slot locks in production multi-instance mode (`STRICT_REDIS_LOCKS=true`), it rejects all lock requests — which means all booking attempts fail safely with a clear error. This is the correct behavior: it's better to return a 503 than to allow a double-booking race condition. In single-instance deployments, it falls back to in-memory locking which is safe. Monitoring detects the Redis connection failure via CloudWatch and pages the on-call engineer.

---

### Q: What happens if MongoDB goes down?

**Answer:**
> All API endpoints that require database access will fail with a 500. The health readiness endpoint (`/api/health/ready`) will fail, which causes the ALB to stop routing traffic to affected tasks. CloudWatch alarms on 5xx rate trigger a notification. Mongoose connection retry logic will attempt reconnection automatically. MongoDB Atlas has automatic failover for replica sets — primary election typically completes in under 30 seconds.

---

### Q: What happens if a deployment breaks production?

**Answer:**
> First: ECS health checks detect if the new task fails to start or fails health checks — in that case, ECS doesn't drain the old tasks, so existing traffic continues on the previous version. Second: If the new code deploys but behaves incorrectly (logic bug), the rollback procedure is to update the ECS service to the previous task definition revision — this takes about 2-3 minutes. CI/CD staging smoke tests are designed to catch these before they reach production.

---

## Architecture Trade-Offs

| Decision | Chose | Alternative | Why |
| :--- | :--- | :--- | :--- |
| Database | MongoDB | PostgreSQL | Flexible document model, geospatial, dev velocity |
| Architecture | Monolith | Microservices | Smaller team, transactional consistency, simpler ops |
| Cache | Redis | MongoDB TTL | Sub-ms latency, distributed lock primitives |
| Real-time | Socket.IO | Polling | Low latency, room abstraction, built-in reconnect |
| Container | ECS Fargate | Kubernetes | Simpler to operate for single-service app |
| Auth | JWT | Sessions | Stateless, microservice-ready, no server-side session store |
| IaC | Terraform | CloudFormation | Better HCL ergonomics, cross-cloud portability |
| API | REST | GraphQL | Simpler implementation, well-understood, less overhead |
| Hosting | AWS | Heroku | More control, better AWS ecosystem integration |
| Region | Single | Multi-region | Cost; not needed at current scale |
