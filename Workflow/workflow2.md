Workflow 2: Student Purchases an Event Ticket
Step 1 — Admin Creates an Event (Admin Panel) - DONE

Admin ek event creation form fill karta hai jisme ye hota hai: event name, date, time, venue, description, total seat capacity. Submit karne pe backend mein ek Event record create hota hai with status "upcoming".

Step 2 — Admin Configures Ticket Types (Admin Panel) - DONE

Same event ke andar admin ticket types define karta hai:

Member Price → e.g. ₹50
Non-Member Price → e.g. ₹100
Total Seats Available → e.g. 200

Ye sab Event document ke andar hi store hota hai ya ek alag TicketConfig ke roop mein.

Step 3 — Event Listing (Frontend) - DONE

Student platform pe login karta hai aur available events ki list dekhta hai. Har event card pe basic info hoti hai — name, date, venue, aur ek "Buy Ticket" button.

Step 4 — Membership Status Check (Backend) - DONE

Jab student "Buy Ticket" click karta hai, backend automatically check karta hai:

Kya is student ki membership "active" hai?
Agar haan → Member price apply hoti hai
Agar nahi → Non-member price apply hoti hai

Student ko manually kuch select nahi karna padta — system khud determine karta hai.

Step 5 — Seat Availability Check (Backend) - DONE

Backend ye bhi check karta hai ki event mein seats bacha hai ya nahi:

remainingSeats > 0 → proceed karo
remainingSeats === 0 → student ko "Sold Out" dikhao, ticket purchase blocked

Step 6 — Order Summary Page (Frontend) - DONE

Student ko ek confirmation screen dikhti hai before payment:

Event name, date, venue
Applied price (member/non-member)
Total amount to pay

Student "Confirm & Pay" click karta hai.

Step 7 — Payment (Frontend + Payment Flow) - DONE

Payment process hoti hai — simple case mein student manually "mark as paid" kar sakta hai. Payment successful hone ka confirmation backend ko milta hai.

Step 8 — Ticket Record Creation (Backend + Database) - DONE

Payment confirm hone ke baad backend ek Ticket document create karta hai:

eventId → kis event ka ticket hai
userId → kisne kharida
ticketType → member / non-member
price → actually paid amount
status → "confirmed"
uniqueTicketCode → ek unique ID/QR code ke liye (door verification ke liye baad mein use hoga)

Step 9 — Remaining Capacity Update (Backend + Database) - DONE

Ticket create hote hi, Event record mein remainingSeats 1 se decrease ho jaata hai. Agar last seat biki → event automatically "sold_out" mark ho jaati hai.

Step 10 — Transaction Record Creation (Finance Module) - DONE

Ek Transaction document create hota hai:

type → "income"
category → "ticket_sales"
amount, date, paidBy (user reference), eventId (event reference)
status → "completed"

Ye automatically finance ledger mein reflect hoga — treasurer ko manually kuch note nahi karna padega.

Step 11 — Door Verification at Event (Admin/Volunteer Panel) - DONE

Event ke din, door pe jo banda hai wo student ka ticket code scan/search karta hai. Backend check karta hai:

Ticket "confirmed" hai?
Already check-in to nahi hua?

Agar valid → status "used" ho jaata hai, entry milti hai. Duplicate entry automatically blocked.

Step 12 — Post-Event Report (Admin Panel) - DONE

Event khatam hone ke baad admin ek summary dekh sakta hai:

Total tickets sold
Total revenue generated
Actual attendance (kitne log check-in hue)
Member vs non-member breakdown