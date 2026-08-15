# ParkOps — Smart Parking Reservation & Operations Platform

![ParkOps Banner](docs/images/banner.png)

> A production-oriented MERN smart parking platform with real-time reservations, QR check-in/out, cloud deployment, and DevOps automation.

## 📖 Table of Contents
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Demo](#-demo)
- [Local Setup](#-local-setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Docker Setup](#-docker-setup)
- [Cloud Architecture](#-cloud-architecture)
- [CI/CD](#-cicd)
- [Testing](#-testing)
- [Security](#-security)
- [Monitoring](#-monitoring)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Future Improvements](#-future-improvements)
- [License](#-license)

## 🚨 Problem Statement
Traditional parking systems often suffer from:
- Uncertain slot availability leading to wasted time.
- Manual reservation systems prone to human error.
- Inefficient check-in/check-out processes causing queues.
- Poor occupancy visibility and revenue tracking for operators.
- Limited operator analytics and fragmented payment workflows.

## 💡 Solution
ParkOps is an AI-Enhanced Smart Parking Reservation and Operations Platform. It allows users to discover parking facilities, reserve time-based slots, receive QR passes, and manage their bookings while parking operators manage slots, check-ins, check-outs, revenue, and predictive analytics.

## ✨ Key Features

### Customer Features
- Authentication & Profile Management
- Parking search & filtering
- Real-time availability updates
- Floor & slot selection
- Time-based booking with concurrency control
- Seamless Payments integration
- QR pass generation for entry/exit
- Booking history and cancellations

### Operator/Admin Features
- Parking, floor, and slot management
- QR check-in and check-out scanning
- User and role management
- Revenue and occupancy analytics
- **Predictive AI Intelligence:** Hourly occupancy forecasts and peak time detection.
- **AI Analytics Assistant:** Natural language insights querying.
- **Anomaly Detection:** Automated flagging of unusual occupancy or revenue drops.
- Real-time audit logs and reporting

## 🏗 Architecture
![Architecture Diagram](docs/images/architecture.png)

*The system uses a MERN stack (MongoDB, Express, React, Node.js) with Redis for background jobs and caching, and Socket.IO for real-time slot availability updates. AI prediction models run asynchronously to preserve core booking speed.*

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Atlas) |
| **Cache/Queue** | Redis |
| **Real-time** | Socket.IO |
| **Authentication**| JWT (JSON Web Tokens) |
| **Containerization**| Docker, Docker Compose |
| **Infrastructure**| Terraform |
| **Cloud** | AWS (ECS, ALB, CloudFront) |
| **CI/CD** | GitHub Actions |
| **Monitoring** | CloudWatch |

## 📸 Screenshots
*(Add your screenshots here)*
- [Landing Page](docs/images/landing.png)
- [Booking Flow](docs/images/booking.png)
- [Admin Dashboard](docs/images/dashboard.png)

## 🎥 Demo
[Link to Live Demo / Video Walkthrough]

## 🚀 Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Redis

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/parkops.git
   cd parkops
   ```

2. **Install Root Dependencies:**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start Development Servers (Concurrent):**
   ```bash
   # From the root directory
   npm run dev
   ```

## ⚙️ Environment Variables
Copy `.env.example` to `.env` in both the `frontend` and `backend` directories and fill in the required values. See `.env.example` for details.

## 🗄 Database Setup
To seed the database with demo parking locations and slots:
```bash
cd backend
npm run seed
```

### Demo Accounts
- **Customer:** `customer@parkops.com` / `password123`
- **Operator:** `operator@parkops.com` / `password123`
- **Admin:** `admin@parkops.com` / `password123`

*(Note: These are for local testing only. Never use these in production.)*

## 🐳 Docker Setup
Run the entire stack locally using Docker Compose:
```bash
docker compose up -d
```
This spins up the frontend, backend, MongoDB, and Redis containers.

## ☁️ Cloud Architecture
ParkOps is deployed on AWS using Terraform for Infrastructure-as-Code (IaC). 
- **Compute:** ECS Fargate
- **Load Balancing:** Application Load Balancer (ALB)
- **CDN:** CloudFront (for React frontend)
- **Database:** MongoDB Atlas (VPC Peered)
- **Cache:** Amazon ElastiCache (Redis)

See `docs/cloud/` for detailed AWS and Terraform configurations.

## 🔄 CI/CD
GitHub Actions is used for continuous integration and deployment.
- **CI Pipeline:** Lints code, runs unit tests, and performs security dependency scanning on PRs.
- **CD Pipeline:** Builds Docker images, pushes to Amazon ECR, and triggers an ECS rolling update upon merging to `main`.

## 🧪 Testing
Run the test suite locally:
```bash
# Backend tests
cd backend
npm test

# Linting
npm run lint
```
See [Testing Documentation](docs/testing.md) for details on load testing and concurrency testing.

## 🔒 Security
- Passwords hashed with bcrypt.
- JWT for stateless authentication.
- Role-Based Access Control (RBAC).
- Protection against IDOR, SQL NoSQL Injection, and XSS.
- Rate limiting on authentication and booking endpoints.
See [Security Threat Model](docs/security-threat-model.md).

## 📈 Monitoring
Production telemetry is sent to AWS CloudWatch, tracking:
- API Latencies and Error Rates
- ECS Task CPU/Memory Utilization
- Redis Connections

## 📚 API Documentation
API Documentation is available in [docs/api/endpoints.md](docs/api/endpoints.md).

## 📂 Project Structure
```text
parkops/
├── frontend/          # React application
├── backend/           # Node.js/Express API
├── infrastructure/    # Terraform IaC configurations
├── tests/             # Load & chaos testing scripts
├── docs/              # Architecture and ADR documentation
├── .github/           # CI/CD Workflows
├── docker-compose.yml # Local development orchestration
├── README.md          
└── package.json       # Root scripts (concurrent dev)
```

## 🛠 Troubleshooting
- **Redis Connection Error:** Ensure Redis is running locally (`redis-server`) or via Docker.
- **Double Bookings in Dev:** Ensure MongoDB is running as a Replica Set to support transactions.

## 🔮 Future Improvements
- Mobile application (React Native)
- Dynamic pricing algorithms
- IoT parking sensor integration
- Multi-region failover

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
