'use client';

import React, { useState, useEffect, useRef } from 'react';

const spiritualData = [
  {
    id: 'varanasi-kashi',
    title: 'Varanasi – Kashi Vishwanath Darshan',
    subtitle: 'Kashi Vishwanath • Dashashwamedh Ghat • Ganga Aarti',
    badge: 'Sugam Darshan & Boat Aarti',
    badgeColor: 'bg-amber-600 text-white',
    duration: '4 Days / 3 Nights',
    price: '₹54,999',
    perPerson: 'per person',
    image: '/images/varanasi_kashi_aarti.jpg',
    transitInfo: 'Dedicated AC Sleeper Coach ex-Nagpur with 2 commercial drivers & scheduled rest stops (Approx. 1,300–1,500 km round trip).',
    stayInfo: 'Deluxe AC Hotels within walking distance of Kashi Vishwanath Corridor & Dashashwamedh Ghat.',
    meals: '100% Satvik Banarasi Pure Veg Meals with morning breakfast & traditional Banarasi thali.',
    highlights: [
      'Kashi Vishwanath Jyotirlinga Sugam Darshan Pass',
      'Reserved Wooden Boat Cruise for Dashashwamedh Ghat Evening Ganga Aarti',
      'Morning Holy Ganga Snan & Subah-e-Banaras Boat Ride',
      'Annapurna Mandir, Sankat Mochan & Durga Kund Temple Darshan',
      'Experienced Tour Captain ex-Nagpur & Local Temple Guide',
    ],
    shortPlan:
      'Complete sacred pilgrimage from Nagpur to Varanasi. Includes comfortable AC Sleeper Coach travel with dual drivers, hotel stay near the Temple Corridor, private boat cruise for evening Ganga Aarti, and confirmed darshan assistance.',
    itinerary: [
      { day: 'Day 1', title: 'Nagpur Departure to Varanasi', desc: 'Evening departure from Nagpur pickup point by AC Sleeper Coach. Overnight comfortable highway journey towards Varanasi with scheduled rest stops.' },
      { day: 'Day 2', title: 'Arrival in Varanasi, Check-in & Evening Ganga Aarti', desc: 'Morning arrival in Varanasi. Hotel check-in and refresh. Afternoon visit to Annapurna Temple and Kal Bhairav. Evening reserved boat cruise at Dashashwamedh Ghat for mesmerizing Ganga Aarti.' },
      { day: 'Day 3', title: 'Kashi Vishwanath Darshan & Temple Circuit', desc: 'Early morning holy Ganga snan, Sugam Darshan at Kashi Vishwanath Jyotirlinga. Afternoon visit to Sankat Mochan Hanuman Temple, Durga Kund, Bharat Mata Mandir, and Banarasi silk market.' },
      { day: 'Day 4', title: 'Morning Aarti & Return to Nagpur', desc: 'Morning breakfast at hotel, check-out, and return journey to Nagpur by AC coach with daytime scenic travel. Arrival in Nagpur by night/early morning.' },
    ],
    inclusions: [
      'Round-Trip AC Sleeper Coach Transit ex-Nagpur',
      '2 Nights Deluxe AC Hotel Stay in Varanasi',
      'Daily Satvik Breakfast & Pure Veg Dinner',
      'Dashashwamedh Ghat Evening Ganga Aarti Boat Ride',
      'All Tolls, Parking, Driver Allowance & State Permits',
    ],
    exclusions: ['Personal Puja / Abhishek Dakshina', 'Local Auto/E-rickshaw inside narrow temple lanes'],
  },
  {
    id: 'ayodhya-yatra',
    title: 'Ayodhya – Shri Ram Janmabhoomi Yatra',
    subtitle: 'Ram Lalla Mandir • Hanuman Garhi • Saryu River',
    badge: 'Ram Lalla & Saryu Aarti Pass',
    badgeColor: 'bg-amber-600 text-white',
    duration: '4 Days / 3 Nights',
    price: '₹54,999',
    perPerson: 'per person',
    image: '/images/ayodhya_ram_mandir.jpg',
    transitInfo: 'Luxury 2+1 AC Sleeper Coach ex-Nagpur with experienced highway drivers (Approx. 1,600–1,800 km round trip).',
    stayInfo: 'Handpicked 3-Star AC Hotels close to Ram Janmabhoomi Teerth Kshetra.',
    meals: '100% Satvik Pure Veg Awadhi Meals (Jain / No-onion-no-garlic options available).',
    highlights: [
      'Confirmed Shri Ram Janmabhoomi Mandir Darshan Assistance',
      'Hanuman Garhi & Kanak Bhawan Special Darshan',
      'Holy Dip at Saryu River & Evening Ram Ki Paidi Maha Aarti',
      'Dashrath Mahal, Sita Ki Rasoi & Surya Kund Visit',
      'Dedicated Vedic Tour Coordinator ex-Nagpur',
    ],
    shortPlan:
      'Devotional direct yatra from Nagpur to Ayodhya Dham. Experience grand darshan of Ram Lalla at Shri Ram Janmabhoomi, Hanuman Garhi, and the serene evening Maha Aarti on the banks of holy Saryu River.',
    itinerary: [
      { day: 'Day 1', title: 'Nagpur Departure to Ayodhya', desc: 'Afternoon/evening boarding from Nagpur by Luxury AC Sleeper Coach. Overnight highway travel with scheduled refreshment stops.' },
      { day: 'Day 2', title: 'Arrival in Ayodhya, Hotel Check-in & Saryu Aarti', desc: 'Morning arrival at Ayodhya Dham. Hotel check-in and rest. Evening holy snan at Saryu River and attendance at grand Ram Ki Paidi Saryu Aarti.' },
      { day: 'Day 3', title: 'Ram Janmabhoomi Mandir & Hanuman Garhi', desc: 'Morning guided Darshan of Lord Ram Lalla at Shri Ram Janmabhoomi Temple. Afternoon visit to Hanuman Garhi, Kanak Bhawan, Dashrath Mahal, and local markets.' },
      { day: 'Day 4', title: 'Breakfast & Return Journey to Nagpur', desc: 'Morning breakfast at hotel, check-out, and return departure towards Nagpur with scenic transit across central India.' },
    ],
    inclusions: [
      'Round-Trip AC Sleeper Bus Transit ex-Nagpur',
      '2 Nights 3-Star Hotel Stay in Ayodhya Dham',
      'Daily Pure Veg Satvik Breakfast & Dinner',
      'Guided Temple Darshan & Saryu Aarti Coordination',
      'Driver Charges, Intercity Tolls & Parking',
    ],
    exclusions: ['Special Personal Offerings & Pujas', 'Local E-Rickshaw Transfer Fees'],
  },
  {
    id: 'tirupati-yatra',
    title: 'Tirupati Balaji Darshan Yatra',
    subtitle: 'Tirumala Balaji • Padmavathi Temple • Kapil Teertham',
    badge: 'Special Entry ₹300 Darshan Included',
    badgeColor: 'bg-amber-600 text-white',
    duration: '6 Days / 5 Nights',
    price: '₹56,999',
    perPerson: 'per person',
    image: '/images/tirupati_balaji.jpg',
    transitInfo: 'Multi-Axle AC Sleeper Coach ex-Nagpur with dedicated uphill transit to Tirumala Hills (Approx. 2,000–2,200 km round trip).',
    stayInfo: 'Deluxe AC Hotels in Tirupati city foothills with modern amenities and 24hr hot water.',
    meals: 'South Indian Pure Veg Satvik Meals served on banana leaf + 2 Original Srivari Laddus included.',
    highlights: [
      'Pre-booked ₹300 Seeghra Darshan Special Entry Ticket',
      'Guaranteed 2 Original Tirumala Srivari Prasadam Laddus per person',
      'Tiruchanur Sri Padmavathi Ammavari Temple Darshan',
      'Kapil Teertham & Sri Govindaraja Swamy Temple',
      'Hair Tonsure (Mundan) and Angapradakshinam Coordination',
    ],
    shortPlan:
      'Sacred journey from Nagpur to the abode of Lord Venkateswara at Tirumala Hills. Features confirmed ₹300 Special Entry Darshan pass, original laddu prasadam, and dedicated uphill transportation.',
    itinerary: [
      { day: 'Day 1', title: 'Nagpur Departure towards Andhra Pradesh', desc: 'Morning departure from Nagpur by AC Sleeper Coach. Journey through Telangana and Andhra Pradesh with meal stops.' },
      { day: 'Day 2', title: 'Arrival in Tirupati & Hotel Check-in', desc: 'Afternoon/evening arrival in Tirupati city. Check-in to deluxe hotel, tour briefing by yatra manager, and evening temple walk.' },
      { day: 'Day 3', title: 'Tirumala Hills & Lord Balaji Seeghra Darshan', desc: 'Early morning uphill transfer to sacred Tirumala Hills. Confirmed Special Entry ₹300 Darshan of Lord Venkateswara, laddu collection, and return to foothills.' },
      { day: 'Day 4', title: 'Padmavathi Temple & Sri Kalahasti Excursion', desc: 'Morning Darshan at Tiruchanur Padmavathi Temple. Afternoon visit to Kapil Teertham and famous Sri Kalahasti (Rahu-Ketu) Temple.' },
      { day: 'Day 5', title: 'Return Transit towards Maharashtra', desc: 'Breakfast, check-out, and commencement of return highway journey back towards Nagpur.' },
      { day: 'Day 6', title: 'Arrival back in Nagpur', desc: 'Morning/midday arrival at Nagpur departure hub with divine memories of Lord Venkateswara.' },
    ],
    inclusions: [
      'Round-Trip AC Sleeper Coach Transit ex-Nagpur',
      '3 Nights Deluxe AC Hotel Stay in Tirupati',
      'Confirmed ₹300 Tirupati Special Entry Darshan Ticket',
      '2 Tirupati Srivari Laddus per passenger',
      'Daily Veg Breakfast & Dinner',
    ],
    exclusions: ['Kalahasti Rahu-Ketu Special Puja Ticket', 'Personal Hair Tonsure / Barber Fees'],
  },
  {
    id: 'haridwar-rishikesh-yatra',
    title: 'Haridwar – Rishikesh Ganga Darshan Yatra',
    subtitle: 'Har Ki Pauri • Mansa Devi • Ram Jhula • Parmarth Niketan',
    badge: 'Reserved Ganga Aarti & Cable Car',
    badgeColor: 'bg-amber-600 text-white',
    duration: '6 Days / 5 Nights',
    price: '₹74,999',
    perPerson: 'per person',
    image: '/images/haridwar_rishikesh.jpg',
    transitInfo: 'Premium 2+1 AC Sleeper Coach ex-Nagpur with dual drivers & scheduled highway rest stops (Approx. 2,400–2,500 km round trip).',
    stayInfo: 'Deluxe Riverside & Temple-view Hotels in Haridwar and scenic Rishikesh resort.',
    meals: '100% Satvik Pure Veg North Indian Dining with morning buffet breakfast & dinner.',
    highlights: [
      'Har Ki Pauri Holy Dip & Evening Grand Ganga Aarti',
      'Mansa Devi & Chandi Devi Temple Ropeway Cable Car',
      'Rishikesh Ram Jhula, Lakshman Jhula & Triveni Ghat',
      'Parmarth Niketan Ashram Sunset Aarti & Meditation Session',
      'Neelkanth Mahadev Temple Himalayan Excursion (Road-Permitted)',
    ],
    shortPlan:
      'Rejuvenating spiritual tour connecting Nagpur directly to holy Haridwar and serene Rishikesh. Features riverside accommodations, reserved Ganga Aarti access, ropeway cable car tickets, and Satvik dining.',
    itinerary: [
      { day: 'Day 1', title: 'Departure from Nagpur', desc: 'Morning departure from Nagpur by AC Sleeper Coach. Scenic highway journey across Madhya Pradesh & Uttar Pradesh with regular rest stops.' },
      { day: 'Day 2', title: 'Arrival in Haridwar & Evening Ganga Aarti', desc: 'Midday arrival in holy Haridwar. Check-in to hotel. Evening holy dip at Har Ki Pauri and attendance at world-renowned Ganga Aarti.' },
      { day: 'Day 3', title: 'Haridwar Temples & Ropeway Tour', desc: 'Morning ropeway cable car ride to Mansa Devi and Chandi Devi hill shrines. Visit Daksh Prajapati Temple and evening bazaar walk.' },
      { day: 'Day 4', title: 'Rishikesh Ashrams & Parmarth Niketan', desc: 'Transfer to Rishikesh. Explore Ram Jhula, Lakshman Jhula, Gita Bhawan, and attend the soul-stirring Parmarth Niketan evening Aarti.' },
      { day: 'Day 5', title: 'Neelkanth Mahadev & Return Departure', desc: 'Early excursion to Neelkanth Mahadev Temple nestled in the Garhwal Himalayas. Afternoon return coach departure towards Nagpur.' },
      { day: 'Day 6', title: 'Arrival in Nagpur', desc: 'Arrival back in Nagpur with holy Ganga Jal and sacred blessings.' },
    ],
    inclusions: [
      'Round-Trip AC Sleeper Bus Transit ex-Nagpur',
      '3 Nights Deluxe Hotel Stay (2N Haridwar + 1N Rishikesh)',
      'Mansa Devi Ropeway Cable Car Tickets',
      'Daily Satvik Breakfast & Pure Veg Dinner',
      'All Highway Tolls, Parking & Driver Charges',
    ],
    exclusions: ['Optional River Rafting in Rishikesh (~₹600)', 'Personal Puja Offerings'],
  },
];

