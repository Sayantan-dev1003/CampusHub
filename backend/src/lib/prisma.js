const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function runTransaction(fn, options = {}) {
  return prisma.$transaction(fn, { maxWait: 15000, timeout: 30000, ...options });
}

prisma.runTransaction = runTransaction;

module.exports = prisma;
