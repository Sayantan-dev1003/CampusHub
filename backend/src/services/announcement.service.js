const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { pageParams, sortOrder } = require('../lib/paging');
const { notifyMany } = require('./notify');

function serialize(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    audience: announcement.audience,
    status: announcement.status,
    publishedAt: announcement.publishedAt,
    createdById: announcement.createdById,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
}

async function list(user, query) {
  const { page, limit, skip } = pageParams(query);
  const where = {};
  if (user?.role === 'ADMIN') {
    if (query.status) where.status = query.status;
    if (query.audience) where.audience = query.audience;
  } else if (user) {
    where.status = 'PUBLISHED';
    where.OR = [{ audience: 'PUBLIC' }, { audience: 'MEMBERS' }];
    if (query.audience === 'PUBLIC') where.OR = undefined;
    if (query.audience === 'PUBLIC') where.audience = 'PUBLIC';
  } else {
    where.status = 'PUBLISHED';
    where.audience = 'PUBLIC';
  }
  if (query.search) where.title = { contains: query.search, mode: 'insensitive' };
  const [total, rows] = await prisma.$transaction([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortOrder(query, ['createdAt', 'publishedAt', 'title'], { createdAt: 'desc' }),
    }),
  ]);
  return { data: rows.map(serialize), meta: { page, limit, total } };
}

async function create(userId, input) {
  const row = await prisma.announcement.create({
    data: {
      title: input.title,
      content: input.content,
      audience: input.audience,
      createdById: userId,
      status: 'DRAFT',
    },
  });
  return serialize(row);
}

async function update(id, input) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Announcement not found', 'NOT_FOUND');
  if (existing.status === 'PUBLISHED') {
    throw new ApiError(409, 'Published announcements are archived instead of edited', 'CONFLICT');
  }
  const row = await prisma.announcement.update({ where: { id }, data: input });
  return serialize(row);
}

async function publish(id) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Announcement not found', 'NOT_FOUND');
  const row = existing.status === 'PUBLISHED'
    ? existing
    : await prisma.announcement.update({
        where: { id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
  const users = row.audience === 'PUBLIC'
    ? await prisma.user.findMany({ where: { status: 'ACTIVE' }, select: { id: true } })
    : await prisma.user.findMany({
        where: {
          status: 'ACTIVE',
          memberships: { some: { status: 'ACTIVE', endDate: { gte: new Date() } } },
        },
        select: { id: true },
      });
  const already = await prisma.notification.findMany({
    where: { type: 'ANNOUNCEMENT', referenceId: row.id },
    select: { userId: true },
  });
  const seen = new Set(already.map((note) => note.userId));
  await notifyMany(prisma, users.map((user) => user.id).filter((userId) => !seen.has(userId)), {
    title: row.title,
    message: row.content.slice(0, 240),
    type: 'ANNOUNCEMENT',
    referenceType: 'ANNOUNCEMENT',
    referenceId: row.id,
  });
  return serialize(row);
}

async function archive(id) {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Announcement not found', 'NOT_FOUND');
  const row = await prisma.announcement.update({ where: { id }, data: { status: 'ARCHIVED' } });
  return serialize(row);
}

module.exports = { list, create, update, publish, archive };
