const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  purchaseTicket, checkInTicket, getAllTickets,
  getTicketById, cancelTicket,
} = require('../controllers/ticket.controller');

const router = express.Router();

router.use(protect);

// GET /api/v1/tickets
router.get('/', getAllTickets);

// GET /api/v1/tickets/:id
router.get('/:id', getTicketById);

// POST /api/v1/tickets/purchase
router.post(
  '/purchase',
  [
    body('eventId').notEmpty(),
    body('buyerName').notEmpty(),
    body('buyerEmail').isEmail(),
  ],
  validate,
  purchaseTicket
);

// POST /api/v1/tickets/check-in
router.post(
  '/check-in',
  authorize('ADMIN', 'TREASURER'),
  [body('qrCode').notEmpty().withMessage('QR code is required')],
  validate,
  checkInTicket
);

// DELETE /api/v1/tickets/:id/cancel
router.patch('/:id/cancel', authorize('ADMIN'), cancelTicket);

module.exports = router;
