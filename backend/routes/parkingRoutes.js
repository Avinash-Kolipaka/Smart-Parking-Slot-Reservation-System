const express = require('express');
const router = express.Router();
const {
  getParkingLocations,
  getParkingLocation,
  getMyParkingLocations,
  createParkingLocation,
  updateParkingLocation,
  deleteParkingLocation
} = require('../controllers/parkingController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody, parkingLocationSchema } = require('../utils/validation');

router.get('/', getParkingLocations);
router.get('/my-slots', protect, getMyParkingLocations);
router.get('/:id', getParkingLocation);

// Authenticated user & Admin routes
router.post(
  '/',
  protect,
  validateBody(parkingLocationSchema),
  createParkingLocation
);
router.put(
  '/:id',
  protect,
  validateBody(parkingLocationSchema.partial()),
  updateParkingLocation
);
router.delete('/:id', protect, deleteParkingLocation);

module.exports = router;
