const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { tokenFromRequest } = require('../lib/authCookie');

async function attachUser(req) {
  const token = tokenFromRequest(req);
  if (!token) return null;
  const payload = jwt.verify(token, env.jwtSecret);
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.status !== 'ACTIVE') return null;
  return user;
}

async function requireAuth(req, res, next) {
  try {
    const user = await attachUser(req);
    if (!user) {
      return next(new ApiError(401, 'Authentication required', 'INVALID_CREDENTIALS'));
    }
    req.user = user;
    return next();
  } catch {
    return next(new ApiError(401, 'Authentication required', 'INVALID_CREDENTIALS'));
  }
}

async function optionalAuth(req, res, next) {
  try {
    req.user = await attachUser(req);
  } catch {
    req.user = null;
  }
  return next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
    }
    return next();
  };
}

function requireVolunteer(req, res, next) {
  if (!req.user?.isVolunteer) {
    return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
  }
  return next();
}

function requireSelfOrRoles(param, roles) {
  return (req, res, next) => {
    if (req.user.id === req.params[param] || roles.includes(req.user.role)) return next();
    return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
  };
}

module.exports = {
  requireAuth,
  optionalAuth,
  requireRoles,
  requireVolunteer,
  requireSelfOrRoles,
};
