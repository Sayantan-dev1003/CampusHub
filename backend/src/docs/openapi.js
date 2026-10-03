const bearer = [{ bearerAuth: [] }];

const errorResponse = {
  description: 'Error',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errorCode: { type: 'string' },
        },
      },
    },
  },
};

function jsonBody(example, required = []) {
  return {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required,
          example,
        },
      },
    },
  };
}

function op(tag, summary, extra = {}) {
  return {
    tags: [tag],
    summary,
    responses: {
      200: { description: 'Success' },
      201: { description: 'Created' },
      400: errorResponse,
      401: errorResponse,
      403: errorResponse,
      404: errorResponse,
      409: errorResponse,
      ...extra.responses,
    },
    ...extra,
    responses: {
      200: { description: 'Success' },
      201: { description: 'Created' },
      400: errorResponse,
      401: errorResponse,
      403: errorResponse,
      404: errorResponse,
      409: errorResponse,
      ...(extra.responses || {}),
    },
  };
}

const page = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
  { name: 'search', in: 'query', schema: { type: 'string' } },
  { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'field or field:asc. Example: createdAt:desc' },
];

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'CampusHub API',
    version: '1.0.0',
    description: [
      'Manual testing for every CampusHub module. Base path is `/api/v1`.',
      '',
      'Seeded accounts (password `Password123!` unless `SEED_PASSWORD` was changed):',
      '- admin@campushub.local — Admin',
      '- treasurer@campushub.local — Treasurer',
      '- member@campushub.local — Member and volunteer',
      '- student@campushub.local — Member',
      '',
      'Call **POST /auth/login**, copy `data.token`, then choose **Authorize** and paste the token.',
    ].join('\n'),
  },
  servers: [{ url: '/api/v1', description: 'Current host' }],
  tags: [
    'Health',
    'Auth',
    'Members',
    'Memberships',
    'Events',
    'Tickets',
    'Payments',
    'Announcements',
    'Products',
    'Orders',
    'Initiatives',
    'Finance',
    'Dashboards',
    'Notifications',
    'Search',
    'Settings',
  ].map((name) => ({ name })),
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: op('Health', 'API health check'),
    },
    '/auth/register': {
      post: op('Auth', 'Register a member', {
        requestBody: jsonBody({
          name: 'New Student',
          email: 'new.student@example.com',
          password: 'Password123!',
          studentId: 'STU100',
          phone: '9000000000',
        }, ['name', 'email', 'password']),
      }),
    },
    '/auth/login': {
      post: op('Auth', 'Login and receive a JWT', {
        requestBody: jsonBody({
          email: 'admin@campushub.local',
          password: 'Password123!',
        }, ['email', 'password']),
      }),
    },
    '/auth/me': {
      get: op('Auth', 'Current user profile and membership', { security: bearer }),
    },
    '/auth/password': {
      post: op('Auth', 'Change password', {
        security: bearer,
        requestBody: jsonBody({
          currentPassword: 'Password123!',
          newPassword: 'Password123!',
        }, ['currentPassword', 'newPassword']),
      }),
    },
    '/auth/logout': {
      post: op('Auth', 'Logout acknowledgement. The client deletes the token.', { security: bearer }),
    },
    '/members': {
      get: op('Members', 'List members. Admin and Treasurer.', {
        security: bearer,
        parameters: [
          ...page,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'SUSPENDED'] } },
          { name: 'membership', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'EXPIRED', 'NONE'] } },
        ],
      }),
    },
    '/members/{memberId}': {
      get: op('Members', 'Member profile, membership history, recent tickets and orders', {
        security: bearer,
        parameters: [{ name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
      patch: op('Members', 'Correct a member profile. Admin.', {
        security: bearer,
        parameters: [{ name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ name: 'Updated Name', phone: '9000000001', studentId: 'STU100' }),
      }),
    },
    '/members/{memberId}/status': {
      patch: op('Members', 'Activate or suspend an account. Admin.', {
        security: bearer,
        parameters: [{ name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ status: 'ACTIVE' }, ['status']),
      }),
    },
    '/members/{memberId}/membership': {
      get: op('Members', 'Latest membership for a user', {
        security: bearer,
        parameters: [{ name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/users/me': {
      patch: op('Members', 'Update own profile and notification preferences', {
        security: bearer,
        requestBody: jsonBody({
          name: 'Student Member',
          phone: '9000000002',
          notificationPreferences: { eventReminders: true, membershipReminders: true },
        }),
      }),
    },
    '/users/{userId}/role': {
      patch: op('Members', 'Assign role or volunteer flag. Admin. Cannot change your own role.', {
        security: bearer,
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ role: 'MEMBER', isVolunteer: true }),
      }),
    },
    '/membership-plans': {
      get: op('Memberships', 'List plans. Public sees active plans. Admin sees all unless active=true.', {
        parameters: [{ name: 'active', in: 'query', schema: { type: 'boolean' } }],
      }),
      post: op('Memberships', 'Create a membership plan. Admin.', {
        security: bearer,
        requestBody: jsonBody({
          name: 'Semester Membership',
          fee: 300,
          durationMonths: 6,
          ticketDiscountPercent: 10,
          merchDiscountPercent: 10,
          renewalReminderDays: 14,
          isActive: true,
        }, ['name', 'fee', 'durationMonths', 'renewalReminderDays']),
      }),
    },
    '/membership-plans/{planId}': {
      patch: op('Memberships', 'Update a membership plan. Admin.', {
        security: bearer,
        parameters: [{ name: 'planId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ fee: 350, isActive: true }),
      }),
    },
    '/memberships/stats': {
      get: op('Memberships', 'Membership counts. Admin.', { security: bearer }),
    },
    '/memberships/{membershipId}/suspend': {
      post: op('Memberships', 'Suspend a membership. Admin. Activation still requires payment.', {
        security: bearer,
        parameters: [{ name: 'membershipId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/events': {
      get: op('Events', 'List events. Public sees published events. Admin sees every status.', {
        parameters: [
          ...page,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'] } },
          { name: 'date', in: 'query', schema: { type: 'string', example: '2026-12-12' } },
        ],
      }),
      post: op('Events', 'Create an event. Admin.', {
        security: bearer,
        requestBody: jsonBody({
          title: 'Spring Gala',
          description: 'Annual student organization event',
          startsAt: '2026-12-20T18:00:00+05:30',
          endsAt: '2026-12-20T22:00:00+05:30',
          venue: 'Main Auditorium',
          capacity: 200,
          memberPrice: 200,
          nonMemberPrice: 400,
          status: 'PUBLISHED',
        }, ['title', 'description', 'startsAt', 'endsAt', 'venue', 'capacity', 'memberPrice', 'nonMemberPrice']),
      }),
    },
    '/events/{eventId}': {
      get: op('Events', 'Event detail, remaining seats, and viewer price when logged in', {
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
      patch: op('Events', 'Update an event. Admin.', {
        security: bearer,
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ capacity: 180, venue: 'Seminar Hall' }),
      }),
    },
    '/events/{eventId}/status': {
      patch: op('Events', 'Publish, cancel, or complete an event. Cancelling releases unpaid ticket holds.', {
        security: bearer,
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ status: 'PUBLISHED' }, ['status']),
      }),
    },
    '/events/{eventId}/analytics': {
      get: op('Events', 'Sold tickets, check-ins, and ticket revenue. Admin and Treasurer.', {
        security: bearer,
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/events/{eventId}/attendance': {
      get: op('Events', 'Attendance list. Admin.', {
        security: bearer,
        parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/tickets/my': {
      get: op('Tickets', 'Tickets for the logged-in user', { security: bearer }),
    },
    '/tickets/{ticketId}': {
      get: op('Tickets', 'One ticket. Owner, Admin, or Treasurer. QR token is present when paid or used.', {
        security: bearer,
        parameters: [{ name: 'ticketId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/tickets/check-in': {
      post: op('Tickets', 'Check in a QR token. Admin.', {
        security: bearer,
        requestBody: jsonBody({ qrToken: 'paste-qr-token' }, ['qrToken']),
      }),
    },
    '/payments/orders': {
      post: op('Payments', 'Start Razorpay test checkout for dues, a ticket, or merchandise', {
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    type: 'object',
                    required: ['purpose', 'planId'],
                    properties: {
                      purpose: { type: 'string', enum: ['MEMBERSHIP'] },
                      planId: { type: 'string' },
                    },
                  },
                  {
                    type: 'object',
                    required: ['purpose', 'eventId'],
                    properties: {
                      purpose: { type: 'string', enum: ['TICKET'] },
                      eventId: { type: 'string' },
                      quantity: { type: 'integer', example: 1 },
                    },
                  },
                  {
                    type: 'object',
                    required: ['purpose', 'items'],
                    properties: {
                      purpose: { type: 'string', enum: ['ORDER'] },
                      fulfillment: { type: 'string', enum: ['PICKUP', 'DELIVERY'] },
                      items: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['variantId', 'quantity'],
                          properties: {
                            variantId: { type: 'string' },
                            quantity: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                ],
              },
              examples: {
                membership: { value: { purpose: 'MEMBERSHIP', planId: 'plan_id' } },
                ticket: { value: { purpose: 'TICKET', eventId: 'event_id', quantity: 1 } },
                order: {
                  value: {
                    purpose: 'ORDER',
                    fulfillment: 'PICKUP',
                    items: [{ variantId: 'variant_id', quantity: 1 }],
                  },
                },
              },
            },
          },
        },
      }),
    },
    '/payments/verify': {
      post: op('Payments', 'Verify a Razorpay test payment and confirm the ticket, order, or membership', {
        security: bearer,
        requestBody: jsonBody({
          razorpayOrderId: 'order_test_id',
          razorpayPaymentId: 'pay_test_id',
          razorpaySignature: 'signature',
        }, ['razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature']),
      }),
    },
    '/payments/webhook': {
      post: op('Payments', 'Razorpay webhook. Send the raw signature header.', {
        parameters: [{ name: 'x-razorpay-signature', in: 'header', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ event: 'payment.captured', payload: { payment: { entity: { id: 'pay_test_id', order_id: 'order_test_id' } } } }),
      }),
    },
    '/announcements': {
      get: op('Announcements', 'List announcements visible to the caller', {
        parameters: [
          ...page,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] } },
          { name: 'audience', in: 'query', schema: { type: 'string', enum: ['PUBLIC', 'MEMBERS'] } },
        ],
      }),
      post: op('Announcements', 'Create a draft announcement. Admin.', {
        security: bearer,
        requestBody: jsonBody({
          title: 'General body meeting',
          content: 'Friday at 5 PM in the seminar hall.',
          audience: 'MEMBERS',
        }, ['title', 'content', 'audience']),
      }),
    },
    '/announcements/{announcementId}': {
      patch: op('Announcements', 'Edit a draft announcement. Admin.', {
        security: bearer,
        parameters: [{ name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ title: 'Updated meeting notice' }),
      }),
    },
    '/announcements/{announcementId}/publish': {
      post: op('Announcements', 'Publish an announcement and notify the audience. Admin.', {
        security: bearer,
        parameters: [{ name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/announcements/{announcementId}/archive': {
      post: op('Announcements', 'Archive an announcement. Admin.', {
        security: bearer,
        parameters: [{ name: 'announcementId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/products': {
      get: op('Products', 'Product catalogue with sizes and stock', {
        parameters: [
          ...page,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'] } },
        ],
      }),
      post: op('Products', 'Create a product and optional variants. Admin.', {
        security: bearer,
        requestBody: jsonBody({
          name: 'Campus Hoodie',
          description: 'Fleece hoodie',
          category: 'Apparel',
          price: 800,
          variants: [{ size: 'L', stockQuantity: 10, lowStockThreshold: 2 }],
        }, ['name', 'description', 'category', 'price']),
      }),
    },
    '/products/{productId}': {
      get: op('Products', 'Product detail', {
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
      patch: op('Products', 'Update a product. Admin.', {
        security: bearer,
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ price: 750, status: 'ACTIVE' }),
      }),
    },
    '/products/{productId}/variants': {
      post: op('Products', 'Add a size variant. Admin.', {
        security: bearer,
        parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ size: 'S', stockQuantity: 8, lowStockThreshold: 2 }, ['size', 'stockQuantity']),
      }),
    },
    '/variants/{variantId}': {
      patch: op('Products', 'Update a variant. Admin.', {
        security: bearer,
        parameters: [{ name: 'variantId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ lowStockThreshold: 3 }),
      }),
    },
    '/variants/{variantId}/stock': {
      patch: op('Products', 'Set variant stock. Admin.', {
        security: bearer,
        parameters: [{ name: 'variantId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ stockQuantity: 12 }, ['stockQuantity']),
      }),
    },
    '/inventory/low-stock': {
      get: op('Products', 'Variants at or below their low-stock threshold. Admin.', { security: bearer }),
    },
    '/orders/my': {
      get: op('Orders', 'Orders for the logged-in user', { security: bearer }),
    },
    '/orders': {
      get: op('Orders', 'All orders. Admin and Treasurer.', {
        security: bearer,
        parameters: [
          ...page,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'PAID', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'] } },
        ],
      }),
    },
    '/orders/{orderId}': {
      get: op('Orders', 'One order. Owner, Admin, or Treasurer.', {
        security: bearer,
        parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/orders/{orderId}/status': {
      patch: op('Orders', 'Move a paid order through PROCESSING, READY, then COMPLETED. Admin.', {
        security: bearer,
        parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ status: 'PROCESSING' }, ['status']),
      }),
    },
    '/initiatives': {
      get: op('Initiatives', 'Initiatives. Admin sees all. Volunteers see initiatives they are assigned to.', { security: bearer }),
      post: op('Initiatives', 'Create an initiative. Admin.', {
        security: bearer,
        requestBody: jsonBody({
          name: 'Bake Sale',
          description: 'Semester fundraiser',
          type: 'FUNDRAISER',
          startDate: '2026-11-01T09:00:00+05:30',
          endDate: '2026-11-01T17:00:00+05:30',
          status: 'ACTIVE',
        }, ['name', 'description', 'type', 'startDate', 'endDate']),
      }),
    },
    '/initiatives/{initiativeId}': {
      get: op('Initiatives', 'Initiative with tasks and status counts', {
        security: bearer,
        parameters: [{ name: 'initiativeId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/initiatives/{initiativeId}/tasks': {
      post: op('Initiatives', 'Add a task. Admin.', {
        security: bearer,
        parameters: [{ name: 'initiativeId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({
          title: 'Buy supplies',
          description: 'Flour, sugar, and boxes',
          priority: 'HIGH',
          dueDate: '2026-10-30T18:00:00+05:30',
        }, ['title', 'description']),
      }),
    },
    '/tasks/{taskId}/assign': {
      patch: op('Initiatives', 'Assign a task to a volunteer. Admin.', {
        security: bearer,
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ assignedTo: 'user_id' }, ['assignedTo']),
      }),
    },
    '/tasks/{taskId}': {
      patch: op('Initiatives', 'Update a task. Assignee may change status only. Admin may edit the task.', {
        security: bearer,
        parameters: [{ name: 'taskId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: jsonBody({ status: 'IN_PROGRESS' }),
      }),
    },
    '/tasks/my': {
      get: op('Initiatives', 'Tasks assigned to the current volunteer', { security: bearer }),
    },
    '/finance/expenses': {
      get: op('Finance', 'Expense claims. Treasurer sees all. Volunteers see their own.', {
        security: bearer,
        parameters: [
          ...page,
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED'] } },
          { name: 'mine', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
      }),
      post: op('Finance', 'Submit an expense. Volunteer claims stay pending. Treasurer entries post to the ledger.', {
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['amount', 'category', 'description'],
                example: { amount: 250, category: 'SUPPLIES', description: 'Poster printing', initiativeId: 'initiative_id' },
              },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['amount', 'category', 'description'],
                properties: {
                  amount: { type: 'number' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  initiativeId: { type: 'string' },
                  receipt: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
      }),
    },
    '/finance/expenses/{expenseId}/approve': {
      post: op('Finance', 'Approve a pending claim. Treasurer.', {
        security: bearer,
        parameters: [{ name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/finance/expenses/{expenseId}/reject': {
      post: op('Finance', 'Reject a pending claim. Treasurer.', {
        security: bearer,
        parameters: [{ name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/finance/expenses/{expenseId}/reimburse': {
      post: op('Finance', 'Mark an approved claim reimbursed and write the ledger expense. Treasurer.', {
        security: bearer,
        parameters: [{ name: 'expenseId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/finance/income': {
      post: op('Finance', 'Record fundraiser or other income that did not pass through Razorpay. Treasurer.', {
        security: bearer,
        requestBody: jsonBody({
          amount: 1500,
          category: 'FUNDRAISER',
          initiativeId: 'initiative_id',
          description: 'Bake sale cash',
        }, ['amount', 'description']),
      }),
    },
    '/finance/transactions': {
      get: op('Finance', 'Ledger. Treasurer.', {
        security: bearer,
        parameters: [
          ...page,
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['INCOME', 'EXPENSE'] } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
      }),
    },
    '/finance/summary': {
      get: op('Finance', 'Income, expenses, balance, and breakdowns. Treasurer.', { security: bearer }),
    },
    '/dashboard/member': {
      get: op('Dashboards', 'Member dashboard. Role MEMBER.', { security: bearer }),
    },
    '/dashboard/admin': {
      get: op('Dashboards', 'Operational dashboard. Admin.', { security: bearer }),
    },
    '/dashboard/finance': {
      get: op('Dashboards', 'Finance dashboard. Treasurer.', { security: bearer }),
    },
    '/notifications': {
      get: op('Notifications', 'Notifications for the current user', {
        security: bearer,
        parameters: [
          ...page,
          { name: 'unread', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
        ],
      }),
    },
    '/notifications/read-all': {
      post: op('Notifications', 'Mark every notification read', { security: bearer }),
    },
    '/notifications/{notificationId}/read': {
      patch: op('Notifications', 'Mark one notification read', {
        security: bearer,
        parameters: [{ name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } }],
      }),
    },
    '/search': {
      get: op('Search', 'Search events, products, and announcements. Admin and Treasurer also receive members, orders, and tickets.', {
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', example: 'gala' } }],
      }),
    },
    '/settings/organization': {
      get: op('Settings', 'Public organization profile'),
      patch: op('Settings', 'Update organization settings. Admin. Secrets are not stored here.', {
        security: bearer,
        requestBody: jsonBody({
          organizationName: 'Skyline Student Association',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          defaultEventCapacity: 100,
          pickupEnabled: true,
        }),
      }),
    },
    '/settings/payments': {
      get: op('Settings', 'Whether Razorpay test mode is configured. Admin. Secrets are omitted.', { security: bearer }),
    },
    '/uploads': {
      post: op('Settings', 'Upload an avatar, product image, logo, or receipt', {
        security: bearer,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['purpose', 'file'],
                properties: {
                  purpose: { type: 'string', enum: ['avatar', 'product', 'logo', 'receipt'] },
                  recordId: { type: 'string', description: 'Optional row to update with the stored URL' },
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
      }),
    },
  },
};

module.exports = spec;
