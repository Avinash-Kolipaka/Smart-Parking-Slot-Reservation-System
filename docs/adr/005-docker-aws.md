# ADR 005: Docker and AWS ECS Deployment

**Status:** Accepted

## Context
We need a reproducible deployment environment that eliminates "it works on my machine" errors and scales seamlessly in production.

## Decision
We chose Docker for containerization and AWS ECS (Elastic Container Service) on Fargate for orchestration.
- **Docker** packages the frontend, backend, and worker into immutable images.
- **ECS on Fargate** allows us to run these containers without managing underlying EC2 server infrastructure.
- **Terraform** is used to define the ECS clusters, VPCs, and Load Balancers declaratively.

## Consequences
- **Positive:** Infrastructure as Code ensures reproducible environments across staging and production. Fargate abstracts away OS-level security patching.
- **Negative:** Increased initial DevOps complexity and slightly higher baseline costs compared to a simple VPS (like DigitalOcean droplet).
