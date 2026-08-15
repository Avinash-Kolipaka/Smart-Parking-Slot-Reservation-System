const cron = require('node-cron');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Notification = require('../models/Notification');
const { notifySlotUpdate, notifyBookingEvent } = require('../config/socket');
const logger = require('../utils/logger');
const { startAnalyticsJob } = require('./analyticsJob');
const { startForecastJob } = require('./forecastJob');
const { startReportJob } = require('./reportJob');

const initCronJobs = () => {
  // Mount intelligence and background aggregation jobs
  startAnalyticsJob();
  startForecastJob();
  startReportJob();

  // Run every minute safely
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const gracePeriodMs = 15 * 60 * 1000;
      const overdueTime = new Date(now.getTime() - gracePeriodMs);

      // 1. Expire Confirmed Bookings (paid) if check-in is overdue by 15 minutes
      const overdueConfirmedBookings = await Booking.find({
        bookingStatus: 'Confirmed',
        startTime: { $lt: overdueTime }
      });

      for (const booking of overdueConfirmedBookings) {
        booking.bookingStatus = 'Expired';
        await booking.save();

        const slot = await Slot.findById(booking.slotId);
        if (slot && slot.status === 'Reserved') {
          slot.status = 'Available';
          await slot.save();
          notifySlotUpdate(booking.locationId, { slotId: slot._id, status: 'Available' });
        }

        notifyBookingEvent('expired', booking);

        await Notification.create({
          userId: booking.userId,
          title: 'Booking Expired',
          message: `Your booking reservation ${booking.bookingId} has expired as you did not check in within the 15-minute grace period.`,
          type: 'BOOKING_EXPIRED'
        });

        logger.info(`Booking ID ${booking.bookingId} expired (Check-in overdue)`);
      }

      // 2. Expire Pending Bookings (unpaid) 15 minutes after creation
      const overdueUnpaidBookings = await Booking.find({
        bookingStatus: 'Pending',
        createdAt: { $lt: overdueTime }
      });

      for (const booking of overdueUnpaidBookings) {
        booking.bookingStatus = 'Expired';
        await booking.save();

        const slot = await Slot.findById(booking.slotId);
        if (slot && slot.status === 'Reserved') {
          slot.status = 'Available';
          await slot.save();
          notifySlotUpdate(booking.locationId, { slotId: slot._id, status: 'Available' });
        }

        notifyBookingEvent('expired', booking);

        await Notification.create({
          userId: booking.userId,
          title: 'Booking Expired',
          message: `Your booking reservation ${booking.bookingId} has expired due to pending payment.`,
          type: 'BOOKING_EXPIRED'
        });

        logger.info(`Booking ID ${booking.bookingId} expired (Payment overdue)`);
      }
    } catch (error) {
      logger.error(`Error executing background cron jobs: ${error.message}`);
    }
  });
};

module.exports = initCronJobs;
