const { getRecommendations } = require('../services/analytics/recommendationService');

const recommendParking = async (req, res, next) => {
  try {
    const { vehicleType, arrivalTime, budget, latitude, longitude } = req.body;
    
    // Default arrival time to now if not provided
    const targetArrival = arrivalTime || new Date();

    const recommendations = await getRecommendations({ 
      vehicleType, 
      arrivalTime: targetArrival, 
      budget, 
      latitude, 
      longitude 
    });

    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommendParking
};
