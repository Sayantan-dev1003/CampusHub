Workflow 5: Member Purchases Merchandise
Step 1 — Admin Adds Merchandise (Admin Panel) - DONE

Pehle admin platform pe merchandise listing create karta hai. Form mein ye hota hai:

Product Name → e.g. "Skyline Hoodie", "Club T-Shirt"
Description → material, design details
Base Price → e.g. ₹599
Member Discount Price → e.g. ₹499 , Non-Member -> No discount
Category → Hoodie / T-Shirt / Accessories
Product Image → upload

Submit hone pe ek Product record create hota hai database mein.

Step 2 — Admin Configures Size & Stock (Admin Panel) - DONE

Product create hone ke baad admin har size ke liye stock define karta hai. Ye size-wise inventory hoti hai:

S → 15 units
M → 20 units
L → 18 units
XL → 10 units
XXL → 5 units

Har size ka apna alag stock count hota hai — ek Inventory record ya product ke andar nested structure ke roop mein store hota hai.

Step 3 — Merchandise Store Page (Member Frontend) - DONE

Member platform pe "Store" ya "Merchandise" section mein jaata hai. Yahan saare available products dikhte hain — product image, name, price. Agar member logged in hai aur membership active hai → member price dikhti hai. Agar non-member hai → regular price dikhti hai.

Out of stock products greyed out dikhte hain ya "Sold Out" badge ke saath.

Step 4 — Product Detail Page (Frontend) - DONE

Member kisi product pe click karta hai. Detail page pe hota hai:

Product image, description
Size selector (S / M / L / XL / XXL)
Quantity selector
Price (member/non-member as applicable)
"Add to Cart" ya direct "Buy Now" button

Jab member koi size select karta hai → backend se real-time stock check hoti hai us specific size ka.

Step 5 — Stock Availability Check (Backend) - DONE

Member jab size select kare ya "Buy Now" click kare, backend check karta hai:

Kya selected size ka stock > 0 hai?
Agar haan → proceed
Agar nahi → frontend pe "Size not available" dikhta hai, wo size select nahi hoti

Ye check payment se pehle hota hai — taaki payment ke baad "out of stock" wali situation na aaye.

Step 6 — Membership Status Check for Pricing (Backend) - DONE

Backend dobara confirm karta hai member ka status — sirf frontend display pe nahi, actual price calculation bhi backend pe hoti hai:

membership.status === "active" → member price apply
Warna → regular price apply

Ye isliye zaroori hai taaki koi manipulate karke member price na le bina actual membership ke.

Step 7 — Order Summary Page (Frontend) - DONE 

Member ko ek confirmation screen dikhti hai before payment:

Product name, selected size, quantity
Applied price (member/non-member clearly labeled)
Total amount
Delivery info ya pickup details (club ke context mein pickup hi hoga mostly)

Member "Confirm & Pay" click karta hai.

Step 8 — Payment (Frontend + Payment Flow) - DONE

Payment process hoti hai. Simple case mein admin manually "mark as paid" kar sakta hai dashboard se. Payment successful hone ka confirmation backend ko milta hai.

Step 9 — Stock Re-check Before Order Confirm (Backend) - DONE

Payment complete hone ke bilkul baad, backend ek baar aur stock check karta hai:

Ye edge case handle karta hai — jab do log same time pe same size khareed rahe hoon
Agar between payment aur order creation stock 0 ho gaya → payment refund initiate hoti hai, order nahi banta
Agar stock available hai → aage badhao

Step 10 — Order Record Creation (Backend + Database) - DONE

Backend ek Order document create karta hai:

userId → kisne order kiya
productId → kaunsa product
size → selected size
quantity → kitna
priceApplied → actually kitna charge hua
status → "confirmed"
orderedAt → timestamp
paymentId → payment reference

Step 11 — Inventory Reduction (Backend + Database) - DONE

Order confirm hote hi, Inventory mein selected size ka stock quantity se decrease ho jaata hai:

e.g. L size ka stock 18 tha → order of 1 → ab 17 reh gaya

Agar kisi size ka stock 0 ho jaata hai → wo size automatically "out of stock" mark ho jaati hai, aur store pe wo size grey/disabled dikhne lagti hai.

Step 12 — Transaction Record Creation (Finance Module) - DONE

Ek Transaction document create hota hai:

type → "income"
category → "merchandise_sales"
amount, date, paidBy, orderId (reference)
status → "completed"

Ye automatically treasurer ke finance ledger mein reflect hota hai.

Step 13 — Order Confirmation Notification (In-App) - DONE

Member ko confirmation jaati hai jisme hota hai:

Order summary (product, size, quantity, amount paid)
Order ID for reference
Pickup details ya delivery info
Expected fulfillment timeline

Step 14 — Admin Order Management (Admin Panel) - DONE

Admin ek dedicated "Orders" page pe dekh sakta hai:

Saare active/pending orders list mein
Har order ke against: member name, product, size, quantity, payment status
Admin order status update kar sakta hai → "confirmed" → "ready for pickup" → "fulfilled"
Member ko status change hone pe notification jaati hai

Step 15 — Admin Inventory Dashboard (Admin Panel) - DONE

Admin "Inventory" page pe dekh sakta hai:

Har product ka size-wise remaining stock
Low stock alert → e.g. agar kisi size ke 3 se kam units bachein → highlighted warning
Total units sold per product
Revenue generated per product

Ye real-time hota hai — koi manually spreadsheet update nahi karna padta.

Summary of Records Created
Product → Inventory (size-wise stock)
Order → { userId, productId, size, quantity, priceApplied, status, orderedAt }
Transaction → { type: "income", category: "merchandise_sales", orderId }
Inventory → stock decremented for selected size