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

// Admin-only slot management routes
router.post('/', protect, authorize('admin'), validateBody(slotSchema), createSlot);
router.post('/generate-batch', protect, authorize('admin'), generateBatchSlots);
router.put('/:id', protect, authorize('admin'), validateBody(slotSchema.partial()), updateSlot);
router.delete('/:id', protect, authorize('admin'), deleteSlot);

module.exports = router;
