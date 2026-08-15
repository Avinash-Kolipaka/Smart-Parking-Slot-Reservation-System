# ParkOps — System Design

## Overview

ParkOps is a **multi-tenant Smart Parking Reservation & Operations SaaS** platform. This document explains the architecture and key engineering decisions at the system design level.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│                                                             │
│       React 18 (Vite)          ←→      Socket.IO Client     │
└───────────────────┬─────────────────────────┬───────────────┘
                    │ HTTPS                   │ WSS
                    ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS EDGE / CDN                         │
│                  CloudFront + Route 53                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LOAD BALANCER (ALB)            │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│              ECS FARGATE — Node.js / Express API             │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  REST API              Socket.IO Server             │   │
│   │  Express Routes        Real-time rooms              │   │
│   │  Middleware Stack       Event broadcast             │   │
│   │  Background Workers    Namespace: /parking          │   │
│   └────────┬──────────────────────┬────────────────────┘   │
└────────────┼──────────────────────┼─────────────────────────┘
             │                      │
     ┌───────┴──────┐      ┌────────┴───────┐
     │  MongoDB      │      │  Redis          │
     │  Atlas        │      │  (ElastiCache)  │
     │               │      │                 │
     │  bookings     │      │  slot cache     │
     │  users        │      │  locks          │
     │  parking      │      │  idempotency    │
     │  slots        │      │  Socket adapter │
     │  payments     │      │  session store  │
     └───────────────┘      └─────────────────┘
             │
     ┌───────┴──────────────────────┐
     │  External Services           │
     │  ● Cloudinary (images)       │
     │  ● SMTP (email)              │
     │  ● AI Provider (optional)    │
     └──────────────────────────────┘
```

---

## 2. Request Flow

Every authenticated request follows this path:

```
Client Request
      │
      ▼
CloudFront (cache static assets)
      │
      ▼
ALB (health check, routing)
      │
      ▼
ECS Task (Express)
      │
      ├─ requestIdMiddleware   → assigns UUID to req.id
      ├─ metricsMiddleware     → records request start time
      ├─ helmet()              → security headers
      ├─ cors()                → origin validation
      ├─ rateLimit()           → per-IP throttle
      ├─ express.json()        → body parsing (10mb limit)
      ├─ protect()             → JWT verification, user lookup
      ├─ resolveTenant()       → tenant identification, membership check
      ├─ authorize()           → role-based access
      ├─ validateBody()        → Zod schema validation
      ├─ [controller]          → business logic
      └─ errorHandler()        → safe error response
```

---

## 3. Booking Flow (Core Algorithm)

This is the most critical flow in the system. It must be correct under concurrent load.

```
Client: POST /api/bookings/book
      │
      ▼
[1] Validate request body (Zod schema)
      │
      ▼
[2] Check user has no existing active booking
      │  → Returns 400 if user already has Pending/Confirmed/Active booking
      ▼
[3] Load and validate Slot
      │  → 404 if not found
      │  → 400 if Disabled or Maintenance
      ▼
[4] Load and validate ParkingLocation
      │  → 404 if not found
      │  → 400 if Disabled
      ▼
[5] ACQUIRE REDIS DISTRIBUTED LOCK
      │  → Key: slot-lock:{slotId}:{startMs}-{endMs}
      │  → NX + EX 30s (atomic SET if Not eXists)
      │  → Returns 409 if lock already held (another transaction in progress)
      ▼
[6] CHECK DATABASE OVERLAP (with index)
      │  → Query: { slotId, status ∈ [Pending,Confirmed,Active],
      │             startTime < requestedEnd, endTime > requestedStart }
      │  → Returns 409 SLOT_OVERLAP if overlap found
      ▼
[7] Calculate pricing (server-side)
      │  → Uses slot.price or location.pricePerHour
      │  → Applies EV surcharge, overstay detection
      ▼
[8] Create Booking document (MongoDB)
      │  → bookingStatus: 'Pending', paymentStatus: 'Pending'
      │  → Generates HMAC-signed QR code
      ▼
[9] Set Slot.status = 'Reserved' (optimistic lock)
      │
      ▼
[10] RELEASE REDIS LOCK
      │
      ▼
[11] Broadcast Socket.IO event: slot:updated
      │
      ▼
[12] Create in-app Notification
      │
      ▼
[13] Return 201 with booking + QR URL
```

### How Double Booking is Prevented

Three layers of defense:

| Layer | Mechanism | Handles |
| :--- | :--- | :--- |
| **Redis Lock** | Atomic NX SET | Race conditions (concurrent requests arriving simultaneously) |
| **DB Overlap Query** | Compound index query | Any booking that passes the lock but overlaps existing confirmed bookings |
| **DB Unique Constraint** | `bookingId` unique index | Duplicate booking document creation |

---

## 4. Payment Flow

```
Client: POST /api/payment  { bookingId, paymentMethod }
      │
      ▼
[1] Load booking — verify ownership (userId === req.user.id)
      │  → 403 if different user
      ▼
[2] Check booking.paymentStatus !== 'Paid'
      │  → 400 if already paid (idempotency)
      ▼
