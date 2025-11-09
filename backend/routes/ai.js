const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/ask - Ask AI a question
router.post('/ask', aiController.askAI);

// GET /api/ai/suggestions - Get suggested questions
router.get('/suggestions', aiController.getSuggestions);

// GET /api/ai/test - Test AI connection
router.get('/test', aiController.testAI);

module.exports = router;
