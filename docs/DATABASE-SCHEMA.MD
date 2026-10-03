# Document 3 — Database Design

PostgreSQL on Supabase is the system of record. Prisma is the only application access path. Table and column names below are the database names. The API uses camelCase JSON and Prisma maps the two.

Every screen reads these tables. Seed scripts may insert rows for local development. Those rows are ordinary data returned by the API.

## 1. Model Overview

```text
User
 ├── Membership ── MembershipPlan
 ├── Ticket ── Event
 │     └── Attendance
 ├── Order ── OrderItem ── ProductVariant ── Product
 ├── Task ── Initiative
 ├── Expense ── Initiative (optional)
 ├── Payment
 ├── Transaction
 └── Notification

OrganizationSettings (single row)
```

Primary role enum `UserRole`:

```text
MEMBER
ADMIN
TREASURER
```

`is_volunteer` is a boolean, independent of role.

## 2. users

```text
users
-----
id                PK
name
email             UNIQUE
password_hash
role              UserRole
is_volunteer      BOOLEAN default false
phone
student_id
profile_image
status            ACTIVE | SUSPENDED
notification_preferences   JSON
created_at
updated_at
```

Indexes: unique `email`, index `role`, index `student_id`.

Relationship: one user, many memberships, tickets, orders, tasks, expenses, payments, notifications.

## 3. membership_plans

```text
membership_plans
----------------
id                          PK
name
fee                         DECIMAL
duration_months             INT
ticket_discount_percent     DECIMAL default 0
merch_discount_percent      DECIMAL default 0
renewal_reminder_days       INT
grace_period_days           INT default 0
is_active                   BOOLEAN
created_at
updated_at
```

Benefits in this build are the two discount percents. Checkout loads the member’s current `ACTIVE` membership, then the plan.

## 4. memberships

```text
memberships
-----------
id                PK
user_id           FK users
plan_id           FK membership_plans
start_date
end_date
dues_amount       DECIMAL
payment_id        FK payments NULL
payment_status    PENDING | PAID | FAILED
status            PENDING | ACTIVE | EXPIRED | SUSPENDED
reminder_sent_at  TIMESTAMP NULL
created_at
updated_at
```

```text
User 1 ─── N Membership
MembershipPlan 1 ─── N Membership
```

A membership becomes `ACTIVE` only inside the payment verification transaction. `EXPIRED` is set by the scheduler when `end_date` plus grace period is past. Renewal inserts a new row. Admin suspend sets `SUSPENDED`.

Indexes: `user_id`, `status`, `end_date`.

## 5. events

```text
events
------
id                  PK
title
description
starts_at           TIMESTAMP
ends_at             TIMESTAMP
venue
capacity            INT
member_price        DECIMAL
non_member_price    DECIMAL
status              DRAFT | PUBLISHED | CANCELLED | COMPLETED
created_by          FK users
created_at
updated_at
```

```text
User 1 ─── N Events (created_by)
Event 1 ─── N Tickets
```

Remaining seats are computed: `capacity - count(tickets where status in (PAID, USED) or (status = PENDING and hold not expired))`.

Indexes: `status`, `starts_at`.

## 6. tickets

```text
tickets
-------
id              PK
event_id        FK events
user_id         FK users
payment_id      FK payments NULL
ticket_type     MEMBER | NON_MEMBER
price           DECIMAL
qr_token        UNIQUE NULL until PAID
status          PENDING | PAID | USED | CANCELLED | EXPIRED
hold_expires_at TIMESTAMP NULL
checked_in_at   TIMESTAMP NULL
created_at
```

```text
Event 1 ─── N Tickets
User 1 ─── N Tickets
```

`qr_token` is generated when verification sets `PAID`. Check-in is allowed only from `PAID`. It sets `USED` and `checked_in_at` in the same transaction as the attendance insert.

Indexes: unique `qr_token`, `event_id`, `user_id`, `status`.

## 7. attendance

```text
attendance
----------
id              PK
ticket_id       FK tickets UNIQUE
event_id        FK events
user_id         FK users
checked_in_at
checked_in_by   FK users
```

One attendance row per ticket. Ticket status `USED` and this row are written together. Analytics count attendance rows for “attended” and tickets in `PAID` or `USED` for “sold”.

## 8. announcements

```text
announcements
-------------
id              PK
title
content
created_by      FK users
audience        PUBLIC | MEMBERS
status          DRAFT | PUBLISHED | ARCHIVED
published_at    TIMESTAMP NULL
created_at
updated_at
```

Publishing sets `published_at` and inserts one notification per targeted user.

## 9. products and variants

```text
products
--------
id              PK
name
description
category
price           DECIMAL
image_url
status          ACTIVE | ARCHIVED
created_at
updated_at

product_variants
----------------
id                    PK
product_id            FK products
size
stock_quantity        INT
low_stock_threshold   INT
sku                   UNIQUE NULL
```

```text
Product 1 ─── N ProductVariant
```

Stock changes happen on the variant: decrement on paid order, or admin adjustment. Low stock is `stock_quantity <= low_stock_threshold`.

## 10. orders

```text
orders
------
id                PK
user_id           FK users
payment_id        FK payments NULL
total_amount      DECIMAL
discount_amount   DECIMAL default 0
payment_status    PENDING | PAID | FAILED
order_status      PENDING | PAID | PROCESSING | READY | COMPLETED | CANCELLED
fulfillment       PICKUP | DELIVERY
hold_expires_at   TIMESTAMP NULL
created_at
updated_at

order_items
-----------
id                  PK
order_id            FK orders
product_variant_id  FK product_variants
quantity            INT
unit_price          DECIMAL
subtotal            DECIMAL
```

