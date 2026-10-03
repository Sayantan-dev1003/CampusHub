# Document 3 — Database Design

## 1. Database Model

PostgreSQL is appropriate because CampusHub contains many strongly related entities and financial transactions.

The central relationships are:

```text
User
 │
 ├── Member
 │      │
 │      ├── Membership
 │      ├── Ticket
 │      ├── Order
 │      ├── VolunteerTask
 │      └── Expense
 │
 └── Role
```

## 2. Users Table

```text
users
-----
id PK
name
email UNIQUE
password_hash
role
phone
student_id
profile_image
status
created_at
updated_at
```

Possible roles:

```text
MEMBER
ADMIN
TREASURER
VOLUNTEER
```

A separate role-permission design can be used later if the system becomes more complex.

---

## 3. Memberships Table

```text
memberships
-----------
id PK
user_id FK
membership_type
start_date
end_date
dues_amount
payment_status
status
created_at
updated_at
```

Relationship:

```text
User 1 ─── N Membership
```

---

# 4. Events Table

```text
events
------
id PK
title
description
date
start_time
end_time
venue
capacity
status
created_by FK
created_at
updated_at
```

Relationship:

```text
User 1 ─── N Events
Event 1 ─── N Tickets
```

---

# 5. Tickets Table

```text
tickets
-------
id PK
event_id FK
user_id FK
ticket_type
price
qr_token UNIQUE
status
checked_in_at
created_at
```

Relationship:

```text
Event 1 ─── N Tickets
User 1 ─── N Tickets
```

The QR token should be unique so that the same ticket cannot be represented by multiple QR records.

---

# 6. Attendance

Attendance can either be represented directly through ticket status or maintained using a dedicated table.

Recommended dedicated table:

```text
attendance
----------
id PK
ticket_id FK
event_id FK
user_id FK
checked_in_at
checked_in_by FK
```

This is useful when the organization eventually needs a reliable attendance history.

---

# 7. Announcements Table

```text
announcements
-------------
id PK
title
content
created_by FK
audience
status
published_at
created_at
updated_at
```

---

# 8. Products Table

```text
products
--------
id PK
name
description
category
price
image_url
status
created_at
updated_at
```

Because the challenge includes sizes, stock should be normalized.

```text
product_variants
----------------
id PK
product_id FK
size
stock_quantity
low_stock_threshold
```

Relationship:

```text
Product 1 ─── N ProductVariant
```

---

# 9. Orders

```text
orders
------
id PK
user_id FK
total_amount
payment_status
order_status
delivery_method
created_at
updated_at
```

Order items:

```text
order_items
-----------
id PK
order_id FK
product_variant_id FK
quantity
unit_price
subtotal
```

Relationships:

```text
User 1 ─── N Orders
Order 1 ─── N OrderItems
ProductVariant 1 ─── N OrderItems
```

---

# 10. Initiatives

```text
initiatives
-----------
id PK
name
description
type
start_date
end_date
status
created_by FK
```

Example:

```text
Bake Sale Fundraiser
```

---

# 11. Tasks

```text
tasks
-----
id PK
initiative_id FK
assigned_to FK
title
description
priority
due_date
status
created_at
updated_at
```

Relationship:

```text
Initiative 1 ─── N Tasks
User 1 ─── N Tasks
```

---

# 12. Expenses

```text
expenses
--------
id PK
submitted_by FK
category
description
amount
receipt_url
status
approved_by FK
reimbursed_at
created_at
updated_at
```

Statuses:

```text
PENDING
APPROVED
REJECTED
REIMBURSED
```

---

# 13. Transactions

This becomes the centralized financial ledger.

```text
transactions
------------
id PK
type
category
reference_type
reference_id
amount
payment_method
description
status
created_at
```

Examples:

```text
INCOME / MEMBERSHIP
INCOME / EVENT_TICKET
INCOME / MERCHANDISE
INCOME / FUNDRAISER

EXPENSE / EVENT
EXPENSE / SUPPLIES
EXPENSE / REIMBURSEMENT
```

This allows the Finance dashboard to aggregate financial activity from multiple modules.

---

# 14. Notifications

```text
notifications
-------------
id PK
user_id FK
title
message
type
is_read
created_at
```

Examples:

```text
Membership expires soon
Ticket purchased
Event tomorrow
Order ready
Task assigned
Expense approved
```

---

# 15. Settings

```text
organization_settings
---------------------
id PK
organization_name
logo_url
email
phone
address
currency
timezone
membership_expiry_policy
notification_preferences
updated_at
```

---

# 16. Main ER Relationship

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
      Membership        Tickets         Orders
            │              │              │
            │              ▼              ▼
            │            Event       Order Items
            │                             │
            │                             ▼
            │                          Product
            │                             │
            │                             ▼
            │                           Stock
            │
            └────────────────────────────┐
                                         │
                                         ▼
                                      Finance
                                         │
                              ┌──────────┴─────────┐
                              ▼                    ▼
                          Transactions         Expenses
```

---