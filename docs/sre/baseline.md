# Baseline Status

Before initiating load and chaos testing, the following baseline configuration has been recorded.

## Application State
- **Application version:** `[FILL_IN_APP_VERSION]`
- **Git commit:** `[FILL_IN_COMMIT_HASH]`

## Container Infrastructure
- **Docker image version (Backend):** `[FILL_IN_BACKEND_IMAGE_TAG]`
- **Docker image version (Frontend):** `[FILL_IN_FRONTEND_IMAGE_TAG]`
- **Docker image version (Worker):** `[FILL_IN_WORKER_IMAGE_TAG]`

## Cloud Infrastructure
- **Infrastructure version (Terraform State):** `[FILL_IN_TERRAFORM_VERSION]`
- **AWS environment:** `staging` (or `[FILL_IN_ENV_NAME]`)
- **Compute:** ECS Fargate
- **Load Balancer:** ALB

## Data Tier
- **Database version/configuration:** MongoDB Atlas `[FILL_IN_MONGO_VERSION]` (e.g., v6.0 Serverless)
- **Redis version/configuration:** ElastiCache Redis `[FILL_IN_REDIS_VERSION]` (e.g., 7.0)

*(Ensure these values are accurately populated before running tests to maintain an honest baseline.)*
