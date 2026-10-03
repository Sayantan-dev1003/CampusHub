const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createMembership, getAllMemberships, renewMembership, updateMembershipStatus,
} = require('../controllers/membership.controller');

const router = express.Router();

router.use(protect);

// GET /api/v1/memberships
router.get('/', authorize('ADMIN', 'TREASURER'), getAllMemberships);

// POST /api/v1/memberships
router.post(
  '/',
  authorize('ADMIN'),
  [
    body('memberId').notEmpty(),
    body('duesAmount').isFloat({ gt: 0 }),
    body('startDate').isISO8601(),
    body('expiryDate').isISO8601(),
  ],
  validate,
  createMembership
);

// POST /api/v1/memberships/:id/renew
router.post(
  '/:id/renew',
  authorize('ADMIN'),
  [
    body('newExpiryDate').isISO8601(),
    body('duesAmount').isFloat({ gt: 0 }),
  ],
  validate,
  renewMembership
);

// PATCH /api/v1/memberships/:id/status
router.patch('/:id/status', authorize('ADMIN'), updateMembershipStatus);

module.exports = router;
