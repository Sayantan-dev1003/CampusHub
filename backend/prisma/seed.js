const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');
const { DEFAULT_PREFS } = require('../src/services/settings.service');

async function main() {
  const password = process.env.SEED_PASSWORD || 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const existingOrg = await prisma.organizationSetting.findFirst();
  if (!existingOrg) {
    await prisma.organizationSetting.create({
      data: {
        organizationName: 'Skyline Student Association',
        description: 'Student organization operating system',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        email: 'hello@skyline.example',
        notificationDefaults: DEFAULT_PREFS,
        socialLinks: [],
      },
    });
  }

  const users = [
    { email: 'admin@campushub.local', name: 'Organization Admin', role: 'ADMIN', isVolunteer: false },
    { email: 'treasurer@campushub.local', name: 'Organization Treasurer', role: 'TREASURER', isVolunteer: false },
    { email: 'member@campushub.local', name: 'Volunteer Member', role: 'MEMBER', isVolunteer: true, studentId: 'STU001' },
    { email: 'student@campushub.local', name: 'Student Member', role: 'MEMBER', isVolunteer: false, studentId: 'STU002' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, isVolunteer: user.isVolunteer },
      create: { ...user, passwordHash, notificationPreferences: DEFAULT_PREFS },
    });
  }

  const existingPlan = await prisma.membershipPlan.findFirst({ where: { name: 'Annual Membership' } });
  if (!existingPlan) {
    await prisma.membershipPlan.create({
      data: {
        name: 'Annual Membership',
        fee: 500,
        durationMonths: 12,
        ticketDiscountPercent: 0,
        merchDiscountPercent: 10,
        renewalReminderDays: 30,
        gracePeriodDays: 7,
        isActive: true,
      },
    });
  }

  console.log('Seed complete. Password for seeded users:', password);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
