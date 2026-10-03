# CampusHub — Student Organization Management System

## Technology Baseline

| Layer | Choice |
| --- | --- |
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL hosted on Supabase |
| ORM | Prisma |
| File storage | Supabase Storage |
| Payments | Razorpay test mode |
| Auth | JWT |

The React app calls this API only. Sample JSON in this document shows the response shape. Values are whatever the database returns, including empty lists and zero totals.

Base URL:

```text
/api/v1
```

---

# Document 1 — API Design

## 1. Conventions

Authenticated routes require:

```text
Authorization: Bearer <jwt>
```

List routes accept:

```text
?page=1&limit=20&search=&sort=
```

Success:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}
```

Lists:

```json
{
  "success": true,
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0 }
}
```

Error:

```json
{
  "success": false,
  "message": "Event capacity exceeded",
  "errorCode": "CAPACITY_EXCEEDED"
}
```

| Code | Use |
| --- | --- |
| 200 | Read or update |
| 201 | Create |
| 400 | Validation |
| 401 | Missing or invalid JWT |
| 403 | Role or ownership |
| 404 | Missing row |
| 409 | Capacity, stock, or duplicate payment |
| 500 | Unexpected server error |

Money fields are decimal strings or numbers in the organization currency from settings. The server computes prices. Clients send ids and quantities, not a trusted final price.

---

## 2. Authentication

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | User |
| POST | `/auth/password` | User |
| POST | `/auth/logout` | User |

### Register

`POST /api/v1/auth/register`

```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "********",
  "studentId": "STU001",
  "phone": "9000000000"
}
```

Creates `users.role = MEMBER`. Response `data` contains `id`, `name`, `email`, `role`, and a JWT. It does not create a membership. Membership starts at dues payment.

### Login

`POST /api/v1/auth/login`

`data`: `token`, `user` (`id`, `name`, `role`, `isVolunteer`).

### Current user

`GET /api/v1/auth/me`

`data`: profile, role, `isVolunteer`, notification preferences, and the current membership summary if one exists (`status`, `endDate`, `planName`).

### Password

`POST /api/v1/auth/password`

```json
{ "currentPassword": "********", "newPassword": "********" }
```

### Logout

`POST /api/v1/auth/logout` returns success. The client deletes the token.

---

## 3. Users and Members

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/members` | Admin, Treasurer (read) |
| GET | `/members/:memberId` | Self, Admin, Treasurer |
| PATCH | `/users/me` | User |
| PATCH | `/members/:memberId` | Admin |
| PATCH | `/members/:memberId/status` | Admin |
| PATCH | `/users/:userId/role` | Admin |

`GET /members` filters: `status`, `membership` (`ACTIVE`, `EXPIRED`, `NONE`), `search`, `page`, `limit`.

`PATCH /users/:userId/role` body: `{ "role": "MEMBER", "isVolunteer": true }`.

`GET /members/:memberId` returns the user plus membership history, recent tickets, and recent orders. Treasurer receives the same read model and cannot call the patch routes.

---

## 4. Membership Plans and Memberships

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/membership-plans` | Public for `active=true`; Admin for all |
| POST | `/membership-plans` | Admin |
| PATCH | `/membership-plans/:planId` | Admin |
| GET | `/members/:memberId/membership` | Self, Admin, Treasurer |
| GET | `/memberships/stats` | Admin |
| POST | `/memberships/:membershipId/suspend` | Admin |

Dues and renewal do not use a separate “activate” write. The client calls `POST /payments/orders` with `purpose: "MEMBERSHIP"` and `planId`. Verification creates or renews the membership.

`GET /memberships/stats` returns counts from the memberships table:

```json
{
  "success": true,
  "data": {
    "active": 0,
    "expiringSoon": 0,
    "expired": 0,
    "unpaid": 0
  }
}
```

The zeros above are the shape when the tables are empty. Live responses replace them with query results.

`expiringSoon` counts `ACTIVE` memberships whose `end_date` falls inside the plan reminder window.

---

## 5. Events

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/events` | Public sees `PUBLISHED`; Admin sees all |
| POST | `/events` | Admin |
| GET | `/events/:eventId` | Public if published; Admin always |
| PATCH | `/events/:eventId` | Admin |
| PATCH | `/events/:eventId/status` | Admin |
| GET | `/events/:eventId/analytics` | Admin, Treasurer |

Create body:

```json
{
  "title": "Spring Gala",
  "description": "Annual student organization event",
  "startsAt": "2026-10-12T18:00:00+05:30",
  "endsAt": "2026-10-12T22:00:00+05:30",
  "venue": "Main Auditorium",
  "capacity": 500,
  "memberPrice": 200,
  "nonMemberPrice": 400
}
```

