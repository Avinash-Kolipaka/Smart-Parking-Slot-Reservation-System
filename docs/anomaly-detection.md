# Anomaly Detection

## Heuristics
The system identifies operational anomalies by comparing daily metrics against a rolling 30-day baseline.

## Current Rules
- **BOOKING_SPIKE**: Triggered if the current day's bookings are > 2.0x higher than the 30-day average (minimum 7-day baseline required).
- The detected anomalies are inserted into the `ParkingAnomaly` collection and exposed to the Admin Dashboard for manual review.

## False Positives
Since anomaly detection uses simple statistical variance rather than deterministic failure states, it may flag legitimate behavior (e.g., event day parking spikes). Admins can mark these as `FALSE_POSITIVE` in the dashboard.
