# ParkOps API Documentation

This document outlines the major REST API endpoints used in ParkOps. 
Base URL: `/api/v1`

## Authentication

### `POST /auth/register`
- **Body:** `{ name, email, password, role }`
- **Response:** `{ token, user }`
- **Auth:** None

### `POST /auth/login`
- **Body:** `{ email, password }`
- **Response:** `{ token, user }`
- **Auth:** None

## Parking Management

### `GET /parking`
- **Query Params:** `latitude`, `longitude`, `radius`
- **Response:** `[ { id, name, location, totalSlots, availableSlots } ]`
- **Auth:** None

### `GET /parking/:id/availability`
- **Query Params:** `startTime`, `endTime`
- **Response:** `[ { floor, slots: [{ id, number, type, isAvailable }] } ]`
- **Auth:** Bearer Token

## Bookings

### `POST /bookings`
- **Body:** `{ parkingId, slotId, startTime, endTime, vehicleNumber }`
- **Response:** `{ bookingId, status, paymentUrl }`
- **Auth:** Bearer Token (User)

### `GET /bookings/history`
- **Response:** `[ { bookingId, parking, slot, startTime, endTime, status } ]`
- **Auth:** Bearer Token (User)

## Operations (QR & Check-in)

### `GET /qr/generate/:bookingId`
- **Response:** `{ qrCodeUrl }`
- **Auth:** Bearer Token (User)

### `POST /operator/check-in`
- **Body:** `{ bookingId }` (Scanned from QR)
- **Response:** `{ success, message }`
- **Auth:** Bearer Token (Operator/Admin)

## Payments

### `POST /payments/webhook`
- **Headers:** `Stripe-Signature`
- **Body:** Payment provider event payload
- **Response:** `200 OK`
- **Auth:** Webhook Signature Validation
