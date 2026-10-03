# Document 4 — UI/UX & Product Design

## 1. Design Philosophy

CampusHub is a responsive SaaS-style application for one student organization. Navigation is short, forms are consistent, and every number on screen is a field from the API.

```text
Clean
Simple
Professional
Fast to navigate
Mobile responsive
Consistent
Data from the API
```

## 2. Dynamic Data on Every Screen

Each page follows the same states:

```text
Loading     skeleton while the request is in flight
Success     render the response
Empty       the API returned an empty list or null detail
Error       message from the API plus a retry action
```

Organization name, logo, currency, and timezone come from `GET /api/v1/settings/organization`. Fees come from membership plans. Prices come from the event or variant payload. Dashboard figures come from the dashboard endpoints. The interface does not embed sample member counts, revenue, events, or products.

Empty copy describes the next action and links to a real route. Example structure for an empty order list:

```text
Heading: No orders yet
Body: Merchandise orders will appear here after a purchase.
Action: Browse merchandise → /store
```

The heading is interface copy. The order rows, when they exist, are `data` from `GET /api/v1/orders/my`.

## 3. Color Theme

Primary:

```text
Indigo       #4F46E5
Blue         #2563EB
```

Neutral:

```text
Background   #F8FAFC
Cards        #FFFFFF
Text         #0F172A
Muted Text   #64748B
Borders      #E2E8F0
```

Semantic:

```text
Success      #16A34A
Warning      #F59E0B
Error        #DC2626
```

Tailwind theme tokens map to these values. Status badges use semantic colors for API enums (`ACTIVE`, `PAID`, `PENDING`, `USED`, `REJECTED`).

## 4. Typography

```text
Page Heading       28–32px
Section Heading    20–24px
Card Heading       16–18px
Body               14–16px
Supporting Text    12–14px
```

## 5. Layout

Desktop authenticated app:

```text
┌──────────────────────────────────────────────────────┐
│ Logo (org settings)     Search    Bell    Profile   │
├─────────────┬────────────────────────────────────────┤
│ Sidebar     │  Page heading                          │
│ from role   │  KPI cards from dashboard API          │
│             │  Tables / cards from list APIs         │
└─────────────┴────────────────────────────────────────┘
```

The logo and organization name are `organization_settings`. The badge on the bell is `GET /api/v1/notifications` unread count. Sidebar items depend on `user.role` and `user.isVolunteer` from `GET /api/v1/auth/me`.

Member mobile uses bottom navigation: Home, Events, Tickets, Store, Account. Admin and treasurer on small screens use a collapsible sidebar with the same links as desktop.

Public pages have a top bar: organization name, Events, Store, Login, Register.

## 6. Component System

```text
Button
Input
Select
Modal
Dropdown
Badge
Card
Table
Pagination
Tabs
Toast
Alert
Dialog
Date Picker
Search Bar
Chart
Empty State
Loading Skeleton
QR Code
```

Tables support search, filtering, sorting, and pagination by passing query params the list endpoint already accepts. Row actions call the matching mutation. Bulk selection is omitted in the core build.

Charts on the finance dashboard plot `revenueBySource` and `expensesByCategory` from `GET /api/v1/finance/summary`. With no transactions, the chart area shows the empty state.

## 7. KPI Cards

Cards share one layout: label, value, optional supporting line. The value is a number or formatted money field from the dashboard payload. The supporting line uses a comparison field when the API sends one. When the API sends only the current total, the card shows that total.

```text
┌────────────────────────┐
│ {label}                │
│ {value}                │
│ {supportingText}       │
└────────────────────────┘
```

Member dashboard (`GET /api/v1/dashboard/member`): membership status, upcoming events count, ticket count, open task count.

Admin dashboard (`GET /api/v1/dashboard/admin`): member count, active memberships, upcoming events, tickets sold, open orders, low-stock count, open tasks, pending expenses, revenue.

Treasurer dashboard (`GET /api/v1/dashboard/finance` or `GET /api/v1/finance/summary`): income, expenses, balance, pending reimbursements, recent transactions.

## 8. Forms

```text
Section
   ↓
Fields
   ↓
Client validation
   ↓
Submit → API
   ↓
Field errors from 400 responses or toast on success
```

Server validation is authoritative. Money amounts displayed in a form are the amounts the create-payment response returns, so the Razorpay checkout amount matches the row.

## 9. Key Screens and Their APIs

| Screen | Data source |
| --- | --- |
| Public home | `GET /api/v1/settings/organization`, `GET /api/v1/events?status=PUBLISHED`, `GET /api/v1/announcements?audience=PUBLIC`, `GET /api/v1/membership-plans?active=true` |
| Event details | `GET /api/v1/events/:eventId` including prices, capacity, remaining seats |
| Member dashboard | `GET /api/v1/dashboard/member` |
| Ticket / QR | `GET /api/v1/tickets/:ticketId` (`qrToken` only when status is `PAID` or `USED`) |
| Admin dashboard | `GET /api/v1/dashboard/admin` |
| Event management | `GET/POST/PATCH /api/v1/events` |
| QR check-in | `POST /api/v1/tickets/check-in` with the scanned token |
| Merchandise store | `GET /api/v1/products` with variants and stock |
| Inventory | `GET /api/v1/inventory/low-stock` and product variant updates |
| Volunteer task board | `GET /api/v1/tasks/my` or `GET /api/v1/initiatives/:id` |
| Finance dashboard | `GET /api/v1/finance/summary` and `GET /api/v1/finance/transactions` |
| Checkout | `POST /api/v1/payments/orders` then Razorpay test checkout then `POST /api/v1/payments/verify` |

Search in the header calls `GET /api/v1/search?q=` and renders grouped results (events, products, announcements; members and orders only if the role allows).

## 10. Demo Path

A presentation walks live API data:

```text
1. Public home
2. Register and pay dues
3. Member dashboard
4. Event details and ticket purchase
5. QR ticket
6. Admin event list and QR check-in
7. Store purchase
8. Inventory counts after the order
9. Initiative, task assignment, task update
10. Expense with receipt, treasurer decision, ledger update
11. Finance dashboard
```

Each step is a real request. Refreshing the dashboards shows the new rows.
