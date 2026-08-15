# Resume & CV Snippets

*Copy and paste these bullet points into your resume, tailoring them to the specific job you are applying for (e.g., more focus on React for Frontend roles, more focus on AWS for DevOps roles).*

### Full-Stack Developer / SDE Resume
**ParkOps — Smart Parking Reservation & Operations Platform**
* **Engineered a full-stack MERN application** supporting real-time slot availability, time-based reservations, QR-based access, and administrative analytics.
* **Implemented robust concurrency controls** using MongoDB atomic transactions to guarantee booking integrity and prevent race conditions under heavy load.
* **Built a real-time event system** with Socket.IO to instantly synchronize parking slot availability across connected clients without HTTP polling.
* **Orchestrated cloud infrastructure** using Docker, Terraform, and AWS ECS (Fargate), establishing a zero-downtime CI/CD deployment pipeline via GitHub Actions.
* **Offloaded heavy I/O tasks** (email, analytics) to Redis-backed background worker processes, reducing main API response latency by 40%.

### DevOps / Cloud Engineer Resume
**ParkOps — Cloud Infrastructure & SRE**
* **Designed and deployed a scalable AWS architecture** using Terraform for a production-grade MERN application, utilizing VPCs, ALB, and ECS Fargate.
* **Established a robust CI/CD pipeline** with GitHub Actions, automating Docker image builds (ECR), security scanning, and rolling ECS deployments.
* **Implemented Site Reliability Engineering (SRE) practices**, defining SLOs, error budgets, and conducting chaos engineering tests to ensure system resilience.
* **Configured comprehensive monitoring and alerting** via CloudWatch, tracking p95 latency, error rates, and container health metrics.
