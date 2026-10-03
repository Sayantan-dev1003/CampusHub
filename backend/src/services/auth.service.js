const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { signToken, publicUser } = require('../lib/authToken');
const { money } = require('../lib/money');
const { DEFAULT_PREFS, getOrganization } = require('./settings.service');

let dummyHash;

async function invalidHash() {
  if (!dummyHash) dummyHash = await bcrypt.hash('invalid-password', 10);
  return dummyHash;
}

function membershipSummary(membership) {
  if (!membership) return null;
  return {
    id: membership.id,
    status: membership.status,
    endDate: membership.endDate,
    planName: membership.plan.name,
    paymentStatus: membership.paymentStatus,
    duesAmount: money(membership.duesAmount),
  };
}

async function currentMembership(userId) {
  return prisma.membership.findFirst({
    where: { userId, status: 'ACTIVE', endDate: { gte: new Date() } },
    include: { plan: true },
    orderBy: { endDate: 'desc' },
  });
}

async function register(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new ApiError(409, 'An account with that email already exists', 'CONFLICT');
  }
  const settings = await getOrganization();
  const defaults = settings.notificationDefaults || DEFAULT_PREFS;
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await bcrypt.hash(input.password, 10),
      phone: input.phone || null,
      studentId: input.studentId || null,
      role: input.role || 'MEMBER',
      isVolunteer: input.role === 'MEMBER' ? Boolean(input.isVolunteer) : false,
      notificationPreferences: defaults,
    },
  });
  return {
    token: signToken(user),
    user: publicUser(user, null),
  };
}

async function login(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  const hash = user ? user.passwordHash : await invalidHash();
  const matches = await bcrypt.compare(input.password, hash);
  if (!user || !matches) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Account is suspended', 'FORBIDDEN');
  }
  const membership = await currentMembership(user.id);
  return {
    token: signToken(user),
    user: publicUser(user, membershipSummary(membership)),
  };
}

async function me(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const membership = await currentMembership(userId);
  return publicUser(user, membershipSummary(membership));
}

async function changePassword(userId, input) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const matches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new ApiError(400, 'Current password is incorrect', 'VALIDATION_ERROR');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
  });
  return { updated: true };
}

module.exports = { register, login, me, changePassword, currentMembership, membershipSummary };
