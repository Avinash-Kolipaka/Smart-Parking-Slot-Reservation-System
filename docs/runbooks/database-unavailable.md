# Runbook: Database Unavailable (Readiness Probe Failing)

**Symptoms:**
- `/api/health/ready` returns 503.
- Application logs show Mongoose connection errors or `MongoTimeoutError`.
- Features dependent on data (Auth, Bookings) are failing with 500 errors.

**Possible Causes:**
- MongoDB Atlas cluster maintenance or failure.
- IP Whitelist issues in MongoDB Atlas (e.g., EC2 IP changed).
- Database credentials revoked or expired.

**Checks:**
1. Log into the MongoDB Atlas console.
2. Verify Cluster Status (Active vs Upgrading).
3. Check the Network Access tab in Atlas to ensure the VPC/EC2 IP is permitted.
4. Verify the `MONGO_URI` environment variable on the server.

**Recovery Steps:**
1. If Atlas is undergoing maintenance, wait for completion (inform users via status page).
2. If IP blocking is the cause, update the Atlas Network Access list.
3. If data is corrupted, initiate the Disaster Recovery restore procedure.
