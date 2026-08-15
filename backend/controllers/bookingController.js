const crypto = require('crypto');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const ParkingLocation = require('../models/ParkingLocation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateBookingQR, verifyQRPayload } = require('../services/qrService');
const { calculatePricing } = require('../services/pricingService');
const { lockSlotForBooking, releaseSlotLock } = require('../services/slotLockService');
const { notifySlotUpdate, notifyBookingEvent } = require('../config/socket');
const {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendCheckInNotification,
  sendCheckOutNotification
} = require('../services/emailService');
const logger = require('../utils/logger');

const generateReadableId = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PRK-${dateStr}-${randomStr}`;
};

// @desc    Create a booking reservation
// @route   POST /api/bookings/book
// @access  Private
const createBooking = async (req, res, next) => {
  let lockKey = null;
  try {
    const {
      locationId,
      slotId,
      vehicleNumber,
      vehicleType,
      bookingDate,
      startTime,
      endTime,
      isEVChargingRequested,
      discountCode
    } = req.body;

    const userId = req.user.id;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({ success: false, message: 'Reservation must start in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    // Check user's active bookings
    const existingActiveBooking = await Booking.findOne({
      userId,
      bookingStatus: { $in: ['Pending', 'Confirmed', 'Active'] }
    });

    if (existingActiveBooking) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active booking reservation. Please complete or cancel it first.',
        data: existingActiveBooking
      });
    }

    // Verify slot
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Parking slot not found' });
    }
    if (['Disabled', 'Maintenance'].includes(slot.status)) {
      return res.status(400).json({ success: false, message: `This slot is currently ${slot.status.toLowerCase()}` });
    }

    // Check vehicle type compatibility
    if (slot.vehicleType === 'EV' && vehicleType !== 'EV') {
      return res.status(400).json({ success: false, message: 'This slot is reserved strictly for Electric Vehicles (EV).' });
    }

    // Verify location
    const location = await ParkingLocation.findById(locationId);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Parking location not found' });
    }
    if (location.status === 'Disabled') {
      return res.status(400).json({ success: false, message: 'This parking location is currently closed' });
    }

    // Acquire atomic Redis slot lock for double-booking prevention
    lockKey = await lockSlotForBooking(slotId, startTime, endTime, 30);
    if (!lockKey) {
      return res.status(409).json({
        success: false,
        message: 'This slot is currently being locked by another transaction. Please try again.',
        errorCode: 'SLOT_LOCKED'
      });
    }

    // Check database overlap
    const overlappingBooking = await Booking.findOne({
      slotId,
      bookingStatus: { $in: ['Pending', 'Confirmed', 'Active'] },
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (overlappingBooking) {
      await releaseSlotLock(lockKey);
      return res.status(400).json({
        success: false,
        message: 'This slot is already reserved for the selected timing window',
        errorCode: 'SLOT_OVERLAP'
      });
    }

    // Calculate pricing on backend
    const basePrice = slot.price !== undefined && slot.price > 0 ? slot.price : location.pricePerHour;
    const pricing = calculatePricing({
      basePricePerHour: basePrice,
      startTime: start,
      endTime: end,
      vehicleType,
      isEVChargingRequested,
      discountCode
    });

    const verificationToken = crypto.randomBytes(16).toString('hex');
    const bookingId = generateReadableId();

    const booking = new Booking({
      bookingId,
      userId,
      locationId,
      slotId,
      vehicleNumber,
      vehicleType,
      bookingDate: new Date(bookingDate || start),
      startTime: start,
      endTime: end,
      duration: pricing.durationHours,
      amount: pricing.finalAmount,
      verificationToken,
      bookingStatus: 'Pending',
      paymentStatus: 'Pending'
    });

    const qrUrl = await generateBookingQR({
      bookingId,
      userId,
      slotId,
      verificationToken
    });
    booking.qrUrl = qrUrl;

    await booking.save();

    slot.status = 'Reserved';
    await slot.save();

    // Release temporary Redis lock after DB persist
    await releaseSlotLock(lockKey);

    // Socket.io event & Notification
    notifySlotUpdate(locationId, { slotId: slot._id, status: 'Reserved' });
    notifyBookingEvent('created', booking);

    await Notification.create({
      userId,
      title: 'Reservation Created',
      message: `Reservation ${bookingId} created. Complete payment to confirm your spot.`,
      type: 'BOOKING_STARTING'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    if (lockKey) await releaseSlotLock(lockKey);
    next(error);
  }
};

// @desc    Get bookings (Admin/Managers see all, Customer sees their own)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    const userRole = (req.user.role || '').toUpperCase();
    if (!['ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER'].includes(userRole)) {
      query.userId = req.user.id;
    }

    if (req.query.status) {
      query.bookingStatus = req.query.status;
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('locationId', 'name address city')
      .populate('slotId', 'slotNumber floor parkingZone vehicleType')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Bookings fetched successfully',
      data: {
        bookings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
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
      .populate('slotId', 'slotNumber floor parkingZone vehicleType')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER'].includes(userRole);
    if (!isAdmin && booking.userId._id.toString() !== req.user.id) {
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

    const userRole = (req.user.role || '').toUpperCase();
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER'].includes(userRole);
    if (!isAdmin && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

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

    const slot = await Slot.findById(booking.slotId);
    if (slot && slot.status === 'Reserved') {
      slot.status = 'Available';
      await slot.save();
      notifySlotUpdate(booking.locationId, { slotId: slot._id, status: 'Available' });
    }

    notifyBookingEvent('cancelled', booking);

    await Notification.create({
      userId: booking.userId,
      title: 'Booking Cancelled',
      message: `Your booking reservation ${booking.bookingId} has been cancelled successfully.`,
      type: 'BOOKING_CANCELLED'
    });

    const user = await User.findById(booking.userId);
    if (user && user.email) {
      sendBookingCancellation(user.email, user.name, booking.bookingId).catch(err => logger.error(`Email error: ${err.message}`));
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in user via QR scan or Booking ID
// @route   POST /api/bookings/:id/check-in
// @access  Private/Admin
const checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('locationId', 'name')
      .populate('slotId', 'slotNumber floor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'Confirmed') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in. Current booking status is '${booking.bookingStatus}' (Must be 'Confirmed')`
      });
    }

    booking.bookingStatus = 'Active';
    booking.checkInTime = new Date();
    await booking.save();

    const slot = await Slot.findById(booking.slotId._id);
    if (slot) {
      slot.status = 'Occupied';
      await slot.save();
      notifySlotUpdate(booking.locationId._id, { slotId: slot._id, status: 'Occupied' });
    }

    notifyBookingEvent('checked-in', booking);

    await Notification.create({
      userId: booking.userId._id,
      title: 'Check-In Confirmed',
      message: `Checked in successfully for booking ${booking.bookingId} at slot ${slot ? slot.slotNumber : ''}.`,
      type: 'CHECK_IN'
    });

    sendCheckInNotification(
      booking.userId.email,
      booking.userId.name,
      booking.bookingId,
      booking.checkInTime.toLocaleTimeString()
    ).catch(err => logger.error(`Email error: ${err.message}`));

    res.status(200).json({
      success: true,
      message: `Successfully checked in user ${booking.userId.name}`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out user and calculate actual billing
// @route   POST /api/bookings/:id/check-out
// @access  Private/Admin
const checkOutBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('locationId', 'name pricePerHour')
      .populate('slotId', 'slotNumber floor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out. Current booking status is '${booking.bookingStatus}' (Must be 'Active')`
      });
    }

    const checkOutTime = new Date();
    booking.checkOutTime = checkOutTime;
    booking.bookingStatus = 'Completed';

    // Calculate overstay surcharges if actual stay exceeded reserved end time by > 15 mins
    const reservedEndTime = new Date(booking.endTime);
    if (checkOutTime > reservedEndTime) {
      const overstayMs = checkOutTime.getTime() - reservedEndTime.getTime();
      const overstayHours = Math.ceil(overstayMs / (1000 * 60 * 60));
      if (overstayHours > 0) {
        const extraCharge = overstayHours * (booking.locationId.pricePerHour || 50);
        booking.amount = Math.round((booking.amount + extraCharge) * 100) / 100;
      }
    }

    await booking.save();

    const slot = await Slot.findById(booking.slotId._id);
    if (slot) {
      slot.status = 'Available';
      await slot.save();
      notifySlotUpdate(booking.locationId._id, { slotId: slot._id, status: 'Available' });
    }

    notifyBookingEvent('checked-out', booking);

    await Notification.create({
      userId: booking.userId._id,
      title: 'Check-Out Completed',
      message: `Checked out successfully for booking ${booking.bookingId}. Final Amount: ₹${booking.amount}`,
      type: 'CHECK_OUT'
    });

    sendCheckOutNotification(
      booking.userId.email,
      booking.userId.name,
      booking.bookingId,
      checkOutTime.toLocaleTimeString(),
      booking.amount
    ).catch(err => logger.error(`Email error: ${err.message}`));

    res.status(200).json({
      success: true,
      message: `Successfully checked out user ${booking.userId.name}`,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify QR payload
// @route   POST /api/bookings/verify-qr
// @access  Private/Admin
const verifyQR = async (req, res, next) => {
  try {
    const { token, bookingId, slotId, qrPayload } = req.body;

    let targetBookingId = bookingId;
    let targetSlotId = slotId;
    let targetToken = token;

    if (qrPayload) {
      const verification = verifyQRPayload(qrPayload);
      if (!verification.valid) {
        return res.status(400).json({ success: false, message: verification.message });
      }
      targetBookingId = verification.payload.bookingId;
      targetSlotId = verification.payload.slotId;
      targetToken = verification.payload.token;
    }

    const booking = await Booking.findOne({ bookingId: targetBookingId })
      .populate('userId', 'name email')
      .populate('locationId', 'name')
      .populate('slotId', 'slotNumber floor');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.verificationToken !== targetToken) {
      return res.status(400).json({ success: false, message: 'Invalid QR verification token' });
    }

    res.status(200).json({
      success: true,
      message: 'QR Code verified successfully',
      data: booking
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
  checkInBooking,
  checkOutBooking,
  verifyQR
};
