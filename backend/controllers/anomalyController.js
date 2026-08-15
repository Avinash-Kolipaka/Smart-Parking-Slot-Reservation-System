const ParkingAnomaly = require('../models/ParkingAnomaly');
const logger = require('../utils/logger');

const getAnomalies = async (req, res, next) => {
  try {
    const tenantId = req.user.tenantId;
    const anomalies = await ParkingAnomaly.find({ tenantId })
      .populate('parkingId', 'name')
      .sort({ detectedAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: anomalies });
  } catch (error) {
    logger.error('Error fetching anomalies:', error);
    next(error);
  }
};

const simulatePricing = async (req, res, next) => {
  try {
    const { currentPrice, currentOccupancy, expectedDemand, time, day } = req.body;
    
    // Deterministic simulation based on simple rules (not an LLM call to avoid hallucination and latency)
    let suggestedPrice = currentPrice;
    let expectedRevenue = 0;
    let expectedNewOccupancy = currentOccupancy;
    
    if (expectedDemand === 'HIGH' || currentOccupancy > 80) {
      suggestedPrice = currentPrice * 1.25; // 25% surge
      expectedNewOccupancy = Math.max(0, currentOccupancy - 10); // assumed slight drop in occupancy due to price
    } else if (expectedDemand === 'LOW' && currentOccupancy < 40) {
      suggestedPrice = currentPrice * 0.8; // 20% discount
      expectedNewOccupancy = Math.min(100, currentOccupancy + 15); // assumed increase
    }

    expectedRevenue = expectedNewOccupancy * (suggestedPrice / 100); // Assuming 100 slots total for simulation demo

    res.status(200).json({
      success: true,
      data: {
        suggestedPrice: Number(suggestedPrice.toFixed(2)),
        expectedNewOccupancy,
        expectedRevenue: Number(expectedRevenue.toFixed(2)),
        warning: 'SIMULATION ONLY - Real prices are not affected'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnomalies,
  simulatePricing
};
