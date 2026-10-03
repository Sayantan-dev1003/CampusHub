const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * Register a new user with member profile
 */
const register = async ({ email, password, firstName, lastName, studentId, phone }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const existingStudent = await prisma.member.findUnique({ where: { studentId } });
  if (existingStudent) throw Object.assign(new Error('Student ID already registered'), { statusCode: 409 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'MEMBER',
      member: {
        create: { studentId, firstName, lastName, phone },
      },
    },
    include: { member: true },
  });

  return { token: generateToken(user.id), user: sanitizeUser(user) };
};

/**
 * Login an existing user
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { member: true },
  });

  if (!user || !user.isActive) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  return { token: generateToken(user.id), user: sanitizeUser(user) };
};

/**
 * Get authenticated user's profile
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      member: {
        include: {
          memberships: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return sanitizeUser(user);
};

/**
 * Change password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  return { message: 'Password updated successfully' };
};

const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

module.exports = { register, login, getMe, changePassword };