Detail `data` includes `remainingSeats`, `memberPrice`, `nonMemberPrice`, and `viewerPrice` (resolved from the caller’s membership when a JWT is present).

Analytics `data`:

```json
{
  "capacity": 0,
  "remainingSeats": 0,
  "ticketsSold": 0,
  "checkedIn": 0,
  "revenue": 0
}
```

`ticketsSold` counts `PAID` and `USED`. `checkedIn` counts attendance rows. `revenue` sums posted `EVENT_TICKET` transactions for the event.

---

## 6. Tickets

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/tickets/my` | User |
| GET | `/tickets/:ticketId` | Owner, Admin |
| POST | `/tickets/check-in` | Admin |
| GET | `/events/:eventId/attendance` | Admin |

Purchase is `POST /payments/orders` with:

```json
{
  "purpose": "TICKET",
  "eventId": "evt_id",
  "quantity": 1
}
```

The server sets `ticketType` and `price`. Quantity in the core build is 1 per call so each ticket has its own QR token. The client may repeat checkout for another seat.

`GET /tickets/:ticketId` includes `qrToken` when status is `PAID` or `USED`.

Check-in:

```json
{ "qrToken": "token-from-qr" }
```

`POST /api/v1/tickets/check-in` returns the attendance record. Already used tokens return 409 `TICKET_ALREADY_USED`.

---

## 7. Payments

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/payments/orders` | User |
| POST | `/payments/verify` | User |
| POST | `/payments/webhook` | Razorpay signature |

### Create Razorpay test order

`POST /api/v1/payments/orders`

```json
{
  "purpose": "TICKET",
  "eventId": "evt_id",
  "quantity": 1
}
```

Other bodies:

```json
{ "purpose": "MEMBERSHIP", "planId": "plan_id" }
```

```json
{
  "purpose": "ORDER",
  "items": [{ "variantId": "var_id", "quantity": 2 }],
  "fulfillment": "PICKUP"
}
```

Response `data`:

```json
{
  "paymentId": "pay_row_id",
  "razorpayOrderId": "order_test_id",
  "amount": 0,
  "currency": "INR",
  "keyId": "rzp_test_key",
  "referenceId": "ticket_or_order_or_membership_id"
}
```

`amount` is the server-calculated total in currency subunits for Razorpay and the major-unit amount is also returned as `amountMajor` for display. The hold row exists before checkout.

### Verify

`POST /api/v1/payments/verify`

```json
{
  "razorpayOrderId": "order_test_id",
  "razorpayPaymentId": "pay_test_id",
  "razorpaySignature": "signature"
}
```

On success the confirmation transaction runs (see architecture). Response `data` is the confirmed ticket, order, or membership plus the transaction id.

### Webhook

`POST /api/v1/payments/webhook` reads the raw body, checks `RAZORPAY_WEBHOOK_SECRET`, and runs the same confirmation. If the payment is already `PAID`, it returns 200 and does not insert another transaction.

---

## 8. Announcements

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/announcements` | Public: `PUBLISHED` + `PUBLIC`. Members also see `MEMBERS`. Admin sees drafts |
| POST | `/announcements` | Admin |
| PATCH | `/announcements/:announcementId` | Admin |
| POST | `/announcements/:announcementId/publish` | Admin |
| POST | `/announcements/:announcementId/archive` | Admin |

Publish sets `published_at` and creates notification rows for the audience.

---

## 9. Products and Inventory

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/products` | Public sees `ACTIVE` |
| GET | `/products/:productId` | Public if active |
| POST | `/products` | Admin |
| PATCH | `/products/:productId` | Admin |
| POST | `/products/:productId/variants` | Admin |
| PATCH | `/variants/:variantId` | Admin |
| PATCH | `/variants/:variantId/stock` | Admin |
| GET | `/inventory/low-stock` | Admin |

Product payloads include `variants[]` with `size`, `stockQuantity`, and `lowStockThreshold`. Images are Storage URLs returned by the upload API.

`PATCH /variants/:variantId/stock` body: `{ "stockQuantity": 12 }`.

`GET /inventory/low-stock` returns variants where `stock_quantity <= low_stock_threshold`.

---

