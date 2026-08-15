# Infrastructure as Code (Terraform)

## Prerequisites
- AWS CLI installed and configured.
- Terraform CLI installed.

## Usage

1. **Initialize Terraform:**
   ```bash
   cd infrastructure/terraform
   terraform init
   ```

2. **Plan infrastructure changes:**
   ```bash
   terraform plan -out=tfplan
   ```

3. **Apply changes:**
   ```bash
   terraform apply tfplan
   ```

## Resources Managed
- **VPC & Subnets:** Network isolation.
- **Security Groups:** Restricts traffic to ports 80, 443, 22.
- **EC2 Instance:** Runs the backend API and Redis cache.
- **S3 Bucket:** Hosts React frontend assets.
- **CloudFront Distribution:** Edge caching for the S3 bucket.

## Secrets
Do **not** commit `terraform.tfvars`. Always provide sensitive variables at runtime or use a secure variable store.
