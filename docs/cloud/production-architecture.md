# Production Architecture

This document describes the actual, implemented cloud architecture for ParkOps.

## Component Overview

```text
User
 ↓
DNS (Route 53)
 ↓
CDN (CloudFront) → S3 (Frontend static assets)
 ↓
ALB (Application Load Balancer)
 ↓
ECS Fargate (Application container)
 │
 ├── MongoDB Atlas (Database cluster)
 │
 ├── Redis ElastiCache (Caching & Locks)
 │
 └── node-cron (Internal Background Workers)
```

## Core Infrastructure

### 1. Frontend Delivery
- **AWS S3**: Hosts the compiled Vite/React static assets. The bucket is private (block all public access).
- **AWS CloudFront**: Distributes the assets globally. Uses Origin Access Control (OAC) to securely fetch from S3 without making S3 public. Redirects HTTP to HTTPS.

### 2. Application Layer
- **AWS ALB**: Handles incoming API traffic, terminates TLS (requires ACM cert), and routes to ECS tasks. Provides health checks against `/api/health/live`.
- **AWS ECS (Fargate)**: Serverless compute engine running the Node.js API container. Autoscales based on CPU and memory utilization (target 75%).
- **AWS Secrets Manager**: Stores `MONGO_URI`, `JWT_SECRET`, and `REDIS_URL`. Injected into ECS tasks at runtime via Terraform execution role.

### 3. Data Layer
- **MongoDB Atlas**: Fully managed replica set. Houses users, locations, slots, and bookings. Uses a geospatial index for search and compound indexes for concurrency checks.
- **AWS ElastiCache (Redis)**: Used for rapid caching of parking locations, distributed `SET NX EX` locks, and Socket.IO pub/sub room mapping.

### 4. Background Workers
- **node-cron**: Runs inside the Express process (not as a separate container). Handles expiring pending bookings every 5 minutes and analytics generation.

## Third-Party Services
- **Image Storage**: Cloudinary (integrated via multer-storage-cloudinary).
- **Email**: Nodemailer via SMTP (configurable, e.g., SendGrid/SES).
- **Payments**: Simulated logic (server-side state machine without real gateway).
- **AI Analytics**: Optional LLM provider for the admin insights feature.

## Network Architecture
- **VPC**: `10.0.0.0/16`
- **Public Subnets**: Two subnets (`10.0.1.0/24`, `10.0.2.0/24`) spanning two AZs. Hosts ALB, NAT Gateway, and EC2 fallback instances.
- **Private Subnets**: Two subnets spanning two AZs. Hosts ECS tasks. Outbound internet access via NAT Gateway.
- **Security Groups**: 
  - `alb-sg`: Allows 80/443 from 0.0.0.0/0
  - `ecs-tasks-sg`: Allows 5000 only from `alb-sg`
