const crypto = require('crypto');
const Razorpay = require('razorpay');
const prisma = require('../lib/prisma');
const { env } = require('../config/env');
const { ApiError } = require('../lib/errors');
const { money, roundMoney, toPaise, addMonths, addMinutes } = require('../lib/money');
const { currentMembership } = require('./auth.service');
const { getOrganization } = require('./settings.service');
const { priceFor, seatsTaken } = require('./event.service');
const { notify } = require('./notify');

function safeEqual(left, right) {
  const a = Buffer.from(left || '');
  const b = Buffer.from(right || '');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function razorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) {
    return {
      orders: {
        create: async (opts) => ({
          id: `mock_order_${crypto.randomBytes(8).toString('hex')}`,
          amount: opts.amount,
          currency: opts.currency,
          receipt: opts.receipt,
        })
      }
    };
  }
  return new Razorpay({ key_id: env.razorpayKeyId, key_secret: env.razorpayKeySecret });
}

function checkoutPayload(payment, referenceId, confirmed, extra) {
  return {
    paymentId: payment.id,
    razorpayOrderId: payment.razorpayOrderId,
    amount: toPaise(payment.amount),
    amountMajor: money(payment.amount),
    currency: String(payment.currency).trim(),
    keyId: payment.razorpayOrderId.startsWith('free_') ? null : env.razorpayKeyId,
    referenceId,
    confirmed,
    ...extra,
  };
}

async function createGatewayOrder(amountMajor, currency) {
  const client = razorpayClient();
  return client.orders.create({
    amount: toPaise(amountMajor),
    currency,
    receipt: `rcpt_${Date.now()}`.slice(0, 40),
  });
}

async function heldVariantQuantity(db, variantId, now) {
  const aggregate = await db.orderItem.aggregate({
    where: {
      productVariantId: variantId,
      order: { orderStatus: 'PENDING', holdExpiresAt: { gt: now } },
    },
    _sum: { quantity: true },
  });
  return aggregate._sum.quantity || 0;
}

async function createPaymentOrder(user, input) {
  if (input.purpose === 'MEMBERSHIP') return createMembershipPayment(user, input.planId);
  if (input.purpose === 'TICKET') return createTicketPayment(user, input.eventId, input.quantity || 1);
  if (input.purpose === 'ORDER') return createMerchandisePayment(user, input.items, input.fulfillment || 'PICKUP');
  throw new ApiError(400, 'Unknown payment purpose', 'VALIDATION_ERROR');
}

async function createMembershipPayment(user, planId) {
  const plan = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!plan || !plan.isActive) throw new ApiError(404, 'Membership plan not found', 'NOT_FOUND');
  const settings = await getOrganization();
  const amount = roundMoney(plan.fee);
  const gateway = amount > 0 ? await createGatewayOrder(amount, settings.currency) : null;
  const now = new Date();

  const created = await prisma.runTransaction(async (tx) => {
    const membership = await tx.membership.create({
      data: {
        userId: user.id,
        planId: plan.id,
        duesAmount: amount,
        paymentStatus: 'PENDING',
        status: 'PENDING',
      },
    });
    const payment = await tx.payment.create({
      data: {
        userId: user.id,
        purpose: 'MEMBERSHIP',
        amount,
        currency: settings.currency,
        status: 'CREATED',
        razorpayOrderId: gateway ? gateway.id : `free_${crypto.randomBytes(12).toString('hex')}`,
        referenceType: 'MEMBERSHIP',
        referenceId: membership.id,
      },
    });
    await tx.membership.update({ where: { id: membership.id }, data: { paymentId: payment.id } });
    return payment;
  });

  if (amount <= 0) {
    const confirmed = await confirmPayment(created.razorpayOrderId, `free_pay_${crypto.randomBytes(8).toString('hex')}`);
    return { ...checkoutPayload(created, created.referenceId, true), ...confirmed };
  }
  return checkoutPayload(created, created.referenceId, false, { holdExpiresAt: addMinutes(now, settings.paymentHoldMinutes) });
}

