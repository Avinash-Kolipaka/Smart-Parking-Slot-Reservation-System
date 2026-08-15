const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const ParkingLocation = require('../models/ParkingLocation');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

describe('Critical Booking Concurrency Control Test', () => {
  let authToken;
  let testUser;
  let testLocation;
  let testSlot;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-parking-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Clean up
    await User.deleteMany({ email: 'concurrent_user@parkops.local' });
    await ParkingLocation.deleteMany({ name: 'Concurrency Test Location' });
    await Booking.deleteMany({});

    // Setup Test User
    testUser = await User.create({
      name: 'Concurrent User',
      email: 'concurrent_user@parkops.local',
      password: 'password123',
      role: 'USER'
    });

    // Login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'concurrent_user@parkops.local', password: 'password123' });
    authToken = loginRes.body.accessToken;

    // Setup Location & Single Target Slot
    testLocation = await ParkingLocation.create({
      name: 'Concurrency Test Location',
      address: '100 Concurrency St',
      city: 'San Francisco',
      pricePerHour: 50,
      numberOfFloors: 1,
      parkingType: 'Covered',
      vehicleTypes: ['Car'],
      coordinates: { lat: 37.77, lng: -122.41 },
      openingHours: '00:00',
      closingHours: '23:59'
    });

    testSlot = await Slot.create({
      parkingLocationId: testLocation._id,
      slotNumber: 'C-101',
      floor: 1,
      vehicleType: 'Car',
      status: 'Available',
      price: 50
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: 'concurrent_user@parkops.local' });
    await ParkingLocation.deleteMany({ name: 'Concurrency Test Location' });
    if (testLocation && testLocation._id) {
      await Slot.deleteMany({ parkingLocationId: testLocation._id });
    }
    await Booking.deleteMany({});
    await mongoose.connection.close();
  });

  it('should allow exactly 1 successful booking out of multiple simultaneous requests for the exact same slot/time', async () => {
    const startTime = new Date(Date.now() + 3600 * 1000).toISOString();
    const endTime = new Date(Date.now() + 7200 * 1000).toISOString();

    const bookingPayload = {
      locationId: testLocation._id,
      slotId: testSlot._id,
      vehicleNumber: 'CONC-999',
      vehicleType: 'Car',
      bookingDate: startTime,
      startTime,
      endTime
    };

    const CONCURRENT_REQUESTS = 10; // 10 parallel requests targeting identical slot and time
    const promises = [];

    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      promises.push(
        request(app)
          .post('/api/bookings/book')
          .set('Authorization', `Bearer ${authToken}`)
          .send(bookingPayload)
      );
    }

    const results = await Promise.all(promises);

    const successCount = results.filter(r => r.statusCode === 201 && r.body.success === true).length;
    const rejectedCount = results.filter(r => r.statusCode === 400 || r.statusCode === 409).length;

    expect(successCount).toBe(1);
    expect(rejectedCount).toBe(CONCURRENT_REQUESTS - 1);
  });
});
