# CampusHub — Student Organization Management System

## Technology Baseline

The proposed implementation uses **React + JavaScript** for the frontend, **Node.js + Express.js** for the backend, **PostgreSQL** for the relational database, **Prisma ORM** for database access, **JWT-based authentication**, **Supabase Storage or Cloudinary** for file/image storage, and **Razorpay** for payments. This stack is proposed for the hackathon implementation; the challenge document itself does not prescribe a technology stack.

---

# Document 1 — API Design

## 1. API Architecture

CampusHub should expose a REST API between the React frontend and Express backend.

```text
React Frontend
      │
      │ HTTPS / JSON
      ▼
Express.js API
      │
      ├── Authentication
      ├── Authorization
      ├── Validation
      ├── Business Logic
      └── Error Handling
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

The API should use a versioned base URL:

```text
/api/v1
```

Example:

```text
GET /api/v1/events
POST /api/v1/events
GET /api/v1/members/:memberId
```

## 2. Authentication APIs

### Register

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Sayantan Halder",
  "email": "student@example.com",
  "password": "********",
  "studentId": "IITRAM123"
}
```

Response:

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "usr_123",
    "name": "Sayantan Halder",
    "role": "MEMBER"
  }
}
```

### Login

```http
POST /api/v1/auth/login
```

Response:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "usr_123",
    "role": "MEMBER"
  }
}
```

### Current User

```http
GET /api/v1/auth/me
```

Returns the logged-in user's profile and role.

### Logout

```http
POST /api/v1/auth/logout
```

The frontend clears the active session/token.

---

## 3. Member APIs

### Get Members

```http
GET /api/v1/members
```

Supported filters:

```text
?status=ACTIVE
?membership=EXPIRED
?search=sayantan
?page=1&limit=20
```

### Get Member

```http
GET /api/v1/members/:memberId
```

This should return the member profile and relevant summary information.

### Create Member

```http
POST /api/v1/members
```

### Update Member

```http
PATCH /api/v1/members/:memberId
```

### Delete / Deactivate Member

```http
PATCH /api/v1/members/:memberId/status
```

---

# 4. Membership APIs

### Get Membership

```http
GET /api/v1/members/:memberId/membership
```

### Create / Activate Membership

```http
POST /api/v1/memberships
```

### Renew Membership

```http
POST /api/v1/memberships/:membershipId/renew
```

### Membership Statistics

```http
GET /api/v1/memberships/stats
```

Response can contain:

```json
{
  "active": 1102,
  "expiringSoon": 84,
  "expired": 62,
  "unpaid": 31
}
```

Membership should support validity dates, payment status, benefits, and renewal reminders because these are explicit requirements in the challenge.

---

# 5. Event APIs

### Get Events

```http
GET /api/v1/events
```

Filters:

```text
?status=UPCOMING
?date=2026-10-12
?search=gala
```

### Create Event

```http
POST /api/v1/events
```

Request:

```json
{
  "title": "Spring Gala",
  "description": "Annual student organization event",
  "date": "2026-10-12",
  "startTime": "18:00",
  "venue": "Main Auditorium",
  "capacity": 500
}
```

### Update Event

```http
PATCH /api/v1/events/:eventId
```

### Delete / Cancel Event

```http
PATCH /api/v1/events/:eventId/status
```

### Event Details

```http
GET /api/v1/events/:eventId
```

### Event Dashboard

```http
GET /api/v1/events/:eventId/analytics
```

Recommended response:

```json
{
  "capacity": 500,
  "ticketsSold": 420,
  "checkedIn": 384,
  "revenue": 126000
}
```

These fields directly support the challenge requirement to track capacity, ticket sales, attendance, and event revenue.

---

# 6. Ticket APIs

### Purchase Ticket

```http
POST /api/v1/events/:eventId/tickets
```

Request:

```json
{
  "ticketType": "MEMBER",
  "quantity": 1
}
```

The backend should determine the applicable price based on membership status and configured event pricing.

### Get My Tickets

