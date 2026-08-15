# ADR-003: Modular Monolith over Microservices

## Status
Accepted

## Context
ParkOps covers several business domains: Auth, Parking Management, Booking, Payments, Notifications, Analytics, and AI. An early architectural question is whether to implement these as separate microservices or as a single application.

## Decision
Implement ParkOps as a **modular monolith** — a single deployable Node.js/Express application with clearly separated internal modules (routes, controllers, models, services), not separate deployable services.

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| Full microservices | Enormous operational overhead, distributed tracing complexity, eventual consistency challenges for the booking flow, service discovery, and network latency between services |
| Serverless (Lambda) | Cold start latency for Socket.IO; streaming analytics; cron job complexity |

## Why NOT Microservices (For This Stage)

### 1. Transactional Consistency
The booking flow touches multiple concerns atomically:
- Acquire slot lock → check overlap → create Booking → update Slot → send Notification → broadcast Socket event

In a microservices architecture, this becomes a distributed saga pattern with compensation logic for partial failures. In a monolith, it's a single function with a try/catch and a lock release in `finally`.

### 2. Team Size
Microservices are optimized for independent teams owning independent services. For a single developer or small team, the overhead of inter-service communication, contracts, and deployment pipelines is pure waste.

### 3. Development Velocity
A new feature in a monolith: add route, controller, model, done. In microservices: define API contract, create new service, add service discovery, add circuit breaker, update API gateway...

### 4. Operational Overhead
A monolith requires: 1 Docker image, 1 ECS task definition, 1 CI/CD pipeline, 1 log stream. Microservices multiply this by the number of services.

### 5. Performance
No network hop between "services" — function calls are in-process. Shared MongoDB connection pool. Shared Redis client.

## When to Extract a Service
Service extraction makes sense when:
- A specific domain has **different scaling requirements** (e.g., analytics jobs under heavy CPU load)
- **Independent deployment** is needed (e.g., a payment service with PCI compliance scope)
- The **team has grown** enough that ownership boundaries require service-level independence
- A domain is **clearly separable** with a stable, well-defined interface

In the case of ParkOps, the Reporting/Analytics job (`analyticsJob.js`) is a candidate for extraction because it's CPU-heavy and could run separately without affecting the API response latency.

## Consequences
- All code changes require a full application deployment
- No independent scaling of sub-domains
- Module boundaries are conventions (directories), not enforced by network isolation
- The application is easy to understand, test, and operate
