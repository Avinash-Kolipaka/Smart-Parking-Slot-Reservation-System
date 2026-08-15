# ParkOps Architecture & System Design

## System Overview
ParkOps is an enterprise-grade Smart Parking Reservation & Operations Platform built on the MERN stack (MongoDB, Express, React 19, Node.js) with real-time Socket.IO synchronization, Redis slot locking & caching, and automated background cron jobs.

```text
                    React 19 Frontend (Vite + Tailwind)
                                   │
                                   │ HTTPS / WebSockets
                                   ▼
                       Express REST & Socket API
                                   │
             ┌─────────────────────┼─────────────────────┐
             │                     │                     │
             ▼                     ▼                     ▼
      MongoDB Database       Redis Storage          Socket.IO Server
   (Models, 2dsphere index) (Locks, Cache, TTL)     (Rooms & Events)
             │                     │                     │
             └─────────────────────┼─────────────────────┘
                                   │
                            Background Jobs
                                   │
                     ┌─────────────┴─────────────┐
                     ▼                           ▼
            Nodemailer Service          Cloudinary / Local FS
          (HTML Email Templates)          (Image Hosting)
```

## Key Architectural Layers

### 1. REST API Layer (`server.js` + `controllers/` + `routes/`)
- Built on Express.js with Modular Route and Controller patterns.
- Protected with `helmet` for HTTP security headers and `express-rate-limit` for rate limiting.
- Structured logging using `winston`.

### 2. Authentication & Authorization (`authMiddleware.js` + `roleMiddleware.js`)
- JWT Access Tokens (short-lived, 15m) + Refresh Tokens (7d) with token rotation.
- Granular Role-Based Access Control (RBAC): `USER`, `PARKING_MANAGER`, `ADMIN`, `SUPER_ADMIN`.
- Account Banning & Active Session Revocation.

### 3. Concurrency & Slot Locking Engine (`slotLockService.js` + `pricingService.js`)
- Atomic Redis-backed locks (`slot-lock:<slotId>:<timeRange>`) to prevent concurrent double-bookings.
- Database query overlap check: `(startTime < end) && (endTime > start)`.
- Backend-authoritative Pricing Service calculating vehicle multipliers, peak hour surcharges, EV charging fees, and tax.

### 4. Real-Time Event System (`config/socket.js`)
- Socket.IO server connected to Express HTTP server.
- Dynamic room partitioning by parking location (`parking:<parkingId>`) and admin dashboard (`admin_dashboard`).
- Broadcasts real-time slot state changes (`slot:updated`), check-ins, check-outs, and booking cancellations.

### 5. Data Layer (`models/` + `config/db.js`)
- MongoDB NoSQL database with Mongoose ODM.
- `2dsphere` geospatial indexing on `ParkingLocation.location` for proximity searches.
- Soft deletion support (`isActive`, `deletedAt`).
