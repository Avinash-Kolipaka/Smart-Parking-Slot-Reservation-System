# Security Policy

## Supported Versions

| Version | Supported |
| :--- | :---: |
| 1.0.x | ✅ |
| < 1.0 | ✗ |

## Reporting a Vulnerability

If you discover a security vulnerability in ParkOps, please **do not** open a public GitHub issue.

Instead, contact the security team at: **security@parkops.local** (or the designated security contact for your organization).

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

We will acknowledge your report within 48 hours and provide a resolution timeline within 7 days.

## Security Measures

- JWT-based authentication with short-lived access tokens (15 minutes)
- Refresh token rotation and invalidation on logout/password change
- bcrypt password hashing
- Rate limiting on all endpoints (30 req/15min for auth, 300 req/15min general)
- Helmet.js HTTP security headers
- RBAC enforced server-side for all protected endpoints
- Tenant data isolation enforced at middleware level
- HMAC-signed QR codes (no sensitive data in QR payload)
- Input validation via Zod schemas on all request bodies
- Production error responses do not expose stack traces or internal details

## Known Limitations

See [docs/known-limitations.md](docs/known-limitations.md) for current platform limitations relevant to security.
