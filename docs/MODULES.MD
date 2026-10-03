# Document 5 — Modules & Features

Features below are core scope unless marked later. Each feature reads or writes PostgreSQL through the API. Screens render those responses.

## 1. Authentication and Authorization

```text
Registration                          → users row, role MEMBER
Login                                 → JWT
Current user                          → GET /auth/me
Password change
Logout                                → client drops the JWT
Role checks                           → users.role
Volunteer checks                      → users.is_volunteer
```

Two-factor authentication is later scope.

---

# 2. Membership Management

```text
Account registration
Membership plans (fee, duration, discounts, reminder window)
Pay dues                              → Razorpay test payment + membership ACTIVE
Renew                                 → new membership period after payment
Expiry                                → status derived from end_date and job
Payment status                        → payments row
Benefits                              → plan discount percents applied at checkout
Member directory and search           → admin list API
Membership history                    → many memberships per user
Suspend / deactivate                  → admin status update
Door lookup                           → member search returns current membership status
```

Renewal reminders are notification rows created by the scheduler from `end_date` and `renewal_reminder_days`.

---

# 3. Event Management

```text
Create, edit, publish, cancel
Capacity
Member price and non-member price
Remaining seats                       → capacity minus PAID, USED, and unexpired PENDING
Event analytics                       → sold, checked in, revenue from tickets and transactions
```

---

# 4. Ticketing

```text
Purchase                              → PENDING hold + Razorpay order
Digital ticket                        → qr_token after status PAID
Unique ticket id
Capacity hold and release
Validate and check in                 → status USED + attendance row
Attendance list
Revenue                               → sum of ticket transactions for the event
```

Check-in rejects tokens that are missing, for another event, `PENDING`, `CANCELLED`, `EXPIRED`, or already `USED`.

---

# 5. Announcements

```text
Create, edit, publish, archive
History with published_at
Audience PUBLIC or MEMBERS
In-app notifications on publish
```

---

# 6. Merchandise

```text
Catalogue with images from Storage
Variants (size, stock, low-stock threshold)
Price on the product, discount from the active plan
Online order after payment verification
Order history and status workflow
Inventory decrement on PAID
Low-stock list                        → variants where stock_quantity <= threshold
Admin stock adjustment                → variant quantity update
```

---

# 7. Volunteer Management

```text
Create initiative
Create tasks
Assign volunteers (is_volunteer members)
Due date and priority
Progress status
Volunteer list of own tasks
Initiative completion                 → aggregate of task statuses
Fundraiser income                     → treasurer ledger entry linked to the initiative
```

---

# 8. Finance

```text
Income rows from verified payments and fundraiser income entries
Expense rows from recorded expenses and paid reimbursements
Transaction list
Receipt file on the expense
Approve, reject, reimburse
Dashboard sums from the ledger
Balance = income − expenses
Revenue by source
Expenses by category
Pending reimbursements listed separately
```

Sources: `MEMBERSHIP`, `EVENT_TICKET`, `MERCHANDISE`, `FUNDRAISER`. Outflow categories include event costs, supplies, and `REIMBURSEMENT`.

---

# 9. Notifications

In-app rows:

```text
Membership renewal reminder
Event reminder
Ticket confirmation
Order confirmation and status update
Announcement published
Task assigned
Expense status update
```

The notification list and unread count come from `GET /api/v1/notifications`. Email sending is later scope.

---

# 10. Search

`GET /api/v1/search` queries:

```text
Events
Products
Announcements
```

Admin also receives members. Admin and treasurer also receive orders and tickets when the query matches. Results are database matches for the caller’s role.

---

# 11. Dashboards

All three dashboards are single aggregate endpoints. The UI maps fields onto KPI cards and lists.

Member:

```text
Membership status, plan name, expiry
Upcoming events
My tickets
Recent announcements
Recent orders
My tasks
Unread notifications
```

Admin:

```text
Total members
Active memberships
Upcoming events
Tickets sold
Open orders
Low-stock count
Open tasks
Pending expenses
Revenue (ledger income)
```

Treasurer:

```text
Total income
Total expenses
Current balance
Pending reimbursements
Revenue by source
Expense by category
Recent transactions
```

---

# 12. Settings and Uploads

```text
Organization profile
Membership plans
Store and event defaults
Per-user notification preferences
Payment provider status (test mode configured or not)
Profile image, product image, logo, receipt uploads
```

Role changes are admin. Export files and editable permission grids are later scope.
