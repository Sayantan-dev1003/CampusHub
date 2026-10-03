const prisma = require('../config/db');

/**
 * Get the semester-end financial dashboard summary
 */
const getDashboard = async ({ startDate, endDate } = {}) => {
  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };
  const where = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

  // Total income by type
  const incomeByType = await prisma.transaction.groupBy({
    by: ['type'],
    where: { ...where, direction: 'INCOME' },
    _sum: { amount: true },
    _count: { id: true },
  });

  // Total expenses
  const expenseTotal = await prisma.transaction.aggregate({
    where: { ...where, direction: 'EXPENSE' },
    _sum: { amount: true },
  });

  // Total income
  const incomeTotal = await prisma.transaction.aggregate({
    where: { ...where, direction: 'INCOME' },
    _sum: { amount: true },
  });

  // Pending reimbursements
  const pendingReimbursements = await prisma.expense.aggregate({
    where: { status: 'APPROVED' },
    _sum: { amount: true },
    _count: { id: true },
  });

  const totalIncome = incomeTotal._sum.amount || 0;
  const totalExpenses = expenseTotal._sum.amount || 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    pendingReimbursements: {
      amount: pendingReimbursements._sum.amount || 0,
      count: pendingReimbursements._count.id,
    },
    breakdown: incomeByType.map((t) => ({
      type: t.type,
      total: t._sum.amount,
      count: t._count.id,
    })),
  };
};

/**
 * Get all transactions (paginated)
 */
const getTransactions = async ({ page = 1, limit = 20, type, direction, startDate, endDate }) => {
  const skip = (page - 1) * limit;
  const dateFilter = {
    ...(startDate && { gte: new Date(startDate) }),
    ...(endDate && { lte: new Date(endDate) }),
  };

  const where = {
    ...(type && { type }),
    ...(direction && { direction }),
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      skip,
      take: Number(limit),
      include: { createdBy: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Create a manual transaction (e.g. fundraising cash income)
 */
const createManualTransaction = async ({ type, direction, amount, description, reference }, createdById) => {
  return prisma.transaction.create({
    data: { type, direction, amount: Number(amount), description, reference, createdById },
  });
};

module.exports = { getDashboard, getTransactions, createManualTransaction };
