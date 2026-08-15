const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateProfile,
  updateUser,
  deleteUser,
  toggleBanUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateBody, profileUpdateSchema } = require('../utils/validation');

router.use(protect); // Secure all user routes

router.put('/profile', validateBody(profileUpdateSchema), updateProfile);

// Admin-only routing
router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'PARKING_MANAGER', 'admin'), getUsers);
router.put('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'admin'), updateUser);
router.put('/:id/ban', authorize('ADMIN', 'SUPER_ADMIN', 'admin'), toggleBanUser);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'admin'), deleteUser);

module.exports = router;
