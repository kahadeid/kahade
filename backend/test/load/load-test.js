/**
 * K6 Load Testing Framework (MEDIUM-007)
 * 
 * Run: k6 run test/load/load-test.js
 * Dashboard: k6 run --out json=results.json test/load/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp-up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp-up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.1'],             // Custom error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test scenarios
export default function () {
  // Scenario 1: User registration (10% of traffic)
  if (Math.random() < 0.1) {
    testRegistration();
  }
  // Scenario 2: User login (20% of traffic)
  else if (Math.random() < 0.3) {
    testLogin();
  }
  // Scenario 3: Wallet operations (40% of traffic)
  else if (Math.random() < 0.7) {
    testWalletOperations();
  }
  // Scenario 4: Escrow creation (30% of traffic)
  else {
    testEscrowCreation();
  }

  sleep(1);
}

function testRegistration() {
  const payload = JSON.stringify({
    email: `user${Date.now()}${Math.random()}@example.com`,
    password: 'Password123!',
    name: 'Load Test User',
    phone: '081234567890',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/auth/register`, payload, params);

  check(res, {
    'registration status is 201': (r) => r.status === 201,
    'registration has user id': (r) => JSON.parse(r.body).id !== undefined,
  }) || errorRate.add(1);
}

function testLogin() {
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'Password123!',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${BASE_URL}/auth/login`, payload, params);

  check(res, {
    'login status is 200': (r) => r.status === 200,
    'login has access token': (r) => JSON.parse(r.body).accessToken !== undefined,
    'response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  return res.status === 200 ? JSON.parse(res.body).accessToken : null;
}

function testWalletOperations() {
  const token = testLogin();
  if (!token) return;

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  // Get wallet balance
  const res = http.get(`${BASE_URL}/wallet`, params);

  check(res, {
    'wallet status is 200': (r) => r.status === 200,
    'wallet has balance': (r) => JSON.parse(r.body).balance !== undefined,
    'response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);
}

function testEscrowCreation() {
  const token = testLogin();
  if (!token) return;

  const payload = JSON.stringify({
    amount: 100000,
    description: 'Load test escrow',
    receiverId: 'receiver-id',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const res = http.post(`${BASE_URL}/escrow`, payload, params);

  check(res, {
    'escrow creation status is 201': (r) => r.status === 201,
    'escrow has id': (r) => JSON.parse(r.body).id !== undefined,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

/**
 * Run different test scenarios:
 * 
 * // Smoke test (quick validation)
 * k6 run --vus 1 --duration 1m test/load/load-test.js
 * 
 * // Load test (normal load)
 * k6 run --vus 100 --duration 10m test/load/load-test.js
 * 
 * // Stress test (find breaking point)
 * k6 run --vus 500 --duration 20m test/load/load-test.js
 * 
 * // Spike test (sudden traffic spike)
 * k6 run --stage 1m:10,30s:1000,1m:10 test/load/load-test.js
 * 
 * // Soak test (sustained load)
 * k6 run --vus 200 --duration 4h test/load/load-test.js
 * 
 * // With cloud output
 * k6 run --out cloud test/load/load-test.js
 * 
 * // With InfluxDB output
 * k6 run --out influxdb=http://localhost:8086/k6 test/load/load-test.js
 */
