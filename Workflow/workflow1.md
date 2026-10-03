Workflow 1: Student Joins the Organization
Step 1 — Registration Form (Frontend) - DONE

Student ek form fill karta hai jisme ye fields hote hain: name, email, phone, student ID, branch, year. Submit karne pe data backend ko POST request ke through jaata hai.

Step 2 — User Account Creation (Backend) - DONE

Backend ek User record create karta hai database mein. Password hash karke store hoti hai.

Step 3 — Admin Review / Auto-Approval (Backend + Admin Panel) - DONE

Admin manually approve karta hai (admin dashboard se "Approve" button click karke). Approval ke baad Member record create hota hai.

Step 4 — Membership Record Creation (Database) - DONE

Membership document/row create hota hai jisme:

memberId → User ka reference
status → "pending_payment"
startDate, endDate → (endDate = startDate + 1 year)
membershipType → basic / premium etc.

Step 5 — Payment (Frontend + Payment Flow) - DONE

Student ko membership dues pay karne ka option milta hai. Simple case mein: user manually "mark as paid" kar sakta hai dashboard se. Payment ke baad ek Transaction record create hota hai.

Step 6 — Transaction Record (Database) - DONE

Transaction document create hota hai:

type → "income"
category → "membership_dues"
amount, date, paidBy (member reference)
status → "completed"

Ye record baad mein treasurer ke finance ledger mein dikhega.

Step 7 — Membership Activation (Backend) - DONE

Payment confirm hone ke baad, membership status update hoti hai — "pending_payment" se "active" ho jaati hai. Ab member ko platform ke member-only features access milte hain (event discounts, etc.)

Step 8 — Renewal Reminder (Scheduled Job / Cron) - DONE

Ek background job daily ya weekly run karta hai jo check karta hai: kisi bhi member ki membership 7 days ke andar expire hone wali hai? Jo log is range mein aate hain unhe ek reminder email/notification jaati hai. Ye cron job server pe set hoti hai. (Implemented via node-cron in backend/src/jobs/scheduler.js)

Step 9 — Member Verification at Events - DONE

Jab member kisi event pe aata hai, door pe jo banda hai wo member ka student ID ya email search karta hai. System turant dikhata hai: membership active hai ya nahi — koi printed list nahi chahiye.