# ADR 006: Engineering Trade-offs (Why No Kubernetes / Microservices)

**Status:** Accepted

## Context
When designing the architecture, we evaluated migrating to a microservices architecture managed by Kubernetes to handle future scale.

## Decision
We actively rejected Kubernetes and Microservices for the V1 architecture. The application remains a modular monolith.
- **Kubernetes (K8s)** adds significant operational overhead, requiring dedicated DevOps resources to manage control planes, ingress controllers, and Helm charts. ECS Fargate provides sufficient container orchestration with far less complexity.
- **Microservices** introduce distributed data problems, complex networking (service meshes), and difficult eventual consistency challenges, which are unwarranted for our current domain boundaries.

## Consequences
- **Positive:** Faster feature delivery. Easier debugging (single codebase, unified logs). Lower infrastructure costs.
- **Negative:** If a single module (e.g., PDF generation) has a memory leak, it can crash the entire backend process. We mitigate this by offloading heavy tasks to a separate worker container (still part of the same monolithic codebase, but deployed separately).
