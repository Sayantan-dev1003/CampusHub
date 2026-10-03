const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const prisma = require('./prisma');
const { ApiError } = require('./errors');

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

function publicUser(user, membership = undefined) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isMember: user.isMember,
    isVolunteer: user.isVolunteer,
    phone: user.phone,
    studentId: user.studentId,
    profileImage: user.profileImage,
    status: user.status,
    notificationPreferences: user.notificationPreferences,
    createdAt: user.createdAt,
  };
  if (membership !== undefined) payload.membership = membership;
  return payload;
}

async function loadUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== 'ACTIVE') {
    throw new ApiError(401, 'Authentication required', 'INVALID_CREDENTIALS');
  }
  return user;
}

module.exports = { signToken, publicUser, loadUser };
