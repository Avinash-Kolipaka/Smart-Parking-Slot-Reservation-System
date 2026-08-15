# ParkOps Deployment Runbook

Follow this guide to deploy ParkOps to a new AWS environment.

## 1. Prerequisites

- AWS Account with Administrator access.
- Terraform CLI installed.
- Docker installed locally.
- A MongoDB Atlas cluster provisioned.
- A Cloudinary account configured.

## 2. Secrets Management

Before applying Terraform, create the required secrets in AWS Secrets Manager:

1. Navigate to AWS Secrets Manager.
2. Create a new secret named `parkops-production-secrets` (or staging).
3. Add the following key-value pairs:
   - `MONGO_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `your_jwt_secret`
   - `JWT_REFRESH_SECRET`: `your_jwt_refresh_secret`
   - `REDIS_URL`: *(To be filled after Redis is provisioned, or use existing ElastiCache URL)*

## 3. Infrastructure Deployment

Run Terraform to provision AWS resources:

```bash
cd infrastructure/terraform/environments/production
terraform init
terraform validate
terraform plan
terraform apply
```

Note: Terraform will output the ALB DNS name, CloudFront domain name, and ECR repository URLs.

## 4. Docker Images

Once ECR is provisioned, build and push your Docker images, or let GitHub Actions do it for you.

## 5. Domain & SSL Setup

1. Request an SSL certificate in AWS Certificate Manager for your custom domains (`app.parkops.com`, `api.parkops.com`).
2. Update the `certificate_arn` variable in Terraform to attach it to CloudFront and ALB.
3. Configure Route 53 to alias the domains to CloudFront and ALB respectively.

## 6. Smoke Testing

Run the following checks to ensure everything works:
- [ ] Visit frontend domain and check for successful load.
- [ ] Attempt login.
- [ ] Create a booking.
- [ ] Ensure Socket.IO connects successfully without polling fallbacks.
