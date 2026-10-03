const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Admin User ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@campushub.com' },
    update: {},
    create: {
      email: 'admin@campushub.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const treasurerUser = await prisma.user.upsert({
    where: { email: 'treasurer@campushub.com' },
    update: {},
    create: {
      email: 'treasurer@campushub.com',
      password: hashedPassword,
      role: 'TREASURER',
    },
  });

  // ── Sample Member ────────────────────────────────────────────
  const memberPassword = await bcrypt.hash('Member@123', 10);

  const memberUser = await prisma.user.upsert({
    where: { email: 'alice@student.edu' },
    update: {},
    create: {
      email: 'alice@student.edu',
      password: memberPassword,
      role: 'MEMBER',
      member: {
        create: {
          studentId: 'STU-001',
          firstName: 'Alice',
          lastName: 'Johnson',
          phone: '+1234567890',
          memberships: {
            create: {
              membershipType: 'Standard',
              status: 'ACTIVE',
              duesAmount: 50.00,
              paymentStatus: 'PAID',
              startDate: new Date('2026-01-01'),
              expiryDate: new Date('2026-12-31'),
              benefits: ['10% ticket discount', '15% merchandise discount'],
            },
          },
        },
      },
    },
  });

  // ── Sample Event ─────────────────────────────────────────────
  const event = await prisma.event.upsert({
    where: { id: 'evt-spring-gala-2026' },
    update: {},
    create: {
      id: 'evt-spring-gala-2026',
      title: 'Spring Gala 2026',
      description: 'Annual Spring Gala - A night of music, dance and celebration!',
      venue: 'University Grand Hall',
      startDate: new Date('2026-04-15T18:00:00'),
      endDate: new Date('2026-04-15T23:00:00'),
      totalCapacity: 200,
      remainingSeats: 200,
      status: 'PUBLISHED',
      memberPrice: 15.00,
      nonMemberPrice: 25.00,
    },
  });

  // ── Sample Products ──────────────────────────────────────────
  const hoodie = await prisma.product.upsert({
    where: { id: 'prod-hoodie' },
    update: {},
    create: {
      id: 'prod-hoodie',
      name: 'CampusHub Hoodie',
      description: 'Premium quality hoodie with CampusHub logo',
      category: 'Clothing',
      price: 45.00,
      memberPrice: 38.00,
      variants: {
        createMany: {
          data: [
            { size: 'S', quantity: 20 },
            { size: 'M', quantity: 30 },
            { size: 'L', quantity: 25 },
            { size: 'XL', quantity: 15 },
          ],
        },
      },
    },
  });

  const tshirt = await prisma.product.upsert({
    where: { id: 'prod-tshirt' },
    update: {},
    create: {
      id: 'prod-tshirt',
      name: 'CampusHub T-Shirt',
      description: 'Comfortable cotton T-shirt with CampusHub branding',
      category: 'Clothing',
      price: 25.00,
      memberPrice: 20.00,
      variants: {
        createMany: {
          data: [
            { size: 'S', quantity: 40 },
            { size: 'M', quantity: 50 },
            { size: 'L', quantity: 40 },
            { size: 'XL', quantity: 30 },
          ],
        },
      },
    },
  });

  // ── Sample Announcement ──────────────────────────────────────
  await prisma.announcement.upsert({
    where: { id: 'ann-welcome-2026' },
    update: {},
    create: {
      id: 'ann-welcome-2026',
      title: 'Welcome to CampusHub!',
      content: 'We are excited to launch our new Student Organization Management System. Stay tuned for upcoming events and announcements!',
      authorId: adminUser.id,
      isPinned: true,
    },
  });

  // ── Sample Initiative ────────────────────────────────────────
  await prisma.initiative.upsert({
    where: { id: 'init-bake-sale-2026' },
    update: {},
    create: {
      id: 'init-bake-sale-2026',
      title: 'Spring Bake Sale Fundraiser',
      description: 'Annual bake sale to raise funds for club activities',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-05'),
    },
  });

  console.log('✅ Seed completed!');
  console.log(`   Admin: admin@campushub.com / Admin@123`);
  console.log(`   Treasurer: treasurer@campushub.com / Admin@123`);
  console.log(`   Member: alice@student.edu / Member@123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
