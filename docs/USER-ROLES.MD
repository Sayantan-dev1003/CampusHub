# Document 6 — User Roles

## 1. Visitor

A visitor does not need an account.

### Access

```text
Home
Events
Event Details
Merchandise
Product Details
About
Login
Register
```

### Main Goal

Discover the organization, events, membership opportunities, and merchandise.

---

# 2. Member / Student

This is the normal authenticated user.

### Can:

```text
Manage profile
View membership
Renew membership
View events
Purchase tickets
View QR tickets
Check event attendance status
Browse merchandise
Place orders
View order history
Read announcements
View volunteer tasks
Update task progress
View notifications
```

### Cannot:

```text
Manage other members
Create organization events
Modify inventory
Publish official announcements
Approve reimbursements
View organization-wide financial data
```

---

# 3. Volunteer

A Volunteer can be implemented as an additional permission set for members.

### Can:

```text
View assigned tasks
Update task status
View initiative information
Submit expenses
View own reimbursement status
```

The volunteer role is useful because the challenge specifically includes volunteers handling fundraising activities and submitting expenses for reimbursement.

---

# 4. Organizer / Admin

The Admin is responsible for operational management.

### Can:

```text
Manage members
Manage memberships
Create and manage events
Configure ticketing
Check tickets
Manage attendance
Manage merchandise
Manage inventory
Manage orders
Publish announcements
Create initiatives
Assign volunteer tasks
View operational analytics
```

### Cannot:

For separation of financial responsibility, sensitive finance actions can be restricted to the Treasurer.

---

# 5. Treasurer

Treasurer has financial authority.

### Can:

```text
View finance dashboard
View all transactions
View income
View expenses
Review expense claims
Approve/reject reimbursements
Mark reimbursements as paid
View financial reports
```

### Recommended Restriction

The Treasurer should not automatically have unrestricted ability to change event or membership data unless also assigned the Admin role.

---

# 6. Super Admin

Optional role for the hackathon.

### Can:

```text
Everything
Manage organization settings
Manage users
Manage roles
Configure permissions
Configure integrations
```

This role is useful for system-level configuration but can be omitted from the first MVP.

---

# 7. Role Permission Matrix

```text
                              Visitor Member Volunteer Admin Treasurer
----------------------------------------------------------------------
View Public Events              ✓      ✓       ✓        ✓       ✓
Buy Ticket                      ✓*     ✓       ✓        ✓       ✓
Manage Own Membership                  ✓       ✓        ✓       ✓
Manage Members                                      ✓
Create Events                                        ✓
Manage Tickets                                       ✓
Check-in Tickets                                     ✓
Buy Merchandise                 ✓*     ✓       ✓        ✓       ✓
Manage Products/Inventory                            ✓
Manage Orders                                        ✓
Read Announcements               ✓      ✓       ✓        ✓       ✓
Publish Announcements                                ✓
View Own Tasks                          ✓       ✓
Assign Tasks                                          ✓
Submit Expense                           ✓
Approve Expense                                            ✓
View Organization Finance                                  ✓
Organization Settings                              ✓**
```

`*` Public purchase can be supported where the event/store allows it.
`**` Recommended for Super Admin rather than ordinary Admin.

---