```text
User 1 ─── N Orders
Order 1 ─── N OrderItems
ProductVariant 1 ─── N OrderItems
```

Verification sets `payment_status` and `order_status` to `PAID` and decrements each variant by `quantity`. Unpaid holds expire without a stock decrement because stock is reserved by counting `PENDING` order items that have not expired, the same way ticket holds work. Admin fulfillment moves `PAID → PROCESSING → READY → COMPLETED`.

## 11. initiatives

```text
initiatives
-----------
id            PK
name
description
type          FUNDRAISER | GENERAL
start_date
end_date
status        PLANNED | ACTIVE | COMPLETED | CANCELLED
created_by    FK users
created_at
updated_at
```

## 12. tasks

```text
tasks
-----
id              PK
initiative_id   FK initiatives
assigned_to     FK users NULL
title
description
priority        LOW | MEDIUM | HIGH
due_date
status          TODO | IN_PROGRESS | DONE | CANCELLED
created_at
updated_at
```

```text
Initiative 1 ─── N Tasks
User 1 ─── N Tasks
```

`assigned_to` must reference a user with `is_volunteer = true`.

## 13. expenses

```text
expenses
--------
id              PK
submitted_by    FK users
initiative_id   FK initiatives NULL
category
description
amount          DECIMAL
receipt_url
status          PENDING | APPROVED | REJECTED | REIMBURSED
approved_by     FK users NULL
reviewed_at     TIMESTAMP NULL
reimbursed_at   TIMESTAMP NULL
transaction_id  FK transactions NULL
created_at
updated_at
```

Statuses move `PENDING → APPROVED → REIMBURSED`, or `PENDING → REJECTED`. Reimbursement writes the ledger row and stores `transaction_id`.

## 14. payments

Razorpay test-mode attempts.

```text
payments
--------
id                    PK
user_id               FK users
purpose               MEMBERSHIP | TICKET | ORDER
amount                DECIMAL
currency              CHAR
status                CREATED | PAID | FAILED
razorpay_order_id     UNIQUE
razorpay_payment_id   UNIQUE NULL
reference_type        MEMBERSHIP | TICKET | ORDER
reference_id
created_at
updated_at
```

Verification is idempotent on `razorpay_payment_id`. A second webhook for a `PAID` payment does not create a second ledger row.

Indexes: unique `razorpay_order_id`, unique `razorpay_payment_id`, `user_id`, `status`.

## 15. transactions

The ledger. Dashboard totals are aggregates of this table.

```text
transactions
------------
id                PK
user_id           FK users NULL
payment_id        FK payments NULL
type              INCOME | EXPENSE
category          MEMBERSHIP | EVENT_TICKET | MERCHANDISE | FUNDRAISER | EVENT_COST | SUPPLIES | REIMBURSEMENT | OTHER
reference_type    MEMBERSHIP | TICKET | ORDER | INITIATIVE | EXPENSE | MANUAL
reference_id
amount            DECIMAL
currency
description
status            POSTED | VOID
created_at
```

Income categories come from verified payments (`MEMBERSHIP`, `EVENT_TICKET`, `MERCHANDISE`) or a treasurer fundraiser entry (`FUNDRAISER` with `reference_type` `INITIATIVE`). Expense categories come from treasurer-recorded costs or from reimbursement (`REIMBURSEMENT` with `reference_type` `EXPENSE`).

Balance = sum of `POSTED` income − sum of `POSTED` expenses.

Indexes: `type`, `category`, `created_at`, `payment_id`, `reference_type` + `reference_id`.

## 16. notifications

```text
notifications
-------------
id            PK
user_id       FK users
title
message
type          MEMBERSHIP | EVENT | TICKET | ORDER | ANNOUNCEMENT | TASK | EXPENSE
is_read       BOOLEAN default false
reference_type
reference_id
created_at
```

Unique partial rule for renewal reminders: one `MEMBERSHIP` notification per membership id (enforced in the job by `memberships.reminder_sent_at`).

Index: `user_id`, `is_read`.

## 17. organization_settings

Single row. Display and defaults. Payment secrets are not columns.

```text
organization_settings
---------------------
id
organization_name
logo_url
description
email
phone
address
website
social_links          JSON
currency
timezone
date_format
default_event_capacity
default_member_price
default_non_member_price
default_low_stock_threshold
payment_hold_minutes          default 15
pickup_enabled                BOOLEAN
delivery_enabled              BOOLEAN
notification_defaults        JSON
updated_at
```

## 18. Relationship Sketch

```text
                         User
                           │
     ┌────────────┬────────┼────────────┬──────────────┐
     ▼            ▼        ▼            ▼              ▼
 Membership     Ticket    Order       Task          Expense
     │            │        │            │              │
     ▼            ▼        ▼            ▼              ▼
    Plan        Event   OrderItem   Initiative    Transaction
                           │
                           ▼
                     ProductVariant
                           │
                           ▼
                        Product

 Payment ──► Transaction
 Ticket check-in ──► Attendance
```

## 19. Integrity Rules

- Confirmed ticket, order, and membership rows reference a `payments` row with status `PAID`.
- Each `PAID` payment has exactly one `POSTED` income transaction.
- Each `REIMBURSED` expense has exactly one `POSTED` expense transaction.
- Variant `stock_quantity` is never decremented below zero. The payment transaction fails with a conflict error if stock changed between hold and verify.
- `qr_token` is unique and is created only for `PAID` tickets.
- Foreign keys use `ON DELETE RESTRICT` for financial rows so ledger history remains.
