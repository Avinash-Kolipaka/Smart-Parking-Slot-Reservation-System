# ParkOps: The Project Story

## 1. Problem
Urban parking is often chaotic, leading to wasted time, increased emissions, and inefficient use of space. Existing parking management solutions are often either fully manual (paper tickets, manual validation) or utilize legacy software that lacks real-time updates and seamless digital payments. There was a clear need for a modern, scalable SaaS solution that bridges the gap between drivers seeking convenience and operators seeking efficiency.

## 2. Design
I designed ParkOps with three primary user types in mind:
* **Customers:** Needing a fast, intuitive mobile-responsive web app to find and book slots.
* **Operators:** Needing real-time dashboards for specific locations to validate QR codes and monitor occupancy.
* **Admins:** Needing a macro view of the entire system, revenue reports, and user management.

The architecture was structured as a modular monolithic backend using the MERN stack (MongoDB, Express, React, Node.js), augmented by Redis for caching and Socket.IO for real-time state synchronization, making it robust enough for concurrent bookings.

## 3. Implementation
The project was built in iterative phases:
1. **Foundation:** Establishing the database schemas (Users, Locations, Floors, Slots) and securing the API with JWT and RBAC.
2. **Core Workflow:** Implementing the search, booking, and payment mechanisms.
3. **Real-time Enhancements:** Integrating Socket.IO to broadcast slot availability changes instantly, preventing the "stale data" problem.
4. **Operations:** Building the admin/operator dashboards and the QR code generation/validation flow.
5. **Infrastructure:** Dockerizing the application and configuring AWS deployment via Terraform and GitHub Actions.

## 4. Challenges

### Challenge 1: Double-Booking Prevention
* **Why it was difficult:** In a high-traffic scenario, multiple users might attempt to book the last available slot simultaneously. Simple application-level checks are insufficient due to race conditions.
* **Solution:** Implemented atomic database operations and MongoDB transactions to guarantee that only one booking request successfully acquires the slot.
* **Trade-off:** Transactions introduce slight latency and require a replica set in MongoDB, adding to database complexity.
* **Result:** Zero double-bookings under concurrent load testing.

### Challenge 2: Real-Time State Synchronization
* **Why it was difficult:** When a user books a slot, all other users currently viewing that location need to see the slot change to "occupied" immediately to avoid frustration.
* **Solution:** Integrated Socket.IO. When a booking transaction succeeds, an event is emitted to a specific location "room," updating the frontend state of all connected clients.
* **Trade-off:** Requires maintaining persistent WebSocket connections and scaling Socket.IO instances using a Redis adapter in the future.
* **Result:** Seamless, instant UI updates across all active sessions.

### Challenge 3: Reliable Background Processing
* **Why it was difficult:** Tasks like expiring unpaid pending bookings or sending email receipts shouldn't block the main event loop, but they must execute reliably.
* **Solution:** Extracted these tasks to a separate Worker process pulling from a Redis-backed job queue (BullMQ).
* **Trade-off:** Added infrastructure complexity (Redis dependency + separate worker deployment).
* **Result:** The main API remains highly responsive, and background jobs automatically retry on failure.

### Challenge 4: QR Code Security
* **Why it was difficult:** Static QR codes can be screenshotted and shared, potentially leading to unauthorized access.
* **Solution:** Embedded cryptographically signed tokens (JWTs) within the QR data, including expiry times and specific booking IDs. The backend validates the signature upon scanning.
* **Trade-off:** Increased payload size for the QR code and requires synchronized clocks across the system.
* **Result:** Secure check-ins with clear rejection of invalid or reused codes.

### Challenge 5: Cloud Deployment & CI/CD
* **Why it was difficult:** Manually deploying updates to the backend and frontend is error-prone and slow.
* **Solution:** Containerized the backend with Docker. Wrote Terraform scripts to provision AWS ECS, ALB, and ElastiCache. Created a GitHub Actions pipeline to automate testing and image pushing to ECR upon merge.
* **Trade-off:** High initial setup time compared to simpler PaaS solutions like Heroku.
* **Result:** Fully automated, zero-downtime deployments.

## 5. Solutions & Cloud
By leveraging AWS (ECS, ECR, ALB, CloudFront) alongside MongoDB Atlas, the platform achieved high availability. The use of Terraform ensured the infrastructure was reproducible and self-documenting. 

## 6. Testing
A comprehensive testing strategy was implemented:
* **Unit Tests:** For critical business logic (e.g., pricing calculators, availability checks).
* **Integration Tests:** For the API endpoints, ensuring database interactions work as expected.
* **Load Tests:** To verify the system's behavior under concurrent booking pressure.

## 7. Results
ParkOps evolved from a concept into a fully functional, production-ready SaaS application. It successfully demonstrates the ability to handle complex state, real-time communication, and secure transactions within a scalable cloud environment.

## 8. Lessons Learned
* **State Management is Hard:** Keeping the database, cache, and client UI perfectly synchronized requires careful design, especially regarding failure states.
* **Infrastructure as Code (IaC) is Essential:** Defining infrastructure manually leads to "configuration drift." Terraform provided peace of mind and consistency.
* **Monolith First:** Starting with a modular monolith was the right choice. It allowed for rapid development and easier debugging compared to starting with microservices, while still maintaining clean boundaries for future extraction.
