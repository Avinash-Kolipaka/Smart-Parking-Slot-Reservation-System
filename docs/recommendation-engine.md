# Recommendation Engine

## Strategy
ParkOps implements a transparent, multi-factor scoring system for recommending parking locations. It does NOT use opaque ML algorithms, ensuring all recommendations can be explained to the user.

## Scoring Factors (Base Score: 100)
- **Budget Penalty (-40 points):** Deducted if the price per hour exceeds the user's budget.
- **Capacity Penalty (-30 points):** Deducted if the `DemandForecast` predicts > 90% occupancy at the intended arrival time.
- **Distance Penalty (-5 points):** Minor penalty for geospatial distance (placeholder implementation).

## Explainability
Every recommendation API response includes an `explanation` array mapping directly to the factors above (e.g., "Predicted to be heavily occupied at arrival time", "Exceeds budget by ₹10/hr").
