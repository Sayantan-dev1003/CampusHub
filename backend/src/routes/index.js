const express = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../lib/asyncHandler');
const { sendData, sendList } = require('../lib/http');
const { ApiError } = require('../lib/errors');
const { validateBody } = require('../middleware/validate');
const { requireAuth, optionalAuth, requireRoles, requireVolunteer } = require('../middleware/auth');
const { upload, maybeSingle } = require('../middleware/upload');
const schemas = require('../validators/schemas');

const auth = require('../services/auth.service');
const members = require('../services/member.service');
const memberships = require('../services/membership.service');
const events = require('../services/event.service');
const tickets = require('../services/ticket.service');
const payments = require('../services/payment.service');
const announcements = require('../services/announcement.service');
const products = require('../services/product.service');
const orders = require('../services/order.service');
const initiatives = require('../services/initiative.service');
const finance = require('../services/finance.service');
const dashboards = require('../services/dashboard.service');
const notifications = require('../services/notification.service');
const search = require('../services/search.service');
const settings = require('../services/settings.service');
const uploads = require('../services/upload.service');
const { setAuthCookie, clearAuthCookie } = require('../lib/authCookie');

const router = express.Router();
const admin = requireRoles('ADMIN');
const treasurer = requireRoles('TREASURER');
const member = requireRoles('MEMBER');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

function requireAdminOrVolunteer(req, res, next) {
  if (req.user.role === 'ADMIN' || req.user.isVolunteer) return next();
  return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
}

function requireExpenseSubmit(req, res, next) {
  if (req.user.role === 'TREASURER' || req.user.isVolunteer) return next();
  return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
}

function requireSelfOrStaff(param, writeRoles = ['ADMIN']) {
  return (req, res, next) => {
    if (req.user.id === req.params[param] || writeRoles.includes(req.user.role) || req.user.role === 'TREASURER' || req.user.role === 'ADMIN') {
      return next();
    }
    return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
  };
}

router.get('/health', (req, res) => {
  sendData(res, { status: 'ok' });
});

router.post('/auth/register', validateBody(schemas.registerSchema), asyncHandler(async (req, res) => {
  const result = await auth.register(req.body);
  setAuthCookie(res, result.token, true);
  sendData(res, result, 'Account created successfully', 201);
}));
router.post('/auth/login', loginLimiter, validateBody(schemas.loginSchema), asyncHandler(async (req, res) => {
  const result = await auth.login(req.body);
  setAuthCookie(res, result.token, req.body.remember !== false);
  sendData(res, result, 'Logged in');
}));
router.get('/auth/me', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await auth.me(req.user.id));
}));
router.post('/auth/password', requireAuth, validateBody(schemas.passwordSchema), asyncHandler(async (req, res) => {
  sendData(res, await auth.changePassword(req.user.id, req.body), 'Password updated');
}));
router.post('/auth/logout', requireAuth, (req, res) => {
  clearAuthCookie(res);
  sendData(res, { loggedOut: true }, 'Logged out');
});

router.get('/members', requireAuth, requireRoles('ADMIN', 'TREASURER'), asyncHandler(async (req, res) => {
  const result = await members.listMembers(req.query);
  sendList(res, result.data, result.meta);
}));
router.get('/members/:memberId', requireAuth, requireSelfOrStaff('memberId'), asyncHandler(async (req, res) => {
  sendData(res, await members.getMember(req.params.memberId));
}));
router.patch('/users/me', requireAuth, validateBody(schemas.profileSchema), asyncHandler(async (req, res) => {
  sendData(res, await members.updateMe(req.user.id, req.body), 'Profile updated');
}));
router.patch('/members/:memberId', requireAuth, admin, validateBody(schemas.memberPatchSchema), asyncHandler(async (req, res) => {
  sendData(res, await members.updateMember(req.params.memberId, req.body), 'Member updated');
}));
router.patch('/members/:memberId/status', requireAuth, admin, validateBody(schemas.statusSchema), asyncHandler(async (req, res) => {
  sendData(res, await members.updateStatus(req.params.memberId, req.body.status), 'Member status updated');
}));
router.patch('/users/:userId/role', requireAuth, admin, validateBody(schemas.roleSchema), asyncHandler(async (req, res) => {
  sendData(res, await members.updateRole(req.user.id, req.params.userId, req.body), 'Role updated');
}));

