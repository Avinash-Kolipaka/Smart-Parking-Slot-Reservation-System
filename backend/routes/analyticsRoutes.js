const express = require('express');
const { getOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Admin only routes
router.use(protect);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/overview', getOverview);

module.exports = router;
