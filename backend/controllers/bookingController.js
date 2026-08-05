const crypto = require('crypto');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const ParkingLocation = require('../models/ParkingLocation');
const Notification = require('../models/Notification');
const { generateBookingQR } = require('../services/qrService');
const { sendBookingConfirmation } = require('../services/emailService');

// Helper to generate human readable booking ID
const generateReadableId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PRK-${dateStr}-${randomStr}`;
};

// @desc    Create a booking reservation
// @route   POST /api/bookings/book
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { locationId, slotId, vehicleNumber, vehicleType, bookingDate, startTime, endTime } = req.body;
    const userId = req.user.id;

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Rule: Booking must be in the future
    if (start <= now) {
      return res.status(400).json({ success: false, message: 'Reservation must start in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // Rule: One user cannot hold multiple active bookings at the same time
    // Active statuses: Pending, Confirmed, Active
    const existingActiveBooking = await Booking.findOne({
      userId,
      bookingStatus: { $in: ['Pending', 'Confirmed', 'Active'] }
    });

    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking reservation. Please complete or cancel it first.',
        booking: existingActiveBooking
      });
    }

    // Verify slot exists and is available
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }
    if (slot.status === 'Disabled') {
      return res.status(400).json({ success: false, message: 'This slot is currently disabled' });
    }

    // Verify location
    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }
    if (location.status === 'Disabled') {
      return res.status(400).json({ success: false, message: 'This parking location is closed' });
    }

    // Rule: Prevent overlapping bookings for the same slot
    // Check if slot has overlapping active bookings
    const overlappingBooking = await Booking.findOne({
      slotId,
      bookingStatus: { $in: ['Pending', 'Confirmed', 'Active'] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already reserved for the selected timing window'
      });
    }

    // Calculate details
    const durationMs = end - start;
    const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));
    
    // Calculate price (use slot price if set, otherwise location price per hour)
    const rate = slot.price !== undefined ? slot.price : location.pricePerHour;
    const amount = parseFloat((durationHours * rate).toFixed(2));

    // Generate validation parameters
    const verificationToken = crypto.randomBytes(16).toString('hex');
    const bookingId = generateReadableId();

    // Create the booking object
    const booking = new Booking({
      bookingId,
      userId,
      locationId,
      slotId,
      vehicleNumber,
      vehicleType,
      bookingDate: new Date(bookingDate),
      startTime: start,
      endTime: end,
      duration: durationHours,
      amount,
      verificationToken,
      bookingStatus: 'Pending', // Pending payment
      paymentStatus: 'Pending'
    });

    // Generate QR code data URL
    const qrUrl = await generateBookingQR({
      bookingId,
      userId,
      slotId,
      verificationToken
    });
    booking.qrUrl = qrUrl;

    await booking.save();

    // Update slot status to Reserved
    slot.status = 'Reserved';
    await slot.save();

    // Send customer alert notification
    await Notification.create({
      userId,
      message: `Reservation ${bookingId} created. Please complete payment to confirm your spot.`,
      type: 'General'
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings (Admin sees all, Customer sees their own)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('locationId', 'name address')
      .populate('slotId', 'slotNumber floor parkingZone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking detail
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('locationId', 'name address coordinates pricePerHour')
      .populate('slotId', 'slotNumber floor parkingZone')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Enforce authorization
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Enforce authorization
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Ensure status is cancelable
    if (['Completed', 'Cancelled', 'Expired', 'Active'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: '${booking.bookingStatus}'`
      });
    }

    booking.bookingStatus = 'Cancelled';
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded';
    }
    await booking.save();

    // Release the associated slot
    const slot = await Slot.findById(booking.slotId);
    if (slot && slot.status === 'Reserved') {
      slot.status = 'Available';
      await slot.save();
    }

    // Notify customer
    await Notification.create({
      userId: booking.userId,
      message: `Your booking reservation ${booking.bookingId} has been cancelled successfully.`,
      type: 'BookingCancelled'
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR code scan (Check-In or Check-Out)
// @route   POST /api/bookings/verify-qr
// @access  Private/Admin
const verifyQR = async (req, res, next) => {
  try {
    const { token, bookingId, slotId } = req.body;

    const booking = await Booking.findOne({ bookingId })
      .populate('userId', 'name email')
      .populate('locationId', 'name')
      .populate('slotId', 'slotNumber floor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.verificationToken !== token || booking.slotId._id.toString() !== slotId) {
      return res.status(400).json({ success: false, message: 'Invalid ticket scan payload' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Associated slot not found' });
    }

    // Handle check-in
    if (booking.bookingStatus === 'Confirmed') {
      // Check in
      booking.bookingStatus = 'Active';
      booking.checkInTime = new Date();
      await booking.save();

      slot.status = 'Occupied';
      await slot.save();

      // Notify customer
      await Notification.create({
        userId: booking.userId._id,
        message: `Welcome! Checked in successfully for booking ${booking.bookingId} at slot ${slot.slotNumber}.`,
        type: 'General'
      });

      return res.status(200).json({
        success: true,
        action: 'CHECK_IN',
        message: `Successfully checked in user ${booking.userId.name} to slot ${slot.slotNumber} (Floor ${slot.floor})`,
        data: booking
      });
    }

    // Handle check-out
    if (booking.bookingStatus === 'Active') {
      // Check out
      booking.bookingStatus = 'Completed';
      booking.checkOutTime = new Date();
      await booking.save();

      slot.status = 'Available';
      await slot.save();

      // Notify customer
      await Notification.create({
        userId: booking.userId._id,
        message: `Checked out successfully for booking ${booking.bookingId}. Thank you!`,
        type: 'General'
      });

      return res.status(200).json({
        success: true,
        action: 'CHECK_OUT',
        message: `Successfully checked out user ${booking.userId.name} from slot ${slot.slotNumber}. Slot is now vacant.`,
        data: booking
      });
    }

    // Already checked out or canceled states
    return res.status(400).json({
      success: false,
      message: `Invalid check operation. Ticket status is currently: '${booking.bookingStatus}'`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  verifyQR
};
