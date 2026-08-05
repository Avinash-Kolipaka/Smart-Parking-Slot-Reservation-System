const crypto = require('crypto');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Slot = require('../models/Slot');
const { sendBookingConfirmation } = require('../services/emailService');

// @desc    Process simulated mock payment
// @route   POST /api/payment
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('locationId', 'name')
      .populate('slotId', 'slotNumber floor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reservation not found' });
    }

    // Check authorization
    if (booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'Booking has already been paid for' });
    }

    if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Expired') {
      return res.status(400).json({ success: false, message: 'Cannot pay for a cancelled or expired booking' });
    }

    // Simulate payment transaction details
    const transactionId = `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    // Create payment entry
    const payment = await Payment.create({
      bookingId: booking._id,
      amount: booking.amount,
      method: paymentMethod || 'MockGateway',
      status: 'Success',
      transactionId,
      paymentDate: new Date()
    });

    // Update booking fields
    booking.paymentStatus = 'Paid';
    booking.bookingStatus = 'Confirmed';
    await booking.save();

    // Ensure slot status is set to Reserved
    const slot = await Slot.findById(booking.slotId._id);
    if (slot) {
      slot.status = 'Reserved';
      await slot.save();
    }

    // Send confirmation notifications
    await Notification.create({
      userId: booking.userId._id,
      message: `Payment of $${booking.amount.toFixed(2)} successful for ticket ${booking.bookingId}. Your slot is confirmed!`,
      type: 'PaymentSuccess'
    });

    // Send styled confirmation email
    const timeFormatted = `${booking.startTime.toLocaleString()} to ${booking.endTime.toLocaleString()}`;
    await sendBookingConfirmation(
      booking.userId.email,
      booking.userId.name,
      {
        bookingId: booking.bookingId,
        locationName: booking.locationId.name,
        slotNumber: booking.slotId.slotNumber,
        floor: booking.slotId.floor,
        vehicleNumber: booking.vehicleNumber,
        vehicleType: booking.vehicleType,
        time: timeFormatted,
        duration: booking.duration,
        amount: booking.amount
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        payment,
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history (Admin gets all, User gets their own)
// @route   GET /api/payment/history
// @access  Private
const getPaymentHistory = async (req, res, next) => {
  try {
    let query = {};
    
    if (req.user.role !== 'admin') {
      // Find bookings of this user
      const userBookings = await Booking.find({ userId: req.user.id }).select('_id');
      const bookingIds = userBookings.map(b => b._id);
      query.bookingId = { $in: bookingIds };
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'bookingId',
        select: 'bookingId vehicleNumber startTime endTime duration amount',
        populate: [
          { path: 'locationId', select: 'name address' },
          { path: 'slotId', select: 'slotNumber floor' }
        ]
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processPayment,
  getPaymentHistory
};
