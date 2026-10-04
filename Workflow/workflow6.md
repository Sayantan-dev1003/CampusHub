Workflow 6: Fundraiser Task Assignment
Step 1 — Admin Creates a Fundraiser (Admin Panel) - DONE

Admin platform pe "Fundraisers" section mein jaata hai aur ek naya fundraiser create karta hai. Form mein ye hota hai:

Fundraiser Name → e.g. "Semester End Bake Sale"
Description → kya ho raha hai, kya goal hai
Target Amount → e.g. ₹5000 (kitna raise karna hai)
Event Date → jis din fundraiser hoga
Deadline for Task Completion → tasks kab tak complete hone chahiye

Submit hone pe ek Fundraiser record create hota hai with status "planning".

Step 2 — Admin Defines Tasks (Admin Panel) - DONE

Fundraiser create hone ke baad admin us fundraiser ke andar individual tasks define karta hai. Har task ek alag unit of work hai:

Task Title → e.g. "Buy Baking Supplies", "Bake Chocolate Brownies", "Manage the Table on the Day"
Description → specific instructions kya karni hai
Deadline → ye specific task kab tak complete ho
Priority → High / Medium / Low

Abhi tak kisi ko assign nahi hua — sirf tasks define ho rahe hain. Ye Task records create hote hain fundraiserId ke reference ke saath.

Step 3 — Admin Assigns Tasks to Volunteers (Admin Panel) - DONE

Ab admin har task ke against ek volunteer select karta hai. Volunteer list mein wahi members dikhte hain jinki membership active hai aur jo volunteer ke liye available hain.

Ek task → ek volunteer (primary responsible person)
Optionally ek task pe multiple volunteers assign ho sakein agar kaam zyada ho

Assignment hone pe:

Task record mein assignedTo → volunteer ka userId store hota hai
Task status → "assigned"

Step 4 — Volunteer Notification (In-App) - DONE

Jaise hi task assign hota hai, volunteer ko turant notification jaati hai:

Fundraiser ka naam aur context
Task title aur description
Deadline
Platform ka link — "View your task"

Volunteer ko separately message karne ki zaroorat nahi — system khud batata hai.

Step 5 — Volunteer Dashboard (Volunteer/Member Frontend) - DONE

Volunteer platform pe login karta hai aur uska dashboard specifically dikhata hai:

"My Tasks" section → sirf uske assigned tasks
Har task pe dikhta hai: title, fundraiser name, deadline, current status
Overdue tasks highlighted ya red mein dikhte hain
Volunteer yahan se directly task update kar sakta hai

Step 6 — Volunteer Updates Task Progress (Frontend) - DONE

Volunteer apna kaam karta rehta hai aur progress update karta hai. Har task pe status options hote hain:

"assigned" → task mila hai, shuru nahi kiya
"in_progress" → kaam chal raha hai
"completed" → kaam ho gaya

Volunteer status change karta hai + optionally ek short note add kar sakta hai:

e.g. "Brownies bake ho gayi hain, 3 dozen ready"

Ye update Task record mein store hota hai with updatedAt timestamp.

Step 7 — Admin Notification on Task Completion (In-App) - DONE

Jab volunteer koi task "completed" mark karta hai → admin ko ek notification jaati hai:

Kaun sa task complete hua
Kisne complete kiya
Kab complete hua

Admin ko actively poochna nahi padta — system khud update deta hai.

Step 8 — Admin Central Dashboard (Admin Panel) - DONE

Admin ek "Fundraiser Dashboard" page dekh sakta hai jisme ek nazar mein pura picture clear ho:

Fundraiser name, date, target amount
Task Progress Overview:
Total tasks: 8
Completed: 5 ✅
In Progress: 2 🔄
Not Started: 1 ⬜
Har task ke against: volunteer name, status, last updated, deadline
Overall completion percentage → e.g. "62% tasks complete"

Koi kuch poochne ki zaroorat nahi — dashboard pe sab visible hai.

Step 9 — Overdue Task Detection (Backend — Scheduled Job) - DONE

Ek background cron job daily run karta hai jo check karta hai:

Koi task hai jiska deadline aaj ya kal hai aur status abhi bhi "assigned" ya "in_progress" hai?
Agar haan → volunteer ko reminder notification jaati hai
Admin ko bhi flag milta hai dashboard pe → task red/orange highlight mein dikhta hai

Ye isliye hai taaki last minute chaos na ho — pehle se pata chal jaaye ki kya at risk hai.

Step 10 — Fundraiser Status Tracking (Admin Panel) - DONE

Admin manually ya system automatically fundraiser ka overall status update karta hai:

"planning" → tasks define ho rahe hain
"active" → fundraiser chal raha hai, tasks execute ho rahe hain
"completed" → fundraiser ho gaya
"cancelled" → agar kuch ho jaaye

Status change hone pe saare assigned volunteers ko ek notification jaati hai.

Step 11 — Fundraiser Actual Revenue Entry (Admin / Treasurer)

Fundraiser ke din jo actual paisa collect hua — bake sale se customers ne diya — wo treasurer ya admin manually enter karta hai:

amountCollected → e.g. ₹4200
Ye ek Transaction record create karta hai:
type → "income"
category → "fundraiser"
fundraiserId → reference
amount, date, recordedBy

Step 12 — Post-Fundraiser Summary (Admin Panel) - DONE

Fundraiser complete hone ke baad admin ek summary page dekh sakta hai:

Target amount vs actual amount collected
Total tasks: kitne complete hue, kitne reh gaye
Volunteer-wise contribution → kisne kaunsa task complete kiya
Timeline → kaun sa task kab complete hua

Ye record permanently save rehta hai — agli baar fundraiser plan karne ke liye reference ban sakta hai.

Summary of Records Created
Fundraiser → { name, targetAmount, eventDate, status }
Task → { fundraiserId, title, assignedTo, status, deadline, notes, updatedAt }
Transaction → { type: "income", category: "fundraiser", fundraiserId, amount }

Teen main collections: fundraisers, tasks, transactions.