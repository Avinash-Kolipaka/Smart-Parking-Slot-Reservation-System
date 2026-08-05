const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('admin')); // Restrict all dashboard endpoints to Admin

router.get('/stats', getStats);
router.get('/analytics', getAnalytics);

module.exports = router;
