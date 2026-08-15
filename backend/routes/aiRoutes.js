const express = require('express');
const { askAi } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Strict AI limits to prevent abuse / bill shocks
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10,
  message: { success: false, message: 'Too many AI requests. Please wait.' }
});

router.use(protect);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

const { getOccupancyPrediction } = require('../controllers/forecastController');
const { getAnomalies, simulatePricing } = require('../controllers/anomalyController');

router.post('/ask', aiLimiter, askAi);
router.get('/occupancy/:parkingId', getOccupancyPrediction);
router.get('/anomalies', getAnomalies);
router.post('/simulate-pricing', simulatePricing);

module.exports = router;
