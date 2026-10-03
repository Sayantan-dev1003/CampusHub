const expenseService = require('../services/expense.service');

const submitExpense = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    const expense = await expenseService.submitExpense(data, req.user.id);
    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const getAllExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getAllExpenses(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const reviewExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.reviewExpense(req.params.id, { ...req.body, reviewedBy: req.user.id });
    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
};

const reimburseExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.reimburseExpense(req.params.id, req.user.id);
    res.json({ success: true, message: 'Expense reimbursed', data: expense });
  } catch (err) { next(err); }
};

module.exports = { submitExpense, getAllExpenses, getExpenseById, reviewExpense, reimburseExpense };
