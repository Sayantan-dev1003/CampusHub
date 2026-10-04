const prisma = require('../lib/prisma');
const { ApiError } = require('../lib/errors');
const { money } = require('../lib/money');
const { pageParams, sortOrder } = require('../lib/paging');
const { getOrganization } = require('./settings.service');
const { notify } = require('./notify');
const { readableUrl } = require('./upload.service');

function serializeExpense(expense) {
  return {
    id: expense.id,
    submittedById: expense.submittedById,
    submitterName: expense.submitter?.name,
    initiativeId: expense.initiativeId,
    title: expense.title,
    category: expense.category,
    description: expense.description,
    amount: money(expense.amount),
    receiptUrl: expense.receiptUrl,
    status: expense.status,
    adminNote: expense.adminNote,
    rejectionReason: expense.rejectionReason,
    reimbursementMode: expense.reimbursementMode,
    transactionRef: expense.transactionRef,
    approvedById: expense.approvedById,
    reviewedAt: expense.reviewedAt,
    reimbursedAt: expense.reimbursedAt,
    transactionId: expense.transactionId,
    createdAt: expense.createdAt,
  };
}

function serializeTransaction(row) {
  return {
    id: row.id,
    userId: row.userId,
    paymentId: row.paymentId,
    type: row.type,
    category: row.category,
    referenceType: row.referenceType,
    referenceId: row.referenceId,
    amount: money(row.amount),
    currency: String(row.currency).trim(),
    description: row.description,
    status: row.status,
    createdAt: row.createdAt,
  };
}

async function presentExpense(expense) {
  const data = serializeExpense(expense);
  data.receiptUrl = await readableUrl(data.receiptUrl);
  return data;
}

async function submitExpense(user, input, receiptUrl) {
  if (input.initiativeId) {
    const initiative = await prisma.initiative.findUnique({ where: { id: input.initiativeId } });
    if (!initiative) throw new ApiError(404, 'Initiative not found', 'NOT_FOUND');
  }
  const settings = await getOrganization();
  if (user.role === 'TREASURER') {
    const updated = await prisma.runTransaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          submittedById: user.id,
          initiativeId: input.initiativeId,
          title: input.title || 'Expense Claim',
          category: input.category,
          description: input.description,
          amount: input.amount,
          receiptUrl,
          status: 'REIMBURSED',
          approvedById: user.id,
          reviewedAt: new Date(),
          reimbursedAt: new Date(),
        },
      });
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'EXPENSE',
          category: mapExpenseCategory(input.category),
          referenceType: 'EXPENSE',
          referenceId: expense.id,
          amount: input.amount,
          currency: settings.currency,
          description: input.description,
          status: 'POSTED',
        },
      });
      const updated = await tx.expense.update({
        where: { id: expense.id },
        data: { transactionId: transaction.id },
        include: { submitter: true },
      });
      return updated;
    });
    return presentExpense(updated);
  }

  const expense = await prisma.expense.create({
    data: {
      submittedById: user.id,
      initiativeId: input.initiativeId,
      title: input.title || 'Expense Claim',
      category: input.category,
      description: input.description,
      amount: input.amount,
      receiptUrl,
      status: 'PENDING',
    },
    include: { submitter: true },
  });

  // Notify treasurers and admins
  const staff = await prisma.user.findMany({
    where: { role: { in: ['TREASURER', 'ADMIN'] } },
    select: { id: true },
  });
  for (const s of staff) {
    await notify(prisma, {
      userId: s.id,
      title: 'New Expense Claim',
      message: `${user.name || 'A user'} submitted a new expense claim for ${input.amount}.`,
      type: 'SYSTEM',
      referenceType: 'EXPENSE',
      referenceId: expense.id,
    });
  }

  return presentExpense(expense);
}

function mapExpenseCategory(category) {
  const allowed = ['EVENT_COST', 'SUPPLIES', 'REIMBURSEMENT', 'TRANSPORT', 'PRINTING', 'FOOD', 'OTHER'];
  const normalized = String(category || '').toUpperCase();
  return allowed.includes(normalized) ? normalized : 'OTHER';
}

async function listExpenses(user, query) {
  const { page, limit, skip } = pageParams(query);
  const where = {};
  if (user.role !== 'TREASURER' && user.role !== 'ADMIN') where.submittedById = user.id;
  else if (query.mine === 'true') where.submittedById = user.id;
  if (query.status) where.status = query.status;
  const [total, rows] = await prisma.$transaction([
    prisma.expense.count({ where }),
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      include: { submitter: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { data: await Promise.all(rows.map(presentExpense)), meta: { page, limit, total } };
}

async function review(expenseId, reviewerId, status, note) {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId }, include: { submitter: true } });
  if (!expense) throw new ApiError(404, 'Expense not found', 'NOT_FOUND');
  if (expense.status !== 'PENDING') throw new ApiError(409, 'Only pending expenses can be reviewed', 'CONFLICT');
  const updated = await prisma.expense.update({
    where: { id: expenseId },
    data: { 
      status, 
      approvedById: reviewerId, 
      reviewedAt: new Date(),
      rejectionReason: status === 'REJECTED' ? note : null,
      adminNote: status === 'APPROVED' ? note : null
    },
    include: { submitter: true },
  });
  
  let msg = `Your expense claim was ${status.toLowerCase()}.`;
  if (status === 'REJECTED' && note) msg = `Your expense claim was rejected. Reason: ${note}`;
  if (status === 'APPROVED' && note) msg = `Your expense claim was approved. Note: ${note}`;

  await notify(prisma, {
    userId: expense.submittedById,
    title: `Expense ${status.toLowerCase()}`,
    message: msg,
    type: 'EXPENSE',
    referenceType: 'EXPENSE',
    referenceId: expense.id,
  });
  return presentExpense(updated);
}

