const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  checkInBooking,
  checkOutBooking,
  verifyQR
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateBody, bookingSchema } = require('../utils/validation');
const { checkIdempotency } = require('../middleware/idempotencyMiddleware');

router.use(protect); // Secure all booking routes

router.post('/book', checkIdempotency(300), validateBody(bookingSchema), createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);

// Check-in and Check-out actions (Admin & Parking Managers)
router.post('/:id/check-in', authorize('ADMIN', 'PARKING_MANAGER', 'SUPER_ADMIN', 'admin'), checkInBooking);
router.post('/:id/check-out', authorize('ADMIN', 'PARKING_MANAGER', 'SUPER_ADMIN', 'admin'), checkOutBooking);
router.post('/verify-qr', authorize('ADMIN', 'PARKING_MANAGER', 'SUPER_ADMIN', 'admin'), verifyQR);

module.exports = router;
