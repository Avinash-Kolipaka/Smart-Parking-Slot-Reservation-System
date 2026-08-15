const axios = require('axios');

// Race Condition Test Script
// Simulates highly concurrent booking requests to the same slot at the same time.

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api';
const TOKEN_A = process.env.TOKEN_A; // Token for User A
const TOKEN_B = process.env.TOKEN_B; // Token for User B
const TOKEN_C = process.env.TOKEN_C; // Token for User C

const PARKING_ID = process.env.TEST_PARKING_ID;
const SLOT_ID = process.env.TEST_SLOT_ID;
const START_TIME = '2024-12-01T10:00:00.000Z'; // Static time for conflict
const END_TIME = '2024-12-01T12:00:00.000Z';

async function attemptBooking(token, userLabel) {
  try {
    const res = await axios.post(`${BASE_URL}/bookings`, {
      parkingId: PARKING_ID,
      slotId: SLOT_ID,
      startTime: START_TIME,
      endTime: END_TIME,
      vehicleNumber: `TEST-${userLabel}`
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return { user: userLabel, success: true, status: res.status, bookingId: res.data._id };
  } catch (error) {
    return { user: userLabel, success: false, status: error.response?.status, error: error.response?.data?.message || error.message };
  }
}

async function runRaceConditionTest() {
  if (!TOKEN_A || !TOKEN_B || !TOKEN_C || !PARKING_ID || !SLOT_ID) {
    console.error('Missing required environment variables (TOKEN_A, TOKEN_B, TOKEN_C, TEST_PARKING_ID, TEST_SLOT_ID)');
    process.exit(1);
  }

  console.log(`Starting Race Condition Test for Slot ${SLOT_ID} at ${START_TIME}...`);

  // Fire all requests simultaneously
  const requests = [
    attemptBooking(TOKEN_A, 'UserA'),
    attemptBooking(TOKEN_B, 'UserB'),
    attemptBooking(TOKEN_C, 'UserC')
  ];

  const results = await Promise.all(requests);

  console.log('\n--- Test Results ---');
  let successCount = 0;
  
  results.forEach(res => {
    console.log(`[${res.user}] Success: ${res.success} | Status: ${res.status} | Info: ${res.bookingId || res.error}`);
    if (res.success) successCount++;
  });

  console.log('\n--- Verification ---');
  if (successCount === 1) {
    console.log('✅ PASS: Exactly ONE booking succeeded. Race condition prevented.');
  } else if (successCount > 1) {
    console.error('❌ FAIL: Multiple bookings succeeded! Race condition vulnerability detected.');
  } else {
    console.error('❌ FAIL: All bookings failed. Ensure test data and slot are valid/available.');
  }
}

runRaceConditionTest();
