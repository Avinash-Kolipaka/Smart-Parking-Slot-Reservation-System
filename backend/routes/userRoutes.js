const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateProfile,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validateBody, profileUpdateSchema } = require('../utils/validation');

router.use(protect); // Secure all user routes

router.put('/profile', validateBody(profileUpdateSchema), updateProfile);

// Admin-only routing
router.get('/', authorize('admin'), getUsers);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