## 10. Orders

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/orders/my` | User |
| GET | `/orders/:orderId` | Owner, Admin, Treasurer (read) |
| GET | `/orders` | Admin, Treasurer (read) |
| PATCH | `/orders/:orderId/status` | Admin |

Creating an order is `POST /payments/orders` with `purpose: "ORDER"`. Status patch accepts `PROCESSING`, `READY`, `COMPLETED`. The server rejects fulfillment changes while `payment_status` is not `PAID`.

---

## 11. Initiatives and Tasks

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/initiatives` | Admin |
| GET | `/initiatives` | Volunteer (assigned), Admin |
| GET | `/initiatives/:initiativeId` | Same, includes tasks and task status counts |
| POST | `/initiatives/:initiativeId/tasks` | Admin |
| PATCH | `/tasks/:taskId/assign` | Admin |
| PATCH | `/tasks/:taskId` | Assignee (status only), Admin |
| GET | `/tasks/my` | Volunteer |

Assign body: `{ "assignedTo": "user_id" }`. The user must have `is_volunteer = true`.

---

## 12. Expenses and Finance

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/finance/expenses` | Volunteer, Treasurer |
| GET | `/finance/expenses` | Treasurer; volunteers receive only their own when `mine=true` |
| POST | `/finance/expenses/:expenseId/approve` | Treasurer |
| POST | `/finance/expenses/:expenseId/reject` | Treasurer |
| POST | `/finance/expenses/:expenseId/reimburse` | Treasurer |
| POST | `/finance/income` | Treasurer |
| GET | `/finance/transactions` | Treasurer |
| GET | `/finance/summary` | Treasurer |

Submit expense (multipart): `amount`, `category`, `description`, optional `initiativeId`, file field `receipt`. The file goes to the `receipts` bucket and `receipt_url` is stored. A volunteer submission stays `PENDING`. A treasurer submission is stored as a posted organization expense: status `REIMBURSED` and one ledger row, so costs that are not volunteer claims still reach the finance dashboard.

`POST /finance/income` records fundraiser or other income that did not pass through Razorpay:

```json
{
  "amount": 1500,
  "category": "FUNDRAISER",
  "initiativeId": "ini_id",
  "description": "Bake sale cash"
}
```

This inserts a `POSTED` income transaction. It does not create a Razorpay payment.

`GET /finance/transactions` filters: `type`, `category`, `from`, `to`, `page`, `limit`.

`GET /finance/summary` `data`:

```json
{
  "income": 0,
  "expenses": 0,
  "balance": 0,
  "pendingReimbursements": 0,
  "revenueBySource": [],
  "expensesByCategory": [],
  "recentTransactions": []
}
```

`revenueBySource` and `expensesByCategory` are grouped sums. `pendingReimbursements` sums expenses in `PENDING` or `APPROVED`.

---

## 13. Dashboards

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/dashboard/member` | Member, Volunteer |
| GET | `/dashboard/admin` | Admin |
| GET | `/dashboard/finance` | Treasurer |

Each returns one object of aggregates and short lists so the page can render from a single response. Fields match the modules document. Empty sections are empty arrays or zero counts.

---

## 14. Notifications

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/notifications` | User |
| PATCH | `/notifications/:notificationId/read` | Owner |
| POST | `/notifications/read-all` | User |

`meta.unread` is included on the list response.

---

## 15. Search

`GET /api/v1/search?q=gala`

Auth optional. Guests receive published public events, active products, and public announcements. Members add member announcements. Admin adds members. Admin and treasurer add orders and tickets.

```json
{
  "success": true,
  "data": {
    "events": [],
    "products": [],
    "announcements": [],
    "members": [],
    "orders": [],
    "tickets": []
  }
}
```

---

## 16. Settings and Uploads

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/settings/organization` | Public |
| PATCH | `/settings/organization` | Admin |
| GET | `/settings/payments` | Admin |
| POST | `/uploads` | User; bucket chosen by purpose and role |

`GET /settings/payments` `data`: `{ "provider": "razorpay", "mode": "test", "configured": true }`. Secrets are omitted.

`POST /uploads` multipart fields: `purpose` = `avatar | product | logo | receipt`, plus `file`. Role rules: any user for `avatar` and `receipt`; admin for `product` and `logo`. Response `data.url` is stored on the related row by the following create/update call, or the upload endpoint accepts an optional `recordId` and writes the column itself.

---

## 17. Standard Error Codes

```text
VALIDATION_ERROR
INVALID_CREDENTIALS
FORBIDDEN
NOT_FOUND
CAPACITY_EXCEEDED
OUT_OF_STOCK
MEMBERSHIP_REQUIRED
PAYMENT_SIGNATURE_INVALID
PAYMENT_ALREADY_PROCESSED
TICKET_ALREADY_USED
TICKET_NOT_PAID
HOLD_EXPIRED
```

`MEMBERSHIP_REQUIRED` is not used for ticket purchase. Non-members can buy at `non_member_price`. It is reserved if a future event is marked members-only.
