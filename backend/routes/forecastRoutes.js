const express = require('express');
const { getForecast } = require('../controllers/forecastController');

const router = express.Router();

router.get('/:parkingId', getForecast);

module.exports = router;
