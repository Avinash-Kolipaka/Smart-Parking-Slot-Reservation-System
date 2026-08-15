const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    resource: {
      type: String,
      trim: true
    },
    resourceId: {
      type: String,
      trim: true
    },
    details: {
      type: String,
      trim: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AdminLog', AdminLogSchema);
