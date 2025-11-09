const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');

// GET all transactions
router.get('/', transactionsController.getAllTransactions);

// GET single transaction
router.get('/:id', transactionsController.getTransactionById);

// POST create transaction
router.post('/', transactionsController.createTransaction);

// PUT update transaction
router.put('/:id', transactionsController.updateTransaction);

// DELETE transaction
router.delete('/:id', transactionsController.deleteTransaction);

// GET financial statistics
router.get('/stats/summary', transactionsController.getFinancialStats);

module.exports = router;
