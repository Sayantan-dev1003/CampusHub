# Student Organization System

## 1. Problem Statement

Student organizations manage a large number of activities during an academic year, including member registration, membership dues, events, ticket sales, merchandise, announcements, volunteer work, and financial transactions. In the current scenario described for the Skyline Student Association, these operations are handled using disconnected tools: member sign-ups are stored in spreadsheets, event tickets may be sold manually for cash, the club budget is maintained in a notebook, announcements are repeatedly sent through WhatsApp, and volunteer expenses are reimbursed only after collecting and verifying receipts. This fragmentation causes operational inefficiency, makes information difficult to track, and creates uncertainty around memberships, event participation, and the organization’s financial position.

The proposed Student Organization System is a unified digital platform that acts as the organization’s central operating system. It should allow students to join the organization, maintain their membership information, pay dues, register for events, purchase tickets and merchandise, receive announcements, participate in volunteer activities, and interact with the organization through a single interface. At the same time, organization administrators should be able to manage members, events, inventory, announcements, tasks, expenses, reimbursements, and financial records without relying on multiple disconnected tools.

The platform should therefore create a single source of truth for the organization. Whenever a member makes a payment, purchases a ticket, buys merchandise, attends an event, submits an expense, or renews a membership, the relevant information should be recorded in the appropriate module and become available to authorized administrators. At the end of the semester, the treasurer should be able to see money collected from membership dues, tickets, merchandise, and fundraising activities, as well as expenses and reimbursements, without manually combining information from notebooks and receipts.

## 2. Locked Technology Stack

| Layer | Choice |
| --- | --- |
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | PostgreSQL hosted on Supabase |
| ORM | Prisma |
| File storage | Supabase Storage |
| Payments | Razorpay test mode |

The React app talks only to the Express API. Prisma is the only database client. Supabase is the Postgres host and the file store. Razorpay runs in test mode: test key id, test key secret, and webhook secret live in server environment variables.

## 3. Dynamic Data Rule

Every value shown in the product comes from the API, which reads PostgreSQL.

That includes organization name, logo, currency, timezone, membership fees, benefits, event lists, ticket prices, capacity, products, sizes, stock, orders, announcements, tasks, notifications, dashboard KPIs, income, expenses, and balance.

When a query returns no rows, the screen shows an empty state driven by that response. Sample JSON in the API document describes the response shape. Those numbers are not content the UI may render on its own. Development seed rows, if used, are inserted into the database and returned by the same endpoints.

## 4. Main Users and Roles

The system has three primary roles, stored on the user: `MEMBER`, `ADMIN`, and `TREASURER`.

A student uses the platform for membership, events, tickets, merchandise, announcements, and volunteer work. An administrator manages members, events, announcements, merchandise, inventory, orders, volunteer tasks, organization settings, membership plans, and role assignment. The treasurer manages the ledger, income, expenses, reimbursements, and financial reports. There is no separate super-admin role or dashboard.

Volunteer is a capability on a member (`is_volunteer`), assigned when they take on fundraising or event work. It is not a separate exclusive role, so a member can hold tasks and still use the member experience.

Visitors may browse the public home, events, and store. Paying dues, buying a ticket, or placing an order requires an account so every payment has a user. Member price applies when the buyer has an `ACTIVE` membership. Otherwise the non-member price applies.

## 5. Core Modules

### Membership Management Module

The Membership Management module maintains the member directory. Registration stores name, email, phone, and student id. Paying the plan fee through Razorpay creates the membership: type, dues amount, payment status, start date, expiry date, and status `ACTIVE`. Benefits such as ticket and merchandise discounts live on the membership plan and are applied at checkout. Memberships expire according to the plan duration. A scheduled job inserts in-app renewal reminders before expiry. Staff can look up a member at the door and see whether the membership is active.

### Event Management Module

Administrators create an event with date, time, venue, capacity, status, member price, and non-member price. Publishing makes it visible on the public and member event lists. Remaining seats are `capacity` minus tickets that are `PAID` or `USED`, including `PENDING` holds that have not expired. Cancelling an event updates its status and blocks new purchases.

### Ticketing and Attendance Module

A ticket purchase starts a Razorpay test order and a `PENDING` ticket hold. After payment verification succeeds, the ticket becomes `PAID`, a unique QR token is stored, capacity is consumed, and an income transaction is written in the same database transaction. At the entrance, an administrator validates the QR token, confirms the ticket belongs to the event, is `PAID`, and has not been used, then marks it `USED` and writes an attendance row. After the event, sold count, check-in count, and revenue are aggregates of those rows.

### Announcement Module

Administrators create an announcement with title, content, audience, and status. Publishing sets `published_at` and creates a notification row for each user in the audience. Members read announcements from the API. The table is the historical record of what was announced and when.

