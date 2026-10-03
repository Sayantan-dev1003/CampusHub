const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createAnnouncement, getAllAnnouncements, getAnnouncementById,
  updateAnnouncement, deleteAnnouncement,
} = require('../controllers/announcement.controller');

const router = express.Router();

// Public - anyone can read announcements
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected
router.use(protect);

router.post(
  '/',
  authorize('ADMIN', 'TREASURER'),
  [body('title').notEmpty(), body('content').notEmpty()],
  validate,
  createAnnouncement
);

router.put('/:id', authorize('ADMIN', 'TREASURER'), updateAnnouncement);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
