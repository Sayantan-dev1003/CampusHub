const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { money } = require('../lib/money');
const { pageParams, sortOrder } = require('../lib/paging');
const { notify } = require('./notify');

const NEXT_STATUS = {
  PAID: ['PROCESSING'],
  PROCESSING: ['READY'],
  READY: ['COMPLETED'],
};

function serialize(order) {
  return {
    id: order.id,
    userId: order.userId,
    totalAmount: money(order.totalAmount),
    discountAmount: money(order.discountAmount),
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    fulfillment: order.fulfillment,
    createdAt: order.createdAt,
    items: (order.items || []).map((item) => ({
      id: item.id,
      variantId: item.productVariantId,
      size: item.productVariant?.size,
      productName: item.productVariant?.product?.name,
      quantity: item.quantity,
      unitPrice: money(item.unitPrice),
      subtotal: money(item.subtotal),
    })),
  };
}

const include = { items: { include: { productVariant: { include: { product: true } } } } };

async function myOrders(userId) {
  const rows = await prisma.order.findMany({
    where: { userId },
    include,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(serialize);
}

async function listOrders(query) {
  const { page, limit, skip } = pageParams(query);
  const where = {};
  if (query.status) where.orderStatus = query.status;
  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      include,
      orderBy: sortOrder(query, ['createdAt', 'totalAmount'], { createdAt: 'desc' }),
    }),
  ]);
  return { data: rows.map(serialize), meta: { page, limit, total } };
}

async function getOrder(orderId, user) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include });
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  const allowed = order.userId === user.id || user.role === 'ADMIN' || user.role === 'TREASURER';
  if (!allowed) throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
  return serialize(order);
}

async function updateStatus(orderId, status) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, 'Order not found', 'NOT_FOUND');
  if (order.paymentStatus !== 'PAID') {
    throw new ApiError(409, 'Only paid orders can change fulfillment status', 'CONFLICT');
  }
  const allowed = NEXT_STATUS[order.orderStatus] || [];
  if (!allowed.includes(status)) {
    throw new ApiError(409, 'That status change is not allowed', 'CONFLICT');
  }
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
    include,
  });
  await notify(prisma, {
    userId: order.userId,
    title: 'Order update',
    message: `Your order is now ${status}.`,
    type: 'ORDER',
    referenceType: 'ORDER',
    referenceId: order.id,
  });
  return serialize(updated);
}

module.exports = { myOrders, listOrders, getOrder, updateStatus };
