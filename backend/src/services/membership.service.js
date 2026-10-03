const prisma = require('../config/db');

/**
 * Create a new membership for a member
 */
const createMembership = async ({ memberId, membershipType, duesAmount, startDate, expiryDate, benefits }, createdById) => {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw Object.assign(new Error('Member not found'), { statusCode: 404 });

  // Check for existing active membership
  const existing = await prisma.membership.findFirst({
    where: { memberId, status: 'ACTIVE', expiryDate: { gt: new Date() } },
  });
  if (existing) throw Object.assign(new Error('Member already has an active membership'), { statusCode: 409 });

  const membership = await prisma.membership.create({
    data: {
      memberId,
      membershipType: membershipType || 'Standard',
      status: 'ACTIVE',
      duesAmount,
      paymentStatus: 'PAID',
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      benefits: benefits || [],
    },
  });

  // Record transaction
  await prisma.transaction.create({
    data: {
      type: 'MEMBERSHIP_DUES',
      direction: 'INCOME',
      amount: duesAmount,
      description: `Membership dues - ${membershipType || 'Standard'} for member ${memberId}`,
      createdById,
      membershipId: membership.id,
    },
  });

  return membership;
};

/**
 * Get all memberships with filters
 */
const getAllMemberships = async ({ page = 1, limit = 20, status, memberId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(status && { status }),
    ...(memberId && { memberId }),
  };

  const [memberships, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      skip,
      take: Number(limit),
      include: { member: { select: { firstName: true, lastName: true, studentId: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.membership.count({ where }),
  ]);

  return { memberships, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Renew a membership
 */
const renewMembership = async (membershipId, { newExpiryDate, duesAmount }, createdById) => {
  const membership = await prisma.membership.findUnique({ where: { id: membershipId } });
  if (!membership) throw Object.assign(new Error('Membership not found'), { statusCode: 404 });

  const updated = await prisma.membership.update({
    where: { id: membershipId },
    data: {
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      expiryDate: new Date(newExpiryDate),
      duesAmount,
      renewalReminderSent: false,
    },
  });

  await prisma.transaction.create({
    data: {
      type: 'MEMBERSHIP_DUES',
      direction: 'INCOME',
      amount: duesAmount,
      description: `Membership renewal for member ${membership.memberId}`,
      createdById,
    },
  });

  return updated;
};

/**
 * Update membership status (suspend, expire)
 */
const updateStatus = async (membershipId, status) => {
  return prisma.membership.update({ where: { id: membershipId }, data: { status } });
};

module.exports = { createMembership, getAllMemberships, renewMembership, updateStatus };
