const prisma = require('../config/db');
const { hasActiveMembership } = require('./member.service');

/**
 * Place an order
 */
const placeOrder = async ({ memberId, items, notes }, createdById) => {
  if (!items || items.length === 0) {
    throw Object.assign(new Error('Order must contain at least one item'), { statusCode: 400 });
  }

  const isActiveMember = await hasActiveMembership(memberId);

  // Validate all items and compute total
  let totalAmount = 0;
  const resolvedItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      throw Object.assign(new Error(`Product not found or unavailable: ${item.productId}`), { statusCode: 404 });
    }

    let variant = null;
    if (item.variantId) {
      variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) throw Object.assign(new Error(`Variant not found: ${item.variantId}`), { statusCode: 404 });
      if (variant.quantity < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for ${product.name} - ${variant.size}`), { statusCode: 400 });
      }
    }

    const unitPrice = isActiveMember && product.memberPrice ? product.memberPrice : product.price;
    const subtotal = unitPrice * item.quantity;
    totalAmount += subtotal;

    resolvedItems.push({ product, variant, quantity: item.quantity, unitPrice, subtotal, variantId: item.variantId });
  }

  // Create order with items in a transaction
  const operations = [];

  // Decrement stock for each variant
  for (const item of resolvedItems) {
    if (item.variant) {
      operations.push(
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { quantity: { decrement: item.quantity } },
        })
      );
    }
  }

  const order = await prisma.order.create({
    data: {
      memberId,
      totalAmount,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      notes,
      items: {
        createMany: {
          data: resolvedItems.map((i) => ({
            productId: i.product.id,
            variantId: i.variantId || null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          })),
        },
      },
    },
    include: { items: { include: { product: true, variant: true } } },
  });

  // Run stock decrements
  if (operations.length > 0) await prisma.$transaction(operations);

  // Record financial transaction
  await prisma.transaction.create({
    data: {
      type: 'MERCHANDISE_SALE',
      direction: 'INCOME',
      amount: totalAmount,
      description: `Merchandise order #${order.id}`,
      createdById,
      orderId: order.id,
    },
  });

  return order;
};

/**
 * Get all orders
 */
const getAllOrders = async ({ page = 1, limit = 20, status, memberId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(status && { status }),
    ...(memberId && { memberId }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        member: { select: { firstName: true, lastName: true, studentId: true } },
        items: { include: { product: { select: { name: true } }, variant: { select: { size: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get order by ID
 */
const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      member: { select: { firstName: true, lastName: true, studentId: true } },
      items: { include: { product: true, variant: true } },
    },
  });
  if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
  return order;
};

/**
 * Update order status
 */
const updateOrderStatus = async (id, status) => {
  return prisma.order.update({ where: { id }, data: { status } });
};

module.exports = { placeOrder, getAllOrders, getOrderById, updateOrderStatus };
