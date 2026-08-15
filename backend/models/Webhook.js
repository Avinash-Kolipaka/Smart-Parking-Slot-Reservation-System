const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  url: { type: String, required: true },
  secret: { type: String, required: true }, // For HMAC signing
  events: [{ type: String }], // e.g., 'booking.created', 'payment.success'
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

webhookSchema.index({ tenantId: 1 });

module.exports = mongoose.model('Webhook', webhookSchema);
