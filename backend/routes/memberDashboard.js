const express = require('express');
const router = express.Router();
const memberDashboardController = require('../controllers/memberDashboardController');
const { authenticateMember, requireCoach, requireAthlete } = require('../middleware/memberAuth');

// GET /api/member-dashboard/athlete - داشبورد ورزشکار
router.get('/athlete', authenticateMember, requireAthlete, memberDashboardController.getAthleteDashboard);

// GET /api/member-dashboard/coach - داشبورد مربی
router.get('/coach', authenticateMember, requireCoach, memberDashboardController.getCoachDashboard);

// GET /api/member-dashboard/athlete/:id - جزئیات یک ورزشکار (فقط برای مربیان)
router.get('/athlete/:id', authenticateMember, requireCoach, memberDashboardController.getAthleteDetails);

module.exports = router;
