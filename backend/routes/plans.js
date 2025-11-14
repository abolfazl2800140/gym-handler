const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plansController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// همه route ها نیاز به احراز هویت دارند
router.use(authenticateToken);

// دریافت پلن‌های فعال (همه ادمین‌ها)
router.get('/active', plansController.getActivePlans);

// بقیه route ها فقط برای سوپرادمین
router.get('/', requireSuperAdmin, plansController.getAllPlans);
router.get('/:id', requireSuperAdmin, plansController.getPlanById);
router.post('/', requireSuperAdmin, plansController.createPlan);
router.put('/:id', requireSuperAdmin, plansController.updatePlan);
router.patch('/:id/toggle', requireSuperAdmin, plansController.togglePlanStatus);

module.exports = router;
