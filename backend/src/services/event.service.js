const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { money, roundMoney } = require('../lib/money');
const { pageParams, sortOrder } = require('../lib/paging');
const { currentMembership } = require('./auth.service');

function heldTicketWhere(now = new Date()) {
  return {
    OR: [
      { status: { in: ['PAID', 'USED'] } },
      { status: 'PENDING', holdExpiresAt: { gt: now } },
    ],
  };
}

async function seatsTaken(eventId, db = prisma) {
  return db.ticket.count({
    where: { eventId, ...heldTicketWhere() },
  });
}

function priceFor(event, membership) {
  if (!membership) {
    return { ticketType: 'NON_MEMBER', price: roundMoney(event.nonMemberPrice) };
  }
  const discount = Number(membership.plan.ticketDiscountPercent) / 100;
  return {
    ticketType: 'MEMBER',
    price: roundMoney(Number(event.memberPrice) * (1 - discount)),
  };
}

async function serializeEvent(event, user, taken, knownMembership) {
  const used = taken == null ? await seatsTaken(event.id) : taken;
  const payload = {
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venue: event.venue,
    capacity: event.capacity,
    remainingSeats: event.capacity - used,
    memberPrice: money(event.memberPrice),
    nonMemberPrice: money(event.nonMemberPrice),
    status: event.status,

    createdById: event.createdById,
    createdAt: event.createdAt,
  };
  if (user) {
    const membership = knownMembership === undefined ? await currentMembership(user.id) : knownMembership;
    const priced = priceFor(event, membership);
    payload.viewerPrice = priced.price;
    payload.viewerTicketType = priced.ticketType;
  }
  return payload;
}

async function listEvents(user, query) {
  const { page, limit, skip } = pageParams(query);
  const where = {};
  const isAdmin = user?.role === 'ADMIN';

  if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
  if (query.date) {
    const day = new Date(query.date);
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    where.startsAt = { gte: day, lt: next };
  }
  const [total, rows] = await prisma.$transaction([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortOrder(query, ['startsAt', 'title', 'createdAt'], { startsAt: 'asc' }),
    }),
  ]);
  const membership = user ? await currentMembership(user.id) : null;
  const data = [];
  for (const event of rows) data.push(await serializeEvent(event, user, undefined, membership));
  return { data, meta: { page, limit, total } };
}

async function getEvent(eventId, user) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, 'Event not found', 'NOT_FOUND');

  return serializeEvent(event, user);
}

async function createEvent(userId, input) {
  if (new Date(input.endsAt) <= new Date(input.startsAt)) {
    throw new ApiError(400, 'Event end must be after the start', 'VALIDATION_ERROR');
  }
  delete input.status;
  const event = await prisma.event.create({
    data: { ...input, createdById: userId },
  });
  return serializeEvent(event, { id: userId, role: 'ADMIN' });
}

async function updateEvent(eventId, input) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) throw new ApiError(404, 'Event not found', 'NOT_FOUND');
  // Prevent any edits to a completed/cancelled event (except status changes)
  if ((existing.status === 'COMPLETED' || existing.status === 'CANCELLED') && Object.keys(input).some((k) => k !== 'status')) {
    throw new ApiError(409, 'Event is closed and cannot be edited', 'EVENT_CLOSED');
  }
  const startsAt = input.startsAt || existing.startsAt;
  const endsAt = input.endsAt || existing.endsAt;
  if (!input.status && new Date(endsAt) <= new Date(startsAt)) {
    throw new ApiError(400, 'Event end must be after the start', 'VALIDATION_ERROR');
  }
  if (input.capacity != null) {
    const taken = await seatsTaken(eventId);
    if (input.capacity < taken) {
      throw new ApiError(409, 'Capacity is below tickets already held', 'CAPACITY_EXCEEDED');
    }
  }
  const event = await prisma.event.update({ where: { id: eventId }, data: input });
  return serializeEvent(event, { id: existing.createdById, role: 'ADMIN' });
}

async function closeEvent(eventId) {
  const existing = await prisma.event.findUnique({ where: { id: eventId } });
  if (!existing) throw new ApiError(404, 'Event not found', 'NOT_FOUND');
  if (existing.status === 'COMPLETED') throw new ApiError(409, 'Event is already completed', 'EVENT_ALREADY_CLOSED');
  const event = await prisma.event.update({ where: { id: eventId }, data: { status: 'COMPLETED' } });
  return serializeEvent(event, { id: existing.createdById, role: 'ADMIN' });
}



async function analytics(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, 'Event not found', 'NOT_FOUND');
  const ticketIds = (await prisma.ticket.findMany({ where: { eventId }, select: { id: true } })).map((ticket) => ticket.id);
  const [sold, checkedIn, revenue, soldMember, soldNonMember] = await Promise.all([
    prisma.ticket.count({ where: { eventId, status: { in: ['PAID', 'USED'] } } }),
    prisma.attendance.count({ where: { eventId } }),
    ticketIds.length
      ? prisma.transaction.aggregate({
          where: {
            status: 'POSTED',
            type: 'INCOME',
            category: 'EVENT_TICKET',
            referenceType: 'TICKET',
            referenceId: { in: ticketIds },
          },
          _sum: { amount: true },
        })
      : Promise.resolve({ _sum: { amount: 0 } }),
    prisma.ticket.count({ where: { eventId, status: { in: ['PAID', 'USED'] }, ticketType: 'MEMBER' } }),
    prisma.ticket.count({ where: { eventId, status: { in: ['PAID', 'USED'] }, ticketType: 'NON_MEMBER' } }),
  ]);
  const taken = await seatsTaken(eventId);
  return {
    capacity: event.capacity,
    remainingSeats: event.capacity - taken,
    ticketsSold: sold,
    memberTicketsSold: soldMember,
    nonMemberTicketsSold: soldNonMember,
    checkedIn,
    revenue: money(revenue._sum.amount) || 0,
  };
}

module.exports = {
  seatsTaken,
  priceFor,
  heldTicketWhere,
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  closeEvent,

  analytics,
  serializeEvent,
};
