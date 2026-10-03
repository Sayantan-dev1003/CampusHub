const prisma = require('../config/db');

/**
 * Create a volunteer task under an initiative
 */
const createTask = async ({ initiativeId, title, description, assignedToId, dueDate }, assignedById) => {
  const initiative = await prisma.initiative.findUnique({ where: { id: initiativeId } });
  if (!initiative) throw Object.assign(new Error('Initiative not found'), { statusCode: 404 });

  if (assignedToId) {
    const member = await prisma.member.findUnique({ where: { id: assignedToId } });
    if (!member) throw Object.assign(new Error('Assigned member not found'), { statusCode: 404 });
  }

  return prisma.volunteerTask.create({
    data: {
      initiativeId,
      title,
      description,
      assignedToId: assignedToId || null,
      assignedById,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: 'PENDING',
    },
    include: {
      assignedTo: { select: { firstName: true, lastName: true } },
      initiative: { select: { title: true } },
    },
  });
};

/**
 * Get all tasks with filters
 */
const getAllTasks = async ({ page = 1, limit = 20, status, initiativeId, assignedToId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(status && { status }),
    ...(initiativeId && { initiativeId }),
    ...(assignedToId && { assignedToId }),
  };

  const [tasks, total] = await Promise.all([
    prisma.volunteerTask.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
        initiative: { select: { title: true } },
      },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.volunteerTask.count({ where }),
  ]);

  return { tasks, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Update task status or re-assign
 */
const updateTask = async (id, data, requestingUser) => {
  const task = await prisma.volunteerTask.findUnique({
    where: { id },
    include: { assignedTo: { select: { userId: true } } },
  });
  if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });

  // Members can only update their own tasks' status
  if (requestingUser.role === 'MEMBER' && task.assignedTo?.userId !== requestingUser.id) {
    throw Object.assign(new Error('You can only update tasks assigned to you'), { statusCode: 403 });
  }

  const updateData = { ...data };
  if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
  if (data.status === 'COMPLETED') updateData.completedAt = new Date();

  return prisma.volunteerTask.update({
    where: { id },
    data: updateData,
    include: { assignedTo: { select: { firstName: true, lastName: true } } },
  });
};

/**
 * Delete a task
 */
const deleteTask = async (id) => {
  const task = await prisma.volunteerTask.findUnique({ where: { id } });
  if (!task) throw Object.assign(new Error('Task not found'), { statusCode: 404 });
  return prisma.volunteerTask.delete({ where: { id } });
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask };
