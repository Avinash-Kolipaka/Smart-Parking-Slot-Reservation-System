# ParkOps: Portfolio Project Page

## What is it?
ParkOps is a production-oriented smart parking reservation and operations platform. It allows users to discover parking facilities, reserve time-based slots, and receive QR passes. Simultaneously, parking operators manage slots, check-ins, check-outs, and monitor real-time occupancy and revenue analytics.

## Why did I build it?
Traditional parking systems suffer from a lack of real-time visibility. Drivers waste time circling for spots, and operators manage inventory manually. I built ParkOps to solve this by bringing modern cloud architecture, real-time WebSockets, and strict transactional integrity to parking management.

## Key Features
- **Real-Time Availability:** Slot status updates instantly across all connected devices using Socket.IO.
- **Concurrency Control:** Atomic database transactions prevent the dreaded "double-booking" scenario during high-traffic surges.
- **QR Code Access:** Seamless, contactless check-in/out for users via generated QR passes.
- **Operator Analytics:** Comprehensive dashboards tracking utilization rates and revenue.

## Architecture & Tech Stack
The platform is built on the **MERN** stack (MongoDB, Express, React, Node.js) and optimized for production:
- **Cache & Queues:** Redis handles background jobs (like emails) to keep the main API blazing fast.
- **Infrastructure as Code:** Terraform provisions the AWS environment.
- **Containerization:** The entire application is Dockerized for consistency across development and production.
- **Deployment:** AWS ECS (Fargate) orchestrates the containers behind an Application Load Balancer.

## Security & Reliability
- **Security:** Role-Based Access Control (RBAC), bcrypt hashing, JWT authentication, and rate limiting protect the application.
- **Reliability:** Load testing and chaos engineering principles were applied to validate failover mechanics, ensuring the system degraded gracefully if dependencies (like Redis) failed.

## Lessons Learned
- **Database concurrency is harder than basic CRUD:** Handling race conditions required a deep dive into MongoDB's transactional capabilities and locking mechanisms.
- **CI/CD reduces fear:** Automating testing and deployment via GitHub Actions meant I could push features rapidly without fear of breaking production.
- **Stateful WebSockets require planning:** Keeping real-time state synchronized between the server and client taught me valuable lessons in connection lifecycle management.

## Links
- **[GitHub Repository](#)**
- **[Live Demo](#)**
