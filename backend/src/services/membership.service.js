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
    gracePeriodDays: plan.gracePeriodDays,
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
  const plans = await prisma.membershipPlan.findMany();
  const activeRows = await prisma.membership.findMany({
    where: { status: 'ACTIVE' },
    include: { plan: true },
  });
  const expiringSoon = activeRows.filter((row) => {
    if (!row.endDate) return false;
    const windowMs = row.plan.renewalReminderDays * 24 * 60 * 60 * 1000;
    return row.endDate.getTime() - now.getTime() <= windowMs && row.endDate >= now;
  }).length;
  const [expired, unpaid] = await Promise.all([
    prisma.membership.count({ where: { status: 'EXPIRED' } }),
    prisma.membership.count({ where: { paymentStatus: { in: ['PENDING', 'FAILED'] }, status: { not: 'ACTIVE' } } }),
  ]);
  return {
    active: activeRows.length,
    expiringSoon,
    expired,
    unpaid,
    planCount: plans.length,
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

module.exports = {
  serializePlan,
  serializeMembership,
  listPlans,
  createPlan,
  updatePlan,
  getMembership,
  stats,
  suspend,
};