```http
GET /api/v1/tickets/my
```

### Get Ticket

```http
GET /api/v1/tickets/:ticketId
```

### Validate Ticket

```http
POST /api/v1/tickets/:ticketId/validate
```

### Check In

```http
POST /api/v1/tickets/:ticketId/check-in
```

The server should reject tickets that are invalid or already checked in.

---

# 7. Announcement APIs

### List Announcements

```http
GET /api/v1/announcements
```

### Create Announcement

```http
POST /api/v1/announcements
```

### Update Announcement

```http
PATCH /api/v1/announcements/:announcementId
```

### Delete Announcement

```http
DELETE /api/v1/announcements/:announcementId
```

### Publish Announcement

```http
POST /api/v1/announcements/:announcementId/publish
```

Announcements are intended to replace fragmented WhatsApp communication and preserve a record of what was communicated and when.

---

# 8. Merchandise APIs

### Get Products

```http
GET /api/v1/products
```

### Get Product

```http
GET /api/v1/products/:productId
```

### Create Product

```http
POST /api/v1/products
```

### Update Product

```http
PATCH /api/v1/products/:productId
```

### Update Inventory

```http
PATCH /api/v1/products/:productId/inventory
```

### Low Stock Products

```http
GET /api/v1/inventory/low-stock
```

The inventory system should support product sizes and quantities because the challenge explicitly mentions tracking merchandise sizes and remaining stock.

---

# 9. Order APIs

### Create Order

```http
POST /api/v1/orders
```

Request:

```json
{
  "items": [
    {
      "productId": "prd_001",
      "size": "L",
      "quantity": 2
    }
  ]
}
```

### My Orders

```http
GET /api/v1/orders/my
```

### Get Order

```http
GET /api/v1/orders/:orderId
```

### Admin Orders

```http
GET /api/v1/orders
```

### Update Order Status

```http
PATCH /api/v1/orders/:orderId/status
```

---

# 10. Volunteer / Task APIs

### Create Initiative

```http
POST /api/v1/initiatives
```

### Get Initiatives

```http
GET /api/v1/initiatives
```

### Create Task

```http
POST /api/v1/initiatives/:initiativeId/tasks
```

### Assign Task

```http
PATCH /api/v1/tasks/:taskId/assign
```

### Update Task

```http
PATCH /api/v1/tasks/:taskId
```

### My Tasks

```http
GET /api/v1/tasks/my
```

This supports the challenge scenario where a fundraiser is divided into assigned tasks and progress is tracked centrally.

---

# 11. Finance APIs

### Transactions

```http
GET /api/v1/finance/transactions
```

### Income

```http
GET /api/v1/finance/income
```

### Expenses

```http
GET /api/v1/finance/expenses
```

### Submit Expense

```http
POST /api/v1/finance/expenses
```

### Approve Expense

```http
POST /api/v1/finance/expenses/:expenseId/approve
```

### Reject Expense

```http
POST /api/v1/finance/expenses/:expenseId/reject
```

### Reimburse Expense

```http
POST /api/v1/finance/expenses/:expenseId/reimburse
```

### Financial Summary

```http
GET /api/v1/finance/summary
```

Example:

```json
{
  "income": 482500,
  "expenses": 194200,
  "balance": 288300,
  "pendingReimbursements": 18400
}
```

The Finance API should consolidate dues, ticket sales, merchandise revenue, and reimbursements into one view.

---

# 12. Dashboard APIs

### Member Dashboard

```http
GET /api/v1/dashboard/member
```

### Admin Dashboard

```http
GET /api/v1/dashboard/admin
```

### Treasurer Dashboard

```http
GET /api/v1/dashboard/finance
```

Each endpoint should return aggregated data so the frontend does not need to make many unrelated requests.

---

# 13. API Response Standard

All APIs should follow a consistent format.

Success:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Event capacity exceeded",
  "errorCode": "CAPACITY_EXCEEDED"
}
```

Common HTTP codes:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
500 Internal Server Error
```

---













