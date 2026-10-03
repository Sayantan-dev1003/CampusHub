const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { notify } = require('./notify');

function serializeTask(task) {
  return {
    id: task.id,
    initiativeId: task.initiativeId,
    assignedToId: task.assignedToId,
    assigneeName: task.assignee?.name,
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function serializeInitiative(initiative) {
  const tasks = initiative.tasks || [];
  const counts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  return {
    id: initiative.id,
    name: initiative.name,
    description: initiative.description,
    type: initiative.type,
    startDate: initiative.startDate,
    endDate: initiative.endDate,
    status: initiative.status,
    createdById: initiative.createdById,
    taskCounts: counts,
    tasks: tasks.map(serializeTask),
  };
}

async function create(userId, input) {
  if (new Date(input.endDate) <= new Date(input.startDate)) {
    throw new ApiError(400, 'Initiative end must be after the start', 'VALIDATION_ERROR');
  }
  const row = await prisma.initiative.create({
    data: { ...input, createdById: userId },
    include: { tasks: true },
  });
  return serializeInitiative(row);
}

async function list(user) {
  const where =
    user.role === 'ADMIN'
      ? {}
      : { tasks: { some: { assignedToId: user.id } } };
  const rows = await prisma.initiative.findMany({
    where,
    include: { tasks: { include: { assignee: true } } },
    orderBy: { startDate: 'desc' },
  });
  return rows.map(serializeInitiative);
}

async function getOne(id, user) {
  const row = await prisma.initiative.findUnique({
    where: { id },
    include: { tasks: { include: { assignee: true } } },
  });
  if (!row) throw new ApiError(404, 'Initiative not found', 'NOT_FOUND');
  const assigned = row.tasks.some((task) => task.assignedToId === user.id);
  if (user.role !== 'ADMIN' && !assigned) throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
  return serializeInitiative(row);
}

async function createTask(initiativeId, input) {
  const initiative = await prisma.initiative.findUnique({ where: { id: initiativeId } });
  if (!initiative) throw new ApiError(404, 'Initiative not found', 'NOT_FOUND');
  const task = await prisma.task.create({
    data: { ...input, initiativeId },
  });
  return serializeTask(task);
}

async function assignTask(taskId, assignedTo) {
  const assignee = await prisma.user.findUnique({ where: { id: assignedTo } });
  if (!assignee || !assignee.isVolunteer) {
    throw new ApiError(400, 'Assignee must be a volunteer', 'VALIDATION_ERROR');
  }
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) throw new ApiError(404, 'Task not found', 'NOT_FOUND');
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId: assignedTo },
    include: { assignee: true },
  });
  await notify(prisma, {
    userId: assignedTo,
    title: 'Task assigned',
    message: `You were assigned “${task.title}”.`,
    type: 'TASK',
    referenceType: 'TASK',
    referenceId: task.id,
  });
  return serializeTask(task);
}

async function updateTask(taskId, user, input) {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing) throw new ApiError(404, 'Task not found', 'NOT_FOUND');
  if (user.role !== 'ADMIN') {
    if (existing.assignedToId !== user.id) throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
    if (Object.keys(input).some((key) => key !== 'status')) {
      throw new ApiError(403, 'Volunteers can update task status only', 'FORBIDDEN');
    }
  }
  const task = await prisma.task.update({
    where: { id: taskId },
    data: input,
    include: { assignee: true },
  });
  return serializeTask(task);
}

async function myTasks(userId) {
  const tasks = await prisma.task.findMany({
    where: { assignedToId: userId },
    include: { assignee: true, initiative: true },
    orderBy: { dueDate: 'asc' },
  });
  return tasks.map((task) => ({ ...serializeTask(task), initiativeName: task.initiative.name }));
}

module.exports = { create, list, getOne, createTask, assignTask, updateTask, myTasks };
