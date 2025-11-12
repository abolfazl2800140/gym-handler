const express = require('express');
const router = express.Router();
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { getCapacityStatus } = require('../middleware/checkIdCapacity');

// GET /api/system/capacity - دریافت وضعیت ظرفیت ID ها
router.get('/capacity', authenticateToken, requireSuperAdmin, getCapacityStatus);

module.exports = router;
