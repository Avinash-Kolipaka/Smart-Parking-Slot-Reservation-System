# Interview Questions & System Design Prep

*Use this document to prepare for technical deep-dives into ParkOps.*

## 1. Why did you choose the MERN stack?
**Answer:** I chose MERN because it allows rapid end-to-end development using a unified language (JavaScript/TypeScript). Node.js is excellent for the highly concurrent, I/O bound nature of real-time Socket.IO connections. MongoDB's flexible schema allowed me to easily model hierarchical parking lots, while still supporting ACID transactions for booking integrity.

## 2. How do you prevent double booking? (Critical)
**Answer:** I implemented a two-fold approach. First, at the database level, I use a unique compound index on `(slotId, startTime, endTime)`. Second, during the booking process, I wrap the slot assignment and payment intent creation in a MongoDB transaction session. If two users request the same slot at the exact same millisecond, the first transaction commits, and the second one fails with a write conflict, which the backend catches and returns as a 409 Conflict error to the user.

## 3. Why did you use Redis?
**Answer:** Node.js is single-threaded. When a user books a slot, generating a PDF receipt or sending an email takes time. If I awaited those tasks in the main controller, the API response would be slow. I use Redis with BullMQ to push these heavy tasks to a background queue, allowing the API to respond immediately.

## 4. Why Docker and ECS instead of Kubernetes?
**Answer:** For the scale of this project, Kubernetes introduces unnecessary operational overhead (managing the control plane, Helm charts, complex ingress). Docker on AWS ECS (Fargate) gives me the benefits of containerization (reproducible environments, rolling deployments, auto-scaling) without the maintenance burden of K8s. It's the right tool for a modular monolith.

## 5. How would you handle 100,000 concurrent users? (System Design)
**Answer:** 
1. **Frontend:** Serve the React app statically via CloudFront (CDN).
2. **Compute:** Configure ECS Auto-Scaling to spin up more Node.js tasks based on CPU/Memory load.
3. **Database:** Introduce read-replicas for MongoDB. The vast majority of traffic is searching for parking (Reads). We can direct read traffic to secondary nodes.
4. **Real-time:** Implement the Redis Pub/Sub adapter for Socket.IO so that events broadcast correctly across the multiple Node.js instances behind the Load Balancer.

## 6. How is the QR code secured against replay attacks?
**Answer:** The QR code contains a signed JWT or a hashed booking ID. When scanned by the operator, the backend checks the booking's current status. If the status is already `checked-in`, the backend rejects the scan, preventing someone from using the same pass twice.
