// CampusHub - Mock Database & Initial Seed Data (Indian Rupees & Authentic College Events)

export const INITIAL_EVENTS = [
  {
    id: 'evt-cultural-fest-2026',
    title: 'Skyline Annual Cultural Fest & Band Night 2026',
    category: 'Cultural & Music',
    description: 'The biggest annual university celebration of student talent! Join over 500 college students for a high-octane night of live rock and fusion bands, inter-hostel dance battles, comedy skits, and musical showcases in the University Grand Auditorium.',
    date: 'Wednesday, April 15, 2026',
    time: '5:30 PM - 10:30 PM',
    isoDate: '2026-04-15',
    venue: 'Main University Auditorium & Stage',
    address: 'Student Activity Complex, North Campus, Gate 2',
    totalCapacity: 500,
    remainingSeats: 142,
    memberPrice: 149.00,
    nonMemberPrice: 299.00,
    vipPrice: 499.00,
    status: 'PUBLISHED',
    featured: true,
    banner: '/assets/fest.jpg',
    agenda: [
      { time: '5:30 PM', activity: 'Auditorium Doors Open & Wristband Verification' },
      { time: '6:15 PM', activity: 'Inaugural Lamp Lighting & Inter-Club Dance Faceoff' },
      { time: '7:45 PM', activity: 'Annual College Club Excellence Awards' },
      { time: '8:30 PM', activity: 'Live Student Rock Band & Headlining DJ Set' }
    ],
    perks: [
      'Access to full main auditorium floor',
      'Complimentary festival glow band & refreshment voucher',
      'Priority entry with digital QR college pass',
      'Free commemorative college photo strip'
    ]
  },
  {
    id: 'evt-hackathon-2026',
    title: 'CampusHub 24-Hour Hackathon & Tech Expo',
    category: 'Workshops & Tech',
    description: 'A 24-hour campus hackathon fostering student software development, IoT prototypes, and AI solutions. Form your 4-person team, build impactful campus solutions, attend mentor coding clinics, and pitch to industry judges for ₹50,000 in cash prizes!',
    date: 'Saturday, April 25, 2026',
    time: '9:00 AM - Sunday 12:00 PM',
    isoDate: '2026-04-25',
    venue: 'Student Innovation Center & Computing Lab 4',
    address: 'Academic Tech Block, 2nd Floor, Campus Center',
    totalCapacity: 200,
    remainingSeats: 38,
    memberPrice: 0.00, // Free for active student members!
    nonMemberPrice: 199.00,
    vipPrice: 399.00,
    status: 'PUBLISHED',
    featured: true,
    banner: '/assets/hackathon.jpg',
    agenda: [
      { time: '9:00 AM', activity: 'Check-in, Hacker ID Badges & Breakfast' },
      { time: '10:30 AM', activity: 'Keynote & Problem Statements Announced' },
      { time: '11:00 AM', activity: '24-Hour Hacking Begins & Mentor Sessions' },
      { time: '9:00 PM', activity: 'Midnight Pizza & Mini Gaming Tournament' },
      { time: '10:00 AM Sun', activity: 'Project Submissions & Live Stage Demos' }
    ],
    perks: [
      'Free meals, energy snacks, and midnight coffee for 24 hours',
      'Official CampusHub Hackathon sticker pack & participant tee',
      'Direct interview referrals from partner recruiters',
      'Verified Certificate of Completion'
    ]
  },
  {
    id: 'evt-lawn-fest-2026',
    title: 'Spring Campus Lawn Fest & Acoustic Jam',
    category: 'Campus Life & Social',
    description: 'Relax on the sunny college lawn! Enjoy acoustic student performances, explore interactive booths hosted by Dramatics, Music, and Photography societies, savor street food stalls, and celebrate campus life under the open sky.',
    date: 'Friday, May 8, 2026',
    time: '12:00 PM - 6:00 PM',
    isoDate: '2026-05-08',
    venue: 'Main Campus Quadrangle Lawn & Amphitheatre',
    address: 'Central Lawn, Opposite Central Library',
    totalCapacity: 350,
    remainingSeats: 95,
    memberPrice: 49.00,
    nonMemberPrice: 99.00,
    vipPrice: 199.00,
    status: 'PUBLISHED',
    featured: true,
    banner: '/assets/campus_lawn.jpg',
    agenda: [
      { time: '12:00 PM', activity: 'Club Stalls, Art Exhibits & Food Kiosks Open' },
      { time: '1:30 PM', activity: 'Acoustic Guitar Sessions & Open Mic' },
      { time: '3:30 PM', activity: 'Inter-College Street Play (Nukkad Natak)' },
      { time: '5:00 PM', activity: 'Sunset Acoustic Jam & Group Singalong' }
    ],
    perks: [
      'Access to lawn stalls and festival games',
      'Food stall discount coupons worth ₹100',
      'Club merchandise giveaway entry'
    ]
  },
  {
    id: 'evt-leadership-summit',
    title: 'Inter-College Student Leadership Summit',
    category: 'Leadership & Career',
    description: 'Hands-on practical masterclasses for club presidents, team captains, and aspiring student leaders. Learn budget management, sponsorship pitching, event crowd handling, and career roadmap planning with accomplished alumni.',
    date: 'Saturday, May 16, 2026',
    time: '10:00 AM - 4:00 PM',
    isoDate: '2026-05-16',
    venue: 'Alumni Convention Center & Seminar Hall 1',
    address: 'Student Union Complex, 3rd Floor',
    totalCapacity: 150,
    remainingSeats: 64,
    memberPrice: 99.00,
    nonMemberPrice: 199.00,
    vipPrice: 349.00,
    status: 'PUBLISHED',
    featured: false,
    banner: '/assets/fest.jpg',
    agenda: [
      { time: '10:00 AM', activity: 'Welcome Keynote: Running High-Impact Student Societies' },
      { time: '11:30 AM', activity: 'Workshop Track: Event Sponsorships & Finance' },
      { time: '1:15 PM', activity: 'Networking Lunch with Alumni Mentors' },
      { time: '2:30 PM', activity: 'Interactive Case Studies & Certificate Presentation' }
    ],
    perks: [
      'Official Leadership Certificate',
      'Executive networking lunch included',
      'Access to CampusHub society leadership toolkits'
    ]
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod-hoodie',
    name: 'CampusHub Classic Collegiate Hoodie',
    tagline: 'Signature heavy-blend pastel sage fleece with embroidered crest',
    category: 'Hoodies & Sweats',
    price: 1299.00,
    memberPrice: 1099.00,
    image: '/assets/hoodie.jpg',
    featured: true,
    rating: 4.9,
    reviewsCount: 42,
    badge: 'Bestseller',
    description: 'Engineered for chilly lecture halls and relaxed evenings on the campus quad. Made with 80% combed organic cotton and 20% recycled polyester fleece in custom pastel sage green. Featuring ribbed cuffs, brass aglets, double-stitched kangaroo pocket, and an embroidered CampusHub archival chest crest.',
    details: [
      '380 GSM Heavyweight organic cotton blend',
      'Pre-shrunk fabric to retain shape and fit',
      'Embroidered tone-on-tone collegiate lettering',
      'Kangaroo pocket with hidden earphone pass-through',
      'Machine wash cold, tumble dry low'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { size: 'S', quantity: 20 },
      { size: 'M', quantity: 30 },
      { size: 'L', quantity: 25 },
      { size: 'XL', quantity: 15 }
    ]
  },
  {
    id: 'prod-tee',
    name: 'CampusHub Vintage Laurel Organic Tee',
    tagline: 'Breathable 100% ringspun combed cotton in pastel mint',
    category: 'T-Shirts',
    price: 599.00,
    memberPrice: 499.00,
    image: '/assets/tee.jpg',
    featured: true,
    rating: 4.8,
    reviewsCount: 38,
    badge: 'Popular',
    description: 'Our most comfortable everyday collegiate t-shirt in soothing pastel mint green. Features a relaxed unisex drape, taped neck and shoulders, and our classic collegiate laurel graphic screen-printed with eco-friendly water-based ink.',
    details: [
      '210 GSM 100% Combed Ringspun Cotton',
      'Eco-friendly water-based screen print',
      'Drop shoulder vintage relaxed fit',
      'Tagless neck label for maximum comfort',
      'Sustainably manufactured & OEKO-TEX certified'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    variants: [
      { size: 'XS', quantity: 8 },
      { size: 'S', quantity: 25 },
      { size: 'M', quantity: 40 },
      { size: 'L', quantity: 32 },
      { size: 'XL', quantity: 12 }
    ]
  },
  {
    id: 'prod-tote',
    name: 'CampusHub Botanical Canvas Tote',
    tagline: '12oz heavy organic canvas tote with inner zip compartment',
    category: 'Bags & Accessories',
    price: 349.00,
    memberPrice: 279.00,
    image: '/assets/tote.jpg',
    featured: true,
    rating: 4.9,
    reviewsCount: 56,
    badge: 'Eco Friendly',
    description: 'The quintessential everyday campus companion. Built from unbleached 12oz natural canvas with reinforced box-stitched handles and a subtle pastel sage botanical crest. Large enough for a 15-inch laptop, notebooks, and daily essentials, plus a zippered inner pocket for student ID and phone.',
    details: [
      '12oz heavyweight 100% organic cotton canvas',
      'Reinforced cross-stitched 24-inch webbing handles',
      'Internal zippered security pocket (6" x 6")',
      'Dimensions: 16" H x 15" W x 4" D',
      'Spot clean with mild detergent'
    ],
    sizes: ['One Size'],
    variants: [
      { size: 'One Size', quantity: 65 }
    ]
  },
  {
    id: 'prod-bottle',
    name: 'CampusHub Insulated Matte Flask (750ml)',
    tagline: 'Double-walled vacuum stainless steel in soft sage powder coat',
    category: 'Accessories',
    price: 699.00,
    memberPrice: 549.00,
    image: '/assets/bottle.jpg',
    featured: true,
    rating: 4.9,
    reviewsCount: 29,
    badge: 'Limited Stock',
    description: 'Stay hydrated through back-to-back classes and lab sessions. High-grade 18/8 food-grade stainless steel with double-wall vacuum insulation keeps your iced tea freezing cold for 24 hours or coffee hot for 12 hours. Ergonomic carry loop and leakproof lid.',
    details: [
      '18/8 Pro-Grade Stainless Steel',
      'TempShield double-wall vacuum insulation',
      'Soft-touch durable pastel sage powder coat',
      'BPA-free & Phthalate-free leakproof cap',
      'Fits standard backpack side pockets & cupholders'
    ],
    sizes: ['750ml'],
    variants: [
      { size: '750ml', quantity: 14 }
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Annual Cultural Fest & Band Night Tickets Live!',
    date: 'April 2, 2026',
    category: 'Fest Alert',
    badge: 'High Priority',
    summary: 'Early entry passes are officially open for all students. Active CampusHub members enjoy special discounted entry at ₹149 (Non-members ₹299). Reserve early before auditorium capacity fills up!',
    author: 'Cultural Committee'
  },
  {
    id: 'ann-2',
    title: 'Campus Hackathon Team Registrations Open',
    date: 'March 28, 2026',
    category: 'Tech Fest',
    badge: 'Free for Members',
    summary: 'Team slots for the 24-Hour Campus Hackathon are filling fast! Active members participate for ₹0. Pitch your tech prototypes for ₹50,000 cash prize pool.',
    author: 'Tech Club'
  },
  {
    id: 'ann-3',
    title: 'Pastel Sage College Merch Collection Dropped',
    date: 'March 22, 2026',
    category: 'Merchandise',
    badge: 'New Drops',
    summary: 'Our limited-run pastel sage collegiate hoodies, organic laurel tees, and canvas totes are now stocked at the Student Store. Active members get an automatic ₹200 discount applied at checkout.',
    author: 'Student Store'
  }
];

export const MEMBERSHIP_BENEFITS = [
  {
    id: 'ben-1',
    title: 'Up to 50% Off Event Tickets',
    description: 'Significant savings on all college cultural fests, hackathons, sports tournaments, and stage shows throughout the semester.',
    icon: 'ticket'
  },
  {
    id: 'ben-2',
    title: 'Exclusive Merch Savings',
    description: 'Year-round discounts of up to ₹200 across all hoodies, college tees, and club accessories.',
    icon: 'tag'
  },
  {
    id: 'ben-3',
    title: 'Digital Fast-Track QR Pass',
    description: 'Skip long registration queues at event venues with your instant mobile check-in barcode.',
    icon: 'qr-code'
  },
  {
    id: 'ben-4',
    title: 'Priority Entry & Early Access',
    description: '48-hour early ticket reservations before public release for high-demand campus celebrations.',
    icon: 'sparkles'
  },
  {
    id: 'ben-5',
    title: 'Voting & Leadership Rights',
    description: 'Vote on student association bylaws, nominate executive leaders, and run for committee chairs.',
    icon: 'award'
  },
  {
    id: 'ben-6',
    title: 'Volunteer Project Grants',
    description: 'Access club funding and reimbursement tools to launch campus initiatives, fundraisers, and fests.',
    icon: 'heart-handshake'
  }
];

export const LEADERSHIP_TEAM = [
  {
    name: 'Maya Lin',
    role: 'Association President',
    major: 'Computer Science & Engineering, Senior',
    bio: 'Championing student advocacy, inter-departmental collaboration, and campus life revitalization for over 3 years.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Julian Vance',
    role: 'Vice President of Operations',
    major: 'Electronics & Communication, Junior',
    bio: 'Oversees digital infrastructure, campus event logistics, and volunteer community management.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Alice Chen',
    role: 'Treasurer & Finance Chair',
    major: 'Commerce & Economics, Senior',
    bio: 'Dedicated to financial transparency, student budget allocations, and seamless volunteer expense reimbursements.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sophia Patel',
    role: 'Director of Cultural Events',
    major: 'Management & Media, Junior',
    bio: 'Curator behind the Cultural Fest, Tech Expo, and youth celebrations across campus.',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80'
  }
];

export const FAQS = [
  {
    q: 'Who can access CampusHub?',
    a: 'Any currently enrolled college student or visitor can access CampusHub. Public event tickets and merchandise are available to everyone, with special discounted pricing for enrolled members.'
  },
  {
    q: 'How does member pricing work for events and store products?',
    a: 'Active members automatically receive lower rates (e.g. ₹149 instead of ₹299 for the Cultural Fest, and ₹1,099 instead of ₹1,299 for hoodies). When logged into your account or upon entering your Student ID, discounted pricing is automatically applied.'
  },
  {
    q: 'Can I purchase tickets as a visitor without a membership?',
    a: 'Yes! All public campus events allow non-member ticket purchases at the standard public rate.'
  },
  {
    q: 'How do digital QR tickets work at the venue entrance?',
    a: 'Once you book an event ticket, a unique QR pass is instantly generated. You can save or present it on your smartphone at the auditorium entrance for 1-second scanning.'
  },
  {
    q: 'How do I collect ordered merchandise?',
    a: 'Merchandise can be picked up during office hours at the Student Center, Room 304, or collected at the merchandise booth during campus events.'
  }
];

export const DEMO_USERS = {
  member: {
    name: 'Alice Johnson',
    email: 'alice@student.edu',
    studentId: 'STU-001',
    department: 'Computer Science',
    year: 'Junior (3rd Year)',
    role: 'MEMBER',
    isMember: true,
    membershipType: 'Standard Active',
    expiryDate: 'Dec 31, 2026'
  },
  admin: {
    name: 'Sarah Connor',
    email: 'admin@campushub.com',
    studentId: 'ADM-100',
    department: 'Student Affairs',
    role: 'ADMIN',
    isMember: true,
    membershipType: 'Executive Staff'
  },
  treasurer: {
    name: 'David Miller',
    email: 'treasurer@campushub.com',
    studentId: 'TRS-200',
    department: 'Finance Division',
    role: 'TREASURER',
    isMember: true,
    membershipType: 'Finance Executive'
  }
};
