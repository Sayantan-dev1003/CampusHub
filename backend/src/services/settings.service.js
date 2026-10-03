const prisma = require('../lib/prisma');
const { money } = require('../lib/money');

const DEFAULT_PREFS = {
  eventReminders: true,
  membershipReminders: true,
  orderUpdates: true,
  announcementAlerts: true,
  taskNotifications: true,
  financeNotifications: true,
};

function serializeSettings(row) {
  return {
    id: row.id,
    organizationName: row.organizationName,
    logoUrl: row.logoUrl,
    description: row.description,
    email: row.email,
    phone: row.phone,
    address: row.address,
    website: row.website,
    socialLinks: row.socialLinks,
    currency: row.currency,
    timezone: row.timezone,
    dateFormat: row.dateFormat,
    defaultEventCapacity: row.defaultEventCapacity,
    defaultMemberPrice: money(row.defaultMemberPrice),
    defaultNonMemberPrice: money(row.defaultNonMemberPrice),
    defaultLowStockThreshold: row.defaultLowStockThreshold,
    paymentHoldMinutes: row.paymentHoldMinutes,
    pickupEnabled: row.pickupEnabled,
    deliveryEnabled: row.deliveryEnabled,
    notificationDefaults: row.notificationDefaults,
    updatedAt: row.updatedAt,
  };
}

async function getOrganization() {
  const existing = await prisma.organizationSetting.findFirst();
  if (existing) return existing;
  return prisma.organizationSetting.create({
    data: {
      organizationName: 'Skyline Student Association',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      notificationDefaults: DEFAULT_PREFS,
      socialLinks: [],
    },
  });
}

async function getPublicSettings() {
  return serializeSettings(await getOrganization());
}

async function updateSettings(input) {
  const current = await getOrganization();
  const data = {};
  const fields = [
    'organizationName',
    'logoUrl',
    'description',
    'email',
    'phone',
    'address',
    'website',
    'socialLinks',
    'currency',
    'timezone',
    'dateFormat',
    'defaultEventCapacity',
    'defaultMemberPrice',
    'defaultNonMemberPrice',
    'defaultLowStockThreshold',
    'paymentHoldMinutes',
    'pickupEnabled',
    'deliveryEnabled',
    'notificationDefaults',
  ];
  for (const field of fields) {
    if (input[field] !== undefined) data[field] = input[field];
  }
  const updated = await prisma.organizationSetting.update({
    where: { id: current.id },
    data,
  });
  return serializeSettings(updated);
}

function paymentStatus() {
  const configured = Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_WEBHOOK_SECRET
  );
  return { provider: 'razorpay', mode: 'test', configured };
}

module.exports = {
  DEFAULT_PREFS,
  getOrganization,
  getPublicSettings,
  updateSettings,
  paymentStatus,
  serializeSettings,
};
