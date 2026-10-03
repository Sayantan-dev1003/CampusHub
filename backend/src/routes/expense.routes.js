const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadReceipt } = require('../middleware/upload');
const {
  submitExpense, getAllExpenses, getExpenseById,
  reviewExpense, reimburseExpense,
} = require('../controllers/expense.controller');

const router = express.Router();

router.use(protect);

router.get('/', authorize('ADMIN', 'TREASURER'), getAllExpenses);
router.get('/:id', getExpenseById);

router.post(
  '/',
  uploadReceipt.single('receipt'),
  [
    body('memberId').notEmpty(),
    body('amount').isFloat({ gt: 0 }),
    body('category').notEmpty(),
    body('description').notEmpty(),
  ],
  validate,
  submitExpense
);

router.patch('/:id/review', authorize('ADMIN', 'TREASURER'), reviewExpense);
router.post('/:id/reimburse', authorize('TREASURER', 'ADMIN'), reimburseExpense);

module.exports = router;
