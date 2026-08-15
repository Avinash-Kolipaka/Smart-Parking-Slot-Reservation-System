# Service Level Objectives (SLOs) and Error Budgets

This document outlines the Service Level Objectives (SLOs) and Service Level Indicators (SLIs) for ParkOps.

## 1. Service Level Indicators (SLIs)

SLIs are the measurable indicators of our service health.

*   **API Availability SLI:** `Successful Requests (2xx, 3xx, 4xx client errors) / Total Requests`
*   **API Latency SLI:** `p95 request latency for critical endpoints (Booking, Search)`
*   **Booking Success Rate SLI:** `Successful Valid Bookings / Total Booking Attempts`
*   **Payment Success Rate SLI:** `Successful Payments / Total Initiated Payments`
*   **Real-time Synchronization SLI:** `Successful Socket.IO Connection & Message Delivery / Total Connections`

## 2. Service Level Objectives (SLOs)

SLOs are the target values or ranges of values for our SLIs.

| SLI | Target Objective (SLO) | Measurement Window |
| :--- | :--- | :--- |
| API Availability | 99.9% | 30 days rolling |
| API Latency (p95) | < 250ms | 30 days rolling |
| Booking Success Rate | 99.95% | 30 days rolling |
| Payment Success Rate | 99.5% | 30 days rolling |
| Real-time Synchronization | 99.0% | 30 days rolling |

## 3. Error Budget

The error budget is `100% - SLO`. It dictates the allowed failure before action is required.

| SLO | Allowed Failure (Budget) | Observed Failure | Remaining Budget | Action Threshold |
| :--- | :--- | :--- | :--- | :--- |
| 99.9% Availability | 0.1% (43.8 mins/mo) | `[MEASURE]` | `[CALCULATE]` | Halt feature deployments if < 10% remaining |
| 250ms p95 Latency | 5% of requests > 250ms | `[MEASURE]` | `[CALCULATE]` | Investigate slow endpoints |
| 99.95% Booking | 0.05% failed bookings | `[MEASURE]` | `[CALCULATE]` | Immediate Sev-2 Incident |
| 99.5% Payments | 0.5% failed payments | `[MEASURE]` | `[CALCULATE]` | Investigate provider health |

*(Note: The 'Observed Failure' and 'Remaining Budget' columns must be populated with real production/staging numbers from monitoring tools.)*
