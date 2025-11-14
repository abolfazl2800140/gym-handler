const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticateToken, checkRole } = require('../middleware/auth');

// همه route ها نیاز به احراز هویت دارند
router.use(authenticateToken);

// GET /api/wallet/:member_id - دریافت موجودی کیف پول
router.get('/:member_id', walletController.getWalletBalance);

// GET /api/wallet/:member_id/transactions - دریافت تراکنش‌های کیف پول
router.get('/:member_id/transactions', walletController.getWalletTransactions);

// POST /api/wallet/:member_id/charge - شارژ کیف پول (فقط ادمین)
router.post('/:member_id/charge', checkRole(['admin', 'super_admin']), walletController.chargeWallet);

module.exports = router;
