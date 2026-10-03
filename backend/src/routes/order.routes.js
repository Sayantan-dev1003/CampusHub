const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  placeOrder, getAllOrders, getOrderById, updateOrderStatus,
} = require('../controllers/order.controller');

const router = express.Router();

router.use(protect);

// GET /api/v1/orders
router.get('/', authorize('ADMIN', 'TREASURER'), getAllOrders);

// GET /api/v1/orders/:id
router.get('/:id', getOrderById);

// POST /api/v1/orders
router.post(
  '/',
  [
    body('memberId').notEmpty(),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.productId').notEmpty(),
    body('items.*.quantity').isInt({ gt: 0 }),
  ],
  validate,
  placeOrder
);

// PATCH /api/v1/orders/:id/status
router.patch('/:id/status', authorize('ADMIN'), updateOrderStatus);

module.exports = router;
