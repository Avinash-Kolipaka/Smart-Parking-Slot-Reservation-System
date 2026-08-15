const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
    required: true
  },
  status: {
    type: String,
    enum: ['TRIALING', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED'],
    default: 'TRIALING'
  },
  billingCycle: {
    type: String,
    enum: ['MONTHLY', 'ANNUAL']
  },
  startDate: { type: Date },
  renewalDate: { type: Date },
  limits: {
    maxLocations: { type: Number, default: 1 },
    maxSlots: { type: Number, default: 50 },
    maxUsers: { type: Number, default: 5 }
  },
  usage: {
    currentLocations: { type: Number, default: 0 },
    currentSlots: { type: Number, default: 0 },
    currentUsers: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
