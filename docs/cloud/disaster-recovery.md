# Disaster Recovery (DR) Plan

## 1. RTO and RPO Targets

| Metric | Target | Definition |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | 1 Hour | Maximum acceptable data loss in a worst-case database failure scenario. |
| **RTO (Recovery Time Objective)** | 4 Hours | Maximum time to restore full service from a total regional failure. |

## 2. Backup Strategy

### MongoDB Atlas
- **Frequency**: Continuous backups (Point-in-Time Recovery enabled for 7 days). Daily snapshots retained for 30 days.
- **Storage**: Stored securely in AWS S3 across multiple AZs within the primary region.
- **Restore**: Atlas allows one-click restore to a new cluster.

### Infrastructure (Terraform)
- **Frequency**: The infrastructure state is code (stored in Git).
- **State File**: Stored in an S3 bucket (`parkops-terraform-state-bucket`) with versioning enabled.
- **Restore**: Re-running `terraform apply` recreates the entire cloud environment.

## 3. Disaster Scenarios & Recovery

### Scenario A: Accidental Data Deletion
- **Impact**: Tenant or user data is deleted due to a bug or admin error.
- **Action**:
  1. Identify the time the deletion occurred.
  2. Use MongoDB Atlas Point-in-Time Recovery to clone the cluster to 5 minutes before the event.
  3. Extract the missing records using `mongoexport`.
  4. Restore records to the production database.

### Scenario B: ECS/ALB Infrastructure Failure
- **Impact**: Compute layer goes down (e.g., bad deployment, AWS AZ failure).
- **Action**:
  1. Re-run GitHub Actions deployment pipeline or `terraform apply`.
  2. ECS will provision new tasks in healthy AZs automatically.

### Scenario C: Total Region Loss (us-east-1 goes offline)
- **Impact**: Entire application unavailable.
- **Action** (Current design is single-region, so RTO is higher):
  1. Change `aws_region` in `variables.tf` to `us-west-2`.
  2. Run `terraform apply` to provision new VPC, ALB, and ECS cluster.
  3. Restore MongoDB Atlas to the new region.
  4. Update Route 53 DNS to point to the new ALB.
  5. *Estimated time: 1-2 hours.*

## 4. Restore Testing
*Staging restore drills must be conducted quarterly.*
- **Last Drill Date**: YYYY-MM-DD *(Not yet executed)*
- **Drill Status**: PENDING
