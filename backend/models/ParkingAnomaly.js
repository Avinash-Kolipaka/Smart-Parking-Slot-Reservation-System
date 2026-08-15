const mongoose = require('mongoose');

const parkingAnomalySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLocation'
  },
  anomalyType: {
    type: String,
    enum: ['REVENUE_SPIKE', 'REVENUE_DROP', 'BOOKING_SPIKE', 'BOOKING_DROP', 'CANCELLATION_SPIKE', 'LOW_OCCUPANCY', 'HIGH_OCCUPANCY'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  description: {
    type: String,
    required: true
  },
  anomalyScore: {
    type: Number,
    required: true // e.g. 2.8 for 2.8x variance
  },
  detectedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'],
    default: 'OPEN'
  },
  metricsContext: {
    expectedValue: { type: Number },
    actualValue: { type: Number }
  },
  possibleReason: { type: String },
  recommendation: { type: String }
}, { timestamps: true });

parkingAnomalySchema.index({ status: 1, detectedAt: -1 });
parkingAnomalySchema.index({ parkingId: 1, status: 1 });

module.exports = mongoose.model('ParkingAnomaly', parkingAnomalySchema);
