const express = require('express');
const { recommendParking } = require('../controllers/recommendationController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Strict rate limiting for the heavy recommendation engine
const recommendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many recommendation requests.' }
});

router.post('/parking', recommendLimiter, recommendParking);

module.exports = router;
