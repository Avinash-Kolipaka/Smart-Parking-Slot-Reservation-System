const DemandForecast = require('../../models/DemandForecast');
const ParkingAnalytics = require('../../models/ParkingAnalytics');
const ParkingLocation = require('../../models/ParkingLocation');
const Slot = require('../../models/Slot');
const logger = require('../../utils/logger');
const { redisClient, isRedisConnected } = require('../../config/redisClient');

/**
 * Generate predictions for the next N hours
 */
const generateHourlyPredictions = async (parkingId, tenantId, hoursAhead = 12) => {
  try {
    const predictions = [];
    let expectedPeakTime = null;
    let maxOccupancy = -1;
    let totalExpectedRevenue = 0;

    const location = await ParkingLocation.findById(parkingId);
    if (!location) return null;

    // Estimate total capacity
    const slots = await Slot.find({ parkingId: parkingId, status: { $ne: 'MAINTENANCE' } });
    const totalCapacity = slots.length || 100; // fallback if no slots setup
    const averagePrice = location.pricingRules?.basePrice || 10;

    for (let i = 1; i <= hoursAhead; i++) {
      const targetTime = new Date();
      targetTime.setHours(targetTime.getHours() + i, 0, 0, 0);

      // Fetch historical data for this hour of this day of week
      const targetHour = targetTime.getHours();
      const targetDay = targetTime.getDay();
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Simple heuristic: find analytics from the last 30 days
      const historicalData = await ParkingAnalytics.find({
        parkingId,
        date: { $gte: thirtyDaysAgo }
      });

      // Filter for same hour and day of week
      const relevantData = historicalData.filter(d => {
        const dDate = new Date(d.date);
        return dDate.getHours() === targetHour && dDate.getDay() === targetDay;
      });

      const sampleSize = relevantData.length;
      let expectedOccupancyRate = 0;
      let expectedBookings = 0;

      if (sampleSize > 0) {
        const totalBookings = relevantData.reduce((sum, r) => sum + r.metrics.successfulBookings, 0);
        expectedBookings = Math.round(totalBookings / sampleSize);
        expectedOccupancyRate = Math.min(100, Math.round((expectedBookings / totalCapacity) * 100));
      } else {
        // Fallback: simple moving average over all hours in the last week
        const recentData = historicalData.slice(-7);
        if (recentData.length > 0) {
          const tb = recentData.reduce((sum, r) => sum + r.metrics.successfulBookings, 0);
          expectedBookings = Math.round(tb / recentData.length);
          expectedOccupancyRate = Math.min(100, Math.round((expectedBookings / totalCapacity) * 100));
        } else {
          // If no data, assume a baseline 20%
          expectedOccupancyRate = 20;
          expectedBookings = Math.round(totalCapacity * 0.2);
        }
      }

      // Add simple time-of-day modifiers if data is sparse
      if (sampleSize === 0) {
        if (targetHour >= 8 && targetHour <= 10) expectedOccupancyRate += 20; // Morning peak
        if (targetHour >= 17 && targetHour <= 19) expectedOccupancyRate += 30; // Evening peak
        if (targetHour >= 1 && targetHour <= 5) expectedOccupancyRate = Math.max(5, expectedOccupancyRate - 15); // Night trough
      }
      
      expectedOccupancyRate = Math.min(100, expectedOccupancyRate);
      
      const expectedRevenue = expectedBookings * averagePrice;
      totalExpectedRevenue += expectedRevenue;

      if (expectedOccupancyRate > maxOccupancy) {
        maxOccupancy = expectedOccupancyRate;
        expectedPeakTime = targetTime.toISOString();
      }

      let confidence = sampleSize >= 3 ? 'High' : (sampleSize >= 1 ? 'Medium' : 'Low');

      predictions.push({
        time: targetTime.toISOString(),
        expectedOccupancyRate,
        expectedBookings,
        expectedRevenue,
        confidence
      });
      
      // Save forecast to DB
      await DemandForecast.findOneAndUpdate(
        {
          parkingId,
          targetDate: targetTime,
          granularity: 'hourly'
        },
        {
          tenantId,
          forecast: {
            expectedOccupancyRate,
            expectedBookings,
            expectedRevenue,
            expectedPeakTime
          },
          confidenceScore: confidence,
          historicalSampleSize: sampleSize,
          generatedAt: new Date()
        },
        { upsert: true }
      );
    }
    
    // Cache the result
    if (isRedisConnected()) {
      await redisClient.setEx(`forecast:hourly:${parkingId}`, 3600, JSON.stringify({
        predictions,
        expectedPeakTime,
        maxOccupancy,
        totalExpectedRevenue
      }));
    }

    return {
      predictions,
      expectedPeakTime,
      maxOccupancy,
      totalExpectedRevenue
    };
  } catch (error) {
    logger.error('Error generating hourly predictions:', error);
    throw error;
  }
};

const getCachedHourlyPredictions = async (parkingId) => {
  if (isRedisConnected()) {
    const cached = await redisClient.get(`forecast:hourly:${parkingId}`);
    if (cached) return JSON.parse(cached);
  }
  return null;
};

module.exports = {
  generateHourlyPredictions,
  getCachedHourlyPredictions
};
