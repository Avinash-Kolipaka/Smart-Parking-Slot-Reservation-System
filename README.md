# 🅿️ Smart Parking Reservation System

A full-stack **MERN** (MongoDB, Express, React, Node.js) web application for managing smart parking reservations. It supports real-time slot browsing, QR-code-based check-in/check-out, multi-role access (Admin & Customer), email notifications, payment tracking, and analytics dashboards.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
  - [Seeding the Database](#seeding-the-database)
- [API Reference](#-api-reference)
- [Pages & Routes](#-pages--routes)
- [Database Models](#-database-models)
- [Authentication & Authorization](#-authentication--authorization)
- [Key Features in Detail](#-key-features-in-detail)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 👤 Customer Features
- Browse parking locations with filters (city, vehicle type, price)
- View parking details (floors, slot types, availability, reviews)
- Interactive slot selection map
- Book parking slots (Car, Bike, EV)
- QR-code confirmation ticket generation
- View booking history & manage active bookings
- Cancel bookings & track refund status
- User profile management with avatar upload
- Forgot/Reset password via email

### 🛠️ Admin Features
- Admin dashboard with live statistics (revenue, bookings, users, occupancy)
- Manage parking locations (CRUD with image upload)
- Manage parking slots per floor/location
- QR code scanner for customer check-in / check-out
- User management (view, ban/unban users)
- Reports with charts (revenue trends, booking stats, occupancy rates)
- Admin activity logs

### ⚙️ System Features
- JWT-based authentication with refresh tokens
- Role-based access control (Customer / Admin)
- Scheduled cron jobs (auto-expire bookings, slot cleanup)
- Email notifications via SMTP (Nodemailer)
- Cloudinary image upload (with local fallback)
- Input validation with Zod
- Global error handling
- Health check endpoint

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Access & Refresh token authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email notifications |
| **Cloudinary** | Image hosting & CDN |
| **Multer** | File upload handling |
| **QRCode** | QR code generation |
| **node-cron** | Scheduled background jobs |
| **Zod** | Request validation |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Tailwind CSS v3** | Utility-first styling |
| **Axios** | HTTP client |
| **Chart.js + react-chartjs-2** | Analytics charts |
| **React Hook Form** | Form state management |
| **Lucide React** | Icon library |
| **QRCode** | Client-side QR rendering |
| **canvas-confetti** | Booking success animation |

---

## 📁 Project Structure

```
smart-parking-system/
├── backend/                        # Express.js REST API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, refresh, password reset
│   │   ├── bookingController.js    # Booking CRUD + check-in/out
│   │   ├── dashboardController.js  # Admin stats & analytics
│   │   ├── parkingController.js    # Parking location management
│   │   ├── paymentController.js    # Payment status management
│   │   ├── slotController.js       # Slot CRUD per location
│   │   └── userController.js       # User profile & admin user mgmt
│   ├── jobs/
│   │   └── cronJobs.js             # Scheduled tasks (expire bookings)
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── errorMiddleware.js      # Global error handler
│   │   └── roleMiddleware.js       # Admin role guard
│   ├── models/
│   │   ├── AdminLog.js             # Admin activity log
│   │   ├── Booking.js              # Booking schema
│   │   ├── Notification.js         # User notifications
│   │   ├── ParkingLocation.js      # Parking location schema
│   │   ├── Payment.js              # Payment record schema
│   │   ├── Review.js               # User reviews
│   │   ├── Slot.js                 # Individual parking slot
│   │   └── User.js                 # User account schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── parkingRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── slotRoutes.js
│   │   └── userRoutes.js
│   ├── services/                   # Business logic & helpers
│   ├── utils/
│   │   ├── seeder.js               # DB seed script
│   │   └── validation.js           # Zod schemas
│   ├── .env.example                # Environment variable template
│   ├── package.json
│   └── server.js                   # App entry point
│
├── frontend/                       # React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # Static assets
│   │   ├── components/
│   │   │   ├── AddApartmentSlotModal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── CreateParkingModal.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── GlassCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── QRScanner.jsx       # Admin QR check-in/out scanner
│   │   │   └── SlotMap.jsx         # Visual slot selection grid
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx     # Admin sidebar layout
│   │   │   └── MainLayout.jsx      # Customer header/footer layout
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx  # Admin home with KPIs
│   │   │   ├── BookingHistory.jsx  # Customer booking list
│   │   │   ├── BookingPage.jsx     # Checkout & payment page
│   │   │   ├── BookingSuccess.jsx  # Confirmation & QR display
│   │   │   ├── Dashboard.jsx       # Customer home
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Landing.jsx         # Public landing page
│   │   │   ├── Login.jsx
│   │   │   ├── ManageParking.jsx   # Admin: manage locations
│   │   │   ├── ManageSlots.jsx     # Admin: manage slots per location
│   │   │   ├── ManageUsers.jsx     # Admin: user management
│   │   │   ├── NotFound.jsx        # 404 page
│   │   │   ├── ParkingDetails.jsx  # Location detail view
│   │   │   ├── ParkingLocations.jsx # Browse all locations
│   │   │   ├── Profile.jsx         # Account settings & avatar
│   │   │   ├── Register.jsx
│   │   │   ├── Reports.jsx         # Admin analytics & charts
│   │   │   ├── ResetPassword.jsx
│   │   │   └── SlotSelection.jsx   # Interactive slot picker
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx       # Route definitions + guards
│   │   ├── services/               # Axios API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json                    # Root scripts (monorepo-style)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) v9+
- [MongoDB](https://www.mongodb.com/) (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-parking-system.git
   cd smart-parking-system
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

Copy the example file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://127.0.0.1:27017/smart-parking

# JWT
JWT_SECRET=your_strong_jwt_secret_here
JWT_REFRESH_SECRET=your_strong_refresh_secret_here
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Cloudinary (optional — local upload fallback is implemented)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email (optional — console fallback is implemented)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_FROM=noreply@smartparking.com
```

> **Note:** Cloudinary and SMTP are optional. The app gracefully falls back to local file storage and console logging respectively.

### Running the App

**Option 1 — Run separately (recommended for development)**

Terminal 1 — Backend:
```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

**Option 2 — Root-level scripts**

```bash
# Start backend (development with nodemon)
npm run dev:backend

# Start frontend (Vite dev server)
npm run dev:frontend
```

- **Backend** runs on: `http://localhost:5000`
- **Frontend** runs on: `http://localhost:5173`

### Seeding the Database

Populate the database with sample parking locations, slots, and an admin user:

```bash
# From project root
npm run seed

# Or from backend directory
cd backend
npm run seed
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health status |

### Authentication — `/api/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Create a new account |
| POST | `/login` | Public | Login, returns access + refresh tokens |
| POST | `/refresh` | Public | Refresh access token |
| POST | `/logout` | Private | Invalidate refresh token |
| POST | `/forgot-password` | Public | Send password reset email |
| PUT | `/reset-password/:resetToken` | Public | Reset password with token |

### Parking Locations — `/api/parking`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all active parking locations |
| GET | `/:id` | Public | Get single parking location details |
| POST | `/` | Admin | Create new parking location |
| PUT | `/:id` | Admin | Update parking location |
| DELETE | `/:id` | Admin | Delete parking location |
| POST | `/:id/images` | Admin | Upload location images |

### Slots — `/api/slots`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/location/:locationId` | Public | Get all slots for a location |
| POST | `/` | Admin | Create new slot |
| PUT | `/:id` | Admin | Update slot details |
| DELETE | `/:id` | Admin | Delete slot |

### Bookings — `/api/bookings`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my` | Private | Get current user's bookings |
| GET | `/` | Admin | Get all bookings |
| POST | `/` | Private | Create a new booking |
| GET | `/:id` | Private | Get single booking detail |
| PUT | `/:id/cancel` | Private | Cancel a booking |
| PUT | `/:id/checkin` | Admin | Check in customer via QR |
| PUT | `/:id/checkout` | Admin | Check out customer via QR |

### Payments — `/api/payment`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/:bookingId/pay` | Private | Mark booking as paid |
| GET | `/:bookingId` | Private | Get payment record |

### Users — `/api/users`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | Private | Get current user profile |
| PUT | `/profile` | Private | Update profile & avatar |
| PUT | `/change-password` | Private | Change password |
| GET | `/` | Admin | List all users |
| PUT | `/:id/ban` | Admin | Ban/unban a user |

### Dashboard — `/api/dashboard`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Admin | KPI stats (revenue, bookings, users, occupancy) |
| GET | `/reports` | Admin | Analytics data for charts |

---

## 🗺 Pages & Routes

### Public Routes
| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Marketing/hero page |
| `/locations` | ParkingLocations | Browse all parking locations |
| `/locations/:id` | ParkingDetails | Location detail + reviews |
| `/login` | Login | User login |
| `/register` | Register | New user signup |
| `/forgot-password` | ForgotPassword | Request password reset |
| `/reset-password/:token` | ResetPassword | Set new password |

### Private Routes (Login Required)
| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | Customer home & quick actions |
| `/locations/:id/reserve` | SlotSelection | Choose a parking slot |
| `/bookings/:id/checkout` | BookingPage | Complete & pay for booking |
| `/bookings/:id/success` | BookingSuccess | Confirmation + QR ticket |
| `/history` | BookingHistory | View all past/active bookings |
| `/profile` | Profile | Account settings & avatar |

### Admin Routes (Admin Role Required)
| Path | Page | Description |
|------|------|-------------|
| `/admin` | AdminDashboard | KPIs, live stats, quick actions |
| `/admin/locations` | ManageParking | CRUD parking locations |
| `/admin/slots` | ManageSlots | CRUD slots per location |
| `/admin/users` | ManageUsers | View/ban users |
| `/admin/reports` | Reports | Revenue & occupancy charts |
| `/admin/scan` | QRScanner | Check-in/out customers via QR |

---

## 🗄 Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt hashed |
| `role` | Enum | `customer` \| `admin` |
| `avatar` | String | Profile image URL |
| `isActive` | Boolean | Account active/banned status |

### ParkingLocation
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Location name |
| `address` | String | Street address |
| `city` | String | City |
| `coordinates` | Object | `{ lat, lng }` |
| `openingHours` | String | `HH:MM` 24h format |
| `closingHours` | String | `HH:MM` 24h format |
| `pricePerHour` | Number | Hourly rate |
| `numberOfFloors` | Number | Multi-floor support |
| `parkingType` | Enum | `Open` \| `Covered` \| `Basement` |
| `vehicleTypes` | Array | `Car` \| `Bike` \| `EV` |
| `status` | Enum | `Active` \| `Disabled` |

### Slot
| Field | Type | Description |
|-------|------|-------------|
| `locationId` | ObjectId | Ref to ParkingLocation |
| `slotNumber` | String | e.g., `A-101` |
| `floor` | Number | Floor number |
| `vehicleType` | Enum | `Car` \| `Bike` \| `EV` |
| `isAvailable` | Boolean | Current availability |
| `isDisabled` | Boolean | Admin-disabled slot |

### Booking
| Field | Type | Description |
|-------|------|-------------|
| `bookingId` | String | Unique human-readable ID |
| `userId` | ObjectId | Ref to User |
| `locationId` | ObjectId | Ref to ParkingLocation |
| `slotId` | ObjectId | Ref to Slot |
| `vehicleNumber` | String | Uppercase plate number |
| `vehicleType` | Enum | `Car` \| `Bike` \| `EV` |
| `startTime` / `endTime` | Date | Booking window |
| `duration` | Number | Hours |
| `amount` | Number | Total cost |
| `paymentStatus` | Enum | `Pending` \| `Paid` \| `Refunded` |
| `bookingStatus` | Enum | `Pending` \| `Confirmed` \| `Active` \| `Completed` \| `Cancelled` \| `Expired` |
| `qrUrl` | String | QR code image (Base64 or Cloudinary) |
| `checkInTime` / `checkOutTime` | Date | Actual entry/exit times |

---

## 🔐 Authentication & Authorization

The system uses **JWT-based authentication** with two tokens:

- **Access Token** — Short-lived (default: 15 minutes). Sent in the `Authorization: Bearer <token>` header.
- **Refresh Token** — Long-lived (default: 7 days). Used to silently obtain a new access token.

### Role Guards

```
Public Routes   →  No authentication required
Private Routes  →  Valid access token required
Admin Routes    →  Valid access token + role === 'admin'
```

The frontend enforces guards via `<PrivateRoute>` and `<AdminRoute>` components in `frontend/src/routes/AppRoutes.jsx`.

---

## 🔍 Key Features in Detail

### QR Code Flow
1. After a successful booking & payment, a unique QR code is generated server-side using the `qrcode` library.
2. The QR contains an encrypted verification token unique to each booking.
3. Admin scans the QR on the `/admin/scan` page using the `QRScanner` component.
4. The system verifies the token, updates the booking status to `Active` (check-in) or `Completed` (check-out), and records timestamps.

### Cron Jobs
Background tasks run on a schedule using `node-cron`:
- **Auto-expire** bookings whose `startTime` has passed and status is still `Pending` or `Confirmed`.
- **Release slots** back to availability after expiry.

### Image Uploads
- Images are handled by **Multer** on the backend.
- If Cloudinary credentials are configured, images are uploaded to Cloudinary CDN.
- Otherwise, images are stored locally in the `backend/uploads/` directory and served statically.

### Email Notifications
- **Nodemailer** sends transactional emails for:
  - Registration welcome
  - Booking confirmation with QR code attachment
  - Password reset link
- Falls back to console logging if SMTP is not configured.

---

## 📜 Scripts

### Root (monorepo-style)
```bash
npm run dev:frontend      # Start Vite dev server (frontend)
npm run dev:backend       # Start nodemon server (backend)
npm run start:backend     # Start production backend
npm run build:frontend    # Build frontend for production
npm run seed              # Seed the database
```

### Backend (`cd backend`)
```bash
npm run dev    # Development with nodemon auto-reload
npm start      # Production start
npm run seed   # Run database seeder
```

### Frontend (`cd frontend`)
```bash
npm run dev      # Vite development server
npm run build    # Production build (outputs to dist/)
npm run preview  # Preview production build locally
npm run lint     # Run oxlint linter
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing code style and add relevant comments where necessary.

---

## 📄 License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using the MERN Stack</p>
  <p>MongoDB · Express · React · Node.js</p>
</div>