router.get('/membership-plans', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, await memberships.listPlans(req.user, req.query.active === 'true' || !req.user || req.user.role !== 'ADMIN'));
}));
router.post('/membership-plans', requireAuth, admin, validateBody(schemas.planSchema), asyncHandler(async (req, res) => {
  sendData(res, await memberships.createPlan(req.body), 'Plan created', 201);
}));
router.patch('/membership-plans/:planId', requireAuth, admin, validateBody(schemas.planPatchSchema), asyncHandler(async (req, res) => {
  sendData(res, await memberships.updatePlan(req.params.planId, req.body), 'Plan updated');
}));
router.get('/members/:memberId/membership', requireAuth, requireSelfOrStaff('memberId'), asyncHandler(async (req, res) => {
  sendData(res, await memberships.getMembership(req.params.memberId));
}));
router.get('/memberships/stats', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await memberships.stats());
}));
router.post('/memberships/:membershipId/suspend', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await memberships.suspend(req.params.membershipId), 'Membership suspended');
}));

router.get('/events', optionalAuth, asyncHandler(async (req, res) => {
  const result = await events.listEvents(req.user, req.query);
  sendList(res, result.data, result.meta);
}));
router.post('/events', requireAuth, admin, validateBody(schemas.eventSchema), asyncHandler(async (req, res) => {
  sendData(res, await events.createEvent(req.user.id, {
    ...req.body,
    startsAt: new Date(req.body.startsAt),
    endsAt: new Date(req.body.endsAt),
  }), 'Event created successfully', 201);
}));
router.get('/events/:eventId/analytics', requireAuth, requireRoles('ADMIN', 'TREASURER'), asyncHandler(async (req, res) => {
  sendData(res, await events.analytics(req.params.eventId));
}));
router.get('/events/:eventId/attendance', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await tickets.attendance(req.params.eventId));
}));
router.get('/events/:eventId', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, await events.getEvent(req.params.eventId, req.user));
}));
router.patch('/events/:eventId/status', requireAuth, admin, validateBody(schemas.eventStatusSchema), asyncHandler(async (req, res) => {
  sendData(res, await events.updateEventStatus(req.params.eventId, req.body.status), 'Event status updated');
}));
router.patch('/events/:eventId', requireAuth, admin, validateBody(schemas.eventPatchSchema), asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.startsAt) data.startsAt = new Date(data.startsAt);
  if (data.endsAt) data.endsAt = new Date(data.endsAt);
  sendData(res, await events.updateEvent(req.params.eventId, data), 'Event updated');
}));

router.get('/tickets/my', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await tickets.myTickets(req.user.id));
}));
router.get('/tickets/:ticketId', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await tickets.getTicket(req.params.ticketId, req.user));
}));
router.post('/tickets/check-in', requireAuth, admin, validateBody(schemas.checkInSchema), asyncHandler(async (req, res) => {
  sendData(res, await tickets.checkIn(req.user.id, req.body.qrToken), 'Checked in');
}));

router.post('/payments/orders', requireAuth, validateBody(schemas.paymentOrderSchema), asyncHandler(async (req, res) => {
  sendData(res, await payments.createPaymentOrder(req.user, req.body), 'Payment order created', 201);
}));
router.post('/payments/verify', requireAuth, validateBody(schemas.verifySchema), asyncHandler(async (req, res) => {
  sendData(res, await payments.verifyPayment(req.user, req.body), 'Payment verified');
}));
router.post('/payments/webhook', asyncHandler(async (req, res) => {
  const data = await payments.handleWebhook(req.rawBody || Buffer.from(JSON.stringify(req.body || {})), req.headers['x-razorpay-signature']);
  sendData(res, data, 'Webhook received');
}));

