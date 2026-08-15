# ParkOps v1.1 - AI Parking Intelligence

ParkOps v1.1 introduces an optional AI intelligence layer that transforms the platform from a CRUD reservation system into a predictive operations engine.

## Overview

The intelligence layer analyzes historical parking activity, current occupancy, booking velocity, and revenue patterns to produce actionable operational insights. 

**Key Principle:** The core booking system remains deterministic. AI is strictly isolated as an optional intelligence layer. If the AI provider fails, bookings, payments, and QR check-ins continue working without interruption.

## Features

### 1. Predictive Occupancy
By analyzing historical demand (moving average across the last 30 days filtered by hour and day of the week), ParkOps predicts occupancy for the next 12 hours.
- Predicts expected peak hour.
- Handles insufficient data by falling back to simple heuristics and system baselines.
- Aggregated efficiently in background Cron jobs (`analyticsJob.js`).

### 2. AI Parking Assistant
Administrators can ask natural-language questions about their parking operations.
- The assistant operates safely by querying local Node.js endpoints (Tools) and feeding aggregated metrics (not raw DB rows) to the LLM.
- **Hallucination Protection:** The system prompts the LLM to strictly output structural answers (Answer, Evidence, Recommendation).

### 3. Anomaly Detection
Background jobs monitor real-time data against expected baselines. If revenue drops unexpectedly or occupancy spikes, anomalies are flagged in the AI Dashboard.

### 4. Dynamic Pricing Simulation
Operators can simulate price changes based on expected demand to see forecasted revenue. *Note: This is currently in simulation mode and does not alter production prices automatically.*

## Architecture & Isolation

- **API Routes:** AI routes are isolated under `/api/admin/ai/`.
- **Database:** Uses separate models (`DemandForecast`, `AIUsage`, `ParkingAnomaly`) to prevent schema pollution in core transactional tables.
- **Cost Control:** Rate limiting is enforced strictly on AI routes (10 requests / 15 mins).
- **Background Workers:** Predictions run out-of-band via node-cron to ensure the main event loop is never blocked by expensive aggregation queries.
- **Caching:** Output is heavily cached in Redis (`forecast:hourly:*`) so frontend dashboards load instantly.

## Interview Story

> "ParkOps does not use AI simply as a generic chatbot. The intelligence layer analyzes historical parking activity, current occupancy, booking velocity, and revenue patterns to produce operational insights for parking operators. The core booking system remains deterministic, while AI is isolated as an optional intelligence layer."
