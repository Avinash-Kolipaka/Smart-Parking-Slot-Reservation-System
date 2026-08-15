require('dotenv').config();
const mongoose = require('mongoose');

// Define minimal schemas for checking consistency
const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' },
  slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
  status: String,
  startTime: Date,
  endTime: Date
});

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  status: String
});

const slotSchema = new mongoose.Schema({
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' }
});

const Booking = mongoose.model('Booking', bookingSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Slot = mongoose.model('Slot', slotSchema);

async function runAudit() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('Missing MONGO_URI environment variable.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  await mongoose.connect(uri);
  console.log('Connected. Running Data Consistency Audit...\n');

  let anomaliesFound = 0;

  // 1. Check for payments without bookings (or orphaned bookings)
  console.log('1. Checking for payments referencing non-existent bookings...');
  const payments = await Payment.find();
  for (const payment of payments) {
    if (payment.booking) {
      const bookingExists = await Booking.exists({ _id: payment.booking });
      if (!bookingExists) {
        console.error(`❌ Anomaly: Payment ${payment._id} references missing Booking ${payment.booking}`);
        anomaliesFound++;
      }
    }
  }

  // 2. Check for overlapping active bookings in the same slot
  console.log('2. Checking for overlapping active bookings (double booking)...');
  const activeBookings = await Booking.find({ status: { $in: ['confirmed', 'active'] } }).lean();
  
  for (let i = 0; i < activeBookings.length; i++) {
    for (let j = i + 1; j < activeBookings.length; j++) {
      const b1 = activeBookings[i];
      const b2 = activeBookings[j];

      // If same slot
      if (b1.slot && b2.slot && b1.slot.toString() === b2.slot.toString()) {
        // Check time overlap
        if (b1.startTime < b2.endTime && b1.endTime > b2.startTime) {
          console.error(`❌ Anomaly: Double Booking detected for Slot ${b1.slot}. Bookings: ${b1._id} and ${b2._id}`);
          anomaliesFound++;
        }
      }
    }
  }

  // 3. Check for slots referencing missing parking
  console.log('3. Checking for orphaned slots...');
  const slots = await Slot.find();
  for (const slot of slots) {
    if (slot.parking) {
      const parkingExists = await mongoose.connection.db.collection('parkings').findOne({ _id: slot.parking });
      if (!parkingExists) {
        console.error(`❌ Anomaly: Slot ${slot._id} references missing Parking ${slot.parking}`);
        anomaliesFound++;
      }
    }
  }

  console.log('\n--- Audit Complete ---');
  if (anomaliesFound === 0) {
    console.log('✅ PASS: No data consistency anomalies found.');
  } else {
    console.log(`⚠️ FAIL: Found ${anomaliesFound} anomalies. Check logs above.`);
  }

  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
