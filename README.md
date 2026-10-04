# 🎓 CampusHub

> **A unified digital platform for student organization management** — memberships, events, ticketing, merchandise, volunteer work, and finance, all in one place.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Overview](#api-overview)
- [Payment Flow](#payment-flow)
- [Documentation](#documentation)

---

## Overview

CampusHub is a full-stack Student Organization Management System built for the **Skyline Student Association** and similar campus organizations. It replaces disconnected tools like spreadsheets, WhatsApp groups, cash-based ticket sales, and paper-based budgets with a single, authoritative platform.

Every value displayed in the UI — organization name, logo, membership fees, event listings, ticket prices, product inventory, finance totals — is fetched from a live API backed by PostgreSQL. The platform supports three roles (Member, Admin, Treasurer), a volunteer capability, and public access for visitors, each with clearly scoped permissions.

---

## Features

### 👤 Membership Management
- Student registration and login (JWT-based auth)
- Flexible membership plans with configurable fees, durations, and discounts
- Pay dues and activate membership on payment confirmation
- Membership history, status tracking, and expiry management
- Automated in-app renewal reminders via a background scheduler
- Admin member directory with search, suspension, and deactivation

### 🎟️ Events & Ticketing
- Create, edit, publish, and cancel events with capacity limits
- Dual pricing: member price vs. non-member price
- Ticket purchase with pending capacity hold
- Unique QR-code digital tickets generated on payment confirmation
- QR code check-in with attendance tracking
- Event analytics: sold count, check-in count, revenue

### 📢 Announcements
- Rich announcements with `PUBLIC` or `MEMBERS` audience targeting
- Publish history with timestamps
- In-app notifications generated on publish

### 🛒 Merchandise & Inventory
- Product catalogue with images stored on the server
- Variants by size with stock quantities and low-stock thresholds
- Membership discount applied at checkout
- Order lifecycle: `PENDING → PAID → FULFILLED / CANCELLED`
- Admin stock adjustments and order fulfillment management

### 🙋 Volunteer & Task Management
- Initiatives (e.g., fundraisers) with associated tasks
- Task assignment to volunteer members, with due dates and priority
- Volunteers update own task progress; admins track initiative completion
- Fundraiser income recorded as a ledger transaction

### 💰 Finance & Expenses
- Unified ledger (`transactions` table) for all income and expenses
- Income sources: memberships, event tickets, merchandise, fundraisers
- Expense management with receipt file uploads
- Volunteer expense submissions with approval → reimbursement workflow
- Treasurer finance dashboard: balance, revenue by source, expenses by category, pending reimbursements

### 🔔 Notifications
- In-app notification system for: membership renewal reminders, event reminders, ticket confirmations, order status updates, task assignments, expense status changes, and new announcements
- Unread count badge; mark-as-read support

### 📊 Role-Based Dashboards
- **Member Dashboard** — membership status, upcoming events, tickets, orders, tasks, notifications
- **Admin Dashboard** — total members, active memberships, tickets sold, open orders, low-stock count, pending expenses, revenue
- **Treasurer Dashboard** — total income, total expenses, current balance, pending reimbursements, revenue by source, expense by category

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, Lucide React, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (local, managed via pgAdmin) |
| **ORM** | Prisma |
| **File Uploads** | Multer (local disk storage) |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Validation** | Zod |
| **Security** | Helmet, express-rate-limit, CORS |
| **Scheduling** | node-cron |
| **API Docs** | Swagger UI (swagger-ui-express) |
| **Linting** | OXLint |

---

## Architecture

```
┌──────────────────────┐
│   Browser (React)    │
│   Vite + Lucide UI   │
└──────────┬───────────┘
           │ HTTP / JSON  /api/v1
┌──────────▼───────────┐
│   Node.js + Express  │
│  Auth, RBAC, Services│
└──────────┬───────────┘
           │
  ┌────────┼────────────────┐
  │        │               │
┌─┴──────┐ ┌┴────────────┐ ┌┴──────────────┐
│ Prisma │ │   Multer    │ │  node-cron    │
│  ORM   │ │file uploads │ │  scheduler   │
└─┬──────┘ └─────────────┘ └───────────────┘
  │
┌─┴──────────────┐
│  PostgreSQL    │
│  (local/pgAdmin│
└────────────────┘
```

- All requests from the browser go exclusively through the Express API.
- File uploads are handled by **Multer** and stored on the local server.
- A **scheduler** (node-cron) runs in the API process to insert notification rows and release expired pending holds.

---

## Project Structure

```
CampusHub/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & models
│   │   ├── seed.js             # Development seed script
│   │   └── migrations/         # Prisma migration history
│   └── src/
│       ├── app.js              # Express app setup
│       ├── server.js           # Server entry point
│       ├── config/             # App configuration
│       ├── routes/             # Route definitions (auth, members, events, …)
│       ├── services/           # Business logic layer
│       ├── middleware/         # Auth, RBAC, validation, error handler
│       ├── validators/         # Zod validation schemas
│       ├── jobs/               # node-cron scheduled jobs
│       ├── lib/                # Shared utilities (Prisma client, JWT, helpers)
│       └── docs/               # Swagger/OpenAPI spec
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Root router & public pages
│       ├── admin/              # Admin & Treasurer dashboard app
│       │   ├── AdminApp.jsx    # Admin routing & layout
│       │   ├── DashboardPage.jsx
│       │   └── ResourcePages.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── AuthPage.jsx
│       │   ├── EventsPage.jsx
│       │   ├── EventDetailsPage.jsx
│       │   ├── StorePage.jsx
│       │   ├── ProductDetailsPage.jsx
│       │   ├── AboutPage.jsx
│       │   └── member/         # Authenticated member views
│       │       ├── MemberDashboardPage.jsx
│       │       ├── MemberMembershipPage.jsx
│       │       ├── MemberEventsPage.jsx
│       │       ├── MemberTicketsPage.jsx
│       │       ├── MemberStorePage.jsx
│       │       ├── MemberOrdersPage.jsx
│       │       ├── MemberCheckoutPage.jsx
│       │       ├── MemberAnnouncementsPage.jsx
│       │       ├── MemberNotificationsPage.jsx
│       │       ├── MemberVolunteerPage.jsx
│       │       ├── MemberExpensesPage.jsx
│       │       └── MemberProfilePage.jsx
│       ├── components/         # Shared UI components
│       ├── context/            # Auth session & current user context
│       ├── services/           # API client (fetch wrappers)
│       ├── styles/             # Global styles
│       └── assets/             # Static icons & artwork
│
├── docs/                       # Project design documentation
│   ├── PLAN.md                 # Problem statement & full project plan
│   ├── ARCHITECTURE.MD         # System architecture decisions
│   ├── DATABASE-SCHEMA.MD      # Entity relationship details
│   ├── API-DESIGN.MD           # REST API contract
│   ├── MODULES.MD              # Feature module breakdown
│   ├── USER-ROLES.MD           # Role & permission matrix
│   ├── DESIGN.MD               # UI/UX design system
│   └── SETTINGS.MD             # Organization settings reference
│
└── workflow/                   # Step-by-step implementation workflows
    ├── workflow1.md … workflow8.md
    └── PLANS.md
```

---

## User Roles

| Role | Description |
|---|---|
| **Visitor** | Unauthenticated. Can browse public events, products, and organization info. |
| **Member** | Authenticated student. Manages own membership, buys tickets & merchandise, views announcements and notifications. |
| **Volunteer** | Member with `is_volunteer = true`. Can additionally view/update assigned tasks and submit expense claims. |
| **Admin** | Full operational control: members, events, inventory, announcements, tasks, settings, and role management. |
| **Treasurer** | Finance authority: ledger, expense approvals, reimbursements, and financial dashboard. Cannot manage events or settings. |

> A single user account holds one primary role. Volunteer is a capability flag (`is_volunteer`) on a `MEMBER`, not a separate role.

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **PostgreSQL** installed locally and a database created via **pgAdmin**

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy the example environment file and fill in your values
copy .env.example .env

# 4. Run Prisma migrations to create the database schema
npx prisma migrate dev

# 5. (Optional) Seed the database with development data
npm run prisma:seed

# 6. Start the development server
npm run dev
# API available at http://localhost:4000
```

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev
# App available at http://localhost:5173
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory. Reference `.env.example` for the full list:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Local PostgreSQL connection string used by Prisma (e.g., `postgresql://user:password@localhost:5432/CampusHub`) |
| `JWT_SECRET` | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | JWT expiry duration (e.g., `7d`) |
| `PORT` | Express server port (default: `4000`) |
| `CLIENT_ORIGIN` | Frontend origin for CORS (e.g., `http://localhost:5173`) |
| `SEED_PASSWORD` | Password used by the seed script for test accounts |

> **Security**: Never commit your `.env` file. The `JWT_SECRET` must remain exclusively on the server.

---

## Database

The database schema is managed by **Prisma**. Key entities:

| Entity | Description |
|---|---|
| `User` | Core user record with role (`MEMBER`, `ADMIN`, `TREASURER`) and `is_volunteer` flag |
| `MembershipPlan` | Configurable plan: fee, duration, discounts, reminder window |
| `Membership` | One active period per user, linked to a payment |
| `Event` | Dated activity with capacity, dual pricing, and status |
| `Ticket` | User ↔ Event link with QR token and status (`PENDING → PAID → USED`) |
| `Product` / `ProductVariant` | Merchandise with size variants, stock, and low-stock thresholds |
| `Order` / `OrderItem` | Merchandise purchase lifecycle |
| `Announcement` | Scoped broadcast with audience (`PUBLIC` / `MEMBERS`) |
| `Initiative` / `Task` | Volunteer work units |
| `Expense` | Volunteer reimbursement claim with receipt |
| `Transaction` | Double-entry ledger row for all income and expenses |
| `Payment` | Payment record linking to memberships, tickets, or orders |
| `Notification` | In-app notification row per user |

### Useful Prisma Commands

```bash
npm run prisma:generate   # Regenerate Prisma Client after schema changes
npm run prisma:migrate    # Apply pending migrations (dev)
npm run prisma:studio     # Open Prisma Studio GUI
npm run prisma:seed       # Seed the database
```

---

## API Overview

The REST API is served at `/api/v1`. Interactive documentation is available via Swagger UI at:

```
http://localhost:4000/api/docs
```

### Main Route Groups

| Prefix | Module |
|---|---|
| `/api/v1/auth` | Registration, login, current user, password change |
| `/api/v1/users` | Member directory, profile management, role assignment |
| `/api/v1/memberships` | Plans, membership status, dues payment |
| `/api/v1/events` | Event CRUD, publishing, capacity |
| `/api/v1/tickets` | Purchase, QR lookup, check-in, attendance |
| `/api/v1/announcements` | Create, publish, archive |
| `/api/v1/products` | Catalogue, variants, stock management |
| `/api/v1/orders` | Checkout, order history, fulfillment |
| `/api/v1/initiatives` | Volunteer initiative and task management |
| `/api/v1/expenses` | Submit, approve, reimburse expense claims |
| `/api/v1/finance` | Ledger entries, treasurer dashboard |
| `/api/v1/payments` | Payment order creation and verification |
| `/api/v1/notifications` | Notification list and read status |
| `/api/v1/dashboard` | Aggregated KPI endpoints per role |
| `/api/v1/settings` | Organization profile, plans, defaults |
| `/api/v1/uploads` | File upload endpoints for avatars, products, logos, receipts |
| `/api/v1/search` | Cross-resource search |

---

## Payment Flow

CampusHub uses a **simulated payment flow** backed by the local database — no external payment gateway is required.

1. Client calls `POST /api/v1/payments/orders` with `purpose` (`MEMBERSHIP` | `TICKET` | `ORDER`)
2. Server resolves pricing (applying membership discounts where applicable) and creates a capacity/stock hold with a `PENDING` payment record
3. Client confirms the payment intent via the checkout UI
4. Client calls `POST /api/v1/payments/verify` to complete the flow
5. Server runs a Prisma transaction to: mark the payment `PAID`, activate the membership / confirm the ticket / fulfill the order, and write a ledger income row

> Pending holds older than 15 minutes are automatically released by the background scheduler.

---

## File Storage

File uploads are handled by **Multer** on the Express server and stored on the local filesystem. Upload paths are stored in the database.

| Upload Type | Contents | Who Uploads |
|---|---|---|
| `avatars` | User profile images | Authenticated user via API |
| `products` | Product images | Admin via API |
| `organization` | Organization logo | Admin via API |
| `receipts` | Expense receipt files | Volunteer via API |

The Express API handles all file I/O. The React app sends files to the API endpoint and receives back a stored path — no cloud credentials needed.

---

## Documentation

All design and architecture documents live in the [`docs/`](./docs/) directory:

| File | Description |
|---|---|
| [`PLAN.md`](./docs/PLAN.md) | Full project plan and problem statement |
| [`ARCHITECTURE.MD`](./docs/ARCHITECTURE.MD) | System architecture and data flow |
| [`DATABASE-SCHEMA.MD`](./docs/DATABASE-SCHEMA.MD) | Detailed entity-relationship schema |
| [`API-DESIGN.MD`](./docs/API-DESIGN.MD) | REST API contract and response shapes |
| [`MODULES.MD`](./docs/MODULES.MD) | Feature module breakdown |
| [`USER-ROLES.MD`](./docs/USER-ROLES.MD) | Role definitions and permission matrix |
| [`DESIGN.MD`](./docs/DESIGN.MD) | UI/UX design system and tokens |
| [`SETTINGS.MD`](./docs/SETTINGS.MD) | Organization settings reference |

Implementation workflows are documented in the [`workflow/`](./workflow/) directory.

---

<div align="center">

**CampusHub** — Built with ❤️ for student organizations

</div>
