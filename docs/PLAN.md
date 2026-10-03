# Student Organization System

## 1. Problem Statement

Student organizations manage a large number of activities during an academic year, including member registration, membership dues, events, ticket sales, merchandise, announcements, volunteer work, and financial transactions. In the current scenario described for the Skyline Student Association, these operations are handled using disconnected tools: member sign-ups are stored in spreadsheets, event tickets may be sold manually for cash, the club budget is maintained in a notebook, announcements are repeatedly sent through WhatsApp, and volunteer expenses are reimbursed only after collecting and verifying receipts. This fragmentation causes operational inefficiency, makes information difficult to track, and creates uncertainty around memberships, event participation, and the organization’s financial position.

The proposed Student Organization System is a unified digital platform that acts as the organization’s central operating system. It should allow students to join the organization, maintain their membership information, pay dues, register for events, purchase tickets and merchandise, receive announcements, participate in volunteer activities, and interact with the organization through a single interface. At the same time, organization administrators should be able to manage members, events, inventory, announcements, tasks, expenses, reimbursements, and financial records without relying on multiple disconnected tools.

The platform should therefore create a single source of truth for the organization. Whenever a member makes a payment, purchases a ticket, buys merchandise, attends an event, submits an expense, or renews a membership, the relevant information should be recorded in the appropriate module and become available to authorized administrators. At the end of the semester, the treasurer should be able to see money collected from membership dues, tickets, merchandise, and fundraising activities, as well as expenses and reimbursements, without manually combining information from notebooks and receipts.

## 2. Main Users and Roles

The system primarily revolves around three types of users: students or members, organization administrators, and the treasurer or finance administrator. A student interacts with the system mainly for membership, events, tickets, merchandise, announcements, and volunteer activities. An organization administrator manages operational activities such as members, events, announcements, merchandise, and volunteer tasks. The treasurer focuses on financial records, income, expenses, reimbursements, and overall financial visibility. The source material does not prescribe a specific permission model, so the exact role structure can be implemented according to the team’s design.

## 3. Core Modules

### Membership Management Module

The Membership Management module is responsible for maintaining the organization’s member directory. When a student joins, the system should capture their basic information, membership status, payment or dues information, membership start date, and membership expiry date. The organization should also be able to define what benefits a membership provides, such as discounts on tickets and merchandise. Memberships expire at the end of the year, so the system should support renewal reminders before expiration and allow staff to quickly verify whether someone is an active member when they arrive at an event.

### Event Management Module

The Event Management module handles the creation and lifecycle of organization events. Administrators should be able to create an event, define its date and time, specify the available capacity, publish ticket information, and monitor registrations or sales. For a major event such as the spring gala, the system should support separate member and non-member ticket prices and maintain the remaining seat count. This allows the organization to sell tickets online and prevents the need for manually maintaining printed lists.

### Ticketing and Attendance Module

The Ticketing module connects ticket purchases with event participation. Once a student purchases a ticket, the system should create a digital ticket associated with that member or buyer and the selected event. At the event entrance, an authorized volunteer or administrator should be able to validate the ticket quickly and mark the attendee as checked in. After the event, the organization should be able to determine how many tickets were sold, how many people actually attended, and how much revenue the event generated.

### Announcement Module

The Announcement module replaces the current process of repeatedly writing the same message across multiple WhatsApp groups. Administrators should be able to create an announcement containing information such as meetings, deadlines, schedule changes, or other organization updates. The announcement should be published centrally and made available to members through the website or application, while the system maintains a historical record of what was announced and when it was published.

### Merchandise and Inventory Module

The Merchandise module manages the organization’s branded products such as hoodies and T-shirts. Each merchandise item can have attributes such as product name, category, size, price, and available quantity. Students should be able to browse products, select the required size and quantity, and place an order through their phones. The inventory system must decrease stock when an order is confirmed and ensure that administrators can see how many units of each size remain. This eliminates the manual process of recording every order and chasing members for payment afterward.

### Volunteer and Task Management Module

The Volunteer Management module supports activities such as fundraising campaigns. Administrators should be able to create an initiative, define the tasks required, assign tasks to volunteers, and track the progress of each task. For example, a bake sale can contain tasks such as baking, purchasing supplies, and managing the event table. The objective is to provide a single view showing what still needs to be done, who is responsible, and whether the activity is progressing as planned.

### Finance and Expense Management Module

The Finance module acts as the organization’s financial ledger. It should record income generated from membership dues, event tickets, merchandise sales, and fundraising activities. It should also record expenses and volunteer reimbursements. When a volunteer submits an expense, the system should maintain the expense information and associated receipt information so that the treasurer can review it. At the end of the semester, the treasurer should be able to see the total money received, total money spent, outstanding reimbursements, and remaining balance in one place.

## 4. Important Objects / Entities

The central object in the system is the **Member**. A Member represents a student associated with the organization and can contain information such as member ID, name, contact information, membership status, membership start date, expiry date, and payment status. A member can participate in many activities across the system, making this object highly connected to other modules.