### Merchandise and Inventory Module

Each product has a name, description, category, price, image (Supabase Storage URL), and status. Sizes and quantities live on product variants. Checkout checks variant stock, creates a `PENDING` order, and opens Razorpay checkout. Successful verification marks the order `PAID`, decrements variant stock, and writes merchandise income. Member plan discounts are applied in the order total before the Razorpay order is created. Administrators see orders and remaining stock from the database, including variants at or below their low-stock threshold.

### Volunteer and Task Management Module

Administrators create an initiative (for example a fundraiser), add tasks, assign them to volunteers, and track status. Volunteers see their tasks and update progress. Fundraising income is recorded as a ledger transaction with reference type `INITIATIVE`. Expenses submitted against the initiative link to that initiative id.

### Finance and Expense Management Module

The ledger is the `transactions` table. Income rows are created only from verified payments: membership dues, ticket sales, merchandise, and recorded fundraiser income. Expense rows are created when a treasurer records an organization expense or marks a reimbursement as paid. A volunteer submits an expense with amount, category, description, optional initiative, and a receipt file stored in Supabase Storage. The treasurer approves, rejects, or marks it reimbursed. The finance dashboard sums the ledger: total income, total expenses, balance, pending reimbursements, revenue by source, and expenses by category.

## 6. Important Objects / Entities

The central object is the **User**. A user with role `MEMBER` is the student record: id, name, contact information, student id, profile image, account status, and volunteer capability. Membership history hangs off the user.

The **Membership plan** defines type, fee, duration, ticket discount, merchandise discount, and renewal reminder window. The **Membership** is one period for one user: plan, start, end, dues amount, payment, and status. One user can have many memberships over time.

The **Event** is a dated activity with venue, capacity, member price, non-member price, and status.

The **Ticket** connects a user to an event: type, price, QR token, payment, and status (`PENDING`, `PAID`, `USED`, `CANCELLED`, `EXPIRED`).

The **Announcement** is an official message: title, content, author, audience, status, and publication time.

The **Product** and **Product variant** represent merchandise. The variant holds size and stock. The **Order** and **Order item** record a purchase, payment status, and fulfillment status.

The **Initiative** is a volunteer activity such as a fundraiser. The **Task** is a unit of work on that initiative: assignee, due date, priority, and status.

The **Expense** is a claim: amount, category, receipt URL, submitter, optional initiative, reviewer, and status (`PENDING`, `APPROVED`, `REJECTED`, `REIMBURSED`).

The **Payment** is the Razorpay test-mode attempt: purpose, amount, Razorpay order id, payment id, and status. The **Transaction** is the ledger line created when money actually enters or leaves. A verified payment produces one income transaction. A paid reimbursement produces one expense transaction.

The **Notification** is an in-app message for one user. **Organization settings** store display configuration (name, logo, currency, timezone, contact). Payment secrets stay in the server environment.

## 7. Relationships Between Objects

A user has many memberships, tickets, orders, tasks, expenses, payments, and notifications. A membership belongs to one user and one plan. An event has many tickets. Each ticket belongs to one user, one event, and one payment once checkout starts.

Membership status selects the ticket price. A verified ticket payment writes a transaction and consumes capacity. Check-in updates the ticket and inserts attendance together.

A product has many variants. An order has many items, each pointing at a variant. A verified merchandise payment writes a transaction and decrements stock together. The active membership plan supplies any discount.

An initiative has many tasks and may have many expenses. Completing a task updates that task. Submitting an expense stores the claim and receipt. Reimbursement writes a ledger expense.

Announcements are authored by an admin. Publishing creates notifications for the selected audience.

## 8. End-to-End Workflows

### Workflow 1: Student Joins the Organization

A student registers and receives a `MEMBER` account. They choose the current membership plan. The API creates a Razorpay test order for the plan fee. After verification, the system writes the membership as `ACTIVE` for the plan duration, stores the payment, and writes an income transaction. Member benefits apply on later ticket and merchandise checkouts. Before expiry, the reminder job inserts a renewal notification. Renewal repeats the same payment path and creates a new membership period. An administrator can suspend the membership. This replaces the spreadsheet sign-up list.

### Workflow 2: Student Purchases an Event Ticket

An administrator creates and publishes an event with capacity and both prices. A signed-in student selects the event. The API prices the ticket from membership status, rejects the purchase when remaining capacity is zero, creates a `PENDING` ticket hold and a Razorpay order. After verification, the ticket becomes `PAID`, the QR token is kept, and ticket income is written to the ledger. Unpaid holds expire and release capacity.

### Workflow 3: Student Attends the Event

