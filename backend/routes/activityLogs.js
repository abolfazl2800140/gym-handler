const express = require('express');
const router = express.Router();
const activityLogsController = require('../controllers/activityLogsController');

// GET /api/activity-logs - Get all activity logs
router.get('/', activityLogsController.getActivityLogs);

// GET /api/activity-logs/stats - Get activity statistics
router.get('/stats', activityLogsController.getActivityStats);

// DELETE /api/activity-logs/clear - Clear old logs
router.delete('/clear', activityLogsController.clearOldLogs);

module.exports = router;
