const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  studentId: z.string().trim().min(1).max(40).optional(),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(['MEMBER', 'ADMIN', 'TREASURER']).default('MEMBER'),
  isVolunteer: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  studentId: z.string().trim().max(40).nullable().optional(),
  notificationPreferences: z.record(z.boolean()).optional(),
});

const memberPatchSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  studentId: z.string().trim().max(40).nullable().optional(),
});

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

const roleSchema = z.object({
  role: z.enum(['MEMBER', 'ADMIN', 'TREASURER']).optional(),
  isVolunteer: z.boolean().optional(),
});

const planSchema = z.object({
  name: z.string().trim().min(2).max(120),
  fee: z.number().nonnegative(),
  durationMonths: z.number().int().positive(),
  ticketDiscountPercent: z.number().min(0).max(100).optional(),
  merchDiscountPercent: z.number().min(0).max(100).optional(),
  renewalReminderDays: z.number().int().nonnegative(),
  gracePeriodDays: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

const planPatchSchema = planSchema.partial();

const eventSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1),
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }),
  venue: z.string().trim().min(1).max(160),
  capacity: z.number().int().positive(),
  memberPrice: z.number().nonnegative(),
  nonMemberPrice: z.number().nonnegative(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']).optional(),
});

const eventPatchSchema = eventSchema.partial();

const eventStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
});

const paymentOrderSchema = z.discriminatedUnion('purpose', [
  z.object({ purpose: z.literal('MEMBERSHIP'), planId: z.string().min(1) }),
  z.object({
    purpose: z.literal('TICKET'),
    eventId: z.string().min(1),
    quantity: z.number().int().positive().optional(),
  }),
  z.object({
    purpose: z.literal('ORDER'),
    fulfillment: z.enum(['PICKUP', 'DELIVERY']).optional(),
    items: z.array(z.object({ variantId: z.string().min(1), quantity: z.number().int().positive() })).min(1),
  }),
]);

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

const checkInSchema = z.object({ qrToken: z.string().min(1) });

const announcementSchema = z.object({
  title: z.string().trim().min(2).max(160),
  content: z.string().trim().min(1),
  audience: z.enum(['PUBLIC', 'MEMBERS']),
});

const announcementPatchSchema = announcementSchema.partial();

const variantInput = z.object({
  size: z.string().trim().min(1).max(20),
  stockQuantity: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  sku: z.string().trim().max(40).optional(),
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  price: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
  variants: z.array(variantInput).optional(),
});

const productPatchSchema = productSchema.partial().omit({ variants: true });

const stockSchema = z.object({ stockQuantity: z.number().int().nonnegative() });

const orderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'READY', 'COMPLETED']),
});

const initiativeSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1),
  type: z.enum(['FUNDRAISER', 'GENERAL']),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
});

const taskSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
});

const assignSchema = z.object({ assignedTo: z.string().min(1) });

const taskPatchSchema = taskSchema.partial();

const incomeSchema = z.object({
  amount: z.number().positive(),
  category: z.enum(['FUNDRAISER', 'OTHER']).optional(),
  initiativeId: z.string().min(1).optional(),
  description: z.string().trim().min(1),
});

const settingsPatchSchema = z.object({
  organizationName: z.string().trim().min(2).max(160).optional(),
  logoUrl: z.string().nullable().optional(),
  description: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  socialLinks: z.array(z.record(z.any())).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().min(1).optional(),
  dateFormat: z.string().min(1).optional(),
  defaultEventCapacity: z.number().int().positive().optional(),
  defaultMemberPrice: z.number().nonnegative().optional(),
  defaultNonMemberPrice: z.number().nonnegative().optional(),
  defaultLowStockThreshold: z.number().int().nonnegative().optional(),
  paymentHoldMinutes: z.number().int().positive().optional(),
  pickupEnabled: z.boolean().optional(),
  deliveryEnabled: z.boolean().optional(),
  notificationDefaults: z.record(z.boolean()).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  passwordSchema,
  profileSchema,
  memberPatchSchema,
  statusSchema,
  roleSchema,
  planSchema,
  planPatchSchema,
  eventSchema,
  eventPatchSchema,
  eventStatusSchema,
  paymentOrderSchema,
  verifySchema,
  checkInSchema,
  announcementSchema,
  announcementPatchSchema,
  productSchema,
  productPatchSchema,
  variantInput,
  stockSchema,
  orderStatusSchema,
  initiativeSchema,
  taskSchema,
  assignSchema,
  taskPatchSchema,
  incomeSchema,
  settingsPatchSchema,
};
