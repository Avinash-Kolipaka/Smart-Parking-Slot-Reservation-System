import http from 'k6/http';
import { check, sleep } from 'k6';

// Run with: k6 run load-testing/k6-script.js

export const options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = 'http://localhost:5000/api'; // Change to staging/prod URL for real tests

export default function () {
  // 1. Check Liveness
  const healthRes = http.get(`${BASE_URL}/health/live`);
  check(healthRes, { 'health check is 200': (r) => r.status === 200 });

  // 2. Search Parking Locations
  const parkingRes = http.get(`${BASE_URL}/parking?search=downtown`);
  check(parkingRes, { 'parking search is 200': (r) => r.status === 200 });

  sleep(1);
}