export default function SpiritualPackages() {
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [sheetState, setSheetState] = useState('collapsed'); // 'collapsed' | 'expanded'
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isClosing, setIsClosing] = useState(false);
  const [cardScrollTop, setCardScrollTop] = useState(0);
  const packages = spiritualData;

  const cardContainerRef = useRef(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedPkg) {
        handleCloseSheet();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPkg]);

  useEffect(() => {
    if (selectedPkg) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPkg]);

  const handleOpenSheet = (pkg) => {
    setSelectedPkg(pkg);
    setSheetState('collapsed');
    setActiveTab('itinerary');
    setIsClosing(false);
    setCardScrollTop(0);
  };

  const handleCloseSheet = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPkg(null);
      setSheetState('collapsed');
      setIsClosing(false);
    }, 280);
  };

  const handleExpandFullWindow = () => {
    setSheetState('expanded');
    if (cardContainerRef.current) {
      cardContainerRef.current.scrollTop = 0;
    }
    setCardScrollTop(0);
  };

  const handleDownsizeToPeek = () => {
    setSheetState('collapsed');
  };

  const handleWheel = (e) => {
    if (sheetState === 'collapsed' && e.deltaY > 5) {
      handleExpandFullWindow();
    } else if (sheetState === 'expanded' && cardContainerRef.current) {
      if (cardContainerRef.current.scrollTop <= 0 && e.deltaY < -15) {
        handleDownsizeToPeek();
      }
    }
  };

  const handleScroll = (e) => {
    const st = e.target.scrollTop;
    setCardScrollTop(st);
    if (sheetState === 'collapsed' && st > 10) {
      handleExpandFullWindow();
    } else if (sheetState === 'expanded' && st < -20) {
      handleDownsizeToPeek();
    }
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const diffY = touchStartY.current - touchY;

    if (sheetState === 'collapsed') {
      if (diffY > 25) {
        handleExpandFullWindow();
      } else if (diffY < -40) {
        handleCloseSheet();
      }
    } else if (sheetState === 'expanded' && cardContainerRef.current) {
      if (cardContainerRef.current.scrollTop <= 0 && diffY < -40) {
        handleDownsizeToPeek();
      }
    }
  };

  return (
    <section className="w-full py-16 bg-amber-50/40 border-b border-amber-200/60 scroll-mt-28 sm:scroll-mt-32" id="spiritualPackagesSection">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
              <span className="material-symbols-outlined text-[16px]">temple_hindu</span>
              PILGRIMAGE &amp; DIVINE DARSHAN
            </div>
            <h2 className="text-2xl md:text-3xl text-slate-900 tracking-tight font-spiritual font-normal not-italic">
              Curated Spiritual Darshan Circuits
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Fully managed multi-day spiritual journeys across India with AC coach transit, verified temple accommodations, VIP Darshan line coordination, and pure Satvik meals. Click any card to preview.
            </p>
          </div>
          <div>
            <a
              className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
              href="/spiritual"
            >
              <span>Explore all Devsthan Circuits</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleOpenSheet(pkg)}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-amber-200 transition-all duration-300 flex flex-col group cursor-pointer active:scale-[0.99]"
            >
              <div className="relative h-28 sm:h-40 md:h-48 w-full overflow-hidden bg-slate-100">
                <img
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={pkg.image}
                />
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg bg-amber-600 text-white font-bold text-[9px] sm:text-xs">
                  {pkg.duration}
                </span>
                <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-950/80 text-white text-[9px] sm:text-xs font-medium truncate flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-amber-400">temple_hindu</span>
                  <span className="truncate">{pkg.subtitle}</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[9px] sm:text-xs font-bold text-amber-700 mb-0.5 sm:mb-1 truncate">
                    <span className="material-symbols-outlined text-[13px] sm:text-[15px] shrink-0">verified</span>
                    <span className="truncate">{pkg.badge}</span>
                  </div>
                  <h3 className="text-xs sm:text-base font-bold font-serif text-slate-900 mb-1 sm:mb-1.5 group-hover:text-amber-700 transition-colors line-clamp-1 sm:line-clamp-2">
                    {pkg.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed mb-1.5 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                    {pkg.shortPlan}
                  </p>
                  <div className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-800 font-semibold mb-3">
                    Includes: Stay + Bus + VIP Pass + Satvik Meals
                  </div>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[8px] sm:text-[10px] text-slate-400 block font-medium">Starts at</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-sm sm:text-xl font-extrabold text-slate-900">{pkg.price}</span>
                      <span className="text-[9px] sm:text-[11px] text-slate-400">/person</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSheet(pkg);
                    }}
                    className="px-2.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-lg sm:rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-bold shadow-sm transition-all shrink-0"
                    type="button"
                  >
                    View &amp; Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SPIRITUAL DARSHAN 2D EXPANSION & 82.5% VH SCROLL CARD SHEET
         ========================================================================= */}
      {selectedPkg && (
        <div
          className={`fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-950/25 backdrop-blur-[3px] transition-opacity duration-300 overflow-x-hidden ${
            isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={handleCloseSheet}
        >
          {/* Floating Card Container */}
          <div
            ref={cardContainerRef}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onScroll={handleScroll}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className={`bg-white rounded-3xl shadow-2xl border border-amber-200/80 transition-all duration-500 ease-out flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar pb-[2.5vh] mb-[2.5vh] ${
              sheetState === 'collapsed'
                ? 'w-[94vw] sm:w-[90vw] max-w-2xl sm:w-[660px] h-[500px] sm:h-[530px] translate-y-0 shadow-amber-900/15'
                : 'w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-5xl h-[85vh] sm:h-[82.5vh] max-h-[85vh] sm:max-h-[82.5vh] shadow-2xl ring-1 ring-amber-900/10'
            } ${isClosing ? 'translate-y-full scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'}`}
          >
            {/* STICKY PARALLAX HERO IMAGE HEADER */}
            <div
              className={`sticky top-0 z-0 w-full overflow-hidden bg-slate-900 shrink-0 transition-all duration-500 rounded-t-3xl ${
                sheetState === 'collapsed' ? 'h-[250px] sm:h-[270px]' : 'h-72 sm:h-96 md:h-[360px]'
              }`}
            >
              <img
                src={selectedPkg.image}
                alt={selectedPkg.title}
                className="absolute inset-0 w-full h-full object-cover will-change-transform transition-all duration-150 ease-out"
                style={{
                  transform: `scale(${1 + Math.min(cardScrollTop / 600, 0.25)})`,
                  opacity: Math.max(1 - cardScrollTop / 600, 0.45)
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent"></div>

              {/* Controls Bar inside Hero */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase shadow-sm truncate max-w-[170px] sm:max-w-none ${selectedPkg.badgeColor}`}>
                    {selectedPkg.badge}
                  </span>
                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold whitespace-nowrap shrink-0">
                    {selectedPkg.duration}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCloseSheet}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/25 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90"
                    aria-label="Close Card"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Title & Subtitle Overlay */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 text-white pb-1">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-md">
                  {selectedPkg.title}
                </h2>
                <p className="text-xs sm:text-sm text-amber-200 font-semibold truncate mt-1 drop-shadow">
                  🛕 {selectedPkg.subtitle}
                </p>
              </div>
            </div>

            {/* CONTENT SHEET BELOW IMAGE */}
            <div className="relative z-10 bg-white rounded-t-3xl shadow-[0_-10px_25px_rgba(15,23,42,0.12)] border-t border-amber-100 mt-0 p-3.5 sm:p-6 md:p-8 flex flex-col justify-between overflow-x-hidden">
              {/* Quick Info Header Bar: Price & Book Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 mb-3 gap-2.5 sm:gap-4 shrink-0">
                <div className="flex items-center justify-between sm:block">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                    All-Inclusive Devsthan Package
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{selectedPkg.price}</span>
                    <span className="text-[11px] font-medium text-slate-500">/ person</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                     href={`/customize-package?package=${encodeURIComponent(selectedPkg.id || 'chardham')}`}
                    className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">tune</span>
                    <span>Customize</span>
                  </a>
                  <a
                     href={`/packages/checkout?package=${encodeURIComponent(selectedPkg.id || 'chardham')}`}
                    className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Yatra</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </div>

              {/* Highlights Snippet */}
              <div className="mb-3 shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {selectedPkg.highlights.slice(0, 4).map((hl, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg text-[11px] font-semibold border border-amber-200/60"
                    >
                      <span className="material-symbols-outlined text-[13px] text-amber-600">verified</span>
                      <span>{hl}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Day 1 Teaser Snippet */}
              {selectedPkg.itinerary && selectedPkg.itinerary.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 mb-3 text-xs shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-extrabold text-[10px] shrink-0">
                        {selectedPkg.itinerary[0].day}
                      </span>
                      <span className="font-bold text-slate-900 truncate">{selectedPkg.itinerary[0].title}</span>
                    </div>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded shrink-0 ml-1">
                      +{selectedPkg.itinerary.length - 1} More Days
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-1 text-[11px]">{selectedPkg.itinerary[0].desc}</p>
                </div>
              )}

              {/* SCROLL UP TO SCALE PROMPT */}
              {sheetState === 'collapsed' ? (
                <div
                  onClick={handleExpandFullWindow}
                  className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between cursor-pointer group bg-gradient-to-r from-amber-50 via-amber-50/50 to-white px-3 sm:px-4 py-2 rounded-2xl border border-amber-200/80 transition-all shadow-sm shrink-0 gap-2"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-amber-900 min-w-0">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-amber-600 animate-bounce shrink-0">
                      arrow_upward
                    </span>
                    <span className="hidden sm:inline truncate">Scroll down or tap to expand full itinerary</span>
                    <span className="sm:hidden truncate">Tap to expand full plan</span>
                  </div>
                  <span className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-[11px] sm:text-xs font-extrabold group-hover:scale-105 transition-transform shadow-sm shrink-0">
                    EXPAND
                  </span>
                </div>
              ) : (
                /* TABBED SYSTEM FOR SPIRITUAL CIRCUIT */
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-6">
                  {/* Tab Navigation Switcher */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1 font-bold text-xs overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setActiveTab('itinerary')}
                      className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs whitespace-nowrap sm:whitespace-normal ${
                        activeTab === 'itinerary'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">calendar_month</span>
                      <span className="hidden sm:inline">Day-by-Day Yatra Plan ({selectedPkg.itinerary.length} Days)</span>
                      <span className="sm:hidden">Plan ({selectedPkg.itinerary.length}D)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs whitespace-nowrap sm:whitespace-normal ${
                        activeTab === 'summary'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">temple_hindu</span>
                      <span className="hidden sm:inline">Short Summary &amp; Stays</span>
                      <span className="sm:hidden">Summary</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('inclusions')}
                      className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs whitespace-nowrap sm:whitespace-normal ${
                        activeTab === 'inclusions'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">verified</span>
                      <span className="hidden sm:inline">Inclusions &amp; VIP Pass</span>
                      <span className="sm:hidden">Inclusions</span>
                    </button>
                  </div>

                  {/* TAB 1: COMPLETE DAY-BY-DAY DETAILED ITINERARY */}
                  {activeTab === 'itinerary' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-slate-900 font-serif">
                        Complete Day-by-Day Spiritual Itinerary ({selectedPkg.duration})
                      </h3>
                      {selectedPkg.itinerary.map((dayItem, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 text-xs sm:text-sm flex flex-col sm:flex-row gap-3.5 items-start hover:border-amber-400 transition-colors"
                        >
                          <span className="px-3 py-1 rounded-xl bg-amber-600 text-white font-extrabold text-xs shrink-0">
                            {dayItem.day}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-900 mb-1 text-sm">{dayItem.title}</h4>
                            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{dayItem.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 2: SHORT SUMMARY & HOTEL STAYS */}
                  {activeTab === 'summary' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                        <h4 className="text-sm font-bold text-amber-900 mb-2 font-serif flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">temple_hindu</span>
                          <span>Spiritual Yatra Summary</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-amber-950 leading-relaxed mb-3">{selectedPkg.shortPlan}</p>

                        <div className="space-y-2 text-xs text-amber-900 pt-2 border-t border-amber-200/60">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">directions_bus</span>
                            <span><strong>AC Bus Transit:</strong> {selectedPkg.transitInfo}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">restaurant</span>
                            <span><strong>Meals:</strong> {selectedPkg.meals}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">hotel</span>
                            <span><strong>Accommodations:</strong> {selectedPkg.stayInfo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INCLUSIONS & VIP PASS */}
                  {activeTab === 'inclusions' && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-slate-900 text-white">
                        <h4 className="text-sm font-bold text-amber-300 mb-3 font-serif flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>What is Included in Your Devsthan Yatra</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                          {selectedPkg.inclusions.map((inc, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[16px] text-amber-400 shrink-0 mt-0.5">check_circle</span>
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedPkg.exclusions && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950">
                          <h4 className="font-bold mb-2 text-red-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-red-600">cancel</span>
                            <span>Yatra Exclusions</span>
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-slate-700">
                            {selectedPkg.exclusions.map((exc, i) => (
                              <li key={i}>{exc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer Controls (Commented out as requested)
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleDownsizeToPeek}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined text-[16px]">south</span>
                      <span>Downsize Card</span>
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      onClick={handleCloseSheet}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                      <span>Close Card</span>
                    </button>
                  </div>
                  */}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
