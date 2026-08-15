# Deployment & Rollback Guide

## Initial Local Deployment

To run the full stack locally via Docker Compose:
```bash
docker compose build
docker compose up -d
```
Access the application at `http://localhost`.

## Production Deployment (Automated)
The GitHub Actions `deploy.yml` workflow automates the entire process:
1. Pushes the code to `main`.
2. Action builds and pushes Docker images to Amazon ECR.
3. Action connects to EC2 via AWS SSM and restarts the `docker-compose.production.yml` stack.

## Manual Rollback Procedure
If a deployment fails, you can roll back to a previous Docker image.

1. Find the previous stable Git commit SHA (e.g., `abc1234`).
2. SSH into the EC2 instance or use SSM Session Manager.
3. Update the `.env` or `docker-compose.production.yml` to reference the specific tag:
   ```yaml
   image: 123456789.dkr.ecr.us-east-1.amazonaws.com/parkops-backend:abc1234
   ```
4. Restart the stack:
   ```bash
   docker compose -f docker-compose.production.yml up -d
   ```
