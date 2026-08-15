const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // The admin who requested it
  },
  reportType: {
    type: String,
    enum: ['DAILY_OPERATIONS', 'WEEKLY_OPERATIONS', 'MONTHLY_REVENUE', 'CUSTOM'],
    required: true
  },
  format: {
    type: String,
    enum: ['PDF', 'CSV'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  fileUrl: {
    type: String // Cloudinary or S3 URL for download
  },
  dateRange: {
    start: { type: Date },
    end: { type: Date }
  },
  errorMessage: {
    type: String
  },
  expiresAt: {
    type: Date // For automatic cleanup of old reports
  }
}, { timestamps: true });

// Auto expire document after expiresAt is reached
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Report', reportSchema);
