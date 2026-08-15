const DemandForecast = require('../../models/DemandForecast');

const getForecastForParking = async (parkingId, dateRange) => {
  // Query precomputed forecasts
  return await DemandForecast.find({
    parkingId,
    targetDate: { $gte: dateRange.start, $lte: dateRange.end }
  }).sort({ targetDate: 1 });
};

module.exports = {
  getForecastForParking
};
