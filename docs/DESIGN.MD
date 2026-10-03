# Document 4 — UI/UX & Product Design

## 1. Design Philosophy

CampusHub should feel like a modern SaaS dashboard rather than an academic administration portal.

The interface should be:

```text
Clean
Simple
Professional
Fast to navigate
Mobile responsive
Consistent
Data-focused
```

The system should reduce the number of actions needed for common tasks.

## 2. Color Theme

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

## 3. Typography

Recommended hierarchy:

```text
Page Heading       28–32px
Section Heading    20–24px
Card Heading       16–18px
Body               14–16px
Supporting Text    12–14px
```

## 4. Layout

Desktop:

```text
┌──────────────────────────────────────────────────────┐
│ Logo                    Search     Bell   Profile   │
├─────────────┬────────────────────────────────────────┤
│             │                                        │
│ Sidebar     │             Main Content               │
│             │                                        │
│ Dashboard   │  Page heading                          │
│ Members     │  KPI cards                             │
│ Events      │  Tables / Cards / Charts               │
│ Tickets     │                                        │
│ Store       │                                        │
│ Finance     │                                        │
│ Settings    │                                        │
└─────────────┴────────────────────────────────────────┘
```

The sidebar remains consistent while the content area changes according to the selected module.

## 5. Component System

Reusable components should include:

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
```

## 6. Dashboard Cards

All dashboards should use consistent KPI cards.

Example:

```text
┌────────────────────────┐
│ Active Members         │
│ 1,102                  │
│ ↑ 8.2% this semester   │
└────────────────────────┘
```

## 7. Tables

Admin-heavy pages should use tables.

Example:

```text
Member | Membership | Status | Expiry | Action
```

Tables should support:

```text
Search
Filtering
Sorting
Pagination
Row actions
Bulk selection
```

## 8. Forms

Every form should follow the same visual structure:

```text
Section
   ↓
Input Fields
   ↓
Validation
   ↓
Primary Action
   ↓
Cancel / Secondary Action
```

Validation should happen both on the frontend and backend.

## 9. Loading and Error States

Every API-driven screen should support:

```text
Loading
Success
Empty
Error
Retry
```

For example, an empty order page should not just be blank.

```text
No Orders Yet

Your merchandise orders will appear here.

[Browse Merchandise]
```

## 10. Mobile Design

The member-facing portion should be fully responsive because students may use their phones for tickets, merchandise, announcements, and membership actions.

The desktop admin application can use a sidebar while mobile can switch to:

```text
Bottom Navigation
or
Collapsible Sidebar
```

## 11. Key Demo Screens

For the hackathon presentation, the most important screens should be:

```text
1. Public Home
2. Member Dashboard
3. Event Details
4. Ticket / QR
5. Admin Dashboard
6. Event Management
7. QR Check-in
8. Merchandise Store
9. Inventory Dashboard
10. Volunteer Task Board
11. Finance Dashboard
```

These visually demonstrate the complete organization lifecycle.

---