const express = require('express');
const { registerTenant, getMyTenants } = require('../controllers/tenantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', registerTenant);
router.get('/my', getMyTenants);

module.exports = router;
