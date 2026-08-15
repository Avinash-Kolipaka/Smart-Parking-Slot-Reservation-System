const { getForecastForParking } = require('../services/analytics/forecastService');
const { generateHourlyPredictions, getCachedHourlyPredictions } = require('../services/analytics/predictionService');

const getForecast = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    // Default to forecasting the next 7 days
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);

    const forecast = await getForecastForParking(parkingId, { start, end });
    res.status(200).json({ success: true, data: forecast });
  } catch (error) {
    next(error);
  }
};

const getOccupancyPrediction = async (req, res, next) => {
  try {
    const { parkingId } = req.params;
    const tenantId = req.user.tenantId;

    let predictions = await getCachedHourlyPredictions(parkingId);
    
    if (!predictions) {
      predictions = await generateHourlyPredictions(parkingId, tenantId, 12);
    }

    if (!predictions) {
      return res.status(404).json({ success: false, message: 'Parking location not found or insufficient data.' });
    }

    res.status(200).json({
      success: true,
      data: {
        parkingId,
        predictions: predictions.predictions,
        peakTime: predictions.expectedPeakTime,
        maxOccupancy: predictions.maxOccupancy
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getForecast,
  getOccupancyPrediction
};