async function reimburse(expenseId, reviewerId, reimbursementMode, transactionRef) {
  const settings = await getOrganization();
  const updated = await prisma.runTransaction(async (tx) => {
    const expense = await tx.expense.findUnique({ where: { id: expenseId }, include: { submitter: true } });
    if (!expense) throw new ApiError(404, 'Expense not found', 'NOT_FOUND');
    if (expense.status !== 'APPROVED') {
      throw new ApiError(409, 'Only approved expenses can be reimbursed', 'CONFLICT');
    }
    const transaction = await tx.transaction.create({
      data: {
        userId: expense.submittedById,
        type: 'EXPENSE',
        category: 'REIMBURSEMENT',
        referenceType: 'EXPENSE',
        referenceId: expense.id,
        amount: expense.amount,
        currency: settings.currency,
        description: expense.description,
        status: 'POSTED',
      },
    });
    const updated = await tx.expense.update({
      where: { id: expenseId },
      data: {
        status: 'REIMBURSED',
        reimbursedAt: new Date(),
        transactionId: transaction.id,
        reimbursementMode,
        transactionRef,
        approvedById: expense.approvedById || reviewerId,
      },
      include: { submitter: true },
    });
    return updated;
  });
  await notify(prisma, {
    userId: updated.submittedById,
    title: 'Expense reimbursed',
    message: 'Your expense was marked reimbursed.',
    type: 'EXPENSE',
    referenceType: 'EXPENSE',
    referenceId: updated.id,
  });
  return presentExpense(updated);
}

async function recordIncome(userId, input) {
  if (input.initiativeId) {
    const initiative = await prisma.initiative.findUnique({ where: { id: input.initiativeId } });
    if (!initiative) throw new ApiError(404, 'Initiative not found', 'NOT_FOUND');
  }
  const settings = await getOrganization();
  const category = ['FUNDRAISER', 'OTHER'].includes(input.category) ? input.category : 'FUNDRAISER';
  const row = await prisma.transaction.create({
    data: {
      userId,
      type: 'INCOME',
      category,
      referenceType: input.initiativeId ? 'INITIATIVE' : 'MANUAL',
      referenceId: input.initiativeId || userId,
      amount: input.amount,
      currency: settings.currency,
      description: input.description,
      status: 'POSTED',
    },
  });
  return serializeTransaction(row);
}

async function listTransactions(query) {
  const { page, limit, skip } = pageParams(query);
  const where = { status: 'POSTED' };
  if (query.type) where.type = query.type;
  if (query.category) where.category = query.category;
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }
  const [total, rows] = await prisma.$transaction([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: sortOrder(query, ['createdAt', 'amount'], { createdAt: 'desc' }),
    }),
  ]);
  return { data: rows.map(serializeTransaction), meta: { page, limit, total } };
}

async function summary() {
  const [income, expenses, pending, incomeGroups, expenseGroups, recent] = await Promise.all([
    prisma.transaction.aggregate({ where: { status: 'POSTED', type: 'INCOME' }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { status: 'POSTED', type: 'EXPENSE' }, _sum: { amount: true } }),
    prisma.expense.aggregate({
      where: { status: { in: ['PENDING', 'APPROVED'] } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: { status: 'POSTED', type: 'INCOME' },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['category'],
      where: { status: 'POSTED', type: 'EXPENSE' },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({ where: { status: 'POSTED' }, orderBy: { createdAt: 'desc' }, take: 10 }),
  ]);
  const incomeTotal = money(income._sum.amount) || 0;
  const expenseTotal = money(expenses._sum.amount) || 0;
  return {
    income: incomeTotal,
    expenses: expenseTotal,
    balance: Math.round((incomeTotal - expenseTotal) * 100) / 100,
    pendingReimbursements: money(pending._sum.amount) || 0,
    revenueBySource: incomeGroups.map((row) => ({ category: row.category, amount: money(row._sum.amount) || 0 })),
    expensesByCategory: expenseGroups.map((row) => ({ category: row.category, amount: money(row._sum.amount) || 0 })),
    recentTransactions: recent.map(serializeTransaction),
  };
}

module.exports = {
  submitExpense,
  listExpenses,
  review,
  reimburse,
  recordIncome,
  listTransactions,
  summary,
};
