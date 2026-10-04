Workflow 7: Volunteer Expense & Reimbursement
Step 1 — Volunteer Submits Expense Claim (Frontend)

Volunteer platform pe "Expenses" ya "Reimbursements" section mein jaata hai aur ek claim submit karta hai. Form mein ye hota hai:

Title → e.g. "Baking Supplies for Bake Sale"
Amount → e.g. ₹850
Description → kya kharida, kyun kharida, kahan se
Category → Supplies / Transport / Printing / Food / Other
Related Activity → dropdown se fundraiser ya event select karo jiske liye expense hua (optional but useful for reporting)
Receipt Upload → image ya PDF of the receipt/bill

Submit hone pe backend ko POST request jaati hai.

Step 2 — Validation (Backend)

Backend basic checks karta hai:

Amount > 0 hai?
Title aur description empty toh nahi?
Receipt file actually uploaded hai? (bina receipt ke claim reject)
Jo volunteer submit kar raha hai — kya uski membership/role valid hai?

Koi bhi check fail ho → error return hota hai, claim create nahi hota.

Step 3 — Expense Claim Record Creation (Backend + Database)

Validation pass hone ke baad backend ek ExpenseClaim document create karta hai:

volunteerId → kisne submit kiya
title, description, category
amount → claimed amount
relatedTo → fundraiserId ya eventId (agar linked hai)
receiptUrl → uploaded file ka path/link
submittedAt → exact timestamp
status → "pending"
Step 4 — Treasurer / Admin Notification (Backend)

Claim submit hote hi treasurer aur admin ko notification jaati hai:

Volunteer ka naam
Claim title aur amount
Platform link → "Review this claim"

Treasurer ko manually poochna nahi padta — system batata hai ki ek naya claim review ke liye wait kar raha hai.

Step 5 — Treasurer Reviews Claim (Admin/Treasurer Panel)

Treasurer "Expense Claims" dashboard pe jaata hai. Yahan saare claims ek list mein dikhte hain:

Pending claims sabse upar
Har claim pe: volunteer name, title, amount, category, submission date, status badge
Treasurer kisi bhi claim pe click karta hai → detail view khulta hai

Detail view mein hota hai:

Puri description
Receipt image/PDF directly viewable
Related activity context (agar linked tha)
Approve / Reject buttons
Step 6 — Treasurer Decision: Approve or Reject (Treasurer Panel)

Case A — Approve:

Treasurer claim valid paata hai → "Approve" click karta hai. Optionally ek note add kar sakta hai:

e.g. "Approved — will reimburse by Friday"

ExpenseClaim status → "pending" se "approved" ho jaata hai.

Case B — Reject:

Treasurer claim reject karta hai → "Reject" click karna padta hai with mandatory reason:

e.g. "Receipt unclear, please resubmit with proper bill"

ExpenseClaim status → "pending" se "rejected" ho jaata hai.
Volunteer ko rejection reason ke saath notification jaati hai taaki wo resubmit kar sake.

Step 7 — Volunteer Notified of Decision (Backend)

Decision hote hi volunteer ko notification jaati hai:

Approved → "Your claim of ₹850 has been approved. Reimbursement will be processed shortly."
Rejected → "Your claim was rejected. Reason: [treasurer ka note]"

Volunteer ko separately poochhne ki zaroorat nahi.

Step 8 — Reimbursement Happens (Offline / Manual)

Actual paisa dena — cash ya bank transfer — ye abhi bhi manually hota hai (college club context mein). Treasurer physically volunteer ko reimburse karta hai.

Platform is step ko automate nahi karta, lekin next step mein wo is action ko record zaroor karta hai.

Step 9 — Treasurer Marks as Reimbursed (Treasurer Panel)

Paisa dene ke baad treasurer platform pe wapas aata hai aur claim ko "Mark as Reimbursed" karta hai. Is step pe:

Reimbursement Mode → Cash / Bank Transfer / UPI
Reimbursed On → date (today ya jo actual date tha)
Transaction Reference → UPI ID ya bank ref number (optional)

ExpenseClaim status → "approved" se "reimbursed" ho jaata hai.
reimburse​dAt timestamp aur reimburse​dBy (treasurer userId) store hota hai.

Step 10 — Transaction Record Creation (Finance Module)

Jaise hi "Mark as Reimbursed" hota hai → backend automatically ek Transaction record create karta hai:

type → "expense"
category → "reimbursement"
amount → claimed aur approved amount
paidTo → volunteer ka userId
expenseClaimId → reference back to original claim
relatedTo → fundraiserId / eventId (agar linked tha)
date → reimbursement date
recordedBy → treasurer userId
status → "completed"

Ye automatically finance ledger mein expense ke roop mein reflect hota hai — treasurer ko manually kuch aur enter nahi karna padta.

Step 11 — Volunteer Receives Final Confirmation (Notification)

Volunteer ko ek final notification jaati hai:

"Your reimbursement of ₹850 for 'Baking Supplies for Bake Sale' has been processed."
Date aur mode of reimbursement bhi mention hota hai

Ab volunteer ke liye ye claim fully closed hai.

Step 12 — Finance Ledger Reflects Expense (Treasurer Panel)

Treasurer "Finance" section mein jaake dekh sakta hai:

Ye transaction automatically ledger mein "expense" column mein aata hai
Related activity ke saath linked hota hai
Baaki sab income transactions (ticket sales, membership dues, merchandise, fundraiser) ke saath ek hi jagah visible

Ek complete picture milti hai: total income − total expenses = current balance

Step 13 — Semester End Financial Report (Treasurer Panel)

Semester khatam hone pe treasurer ek summary report generate kar sakta hai:

Income Side:

Membership dues collected
Ticket sales (event-wise)
Merchandise sales
Fundraiser collections

Expense Side:

Volunteer reimbursements (claim-wise breakdown)
Any other expenses

Net Balance:

Total Income − Total Expenses = Closing Balance

Ye report sab existing Transaction records se automatically aggregate hoti hai — koi notebook, koi receipts pile, koi manual calculation nahi.

Summary of Records Created
ExpenseClaim → { volunteerId, amount, category, receiptUrl, 
                 submittedAt, status: "pending" → "approved" → "reimbursed" }

Transaction  → { type: "expense", category: "reimbursement", 
                 amount, paidTo, expenseClaimId, date }

Do main collections: expenseClaims, transactions.