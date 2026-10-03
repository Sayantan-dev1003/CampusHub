const crypto = require('crypto');
const prisma = require('../config/db');
const { hasActiveMembership } = require('./member.service');

/**
 * Purchase a ticket for an event
 */
const purchaseTicket = async ({ eventId, memberId, buyerName, buyerEmail, ticketType }, createdById) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
  if (event.status !== 'PUBLISHED') throw Object.assign(new Error('Event is not open for ticket sales'), { statusCode: 400 });
  if (event.remainingSeats <= 0) throw Object.assign(new Error('Event is sold out'), { statusCode: 400 });

  // Determine price based on membership
  let price = event.nonMemberPrice;
  let resolvedType = ticketType || 'NON_MEMBER';

  if (memberId) {
    const isActive = await hasActiveMembership(memberId);
    if (isActive) {
      price = event.memberPrice;
      resolvedType = 'MEMBER';
    }
  }

  // Generate unique QR code
  const qrCode = crypto.randomBytes(16).toString('hex').toUpperCase();

  // Use a transaction to ensure atomicity
  const [ticket] = await prisma.$transaction([
    prisma.ticket.create({
      data: {
        eventId,
        memberId: memberId || null,
        buyerName,
        buyerEmail,
        ticketType: resolvedType,
        price,
        qrCode,
        status: 'BOOKED',
      },
    }),
    prisma.event.update({
      where: { id: eventId },
      data: { remainingSeats: { decrement: 1 } },
    }),
  ]);

  // Record financial transaction
  await prisma.transaction.create({
    data: {
      type: 'TICKET_SALE',
      direction: 'INCOME',
      amount: price,
      description: `Ticket for event: ${event.title}`,
      createdById,
      ticketId: ticket.id,
    },
  });

  return ticket;
};

/**
 * Validate and check-in a ticket by QR code
 */
const checkInTicket = async (qrCode, checkedInBy) => {
  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: { event: true },
  });

  if (!ticket) throw Object.assign(new Error('Invalid QR code'), { statusCode: 404 });
  if (ticket.status === 'CHECKED_IN') throw Object.assign(new Error('Ticket already used for check-in'), { statusCode: 400 });
  if (ticket.status === 'CANCELLED') throw Object.assign(new Error('This ticket has been cancelled'), { statusCode: 400 });
  if (ticket.event.status !== 'PUBLISHED') throw Object.assign(new Error('Event is not active'), { statusCode: 400 });

  return prisma.ticket.update({
    where: { qrCode },
    data: { status: 'CHECKED_IN', checkInAt: new Date(), checkedInBy },
    include: { event: { select: { title: true, venue: true } }, member: { select: { firstName: true, lastName: true } } },
  });
};

/**
 * Get all tickets with filters
 */
const getAllTickets = async ({ page = 1, limit = 20, eventId, status, memberId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(eventId && { eventId }),
    ...(status && { status }),
    ...(memberId && { memberId }),
  };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        event: { select: { title: true, startDate: true } },
        member: { select: { firstName: true, lastName: true, studentId: true } },
      },
      orderBy: { purchasedAt: 'desc' },
    }),
    prisma.ticket.count({ where }),
  ]);

  return { tickets, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get ticket by ID
 */
const getTicketById = async (id) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: true,
      member: { select: { firstName: true, lastName: true, studentId: true } },
    },
  });
  if (!ticket) throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  return ticket;
};

/**
 * Cancel a ticket
 */
const cancelTicket = async (id) => {
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
  if (ticket.status === 'CHECKED_IN') throw Object.assign(new Error('Cannot cancel an already checked-in ticket'), { statusCode: 400 });

  const [updated] = await prisma.$transaction([
    prisma.ticket.update({ where: { id }, data: { status: 'CANCELLED' } }),
    prisma.event.update({ where: { id: ticket.eventId }, data: { remainingSeats: { increment: 1 } } }),
  ]);

  return updated;
};

module.exports = { purchaseTicket, checkInTicket, getAllTickets, getTicketById, cancelTicket };
