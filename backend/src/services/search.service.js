const prisma = require('../lib/prisma');

async function search(user, rawQuery) {
  const q = (rawQuery || '').trim();
  const empty = { events: [], products: [], announcements: [], members: [], orders: [], tickets: [] };
  if (!q) return empty;
  const contains = { contains: q, mode: 'insensitive' };
  const isAdmin = user?.role === 'ADMIN';
  const isTreasurer = user?.role === 'TREASURER';

  const [events, products, announcements] = await Promise.all([
    prisma.event.findMany({
      where: {
        ...(isAdmin ? {} : { status: 'PUBLISHED' }),
        OR: [{ title: contains }, { venue: contains }],
      },
      take: 10,
      orderBy: { startsAt: 'asc' },
    }),
    prisma.product.findMany({
      where: {
        ...(isAdmin ? {} : { status: 'ACTIVE' }),
        OR: [{ name: contains }, { category: contains }],
      },
      take: 10,
    }),
    prisma.announcement.findMany({
      where: {
        title: contains,
        ...(isAdmin
          ? {}
          : user
            ? { status: 'PUBLISHED', audience: { in: ['PUBLIC', 'MEMBERS'] } }
            : { status: 'PUBLISHED', audience: 'PUBLIC' }),
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const result = {
    events: events.map((event) => ({ id: event.id, title: event.title, startsAt: event.startsAt, status: event.status })),
    products: products.map((product) => ({ id: product.id, name: product.name, category: product.category })),
    announcements: announcements.map((row) => ({ id: row.id, title: row.title, publishedAt: row.publishedAt })),
    members: [],
    orders: [],
    tickets: [],
  };

  if (isAdmin) {
    const members = await prisma.user.findMany({
      where: { OR: [{ name: contains }, { email: contains }, { studentId: contains }] },
      take: 10,
    });
    result.members = members.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
    }));
  }

  if (isAdmin || isTreasurer) {
    const [orders, tickets] = await Promise.all([
      prisma.order.findMany({
        where: { OR: [{ id: contains }, { user: { name: contains } }] },
        include: { user: true },
        take: 10,
      }),
      prisma.ticket.findMany({
        where: { OR: [{ id: contains }, { qrToken: contains }, { user: { name: contains } }] },
        include: { user: true, event: true },
        take: 10,
      }),
    ]);
    result.orders = orders.map((order) => ({
      id: order.id,
      orderStatus: order.orderStatus,
      buyer: order.user.name,
    }));
    result.tickets = tickets.map((ticket) => ({
      id: ticket.id,
      status: ticket.status,
      eventTitle: ticket.event.title,
      holder: ticket.user.name,
    }));
  }

  return result;
}

module.exports = { search };
