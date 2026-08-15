const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      default: 'Notification'
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'BOOKING_STARTING', 'BOOKING_EXPIRED', 
        'CHECK_IN', 'CHECK_OUT', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SYSTEM',
        'BookingConfirmed', 'BookingCancelled', 'BookingAboutToStart', 'BookingExpired', 'PaymentSuccess', 'LocationClosed', 'General'
      ],
      default: 'SYSTEM'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
