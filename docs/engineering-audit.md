# Engineering Quality Audit

| Area | Problem | Severity | Impact | Recommended Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth/Security** | JWT secret key potentially weak in local dev `.env` | MEDIUM | Tokens could be brute-forced | Enforce high-entropy 256-bit keys in prod configs | FIXED |
| **Database** | Missing pagination on `/api/bookings` | HIGH | Heavy load on DB for tenants with huge history | Implement `limit` and `page` in controller | FIXED |
| **Testing** | Lack of concurrency tests for booking slot reservations | CRITICAL | Possible double-booking race condition under load | Write Jest Promise.all tests verifying DB Locks | FIXED |
| **Multi-Tenancy** | Frontend lacks dynamic CSS variables for branding | LOW | Branding is static per user session | Update React root CSS on tenant switch | PENDING |
| **CI/CD** | Missing security scans on Docker image build | HIGH | Vulnerable dependencies shipped | Add Trivy container scan to GitHub Actions | FIXED |
| **SRE** | Lack of standardized API Error format | MEDIUM | Clients must guess error properties | Implement global error handler standard | FIXED |
| **Payments** | Webhooks lack replay idempotency checks | HIGH | Duplicate refunds or bookings | Ensure `transactionId` is uniquely indexed | FIXED |
