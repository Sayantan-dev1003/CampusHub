const prisma = require('../config/db');

/**
 * Create an event
 */
const createEvent = async (data) => {
  const { title, description, venue, startDate, endDate, totalCapacity, memberPrice, nonMemberPrice, coverImage } = data;

  return prisma.event.create({
    data: {
      title,
      description,
      venue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalCapacity: Number(totalCapacity),
      remainingSeats: Number(totalCapacity),
      memberPrice: Number(memberPrice),
      nonMemberPrice: Number(nonMemberPrice),
      coverImage,
      status: 'DRAFT',
    },
  });
};

/**
 * Get all events with filters
 */
const getAllEvents = async ({ page = 1, limit = 20, status, upcoming }) => {
  const skip = (page - 1) * limit;
  const now = new Date();

  const where = {
    ...(status && { status }),
    ...(upcoming === 'true' && { startDate: { gt: now }, status: 'PUBLISHED' }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { startDate: 'asc' },
      include: {
        _count: { select: { tickets: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return { events, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get event by ID with full details
 */
const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: { select: { tickets: true } },
      tickets: {
        where: { status: 'CHECKED_IN' },
        select: { id: true },
      },
    },
  });
  if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
  return event;
};

/**
 * Update an event
 */
const updateEvent = async (id, data) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') {
    throw Object.assign(new Error('Cannot update a completed or cancelled event'), { statusCode: 400 });
  }

  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.totalCapacity) {
    const soldTickets = await prisma.ticket.count({ where: { eventId: id, status: { in: ['BOOKED', 'CHECKED_IN'] } } });
    if (Number(data.totalCapacity) < soldTickets) {
      throw Object.assign(new Error('New capacity cannot be less than tickets already sold'), { statusCode: 400 });
    }
    updateData.remainingSeats = Number(data.totalCapacity) - soldTickets;
  }

  return prisma.event.update({ where: { id }, data: updateData });
};

/**
 * Publish / change event status
 */
const updateEventStatus = async (id, status) => {
  return prisma.event.update({ where: { id }, data: { status } });
};

/**
 * Delete event (only if DRAFT)
 */
const deleteEvent = async (id) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw Object.assign(new Error('Event not found'), { statusCode: 404 });
  if (event.status !== 'DRAFT') throw Object.assign(new Error('Only draft events can be deleted'), { statusCode: 400 });
  return prisma.event.delete({ where: { id } });
};

/**
 * Get event statistics
 */
const getEventStats = async (id) => {
  const [ticketsSold, checkedIn, revenue] = await Promise.all([
    prisma.ticket.count({ where: { eventId: id, status: { in: ['BOOKED', 'CHECKED_IN'] } } }),
    prisma.ticket.count({ where: { eventId: id, status: 'CHECKED_IN' } }),
    prisma.ticket.aggregate({ where: { eventId: id, status: { in: ['BOOKED', 'CHECKED_IN'] } }, _sum: { price: true } }),
  ]);

  return { ticketsSold, checkedIn, revenue: revenue._sum.price || 0 };
};

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, updateEventStatus, deleteEvent, getEventStats };
