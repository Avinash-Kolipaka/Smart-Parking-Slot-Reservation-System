# Performance Baseline

This document stores the baseline performance metrics before any large-scale load or chaos testing.

## Baseline Load Test Results
*Date:* `[YYYY-MM-DD]`
*Tool:* `[k6 / Artillery / etc.]`
*Duration:* `[e.g., 5m]`
*Virtual Users (VUs):* `[e.g., 50]`

### Global Metrics
- **RPS (Requests per Second):** `[FILL_IN]`
- **Global Error Rate:** `[FILL_IN]%`

### Endpoint Latency (ms)

| Endpoint | Method | p50 | p95 | p99 | Max | Error Rate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET /api/parking/availability` | GET | `[x]` | `[y]` | `[z]` | `[max]` | `[e]` |
| `POST /api/bookings` | POST | `[x]` | `[y]` | `[z]` | `[max]` | `[e]` |
| `GET /api/users/history` | GET | `[x]` | `[y]` | `[z]` | `[max]` | `[e]` |
| `GET /api/admin/dashboard` | GET | `[x]` | `[y]` | `[z]` | `[max]` | `[e]` |

### Infrastructure Utilization (Peak during test)
- **ECS Application CPU:** `[FILL_IN]%`
- **ECS Application Memory:** `[FILL_IN] MB`
- **MongoDB Load (Connections/IOPS):** `[FILL_IN]`
- **Redis Load (Connections/CPU):** `[FILL_IN]`

### Socket.IO Performance
- **Connection Latency:** `[FILL_IN] ms`
- **Event Delivery Latency:** `[FILL_IN] ms`
- **Max Concurrent Connections Tested:** `[FILL_IN]`
