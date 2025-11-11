const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController');
const { authenticateToken } = require('../middleware/auth');
const genderFilter = require('../middleware/genderFilter');

// GET member statistics (باید قبل از /:id باشه)
router.get('/stats/summary', authenticateToken, genderFilter, membersController.getMemberStats);

// GET all members
router.get('/', authenticateToken, genderFilter, membersController.getAllMembers);

// GET single member
router.get('/:id', authenticateToken, genderFilter, membersController.getMemberById);

// POST create member
router.post('/', authenticateToken, membersController.createMember);

// PUT update member
router.put('/:id', authenticateToken, genderFilter, membersController.updateMember);

// DELETE member
router.delete('/:id', authenticateToken, genderFilter, membersController.deleteMember);

module.exports = router;
