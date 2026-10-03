const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { money } = require('../lib/money');

function serializeTicket(ticket, includeQr) {
  const visible = includeQr && (ticket.status === 'PAID' || ticket.status === 'USED');
  return {
    id: ticket.id,
    eventId: ticket.eventId,
    eventTitle: ticket.event?.title,
    startsAt: ticket.event?.startsAt,
    venue: ticket.event?.venue,
    userId: ticket.userId,
    ticketType: ticket.ticketType,
    price: money(ticket.price),
    status: ticket.status,
    checkedInAt: ticket.checkedInAt,
    qrToken: visible ? ticket.qrToken : undefined,
    createdAt: ticket.createdAt,
  };
}

async function myTickets(userId) {
  const tickets = await prisma.ticket.findMany({
    where: { userId, status: { in: ['PAID', 'USED', 'PENDING'] } },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });
  return tickets.map((ticket) => serializeTicket(ticket, ticket.userId === userId));
}

async function getTicket(ticketId, user) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { event: true, attendance: true },
  });
  if (!ticket) throw new ApiError(404, 'Ticket not found', 'NOT_FOUND');
  const allowed = ticket.userId === user.id || user.role === 'ADMIN' || user.role === 'TREASURER';
  if (!allowed) throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
  return {
    ...serializeTicket(ticket, true),
    attendance: ticket.attendance
      ? { checkedInAt: ticket.attendance.checkedInAt, checkedInById: ticket.attendance.checkedInById }
      : null,
  };
}

async function checkIn(staffId, qrToken) {
  return prisma.runTransaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({ where: { qrToken }, include: { event: true } });
    if (!ticket) throw new ApiError(404, 'Ticket not found', 'NOT_FOUND');
    if (ticket.status === 'USED') throw new ApiError(409, 'Ticket already used', 'TICKET_ALREADY_USED');
    if (ticket.status !== 'PAID') throw new ApiError(409, 'Ticket is not paid', 'TICKET_NOT_PAID');
    const checkedInAt = new Date();
    const claimed = await tx.ticket.updateMany({
      where: { id: ticket.id, status: 'PAID' },
      data: { status: 'USED', checkedInAt },
    });
    if (claimed.count !== 1) throw new ApiError(409, 'Ticket already used', 'TICKET_ALREADY_USED');
    const updated = await tx.ticket.findUnique({ where: { id: ticket.id } });
    const attendance = await tx.attendance.create({
      data: {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        userId: ticket.userId,
        checkedInAt,
        checkedInById: staffId,
      },
    });
    return {
      ticketId: updated.id,
      eventId: ticket.eventId,
      status: updated.status,
      checkedInAt,
      checkedInById: staffId,
      attendanceId: attendance.id,
    };
  });
}

async function attendance(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new ApiError(404, 'Event not found', 'NOT_FOUND');
  const rows = await prisma.attendance.findMany({
    where: { eventId },
    include: { user: true, ticket: true },
    orderBy: { checkedInAt: 'desc' },
  });
  return rows.map((row) => ({
    id: row.id,
    ticketId: row.ticketId,
    userId: row.userId,
    name: row.user.name,
    email: row.user.email,
    ticketType: row.ticket.ticketType,
    price: money(row.ticket.price),
    purchasedAt: row.ticket.createdAt,
    checkedInAt: row.checkedInAt,
    checkedInById: row.checkedInById,
  }));
}

module.exports = { myTickets, getTicket, checkIn, attendance, serializeTicket };
