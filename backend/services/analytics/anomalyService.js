const ParkingAnomaly = require('../../models/ParkingAnomaly');
const ParkingAnalytics = require('../../models/ParkingAnalytics');

const detectAnomaliesForDate = async (targetDate) => {
  // 1. Fetch the day's analytics
  const dailyAnalytics = await ParkingAnalytics.find({ date: targetDate, granularity: 'daily' });
  
  for (const record of dailyAnalytics) {
    // 2. Fetch the previous 30 days average for comparison
    const past30Days = new Date(targetDate);
    past30Days.setDate(past30Days.getDate() - 30);

    const history = await ParkingAnalytics.find({
      parkingId: record.parkingId,
      granularity: 'daily',
      date: { $gte: past30Days, $lt: targetDate }
    });

    if (history.length < 7) continue; // Need minimum 7 days to baseline

    const avgBookings = history.reduce((sum, h) => sum + h.metrics.totalBookings, 0) / history.length;
    const currentBookings = record.metrics.totalBookings;

    // Detect booking spike (e.g., > 2.0x normal volume)
    if (avgBookings > 10 && currentBookings > avgBookings * 2.0) {
      await ParkingAnomaly.create({
        parkingId: record.parkingId,
        anomalyType: 'BOOKING_SPIKE',
        severity: 'HIGH',
        description: `Booking volume is ${(currentBookings / avgBookings).toFixed(1)}x higher than the 30-day average.`,
        anomalyScore: currentBookings / avgBookings,
        metricsContext: {
          expectedValue: avgBookings,
          actualValue: currentBookings
        }
      });
    }
  }
};

module.exports = {
  detectAnomaliesForDate
};
