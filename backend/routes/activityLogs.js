const express = require('express');
const router = express.Router();
const activityLogsController = require('../controllers/activityLogsController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// همه route های activity logs فقط برای super_admin قابل دسترسی هستند
// ابتدا احراز هویت انجام می‌شود، سپس نقش بررسی می‌شود

// GET /api/activity-logs - Get all activity logs (فقط super_admin)
router.get('/', authenticateToken, requireSuperAdmin, activityLogsController.getActivityLogs);

// GET /api/activity-logs/stats - Get activity statistics (فقط super_admin)
router.get('/stats', authenticateToken, requireSuperAdmin, activityLogsController.getActivityStats);

// DELETE /api/activity-logs/clear - Clear old logs (فقط super_admin)
router.delete('/clear', authenticateToken, requireSuperAdmin, activityLogsController.clearOldLogs);

module.exports = router;
