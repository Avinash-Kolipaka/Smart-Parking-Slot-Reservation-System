# Socket.IO Real-Time Architecture

## Room Strategy
ParkOps uses room partitioning to ensure clients receive only updates relevant to their active context:

1. **Location Room (`parking:<parkingId>`):** Joined by customer clients viewing a specific parking location slot map.
2. **Admin Dashboard Room (`admin_dashboard`):** Joined by admin users to monitor live metrics, active check-ins, check-outs, and slot changes across the platform.

## Event Specifications

### 1. `slot:updated`
Emitted when a slot status changes (Available, Reserved, Occupied, Maintenance, Disabled).
Payload:
```json
{
  "slotId": "65cd8912ef00112233445566",
  "status": "Reserved",
  "parkingId": "65cd8912ef00112233445500"
}
```

### 2. `booking:created`
Emitted when a new reservation is placed.
Payload:
```json
{
  "bookingId": "PRK-20260811-F91A20",
  "locationId": "65cd8912ef00112233445500",
  "slotId": "65cd8912ef00112233445566",
  "bookingStatus": "Pending",
  "amount": 100
}
```

### 3. `booking:checked-in`
Emitted when admin scans QR code and confirms vehicle check-in.

### 4. `booking:checked-out`
Emitted when admin performs vehicle check-out.

### 5. `booking:cancelled` & `booking:expired`
Emitted when booking is cancelled or auto-expired by background cron jobs.
