const prisma = require('../config/db');

/**
 * Create an announcement
 */
const createAnnouncement = async ({ title, content, isPinned }, authorId) => {
  return prisma.announcement.create({
    data: { title, content, isPinned: !!isPinned, authorId },
    include: { author: { select: { email: true, member: { select: { firstName: true, lastName: true } } } } },
  });
};

/**
 * Get all announcements (paginated)
 */
const getAllAnnouncements = async ({ page = 1, limit = 20, pinned }) => {
  const skip = (page - 1) * limit;
  const where = { ...(pinned === 'true' && { isPinned: true }) };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      include: {
        author: {
          select: {
            member: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return { announcements, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get announcement by ID
 */
const getAnnouncementById = async (id) => {
  const ann = await prisma.announcement.findUnique({
    where: { id },
    include: { author: { select: { email: true, member: { select: { firstName: true, lastName: true } } } } },
  });
  if (!ann) throw Object.assign(new Error('Announcement not found'), { statusCode: 404 });
  return ann;
};

/**
 * Update an announcement
 */
const updateAnnouncement = async (id, data, requestingUser) => {
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) throw Object.assign(new Error('Announcement not found'), { statusCode: 404 });

  // Only author or admin can update
  if (requestingUser.role === 'MEMBER' || (requestingUser.role !== 'ADMIN' && ann.authorId !== requestingUser.id)) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  return prisma.announcement.update({ where: { id }, data });
};

/**
 * Delete an announcement
 */
const deleteAnnouncement = async (id) => {
  const ann = await prisma.announcement.findUnique({ where: { id } });
  if (!ann) throw Object.assign(new Error('Announcement not found'), { statusCode: 404 });
  return prisma.announcement.delete({ where: { id } });
};

module.exports = { createAnnouncement, getAllAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement };
