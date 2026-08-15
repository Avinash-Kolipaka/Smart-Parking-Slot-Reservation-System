# ParkOps On-Call Runbook

This document provides quick references for first responders investigating issues in ParkOps.

## 1. Where to Look (Dashboards)
- **Application Health:** `[Link to CloudWatch/Datadog App Dashboard]`
- **Database (MongoDB):** `[Link to MongoDB Atlas Dashboard]`
- **Redis (ElastiCache):** `[Link to AWS ElastiCache Dashboard]`
- **Load Balancer (ALB):** `[Link to ALB Target Group Dashboard]`

## 2. How to Inspect Logs
- **Backend API Logs:** Go to CloudWatch Logs -> Log Group `/ecs/parkops-backend`
- **Worker Logs:** Go to CloudWatch Logs -> Log Group `/ecs/parkops-worker`
- **Search Query Example:** `ERROR` or `Error: connect ECONNREFUSED`

## 3. How to Check ECS Status
1. Open AWS Console -> ECS -> Clusters -> `parkops-cluster`
2. Check **Services** tab for `parkops-backend` and `parkops-worker`.
3. Verify "Running Tasks" matches "Desired Tasks".
4. If a task is constantly restarting, check the "Stopped" tasks tab and look at the "Stopped reason" (e.g., `Essential container in task exited`).

## 4. How to Check MongoDB
1. Log into MongoDB Atlas.
2. Check "Real-Time Performance" for long-running queries or connection spikes.
3. Check alerts for CPU or Memory utilization > 80%.

## 5. How to Check Redis
1. Open AWS Console -> ElastiCache -> Redis clusters.
2. Check the CPU Utilization and Network IO metrics.
3. If using `bullmq` or queueing, check if queues are backing up using a Redis GUI or CLI (`LLEN queue_name`).

## 6. How to Rollback
1. Identify the last known good Docker Image Tag (e.g., `v1.2.3`).
2. **If using ECS directly:** Update the ECS Service -> Force New Deployment -> Select previous task definition revision.
3. **If using CI/CD (GitHub Actions):** Trigger the "Rollback" workflow manually and provide the target tag.
4. Monitor the ALB target group health until the new tasks are healthy.

## 7. Who / What to Contact
- **Escalation:** `[PagerDuty Link / Phone Number]`
- **Dev Team Channel:** `#parkops-dev`
- **SRE Channel:** `#parkops-sre`
