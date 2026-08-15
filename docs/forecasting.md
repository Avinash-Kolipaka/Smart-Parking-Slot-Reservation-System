# Demand Forecasting

## Methodology
ParkOps utilizes a Rolling Moving Average forecast rather than deep learning, due to the limited historical dataset currently available.

## Algorithm
1. The `forecastJob.js` evaluates the last 30 days of `ParkingAnalytics` data for a specific location.
2. It averages the historical booking volumes.
3. It generates a predicted `expectedBookings` metric for up to 7 days in the future.

## Confidence Scores
- **High:** >= 21 days of historical data available in the 30-day window.
- **Medium:** >= 7 days of historical data.
- **Low:** < 7 days of historical data.

The frontend is expected to expose this confidence score to administrators.
