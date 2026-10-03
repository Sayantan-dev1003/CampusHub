const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createInitiative, getAllInitiatives, getInitiativeById, updateInitiative,
} = require('../controllers/initiative.controller');

const router = express.Router();

router.use(protect);

router.get('/', getAllInitiatives);
router.get('/:id', getInitiativeById);

router.post(
  '/',
  authorize('ADMIN'),
  [body('title').notEmpty(), body('startDate').isISO8601()],
  validate,
  createInitiative
);

router.put('/:id', authorize('ADMIN'), updateInitiative);

module.exports = router;
