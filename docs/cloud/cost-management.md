# Cost Management & Budgets

This document outlines the expected AWS cloud costs for the ParkOps production environment and how costs are controlled.

## 1. Estimated Production Baseline Costs (Monthly)

| Resource | Configuration | Estimated Cost |
| :--- | :--- | :--- |
| **ECS Fargate** | 2 tasks (0.5 vCPU, 1GB RAM) | ~$30.00 |
| **ALB** | 1 Load Balancer + LCUs | ~$20.00 |
| **NAT Gateway** | 1 Gateway + data processing | ~$35.00 |
| **CloudFront** | Global CDN (first 1TB free) | ~$0.00 |
| **MongoDB Atlas** | M10 Dedicated Cluster | ~$60.00 |
| **ElastiCache (Redis)** | `cache.t3.micro` | ~$15.00 |
| **Route 53 & Secrets** | Zones + Secret API calls | ~$2.00 |
| **Total Baseline** | | **~$162.00 / month** |

*Note: Costs will scale linearly as Fargate autoscales tasks during high-traffic events.*

## 2. Cost Controls

### Autoscaling
ECS tasks are configured to scale out based on CPU/Memory, but have a strict `max_capacity = 4` to prevent runaway costs from DDoS or bug-induced CPU spikes.

### NAT Gateway Optimization
NAT Gateways carry a fixed hourly cost + per-GB data processing cost. We use a single NAT Gateway in the primary public subnet rather than one per AZ to save costs, accepting the slight availability trade-off for outbound traffic.

### CloudWatch Logs
Log retention is set to 30 days. After 30 days, logs are automatically deleted to prevent S3/CloudWatch storage costs from accumulating indefinitely.

## 3. AWS Budgets & Alerts
*(To be configured in AWS Billing Console)*

- **Budget 1: 50% Threshold**
  - Limit: $80
  - Action: Email alert to DevOps team. Indicates we are on track for normal usage.
- **Budget 2: 100% Threshold**
  - Limit: $160
  - Action: Email alert to DevOps team.
- **Budget 3: 150% Threshold (Anomaly)**
  - Limit: $240
  - Action: PagerDuty alert. Indicates a potential loop, attack, or unexpected scaling event requiring immediate investigation.
