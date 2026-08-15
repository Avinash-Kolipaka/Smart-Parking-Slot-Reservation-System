# Cloud Security Controls

This document details the security controls implemented in the ParkOps production environment.

## 1. Secrets Management
- **Tool**: AWS Secrets Manager
- **Strategy**: No secrets are stored in Git, `.env` files, or Docker images.
- **Implementation**: The ECS Task Execution Role has permission to read the `app_secrets_arn`. Secrets (`JWT_SECRET`, `MONGO_URI`, `REDIS_URL`) are injected into the container as environment variables at startup. 
- **Validation**: The backend `server.js` (and dependent services) validate secret existence on boot and fail fast if missing.

## 2. Identity & Access Management (IAM)
- **Principle**: Least Privilege. No `AdministratorAccess` is used for application roles.
- **Roles Defined**:
  - `ecs_execution_role`: Used by the ECS agent to pull ECR images and read Secrets Manager.
  - `ecs_task_role`: Used by the running container. Can write to CloudWatch logs.
  - `ec2_role`: Used by fallback EC2 instances, restricted to SSM (Session Manager) and ECR read-only.
  - `github-actions-deploy-role`: OIDC role used by CI/CD to push to ECR and deploy, eliminating long-lived IAM access keys.

## 3. Application Security Headers
Helmet.js enforces strict security headers on all API responses:
- **Content-Security-Policy (CSP)**: Mitigates XSS.
- **Strict-Transport-Security (HSTS)**: Forces browsers to use HTTPS.
- **X-Content-Type-Options**: `nosniff`.
- **Referrer-Policy**: `no-referrer`.

## 4. CORS (Cross-Origin Resource Sharing)
- In `development`, CORS permits `*` for easy testing.
- In `production`, CORS restricts access strictly to `process.env.CLIENT_URL`. If the URL is undefined, it **fails closed** (blocks everything) rather than defaulting to `*`.

## 5. Rate Limiting
- **Global**: 300 requests per 15 minutes per IP.
- **Authentication (`/auth/*`)**: 30 requests per 15 minutes per IP to prevent credential stuffing and brute force.

## 6. Container Security
- **Base Image**: `node:22-alpine` (minimal attack surface).
- **User**: The Dockerfile uses `USER node` instead of running as `root`.
- **Scanning**: GitHub Actions runs `npm audit` and Trivy container scanning on every push to `main`, blocking deployment if CRITICAL or HIGH vulnerabilities are found in the OS or libraries.
