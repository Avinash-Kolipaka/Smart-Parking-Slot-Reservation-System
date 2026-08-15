# Authorization Matrix

This document defines the exact RBAC (Role-Based Access Control) authorization for the ParkOps platform. Every protected endpoint must enforce these boundaries in the backend. Frontend route protection is supplementary only.

## Role Definitions

| Role | Description |
| :--- | :--- |
| **USER** | Registered end-user. Can book and manage their own reservations. |
| **PARKING_MANAGER** | Operates a specific parking facility. Can manage slots and view bookings for their locations. |
| **ADMIN** | Tenant administrator. Full management access within a tenant's scope. |
| **SUPER_ADMIN** | Platform-level administrator. Access across all tenants. |

---

## Identity & Authentication

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Register account | ✓ | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ | ✓ |
| Refresh access token | ✓ | ✓ | ✓ | ✓ |
| View own profile (`/me`) | ✓ | ✓ | ✓ | ✓ |
| Update own profile | ✓ | ✓ | ✓ | ✓ |
| Change own password | ✓ | ✓ | ✓ | ✓ |
| Request password reset | ✓ | ✓ | ✓ | ✓ |

---

## User Management

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| List all users | ✗ | ✗ | ✓ | ✓ |
| Update another user's role | ✗ | ✗ | ✓ | ✓ |
| Ban / Unban a user | ✗ | ✗ | ✓ | ✓ |
| Delete a user account | ✗ | ✗ | ✓ | ✓ |

---

## Parking Locations

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Search/list parking locations | ✓ | ✓ | ✓ | ✓ |
| View parking location details | ✓ | ✓ | ✓ | ✓ |
| Create parking location | ✗ | ✓ (own tenant) | ✓ | ✓ |
| Update parking location | ✗ | ✓ (if creator or admin) | ✓ | ✓ |
| Delete parking location | ✗ | ✓ (if creator) | ✓ | ✓ |
| View own parking locations | ✗ | ✓ | ✓ | ✓ |

---

## Parking Slots

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| View available slots | ✓ | ✓ | ✓ | ✓ |
| Create slot | ✗ | ✓ | ✓ | ✓ |
| Update slot | ✗ | ✓ | ✓ | ✓ |
| Delete slot | ✗ | ✓ | ✓ | ✓ |

---

## Bookings

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Create booking (own) | ✓ | ✓ | ✓ | ✓ |
| View own bookings | ✓ | ✓ | ✓ | ✓ |
| View single booking (own) | ✓ | ✓ | ✓ | ✓ |
| View any booking | ✗ | ✓ | ✓ | ✓ |
| Cancel own booking | ✓ | ✓ | ✓ | ✓ |
| Cancel any booking | ✗ | ✓ | ✓ | ✓ |
| QR Check-in (scan at gate) | ✗ | ✓ | ✓ | ✓ |
| QR Check-out (scan at exit) | ✗ | ✓ | ✓ | ✓ |
| Verify QR payload | ✗ | ✓ | ✓ | ✓ |

---

## Payments

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Process payment (own booking) | ✓ | ✓ | ✓ | ✓ |
| View own payment history | ✓ | ✓ | ✓ | ✓ |
| View all payment history | ✗ | ✓ | ✓ | ✓ |

---

## Notifications

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| View own notifications | ✓ | ✓ | ✓ | ✓ |
| Mark notification as read | ✓ | ✓ | ✓ | ✓ |

---

## Analytics & Dashboard

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| View dashboard summary | ✗ | ✓ | ✓ | ✓ |
| View analytics data | ✗ | ✓ | ✓ | ✓ |
| View forecasts | ✗ | ✓ | ✓ | ✓ |
| View reports | ✗ | ✓ | ✓ | ✓ |
| View admin audit logs | ✗ | ✗ | ✓ | ✓ |

---

## Tenant Management

| Action | USER | PARKING_MANAGER | ADMIN | SUPER_ADMIN |
| :--- | :---: | :---: | :---: | :---: |
| Create tenant | ✗ | ✗ | ✗ | ✓ |
| Manage tenant membership | ✗ | ✗ | ✓ | ✓ |
| Suspend a tenant | ✗ | ✗ | ✗ | ✓ |

---

## Security Notes

1. **Backend enforcement is the only trusted boundary.** Frontend route guards are purely for UX.
2. **Resource ownership** is checked for every user-level access (users can only access their own bookings/payments).
3. **Tenant isolation** is enforced via `X-Tenant-Id` header and membership verification on all tenant-scoped endpoints.
4. **IDOR prevention**: All resource fetches include ownership/membership checks before returning data.
