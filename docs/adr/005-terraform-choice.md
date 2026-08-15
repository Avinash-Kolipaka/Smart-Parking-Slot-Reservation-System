# ADR-005: Terraform for Infrastructure as Code

## Status
Accepted

## Context
ParkOps is deployed on AWS with multiple interconnected services: ECS Fargate, ALB, ECR, ElastiCache, Route 53, CloudFront, Secrets Manager, and CloudWatch. Managing this infrastructure manually through the AWS Console creates:
- Configuration drift (console changes not tracked)
- No reproducibility (staging ≠ production)
- No change review process (no PR for infra changes)
- Disaster recovery risk (if resources are deleted, they cannot be rebuilt consistently)

## Decision
Use **Terraform** to define and provision all AWS infrastructure.

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| AWS CloudFormation | More verbose YAML/JSON syntax; less ergonomic than HCL; harder to refactor |
| AWS CDK | Adds programming language dependency for infra definition; overkill for this scope |
| Pulumi | Less ecosystem adoption; less tooling; adds language runtime dependency |
| Manual (Console) | No reproducibility; configuration drift; no history |

## Reasons
1. **Version control** — every infra change is a Git commit with a diff, review, and history
2. **Plan before apply** — `terraform plan` shows exactly what will change before any real modification
3. **Reproducibility** — `terraform apply` produces the same infrastructure every time from the same config
4. **State management** — Terraform state tracks actual resource IDs, enabling incremental updates
5. **Ecosystem** — largest ecosystem of providers; excellent AWS provider support
6. **Modular** — resources are grouped by concern (networking, compute, cache, monitoring)

## Consequences
- Requires Terraform state file management (S3 backend in production)
- Risk of state drift if resources are modified outside Terraform (console changes)
- Learning curve for HCL syntax
- `terraform destroy` can destroy production resources — requires access controls
- All AWS changes must go through `terraform plan` + review + `terraform apply` discipline
