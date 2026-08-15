# Security Posture

ParkOps is designed with defense-in-depth principles, addressing security at the application, network, and data layers.

## 1. Authentication & Authorization
- **Stateless JWTs:** The application uses JSON Web Tokens signed with a secure HS256 algorithm. Tokens have a short lifespan (`1d`).
- **Role-Based Access Control (RBAC):** Middleware (`authMiddleware.js`) strictly enforces permissions across three tiers: `Customer`, `Operator`, and `Admin`. Operators cannot access global financial analytics; customers cannot manage slots.

## 2. Input Validation
- All incoming API requests are validated using schema validation (e.g., Joi/Zod or Mongoose strict schemas).
- Unrecognized fields are stripped to prevent mass-assignment vulnerabilities.

## 3. Network Security
- **CORS:** Cross-Origin Resource Sharing is strictly configured to only allow requests from the specific frontend domains.
- **Security Headers:** The Express backend utilizes `helmet` to set secure HTTP headers (HSTS, CSP, X-Frame-Options).
- **HTTPS:** CloudFront and ALB enforce TLS 1.2+ for all traffic in transit.

## 4. Rate Limiting
- The `express-rate-limit` package is implemented globally to prevent basic DDoS and brute-force attacks.
- Stricter limits (e.g., 5 requests per 15 minutes) are placed on `/auth/login` and password reset endpoints.

## 5. Secret Management
- **Never committed to Git:** Secrets are excluded via `.gitignore`.
- **Cloud KMS:** In production, environment variables are injected securely via AWS Secrets Manager or ECS Task Definitions, ensuring they never touch the disk.

See the [Security Threat Model](security-threat-model.md) for specific threat scenarios and mitigations.
