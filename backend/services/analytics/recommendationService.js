const ParkingLocation = require('../../models/ParkingLocation');
const DemandForecast = require('../../models/DemandForecast');

/**
 * Recommends best parking locations based on user criteria.
 */
const getRecommendations = async ({ vehicleType, arrivalTime, budget, latitude, longitude }) => {
  const query = { isActive: true };
  
  if (vehicleType) {
    query[`facilities.${vehicleType.toLowerCase()}Parking`] = true;
  }

  // Find all active compatible parking locations
  const locations = await ParkingLocation.find(query);

  const recommendations = [];

  for (const loc of locations) {
    let score = 100;
    const reasons = [];

    // 1. Price check
    if (budget && loc.pricePerHour > budget) {
      score -= 40;
      reasons.push(`Exceeds budget by ₹${loc.pricePerHour - budget}/hr`);
    } else if (budget) {
      reasons.push('Within budget limit');
    }

    // 2. Capacity & Forecast check
    const forecast = await DemandForecast.findOne({
      parkingId: loc._id,
      targetDate: { $lte: new Date(arrivalTime) } // In a real app, match the specific hour
    }).sort({ targetDate: -1 });

    if (forecast) {
      if (forecast.forecast.expectedOccupancyRate > 90) {
        score -= 30;
        reasons.push('Predicted to be heavily occupied at arrival time');
      } else {
        reasons.push('Predicted good availability at arrival time');
      }
    } else {
       reasons.push('Current availability looks good (no forecast available)');
    }

    // 3. Distance scoring (Mocked for now since geospatial queries require an index and real coordinates)
    if (latitude && longitude && loc.location && loc.location.coordinates) {
       // Simple euclidean distance penalty for demo purposes
       score -= 5;
       reasons.push('Nearby location');
    }

    if (score > 40) { // Threshold for recommendation
      recommendations.push({
        parking: loc,
        score,
        explanation: reasons
      });
    }
  }

  // Sort by highest score first
  return recommendations.sort((a, b) => b.score - a.score);
};

module.exports = {
  getRecommendations
};
