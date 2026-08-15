require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

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

    console.log('Clearing existing database records...');
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

    console.log('Creating system users & roles...');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@parkops.local',
      password: 'password123',
      phone: '+1 555-0199',
      role: 'ADMIN',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    });

    const manager = await User.create({
      name: 'Parking Manager',
      email: 'manager@parkops.local',
      password: 'password123',
      phone: '+1 555-0288',
      role: 'PARKING_MANAGER',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
    });

    const user1 = await User.create({
      name: 'Alex Mercer',
      email: 'user@parkops.local',
      password: 'password123',
      phone: '+1 555-0144',
      role: 'USER',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      vehicles: [
        { licenseNumber: 'KA-01-AB-1234', vehicleType: 'Car', model: 'Tesla Model 3' },
        { licenseNumber: 'KA-05-EV-9900', vehicleType: 'EV', model: 'Nexon EV' }
      ]
    });

    const user2 = await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'password123',
      phone: '+1 555-0777',
      role: 'USER',
      profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
      vehicles: [
        { licenseNumber: 'MH-12-BK-5544', vehicleType: 'Bike', model: 'Yamaha R15' }
      ]
    });

    console.log('Creating 5 Parking Locations...');
    const locations = await ParkingLocation.create([
      {
        name: 'Downtown Grand Plaza',
        address: '750 Market St, San Francisco, CA 94102',
        city: 'San Francisco',
        zipCode: '94102',
        coordinates: { lat: 37.7879, lng: -122.4075 },
        location: { type: 'Point', coordinates: [-122.4075, 37.7879] },
        openingHours: '06:00',
        closingHours: '23:30',
        pricePerHour: 50.00,
        numberOfFloors: 3,
        parkingType: 'Covered',
        vehicleTypes: ['Car', 'Bike', 'EV'],
        images: [
          'https://images.unsplash.com/photo-1506521788701-1e13a700b10a?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Multi-storey automated covered parking structure with 24/7 security and EV fast chargers.',
        createdBy: admin._id
      },
      {
        name: 'Silicon Hub Tech Park Parking',
        address: '250 Innovation Way, San Jose, CA 95110',
        city: 'San Jose',
        zipCode: '95110',
        coordinates: { lat: 37.3382, lng: -121.8863 },
        location: { type: 'Point', coordinates: [-121.8863, 37.3382] },
        openingHours: '00:00',
        closingHours: '23:59',
        pricePerHour: 40.00,
        numberOfFloors: 4,
        parkingType: 'Covered',
        vehicleTypes: ['Car', 'Bike', 'EV'],
        images: [
          'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=600'
        ],
        description: '24/7 tech park garage with automated barrier gates and high-power DC fast chargers.',
        createdBy: manager._id
      },
      {
        name: 'Metro Terminal North Parking',
        address: '150 Fourth St, San Francisco, CA 94103',
        city: 'San Francisco',
        zipCode: '94103',
        coordinates: { lat: 37.7836, lng: -122.4032 },
        location: { type: 'Point', coordinates: [-122.4032, 37.7836] },
        openingHours: '05:00',
        closingHours: '23:00',
        pricePerHour: 35.00,
        numberOfFloors: 2,
        parkingType: 'Open',
        vehicleTypes: ['Car', 'Bike'],
        images: [
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Convenient open lot next to central transit terminal.',
        createdBy: admin._id
      },
      {
        name: 'Bayview Harbor Underground',
        address: '500 Embarcadero, Oakland, CA 94607',
        city: 'Oakland',
        zipCode: '94607',
        coordinates: { lat: 37.7952, lng: -122.2792 },
        location: { type: 'Point', coordinates: [-122.2792, 37.7952] },
        openingHours: '07:00',
        closingHours: '22:00',
        pricePerHour: 60.00,
        numberOfFloors: 2,
        parkingType: 'Basement',
        vehicleTypes: ['Car', 'EV'],
        images: [
          'https://images.unsplash.com/photo-1512403754473-27855613950f?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Waterfront basement parking facility equipped with elevator access.',
        createdBy: manager._id
      },
      {
        name: 'Civic Center Premium Garage',
        address: '355 McAllister St, San Francisco, CA 94102',
        city: 'San Francisco',
        zipCode: '94102',
        coordinates: { lat: 37.7792, lng: -122.4191 },
        location: { type: 'Point', coordinates: [-122.4191, 37.7792] },
        openingHours: '08:00',
        closingHours: '22:00',
        pricePerHour: 45.00,
        numberOfFloors: 3,
        parkingType: 'Covered',
        vehicleTypes: ['Car', 'Bike', 'EV'],
        images: [
          'https://images.unsplash.com/photo-1506521788701-1e13a700b10a?auto=format&fit=crop&q=80&w=600'
        ],
        description: 'Underground municipal civic center parking.',
        createdBy: admin._id
      }
    ]);

    console.log('Generating 100+ Slots across floors...');
    let globalSlotCount = 0;

    for (const loc of locations) {
      const slotsToCreate = [];

      for (let floor = 1; floor <= loc.numberOfFloors; floor++) {
        const zones = ['A', 'B'];

        for (let i = 1; i <= 10; i++) {
          const zone = zones[Math.floor((i - 1) / 5)];
          const slotNumber = `${zone}-${floor}${i < 10 ? '0' + i : i}`;

          let vehicleType = 'Car';
          if (loc.vehicleTypes.includes('EV') && floor === 1 && i <= 3) {
            vehicleType = 'EV';
          } else if (loc.vehicleTypes.includes('Bike') && i >= 8) {
            vehicleType = 'Bike';
          }

          slotsToCreate.push({
            parkingLocationId: loc._id,
            slotNumber,
            floor,
            parkingZone: zone,
            vehicleType,
            status: 'Available',
            price: vehicleType === 'EV' ? loc.pricePerHour + 15 : loc.pricePerHour,
            createdBy: loc.createdBy
          });
        }
      }

      const createdSlots = await Slot.create(slotsToCreate);
      globalSlotCount += createdSlots.length;
      loc.totalSlots = createdSlots.length;
      await loc.save();
    }

    console.log(`Generated total of ${globalSlotCount} slots across all locations.`);

    console.log('Creating sample bookings and financial records...');
    const firstLoc = locations[0];
    const sampleSlot = await Slot.findOne({ parkingLocationId: firstLoc._id, vehicleType: 'Car' });

    const pastBooking = await Booking.create({
      bookingId: 'PRK-20260810-A99B11',
      userId: user1._id,
      locationId: firstLoc._id,
      slotId: sampleSlot._id,
      vehicleNumber: 'KA-01-AB-1234',
      vehicleType: 'Car',
      bookingDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
      duration: 2,
      amount: 118.00,
      paymentStatus: 'Paid',
      bookingStatus: 'Completed',
      verificationToken: 'token_sample_1234',
      checkInTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      checkOutTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
      qrUrl: 'data:image/png;base64,sample'
    });

    await Payment.create({
      bookingId: pastBooking._id,
      amount: 118.00,
      method: 'SimulatedGateway',
      status: 'Success',
      transactionId: 'TXN-PARKOPS-998811',
      paymentDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    await Notification.create({
      userId: user1._id,
      title: 'Welcome to ParkOps',
      message: 'Your account is active. Explore locations and book parking slots instantly.',
      type: 'SYSTEM'
    });

    console.log('✅ Database Seeding Completed Successfully!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('ADMIN:   admin@parkops.local   / password123');
    console.log('MANAGER: manager@parkops.local / password123');
    console.log('USER:    user@parkops.local    / password123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
