export const allPackagesData = {
  // 1. Varanasi Kashi
  'varanasi-kashi': {
    id: 'varanasi-kashi',
    title: 'Varanasi – Kashi Vishwanath Darshan',
    subtitle: 'Kashi Vishwanath • Dashashwamedh Ghat • Ganga Aarti',
    duration: '4 Days / 3 Nights',
    basePrice: 54999,
    image: '/images/varanasi_kashi_aarti.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Sugam Darshan & Boat Aarti',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Dedicated AC Sleeper Coach ex-Nagpur', '2 Nights Deluxe AC Hotel Stay', 'Daily Pure Veg Satvik Dining', 'Dashashwamedh Ghat Evening Ganga Aarti Boat Ride', 'All Highway Tolls & Permits'],
    addons: [
      { id: 'private-bajra', label: 'Private Handcrafted Bajra Boat for Evening Aarti', price: 1200, selected: true },
      { id: 'sugam-darshan', label: 'Kashi Vishwanath Sugam Darshan Fast Pass', price: 600, selected: true },
      { id: 'subah-banaras', label: 'Early Morning Subah-e-Banaras Boat Ride & Snan Assist', price: 500, selected: false },
    ]
  },
  // 2. Ayodhya
  'ayodhya-yatra': {
    id: 'ayodhya-yatra',
    title: 'Ayodhya – Shri Ram Janmabhoomi Yatra',
    subtitle: 'Ram Lalla Mandir • Hanuman Garhi • Saryu River',
    duration: '4 Days / 3 Nights',
    basePrice: 54999,
    image: '/images/ayodhya_ram_mandir.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Ram Lalla & Saryu Aarti Pass',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Luxury 2+1 AC Sleeper Coach ex-Nagpur', '2 Nights 3★ AC Hotel in Ayodhya Dham', '100% Satvik Pure Veg Meals', 'Ram Lalla Mandir & Hanuman Garhi Guided Darshan', 'Saryu River Aarti Coordination'],
    addons: [
      { id: 'ayodhya-guide', label: 'Dedicated Vedic Historian Guide in Ayodhya', price: 800, selected: true },
      { id: 'vip-darshan', label: 'Priority Darshan Assistance & Prasad Box', price: 500, selected: true },
      { id: 'kanak-bhawan-pooja', label: 'Special Archana Puja at Kanak Bhawan', price: 400, selected: false },
    ]
  },
  // 3. Tirupati
  'tirupati-yatra': {
    id: 'tirupati-yatra',
    title: 'Tirupati Balaji Darshan Yatra',
    subtitle: 'Tirumala Balaji • Padmavathi Temple • Kapil Teertham',
    duration: '6 Days / 5 Nights',
    basePrice: 56999,
    image: '/images/tirupati_balaji.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Special Entry ₹300 Darshan Included',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Multi-Axle AC Sleeper Coach ex-Nagpur', '3 Nights Deluxe AC Hotel in Tirupati', 'Pre-booked ₹300 Seeghra Darshan Ticket', '2 Original Tirumala Srivari Laddus per person', 'Banana Leaf Satvik Meals'],
    addons: [
      { id: 'laddu-box', label: 'Special Prasadam Laddu Box (4 Pieces Extra)', price: 200, selected: true },
      { id: 'kalahasti-tour', label: 'Sri Kalahasti Rahu-Ketu Temple Excursion', price: 950, selected: true },
      { id: 'uphill-suv', label: 'Private Uphill Tirumala AC Innova Upgrade', price: 2200, selected: false },
    ]
  },
  // 4. Haridwar Rishikesh
  'haridwar-rishikesh-yatra': {
    id: 'haridwar-rishikesh-yatra',
    title: 'Haridwar – Rishikesh Ganga Darshan Yatra',
    subtitle: 'Har Ki Pauri • Mansa Devi • Ram Jhula • Parmarth Niketan',
    duration: '6 Days / 5 Nights',
    basePrice: 74999,
    image: '/images/haridwar_rishikesh.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Reserved Ganga Aarti & Cable Car',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Premium 2+1 AC Sleeper Coach ex-Nagpur', '3 Nights Deluxe Stays (2N Haridwar + 1N Rishikesh)', 'Mansa Devi Ropeway Cable Car Tickets', 'Daily Satvik Breakfast & Dinner', 'All Highway Tolls & Permits'],
    addons: [
      { id: 'ganga-aarti-seat', label: 'Har Ki Pauri Reserved Ganga Aarti Front Seat', price: 499, selected: true },
      { id: 'neelkanth-suv', label: 'Neelkanth Mahadev Temple 4x4 Hill Transit', price: 750, selected: true },
      { id: 'rishikesh-rafting', label: 'Shivpuri River Rafting Excursion (12 Km)', price: 650, selected: false },
    ]
  },
  // 5. Somnath Dwarka
  'somnath-yatra': {
    id: 'somnath-yatra',
    title: 'Somnath & Dwarka Coastal Circuit',
    duration: '7 Days / 6 Nights',
    basePrice: 52499,
    image: '/images/somnath_dwarka.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Sound & Light Show + Ferry Included',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Luxury BharatBenz AC Coach ex-Nagpur', '4 Nights AC Hotel Stays (2N Dwarka + 2N Somnath)', 'Bet Dwarka Island Boat Ferry Ticket', 'Somnath Temple Sound & Light Laser Show Pass', 'Unlimited Gujarati Satvik Thali Meals'],
    addons: [
      { id: 'rudrabhishek', label: 'Nageshwar Jyotirlinga Special Rudrabhishek Slot', price: 1200, selected: true },
      { id: 'dwarkadhish-dhwaja', label: 'Dwarkadhish Dhwajarohan Pooja Coordination', price: 1500, selected: false },
      { id: 'porbandar-guide', label: 'Porbandar Kirti Mandir & Sudama Temple Guide', price: 450, selected: true },
    ]
  },
  // 6. Vaishno Devi
  'vaishnodevi-yatra': {
    id: 'vaishnodevi-yatra',
    title: 'Maa Vaishno Devi Katra Yatra',
    subtitle: 'Maa Vaishno Devi Bhawan • Katra • Ardhkuwari',
    duration: '8 Days / 7 Nights',
    basePrice: 64999,
    image: '/images/vaishno_devi.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Yatra RFID Pass & Trek Assist',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['AC Sleeper Coach ex-Nagpur with Dual Drivers', '3 Nights 3★ Hotel Stay in Katra Base Camp', 'Yatra RFID Card Priority Registration', '100% Satvik Pure Veg Dining', 'All State Tolls, Permits & Fuel Surcharges'],
    addons: [
      { id: 'battery-car', label: 'Ardhkuwari to Bhawan Battery Car Assist', price: 700, selected: true },
      { id: 'helicopter', label: 'Katra to Sanjichhat Return Helicopter Ticket', price: 3800, selected: false },
      { id: 'shiv-khori', label: 'Day Excursion to Sacred Shiv Khori Cave Shrine', price: 900, selected: true },
    ]
  },
  // 7. Statue of Unity
  'statue-of-unity': {
    id: 'statue-of-unity',
    title: 'Statue of Unity & Sardar Sarovar',
    subtitle: 'World’s Tallest Statue • Valley of Flowers • Laser Show',
    duration: '5 Days / 4 Nights',
    basePrice: 51999,
    image: '/images/statue_of_unity.jpg',
    category: 'Domestic Holiday',
    badge: 'Monumental Heritage',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['Dedicated AC Tourist Coach ex-Nagpur', '2 Nights Hotel Stay in Kevadia / Ekta Nagar', 'Statue of Unity Express Viewing Gallery Ticket', 'Daily Buffet Breakfast & Dinner', 'Valley of Flowers & Dam Viewpoint Passes'],
    addons: [
      { id: 'laser-view', label: 'Statue of Unity Reserved Laser Show Seat', price: 350, selected: true },
      { id: 'jungle-safari', label: 'Sardar Patel Zoological Jungle Safari Ticket', price: 450, selected: true },
      { id: 'glow-garden', label: 'Ekta Glow Garden Evening Illumination Pass', price: 200, selected: false },
    ]
  },
  // 8. Jaipur Heritage
  'jaipur-heritage': {
    id: 'jaipur-heritage',
    title: 'Jaipur – Royal Pink City Heritage',
    subtitle: 'Amer Fort • Hawa Mahal • City Palace • Chokhi Dhani',
    duration: '5 Days / 4 Nights',
    basePrice: 52499,
    image: '/images/jaipur_hawa_mahal.jpg',
    category: 'Domestic Holiday',
    badge: 'Royal Palace Heritage',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Luxury AC Tourist Coach ex-Nagpur', '3 Nights 4★ Rajasthani Heritage Stay', 'Daily Buffet Breakfast & Dinners', 'Chokhi Dhani Cultural Village Entry & Feast', 'All Monument Entry Permits & Guide'],
    addons: [
      { id: 'amer-jeep', label: 'Amer Fort 4x4 Jeep Hill Transit Upgrade', price: 450, selected: true },
      { id: 'light-sound', label: 'Amer Fort Evening Sound & Light Show Front Row', price: 500, selected: true },
      { id: 'jaipur-guide', label: 'Private Licensed Historian Guide for All Forts', price: 800, selected: false },
    ]
  },
  // 9. Kashmir Paradise
  'kashmir-paradise': {
    id: 'kashmir-paradise',
    title: 'Srinagar & Kashmir Valley Paradise',
    subtitle: 'Dal Lake Shikara • Gulmarg Gondola • Pahalgam Valleys',
    duration: '9 Days / 8 Nights',
    basePrice: 54999,
    image: '/images/kashmir_dal_lake.jpg',
    category: 'Domestic Holiday',
    badge: 'Himalayan Paradise',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['AC Coach Transit + Local Kashmiri Valley SUV', '1 Night Deluxe Dal Lake Houseboat Stay', '4 Nights 4★ Valley Resort Stays (Srinagar & Pahalgam)', '1-Hour Complimentary Sunset Shikara Cruise', 'Daily Breakfast & Multi-cuisine Dinners'],
    addons: [
      { id: 'gondola-phase1', label: 'Gulmarg Gondola Cable Car Phase 1 Pass', price: 1100, selected: true },
      { id: 'gondola-phase2', label: 'Gulmarg Gondola Phase 2 Snow Peak Pass', price: 950, selected: false },
      { id: 'pahalgam-aruvision', label: 'Pahalgam Aru & Betaab Valley 4x4 Union Cab', price: 1400, selected: true },
    ]
  },
  // 10. Munnar Kerala
  'munnar-kerala': {
    id: 'munnar-kerala',
    title: 'Munnar & Kerala Green Trails',
    subtitle: 'Tea Hills • Eravikulam Sanctuary • Mattupetty Dam',
    duration: '8 Days / 7 Nights',
    basePrice: 58500,
    image: '/images/munnar_tea_gardens.jpg',
    category: 'Domestic Holiday',
    badge: 'Misty Hill Station',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['Comfortable AC Highway Coach ex-Nagpur', '4 Nights Deluxe Resort Stays in Kerala', 'Eravikulam National Park Entry Ticket', 'Tea Museum Guided Tour & Tea Tasting', 'Daily Buffet Breakfast & South Indian Dinner'],
    addons: [
      { id: 'kathakali-show', label: 'VIP Front Row Kathakali & Kalaripayattu Ticket', price: 450, selected: true },
      { id: 'spice-tour', label: 'Guided Spice Plantation Walk with Naturalist', price: 600, selected: true },
      { id: 'dam-speedboat', label: 'Mattupetty Dam Speedboat Ride Pass', price: 350, selected: false },
    ]
  },
  // 11. Kaziranga Wildlife
  'kaziranga-wildlife': {
    id: 'kaziranga-wildlife',
    title: 'Kaziranga National Park Wildlife Safari',
    subtitle: 'One-Horned Rhino • Brahmaputra River • Assam Tea',
    duration: '10 Days / 9 Nights',
    basePrice: 52499,
    image: '/images/kaziranga_rhino.jpg',
    category: 'Domestic Holiday',
    badge: 'Wild Rhino Safari',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['Long-Distance AC Highway Coach ex-Nagpur', '4 Nights Jungle Resort Stay in Kaziranga', 'Open 4x4 Gypsy Rhino Safari in Central/Western Zone', 'Assam Tea Garden Walk & Tasting', 'Daily Breakfast & Buffet Dinners'],
    addons: [
      { id: 'elephant-safari', label: 'Early Morning Kaziranga Elephant Safari Pass', price: 1800, selected: true },
      { id: 'extra-jeep-safari', label: 'Afternoon Eastern Zone (Agoratoli) Birding Safari', price: 2400, selected: false },
      { id: 'bihu-dance', label: 'Assamese Cultural Night & Traditional Bihu Dance', price: 500, selected: true },
    ]
  },
  // 12. Ladakh Adventure
  'ladakh-adventure': {
    id: 'ladakh-adventure',
    title: 'Leh – Ladakh Himalayan Expedition',
    subtitle: 'Khardung La Pass • Nubra Sand Dunes • Pangong Tso',
    duration: '12 Days / 11 Nights',
    basePrice: 74999,
    image: '/images/ladakh_pangong.jpg',
    category: 'Domestic Holiday',
    badge: 'High-Altitude Adventure',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Coach to Transfer Hub + Local High-Altitude 4x4 SUVs', '6 Nights Hotel/Resort in Leh, Nubra & Pangong', 'Inner Line Permits & Wildlife Fees', 'Pangong Tso Lakeside Deluxe Camp Stay', 'Oxygen Cylinder & Medical Kit in Vehicles'],
    addons: [
      { id: 'camel-ride', label: 'Nubra Valley Double-Humped Bactrian Camel Ride', price: 500, selected: true },
      { id: 'monastery-guide', label: 'Thiksey & Hemis Monastery Guided Tour', price: 650, selected: false },
      { id: 'rafting-zanskar', label: 'Sangam Zanskar River Scenic Rafting Combo', price: 1600, selected: true },
    ]
  },
  
  // Backward compatibility aliases for existing checkout links:
  'chardham': {
    id: 'chardham',
    title: 'Haridwar – Rishikesh Ganga Darshan Yatra',
    subtitle: 'Har Ki Pauri • Mansa Devi • Ram Jhula • Parmarth Niketan',
    duration: '6 Days / 5 Nights',
    basePrice: 74999,
    image: '/images/haridwar_rishikesh.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Reserved Ganga Aarti & Cable Car',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Premium 2+1 AC Sleeper Coach ex-Nagpur', '3 Nights Deluxe Stays', 'Mansa Devi Ropeway Tickets', 'Satvik Breakfast & Dinner', 'All Highway Tolls & Permits'],
    addons: [
      { id: 'ganga-aarti-seat', label: 'Har Ki Pauri Reserved Ganga Aarti Seat', price: 499, selected: true },
      { id: 'neelkanth-suv', label: 'Neelkanth Mahadev Temple Hill Transit', price: 750, selected: true },
    ]
  },
  'kashi-ayodhya': {
    id: 'kashi-ayodhya',
    title: 'Ayodhya Shri Ram Mandir & Kashi Corridor',
    subtitle: 'Ayodhya • Varanasi • Prayagraj Sangam',
    duration: '4 Days / 3 Nights',
    basePrice: 54999,
    image: '/images/ayodhya_ram_mandir.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Ram Lalla & Kashi Corridor Pass',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['3★ AC Hotel', 'Ganga Boat Included', 'Sugam Darshan Entry', 'Banarasi Pure Veg Thali'],
    addons: [
      { id: 'private-boat', label: 'Private Handcrafted Bajra Boat for Evening Aarti', price: 1200, selected: true },
      { id: 'sugam-darshan', label: 'Kashi Vishwanath Sugam Darshan Fast Pass', price: 600, selected: true },
      { id: 'ayodhya-guide', label: 'Dedicated Vedic Historian Guide in Ayodhya', price: 800, selected: false },
    ]
  },
  'tirupati-south': {
    id: 'tirupati-south',
    title: 'Tirupati Balaji Darshan Yatra',
    subtitle: 'Tirupati • Madurai • Rameshwaram',
    duration: '6 Days / 5 Nights',
    basePrice: 56999,
    image: '/images/tirupati_balaji.jpg',
    category: 'Spiritual Pilgrimage',
    badge: 'Special Entry ₹300 Darshan Included',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['VIP Laddu Combo', 'Uphill AC Transit', 'Banana Leaf Satvik Meals', 'Hotel Stays'],
    addons: [
      { id: 'laddu-combo', label: 'Special Prasadam Laddu Box (4 Pieces)', price: 200, selected: true },
      { id: 'kalahasti-tour', label: 'Sri Kalahasti Rahu-Ketu Temple Excursion', price: 950, selected: true },
    ]
  },
  'himachal-manali': {
    id: 'himachal-manali',
    title: 'Srinagar & Kashmir Valley Paradise',
    subtitle: 'Dal Lake Shikara • Gulmarg Gondola • Pahalgam Valleys',
    duration: '9 Days / 8 Nights',
    basePrice: 54999,
    image: '/images/kashmir_dal_lake.jpg',
    category: 'Domestic Holiday',
    badge: 'Himalayan Paradise',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['AC Coach Transit + Local Kashmiri Valley SUV', 'Dal Lake Houseboat Stay', 'Resort Stays', 'Shikara Cruise', 'Daily Breakfast & Dinners'],
    addons: [
      { id: 'gondola-phase1', label: 'Gulmarg Gondola Cable Car Pass', price: 1100, selected: true },
    ]
  },
  'kerala-backwaters': {
    id: 'kerala-backwaters',
    title: 'Munnar & Kerala Green Trails',
    subtitle: 'Tea Hills • Eravikulam Sanctuary • Mattupetty Dam',
    duration: '8 Days / 7 Nights',
    basePrice: 58500,
    image: '/images/munnar_tea_gardens.jpg',
    category: 'Domestic Holiday',
    badge: 'Misty Hill Station',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['AC Highway Coach ex-Nagpur', 'Resort Accommodations', 'Eravikulam Entry', 'Daily Breakfast & Dinner'],
    addons: [
      { id: 'kathakali-show', label: 'VIP Front Row Kathakali Ticket', price: 450, selected: true },
    ]
  },
  'goa-coastal': {
    id: 'goa-coastal',
    title: 'Statue of Unity & Sardar Sarovar',
    subtitle: 'World’s Tallest Statue • Valley of Flowers • Laser Show',
    duration: '5 Days / 4 Nights',
    basePrice: 51999,
    image: '/images/statue_of_unity.jpg',
    category: 'Domestic Holiday',
    badge: 'Monumental Heritage',
    badgeColor: 'bg-emerald-600 text-white',
    inclusions: ['AC Tourist Coach ex-Nagpur', 'Hotel Stay in Ekta Nagar', 'Viewing Gallery Pass', 'Daily Breakfast & Dinner'],
    addons: [
      { id: 'laser-view', label: 'Statue of Unity Reserved Laser Show Seat', price: 350, selected: true },
    ]
  },
  'corbett-nainital': {
    id: 'corbett-nainital',
    title: 'Jaipur – Royal Pink City Heritage',
    subtitle: 'Amer Fort • Hawa Mahal • City Palace • Chokhi Dhani',
    duration: '5 Days / 4 Nights',
    basePrice: 52499,
    image: '/images/jaipur_hawa_mahal.jpg',
    category: 'Domestic Holiday',
    badge: 'Royal Palace Heritage',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['AC Highway Coach ex-Nagpur', '4★ Heritage Hotel Stay in Jaipur', 'Daily Breakfast & Dinners', 'Chokhi Dhani Village Entry'],
    addons: [
      { id: 'amer-jeep', label: 'Amer Fort 4x4 Jeep Hill Transit', price: 450, selected: true },
    ]
  },

  // International Packages from DB:
  'dubai-combo': {
    id: 'dubai-combo',
    title: 'Luxury Dubai & Singapore Combo Escape',
    subtitle: 'Dubai (4N) + Singapore (5N) Grand Tour',
    duration: '10 Days / 9 Nights',
    basePrice: 189999,
    image: '/images/international.jpg',
    category: 'International Holiday',
    badge: 'Featured Worldwide Grand Tour',
    badgeColor: 'bg-amber-400 text-slate-950',
    inclusions: ['Return International Flight Tickets', '4 Nights Dubai 5★ + 5 Nights Singapore 5★', 'Burj Khalifa VIP + Universal Studios Pass', 'Daily Breakfast & Satvik Dinners', 'UAE & Singapore Visas'],
    addons: [
      { id: 'burj-prime', label: 'Burj Khalifa 148th Floor Sky Lounge Upgrade', price: 4200, selected: true },
      { id: 'universal-express', label: 'Universal Studios Unlimited Express Pass', price: 3200, selected: true },
    ]
  },
  'dubai-dunes': {
    id: 'dubai-dunes',
    title: 'Dubai Desert Safari & Marina Skyline',
    subtitle: 'Dubai Downtown • Desert Safari • Abu Dhabi',
    duration: '5 Days / 4 Nights',
    basePrice: 144999,
    image: '/images/yatra_international_holiday_travel_packages_6.jpg',
    category: 'International Holiday',
    badge: 'Popular Middle East Escape',
    badgeColor: 'bg-amber-600 text-white',
    inclusions: ['Direct Flights ex-Mumbai/Pune', '4 Nights 4★ Downtown Hotel', 'Burj Khalifa 124th Floor + Desert Safari', 'Daily Breakfast & Dinner', 'UAE Tourist E-Visa'],
    addons: [
      { id: 'abu-dhabi', label: 'Full Day Abu Dhabi & BAPS Hindu Mandir Tour', price: 2800, selected: true },
    ]
  },
  'singapore-malaysia': {
    id: 'singapore-malaysia',
    title: 'Singapore & Malaysia Twin Explorer',
    subtitle: 'Singapore • Malacca • Genting • Kuala Lumpur',
    duration: '7 Days / 6 Nights',
    basePrice: 162500,
    image: '/images/yatra_international_holiday_travel_packages_1.jpg',
    category: 'International Holiday',
    badge: 'Top Family Favorite',
    badgeColor: 'bg-blue-600 text-white',
    inclusions: ['Direct Flights to SG & Return ex-KL', '6 Nights 4★ City Stays', 'Universal Studios & Genting Cable Car', 'Singapore & Malaysia Visas', 'Intercity Coach Transit'],
    addons: [
      { id: 'night-safari', label: 'Singapore Night Safari Tram Adventure', price: 1900, selected: true },
    ]
  },
  'thailand-holiday': {
    id: 'thailand-holiday',
    title: 'Thailand Bangkok & Phuket / Pattaya Holiday',
    subtitle: 'Phuket • Phi Phi Islands • Bangkok City',
    duration: '6 Days / 5 Nights',
    basePrice: 136999,
    image: '/images/yatra_international_holiday_travel_packages_10.jpg',
    category: 'International Holiday',
    badge: 'Tropical Beach Package',
    badgeColor: 'bg-teal-600 text-white',
    inclusions: ['International & Domestic Flights', '5 Nights 4★ Beach & City Stays', 'Phi Phi Island Speedboat Cruise', 'Daily Breakfast & Indian Dinner', 'Visa Waiver Assistance'],
    addons: [
      { id: 'bangkok-safari', label: 'Safari World & Marine Park with Lunch', price: 1800, selected: true },
    ]
  },
  'bali-escape': {
    id: 'bali-escape',
    title: 'Bali Tropical Beaches & Ubud Culture',
    subtitle: 'Seminyak • Ubud Villa • Nusa Penida Island',
    duration: '6 Days / 5 Nights',
    basePrice: 139999,
    image: '/images/yatra_international_holiday_travel_packages_8.jpg',
    category: 'International Holiday',
    badge: 'Private Pool Villa & Floating Breakfast',
    badgeColor: 'bg-teal-600 text-white',
    inclusions: ['Return International Flights', '2N Private Pool Villa + 3N Ubud Resort', 'Nusa Penida Snorkeling Excursion', 'Daily Breakfast & Floating Breakfast', 'All Transfers'],
    addons: [
      { id: 'floating-breakfast', label: 'Iconic Floating Breakfast in Villa Pool', price: 1400, selected: true },
    ]
  },
  'europe-wonders': {
    id: 'europe-wonders',
    title: 'Grand Wonders of Europe: Swiss & Paris',
    subtitle: 'Zurich • Mt Titlis • Lucerne • Paris',
    duration: '8 Days / 7 Nights',
    basePrice: 224999,
    image: '/images/yatra_international_holiday_travel_packages_9.jpg',
    category: 'International Holiday',
    badge: 'Jungfrau Train & Eiffel Tower Entry',
    badgeColor: 'bg-teal-600 text-white',
    inclusions: ['Return Flights ex-India', '4N Switzerland + 3N Paris 4★ Stays', 'Eiffel Tower 2nd Level + Titlis Rotair', 'Swiss Travel Pass + TGV Lyria', 'Schengen Visa Concierge'],
    addons: [
      { id: 'jungfrau', label: 'Jungfraujoch Top of Europe Rail Pass', price: 9500, selected: true },
    ]
  }
};
