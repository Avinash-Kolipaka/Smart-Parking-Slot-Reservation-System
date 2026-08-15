# ParkOps Booking Engine & Concurrency Control Flow

## Overview
The booking engine is the core transaction processing module of ParkOps. It prevents double-bookings, calculates precise server-side billing, enforces booking state transitions, and synchronizes real-time status across clients.

## Detailed Booking Sequence

```text
User Request (Slot ID, Start/End Time, Vehicle Type)
                       │
                       ▼
          [1] Validate Payload (Zod)
                       │
                       ▼
  [2] Acquire Redis Lock (`slot-lock:slotId:timeRange`)
    ├── Failed ──► Return 409 Conflict (Slot Locked)
    └── Success
           │
           ▼
 [3] Overlap Check (MongoDB Query: start < existingEnd && end > existingStart)
    ├── Overlap Found ──► Release Lock & Return 400 (Slot Reserved)
    └── No Overlap
           │
           ▼
   [4] Calculate Pricing (Pricing Engine Service)
       (Base Rate * Duration * Vehicle Multiplier + EV Fee + Peak Surcharge + Tax)
           │
           ▼
   [5] Persist Booking (Status: PENDING, Payment: PENDING)
           │
           ▼
   [6] Generate Signed HMAC QR Ticket
           │
           ▼
   [7] Update Slot Status -> RESERVED
           │
           ▼
   [8] Release Redis Lock
           │
           ▼
   [9] Emit Socket.IO Event (`slot:updated`, `booking:created`)
           │
           ▼
   [10] Send Confirmation Email & In-App Notification
```

## Booking State Machine

```text
               ┌───────────┐
               │  PENDING  │ (Awaiting Payment / Check-In)
               └─────┬─────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  ┌─────────────┐         ┌─────────────┐
  │  CONFIRMED  │         │   EXPIRED   │ (Payment/Check-In Overdue)
  └──────┬──────┘         └─────────────┘
         │
         ▼
  ┌─────────────┐
  │   ACTIVE    │ (Vehicle Checked-In)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐         ┌─────────────┐
  │  COMPLETED  │         │  CANCELLED  │ (User / Admin Cancelled)
  └─────────────┘         └─────────────┘
```

## Check-In & Check-Out Billing Rules
- **Check-In:** When scanned by admin, status moves `CONFIRMED` -> `ACTIVE`, slot moves `RESERVED` -> `OCCUPIED`.
- **Check-Out:** Status moves `ACTIVE` -> `COMPLETED`, slot moves `OCCUPIED` -> `AVAILABLE`.
- **Overstay Surcharge:** If `checkOutTime` exceeds reserved `endTime` by more than 15 minutes, extra hourly charges are automatically calculated and added to the final amount.
