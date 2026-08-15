const cron = require('node-cron');
const ParkingAnalytics = require('../models/ParkingAnalytics');
const DemandForecast = require('../models/DemandForecast');
const ParkingLocation = require('../models/ParkingLocation');
const logger = require('../utils/logger');

/**
 * Baseline forecasting using simple historical moving average.
 * In a real-world scenario, this could be replaced with an ML model or call to an AI service.
 */
const generateForecast = async (targetDate) => {
  try {
    const startOfTargetDay = new Date(targetDate);
    startOfTargetDay.setUTCHours(0, 0, 0, 0);

    const parkingLocations = await ParkingLocation.find({}, '_id');

    for (const parking of parkingLocations) {
      // Get the last 30 days of analytics for this location
      const thirtyDaysAgo = new Date(startOfTargetDay);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const historicalData = await ParkingAnalytics.find({
        parkingId: parking._id,
        granularity: 'daily',
        date: { $gte: thirtyDaysAgo, $lt: startOfTargetDay }
      });

      const sampleSize = historicalData.length;
      let expectedBookings = 0;
      let confidence = 'Low';

      if (sampleSize > 0) {
        // Simple moving average
        const totalHistoricalBookings = historicalData.reduce((sum, record) => sum + record.metrics.successfulBookings, 0);
        expectedBookings = Math.round(totalHistoricalBookings / sampleSize);

        if (sampleSize >= 21) {
          confidence = 'High';
        } else if (sampleSize >= 7) {
          confidence = 'Medium';
        }
      }

      // Upsert the forecast
      await DemandForecast.findOneAndUpdate(
        {
          parkingId: parking._id,
          targetDate: startOfTargetDay,
          granularity: 'daily'
        },
        {
          forecast: {
            expectedBookings,
            expectedOccupancyRate: 0 // Mocked for baseline. To calculate accurately, we'd need total slots capacity vs bookings
          },
          confidenceScore: confidence,
          historicalSampleSize: sampleSize,
          generatedAt: new Date()
        },
        { upsert: true }
      );
    }

    logger.info(`Demand forecast generated for ${startOfTargetDay.toISOString()}`);
  } catch (error) {
    logger.error('Error running demand forecast job:', error);
  }
};

// Run daily at 01:00 UTC to forecast the next 7 days
const startForecastJob = () => {
  cron.schedule('0 1 * * *', async () => {
    logger.info('Starting weekly rolling forecast generation...');
    for (let i = 0; i < 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      await generateForecast(futureDate);
    }
  });
};

module.exports = {
  generateForecast,
  startForecastJob
};
