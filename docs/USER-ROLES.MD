# Document 6 — User Roles

Primary role is one value on `users.role`: `MEMBER`, `ADMIN`, or `TREASURER`.

Volunteer work is `users.is_volunteer`. An administrator sets that flag. A volunteer keeps role `MEMBER` and gains task and expense actions. Admin and treasurer accounts are not required to be volunteers.

Visitors have no account. They can read public pages. Checkout, dues, tickets, orders, and announcements for members require a JWT.

## 1. Visitor

No account.

### Access

```text
Home
Published events
Event details
Published merchandise
Product details
About (organization settings from the API)
Login
Register
```

### Main Goal

Discover the organization, events, membership plans, and merchandise. All of that content is loaded from the API.

### Purchase Rule

Ticket, merchandise, and dues payments require registration and login. Member price applies only when the account has an `ACTIVE` membership. Everyone else pays `non_member_price`.

---

# 2. Member / Student

Role: `MEMBER`.

### Can

```text
Manage own profile
View membership plans
Pay dues and renew (Razorpay test mode)
View own membership status and expiry
View published events
Purchase tickets at the price the API returns
View own QR tickets
View own attendance state on a ticket
Browse merchandise
Place orders
View own order history
Read published announcements targeted to members or everyone
View own notifications
Mark own notifications read
```

### Cannot

```text
Manage other members
Create organization events
Modify inventory
Publish announcements
Approve reimbursements
View organization-wide financial data
Change roles
```

---

# 3. Volunteer

Capability: `is_volunteer = true` on a `MEMBER`.

### Can (in addition to member actions)

```text
View assigned tasks
Update status of own tasks
View initiative information for assigned work
Submit expenses with a receipt
View own reimbursement status
```

Assigning tasks and recording fundraiser income stay with Admin and Treasurer respectively.

---

# 4. Organizer / Admin

Role: `ADMIN`.

### Can

```text
Manage members (profile corrections, suspend, deactivate)
Set is_volunteer
Manage membership records (suspend; activation still follows a verified payment)
Create, edit, publish, and cancel events
Set member and non-member prices and capacity
Validate and check in tickets
View attendance
Manage products, variants, stock, and order fulfillment status
Publish announcements
Create initiatives and tasks
Assign tasks to volunteers
View operational dashboard aggregates
Manage organization settings and membership plans
Assign roles (MEMBER, ADMIN, TREASURER) and the volunteer flag
View payment-provider status (configured or not)
Upload the organization logo
```

### Cannot

```text
Approve, reject, or mark reimbursements paid
Record fundraiser income or other ledger entries
View the finance dashboard
```

Those finance actions belong to the Treasurer. Razorpay secrets stay in environment variables. The settings screen shows whether `RAZORPAY_KEY_ID` is present and does not display the secret.

---

# 5. Treasurer

Role: `TREASURER`.

### Can

```text
View finance dashboard
View all transactions
View income and expenses
Record fundraiser or other organization income through the finance API
Record organization expenses
Review expense claims
Approve or reject reimbursements
Mark reimbursements as paid (writes the ledger expense)
View financial aggregates by source and category
Read members, events, orders, and tickets (lookup only)
```

### Restriction

The treasurer role does not create events, change memberships, edit inventory, or change organization settings. A person who must do both jobs needs separate admin and treasurer accounts. The schema stores one primary role per user.

---

# 6. Role Permission Matrix

```text
                         Visitor  Member  Volunteer  Admin  Treasurer
---------------------------------------------------------------------
View public events          ✓       ✓        ✓        ✓        ✓
View event prices           ✓       ✓        ✓        ✓        ✓
Buy ticket                          ✓        ✓        ✓        ✓
Manage own membership               ✓        ✓        ✓        ✓
Manage other members                                  ✓
Create or edit events                                 ✓
Check in tickets                                      ✓
Buy merchandise                     ✓        ✓        ✓        ✓
Manage products / stock                               ✓
Manage order fulfillment                              ✓
Read announcements              ✓   ✓        ✓        ✓        ✓
Publish announcements                                 ✓
View own tasks                               ✓        ✓
Assign tasks                                          ✓
Submit expense                               ✓
Approve / reimburse expense                                    ✓
View organization finance                                      ✓
Record fundraiser income                                      ✓
Organization settings                                 ✓
Assign roles                                          ✓
```

Public announcement read is limited to rows with audience `PUBLIC` and status `PUBLISHED`. Members also receive audience `MEMBERS`.

---

# 7. Authorization Rules

- Protected routes require `Authorization: Bearer <jwt>`.
- The JWT carries `userId` and `role`. Volunteer checks load `is_volunteer` from the user row.
- A member route that takes an id returns 403 when the id is not the current user, except admin and treasurer (read).
- Check-in is admin.
- Expense review mutations are treasurer.
- Organization settings, membership plans, and role changes are admin.
