const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { pageParams, sortOrder } = require('../lib/paging');
const { publicUser } = require('../lib/authToken');
const { membershipSummary } = require('./auth.service');

const memberInclude = {
  memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
  tickets: { take: 5, orderBy: { createdAt: 'desc' }, include: { event: true } },
  orders: { take: 5, orderBy: { createdAt: 'desc' } },
};

function activeOf(user) {
  return user.memberships.find(
    (membership) => membership.status === 'ACTIVE' && membership.endDate && membership.endDate >= new Date()
  );
}

async function listMembers(query) {
  const { page, limit, skip } = pageParams(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { studentId: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.membership === 'ACTIVE') {
    where.memberships = { some: { status: 'ACTIVE', endDate: { gte: new Date() } } };
  } else if (query.membership === 'EXPIRED') {
    where.memberships = { some: { status: 'EXPIRED' } };
    where.NOT = { memberships: { some: { status: 'ACTIVE', endDate: { gte: new Date() } } } };
  } else if (query.membership === 'NONE') {
    where.memberships = { none: {} };
  } else if (query.membership === 'EXPIRING') {
    const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    where.memberships = { some: { status: 'ACTIVE', endDate: { gte: new Date(), lte: soon } } };
  }

  const [total, rows] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortOrder(query, ['name', 'email', 'createdAt'], { createdAt: 'desc' }),
      include: { memberships: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
    }),
  ]);

  return {
    data: rows.map((user) => ({
      ...publicUser(user, membershipSummary(activeOf(user) || user.memberships[0])),
    })),
    meta: { page, limit, total },
  };
}

async function getMember(memberId) {
  const user = await prisma.user.findUnique({ where: { id: memberId }, include: memberInclude });
  if (!user) throw new ApiError(404, 'Member not found', 'NOT_FOUND');
  return {
    ...publicUser(user, membershipSummary(activeOf(user))),
    membershipHistory: user.memberships.map((membership) => ({
      id: membership.id,
      status: membership.status,
      paymentStatus: membership.paymentStatus,
      startDate: membership.startDate,
      endDate: membership.endDate,
      planName: membership.plan.name,
    })),
    recentTickets: user.tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
      eventTitle: ticket.event.title,
    })),
    recentOrders: user.orders.map((order) => ({
      id: order.id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
    })),
  };
}

async function updateMe(userId, input) {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing && existing.id !== userId) {
      throw new ApiError(409, 'An account with that email already exists', 'CONFLICT');
    }
  }
  const data = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email.toLowerCase();
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.studentId !== undefined) data.studentId = input.studentId;
  if (input.notificationPreferences !== undefined) {
    const current = await prisma.user.findUnique({ where: { id: userId } });
    data.notificationPreferences = {
      ...(current.notificationPreferences || {}),
      ...input.notificationPreferences,
    };
  }
  const user = await prisma.user.update({ where: { id: userId }, data });
  return publicUser(user);
}

async function updateMember(memberId, input) {
  const existing = await prisma.user.findUnique({ where: { id: memberId } });
  if (!existing) throw new ApiError(404, 'Member not found', 'NOT_FOUND');
  const data = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.studentId !== undefined) data.studentId = input.studentId;
  if (input.profileImage !== undefined) data.profileImage = input.profileImage;
  const user = await prisma.user.update({ where: { id: memberId }, data });
  return publicUser(user);
}

async function updateStatus(memberId, status) {
  const existing = await prisma.user.findUnique({ where: { id: memberId } });
  if (!existing) throw new ApiError(404, 'Member not found', 'NOT_FOUND');
  const user = await prisma.user.update({ where: { id: memberId }, data: { status } });
  return publicUser(user);
}

async function updateRole(actorId, userId, input) {
  if (actorId === userId) {
    throw new ApiError(403, 'You cannot change your own role', 'FORBIDDEN');
  }
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) throw new ApiError(404, 'User not found', 'NOT_FOUND');
  const data = {};
  if (input.role === undefined && input.isVolunteer === undefined) {
    throw new ApiError(400, 'Role or volunteer flag is required', 'VALIDATION_ERROR');
  }
  if (input.role !== undefined) data.role = input.role;
  if (input.isVolunteer !== undefined) data.isVolunteer = input.isVolunteer;
  const user = await prisma.user.update({ where: { id: userId }, data });
  return publicUser(user);
}

module.exports = { listMembers, getMember, updateMe, updateMember, updateStatus, updateRole };
