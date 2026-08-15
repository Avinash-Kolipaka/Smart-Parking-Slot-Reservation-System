# ParkOps Demo Accounts

> **WARNING**: These accounts are strictly for demonstration and development purposes. Do not use these credentials in a production environment. 

This document contains credentials for the predefined roles in the ParkOps platform to facilitate seamless live demonstrations and evaluations.

## 1. Customer Demo Account

Use this account to demonstrate the primary end-user flow: searching for parking, booking a slot, processing payments, and generating/viewing QR codes.

* **Email:** `customer.demo@parkops.local`
* **Password:** `DemoCustomer!2024`
* **Role:** Customer
* **Data Context:** Pre-loaded with past bookings, wallet balance, and saved vehicles.

## 2. Parking Operator Demo Account

Use this account to demonstrate location-specific management: viewing current occupancy, validating QR codes, and managing specific floor layouts.

* **Email:** `operator.demo@parkops.local`
* **Password:** `DemoOperator!2024`
* **Role:** Operator
* **Data Context:** Assigned to "Downtown Central Parking", with access to location-specific live dashboards.

## 3. Administrator Demo Account

Use this account to demonstrate global system management: overseeing all parking locations, managing users, reviewing system-wide analytics, and configuring pricing rules.

* **Email:** `admin.demo@parkops.local`
* **Password:** `DemoAdmin!2024`
* **Role:** Admin
* **Data Context:** Full system access, pre-populated analytics dashboards, and access to all locations.

## Database Seeding
To ensure these accounts are available and have the necessary relationship data (bookings, analytics, permissions), run the following command in the `backend` directory before starting your demo:

```bash
npm run seed:demo
```
