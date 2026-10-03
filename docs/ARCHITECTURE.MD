# Document 2 — Architecture Design

## 1. Locked Stack

| Layer | Choice |
| --- | --- |
| Frontend | React + Tailwind CSS |
| API | Node.js + Express.js |
| Database | PostgreSQL on Supabase |
| ORM | Prisma |
| Files | Supabase Storage |
| Payments | Razorpay test mode |

The browser never opens a database connection and never uses the Supabase service-role key. File uploads and payment secrets go through Express.

## 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │   Browser (React)    │
                         │   Tailwind CSS UI    │
                         └──────────┬───────────┘
                                    │
                              HTTPS / JSON
                              /api/v1
                                    │
                         ┌──────────▼───────────┐
                         │   Node.js + Express  │
                         │  Auth, RBAC, Services│
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
      ┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
      │ Prisma ORM     │   │ Supabase Storage│   │ Razorpay (test) │
      │                │   │ signed uploads  │   │ orders + verify │
      └───────┬────────┘   └─────────────────┘   └─────────────────┘
              │
      ┌───────▼────────┐
      │ PostgreSQL     │
      │ on Supabase    │
      └────────────────┘
```

Express also runs a scheduler that inserts notification rows. Razorpay calls `POST /api/v1/payments/webhook` as a second confirmation path.

## 3. Dynamic Data Rule

Pages, tables, cards, charts, prices, and organization branding render API responses. Components start in a loading state, then render `data` or an empty state when the list is empty, or an error state with retry when the request fails. KPI numbers are fields on the dashboard payload. The frontend does not ship arrays of events, products, members, or finance totals.

## 4. Frontend Layer

React renders routes, forms, dashboards, tables, QR codes, and the store. Tailwind supplies layout and the design tokens in the design document.

```text
src/
├── components/
├── layouts/
├── pages/
├── routes/
├── hooks/
├── services/        # API client only
├── context/         # auth session and current user
├── utils/
└── assets/          # static brand chrome only (icons, empty-state illustration)
```

`assets` may contain icons and generic empty-state artwork. It does not contain organization data. The API client sends the JWT and calls Express only.

## 5. Backend Layer

Express is organized by domain.

```text
server/
├── controllers/
├── routes/
├── services/
├── middleware/
├── validators/
├── utils/
├── config/
├── jobs/
└── prisma/
```

Modules:

```text
auth
users
memberships
events
tickets
announcements
products
orders
initiatives
tasks
expenses
payments
finance
notifications
dashboard
settings
uploads
```

## 6. Middleware

```text
Authentication Middleware   # JWT on protected routes
Authorization Middleware    # role + volunteer capability
Request Validation
Error Handler
Rate Limiting
Logging
```

Public routes are register, login, published events, event detail, published products, public announcements, active membership plans, organization profile, public search, and the Razorpay webhook. Every other route requires a verified JWT. Role checks follow the user-roles matrix.

## 7. Data Access

Prisma uses `DATABASE_URL` pointing at the Supabase Postgres instance. Schema changes go through Prisma migrations. Services own business rules. Controllers stay thin.

Multi-table changes use `prisma.$transaction`:

- Verify ticket payment: payment `PAID`, ticket `PAID`, transaction income row.
- Verify merchandise payment: payment `PAID`, order `PAID`, decrement variant stock, transaction income row.
- Verify membership payment: payment `PAID`, membership `ACTIVE`, transaction income row.
- Check-in: ticket `USED` plus attendance insert.
- Reimburse: expense `REIMBURSED` plus transaction expense row.

## 8. Supabase Storage

Buckets:

| Bucket | Contents | Access |
| --- | --- | --- |
| avatars | Profile images | Authenticated user uploads own file via API |
| products | Product images | Admin upload via API |
| organization | Organization logo | Admin upload via API |
| receipts | Expense receipts | Submitter upload; treasurer and submitter can read |

The API accepts the file (or issues a short-lived signed upload URL), writes the object with the service role, and stores the resulting path or URL on the row (`profile_image`, `image_url`, `logo_url`, `receipt_url`). The React app does not hold the service-role key.

## 9. Payments (Razorpay Test Mode)

Environment variables on the server:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

`RAZORPAY_KEY_ID` is the only payment value returned to the client, and only inside the checkout payload for the current order. The secret and webhook secret stay on the server.

Checkout sequence:

```text
React
  ↓
POST /api/v1/payments/orders     purpose = MEMBERSHIP | TICKET | ORDER
  ↓
Auth + validation
  ↓
Price from plan or event or cart (membership discount applied here)
  ↓
Capacity or stock hold (PENDING ticket or PENDING order)
  ↓
Razorpay test order created
  ↓
payments row status CREATED
  ↓
Client opens Razorpay Checkout (test mode)
  ↓
POST /api/v1/payments/verify     order id, payment id, signature
  ↓
Signature check
  ↓
Prisma transaction: mark paid, confirm business row, write ledger
  ↓
Webhook repeats the same confirmation if verify already ran (idempotent on razorpay_payment_id)
```

Holds older than 15 minutes with payment status `CREATED` are released by the scheduler. The ticket becomes `EXPIRED`. The order becomes `CANCELLED`. Capacity and stock calculations stop counting that hold. Stock quantities change only when an order payment reaches `PAID`.

Failed verification marks the payment `FAILED` and releases the hold. A ticket, order, or membership becomes confirmed only after status `PAID`.

## 10. Financial Architecture

```text
Verified membership payment ──┐
Verified ticket payment ──────┤
Verified merchandise payment ─┼──> transactions (INCOME)
Fundraiser income entry ──────┘
                                     │
Recorded organization expense ───────┤
Paid reimbursement ──────────────────┘
                                     ↓
                              Finance dashboard
                              (SUM of transactions)
```

The dashboard does not add a parallel set of totals. Pending reimbursements are a count and sum of expenses in `PENDING` or `APPROVED`, shown separately from the balance.

## 11. Notifications Job

A job in the API process runs on an interval and inserts `notifications` rows when:

- A membership is `ACTIVE` and `end_date` falls inside the plan’s renewal reminder window, and a reminder for that membership has not been created yet.
- A `PAID` ticket’s event starts within the event reminder window.
- An announcement is published (created in the publish request, not by the job).
- A task is assigned, an order status changes, or an expense status changes (created in those requests).

The job writes database rows. Email delivery is later scope.

## 12. Request Lifecycle Example (Ticket)

```text
POST /api/v1/payments/orders
  body: { purpose: "TICKET", eventId, quantity: 1 }
  ↓
Authenticate member
  ↓
Load event (published, upcoming)
  ↓
Resolve price: ACTIVE membership → member_price, else non_member_price
  ↓
Count PAID + USED + unexpired PENDING tickets
  ↓
If count + quantity > capacity → 409 CAPACITY_EXCEEDED
  ↓
Transaction: insert PENDING ticket + CREATED payment
  ↓
Create Razorpay test order for the computed amount
  ↓
Return key id, razorpay order id, amount, ticket id
```

After checkout, verify runs the confirmation transaction described in section 9.

## 13. Configuration

```text
DATABASE_URL                 # Supabase Postgres, used by Prisma
DIRECT_URL                   # Supabase direct connection for migrations
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY    # server only
RAZORPAY_KEY_ID              # test key
RAZORPAY_KEY_SECRET          # test secret
RAZORPAY_WEBHOOK_SECRET
JWT_SECRET
JWT_EXPIRES_IN
PORT
```

Organization name, currency, timezone, fees, and thresholds are rows in Postgres, read through the settings and plan APIs.
