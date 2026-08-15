const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },
    bookingId: {
      type: String,
      unique: true,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingLocation',
      required: true
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: true
    },
    vehicleNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    vehicleType: {
      type: String,
      enum: ['Car', 'Bike', 'EV'],
      required: true
    },
    bookingDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // In hours
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Expired'],
      default: 'Pending'
    },
    verificationToken: {
      type: String,
      required: true
    },
    qrUrl: {
      type: String // Stores the generated Base64 data URL or Cloudinary URL
    },
    checkInTime: {
      type: Date
    },
    checkOutTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for fast user booking lookups and status filtering
BookingSchema.index({ userId: 1, bookingStatus: 1 });
// Index for tenant-scoped queries
BookingSchema.index({ tenantId: 1, bookingStatus: 1 });
// Critical compound index for double-booking overlap check
BookingSchema.index({ slotId: 1, bookingStatus: 1, startTime: 1, endTime: 1 });
// Index for booking expiration job
BookingSchema.index({ bookingStatus: 1, endTime: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
