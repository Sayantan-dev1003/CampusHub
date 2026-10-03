# Document 2 — Architecture Design

## 1. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      Public User     │
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │   React Frontend     │
                         │  JavaScript/Tailwind  │
                         └──────────┬───────────┘
                                    │
                              HTTPS / REST
                                    │
                         ┌──────────▼───────────┐
                         │   Node.js + Express   │
                         │      API Server       │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
      ┌───────▼───────┐     ┌──────▼──────┐      ┌──────▼───────┐
      │ Authentication │     │  Business   │      │   Validation  │
      │ & RBAC         │     │   Services  │      │ & Middleware  │
      └────────────────┘     └──────┬──────┘      └───────────────┘
                                    │
                             ┌──────▼──────┐
                             │   Prisma    │
                             │     ORM     │
                             └──────┬──────┘
                                    │
                             ┌──────▼──────┐
                             │ PostgreSQL  │
                             └──────┬──────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
      ┌───────▼──────┐      ┌───────▼──────┐      ┌───────▼──────┐
      │ File Storage │      │   Payment    │      │ Notification │
      │ Supabase     │      │   Razorpay   │      │   Service    │
      │ / Cloudinary │      │              │      │              │
      └──────────────┘      └──────────────┘      └──────────────┘
```

## 2. Frontend Layer

The React application is responsible for rendering pages, forms, dashboards, tables, cards, charts, ticket QR codes, product catalogues, and responsive navigation.

Recommended frontend structure:

```text
src/
├── components/
├── layouts/
├── pages/
├── routes/
├── hooks/
├── services/
├── context/
├── utils/
└── assets/
```

The frontend should communicate only with the API layer rather than accessing the database directly.

## 3. Backend Layer

Express should be organized by domain/module rather than by one huge controller.

```text
server/
├── controllers/
├── routes/
├── services/
├── middleware/
├── validators/
├── utils/
├── config/
└── prisma/
```

Recommended backend modules:

```text
auth
members
memberships
events
tickets
announcements
products
inventory
orders
volunteers
finance
notifications
dashboard
settings
```

## 4. Middleware

Important middleware:

```text
Authentication Middleware
Authorization Middleware
Request Validation
Error Handler
Rate Limiting
Logging
```

RBAC should ensure that a normal member cannot access administrative APIs.

## 5. Business Logic Example

Ticket purchase:

```text
React
  ↓
POST /events/:id/tickets
  ↓
Auth Middleware
  ↓
Ticket Controller
  ↓
Check Event
  ↓
Check Membership
  ↓
Calculate Price
  ↓
Check Capacity
  ↓
Create Ticket
  ↓
Create Payment/Transaction
  ↓
Return Ticket
```

## 6. Financial Architecture Principle

Financial information should be generated from actual business actions.

```text
Membership Payment ──────┐
Ticket Payment ──────────┤
Merchandise Payment ─────┼──> Transaction Ledger
Fundraiser Income ───────┘
                               │
Expenses ──────────────────────┤
Reimbursements ────────────────┘
                               ↓
                         Finance Dashboard
```

This prevents the Treasurer from maintaining a separate manual copy of financial activity.

---