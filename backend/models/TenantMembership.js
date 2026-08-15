const mongoose = require('mongoose');

const tenantMembershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  role: {
    type: String,
    enum: [
      'TENANT_OWNER',
      'TENANT_ADMIN',
      'PARKING_MANAGER',
      'PARKING_OPERATOR',
      'SECURITY_OPERATOR',
      'FINANCE_MANAGER',
      'STAFF'
    ],
    default: 'STAFF'
  },
  permissions: [{ type: String }], // Optional granular permission overrides
  status: {
    type: String,
    enum: ['ACTIVE', 'INVITED', 'SUSPENDED'],
    default: 'INVITED'
  },
  joinedAt: {
    type: Date
  }
}, { timestamps: true });

tenantMembershipSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
tenantMembershipSchema.index({ tenantId: 1 });

module.exports = mongoose.model('TenantMembership', tenantMembershipSchema);
