require('dotenv').config({ path: '../.env' }); // Load from server parent directory if run from utils, or try local path
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// If dotenv didn't load from parent directory, check absolute/current path
if (!process.env.MONGO_URI) {
  require('dotenv').config();
}

const User = require('../models/User');
const ParkingLocation = require('../models/ParkingLocation');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-parking';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing database collections...');
    await Promise.all([
      User.deleteMany({}),
      ParkingLocation.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
      AdminLog.deleteMany({})
    ]);
    console.log('Database cleared!');

    console.log('Creating Admin account...');
    // Create Admin User
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@smartparking.com',
      password: 'admin123', // Will be hashed by mongoose pre-save hook
      phone: '+1 555-0199',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    });

    console.log('Creating Customer account...');
    // Create default Customer User
    const customer = await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'password123',
      phone: '+1 555-0144',
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      vehicles: [
        { licenseNumber: 'XYZ-7890', vehicleType: 'Car', model: 'Tesla Model 3' },
        { licenseNumber: 'MTR-4455', vehicleType: 'Bike', model: 'Yamaha YZF' }
      ]
    });

    console.log('Creating Parking Locations...');
    // Create Parking Locations
    const locations = await ParkingLocation.create([
      {
        name: 'Downtown Grand Plaza',
        address: '750 Market St, San Francisco, CA 94102',
        city: 'San Francisco',
        zipCode: '94102',
        coordinates: { lat: 37.7879, lng: -122.4075 },
        openingHours: '06:00',
        closingHours: '23:30',
        pricePerHour: 5.00,
        numberOfFloors: 3,
        parkingType: 'Covered',
        vehicleTypes: ['Car', 'Bike', 'EV'],
        images: [
          'https://images.unsplash.com/photo-1506521788701-1e13a700b10a?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Premium covered parking structure right in the heart of downtown. Features 24/7 security patrol, CCTV cameras, clean EV charging stations, and a modern elevator system.'
      },
      {
        name: 'Metro Terminal North Parking',
        address: '150 Fourth St, San Francisco, CA 94103',
        city: 'San Francisco',
        zipCode: '94103',
        coordinates: { lat: 37.7836, lng: -122.4032 },
        openingHours: '05:00',
        closingHours: '23:00',
        pricePerHour: 3.50,
        numberOfFloors: 1,
        parkingType: 'Open',
        vehicleTypes: ['Car', 'Bike'],
        images: [
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Spacious open-air parking lot near transit terminals. Ideal for daily commuters who want easy highway access. Fenced perimeter with barcode scanner gates.'
      },
      {
        name: 'Civic Center Underpass Parking',
        address: '355 McAllister St, San Francisco, CA 94102',
        city: 'San Francisco',
        zipCode: '94102',
        coordinates: { lat: 37.7792, lng: -122.4191 },
        openingHours: '08:00',
        closingHours: '22:00',
        pricePerHour: 7.00,
        numberOfFloors: 2,
        parkingType: 'Basement',
        vehicleTypes: ['Car', 'EV'],
        images: [
          'https://images.unsplash.com/photo-1512403754473-27855613950f?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Secure underground basement parking facility. Directly below the civic center municipal complex. Perfect for business travelers and city visitors.'
      }
    ]);

    console.log('Generating Slots for Parking Locations...');
    // Create Slots dynamically for each location
    const vehicleTypesArray = ['Car', 'Bike', 'EV'];

    for (const loc of locations) {
      const slotsToCreate = [];

      for (let floor = 1; floor <= loc.numberOfFloors; floor++) {
        // Let's create 10 slots per floor
        const zones = ['A', 'B'];

        for (let i = 1; i <= 10; i++) {
          const zone = zones[Math.floor((i - 1) / 5)]; // 1-5 Zone A, 6-10 Zone B
          const slotNumber = `${zone}-${floor}${i}`;

          // Assign vehicle type: Floor 1 has EV and Car slots, other floors have Car and Bike slots
          let vehicleType = 'Car';
          if (loc.vehicleTypes.includes('EV') && floor === 1 && i <= 3) {
            vehicleType = 'EV';
          } else if (loc.vehicleTypes.includes('Bike') && i > 8) {
            vehicleType = 'Bike';
          } else if (!loc.vehicleTypes.includes(vehicleType)) {
            // Fallback to first compatible vehicle type
            vehicleType = loc.vehicleTypes[0];
          }

          slotsToCreate.push({
            parkingLocationId: loc._id,
            slotNumber,
            floor,
            parkingZone: zone,
            vehicleType,
            status: 'Available',
            price: vehicleType === 'EV' ? loc.pricePerHour + 2 : loc.pricePerHour // EV slots are slightly more expensive
          });
        }
      }

      const createdSlots = await Slot.create(slotsToCreate);
      loc.totalSlots = createdSlots.length;
      await loc.save();

      console.log(`Generated ${createdSlots.length} slots for '${loc.name}'`);
    }

    // Add some sample reviews to make the data rich
    await Review.create([
      {
        locationId: locations[0]._id,
        userId: customer._id,
        rating: 5,
        comment: 'Extremely clean parking lot. The slots are spacious and the EV charging is fast! Will definitely use it again.'
      },
      {
        locationId: locations[1]._id,
        userId: customer._id,
        rating: 4,
        comment: 'Great value for money, very close to the train station. Gets a bit busy in the morning but slot reservation makes it stress-free.'
      }
    ]);

    // Create a mock past booking for history
    const pastBookingId = 'PRK-20260728-E192B4';
    const pastBooking = await Booking.create({
      bookingId: pastBookingId,
      userId: customer._id,
      locationId: locations[0]._id,
      slotId: (await Slot.findOne({ parkingLocationId: locations[0]._id, vehicleType: 'Car' }))._id,
      vehicleNumber: 'XYZ-7890',
      vehicleType: 'Car',
      bookingDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
      duration: 2,
      amount: 10.00,
      paymentStatus: 'Paid',
      bookingStatus: 'Completed',
      verificationToken: 'mocktoken12345',
      checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      checkOutTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
      qrUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=100'
    });

    await Payment.create({
      bookingId: pastBooking._id,
      amount: 10.00,
      method: 'MockGateway',
      status: 'Success',
      transactionId: 'TXN-MOCKPASTPAY123',
      paymentDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
