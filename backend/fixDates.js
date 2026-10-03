const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDates() {
  const memberships = await prisma.membership.findMany({
    include: { plan: true },
    where: { status: 'ACTIVE' }
  });

  for (const m of memberships) {
    if (!m.startDate || !m.endDate) continue;
    
    const correctEnd = new Date(m.startDate);
    correctEnd.setMonth(correctEnd.getMonth() + m.plan.durationMonths);
    
    if (correctEnd.getTime() !== m.endDate.getTime()) {
      await prisma.membership.update({
        where: { id: m.id },
        data: { endDate: correctEnd }
      });
      console.log(`Updated membership ${m.id} endDate to ${correctEnd}`);
    }
  }
}

fixDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