async function createTicketPayment(user, eventId, quantity) {
  if (quantity !== 1) {
    throw new ApiError(400, 'Purchase one ticket per checkout', 'VALIDATION_ERROR');
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, 'Event not found', 'NOT_FOUND');
  if (event.endsAt <= new Date()) throw new ApiError(409, 'Event is no longer open for tickets', 'CAPACITY_EXCEEDED');

  const membership = await currentMembership(user.id);
  const priced = priceFor(event, membership);
  const settings = await getOrganization();
  const taken = await seatsTaken(event.id);
  if (taken + 1 > event.capacity) throw new ApiError(409, 'Event capacity exceeded', 'CAPACITY_EXCEEDED');

  const gateway = priced.price > 0 ? await createGatewayOrder(priced.price, settings.currency) : null;
  const holdExpiresAt = addMinutes(new Date(), settings.paymentHoldMinutes);

  const created = await prisma.runTransaction(
    async (tx) => {
      const current = await seatsTaken(event.id, tx);
      if (current + 1 > event.capacity) {
        throw new ApiError(409, 'Event capacity exceeded', 'CAPACITY_EXCEEDED');
      }
      const ticket = await tx.ticket.create({
        data: {
          eventId: event.id,
          userId: user.id,
          ticketType: priced.ticketType,
          price: priced.price,
          status: 'PENDING',
          holdExpiresAt,
        },
      });
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          purpose: 'TICKET',
          amount: priced.price,
          currency: settings.currency,
          status: 'CREATED',
          razorpayOrderId: gateway ? gateway.id : `free_${crypto.randomBytes(12).toString('hex')}`,
          referenceType: 'TICKET',
          referenceId: ticket.id,
        },
      });
      await tx.ticket.update({ where: { id: ticket.id }, data: { paymentId: payment.id } });
      return payment;
    },
    { isolationLevel: 'Serializable' }
  );

  if (priced.price <= 0) {
    const confirmed = await confirmPayment(created.razorpayOrderId, `free_pay_${crypto.randomBytes(8).toString('hex')}`);
    return { ...checkoutPayload(created, created.referenceId, true), ...confirmed };
  }
  return checkoutPayload(created, created.referenceId, false, { holdExpiresAt });
}

async function createMerchandisePayment(user, items, fulfillment) {
  if (!items?.length) throw new ApiError(400, 'Order items are required', 'VALIDATION_ERROR');
  const settings = await getOrganization();
  if (fulfillment === 'PICKUP' && !settings.pickupEnabled) {
    throw new ApiError(400, 'Pickup is unavailable', 'VALIDATION_ERROR');
  }
  if (fulfillment === 'DELIVERY' && !settings.deliveryEnabled) {
    throw new ApiError(400, 'Delivery is unavailable', 'VALIDATION_ERROR');
  }
  const membership = await currentMembership(user.id);
  const now = new Date();
  const lines = [];
  let listTotal = 0;
  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });
    if (!variant || variant.product.status !== 'ACTIVE') {
      throw new ApiError(404, 'Product variant not found', 'NOT_FOUND');
    }
    const held = await heldVariantQuantity(prisma, variant.id, now);
    if (variant.stockQuantity - held < item.quantity) {
      throw new ApiError(409, 'Insufficient stock', 'OUT_OF_STOCK');
    }
    const unitPrice = membership && membership.status === 'ACTIVE'
      ? roundMoney(Number(variant.product.memberPrice) || Number(variant.product.price))
      : roundMoney(Number(variant.product.price));
    const subtotal = roundMoney(unitPrice * item.quantity);
    listTotal += Number(variant.product.price) * item.quantity;
    lines.push({ variant, quantity: item.quantity, unitPrice, subtotal });
  }
  const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.subtotal, 0));
  const deliveryFee = fulfillment === 'DELIVERY' ? 50 : 0;
  const total = roundMoney(subtotal + deliveryFee);
  const discountAmount = roundMoney(listTotal - subtotal);
  const gateway = total > 0 ? await createGatewayOrder(total, settings.currency) : null;
  const holdExpiresAt = addMinutes(now, settings.paymentHoldMinutes);

  const created = await prisma.runTransaction(
    async (tx) => {
      for (const line of lines) {
        const variant = await tx.productVariant.findUnique({ where: { id: line.variant.id } });
        const held = await heldVariantQuantity(tx, line.variant.id, new Date());
        if (variant.stockQuantity - held < line.quantity) {
          throw new ApiError(409, 'Insufficient stock', 'OUT_OF_STOCK');
        }
      }
      const order = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: total,
          discountAmount,
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          fulfillment,
          holdExpiresAt,
          items: {
            create: lines.map((line) => ({
              productVariantId: line.variant.id,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              subtotal: line.subtotal,
            })),
          },
        },
      });
      const payment = await tx.payment.create({
        data: {
          userId: user.id,
          purpose: 'ORDER',
          amount: total,
          currency: settings.currency,
          status: 'CREATED',
          razorpayOrderId: gateway ? gateway.id : `free_${crypto.randomBytes(12).toString('hex')}`,
          referenceType: 'ORDER',
          referenceId: order.id,
        },
      });
      await tx.order.update({ where: { id: order.id }, data: { paymentId: payment.id } });
      return payment;
    },
    { isolationLevel: 'Serializable' }
  );

  if (total <= 0) {
    const confirmed = await confirmPayment(created.razorpayOrderId, `free_pay_${crypto.randomBytes(8).toString('hex')}`);
    return { ...checkoutPayload(created, created.referenceId, true), ...confirmed };
  }
  return checkoutPayload(created, created.referenceId, false, { holdExpiresAt });
}

