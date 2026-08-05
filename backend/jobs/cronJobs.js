const cron = require('node-cron');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Notification = require('../models/Notification');

const initCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Running background cron jobs: Checking for expired booking reservations...');

    try {
      const now = new Date();
      
      // 1. Expire Confirmed Bookings (paid) if check-in is overdue by 15 minutes
      const gracePeriodMs = 15 * 60 * 1000;
      const overdueTime = new Date(now.getTime() - gracePeriodMs);

      const overdueConfirmedBookings = await Booking.find({
        bookingStatus: 'Confirmed',
        startTime: { $lt: overdueTime }
      });

      for (const booking of overdueConfirmedBookings) {
        booking.bookingStatus = 'Expired';
        await booking.save();

        // Release the slot
        const slot = await Slot.findById(booking.slotId);
        if (slot && slot.status === 'Reserved') {
          slot.status = 'Available';
          await slot.save();
        }

        // Notify user
        await Notification.create({
          userId: booking.userId,
          message: `Your booking reservation ${booking.bookingId} has expired as you did not check in within the 15-minute grace period.`,
          type: 'BookingExpired'
        });

        console.log(`Booking ID ${booking.bookingId} expired (Check-in overdue)`);
      }

      // 2. Expire Pending Bookings (unpaid) 15 minutes after booking creation
      const unpaidOverdueTime = new Date(now.getTime() - gracePeriodMs);
      
      const overdueUnpaidBookings = await Booking.find({
        bookingStatus: 'Pending',
        createdAt: { $lt: unpaidOverdueTime }
      });

      for (const booking of overdueUnpaidBookings) {
        booking.bookingStatus = 'Expired';
        await booking.save();

        // Release the slot
        const slot = await Slot.findById(booking.slotId);
        if (slot && slot.status === 'Reserved') {
          slot.status = 'Available';
          await slot.save();
        }

        // Notify user
        await Notification.create({
          userId: booking.userId,
          message: `Your booking reservation ${booking.bookingId} has expired due to unpaid status.`,
          type: 'BookingExpired'
        });

        console.log(`Booking ID ${booking.bookingId} expired (Payment overdue)`);
      }

    } catch (error) {
      console.error('Error executing cron jobs:', error.message);
    }
  });
};

module.exports = initCronJobs;
