# AI Failure Modes & Recovery Procedures

ParkOps is designed so that the core deterministic platform (CRUD, reservations, payments, and QR check-ins) functions flawlessly even if the AI intelligence layer completely fails.

Below are the documented failure modes for the AI layer and their recovery paths.

## 1. Third-Party AI Provider Unavailable
**Detection**: High latency on `/api/admin/ai/ask` or 5xx errors from the OpenAI/Anthropic/Gemini provider.
**Impact**: The natural language AI Assistant returns an error. Dashboard insights may be unavailable.
**Fallback**: The system automatically serves cached deterministic dashboard data. The `askAI` abstraction handles the failure gracefully.
**Recovery**: Wait for the third-party service to restore, or switch the `AI_PROVIDER` environment variable to fallback.

## 2. Prediction Job Failure (Worker Crash)
**Detection**: Node-cron job throws an unhandled exception or the Node process restarts during aggregation.
**Impact**: Forecasts in the AI dashboard become stale.
**Fallback**: Redis cache serves the last known good forecast. Dashboard displays the timestamp of the last prediction.
**Recovery**: On the next hour, the idempotent cron job will run and rewrite the cache.

## 3. High Latency / Rate Limiting
**Detection**: User requests to the AI Assistant take longer than 10s.
**Impact**: Poor UX for admins using the assistant.
**Fallback**: Strict 10-second timeout enforced by Axios in `aiProvider.js`. If exceeded, a friendly timeout error is returned. Rate limiting middleware (`express-rate-limit`) stops abuse at 10 requests / 15 minutes.
**Recovery**: Auto-recovers once the user waits or the timeout elapses.

## 4. Insufficient Data (Cold Start)
**Detection**: Trying to predict occupancy for a newly added parking location with no history.
**Impact**: Prediction algorithms cannot generate valid curves.
**Fallback**: System catches the missing history and explicitly displays "Insufficient historical data to predict occupancy."
**Recovery**: Automatically resolves after 7 days of active bookings.

## 5. Corrupted Aggregation Data
**Detection**: Anomaly detection flags negative revenue or >100% expected occupancy.
**Impact**: AI insights display impossible metrics.
**Fallback**: Data quality pipeline clamps negative values to 0 and caps occupancy at 100% capacity before saving.
**Recovery**: Database integrity check on the transactional tables.
