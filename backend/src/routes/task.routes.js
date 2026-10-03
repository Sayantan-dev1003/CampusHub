const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createTask, getAllTasks, updateTask, deleteTask } = require('../controllers/task.controller');

const router = express.Router();

router.use(protect);

router.get('/', getAllTasks);

router.post(
  '/',
  authorize('ADMIN'),
  [body('initiativeId').notEmpty(), body('title').notEmpty()],
  validate,
  createTask
);

router.put('/:id', updateTask);
router.delete('/:id', authorize('ADMIN'), deleteTask);

module.exports = router;
