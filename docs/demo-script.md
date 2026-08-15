# Demo Script (5-8 Minutes)

*This script is designed for live portfolio presentations or recorded video walkthroughs.*

## 00:00 - The Problem (Slide / Intro)
"Traditional parking is frustrating. You drive to a lot, hope there's a space, wait in line to pay, and operators have zero real-time visibility into their occupancy. I built ParkOps to solve this."

## 00:30 - Product Overview
"ParkOps is a full-stack MERN application that allows users to reserve time-based slots in advance, and gives operators a real-time dashboard of their facilities."

## 01:00 - Customer Booking Flow (Screen Share: Web App)
1. **Search:** "I log in as a customer and search for parking near downtown."
2. **Select Date/Time:** "I select my arrival and departure time."
3. **Availability:** *Show how slots dynamically grey out if already booked.* "The backend checks MongoDB for overlapping time ranges and ensures I only see available slots."

## 02:30 - Payment & Concurrency
1. "I select Slot A1 and proceed to checkout."
2. *Technical Callout:* "Behind the scenes, we use MongoDB transactions to tentatively lock the slot. If someone else tries to book A1 at the exact same millisecond, the database rejects the second transaction, preventing double booking."

## 03:00 - QR Generation
1. "After successful payment, the backend generates a QR code."
2. *Show QR pass on screen.* "This acts as my secure ticket."

## 03:30 - Operator/Admin Flow
1. **Switch Roles:** "Now I'm logged in as an operator at the parking gate."
2. **Scan:** "I scan the customer's QR code. The system validates it and marks the slot as 'Occupied'."

## 04:30 - Analytics & Real-Time Sync
1. *Show Dashboard.* "The operator dashboard instantly updates to show 1 less available slot."
2. *Technical Callout:* "This is powered by Socket.IO. The backend pushes an event to the frontend without requiring a page refresh."

## 06:00 - Cloud Architecture
1. *Show Architecture Diagram.* "The application is containerized using Docker and deployed to AWS ECS Fargate via Terraform. This means it's fully managed and scales automatically based on CPU load."

## 07:00 - CI/CD & DevOps
1. *Show GitHub Actions.* "Every time I push code, GitHub Actions runs my Jest test suite, builds the Docker image, pushes it to ECR, and triggers a rolling deployment with zero downtime."

## 07:30 - Conclusion
"ParkOps demonstrates a complete product lifecycle—from complex database concurrency to cloud infrastructure and automated deployments."
