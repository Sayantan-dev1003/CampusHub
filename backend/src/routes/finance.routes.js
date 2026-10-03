const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { getDashboard, getTransactions, createManualTransaction } = require('../controllers/finance.controller');

const router = express.Router();

router.use(protect, authorize('ADMIN', 'TREASURER'));

// GET /api/v1/finance/dashboard
router.get('/dashboard', getDashboard);

// GET /api/v1/finance/transactions
router.get('/transactions', getTransactions);

// POST /api/v1/finance/transactions
router.post(
  '/transactions',
  [
    body('type').notEmpty(),
    body('direction').isIn(['INCOME', 'EXPENSE']),
    body('amount').isFloat({ gt: 0 }),
    body('description').notEmpty(),
  ],
  validate,
  createManualTransaction
);

module.exports = router;
