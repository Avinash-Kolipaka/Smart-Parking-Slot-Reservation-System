const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  verifyQR
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateBody, bookingSchema } = require('../utils/validation');

router.use(protect); // Secure all booking routes

router.post('/book', validateBody(bookingSchema), createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

// Admin-only verification
router.post('/verify-qr', authorize('admin'), verifyQR);

module.exports = router;
