# Security Threat Model

This document outlines potential threats to the ParkOps platform and how the architecture mitigates them.

| Threat | Impact | Mitigation | Residual Risk |
| :--- | :--- | :--- | :--- |
| **Credential / JWT Theft** | Account takeover, unauthorized bookings. | Passwords hashed (bcrypt). JWTs have short expiration (`1d`). Use of HTTP-only cookies recommended for production. | Medium. Stolen tokens remain valid until expiration unless a blacklist is implemented. |
| **IDOR (Insecure Direct Object Reference)** | Accessing another user's booking or payment history. | All controllers verify `req.user.id` against the resource's `userId`. Admin routes are protected by RBAC middleware. | Low |
| **Double Booking (Race Condition)** | Two users reserve the same slot for the same time, causing physical conflict. | MongoDB atomic transactions and unique compound indexes on `(slotId, startTime, endTime)`. Slot locking mechanism during checkout flow. | Low |
| **QR Code Replay** | User shares a QR code with a friend, or attempts to enter multiple times. | The `check-in` API verifies the booking status. Once checked-in, the state transitions. A second scan returns `400 Already Checked In`. | Low |
| **Payment Webhook Forgery** | Attacker spoofs payment success to get free parking. | Stripe/Razorpay webhook signatures are cryptographically verified using `PAYMENT_WEBHOOK_SECRET` before updating booking state. | Low |
| **API Abuse / DDoS** | Service unavailability due to spamming login or booking routes. | `express-rate-limit` applied globally and aggressively on `/auth` routes. AWS ALB WAF provides external layer protection. | Low |
| **Secret Leakage** | Database compromise or cloud account takeover. | Secrets stored in AWS Secrets Manager (or local `.env` strictly ignored in `.gitignore`). Secret scanning implemented in CI/CD. | Low |
