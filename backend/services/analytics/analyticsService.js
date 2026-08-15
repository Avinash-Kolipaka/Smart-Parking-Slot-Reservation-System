const ParkingAnalytics = require('../../models/ParkingAnalytics');
const logger = require('../../utils/logger');

const getDashboardOverview = async (dateRange = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }) => {
  try {
    const analytics = await ParkingAnalytics.find({
      granularity: 'daily',
      date: { $gte: dateRange.start, $lte: dateRange.end }
    });

    let totalRevenue = 0;
    let totalBookings = 0;
    let totalCancellations = 0;

    analytics.forEach(record => {
      totalRevenue += record.metrics.revenue;
      totalBookings += record.metrics.totalBookings;
      totalCancellations += record.metrics.cancelledBookings;
    });

    return {
      totalRevenue,
      totalBookings,
      totalCancellations,
      cancellationRate: totalBookings > 0 ? (totalCancellations / totalBookings) * 100 : 0
    };
  } catch (err) {
    logger.error('Failed to get dashboard overview', err);
    throw err;
  }
};

module.exports = {
  getDashboardOverview
};
