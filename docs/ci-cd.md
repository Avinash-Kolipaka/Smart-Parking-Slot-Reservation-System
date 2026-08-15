# CI/CD Pipelines

## GitHub Actions

We use two primary workflows for CI and CD.

### 1. Continuous Integration (`ci.yml`)
Triggers on: **Pull Requests and push to `main`**.
- Checks out the code.
- Sets up Node.js 20.
- Installs dependencies for Frontend and Backend.
- Runs `npm run lint` and `npm run test`.
- Builds Docker Images to ensure they are valid.

### 2. Continuous Deployment (`deploy.yml`)
Triggers on: **Push to `main`** or Manual Dispatch.
- Configures AWS credentials via OIDC (Role Assumption).
- Logs into Amazon ECR.
- Builds production Docker Images for Backend and Frontend.
- Pushes images to ECR with `latest` and `commit-sha` tags.
- Uses AWS Systems Manager (SSM) `SendCommand` to gracefully restart Docker Compose on the EC2 instance without requiring SSH.
