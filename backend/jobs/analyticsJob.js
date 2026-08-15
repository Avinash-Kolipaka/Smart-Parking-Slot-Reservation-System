const cron = require('node-cron');
const Booking = require('../models/Booking');
const ParkingAnalytics = require('../models/ParkingAnalytics');
const ParkingLocation = require('../models/ParkingLocation');
const logger = require('../utils/logger');

/**
 * Aggregates bookings for a specific day and parking location into ParkingAnalytics
 */
const aggregateDailyAnalytics = async (date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const parkingLocations = await ParkingLocation.find({}, '_id');

    for (const parking of parkingLocations) {
      const aggregationId = `daily-${parking._id}-${startOfDay.toISOString()}`;

      // Calculate bookings in this range
      const bookings = await Booking.find({
        parkingLocation: parking._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }).populate('slot');

      let successfulBookings = 0;
      let cancelledBookings = 0;
      let revenue = 0;
      let totalDurationMinutes = 0;
      const vehicleDistribution = { CAR: 0, BIKE: 0, EV: 0, TRUCK: 0 };

      for (const booking of bookings) {
        if (booking.status === 'CANCELLED') {
          cancelledBookings++;
        } else {
          successfulBookings++;
          revenue += booking.totalAmount || 0;
          
          if (booking.vehicleType && vehicleDistribution[booking.vehicleType] !== undefined) {
            vehicleDistribution[booking.vehicleType]++;
          }

          if (booking.startTime && booking.endTime) {
            const diffMs = booking.endTime - booking.startTime;
            totalDurationMinutes += Math.floor(diffMs / 60000);
          }
        }
      }

      const totalBookings = bookings.length;
      const averageDurationMinutes = successfulBookings > 0 ? totalDurationMinutes / successfulBookings : 0;

      // Upsert the analytics record (Idempotent)
      await ParkingAnalytics.findOneAndUpdate(
        { aggregationId },
        {
          parkingId: parking._id,
          date: startOfDay,
          granularity: 'daily',
          metrics: {
            totalBookings,
            successfulBookings,
            cancelledBookings,
            revenue,
            averageDurationMinutes,
            vehicleDistribution
          }
        },
        { upsert: true, new: true }
      );
    }

    logger.info(`Daily analytics aggregation completed for ${startOfDay.toISOString()}`);
  } catch (error) {
    logger.error('Error running daily analytics aggregation:', error);
  }
};

// Schedule to run every day at 00:30 UTC to aggregate the previous day
const startAnalyticsJob = () => {
  cron.schedule('30 0 * * *', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    aggregateDailyAnalytics(yesterday);
  });

  // Schedule to run hourly to aggregate predictions
  cron.schedule('0 * * * *', async () => {
    const { generateHourlyPredictions } = require('../services/analytics/predictionService');
    try {
      const parkingLocations = await ParkingLocation.find({}, '_id tenantId');
      for (const parking of parkingLocations) {
        await generateHourlyPredictions(parking._id, parking.tenantId, 12);
      }
      logger.info('Hourly predictions generated successfully.');
    } catch (error) {
      logger.error('Error in hourly prediction job:', error);
    }
  });
};

module.exports = {
  aggregateDailyAnalytics,
  startAnalyticsJob
};