[3] Check booking not Cancelled/Expired
      │
      ▼
[4] Create Payment document
      │  → transactionId generated server-side (not client-provided)
      │  → status: 'Success' (simulated gateway)
      ▼
[5] Update booking: paymentStatus='Paid', bookingStatus='Confirmed'
      │
      ▼
[6] Set Slot.status = 'Reserved'
      │
      ▼
[7] Send confirmation email (async, non-blocking)
      │
      ▼
[8] Return 200 with payment + booking
```

**Why the server never trusts the frontend payment status:**
- The payment status is always determined by the server after creating the Payment record
- The client cannot pass `status: 'Success'` — the server generates the transaction ID and sets the status
- In a real gateway integration, the server would verify the webhook signature from the payment provider before confirming

---

## 5. Real-Time Slot Updates (Socket.IO)

```
Booking Created / Cancelled / Check-in / Check-out
      │
      ▼
Controller emits: notifySlotUpdate(locationId, { slotId, status })
      │
      ▼
Socket.IO Server
      │  → Room: `parking:${locationId}`
      ▼
All Connected Clients in that Room
      │  → Event: 'slot:updated' { slotId, status }
      ▼
Frontend updates slot map in real-time (no page refresh)
```

**Reconnect behavior:**
- Socket.IO client auto-reconnects with exponential backoff
- On reconnect, client re-joins the parking location room
- Frontend fetches fresh slot state via REST on reconnect to reconcile any missed events

**Multi-node scaling:**
- Redis pub/sub adapter ensures Socket.IO events are broadcast across all ECS tasks

---

## 6. Redis Usage Map

| Use Case | Key Pattern | TTL | Notes |
| :--- | :--- | :--- | :--- |
| Parking list cache | `parking:list:{city}:{type}:{page}` | 60s | Invalidated on create/update/delete |
| Parking detail cache | `parking:{id}` | 60s | Invalidated on update |
| Slot lock | `slot-lock:{slotId}:{start}-{end}` | 30s | Released after booking committed |
| Idempotency | `idempotency:{key}` | 300s | Prevents duplicate booking submissions |
| Socket.IO adapter | Internal pub/sub | — | Multi-node event coordination |

---

## 7. Multi-Tenancy Design

```
Request arrives
      │
      ▼
protect()  → authenticates user via JWT
      │
      ▼
resolveTenant()
      ├─ Reads X-Tenant-Id header
      ├─ Verifies tenant exists and is not SUSPENDED
      ├─ Looks up TenantMembership { userId, tenantId, status: 'ACTIVE' }
      └─ Returns 403 if no membership
      │
      ▼
Controller  → All queries include tenantId: req.tenant._id
      │
      ▼
Database    → Every document has tenantId field (indexed)
```

**Cross-tenant access prevention:**
- All tenant-scoped queries explicitly filter by `tenantId: req.tenant._id`
- A user authenticated for Tenant A cannot access Tenant B resources even if they know a resource ID (prevents BOLA/IDOR)
- The tenant ID from the JWT is never trusted — only the verified membership record

---

## 8. Background Worker Flow

```
Cron trigger (node-cron)
      │
      ▼
Booking Expiry Job (every 5 min)
      ├─ Find: bookingStatus='Pending', endTime < now - 15min
      ├─ Set: bookingStatus='Expired'
      ├─ Set: Slot.status='Available'
      ├─ Broadcast: Socket.IO slot:updated event
      └─ Log: structured event to CloudWatch

Analytics Job (daily)
      ├─ Aggregate booking data per location
      ├─ Calculate occupancy rates, revenue
      └─ Store: ParkingAnalytics document

Forecast Job (daily)
      ├─ Analyze historical booking patterns
      └─ Generate DemandForecast documents
```

---

## 9. AI Analytics Flow

```
Admin: POST /api/admin/ai/query { question: "What is revenue today?" }
      │
      ▼
[1] Load analytics context (last 30 days aggregated data)
      │
      ▼
[2] Intent detection (classify question type)
      │
      ▼
[3] If AI provider configured → call LLM with context + question
    Else → return graceful degradation placeholder
      │
      ▼
[4] Return structured response
```

AI is **optional**. Core booking/parking functionality continues if no AI provider is configured.

---

## 10. QR Code Security Design

```
Booking created
      │
      ▼
generateBookingQR({ bookingId, userId, slotId, verificationToken })
      │
      ├─ Build payload: { bookingId, userId, slotId, token, timestamp }
      ├─ Sign with HMAC-SHA256 using JWT_SECRET
      └─ Encode signed payload as QR code (base64 image)
      │
      ▼
QR displayed to user in dashboard

      ─ ─ ─ At parking facility ─ ─ ─

Admin scans QR
      │
      ▼
POST /api/bookings/verify-qr { qrPayload }
      ├─ Parse JSON payload
      ├─ Recompute HMAC signature
      ├─ Compare using timingSafeEqual (timing-attack safe)
      ├─ Verify booking exists and token matches stored verificationToken
      └─ Return booking details if valid
      │
      ▼
POST /api/bookings/:id/check-in
      └─ Requires bookingStatus === 'Confirmed' (state machine enforcement)
```
