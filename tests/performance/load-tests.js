import http from 'k6/http';
import { check, sleep } from 'k6';

// This script requires k6 to be installed (https://k6.io/)
// Run with: k6 run load-tests.js

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000/api'; // Change to staging URL

export const options = {
  scenarios: {
    // 6. LOAD TEST: Realistic staging load test
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 }, // Ramp up to 20 users
        { duration: '1m', target: 20 },  // Stay at 20 for 1 minute
        { duration: '30s', target: 0 },  // Ramp down
      ],
      tags: { test_type: 'load' },
    },
    // 7. SPIKE TEST: Sudden traffic increase
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },  // Normal traffic
        { duration: '10s', target: 100 }, // Spike to 100 users rapidly
        { duration: '30s', target: 100 }, // Hold spike
        { duration: '20s', target: 10 },  // Drop back to normal
        { duration: '10s', target: 0 },   // Ramp down
      ],
      tags: { test_type: 'spike' },
      startTime: '3m', // Run after load test
    },
    // 8. SOAK TEST: Sustained traffic for extended period
    /* Uncomment for actual soak testing
    soak_test: {
      executor: 'constant-vus',
      vus: 30,
      duration: '4h',
      tags: { test_type: 'soak' },
      startTime: '5m',
    },
    */
  },
  thresholds: {
    http_req_duration: ['p(95)<250'], // 95% of requests should be < 250ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  // Scenario: Search Parking -> Check Availability -> (Simulate Booking)
  
  // 1. Get Parking locations
  const parkingRes = http.get(`${BASE_URL}/parking`);
  check(parkingRes, { 'status is 200 (parking)': (r) => r.status === 200 });
  
  sleep(1);

  // Note: For a true load test, you need an auth token and valid test data (parkingId).
  // Assuming a static test parking ID is provided via env var.
  const parkingId = __ENV.TEST_PARKING_ID || 'dummy_parking_id';
  
  if (parkingId !== 'dummy_parking_id') {
    // 2. Check Availability
    const availRes = http.get(`${BASE_URL}/parking/${parkingId}/availability?startTime=2024-01-01T10:00:00Z&endTime=2024-01-01T12:00:00Z`);
    check(availRes, { 'status is 200 (availability)': (r) => r.status === 200 });
  }

  sleep(1);
}
