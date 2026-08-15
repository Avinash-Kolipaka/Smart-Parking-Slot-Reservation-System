# Monitoring & Observability

This document details how the ParkOps application is monitored in production.

## 1. Health Checks
The application exposes two distinct health endpoints:

### Liveness Probe (`GET /api/health/live`)
- **Purpose**: Confirms the Node.js process is running and accepting HTTP requests.
- **Used by**: ECS task health checks and ALB target group.
- **Action**: If this fails, ECS automatically replaces the container.

### Readiness Probe (`GET /api/health/ready`)
- **Purpose**: Confirms the application can successfully serve traffic (database connected, Redis connected).
- **Used by**: Deployment verification scripts.
- **Action**: Does not kill the container, but ALB will stop routing traffic to it if it becomes unhealthy.

## 2. Application Logging
- **Tool**: Winston (JSON format).
- **Destination**: AWS CloudWatch Logs (`/ecs/parkops-api-production`).
- **Fields**: All logs include `timestamp`, `level`, and `message`. API request logs include `requestId`, `method`, `route`, `status`, and `duration`.
- **Constraint**: **NEVER** log JWTs, passwords, or payment secrets.

## 3. Metrics (CloudWatch)
The following key metrics are collected automatically via ECS Container Insights and ALB metrics:
- **CPUUtilization** (ECS)
- **MemoryUtilization** (ECS)
- **RequestCount** (ALB)
- **HTTPCode_Target_5XX_Count** (ALB)
- **TargetResponseTime** (ALB)

## 4. CloudWatch Alarms
Alarms are defined in `monitoring.tf`.

| Alarm Name | Condition | Action | Severity |
| :--- | :--- | :--- | :--- |
| `api-high-cpu` | ECS CPU > 85% for 2 mins | Triggers autoscaling / Alerts on-call | SEV-2 |
| `alb-5xx-errors` | 5XX Count > 10 in 2 mins | Alerts on-call immediately | SEV-1 |
| `alb-high-latency` | p95 Latency > 1.5s for 2m | Alerts on-call | SEV-2 |

## 5. Request Correlation
Every incoming HTTP request receives a unique `x-request-id` header (or generates a UUID if not present). This ID is attached to all logs generated during that request's lifecycle, allowing operators to trace a failure through the system using CloudWatch Log Insights.
