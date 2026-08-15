# ParkOps API Reference

All endpoints return JSON formatted with standardized responses:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## 🔐 Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new user account |
| `POST` | `/login` | Public | Authenticate user & receive Access + Refresh tokens |
| `POST` | `/refresh` | Public | Generate new Access token using valid Refresh token |
| `POST` | `/refresh-token` | Public | Alias for `/refresh` |
| `POST` | `/logout` | Public | Invalidate refresh token & log out |
| `POST` | `/forgot-password` | Public | Send password reset token email |
| `POST` | `/reset-password/:resetToken` | Public | Reset password using single-use token |
| `POST` | `/change-password` | Private | Change password for logged-in user |
| `GET` | `/me` | Private | Get profile details of current user |

---

## 🅿️ Parking Locations (`/api/parking`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Search parking locations (Supports city, search, lat/lng, price, vehicleType filters, pagination) |
| `GET` | `/:id` | Public | Get parking location details & all slots |
| `GET` | `/my-slots` | Private | Get parking locations created by user |
| `POST` | `/` | Private | Create parking location |
| `PUT` | `/:id` | Private | Update parking location details |
| `DELETE` | `/:id` | Private | Delete or soft-delete parking location |

---

## 🚗 Slot Management (`/api/slots`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Get slots (filter by location, floor, vehicleType, status) |
| `POST` | `/` | Admin/Manager | Create individual parking slot |
| `POST` | `/generate-batch` | Admin/Manager | Bulk batch generate floor slots |
| `PUT` | `/:id` | Admin/Manager | Update slot status (Available, Occupied, Maintenance, Disabled) |
| `DELETE` | `/:id` | Admin/Manager | Delete parking slot |

---

## 📅 Booking Engine (`/api/bookings`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/book` | Private | Reserve slot with backend pricing, overlap check & Redis lock |
| `GET` | `/` | Private | Get paginated booking history |
| `GET` | `/:id` | Private | Get booking details & QR ticket |
| `PUT` | `/:id/cancel` | Private | Cancel active booking & release slot |
| `POST` | `/:id/check-in` | Admin/Manager | Perform vehicle check-in (Status -> ACTIVE) |
| `POST` | `/:id/check-out` | Admin/Manager | Perform vehicle check-out & calculate overstay billing |
| `POST` | `/verify-qr` | Admin/Manager | Verify HMAC-signed QR ticket payload |

---

## 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Private | Get paginated user notifications & unread count |
| `PATCH` | `/:id/read` | Private | Mark notification as read |
| `PATCH` | `/read-all` | Private | Mark all user notifications as read |

---

## 📊 Admin Dashboard & Reports (`/api/dashboard`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin/Manager | High-level summary metrics (revenue, slots, bookings) |
| `GET` | `/analytics` | Admin/Manager | Chart datasets (daily revenue, vehicle breakdown, peak hours) |