The **Membership** object represents the actual membership relationship between a student and the organization. It contains information such as membership type, validity period, dues amount, payment status, and benefits. One Member can have membership records over different periods, while each Membership belongs to a specific Member.

The **Event** object represents an organization event such as the spring gala or a club meeting. It contains event information such as title, description, date, time, venue, capacity, and status. An Event can have multiple tickets and attendees associated with it.

The **Ticket** object represents a participant’s right to attend a particular event. It connects a Member or purchaser to an Event and stores information such as ticket type, price, purchase status, and attendance or check-in status. A ticket may therefore connect the Event, Member, and Payment concepts.

The **Announcement** object represents an official message published by the organization. It contains information such as title, message content, publication date, author, and potentially the target audience. Announcements are associated with an administrator who created them and can be made available to organization members.

The **Product** object represents a merchandise item such as a hoodie or T-shirt. Product information can include name, description, category, price, size, and available quantity. The Product is connected to inventory and orders.

The **Order** object represents a member’s merchandise purchase. It can store the buyer, order date, order status, total amount, payment status, and selected products. Because one order may contain multiple products or quantities, the implementation can use an intermediate Order Item object.

The **Volunteer Task** object represents a specific piece of work inside an initiative such as a fundraiser. It can contain task name, description, assigned volunteer, due date, and completion status. Multiple tasks can belong to a single fundraising or organizational activity.

The **Expense** object represents money spent by the organization. It can contain the expense amount, category, date, description, person who incurred the expense, and reimbursement status. A receipt can be associated with the expense so that the treasurer can review the supporting information.

The **Payment / Transaction** object is the financial event representing money entering or leaving the organization. It can be linked to membership dues, event tickets, merchandise orders, fundraising income, or expenses. This object allows multiple modules to contribute to the financial dashboard without maintaining separate financial records.

## 5. Relationships Between Objects

The Member object acts as one of the major connections in the platform. A Member can have one or more Membership records, purchase multiple Tickets for Events, place multiple merchandise Orders, receive Announcements, and be assigned Volunteer Tasks. A Membership belongs to a Member, while an Event can be associated with many Tickets. Each Ticket connects a particular purchaser or Member with one Event.

The Event object is connected to the Ticketing and Finance modules. When an Event is created, tickets can be configured with different prices for members and non-members. When a Ticket is purchased, the system creates a financial transaction. When the ticket is scanned or checked in, the attendance status of that ticket changes. This means the same event can provide operational information such as attendance while simultaneously contributing financial information to the finance module.

The Product object is connected to Order and Inventory. A member selects one or more Products while placing an Order, and the Order records the corresponding payment. Once the transaction is confirmed, inventory quantities should be updated. This creates a chain between the Merchandise, Payment, and Inventory parts of the system.

The Volunteer Task object connects members with organization activities. An administrator can create a fundraiser and divide it into multiple tasks, then assign those tasks to specific volunteers. Completion of those tasks provides the organization with visibility into the current state of the activity.

The Expense object connects volunteers or other authorized users to the Finance module. A volunteer incurs an expense, submits its details and receipt, and the treasurer reviews and processes the reimbursement. After approval and payment, the resulting transaction becomes part of the organization’s financial history.

## 6. End-to-End Workflows

### Workflow 1: Student Joins the Organization

A student accesses the platform and submits their membership information. The administrator reviews or confirms the registration, after which the system creates the Member and Membership records. The student pays the applicable dues, and the payment is recorded as a financial transaction. The membership becomes active for its validity period, and the student can now access member benefits. Before expiration, the system should identify the approaching expiry and send a renewal reminder. This workflow directly addresses the existing spreadsheet-based membership process.

### Workflow 2: Student Purchases an Event Ticket

An administrator creates an event and configures ticket availability. A student selects the event and the appropriate ticket type. If member and non-member pricing differ, the system determines the applicable price based on membership status. Once payment succeeds, a Ticket is created and the remaining capacity is updated. The corresponding transaction is also recorded in the Finance module. This makes ticket sales, event capacity, and financial records connected rather than separate.

### Workflow 3: Student Attends the Event

When the student reaches the event venue, an authorized organizer checks the digital ticket. The system validates that the ticket exists, belongs to the event, and has not already been used. The ticket is then marked as checked in. After the event, administrators can compare tickets sold with actual attendance and review the revenue generated by that event.

### Workflow 4: Organization Publishes an Announcement

An administrator creates an announcement containing information about a meeting, deadline, or change in plan. The announcement is published through the platform and becomes available to members. The system stores the announcement and its publication timestamp, creating a permanent record instead of relying on messages disappearing inside multiple chat groups.

### Workflow 5: Member Purchases Merchandise

A student browses the available merchandise, selects a product and size, and places an order. The system checks available stock before confirming the purchase. After successful payment, the order is created and inventory is reduced accordingly. Administrators can view all active orders and remaining stock by product and size.

