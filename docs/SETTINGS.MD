# Document 7 — Settings

Settings split into two stores.

| Store | What it holds | Who edits it |
| --- | --- | --- |
| PostgreSQL | Organization profile, membership plans, store thresholds, notification preferences | Admin via API; users edit their own profile and notification preferences |
| Server environment | `DATABASE_URL`, Supabase service role, JWT secret, Razorpay test key id, key secret, webhook secret | Deployment configuration |

The UI loads every visible setting from `GET /api/v1/settings/organization`, `GET /api/v1/membership-plans`, and `GET /api/v1/auth/me`. Currency symbols, fees, organization name, and timezone are fields in those responses.

Initial seed rows may insert an organization name, currency `INR`, and timezone `Asia/Kolkata`. After seeding, the running app reads those rows. Changing the name in the database changes the UI on the next fetch.

## 1. Settings Areas

```text
Profile Settings              # users row
Organization Settings         # organization_settings row
Membership Plans              # membership_plans rows
Event Defaults                # fields on organization_settings
Store Settings                # fields on organization_settings
Notification Preferences      # users.notification_preferences and org defaults
Payment Status                # derived from env, read-only in the UI
Security                      # password change; policy constants in server config
Role Assignment               # users.role and users.is_volunteer
```

## 2. Profile Settings

Available to every authenticated user through `PATCH /api/v1/users/me`.

```text
Name
Email
Phone
Profile image (avatars bucket)
Student ID
Password (separate endpoint)
Notification preferences
```

Role, volunteer flag, and account status change only through the super-admin user API.

## 3. Organization Settings

Admin. One row.

```text
Organization name
Logo URL (organization bucket)
Description
Email
Phone
Address
Website
Social links
Currency
Timezone
Date format
```

Public pages (home, about, footer) read this row. They do not embed a fixed organization name.

## 4. Membership Plans

Admin. Many rows. Checkout and renewal read the active plan.

```text
Name
Fee
Currency (defaults from organization settings)
Duration in months
Ticket discount percent
Merchandise discount percent
Renewal reminder days
Grace period days
Active flag
```

A plan fee is the Razorpay amount for dues. Benefits applied at ticket and merchandise checkout are the discount percents on the member’s active plan. The reminder job uses `renewal_reminder_days`.

## 5. Event Defaults

Admin, stored on organization settings and copied into a new event form as initial API values. Each event then stores its own capacity and prices.

```text
Default duration minutes
Default capacity
Default member price
Default non-member price
Check-in allowed statuses (PAID)
Payment hold minutes (15)
```

Ticket statuses used by the system:

```text
PENDING
PAID
USED
CANCELLED
EXPIRED
```

## 6. Store Settings

Admin, on organization settings.

```text
Low-stock threshold default (copied onto new variants; each variant can override)
Order status workflow
Pickup enabled
Delivery enabled
```

Order workflow:

```text
PENDING → PAID → PROCESSING → READY → COMPLETED
```

`CANCELLED` is allowed from `PENDING`. Stock decrements when payment verification sets `PAID`.

## 7. Notification Settings

Each user stores preferences:

```text
In-app event reminders
In-app membership reminders
In-app order updates
In-app announcement alerts
In-app task notifications
In-app finance notifications
```

Organization settings store the default preference object applied at registration. Publishing, assignment, payment, and the scheduler insert `notifications` rows when the preference allows that type. Email transport is later scope.

## 8. Payment Settings

Razorpay test mode is configured only with environment variables:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

`GET /api/v1/settings/payments` returns:

```json
{
  "provider": "razorpay",
  "mode": "test",
  "configured": true
}
```

`configured` is true when all three variables are set. The response omits secret values. The React app receives `RAZORPAY_KEY_ID` only inside a checkout payload from `POST /api/v1/payments/orders`.

Supported method in this build is Razorpay Checkout in test mode. Currency for orders is the organization currency.

## 9. Security Settings

Server configuration:

```text
Password hashing (bcrypt)
JWT expiry from JWT_EXPIRES_IN
Minimum password length
Login rate limit
```

Authenticated password change: `POST /api/v1/auth/password`.

Logout is client-side deletion of the JWT. The API does not keep a server session.

Audit requirements for core scope are the existing foreign keys and timestamps: `created_by`, `approved_by`, `checked_in_by`, `updated_at`. A separate audit-log table is later scope.

Two-factor authentication is later scope and has no schema in the core design.

## 10. Role Assignment

Admin:

```text
PATCH /api/v1/users/:userId/role
body: { "role": "MEMBER | ADMIN | TREASURER", "isVolunteer": true }
```

Module permissions are the matrix in the user-roles document. A configurable permission grid is later scope.

## 11. Exports

CSV and PDF export are later scope. Core financial review uses `GET /api/v1/finance/summary` and `GET /api/v1/finance/transactions`.

## 12. Upload Limits

Server configuration, enforced by the upload middleware:

```text
Max file size
Allowed types: images for avatars, products, and logo; images and PDF for receipts
```

The organization settings API does not override these limits in the core build.
