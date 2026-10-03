const prisma = require('../config/db');

/**
 * Get all members (admin only)
 */
const getAllMembers = async ({ page = 1, limit = 20, search, status }) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ],
    }),
    ...(status && {
      memberships: { some: { status } },
    }),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        memberships: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.member.count({ where }),
  ]);

  return { members, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) };
};

/**
 * Get a member by ID
 */
const getMemberById = async (id) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, role: true, isActive: true } },
      memberships: { orderBy: { createdAt: 'desc' } },
      tickets: { include: { event: true }, orderBy: { purchasedAt: 'desc' }, take: 5 },
      orders: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!member) throw Object.assign(new Error('Member not found'), { statusCode: 404 });
  return member;
};

/**
 * Update member profile
 */
const updateMember = async (id, data, requestingUser) => {
  const member = await prisma.member.findUnique({ where: { id }, include: { user: true } });
  if (!member) throw Object.assign(new Error('Member not found'), { statusCode: 404 });

  // Only the member themselves or an admin can update
  if (requestingUser.role === 'MEMBER' && member.userId !== requestingUser.id) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  const { firstName, lastName, phone, profilePhoto } = data;
  return prisma.member.update({
    where: { id },
    data: { firstName, lastName, phone, profilePhoto },
    include: { user: { select: { email: true, role: true } } },
  });
};

/**
 * Check if member has an active membership
 */
const hasActiveMembership = async (memberId) => {
  const membership = await prisma.membership.findFirst({
    where: { memberId, status: 'ACTIVE', expiryDate: { gt: new Date() } },
  });
  return !!membership;
};

/**
 * Get members whose memberships expire within N days (for reminders)
 */
const getExpiringMemberships = async (daysAhead = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.membership.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: { lte: futureDate, gt: new Date() },
      renewalReminderSent: false,
    },
    include: { member: { include: { user: { select: { email: true } } } } },
  });
};

module.exports = { getAllMembers, getMemberById, updateMember, hasActiveMembership, getExpiringMemberships };
