const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// GET dashboard summary
router.get('/dashboard', reportsController.getDashboardSummary);

// GET monthly financial report
router.get('/financial/monthly', reportsController.getMonthlyFinancialReport);

// GET member growth report
router.get('/members/growth', reportsController.getMemberGrowthReport);

// GET comprehensive report
router.get('/comprehensive', reportsController.getComprehensiveReport);

module.exports = router;
