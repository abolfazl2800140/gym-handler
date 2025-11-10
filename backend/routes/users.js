const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

// همه route ها نیاز به احراز هویت دارند
router.use(authenticateToken);

// GET /api/users - دریافت لیست کاربران
// Super Admin: همه کاربران
// Admin: فقط خودش
router.get('/', usersController.getAllUsers);

// GET /api/users/:id - دریافت یک کاربر
router.get('/:id', usersController.getUserById);

// POST /api/users - اضافه کردن کاربر جدید (فقط super_admin)
router.post('/', requireSuperAdmin, usersController.createUser);

// PUT /api/users/:id - ویرایش کاربر
// Super Admin: همه کاربران
// Admin: فقط خودش
router.put('/:id', usersController.updateUser);

// DELETE /api/users/:id - حذف کاربر (فقط super_admin)
router.delete('/:id', requireSuperAdmin, usersController.deleteUser);

// PUT /api/users/:id/change-password - تغییر رمز عبور
router.put('/:id/change-password', usersController.changePassword);

// PUT /api/users/:id/toggle-status - فعال/غیرفعال کردن حساب (فقط super_admin)
router.put('/:id/toggle-status', requireSuperAdmin, usersController.toggleStatus);

// GET /api/users/:id/stats - دریافت آمار فعالیت کاربر
router.get('/:id/stats', usersController.getUserStats);

// GET /api/users/:id/activities - دریافت فعالیت‌های اخیر کاربر
router.get('/:id/activities', usersController.getUserActivities);

module.exports = router;
