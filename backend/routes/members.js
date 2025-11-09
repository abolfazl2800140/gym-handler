const express = require('express');
const router = express.Router();
const membersController = require('../controllers/membersController');

// GET all members
router.get('/', membersController.getAllMembers);

// GET single member
router.get('/:id', membersController.getMemberById);

// POST create member
router.post('/', membersController.createMember);

// PUT update member
router.put('/:id', membersController.updateMember);

// DELETE member
router.delete('/:id', membersController.deleteMember);

// GET member statistics
router.get('/stats/summary', membersController.getMemberStats);

module.exports = router;
