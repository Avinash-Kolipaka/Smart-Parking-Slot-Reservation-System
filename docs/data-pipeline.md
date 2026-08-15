# Data Pipeline Architecture

## Overview
ParkOps uses an asynchronous, idempotent data aggregation pipeline to avoid running heavy analytics queries during live booking transactions.

## Flow
1. **Raw Transactions:** Users create `Booking` and `Payment` records in real-time.
2. **Cron Job Aggregation:** `backend/jobs/analyticsJob.js` runs daily at 00:30 UTC.
3. **Analytics Models:** The job aggregates the previous 24 hours of data into a single document per parking location inside `ParkingAnalytics`.
4. **Dashboard:** The admin dashboard queries `ParkingAnalytics` instead of raw `Booking` models, ensuring lightning-fast load times.

## Idempotency
The `aggregationId` (e.g., `daily-parkingId-2026-08-11T00:00:00Z`) ensures that if a background worker crashes and restarts, the analytics data is not duplicated.
