Workflow 8: Semester-End Financial Review
Step 1 — Treasurer Logs In & Opens Finance Dashboard (Frontend)

Treasurer platform pe login karta hai. Uski role "treasurer" ya "admin" hai — sirf ye log Finance section access kar sakte hain. Normal members ya volunteers ko ye section visible nahi hota.

Dashboard pe jaate hi directly ek high-level summary dikhti hai — koi extra navigation nahi karna padta.

Step 2 — Semester Filter / Date Range Selection (Frontend)

Treasurer sabse pehle time period select karta hai jiska review karna hai:

Preset Options → "This Semester", "Last Semester", "This Academic Year"
Custom Range → manual start date aur end date pick karo

Ye filter select karte hi saara data us period ke liye filter ho jaata hai — page reload nahi hota, sirf data update hota hai.

Step 3 — Summary Cards (Finance Dashboard — Frontend)

Dashboard ke top pe 4 summary cards dikhte hain — ek nazar mein pura financial health clear:

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Total Income   │  │ Total Expenses  │  │  Net Balance    │  │ Pending Claims  │
│    ₹24,500      │  │    ₹6,200       │  │   ₹18,300       │  │   2 (₹1,400)    │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
Total Income → selected period mein sab sources se aaya paisa
Total Expenses → sab reimbursements aur expenses
Net Balance → Income − Expenses
Pending Claims → abhi bhi kitne reimbursement claims review ke liye bache hain

Ye numbers backend pe transactions collection se aggregate hoke aate hain — koi manual calculation nahi.

Step 4 — Income Breakdown by Category (Finance Dashboard)

Summary cards ke neeche, income ek category-wise breakdown mein dikhti hai:

Category	Transactions	Total Amount
Membership Dues	45	₹9,000
Event Ticket Sales	120	₹8,400
Merchandise Sales	38	₹5,700
Fundraiser Collections	3	₹1,400
Total Income	206	₹24,500

Treasurer exactly dekh sakta hai ki paisa kahan se aaya — kis source ne sabse zyada contribute kiya.

Step 5 — Expense Breakdown by Category (Finance Dashboard)

Usi tarah expenses bhi category-wise dikhte hain:

Category	Transactions	Total Amount
Volunteer Reimbursements	12	₹5,200
Supplies & Materials	4	₹800
Printing & Misc	2	₹200
Total Expenses	18	₹6,200

Treasurer dekh sakta hai ki kahan zyada kharch hua aur kahan control karna chahiye tha.

Step 6 — Event-wise Financial Breakdown (Finance Dashboard)

Ek dedicated section hota hai jahan har event ka apna financial summary hota hai:

Event	Tickets Sold	Revenue	Expenses	Net
Spring Gala	98	₹5,800	₹1,200	₹4,600
Tech Talk	45	₹1,350	₹400	₹950
Cultural Night	77	₹1,250	₹600	₹650

Treasurer exactly dekh sakta hai ki kaun sa event profitable raha aur kaun sa loss mein gaya — ye comparison next semester planning ke liye useful hai.

Step 7 — Fundraiser-wise Financial Breakdown (Finance Dashboard)

Har fundraiser ka bhi alag breakdown hota hai:

Fundraiser	Target	Collected	Tasks Completed	Status
Bake Sale	₹5,000	₹4,200	8/8	Completed
Book Drive	₹2,000	₹1,800	5/6	Completed

Target vs actual comparison clearly dikhta hai — next fundraiser ke liye realistic targets set karne mein help karta hai.

Step 8 — Full Transaction Ledger (Finance Dashboard)

Ek dedicated "All Transactions" tab hota hai jahan har single transaction line by line dikhti hai — bilkul notebook ki tarah lekin searchable aur filterable:

Date	Description	Category	Type	Amount
02 Aug	Rahul Sharma — Membership	Membership Dues	Income	+₹200
10 Aug	Spring Gala — Ticket #1042	Ticket Sales	Income	+₹100
12 Aug	Priya — Baking Supplies	Reimbursement	Expense	−₹850
15 Aug	Hoodie Order #23	Merchandise	Income	+₹499

Filter options hote hain:

By Type → Income only / Expense only / Both
By Category → Membership / Tickets / Merch / Fundraiser / Reimbursement
By Date Range → custom period
By Person → specific member ya volunteer ke transactions

Treasurer kisi bhi specific transaction pe click kare → uska complete detail view khulta hai with original receipt (agar reimbursement tha).

Step 9 — Pending Items Alert (Finance Dashboard)

Dashboard pe ek separate "Pending Items" section hota hai jo treasurer ko remind karta hai ki semester close karne se pehle kya resolve karna hai:

Pending expense claims → "2 claims awaiting your review — ₹1,400 total"
Unpaid memberships → "3 members have active membership but payment not confirmed"
Unreconciled transactions → koi payment mark as paid nahi hua

Ye section tab tak visible rehta hai jab tak sab resolve na ho jaaye — treasurer ko manually check nahi karna padta ki kuch reh gaya.

Step 10 — Month-wise Trend View (Finance Dashboard)

Ek chart/graph section hota hai jo treasurer ko visual trend dikhata hai:

X-axis → months (Aug, Sep, Oct, Nov, Dec)
Y-axis → amount in ₹
Two lines/bars → Income vs Expenses month by month

Treasurer dekh sakta hai:

Konse month mein sabse zyada income aayi (event months)
Konse month mein expenses spike kiye (fundraiser months)
Overall trajectory kaisi rahi

Ye data visualization transactions collection se directly aggregate hota hai.

Step 11 — Report Generation (Treasurer Panel)

Treasurer semester review complete karne ke baad ek formal report generate kar sakta hai:

"Generate Semester Report" button click karta hai
System automatically ek structured report compile karta hai jisme hota hai:
Summary (total income, total expenses, net balance)
Category-wise income breakdown
Category-wise expense breakdown
Event-wise profitability
Fundraiser performance
All transactions list

Report PDF ya CSV format mein download ho sakti hai — leadership team ko share karne ke liye ya records ke liye save karne ke liye.

Step 12 — Closing Balance Handover (Treasurer Action)

Semester end pe treasurer ek "Close Semester" action perform karta hai:

Current net balance record ho jaata hai as closingBalance for this semester
Ye amount automatically next semester ka openingBalance ban jaata hai
Ek final ClosingEntry record create hota hai:
semester → e.g. "Odd Semester 2026"
totalIncome, totalExpenses, netBalance
closedBy → treasurer userId
closedAt → timestamp

Ye next treasurer ke liye ek clean handover record ban jaata hai — koi confusion nahi ki pichle semester mein kitna bacha tha.

Summary of What This Workflow Does
Koi naya record create nahi hota —
ye workflow sirf existing Transaction records ko 
aggregate, filter, aur visualize karta hai.

Sirf ek naya record:
ClosingEntry → { semester, totalIncome, totalExpenses, 
                 netBalance, closedBy, closedAt }
Complete Data Flow
Workflow 1 (Memberships)     → Transaction: income/membership_dues
Workflow 2 (Tickets)         → Transaction: income/ticket_sales  
Workflow 5 (Merchandise)     → Transaction: income/merchandise_sales
Workflow 6 (Fundraiser)      → Transaction: income/fundraiser
Workflow 7 (Reimbursements)  → Transaction: expense/reimbursement
                                         ↓
                              Finance Dashboard aggregates all
                                         ↓
                              Semester Report + Closing Entry