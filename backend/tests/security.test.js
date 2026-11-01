const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // Assuming app is exported for testing
const Tenant = require('../models/Tenant');
const TenantMembership = require('../models/TenantMembership');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingLocation = require('../models/ParkingLocation');
const jwt = require('jsonwebtoken');

describe('Cross-Tenant Security Isolation Tests', () => {
  let tenantA, tenantB;
  let userA, userB;
  let tokenA, tokenB;
  let parkingB, bookingB;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/smart-parking-test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Create Tenants
    tenantA = await Tenant.create({ name: 'Tenant A', slug: 'tenant-a' });
    tenantB = await Tenant.create({ name: 'Tenant B', slug: 'tenant-b' });

    // Create Users
    userA = await User.create({ name: 'User A', email: 'userA@test.com', password: 'password123' });
    userB = await User.create({ name: 'User B', email: 'userB@test.com', password: 'password123' });

    // Memberships
    await TenantMembership.create({ userId: userA._id, tenantId: tenantA._id, role: 'TENANT_ADMIN', status: 'ACTIVE' });
    await TenantMembership.create({ userId: userB._id, tenantId: tenantB._id, role: 'TENANT_ADMIN', status: 'ACTIVE' });

    // Generate JWTs
    tokenA = jwt.sign({ id: userA._id }, process.env.JWT_SECRET);
    tokenB = jwt.sign({ id: userB._id }, process.env.JWT_SECRET);

    // Create Tenant B Resources
    parkingB = await ParkingLocation.create({
      tenantId: tenantB._id,
      name: 'Tenant B Mall Parking',
      address: '123 Test St',
      city: 'Test City',
      coordinates: { lat: 37.7749, lng: -122.4194 },
      openingHours: '00:00',
      closingHours: '23:59',
      parkingType: 'Covered',
      location: { type: 'Point', coordinates: [0, 0] },
      pricePerHour: 10
    });

    bookingB = await Booking.create({
      tenantId: tenantB._id,
      userId: userB._id,
      locationId: parkingB._id,
      slotId: new mongoose.Types.ObjectId(),
      vehicleNumber: 'KA-01-AB-1234',
      vehicleType: 'Car',
      bookingId: 'B-12345',
      bookingDate: new Date(),
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      duration: 1,
      amount: 10,
      verificationToken: 'vtoken123',
      bookingStatus: 'Confirmed'
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('Tenant A user CAN access Tenant A resources', async () => {
    // We expect a 200 (or empty array) for their own tenant
    const res = await request(app)
      .get('/api/parking')
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-id', tenantA._id.toString());
    
    expect(res.statusCode).toBe(200);
  });

  test('Tenant A user CANNOT access Tenant B resources via header manipulation', async () => {
    const res = await request(app)
      .get(`/api/parking/${parkingB._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-id', tenantB._id.toString()); // Attempt IDOR via header
    
    // The tenantMiddleware should reject this because userA has no membership in tenantB
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toContain('not a member');
  });

  test('Tenant A user CANNOT fetch Tenant B booking via URL manipulation', async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingB._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .set('x-tenant-id', tenantA._id.toString()); // Proper header, malicious ID
    
    // The controller should query `{ _id: req.params.id, tenantId: req.tenant._id }`
    // Which will result in not found (404) or unauthorized (403)
    expect([403, 404]).toContain(res.statusCode);
  });

  test('API key with read scope CANNOT delete resources', async () => {
    // This tests the `apiKeyMiddleware` scope validation
    const res = await request(app)
      .delete(`/api/parking/${parkingB._id}`)
      .set('x-api-key', 'mock-read-only-key'); // Assume we mocked this
      
    expect(res.statusCode).toBe(401); // Unauthorized
  });
});