async function confirmPayment(razorpayOrderId, razorpayPaymentId) {
  const settings = await getOrganization();
  return prisma.runTransaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { razorpayOrderId } });
    if (!payment) throw new ApiError(404, 'Payment not found', 'NOT_FOUND');
    if (payment.status === 'PAID') {
      if (!payment.razorpayPaymentId || payment.razorpayPaymentId === razorpayPaymentId) {
        return loadConfirmation(tx, payment);
      }
      throw new ApiError(409, 'Payment already processed', 'PAYMENT_ALREADY_PROCESSED');
    }
    if (payment.status !== 'CREATED') throw new ApiError(409, 'Payment hold expired', 'HOLD_EXPIRED');

    let category = 'OTHER';
    let description = 'Payment';
    let orderItems = null;

    if (payment.purpose === 'TICKET') {
      const ticket = await tx.ticket.findUnique({
        where: { id: payment.referenceId },
        include: { event: true },
      });
      if (!ticket || ticket.status !== 'PENDING' || !ticket.holdExpiresAt || ticket.holdExpiresAt <= new Date()) {
        throw new ApiError(409, 'Payment hold expired', 'HOLD_EXPIRED');
      }
      if (ticket.event.status === 'CANCELLED') {
        throw new ApiError(409, 'Event is cancelled', 'HOLD_EXPIRED');
      }
      category = 'EVENT_TICKET';
      description = `Ticket for ${ticket.event.title}`;
    } else if (payment.purpose === 'ORDER') {
      const order = await tx.order.findUnique({
        where: { id: payment.referenceId },
        include: { items: true },
      });
      if (!order || order.orderStatus !== 'PENDING' || !order.holdExpiresAt || order.holdExpiresAt <= new Date()) {
        throw new ApiError(409, 'Payment hold expired', 'HOLD_EXPIRED');
      }
      orderItems = order.items;
      category = 'MERCHANDISE';
      description = 'Merchandise order';
    } else if (payment.purpose === 'MEMBERSHIP') {
      const deadline = addMinutes(payment.createdAt, settings.paymentHoldMinutes);
      const membership = await tx.membership.findUnique({ where: { id: payment.referenceId } });
      if (!membership || membership.paymentStatus !== 'PENDING' || deadline <= new Date()) {
        throw new ApiError(409, 'Payment hold expired', 'HOLD_EXPIRED');
      }
      category = 'MEMBERSHIP';
      description = 'Membership dues';
    }

    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: 'CREATED' },
      data: { status: 'PAID', razorpayPaymentId },
    });
    if (claimed.count !== 1) {
      const current = await tx.payment.findUnique({ where: { id: payment.id } });
      if (current.status === 'PAID' && current.razorpayPaymentId === razorpayPaymentId) {
        return loadConfirmation(tx, current);
      }
      throw new ApiError(409, 'Payment already processed', 'PAYMENT_ALREADY_PROCESSED');
    }

    if (orderItems) {
      for (const item of orderItems) {
        const updated = await tx.productVariant.updateMany({
          where: { id: item.productVariantId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new ApiError(409, 'Insufficient stock', 'OUT_OF_STOCK');
      }
    }

    const transaction = await tx.transaction.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        type: 'INCOME',
        category,
        referenceType: payment.referenceType,
        referenceId: payment.referenceId,
        amount: payment.amount,
        currency: payment.currency,
        description,
        status: 'POSTED',
      },
    });

    if (payment.purpose === 'TICKET') {
      const ticket = await tx.ticket.update({
        where: { id: payment.referenceId },
        data: {
          status: 'PAID',
          qrToken: crypto.randomBytes(24).toString('hex'),
          holdExpiresAt: null,
        },
        include: { event: true },
      });
      await notify(tx, {
        userId: payment.userId,
        title: 'Ticket confirmed',
        message: `Your ticket for ${ticket.event.title} is ready.`,
        type: 'TICKET',
        referenceType: 'TICKET',
        referenceId: ticket.id,
      });
    } else if (payment.purpose === 'ORDER') {
      await tx.order.update({
        where: { id: payment.referenceId },
        data: { paymentStatus: 'PAID', orderStatus: 'PAID', holdExpiresAt: null },
      });
      await notify(tx, {
        userId: payment.userId,
        title: 'Order confirmed',
        message: 'Your merchandise order is paid.',
        type: 'ORDER',
        referenceType: 'ORDER',
        referenceId: payment.referenceId,
      });
    } else {
      const membership = await tx.membership.findUnique({
        where: { id: payment.referenceId },
        include: { plan: true },
      });
      const active = await tx.membership.findFirst({
        where: {
          userId: payment.userId,
          id: { not: membership.id },
          status: 'ACTIVE',
          endDate: { gt: new Date() },
        },
        orderBy: { endDate: 'desc' },
      });
      const start = active?.endDate && active.endDate > new Date() ? active.endDate : new Date();
      const end = addMonths(start, membership.plan.durationMonths);
      await tx.membership.update({
        where: { id: membership.id },
        data: { status: 'ACTIVE', paymentStatus: 'PAID', startDate: start, endDate: end },
      });
      await notify(tx, {
        userId: payment.userId,
        title: 'Membership active',
        message: `${membership.plan.name} is active until ${end.toISOString().slice(0, 10)}.`,
        type: 'MEMBERSHIP',
        referenceType: 'MEMBERSHIP',
        referenceId: membership.id,
      });
    }

    const fresh = await tx.payment.findUnique({ where: { id: payment.id } });
    const confirmation = await loadConfirmation(tx, fresh);
    return { ...confirmation, transactionId: transaction.id };
  });
}