router.get('/announcements', optionalAuth, asyncHandler(async (req, res) => {
  const result = await announcements.list(req.user, req.query);
  sendList(res, result.data, result.meta);
}));
router.post('/announcements', requireAuth, admin, validateBody(schemas.announcementSchema), asyncHandler(async (req, res) => {
  sendData(res, await announcements.create(req.user.id, req.body), 'Announcement created', 201);
}));
router.patch('/announcements/:announcementId', requireAuth, admin, validateBody(schemas.announcementPatchSchema), asyncHandler(async (req, res) => {
  sendData(res, await announcements.update(req.params.announcementId, req.body), 'Announcement updated');
}));
router.post('/announcements/:announcementId/publish', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await announcements.publish(req.params.announcementId), 'Announcement published');
}));
router.post('/announcements/:announcementId/archive', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await announcements.archive(req.params.announcementId), 'Announcement archived');
}));

router.get('/products', optionalAuth, asyncHandler(async (req, res) => {
  const result = await products.listProducts(req.user, req.query);
  sendList(res, result.data, result.meta);
}));
router.get('/products/:productId', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, await products.getProduct(req.params.productId, req.user));
}));
router.post('/products', requireAuth, admin, validateBody(schemas.productSchema), asyncHandler(async (req, res) => {
  sendData(res, await products.createProduct(req.body), 'Product created', 201);
}));
router.patch('/products/:productId', requireAuth, admin, validateBody(schemas.productPatchSchema), asyncHandler(async (req, res) => {
  sendData(res, await products.updateProduct(req.params.productId, req.body), 'Product updated');
}));
router.post('/products/:productId/variants', requireAuth, admin, validateBody(schemas.variantInput), asyncHandler(async (req, res) => {
  sendData(res, await products.addVariant(req.params.productId, req.body), 'Variant created', 201);
}));
router.patch('/variants/:variantId/stock', requireAuth, admin, validateBody(schemas.stockSchema), asyncHandler(async (req, res) => {
  sendData(res, await products.updateStock(req.params.variantId, req.body.stockQuantity), 'Stock updated');
}));
router.patch('/variants/:variantId', requireAuth, admin, validateBody(schemas.variantInput.partial()), asyncHandler(async (req, res) => {
  sendData(res, await products.updateVariant(req.params.variantId, req.body), 'Variant updated');
}));
router.get('/inventory/low-stock', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await products.lowStock());
}));

router.get('/orders/my', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await orders.myOrders(req.user.id));
}));
router.get('/orders', requireAuth, requireRoles('ADMIN', 'TREASURER'), asyncHandler(async (req, res) => {
  const result = await orders.listOrders(req.query);
  sendList(res, result.data, result.meta);
}));
router.get('/orders/:orderId', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await orders.getOrder(req.params.orderId, req.user));
}));
router.patch('/orders/:orderId/status', requireAuth, admin, validateBody(schemas.orderStatusSchema), asyncHandler(async (req, res) => {
  sendData(res, await orders.updateStatus(req.params.orderId, req.body.status), 'Order status updated');
}));

router.post('/initiatives', requireAuth, admin, validateBody(schemas.initiativeSchema), asyncHandler(async (req, res) => {
  sendData(res, await initiatives.create(req.user.id, {
    ...req.body,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
  }), 'Initiative created', 201);
}));
router.get('/initiatives', requireAuth, requireAdminOrVolunteer, asyncHandler(async (req, res) => {
  sendData(res, await initiatives.list(req.user));
}));
router.get('/initiatives/:initiativeId', requireAuth, requireAdminOrVolunteer, asyncHandler(async (req, res) => {
  sendData(res, await initiatives.getOne(req.params.initiativeId, req.user));
}));
router.post('/initiatives/:initiativeId/tasks', requireAuth, admin, validateBody(schemas.taskSchema), asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  sendData(res, await initiatives.createTask(req.params.initiativeId, data), 'Task created', 201);
}));
router.patch('/tasks/:taskId/assign', requireAuth, admin, validateBody(schemas.assignSchema), asyncHandler(async (req, res) => {
  sendData(res, await initiatives.assignTask(req.params.taskId, req.body.assignedTo), 'Task assigned');
}));
router.patch('/tasks/:taskId', requireAuth, asyncHandler(async (req, res) => {
  const parsed = schemas.taskPatchSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, parsed.error.issues[0].message, 'VALIDATION_ERROR');
  const data = { ...parsed.data };
  if (data.dueDate) data.dueDate = new Date(data.dueDate);
  sendData(res, await initiatives.updateTask(req.params.taskId, req.user, data), 'Task updated');
}));
router.get('/tasks/my', requireAuth, requireVolunteer, asyncHandler(async (req, res) => {
  sendData(res, await initiatives.myTasks(req.user.id));
}));

