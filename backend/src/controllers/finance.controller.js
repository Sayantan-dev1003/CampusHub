const financeService = require('../services/finance.service');

const getDashboard = async (req, res, next) => {
  try {
    const result = await financeService.getDashboard(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getTransactions = async (req, res, next) => {
  try {
    const result = await financeService.getTransactions(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const createManualTransaction = async (req, res, next) => {
  try {
    const tx = await financeService.createManualTransaction(req.body, req.user.id);
    res.status(201).json({ success: true, data: tx });
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getTransactions, createManualTransaction };
