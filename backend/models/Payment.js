const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    method: {
      type: String,
      enum: ['Card', 'UPI', 'NetBanking', 'MockGateway', 'SimulatedGateway'],
      default: 'MockGateway'
    },
    status: {
      type: String,
      enum: ['Pending', 'Success', 'Failed'],
      default: 'Pending'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

PaymentSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
