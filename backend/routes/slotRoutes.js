const express = require('express');
const router = express.Router();
const {
  getSlots,
  createSlot,
  generateBatchSlots,
  updateSlot,
  deleteSlot
} = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateBody, slotSchema } = require('../utils/validation');

router.get('/', getSlots);

// Admin & Manager slot management routes
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'), validateBody(slotSchema), createSlot);
router.post('/generate-batch', protect, authorize('ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'), generateBatchSlots);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'), validateBody(slotSchema.partial()), updateSlot);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'), deleteSlot);

module.exports = router;