router.post('/finance/expenses', requireAuth, requireExpenseSubmit, maybeSingle('receipt'), asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (!req.body.category || !req.body.description || !Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'Amount, category, and description are required', 'VALIDATION_ERROR');
  }
  let receiptUrl;
  if (req.file) {
    const stored = await uploads.storeFile('receipt', req.user.id, req.file);
    receiptUrl = stored.storagePath;
  }
  sendData(res, await finance.submitExpense(req.user, {
    amount,
    category: req.body.category,
    description: req.body.description,
    initiativeId: req.body.initiativeId || undefined,
  }, receiptUrl), 'Expense submitted', 201);
}));
router.get('/finance/expenses', requireAuth, asyncHandler(async (req, res) => {
  if (req.user.role !== 'TREASURER' && !req.user.isVolunteer) {
    throw new ApiError(403, 'Forbidden', 'FORBIDDEN');
  }
  const result = await finance.listExpenses(req.user, req.query);
  sendList(res, result.data, result.meta);
}));
router.post('/finance/expenses/:expenseId/approve', requireAuth, treasurer, asyncHandler(async (req, res) => {
  sendData(res, await finance.review(req.params.expenseId, req.user.id, 'APPROVED'), 'Expense approved');
}));
router.post('/finance/expenses/:expenseId/reject', requireAuth, treasurer, asyncHandler(async (req, res) => {
  sendData(res, await finance.review(req.params.expenseId, req.user.id, 'REJECTED'), 'Expense rejected');
}));
router.post('/finance/expenses/:expenseId/reimburse', requireAuth, treasurer, asyncHandler(async (req, res) => {
  sendData(res, await finance.reimburse(req.params.expenseId, req.user.id), 'Expense reimbursed');
}));
router.post('/finance/income', requireAuth, treasurer, validateBody(schemas.incomeSchema), asyncHandler(async (req, res) => {
  sendData(res, await finance.recordIncome(req.user.id, req.body), 'Income recorded', 201);
}));
router.get('/finance/transactions', requireAuth, treasurer, asyncHandler(async (req, res) => {
  const result = await finance.listTransactions(req.query);
  sendList(res, result.data, result.meta);
}));
router.get('/finance/summary', requireAuth, treasurer, asyncHandler(async (req, res) => {
  sendData(res, await finance.summary());
}));

router.get('/dashboard/member', requireAuth, member, asyncHandler(async (req, res) => {
  sendData(res, await dashboards.memberDashboard(req.user));
}));
router.get('/dashboard/admin', requireAuth, admin, asyncHandler(async (req, res) => {
  sendData(res, await dashboards.adminDashboard());
}));
router.get('/dashboard/finance', requireAuth, treasurer, asyncHandler(async (req, res) => {
  sendData(res, await dashboards.financeDashboard());
}));

router.get('/notifications', requireAuth, asyncHandler(async (req, res) => {
  const result = await notifications.list(req.user.id, req.query);
  sendList(res, result.data, result.meta);
}));
router.post('/notifications/read-all', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await notifications.markAllRead(req.user.id), 'Notifications marked read');
}));
router.patch('/notifications/:notificationId/read', requireAuth, asyncHandler(async (req, res) => {
  sendData(res, await notifications.markRead(req.user.id, req.params.notificationId), 'Notification marked read');
}));

router.get('/search', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, await search.search(req.user, req.query.q));
}));

router.get('/settings/organization', asyncHandler(async (req, res) => {
  sendData(res, await settings.getPublicSettings());
}));
router.patch('/settings/organization', requireAuth, admin, validateBody(schemas.settingsPatchSchema), asyncHandler(async (req, res) => {
  sendData(res, await settings.updateSettings(req.body), 'Settings updated');
}));
router.get('/settings/payments', requireAuth, admin, (req, res) => {
  sendData(res, settings.paymentStatus());
});
router.post('/uploads', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  sendData(res, await uploads.upload(req.user, req.body.purpose, req.file, req.body.recordId), 'File uploaded', 201);
}));

module.exports = router;
