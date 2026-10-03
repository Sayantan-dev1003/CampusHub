const initiativeService = require('../services/initiative.service');

const createInitiative = async (req, res, next) => {
  try {
    const initiative = await initiativeService.createInitiative(req.body);
    res.status(201).json({ success: true, data: initiative });
  } catch (err) { next(err); }
};

const getAllInitiatives = async (req, res, next) => {
  try {
    const result = await initiativeService.getAllInitiatives(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getInitiativeById = async (req, res, next) => {
  try {
    const initiative = await initiativeService.getInitiativeById(req.params.id);
    res.json({ success: true, data: initiative });
  } catch (err) { next(err); }
};

const updateInitiative = async (req, res, next) => {
  try {
    const initiative = await initiativeService.updateInitiative(req.params.id, req.body);
    res.json({ success: true, data: initiative });
  } catch (err) { next(err); }
};

module.exports = { createInitiative, getAllInitiatives, getInitiativeById, updateInitiative };
