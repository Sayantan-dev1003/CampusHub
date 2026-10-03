Workflow 4: Organization Publishes an Announcement
Step 1 — Admin Login & Navigation (Frontend) - DONE

Admin platform pe login karta hai aur apne dashboard se "Announcements" section mein jaata hai. Ye section sirf "admin" role wale users ko visible hota hai — normal members yahan kuch create nahi kar sakte, sirf read kar sakte hain.

Step 2 — Announcement Creation Form (Frontend) - DONE

Admin ek form fill karta hai jisme ye fields hote hain:

Title → e.g. "General Body Meeting — 10th October"
Body/Content → actual announcement text (multi-line)
Category → Meeting / Deadline / Event / General (dropdown)
Target Audience → All Members / Specific Year / Specific Branch (optional filter)
Priority → Normal / Urgent (urgent wale top pe dikhein ya highlighted hoon)

Submit button click karne pe data backend ko jaata hai.

Step 3 — Validation (Backend) - DONE

Backend basic validation karta hai:

Title empty toh nahi hai?
Content empty toh nahi hai?
Jo admin submit kar raha hai, kya uski role actually "admin" hai? (unauthorized users directly API call na kar sakein)

Koi bhi check fail ho → error return hota hai, record create nahi hota.

Step 4 — Announcement Record Creation (Backend + Database) - DONE

Validation pass hone ke baad backend ek Announcement document create karta hai:

title
content
category
priority
targetAudience
createdBy → admin ka userId
publishedAt → exact timestamp jab record create hua
status → "published"

Ye timestamp permanent record ban jaata hai — koi bhi baad mein dekh sakta hai ki announcement kab publish hui thi.

Step 5 — Target Audience Resolution (Backend)

Agar admin ne "All Members" select kiya tha → sab active members eligible hain.

Agar specific filter tha (e.g. 3rd year only, ya CSE branch only) → backend users collection se matching members ki list nikalta hai. Sirf inhe notification jaayegi.


Step 7 — In-App Notification (Backend + Frontend) - DONE

Saath hi, platform ke andar bhi ek notification create hoti hai har eligible member ke liye. Jab member next time login kare ya dashboard refresh kare → ek notification bell ya badge dikhta hai unread announcements ke liye.

Step 8 — Announcement Feed (Member Side — Frontend) - DONE

Member apne dashboard pe ya dedicated "Announcements" page pe jaata hai. Yahan saari published announcements chronological order mein dikhti hain — latest sabse upar. Urgent wali announcements highlighted ya pinned dikhti hain. Member kisi bhi purani announcement ko scroll karke dekh sakta hai — kuch bhi "chat mein kho" nahi jaata.

Step 9 — Read Tracking (Optional but Useful) - DONE

Jab member announcement open karta hai → backend ek "read" entry store kar sakta hai:

announcementId
userId
readAt → timestamp

Isse admin baad mein dekh sakta hai ki kitne members ne actually announcement padhi — WhatsApp mein ye possible nahi tha.

Step 10 — Admin View & Audit Log (Admin Panel)

Admin apne dashboard se dekh sakta hai:

Saari past announcements with timestamps
Kisne publish ki thi (createdBy)
Kitne members ko send hui

Ye permanent record ban jaata hai jo kabhi disappear nahi hoga — ek complete audit trail.