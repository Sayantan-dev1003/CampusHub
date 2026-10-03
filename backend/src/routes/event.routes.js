const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { uploadEventImage } = require('../middleware/upload');
const {
  createEvent, getAllEvents, getEventById,
  updateEvent, updateEventStatus, deleteEvent, getEventStats,
} = require('../controllers/event.controller');

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(protect);

// GET /api/v1/events/:id/stats
router.get('/:id/stats', authorize('ADMIN', 'TREASURER'), getEventStats);

// POST /api/v1/events
router.post(
  '/',
  authorize('ADMIN'),
  uploadEventImage.single('coverImage'),
  [
    body('title').notEmpty(),
    body('venue').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').isISO8601(),
    body('totalCapacity').isInt({ gt: 0 }),
    body('memberPrice').isFloat({ min: 0 }),
    body('nonMemberPrice').isFloat({ min: 0 }),
  ],
  validate,
  createEvent
);

// PUT /api/v1/events/:id
router.put('/:id', authorize('ADMIN'), uploadEventImage.single('coverImage'), updateEvent);

// PATCH /api/v1/events/:id/status
router.patch('/:id/status', authorize('ADMIN'), updateEventStatus);

// DELETE /api/v1/events/:id
router.delete('/:id', authorize('ADMIN'), deleteEvent);

module.exports = router;
