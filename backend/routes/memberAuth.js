const express = require('express');
const router = express.Router();
const memberAuthController = require('../controllers/memberAuthController');
const { authenticateMember } = require('../middleware/memberAuth');

// POST /api/member-auth/login - ورود ورزشکاران و مربیان
router.post('/login', memberAuthController.memberLogin);

// POST /api/member-auth/logout - خروج (محافظت شده)
router.post('/logout', authenticateMember, memberAuthController.memberLogout);

// GET /api/member-auth/me - دریافت اطلاعات عضو جاری
router.get('/me', authenticateMember, memberAuthController.getCurrentMember);

// POST /api/member-auth/change-password - تغییر رمز عبور
router.post('/change-password', authenticateMember, memberAuthController.changePassword);

module.exports = router;
