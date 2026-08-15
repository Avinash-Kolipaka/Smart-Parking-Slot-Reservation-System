# Rollback Procedures

This document outlines how to roll back changes in the event of a failed production deployment.

## 1. Zero-Downtime Deployment (The Happy Path)
By default, ECS uses a rolling update strategy:
1. ECS starts new tasks running the new Docker image.
2. The ALB registers the new tasks and waits for the `/api/health/live` probe to pass.
3. Once healthy, traffic shifts to the new tasks.
4. Old tasks are gracefully drained (allowing active requests to finish) and shut down.

If step 2 fails (the new code crashes on boot), **ECS automatically halts the deployment**. The old tasks continue serving 100% of the traffic. No manual rollback is required.

## 2. Manual Code Rollback
If the code deploys successfully but contains a logical bug (e.g., payments stop working), a manual rollback is required.

**Via GitHub Actions (Preferred):**
1. Open GitHub UI.
2. Go to Actions → "Deploy to Production".
3. Find the last known-good successful workflow run.
4. Click "Re-run all jobs".
5. This re-deploys the previous Git commit and Docker image.

**Via AWS CLI (Emergency Fast Rollback):**
ECS keeps the previous Task Definition revision.
```bash
# 1. Find the previous active revision
aws ecs describe-task-definition --task-definition parkops-api-production

# 2. Update the service to force the old revision
aws ecs update-service \
  --cluster parkops-production-cluster \
  --service parkops-api-service \
  --task-definition parkops-api-production:<PREVIOUS_REVISION_NUMBER> \
  --force-new-deployment
```
*Time to recovery: 2-3 minutes.*

## 3. Infrastructure Rollback (Terraform)
If a `terraform apply` breaks the infrastructure (e.g., accidentally modifying a security group to block traffic):
1. Identify the bad commit in GitHub.
2. Run `git revert <commit-hash>`.
3. Open a PR and merge to `main`.
4. Run `terraform apply` locally or via CI to restore the infrastructure state.

## 4. Database Migration Rollback
ParkOps uses MongoDB. We prefer **additive changes** (adding fields) over destructive changes (renaming/deleting).
- If a schema change breaks the app, roll back the API code first (which should be backward-compatible with the database).
- Do not drop fields until the new code has been stable in production for at least 7 days (the Expand-Migrate-Contract pattern).
