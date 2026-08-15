# Production Runbook

This runbook provides actionable procedures for common production failures.

## 1. API Outage (ALB returns 5xx)
**Symptoms**: ALB returns 502/503/504 to all requests.
**Action**:
1. Check ECS Service tasks. Are they crash-looping?
2. If tasks are crashing on boot, check CloudWatch Logs for missing secrets or bad DB connections.
3. If this happened immediately after a deployment, **rollback** the task definition.
4. If tasks are healthy but ALB fails, check the Security Group rules between ALB and ECS.

## 2. Database Outage (MongoDB Atlas)
**Symptoms**: Application throws `MongoTimeoutError`, `ready` health check fails.
**Action**:
1. Log into MongoDB Atlas console.
2. Check if a primary election is in progress (usually resolves within 30s).
3. Check for connection limit exhaustion or CPU spikes on the cluster.
4. If data is corrupt, follow `disaster-recovery.md` to perform Point-in-Time Restore.

## 3. Redis Outage
**Symptoms**: Redis timeouts in logs. Depending on `STRICT_REDIS_LOCKS`:
- If strict: Bookings fail with 503.
- If loose: Bookings fall back to memory locks (risk of double booking in multi-node).
**Action**:
1. Check ElastiCache metrics (CPU, SwapUsage, EngineCPUUtilization).
2. If Redis is OOM, flush cache via `redis-cli` (locks and Socket.IO rooms will be lost temporarily).
3. If ElastiCache node failed, wait for AWS auto-failover (if Multi-AZ) or reboot the node via AWS Console.

## 4. Worker Outage (Background Jobs)
**Symptoms**: Pending bookings are not expiring after 15 minutes.
**Action**:
1. Since workers run inside the Express process, verify if the `/api/health/live` is healthy.
2. If the API is healthy but jobs aren't running, check logs for `unhandledRejection` or cron silent failures.
3. Restart the ECS service to forcibly reboot the node-cron instances.

## 5. High CPU or Memory
**Symptoms**: CloudWatch alarm `api-high-cpu` fires.
**Action**:
1. Verify if ECS Autoscaling has triggered correctly.
2. If autoscaling is maxed out (`max_capacity=4`), investigate traffic spikes (DDoS?).
3. If traffic is normal but CPU is high, capture a CPU profile or inspect CloudWatch Logs for expensive DB queries (e.g., missing indexes).
4. Temporarily increase `max_capacity` via Terraform or AWS Console to mitigate impact.

## 6. Payment Outage
**Symptoms**: Users cannot complete bookings (simulated payment gateway failing).
**Action**:
1. Inspect logs for the payment controller.
2. If the simulated gateway is returning errors artificially, fix the logic.
3. (In real-world): Check status page of the third-party payment provider. Fail gracefully with clear messaging to the user.

## 7. Failed Deployment
**Symptoms**: New code deploys but introduces severe logical bugs not caught by tests.
**Action**:
1. Navigate to ECS Service in AWS Console.
2. Update the service and select the previous known-good Task Definition Revision.
3. Check `Force new deployment`.
4. Monitor old tasks spinning up and new tasks draining.

## 8. Security Incident
**Symptoms**: Suspected data breach, unauthorized access, or leaked credentials.
**Action**:
1. Containment: Rotate `JWT_SECRET` and `MONGO_URI` in AWS Secrets Manager immediately.
2. Restart all ECS tasks to pull the new secrets and invalidate all existing JWTs.
3. Disable affected tenant or user accounts via the MongoDB shell or Admin API.
4. Initiate a SEV-1 incident response and engage the security team.
