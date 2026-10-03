const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { pageParams } = require('../lib/paging');

function serialize(row) {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    isRead: row.isRead,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    createdAt: row.createdAt,
  };
}

async function list(userId, query) {
  const { page, limit, skip } = pageParams(query);
  const where = { userId };
  if (query.unread === 'true') where.isRead = false;
  const [total, unread, rows] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
  ]);
  return { data: rows.map(serialize), meta: { page, limit, total, unread } };
}

async function markRead(userId, notificationId) {
  const row = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!row || row.userId !== userId) throw new ApiError(404, 'Notification not found', 'NOT_FOUND');
  const updated = await prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
  return serialize(updated);
}

async function markAllRead(userId) {
  const result = await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
  return { updated: result.count };
}

module.exports = { list, markRead, markAllRead };
