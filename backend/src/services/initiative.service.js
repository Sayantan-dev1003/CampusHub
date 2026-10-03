const prisma = require('../config/db');

/**
 * Create a fundraising / volunteer initiative
 */
const createInitiative = async ({ title, description, startDate, endDate }) => {
  return prisma.initiative.create({
    data: {
      title,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });
};

/**
 * Get all initiatives
 */
const getAllInitiatives = async ({ page = 1, limit = 20, active }) => {
  const skip = (page - 1) * limit;
  const where = { ...(active !== undefined && { isActive: active === 'true' }) };

  const [initiatives, total] = await Promise.all([
    prisma.initiative.findMany({
      where,
      skip,
      take: Number(limit),
      include: { _count: { select: { tasks: true } } },
      orderBy: { startDate: 'desc' },
    }),
    prisma.initiative.count({ where }),
  ]);

  return { initiatives, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get initiative by ID with tasks
 */
const getInitiativeById = async (id) => {
  const initiative = await prisma.initiative.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          assignedTo: { select: { firstName: true, lastName: true } },
          assignedBy: { select: { email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!initiative) throw Object.assign(new Error('Initiative not found'), { statusCode: 404 });
  return initiative;
};

/**
 * Update initiative
 */
const updateInitiative = async (id, data) => {
  const initiative = await prisma.initiative.findUnique({ where: { id } });
  if (!initiative) throw Object.assign(new Error('Initiative not found'), { statusCode: 404 });
  const updateData = { ...data };
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  return prisma.initiative.update({ where: { id }, data: updateData });
};

module.exports = { createInitiative, getAllInitiatives, getInitiativeById, updateInitiative };
