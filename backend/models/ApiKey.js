const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  name: { type: String, required: true },
  keyHash: { type: String, required: true }, // Hashed API key
  scopes: [{ type: String }], // e.g., 'parking:read', 'booking:create'
  expiresAt: { type: Date },
  lastUsedAt: { type: Date },
  revoked: { type: Boolean, default: false }
}, { timestamps: true });

apiKeySchema.index({ tenantId: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
