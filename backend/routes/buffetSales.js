const express = require('express');
const router = express.Router();
const buffetSalesController = require('../controllers/buffetSalesController');
const { authenticateToken, checkRole } = require('../middleware/auth');

// همه route ها نیاز به احراز هویت دارند
router.use(authenticateToken);

// GET /api/buffet-sales/stats - آمار فروش
router.get('/stats', buffetSalesController.getSalesStats);

// GET /api/buffet-sales - دریافت همه فروش‌ها
router.get('/', buffetSalesController.getAllSales);

// GET /api/buffet-sales/:id - دریافت یک فروش
router.get('/:id', buffetSalesController.getSaleById);

// POST /api/buffet-sales - ثبت فروش (فقط آشپز)
router.post('/', checkRole(['chef', 'admin', 'super_admin']), buffetSalesController.createSale);

module.exports = router;
