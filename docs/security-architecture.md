# Security Architecture

## Overview

ParkOps implements a defense-in-depth security model across every layer of the stack. This document describes the security architecture, rationale, and implementation details.

---

## 1. Authentication

### JWT Strategy
- **Access Token**: Short-lived (15 minutes), signed with `HS256`, contains `{ id, role }`
- **Refresh Token**: Long-lived (7 days), stored in the `user.refreshTokens[]` array in MongoDB
- **Rotation**: A new access token is issued on each refresh. Refresh tokens are invalidated on:
  - Explicit logout (token removed from array)
  - Password change (entire array cleared)
  - Account ban (entire array cleared)

### Algorithm Security
- Only `HS256` is accepted — the `jwt.verify()` call explicitly uses `process.env.JWT_SECRET`
- No arbitrary algorithm selection from the token header is possible (prevents alg:none attacks)

### Token Storage
- Tokens are stored in memory on the client (not localStorage in secure implementations)
- Refresh tokens are stored hashed in MongoDB, not in cookies

---

## 2. Authorization (RBAC)

| Role | Scope |
| :--- | :--- |
| USER | Own resources only |
| PARKING_MANAGER | Manage own parking facilities |
| ADMIN | Full tenant-scoped management |
| SUPER_ADMIN | Cross-tenant platform administration |

**Enforcement:** Every protected endpoint uses the `authorize(...roles)` middleware, which normalizes the role to uppercase and checks against allowed roles. `SUPER_ADMIN` is always allowed access to administrative endpoints.

**Important:** Authorization is enforced **server-side only**. Frontend route guards are UX-only and are never trusted by the API.

---

## 3. Tenant Isolation

```
Request
  → protect()          → verify JWT, load user
  → resolveTenant()    → read X-Tenant-Id header,
                          verify tenant exists,
                          verify user has ACTIVE membership
  → controller         → all DB queries include tenantId: req.tenant._id
```

- **Cross-tenant access is prevented** at the middleware layer before any controller logic runs
- Resources are scoped by `tenantId` in the database schema (Booking, ParkingLocation, Slot, Payment, etc.)
- A user who knows another tenant's resource ID cannot access it — the tenantId scope filter ensures a miss returns 404

---

## 4. Rate Limiting

| Endpoint Group | Limit | Window |
| :--- | :--- | :--- |
| All `/api/*` | 300 requests | 15 minutes |
| `/api/auth/login` | 30 requests | 15 minutes |
| `/api/auth/register` | 30 requests | 15 minutes |

Rate limiting is applied at the Express middleware level using `express-rate-limit`, keyed by IP address.

---

## 5. Input Validation

All request bodies are validated using **Zod schemas** before reaching controllers:
- Type coercion and validation (string, number, enum, regex)
- Unknown fields are stripped (`.strict()` equivalent via parse)
- Validation errors return 400 with field-level messages, never reaching the controller
- Mass assignment protection: controllers destructure only known fields from `req.body`

---

## 6. Security Headers

Helmet.js is applied globally at application startup:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Strict-Transport-Security` (HSTS in production)
- `X-XSS-Protection`

---

## 7. Secret Management

| Secret | Storage |
| :--- | :--- |
| JWT_SECRET | AWS Secrets Manager → ECS environment |
| JWT_REFRESH_SECRET | AWS Secrets Manager → ECS environment |
| MONGO_URI | AWS Secrets Manager → ECS environment |
| SMTP credentials | AWS Secrets Manager → ECS environment |
| Cloudinary keys | AWS Secrets Manager → ECS environment |
| Payment keys | AWS Secrets Manager → ECS environment |

- Secrets are **never hardcoded** in source code
- Application fails to start with a clear error if `MONGO_URI` or `JWT_SECRET` is missing
- The QR signing function explicitly throws if `JWT_SECRET` is not set (fixed in final hardening)

---

## 8. Audit Logging

Security-relevant actions are logged to the `AdminLog` collection:

| Action | Logged Fields |
| :--- | :--- |
| UPDATE_USER_ROLE | adminId, userId, old role, new role |
| BAN_USER / UNBAN_USER | adminId, userId, status change |
| DELETE_USER | adminId, userId, email |
| CREATE_LOCATION | adminId, locationId, name |
| UPDATE_LOCATION | adminId, locationId |
| DELETE_LOCATION | adminId, locationId, method (soft/hard) |

Logs include: actor, action, resource, resourceId, timestamp, detail.
**Secrets, tokens, and passwords are never logged.**

---

## 9. QR Code Security

- QR payload is **HMAC-SHA256 signed** using `JWT_SECRET`
- Payload contains: `{ bookingId, userId, slotId, verificationToken, timestamp, signature }`
- No sensitive data (no full user details, no payment info) is encoded in the QR
- Signature verification uses `crypto.timingSafeEqual()` to prevent timing attacks
- Server-side state machine prevents reuse:
  - Already checked-in booking → rejected
  - Already completed booking → rejected
  - Cancelled/Expired booking → rejected

---

## 10. Payment Security

- Payment status is **determined server-side exclusively**
- The client cannot pass `status: 'Paid'` or `transactionId` to override the server
- The server generates its own `transactionId` (`TXN-{hex}`)
- Before processing: booking ownership is verified against `req.user.id`
- No real card data is processed (current implementation uses simulation)
- In production: webhook signatures from the payment provider must be verified

---

## 11. CORS

- `Access-Control-Allow-Origin` is set to `process.env.CLIENT_URL` (not `*`)
- Credentials (`credentials: true`) only for the trusted frontend origin
- Unknown origins are blocked by the browser's same-origin policy

---

## 12. Error Response Security

The `errorHandler` middleware ensures:
- Stack traces are **only included** when `NODE_ENV !== 'production'`
- MongoDB connection strings never appear in error responses
- Internal file paths are not exposed
- All errors return a consistent `{ success, message, errorCode, requestId }` structure

---

## 13. Password Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Password field has `select: false` — never returned in queries by default
- Password reset tokens are:
  - Generated with `crypto.randomBytes(20)`
  - Hashed with SHA-256 before storage
  - Expire after 10 minutes
  - Single-use (cleared immediately after successful reset)
- On password reset and change, all refresh tokens are invalidated (forces re-login on all devices)
- Minimum password length: 8 characters (enforced via Zod schema)

---

## 14. CSRF

**Decision: CSRF protection not required for the current implementation.**

Reasoning:
- Authentication is via JWT Bearer tokens in the `Authorization` header
- Bearer token authentication is not automatically included in cross-site requests by browsers (unlike cookies)
- No session cookies are used
- The CORS policy prevents cross-origin API access from untrusted origins

If cookies are introduced in the future (e.g., for SSR), CSRF protection should be added at that time.

---

## 15. Known Security Limitations

See `docs/known-limitations.md`:
- Payment gateway is simulated — no real payment provider security guarantees
- Load-tested DDOS resilience has not been validated
- WAF rules on CloudFront have not been tested in production
