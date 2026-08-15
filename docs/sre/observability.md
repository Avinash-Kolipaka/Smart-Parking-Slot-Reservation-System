# Observability Architecture

ParkOps implements a robust observability architecture based on structured logging and health endpoints. 

## 1. Structured Logging
All backend logs are formatted in JSON (`winston.format.json()`) when `NODE_ENV=production`. This enables automated log aggregation systems (like CloudWatch Logs or ELK) to easily index, search, and visualize log properties.

Every request receives a unique `X-Request-ID` attached to the log object.

## 2. Health & Readiness Probes
The backend exposes three critical health points:
- `/api/health/live`: Lightweight check to ensure the Express HTTP server process is running.
- `/api/health/ready`: Deep health check that strictly validates if the underlying MongoDB database and Redis cache are available. Returns `503` if the database is disconnected.

## 3. Metrics Tracking
A custom `metricsMiddleware` tracks:
- Request total count.
- Request error count.
- Average response times via `process.hrtime()`.
- Booking success and failure rates.

## 4. CloudWatch Integration
In AWS, the EC2 instance CloudWatch agent automatically collects:
- System Level: CPU, Memory, Disk, and Network IO.
- Application Level: Parsed JSON logs from standard output (Docker logs).
- Alarms: Target 5xx response codes and high CPU utilization.
