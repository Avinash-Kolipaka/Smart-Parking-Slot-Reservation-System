# Model Evaluation & Performance

This document outlines the evaluation strategy for the predictive occupancy algorithms in ParkOps.

## Methodology

Predictions are evaluated chronologically to prevent temporal data leakage.
The evaluation loop operates as follows:
1. Generate prediction for Hour H.
2. Store prediction with `predictionVersion` and `generatedAt`.
3. Wait until Hour H concludes.
4. Record `actualOccupancy`.
5. Calculate error metrics.

## Baseline Model

To measure the true value of the AI layer, we compare predictions against a naive baseline:
**Baseline**: Same Hour, Previous Week (e.g., predicting next Tuesday 9 AM by simply copying last Tuesday 9 AM).

If the prediction model's MAE > Baseline MAE, the model requires retraining or heuristic tuning.

## Metrics

We use the following metrics to evaluate occupancy prediction accuracy:

- **MAE (Mean Absolute Error)**: Average absolute percentage difference between predicted occupancy (%) and actual occupancy (%). Provides a highly interpretable error rate.
- **RMSE (Root Mean Squared Error)**: Penalizes larger prediction errors more heavily than small ones. Important for preventing severe under-prediction (which causes overbooking risks).

## Confidence Scores

Confidence scores are determined by data availability:
- **High**: > 30 days of historical data for this parking location and > 100 past bookings.
- **Medium**: 7 to 30 days of historical data.
- **Low**: < 7 days of data (Cold Start). 

*Note: We do not display arbitrary percentage confidence (e.g., 94.2%) unless backed by a calibrated probabilistic model.*

## Data Drift Monitoring

The scheduled analytics job monitors for data drift:
- Shifts in peak booking times.
- Significant changes in revenue distributions (e.g., sudden drop in average booking duration).
When detected, these are flagged in the `ParkingAnomaly` table to alert the operator.
