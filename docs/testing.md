# Testing Strategy

ParkOps relies on a multi-layered testing approach to ensure stability before production deployment.

## 1. Unit Tests
- **Scope:** Individual functions, utilities (e.g., price calculation, JWT generation), and isolated Mongoose schema validation.
- **Tools:** Jest
- **Execution:** `npm test`

## 2. Integration & API Tests
- **Scope:** Verifying that controllers, models, and middlewares work together. Crucially used for testing the full authentication flow and basic CRUD operations on parking slots.
- **Tools:** Jest + Supertest

## 3. Concurrency Tests
- **Scope:** Simulating race conditions on the `/bookings` endpoint to ensure the system prevents double-booking.
- **Tools:** Custom Node.js/Axios scripts (see `tests/reliability/race-condition-test.js`).

## 4. Load & Performance Tests
- **Scope:** Validating that the ECS infrastructure and MongoDB can handle expected user load and traffic spikes.
- **Tools:** `k6` (see `tests/performance/load-tests.js`).

## Continuous Integration (CI)
All Unit and API tests are automatically executed on every Pull Request to the `main` branch via GitHub Actions. A failure in the test suite blocks the merge.
