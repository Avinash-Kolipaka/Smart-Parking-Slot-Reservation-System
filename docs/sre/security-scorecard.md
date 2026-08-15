# Security Scorecard

| Category | Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | PASS | JWTs securely implemented; expiration and refreshing work. |
| **Authorization** | PASS | Middleware RBAC enforcing least privilege. |
| **Secrets** | PASS | Extracted via `.env` files; excluded via `.dockerignore`. |
| **Network** | PASS | Terraform restricts SGs to 80, 443, 22. |
| **Containers** | PASS | Trivy vulnerability scanning integrated into CI. |
| **Dependencies** | PASS | Node `npm audit` and Dependabot enforced. |
| **AWS** | PASS | OIDC role assumption used for Actions (No hardcoded keys). |
| **Database** | PASS | MongoDB Atlas securely accessed via TLS connection. |
| **Logging** | PASS | Structured Winston logging configured; sensitive data excluded. |
| **Monitoring** | PASS | CloudWatch metrics and alarms in place. |
| **Backups** | PASS | MongoDB Atlas automated backups enabled. |
