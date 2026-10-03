const prisma = require('../lib/prisma');
const { money } = require('../lib/money');
const { currentMembership, membershipSummary } = require('./auth.service');
const finance = require('./finance.service');
const memberships = require('./membership.service');

async function memberDashboard(user) {
  const now = new Date();
  const [membership, upcomingEventCount, upcomingEvents, ticketCount, tickets, announcements, orders, openTaskCount, tasks, unread] = await Promise.all([
    currentMembership(user.id),
    prisma.event.count({ where: { status: 'PUBLISHED', startsAt: { gte: now } } }),
    prisma.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 5,
    }),
    prisma.ticket.count({ where: { userId: user.id, status: { in: ['PAID', 'USED'] } } }),
    prisma.ticket.findMany({
      where: { userId: user.id, status: { in: ['PAID', 'USED'] } },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: { status: 'PUBLISHED', audience: { in: ['PUBLIC', 'MEMBERS'] } },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    user.isVolunteer
      ? prisma.task.count({ where: { assignedToId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } } })
      : Promise.resolve(0),
    user.isVolunteer
      ? prisma.task.findMany({
          where: { assignedToId: user.id, status: { in: ['TODO', 'IN_PROGRESS'] } },
          orderBy: { dueDate: 'asc' },
          take: 5,
        })
      : Promise.resolve([]),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);
  return {
    membership: membershipSummary(membership),
    upcomingEventCount,
    upcomingEvents: upcomingEvents.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      venue: event.venue,
    })),
    ticketCount,
    tickets: tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
      eventTitle: ticket.event.title,
      startsAt: ticket.event.startsAt,
    })),
    announcements: announcements.map((row) => ({
      id: row.id,
      title: row.title,
      publishedAt: row.publishedAt,
    })),
    orders: orders.map((order) => ({
      id: order.id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: money(order.totalAmount),
    })),
    openTaskCount,
    tasks: tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, dueDate: task.dueDate })),
    unreadNotifications: unread,
  };
}

async function adminDashboard() {
  const now = new Date();
  
  // Batch 1: Simple Counts
  const [
    totalMembers,
    activeMemberships,
    upcomingEvents,
    ticketsSold,
    openOrders,
    pendingOrders,
    openTasks,
    pendingExpenses,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.membership.count({ where: { status: 'ACTIVE', endDate: { gte: now } } }),
    prisma.event.count({ where: { status: 'PUBLISHED', startsAt: { gte: now } } }),
    prisma.ticket.count({ where: { status: { in: ['PAID', 'USED'] } } }),
    prisma.order.count({ where: { orderStatus: { in: ['PAID', 'PROCESSING', 'READY'] } } }),
    prisma.order.count({ where: { orderStatus: { in: ['PENDING', 'PAID', 'PROCESSING', 'READY'] } } }),
    prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } }),
    prisma.expense.count({ where: { status: 'PENDING' } }),
  ]);

  // Batch 2: Stats and Arrays
  const [
    variants,
    revenue,
    membership,
    upcomingRows,
  ] = await Promise.all([
    prisma.productVariant.findMany({ select: { stockQuantity: true, lowStockThreshold: true } }),
    prisma.transaction.aggregate({ where: { status: 'POSTED', type: 'INCOME' }, _sum: { amount: true } }),
    memberships.stats(),
    prisma.event.findMany({
      where: { status: 'PUBLISHED', startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 5,
    }),
  ]);

  // Batch 3: Complex Includes
  const [
    recentOrderRows,
    initiativeRows,
    announcementRows,
  ] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { productVariant: { include: { product: true } } } } },
    }),
    prisma.initiative.findMany({
      where: { status: { in: ['PLANNED', 'ACTIVE'] } },
      orderBy: { startDate: 'desc' },
      take: 4,
      include: { tasks: true },
    }),
    prisma.announcement.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    }),
  ]);

  const upcomingEventList = [];
  for (const event of upcomingRows) {
    const sold = await prisma.ticket.count({ where: { eventId: event.id, status: { in: ['PAID', 'USED'] } } });
    const checkedIn = await prisma.attendance.count({ where: { eventId: event.id } });
    upcomingEventList.push({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      venue: event.venue,
      capacity: event.capacity,
      ticketsSold: sold,
      checkedIn,
    });
  }

  return {
    totalMembers,
    activeMemberships,
    upcomingEvents,
    ticketsSold,
    openOrders,
    pendingOrders,
    lowStockCount: variants.filter((variant) => variant.stockQuantity <= variant.lowStockThreshold).length,
    openTasks,
    pendingExpenses,
    expiringMemberships: membership.expiringSoon,
    revenue: money(revenue._sum.amount) || 0,
    membership,
    upcomingEventList,
    recentOrders: recentOrderRows.map((order) => ({
      id: order.id,
      totalAmount: money(order.totalAmount),
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.productVariant?.product?.name || 'Item',
        quantity: item.quantity,
      })),
    })),
    initiatives: initiativeRows.map((initiative) => {
      const tasks = initiative.tasks || [];
      const completed = tasks.filter((task) => task.status === 'DONE').length;
      const inProgress = tasks.filter((task) => task.status === 'IN_PROGRESS').length;
      const pending = tasks.filter((task) => task.status === 'TODO').length;
      const tracked = completed + inProgress + pending;
      return {
        id: initiative.id,
        name: initiative.name,
        status: initiative.status,
        completed,
        inProgress,
        pending,
        percent: tracked ? Math.round((completed / tracked) * 100) : 0,
      };
    }),
    announcements: announcementRows.map((row) => ({
      id: row.id,
      title: row.title,
      publishedAt: row.publishedAt,
    })),
  };
}

async function financeDashboard() {
  return finance.summary();
}

module.exports = { memberDashboard, adminDashboard, financeDashboard };
