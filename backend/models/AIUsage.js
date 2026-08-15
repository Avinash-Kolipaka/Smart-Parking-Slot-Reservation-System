const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  question: {
    type: String
  },
  tokensUsed: {
    type: Number,
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  toolsUsed: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['SUCCESS', 'ERROR', 'RATE_LIMITED'],
    default: 'SUCCESS'
  }
}, { timestamps: true });

aiUsageSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('AIUsage', aiUsageSchema);
