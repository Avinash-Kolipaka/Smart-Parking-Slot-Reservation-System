# ADR-006: AWS ECS Fargate for Container Orchestration

## Status
Accepted

## Context
ParkOps is containerized with Docker. A container orchestration platform is required to:
- Run containers reliably in production
- Enable horizontal scaling
- Provide health checks and automatic restart
- Integrate with ALB for load balancing
- Manage secrets injection

## Decision
Use **AWS ECS Fargate** for container orchestration.

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| Kubernetes (EKS) | Significant operational overhead; control plane management; steep learning curve; overkill for a single-service application |
| Heroku | Limited AWS integration; higher cost at scale; less control over networking |
| EC2 (direct) | Manual instance management; no auto-scaling; manual health check wiring |
| App Runner | Less control over networking; limited socket support |
| Lambda | Cold starts incompatible with Socket.IO long-lived connections |

## Reasons for ECS Fargate
1. **Serverless containers** — no EC2 instance management; AWS manages the underlying hosts
2. **Task definition** — simple JSON defines container image, CPU, memory, env vars, secrets
3. **ALB integration** — native target group registration; health checks automatic
4. **Auto-scaling** — ECS Application Auto Scaling scales tasks based on CPU/memory
5. **Secrets Manager integration** — secrets are injected as environment variables at task start without exposing them in the task definition
6. **IAM task roles** — fine-grained permissions per service via IAM without managing instance profiles
7. **CloudWatch Logs** — automatic log forwarding from containers to CloudWatch

## Why NOT Kubernetes
- ECS is simpler to operate for a single-service application
- No need for custom controllers, namespaces, RBAC, ingress controllers, cert-manager, etc.
- The operational surface of Kubernetes is significant; ECS covers the same need with less complexity
- At the scale where Kubernetes would be genuinely valuable (hundreds of services, large team), the platform would need a dedicated DevOps team anyway

## Consequences
- ECS Fargate is more expensive than EC2 for long-running workloads at high utilization
- Less flexibility than Kubernetes for advanced networking patterns
- AWS-specific — not portable without rework
- Task count scaling is coarser than pod scaling in Kubernetes
