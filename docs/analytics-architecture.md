# Analytics Architecture

The analytics layer sits logically separate from the transactional booking system to ensure zero impact on core business operations.

## Data Model
- `ParkingAnalytics.js`: Consolidates successful bookings, cancellations, revenue, and duration averages into daily/hourly snapshots.

## Dashboard Querying
The admin dashboard queries `ParkingAnalytics` instead of joining `Booking`, `Payment`, and `Slot` collections, resulting in O(1) time complexity for rendering charts and top-line metrics.