### Workflow 6: Fundraiser Task Assignment

An administrator creates a fundraising activity and defines the tasks needed to execute it. Each task is assigned to a volunteer. Volunteers can see their assigned tasks and update their progress. Administrators can monitor outstanding work from a central dashboard and identify whether the fundraiser is on track.

### Workflow 7: Volunteer Expense and Reimbursement

A volunteer spends money while performing an organization activity and submits an expense claim containing the amount, description, and supporting receipt. The treasurer reviews the claim and records its status. Once reimbursed, the transaction is reflected as an organizational expense. This ensures the final financial report contains both income and money paid out through reimbursements.

### Workflow 8: Semester-End Financial Review

At the end of the semester, the treasurer opens the Finance dashboard. Instead of manually checking a notebook and a collection of receipts, they can see the organization’s recorded income and expenditure in one place. Membership dues, event ticket revenue, merchandise revenue, fundraising income, and volunteer reimbursements can all be analyzed as part of the organization’s financial history. This directly addresses the requirement for a centralized view of what came in, what went out, and how much remains.

## 7. Module-to-Module Interaction

The system should be designed so that modules do not operate independently. **Membership Management** interacts with **Event Management** because membership status determines eligibility or pricing for certain event tickets. Membership also interacts with **Merchandise** because members may receive merchandise discounts.

**Event Management** interacts with **Ticketing**, **Membership**, **Attendance**, and **Finance**. The event determines available capacity, membership determines ticket pricing, ticket validation determines attendance, and every successful ticket sale contributes to financial records.

**Merchandise** interacts with **Orders**, **Inventory**, **Membership**, and **Finance**. A member purchases a product, the order records the transaction, the inventory is updated, any applicable member benefit is applied, and the revenue is reflected in the financial records.

**Volunteer Management** interacts with **Members**, **Fundraisers**, and **Finance**. Members can become volunteers, volunteers receive tasks associated with an initiative, and expenses generated while performing those tasks can flow into the reimbursement and finance process.

**Announcements** provide the communication layer across the entire organization. Membership information determines who belongs to the organization, while the announcement module provides a central channel for communicating meetings, deadlines, and changes to those members.

## 8. Overall System Flow

At a high level, the system can be visualized as a central **Student Organization Platform** connected to six major operational areas: **Membership, Events & Ticketing, Merchandise & Inventory, Announcements, Volunteer Management, and Finance**. The Member sits at the center of many interactions. A student becomes a member, uses that membership to obtain benefits, purchases tickets and merchandise, attends events, receives announcements, and may participate as a volunteer. Every monetary activity generated by these modules feeds into the Finance system. Administrators manage the organization through dashboards, while the treasurer gets a consolidated financial view.

The most important architectural principle for the hackathon should be that every important action creates or updates a corresponding system record. A membership purchase creates membership and payment data; a ticket purchase creates ticket and financial data; an event check-in updates attendance; a merchandise order updates order and inventory data; a volunteer expense updates reimbursement and financial data. This interconnected structure transforms the platform from a collection of pages into a coherent organization-management system.

## 9. Hackathon MVP

For a practical hackathon implementation, the minimum viable product should focus on the most demonstrable flows: member registration and membership status, event creation and ticket booking, ticket validation/check-in, merchandise ordering with inventory tracking, announcement publishing, volunteer task assignment, and a finance dashboard showing income and expenses. These flows cover the core scenarios described in the challenge while keeping the implementation manageable within a hackathon timeframe. The deeper features such as advanced notifications, detailed reporting, and sophisticated reimbursement workflows can be treated as extensions.


# Final CampusHub System Map

The complete product can be understood as:

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
                    DASHBOARDS & REPORTS
                             │
              ┌──────────────┼──────────────┐
              │              │              │
            MEMBER          ADMIN        TREASURER
              │              │              │
              └──────────────┼──────────────┘
                             │
                      NOTIFICATIONS
                             │
                         SETTINGS
```

## Core End-to-End Business Flow

```text
Student Registers
       ↓
Membership Activated
       ↓
Student Pays Dues
       ↓
Finance Transaction Created
       ↓
Student Views Events
       ↓
Buys Event Ticket
       ↓
Payment Recorded
       ↓
Digital QR Ticket Generated
       ↓
Student Arrives at Event
       ↓
QR Checked
       ↓
Attendance Recorded
       ↓
Student Buys Merchandise
       ↓
Order Created
       ↓
Inventory Reduced
       ↓
Revenue Recorded
       ↓
Student Joins Fundraiser
       ↓
Task Assigned
       ↓
Volunteer Completes Task
       ↓
Expense Submitted
       ↓
Treasurer Reviews
       ↓
Reimbursement Recorded
       ↓
Finance Dashboard Updated
```

This flow captures the central idea of the challenge: **one platform should connect the organization's members, events, merchandise, volunteer activities, communication, and money instead of leaving each activity in a separate spreadsheet, notebook, chat, or manual process.**