async function loadConfirmation(db, payment) {
  if (payment.purpose === 'TICKET') {
    const ticket = await db.ticket.findUnique({
      where: { id: payment.referenceId },
      include: { event: true },
    });
    return {
      purpose: 'TICKET',
      transactionId: (await db.transaction.findFirst({ where: { paymentId: payment.id } }))?.id,
      ticket: {
        id: ticket.id,
        eventId: ticket.eventId,
        eventTitle: ticket.event.title,
        status: ticket.status,
        ticketType: ticket.ticketType,
        price: money(ticket.price),
        qrToken: ticket.qrToken,
      },
    };
  }
  if (payment.purpose === 'ORDER') {
    const order = await db.order.findUnique({
      where: { id: payment.referenceId },
      include: { items: true },
    });
    return {
      purpose: 'ORDER',
      transactionId: (await db.transaction.findFirst({ where: { paymentId: payment.id } }))?.id,
      order: {
        id: order.id,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: money(order.totalAmount),
      },
    };
  }
  const membership = await db.membership.findUnique({
    where: { id: payment.referenceId },
    include: { plan: true },
  });
  return {
    purpose: 'MEMBERSHIP',
    transactionId: (await db.transaction.findFirst({ where: { paymentId: payment.id } }))?.id,
    membership: {
      id: membership.id,
      status: membership.status,
      paymentStatus: membership.paymentStatus,
      startDate: membership.startDate,
      endDate: membership.endDate,
      planName: membership.plan.name,
      duesAmount: money(membership.duesAmount),
    },
  };
}

async function verifyPayment(user, input) {
  if (!env.razorpayKeySecret) {
    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.razorpayOrderId } });
    if (!payment || payment.userId !== user.id) throw new ApiError(404, 'Payment not found', 'NOT_FOUND');
    return confirmPayment(input.razorpayOrderId, input.razorpayPaymentId || `mock_pay_${crypto.randomBytes(8).toString('hex')}`);
  }
  const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: input.razorpayOrderId } });
  if (!payment || payment.userId !== user.id) throw new ApiError(404, 'Payment not found', 'NOT_FOUND');
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest('hex');
  if (!safeEqual(expected, input.razorpaySignature)) {
    throw new ApiError(400, 'Payment signature is invalid', 'PAYMENT_SIGNATURE_INVALID');
  }
  return confirmPayment(input.razorpayOrderId, input.razorpayPaymentId);
}

async function handleWebhook(rawBody, signature) {
  if (!env.razorpayWebhookSecret) {
    throw new ApiError(503, 'Razorpay webhook is not configured', 'PAYMENTS_NOT_CONFIGURED');
  }
  const expected = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(rawBody).digest('hex');
  if (!safeEqual(expected, signature || '')) {
    throw new ApiError(400, 'Payment signature is invalid', 'PAYMENT_SIGNATURE_INVALID');
  }
  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    throw new ApiError(400, 'Invalid webhook body', 'VALIDATION_ERROR');
  }
  if (payload.event !== 'payment.captured' && payload.event !== 'order.paid') {
    return { ignored: true };
  }
  const entity = payload.payload?.payment?.entity;
  if (!entity?.order_id || !entity?.id) return { ignored: true };
  return confirmPayment(entity.order_id, entity.id);
}

module.exports = { createPaymentOrder, verifyPayment, handleWebhook, confirmPayment };
