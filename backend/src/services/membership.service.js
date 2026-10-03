const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { money } = require('../lib/money');

function serializePlan(plan) {
  return {
    id: plan.id,
    name: plan.name,
    fee: money(plan.fee),
    durationMonths: plan.durationMonths,
    ticketDiscountPercent: money(plan.ticketDiscountPercent),
    merchDiscountPercent: money(plan.merchDiscountPercent),
    renewalReminderDays: plan.renewalReminderDays,
    isActive: plan.isActive,
  };
}

function serializeMembership(membership) {
  return {
    id: membership.id,
    userId: membership.userId,
    planId: membership.planId,
    planName: membership.plan?.name,
    startDate: membership.startDate,
    endDate: membership.endDate,
    duesAmount: money(membership.duesAmount),
    paymentStatus: membership.paymentStatus,
    status: membership.status,
    benefits: membership.plan
      ? {
          ticketDiscountPercent: money(membership.plan.ticketDiscountPercent),
          merchDiscountPercent: money(membership.plan.merchDiscountPercent),
        }
      : null,
  };
}

async function listPlans(user, activeOnly) {
  const where = !user || user.role !== 'ADMIN' || activeOnly ? { isActive: true } : {};
  const plans = await prisma.membershipPlan.findMany({ where, orderBy: { fee: 'asc' } });
  return plans.map(serializePlan);
}

async function createPlan(input) {
  const plan = await prisma.membershipPlan.create({ data: input });
  return serializePlan(plan);
}

async function updatePlan(planId, input) {
  const existing = await prisma.membershipPlan.findUnique({ where: { id: planId } });
  if (!existing) throw new ApiError(404, 'Membership plan not found', 'NOT_FOUND');
  const plan = await prisma.membershipPlan.update({ where: { id: planId }, data: input });
  return serializePlan(plan);
}

async function getMembership(memberId) {
  const membership = await prisma.membership.findFirst({
    where: { userId: memberId },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
  return membership ? serializeMembership(membership) : null;
}

async function stats() {
  const now = new Date();
  const [planCount, active, expired, unpaid] = await Promise.all([
    prisma.membershipPlan.count(),
    prisma.membership.count({ where: { status: 'ACTIVE' } }),
    prisma.membership.count({ where: { status: 'EXPIRED' } }),
    prisma.membership.count({ where: { paymentStatus: { in: ['PENDING', 'FAILED'] }, status: { not: 'ACTIVE' } } }),
  ]);
  
  // For expiring soon, we fetch active rows but only necessary fields to keep it fast
  const activeRows = await prisma.membership.findMany({
    where: { status: 'ACTIVE', endDate: { gte: now } },
    include: { plan: true },
  });
  const expiringSoon = activeRows.filter((row) => {
    if (!row.endDate || !row.plan) return false;
    const windowMs = row.plan.renewalReminderDays * 24 * 60 * 60 * 1000;
    return row.endDate.getTime() - now.getTime() <= windowMs;
  }).length;

  return {
    active,
    expiringSoon,
    expired,
    unpaid,
    planCount,
  };
}

async function suspend(membershipId) {
  const existing = await prisma.membership.findUnique({ where: { id: membershipId }, include: { plan: true } });
  if (!existing) throw new ApiError(404, 'Membership not found', 'NOT_FOUND');
  const membership = await prisma.membership.update({
    where: { id: membershipId },
    data: { status: 'SUSPENDED' },
    include: { plan: true },
  });
  return serializeMembership(membership);
}

async function approve(memberId, planName = 'Silver') {
  // Find or create the plan based on name
  let plan = await prisma.membershipPlan.findFirst({ where: { name: planName } });
  if (!plan) {
    plan = await prisma.membershipPlan.create({
      data: {
        name: planName,
        fee: 500,
        durationMonths: 12,
        ticketDiscountPercent: 10,
        merchDiscountPercent: 5,
        renewalReminderDays: 30,
        isActive: true,
      }
    });
  }

    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);

    const existing = await prisma.membership.findFirst({ where: { userId: memberId } });
    
    if (existing) {
      const membership = await prisma.membership.update({
        where: { id: existing.id },
        data: { status: 'PENDING', paymentStatus: 'PENDING', planId: plan.id, startDate: start, endDate: end },
        include: { plan: true },
      });
      return serializeMembership(membership);
    } else {
      const membership = await prisma.membership.create({
        data: {
          userId: memberId,
          planId: plan.id,
          duesAmount: plan.fee,
          paymentStatus: 'PENDING',
          status: 'PENDING',
          startDate: start,
          endDate: end,
        },
        include: { plan: true },
      });
      return serializeMembership(membership);
    }
}

async function request(memberId, planName) {
  let plan = await prisma.membershipPlan.findFirst({ where: { name: planName } });
  if (!plan) throw new ApiError(404, 'Plan not found', 'NOT_FOUND');
  
  const existing = await prisma.membership.findFirst({ where: { userId: memberId } });
  if (existing) {
    const membership = await prisma.membership.update({
      where: { id: existing.id },
      data: { status: 'AWAITING_APPROVAL', planId: plan.id, duesAmount: plan.fee },
      include: { plan: true },
    });
    return serializeMembership(membership);
  } else {
    const membership = await prisma.membership.create({
      data: {
        userId: memberId,
        planId: plan.id,
        duesAmount: plan.fee,
        paymentStatus: 'PENDING',
        status: 'AWAITING_APPROVAL',
      },
      include: { plan: true },
    });
    return serializeMembership(membership);
  }
}

module.exports = {
  serializePlan,
  serializeMembership,
  listPlans,
  createPlan,
  updatePlan,
  getMembership,
  stats,
  suspend,
  approve,
  request,
  pay: async (memberId) => {
    const existing = await prisma.membership.findFirst({ where: { userId: memberId }, include: { plan: true } });
    if (!existing) throw new ApiError(404, 'Membership not found', 'NOT_FOUND');
    
    return prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          userId: memberId,
          purpose: 'MEMBERSHIP',
          amount: existing.duesAmount,
          currency: 'INR',
          status: 'PAID',
          referenceType: 'MEMBERSHIP',
          referenceId: existing.id,
        }
      });
      
      // 2. Create Transaction
      await tx.transaction.create({
        data: {
          userId: memberId,
          paymentId: payment.id,
          type: 'INCOME',
          category: 'MEMBERSHIP',
          referenceType: 'MEMBERSHIP',
          referenceId: existing.id,
          amount: existing.duesAmount,
          currency: 'INR',
          description: `Membership payment for ${existing.plan.name} plan`,
          status: 'POSTED',
        }
      });

      // 3. Update Membership
      const d = new Date();
      d.setMonth(d.getMonth() + existing.plan.durationMonths);
      
      const membership = await tx.membership.update({
        where: { id: existing.id },
        data: { 
          status: 'ACTIVE', 
          paymentStatus: 'PAID',
          paymentId: payment.id,
          startDate: new Date(),
          endDate: d
        },
        include: { plan: true },
      });
      
      // 4. Update User isMember
      await tx.user.update({
        where: { id: memberId },
        data: { isMember: true }
      });
      
      return serializeMembership(membership);
    });
  }
};
