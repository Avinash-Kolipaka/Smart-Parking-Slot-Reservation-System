# Data Quality & Idempotency

## Job Safety
All cron jobs (`analyticsJob.js`, `forecastJob.js`) implement idempotency.
If the server restarts mid-job, or if a manual re-trigger occurs, the database will not duplicate metrics.

## Aggregation IDs
This is achieved via the `aggregationId` string (e.g., `daily-<parking_id>-<date>`). Mongoose `findOneAndUpdate` with `upsert: true` ensures that the same time window always targets the exact same record, overwriting stale aggregations rather than stacking them.

## Validation Checks
Before aggregating, the system only counts bookings that have an `endTime` greater than `startTime`, discarding invalid edge-cases to maintain accurate duration averages.
