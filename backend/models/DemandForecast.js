const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema({
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
  targetDate: {
    type: Date, // The future date being predicted
    required: true
  },
  granularity: {
    type: String,
    enum: ['hourly', 'daily'],
    default: 'hourly'
  },
  forecast: {
    predictions: [{
      time: { type: Date, required: true },
      expectedOccupancyRate: { type: Number, required: true }, // e.g., 85 for 85%
      expectedRevenue: { type: Number, default: 0 } // Expected revenue for that hour based on occupancy and pricing
    }],
    expectedPeakTime: {
      type: Date
    },
    predictionVersion: {
      type: String,
      default: 'v1'
    },
    actualOccupancy: {
      type: Number, // to be updated later when reality catches up
    }
  },
  confidenceScore: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  historicalSampleSize: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// For querying a location's future forecast
demandForecastSchema.index({ parkingId: 1, targetDate: 1, granularity: 1 });

module.exports = mongoose.model('DemandForecast', demandForecastSchema);
