const mongoose = require('mongoose');

const parkingAnalyticsSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  granularity: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    required: true
  },
  metrics: {
    totalBookings: { type: Number, default: 0 },
    successfulBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageOccupancyRate: { type: Number, default: 0 }, // percentage 0-100
    peakOccupancyRate: { type: Number, default: 0 },
    averageDurationMinutes: { type: Number, default: 0 },
    vehicleDistribution: {
      CAR: { type: Number, default: 0 },
      BIKE: { type: Number, default: 0 },
      EV: { type: Number, default: 0 },
      TRUCK: { type: Number, default: 0 }
    }
  },
  // Used for idempotency when background jobs run
  aggregationId: {
    type: String,
    unique: true,
    required: true // e.g., "hourly-parkingId-2026-08-11T09:00:00Z"
  }
}, { timestamps: true });

// Indexes for fast dashboard querying
parkingAnalyticsSchema.index({ parkingId: 1, granularity: 1, date: -1 });

module.exports = mongoose.model('ParkingAnalytics', parkingAnalyticsSchema);
