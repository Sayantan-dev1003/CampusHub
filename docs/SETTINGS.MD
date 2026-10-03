# Document 7 — Settings

## 1. Settings Architecture

Settings should be divided into:

```text
Profile Settings
Organization Settings
Membership Settings
Event Settings
Store Settings
Notification Settings
Payment Settings
Security Settings
Role & Permission Settings
```

---

# 2. Profile Settings

Available to every authenticated user.

```text
Name
Email
Phone
Profile Image
Student ID
Password
Two-factor authentication
Notification preferences
```

Members should be able to update their own profile while sensitive account/role information remains admin-controlled.

---

# 3. Organization Settings

Admin/Super Admin:

```text
Organization Name
Organization Logo
Description
Email
Phone
Address
Website
Social Links
Currency
Timezone
```

Example:

```text
Organization Name
Skyline Student Association

Currency
INR (₹)

Timezone
Asia/Kolkata
```

---

# 4. Membership Settings

Admin:

```text
Membership Types
Membership Fee
Membership Duration
Start Date
Expiry Policy
Benefits
Renewal Reminder
Grace Period
```

Example:

```text
Annual Membership
Fee: ₹500
Duration: 12 months

Renewal Reminder:
30 days before expiry
```

These settings support the challenge's membership-expiration and renewal requirements.

---

# 5. Event Settings

Admin:

```text
Default Event Duration
Default Ticket Types
Member Discount
Non-member Pricing
Default Capacity
Cancellation Rules
Check-in Settings
QR Ticket Settings
```

Recommended ticket states:

```text
ACTIVE
USED
CANCELLED
EXPIRED
```

---

# 6. Store Settings

Admin:

```text
Currency
Tax configuration
Low-stock threshold
Order status workflow
Pickup availability
Delivery availability
```

Recommended order workflow:

```text
PENDING
   ↓
PAID
   ↓
PROCESSING
   ↓
READY
   ↓
COMPLETED
```

---

# 7. Notification Settings

Users can control:

```text
Email Notifications
In-app Notifications
Event Reminders
Membership Reminders
Order Updates
Announcement Alerts
Task Notifications
Finance Notifications
```

Admin can control organization-wide notification defaults.

---

# 8. Payment Settings

Admin/Super Admin:

```text
Payment Provider
Razorpay Key
Webhook Configuration
Supported Payment Methods
Payment Currency
Payment Verification
```

The production implementation should never expose secret payment keys to the React frontend.

---

# 9. Security Settings

```text
Password Policy
Session Expiration
Login Attempt Limits
JWT Configuration
Two-Factor Authentication
Admin Access Policy
Audit Logging
```

An audit log is recommended for administrative actions such as:

```text
Member modified
Event cancelled
Product price changed
Inventory changed
Expense approved
Role changed
```

---

# 10. Role & Permission Settings

Super Admin can configure:

```text
Role Name
Module Access
Create
Read
Update
Delete
Approve
Manage
```

Example:

```text
Treasurer
Finance → Full
Members → Read
Events → Read
Orders → Read
Settings → Limited
```

---

# 11. Data / Export Settings

Admins and Treasurers can have access to:

```text
Export Members
Export Tickets
Export Orders
Export Transactions
Export Expenses
Export Event Reports
```

Recommended formats:

```text
CSV
PDF
```

---

# 12. System Settings

Super Admin:

```text
Maintenance Mode
Default Language
Timezone
Date Format
Currency
File Upload Limits
Allowed File Types
Pagination Defaults
API Configuration
```

---