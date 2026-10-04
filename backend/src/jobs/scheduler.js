const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { addDays, addMinutes } = require('../lib/money');
const { getOrganization } = require('../services/settings.service');
const { notify } = require('../services/notify');

async function expireHolds() {
  const now = new Date();
  const settings = await getOrganization();
  const membershipDeadline = addMinutes(now, -settings.paymentHoldMinutes);

  const expiredTickets = await prisma.ticket.findMany({
    where: { status: 'PENDING', holdExpiresAt: { lt: now } },
    select: { id: true, paymentId: true },
  });
  if (expiredTickets.length) {
    await prisma.ticket.updateMany({
      where: { id: { in: expiredTickets.map((ticket) => ticket.id) } },
      data: { status: 'EXPIRED' },
    });
    const paymentIds = expiredTickets.map((ticket) => ticket.paymentId).filter(Boolean);
    if (paymentIds.length) {
      await prisma.payment.updateMany({
        where: { id: { in: paymentIds }, status: 'CREATED' },
        data: { status: 'FAILED' },
      });
    }
  }

  const expiredOrders = await prisma.order.findMany({
    where: { orderStatus: 'PENDING', holdExpiresAt: { lt: now } },
    select: { id: true, paymentId: true },
  });
  if (expiredOrders.length) {
    await prisma.order.updateMany({
      where: { id: { in: expiredOrders.map((order) => order.id) } },
      data: { orderStatus: 'CANCELLED', paymentStatus: 'FAILED' },
    });
    const paymentIds = expiredOrders.map((order) => order.paymentId).filter(Boolean);
    if (paymentIds.length) {
      await prisma.payment.updateMany({
        where: { id: { in: paymentIds }, status: 'CREATED' },
        data: { status: 'FAILED' },
      });
    }
  }

  const staleMemberships = await prisma.membership.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      payment: { status: 'CREATED', createdAt: { lt: membershipDeadline } },
    },
    select: { id: true, paymentId: true },
  });
  for (const membership of staleMemberships) {
    await prisma.membership.update({
      where: { id: membership.id },
      data: { paymentStatus: 'FAILED' },
    });
    if (membership.paymentId) {
      await prisma.payment.updateMany({
        where: { id: membership.paymentId, status: 'CREATED' },
        data: { status: 'FAILED' },
      });
    }
  }
}

async function expireMemberships() {
  const rows = await prisma.membership.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true },
  });
  const now = new Date();
  for (const membership of rows) {
    if (!membership.endDate) continue;
    if (membership.endDate < now) {
      await prisma.membership.update({ where: { id: membership.id }, data: { status: 'EXPIRED' } });
    }
  }
}

async function sendReminders() {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const memberships = await prisma.membership.findMany({
    where: { status: 'ACTIVE', reminderSentAt: null, endDate: { not: null } },
    include: { plan: true, user: true },
  });
  for (const membership of memberships) {
    const remindAt = addDays(membership.endDate, -membership.plan.renewalReminderDays);
    if (remindAt <= now) {
      await notify(prisma, {
        userId: membership.userId,
        title: 'Membership renewal',
        message: `Your ${membership.plan.name} membership ends on ${membership.endDate.toISOString().slice(0, 10)}.`,
        type: 'MEMBERSHIP',
        referenceType: 'MEMBERSHIP',
        referenceId: membership.id,
      });
      await prisma.membership.update({
        where: { id: membership.id },
        data: { reminderSentAt: now },
      });
    }
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      status: 'PAID',
      event: { startsAt: { gte: now, lte: soon } },
    },
    include: { event: true },
  });
  for (const ticket of tickets) {
    const existing = await prisma.notification.findFirst({
      where: { userId: ticket.userId, type: 'EVENT', referenceId: ticket.id },
    });
    if (existing) continue;
    await notify(prisma, {
      userId: ticket.userId,
      title: 'Event reminder',
      message: `${ticket.event.title} starts ${ticket.event.startsAt.toISOString()}.`,
      type: 'EVENT',
      referenceType: 'TICKET',
      referenceId: ticket.id,
    });
  }
}

async function checkOverdueTasks() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const tasks = await prisma.task.findMany({
    where: {
      status: { in: ['TODO', 'IN_PROGRESS'] },
      dueDate: { lte: tomorrow },
      assignedToId: { not: null }
    },
    include: { initiative: true }
  });

  for (const task of tasks) {
    const existing = await prisma.notification.findFirst({
      where: { userId: task.assignedToId, type: 'TASK', referenceId: task.id, title: 'Overdue task reminder' }
    });
    if (existing) continue;

    await notify(prisma, {
      userId: task.assignedToId,
      title: 'Overdue task reminder',
      message: `Task "${task.title}" in "${task.initiative.name}" is due on ${task.dueDate.toISOString().slice(0, 10)}.`,
      type: 'TASK',
      referenceType: 'TASK',
      referenceId: task.id,
    });
  }
}

function startScheduler() {
  cron.schedule('* * * * *', async () => {
    try {
      await expireHolds();
      await expireMemberships();
      await sendReminders();
      await checkOverdueTasks();
    } catch (error) {
      console.error('Scheduler error', error.message);
    }
  });
}

module.exports = { startScheduler, expireHolds, expireMemberships, sendReminders, checkOverdueTasks };