An administrator scans or enters the QR token. The API checks that the ticket exists, matches the event, is `PAID`, and is not already `USED`. It then sets status `USED`, sets `checked_in_at`, and inserts an attendance row with the staff user id. Event analytics count `PAID` plus `USED` as sold, `USED` as attended, and sum ticket transactions as revenue.

### Workflow 4: Organization Publishes an Announcement

An administrator saves an announcement and publishes it. `published_at` is set and members in the audience receive notification rows. The announcement remains readable from the history list.

### Workflow 5: Member Purchases Merchandise

A student opens the catalogue from the API, selects a variant and quantity, and checks out. The API checks stock, applies the membership merchandise discount, creates a `PENDING` order, and starts Razorpay checkout. After verification, the order is `PAID`, variant stock decreases, and merchandise income is written. Administrators read orders and per-size stock from the API. Low stock is any variant whose quantity is less than or equal to its threshold.

### Workflow 6: Fundraiser Task Assignment

An administrator creates an initiative and tasks, then assigns each task to a volunteer. Assignees see the tasks on their dashboard and update status. The initiative progress view counts tasks by status. Fundraiser money collected is entered as income linked to the initiative so it appears on the ledger.

### Workflow 7: Volunteer Expense and Reimbursement

A volunteer submits amount, category, description, optional initiative, and a receipt uploaded through the API into Supabase Storage. Status starts as `PENDING`. The treasurer approves or rejects. Marking reimbursed sets `REIMBURSED`, records `reimbursed_at`, and writes an expense transaction. The semester report includes that outflow.

### Workflow 8: Semester-End Financial Review

The treasurer opens the finance dashboard. The API aggregates `transactions`: dues, tickets, merchandise, fundraiser income, expenses, and reimbursements, plus expenses still `PENDING` or `APPROVED`. The balance is income minus expenses from the ledger.

## 9. Module-to-Module Interaction

Membership status selects event ticket price and merchandise discount. Events define capacity and prices. Ticketing enforces capacity, records attendance, and writes finance rows. Merchandise orders update inventory and finance together. Volunteer tasks sit on initiatives; expenses on those initiatives flow into reimbursement and then the ledger. Announcements use membership of the audience list and write notifications. Every dashboard reads these tables. None of the modules keep a second copy of money.

## 10. Overall System Flow

CampusHub connects membership, events and ticketing, merchandise and inventory, announcements, volunteer management, and finance. The member is the person record at the center. Payments, check-ins, stock changes, task updates, and reimbursements each create or update database rows inside a Prisma transaction where more than one table must change together. Administrators use the operational dashboard. The treasurer uses the ledger dashboard.

```text
Student Registers
       ↓
Account Created (MEMBER)
       ↓
Student Pays Dues (Razorpay test mode)
       ↓
Membership Activated + Ledger Income
       ↓
Student Views Events (from API)
       ↓
Buys Event Ticket
       ↓
Payment Verified
       ↓
QR Ticket Stored + Capacity Updated
       ↓
QR Checked
       ↓
Attendance Recorded
       ↓
Student Buys Merchandise
       ↓
Payment Verified
       ↓
Order Paid + Inventory Reduced + Revenue Recorded
       ↓
Volunteer Task Assigned and Updated
       ↓
Expense Submitted with Receipt
       ↓
Treasurer Approves and Marks Reimbursed
       ↓
Ledger Expense Written
       ↓
Finance Dashboard Reads the Ledger
```

## 11. Core Scope and Later Scope

Core scope is every flow in section 8: registration, dues and renewal, renewal reminders, events, member and non-member ticket prices, Razorpay test payments, QR check-in, announcements, merchandise with variant stock, volunteer initiatives and tasks, expense claims with receipts, reimbursement, fundraiser income, and the three dashboards. All of those screens read and write the API.

Later scope, outside the first build: two-factor authentication, CSV or PDF export, a configurable permission matrix, email delivery, and refunds. In-app notifications for the events listed in the modules document are in core scope. Email is not required for those notifications to exist.

## 12. System Map

```text
                         CAMPUSHUB
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
     MEMBERSHIP            EVENTS             STORE
        │                    │                    │
        │                TICKETING            ORDERS
        │                    │                    │
        │                ATTENDANCE           INVENTORY
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                     PAYMENTS (Razorpay test)
                             │
                       FINANCE / LEDGER
                             │
                   ┌─────────┴─────────┐
                   │                   │
                INCOME              EXPENSES
                   │                   │
                   │              REIMBURSEMENT
                   │
                   └─────────┬─────────┘
                             │
                    DASHBOARDS (API aggregates)
                             │
              ┌──────────────┼──────────────┐
              │              │              │
            MEMBER          ADMIN        TREASURER
              │              │              │
              └──────────────┼──────────────┘
                             │
                    IN-APP NOTIFICATIONS
                             │
                    ORGANIZATION SETTINGS
```
