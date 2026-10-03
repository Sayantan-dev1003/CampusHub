const prisma = require('../lib/prisma');

const PREF_KEY = {
  MEMBERSHIP: 'membershipReminders',
  EVENT: 'eventReminders',
  ORDER: 'orderUpdates',
  ANNOUNCEMENT: 'announcementAlerts',
  TASK: 'taskNotifications',
  EXPENSE: 'financeNotifications',
};

async function notify(db, { userId, title, message, type, referenceType, referenceId }) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const prefs = user.notificationPreferences || {};
  const key = PREF_KEY[type];
  if (key && prefs[key] === false) return null;
  return db.notification.create({
    data: { userId, title, message, type, referenceType, referenceId },
  });
}

async function notifyMany(db, userIds, payload) {
  const unique = [...new Set(userIds)];
  for (const userId of unique) {
    await notify(db, { ...payload, userId });
  }
}

module.exports = { notify, notifyMany, prisma };
