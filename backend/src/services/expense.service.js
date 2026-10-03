const prisma = require('../config/db');

/**
 * Submit an expense claim
 */
const submitExpense = async ({ memberId, amount, category, description, receiptUrl }, submittedById) => {
  return prisma.expense.create({
    data: {
      memberId,
      submittedById,
      amount: Number(amount),
      category,
      description,
      receiptUrl,
      status: 'PENDING',
    },
    include: {
      member: { select: { firstName: true, lastName: true } },
      submittedBy: { select: { email: true } },
    },
  });
};

/**
 * Get all expenses with filters
 */
const getAllExpenses = async ({ page = 1, limit = 20, status, memberId }) => {
  const skip = (page - 1) * limit;
  const where = {
    ...(status && { status }),
    ...(memberId && { memberId }),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        member: { select: { firstName: true, lastName: true, studentId: true } },
        submittedBy: { select: { email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.expense.count({ where }),
  ]);

  return { expenses, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

/**
 * Get expense by ID
 */
const getExpenseById = async (id) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      member: { select: { firstName: true, lastName: true } },
      submittedBy: { select: { email: true } },
    },
  });
  if (!expense) throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
  return expense;
};

/**
 * Approve or reject expense (treasurer/admin)
 */
const reviewExpense = async (id, { status, reviewedBy }) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw Object.assign(new Error('Status must be APPROVED or REJECTED'), { statusCode: 400 });
  }

  return prisma.expense.update({
    where: { id },
    data: { status, reviewedBy, reviewedAt: new Date() },
  });
};

/**
 * Mark expense as reimbursed and record transaction
 */
const reimburseExpense = async (id, createdById) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw Object.assign(new Error('Expense not found'), { statusCode: 404 });
  if (expense.status !== 'APPROVED') {
    throw Object.assign(new Error('Only approved expenses can be reimbursed'), { statusCode: 400 });
  }
  if (expense.reimbursedAt) {
    throw Object.assign(new Error('Expense has already been reimbursed'), { statusCode: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.expense.update({
      where: { id },
      data: { status: 'REIMBURSED', reimbursedAt: new Date() },
    }),
    prisma.transaction.create({
      data: {
        type: 'REIMBURSEMENT',
        direction: 'EXPENSE',
        amount: expense.amount,
        description: `Reimbursement for expense: ${expense.description}`,
        createdById,
        expenseId: expense.id,
      },
    }),
  ]);

  return updated;
};

module.exports = { submitExpense, getAllExpenses, getExpenseById, reviewExpense, reimburseExpense };
