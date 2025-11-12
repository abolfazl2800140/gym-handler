const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// POST /api/auth/logout - Logout user (محافظت شده با احراز هویت)
router.post('/logout', authenticateToken, authController.logout);

// GET /api/auth/me - Get current user (محافظت شده با احراز هویت)
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
