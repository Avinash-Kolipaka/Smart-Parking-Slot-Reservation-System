# AI Feature Validation & Preparation

This document defines the features and validations used by the ParkOps predictive occupancy model.

## Core Objective
The model predicts occupancy rates (%) and revenue for the next 12 hours based on historical trends, current bookings, and location capacity.

## Feature Definitions

| Feature Name | Type | Description | Source | Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| `parkingId` | Categorical | Unique identifier for the parking location | `ParkingLocation` | Must exist in DB |
| `capacity` | Numeric | Total available slots | `ParkingLocation` | Must be > 0 |
| `hour` | Numeric | Hour of the day (0-23) | Time context | 0 <= hour <= 23 |
| `dayOfWeek` | Numeric | Day of the week (0=Sun, 6=Sat) | Time context | 0 <= day <= 6 |
| `historicalOccupancy` | Numeric | Average occupancy for this hour/day over last 30 days | Aggregation | 0 <= occ <= capacity |
| `currentOccupancy` | Numeric | Live occupancy at time of prediction | Live Data | 0 <= occ <= capacity |
| `bookingVelocity` | Numeric | Rate of new bookings in the last 60 mins | Aggregation | Must be >= 0 |

## Data Quality Pipeline

Before features are passed to the prediction service (`predictionService.js`), they are validated to ensure:

1. **No Negative Values**: Revenue and occupancy calculations cannot result in negative numbers. If anomalies occur, they are clamped to 0.
2. **Capacity Constraints**: Predicted occupancy cannot exceed 100% of the total capacity. Predictions are capped at `Math.min(100, predictedOccupancy)`.
3. **Invalid Timestamps**: Records without valid timestamps are discarded from the 30-day historical window.
4. **Cold Start**: If a parking lot has < 7 days of data, the system falls back to a global baseline or marks predictions as "Insufficient Data".

## Data Leakage Prevention
The system enforces strict chronological separation. When generating predictions for Hour X, only data up to Hour X-1 is aggregated. The scheduled worker runs at the top of the hour to summarize the *previous* hour, ensuring no future data leaks into the prediction window.
