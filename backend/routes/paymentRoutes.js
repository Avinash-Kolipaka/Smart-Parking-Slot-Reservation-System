const express = require('express');
const router = express.Router();
const { processPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Secure all payment routes

router.post('/', processPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
