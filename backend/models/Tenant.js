const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  legalName: { type: String },
  email: { type: String },
  phone: { type: String },
  branding: {
    logo: { type: String },
    primaryColor: { type: String, default: '#000000' },
    secondaryColor: { type: String, default: '#ffffff' },
    supportEmail: { type: String },
    customFooter: { type: String }
  },
  settings: {
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'USD' },
    taxEnabled: { type: Boolean, default: false },
    taxName: { type: String },
    taxPercentage: { type: Number, default: 0 },
    bookingDurationLimitHours: { type: Number, default: 24 }
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'],
    default: 'TRIAL'
  },
  plan: {
    type: String,
    enum: ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'],
    default: 'FREE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
