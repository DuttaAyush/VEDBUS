'use client';

import React, { useState, useEffect, useRef } from 'react';

const domesticData = [
  {
    id: 'statue-of-unity',
    title: 'Statue of Unity & Sardar Sarovar',
    subtitle: 'World’s Tallest Statue • Valley of Flowers • Laser Show',
    badge: 'Monumental Heritage',
    badgeColor: 'bg-emerald-600 text-white',
    duration: '5 Days / 4 Nights',
    price: '₹51,999',
    perPerson: 'per person',
    image: '/images/statue_of_unity.jpg',
    transitInfo: 'Dedicated AC Tourist Coach ex-Nagpur with dual drivers & planned rest stops (Approx. 1,400–1,500 km round trip).',
    stayInfo: 'Premium 3-Star/4-Star Resort near Kevadia / Ekta Nagar with picturesque Narmada river views.',
    meals: 'Daily Buffet Breakfast & Regional Pure Veg / Gujarati Dinner included.',
    highlights: [
      'Statue of Unity Viewing Gallery Ticket (153m elevation)',
      'Sardar Sarovar Dam Viewpoint & Valley of Flowers Tour',
      'Evening Grand High-Tech Laser Projection Show on Statue',
      'Jungle Safari, Cactus Garden & Ekta Glow Garden Walk',
    ],
    shortPlan:
      'Explore the architectural marvel of the world’s tallest statue from Nagpur. Includes AC tourist coach transit, 3-star hotel stay in Ekta Nagar, entry tickets with viewing gallery pass, and the evening sound-and-light laser show.',
    itinerary: [
      { day: 'Day 1', title: 'Nagpur Departure towards Gujarat', desc: 'Morning departure from Nagpur by AC tourist coach via Amravati and Dhule corridor with scheduled meal and refreshment stops.' },
      { day: 'Day 2', title: 'Arrival at Kevadia / Ekta Nagar', desc: 'Morning arrival at Ekta Nagar. Hotel check-in and relaxation. Afternoon leisure walk along Narmada riverbank, visit Cactus Garden and Butterfly Park.' },
      { day: 'Day 3', title: 'Statue of Unity & Evening Laser Show', desc: 'Full day excursion at Statue of Unity: High-speed elevator to viewing gallery, museum, Sardar Sarovar Dam viewpoint, and the breathtaking evening laser show.' },
      { day: 'Day 4', title: 'Valley of Flowers & Return Departure', desc: 'Morning visit to Valley of Flowers, Ekta Nursery and Jungle Safari. Afternoon check-out and commencement of return journey towards Nagpur.' },
      { day: 'Day 5', title: 'Arrival back in Nagpur', desc: 'Daytime scenic travel across Maharashtra and afternoon/evening arrival at Nagpur departure hub.' },
    ],
    inclusions: [
      'Round-Trip AC Tourist Coach Transit ex-Nagpur',
      '2 Nights Hotel Stay in Kevadia / Ekta Nagar',
      'Statue of Unity Express Entry & Viewing Gallery Pass',
      'Daily Buffet Breakfast & Dinner',
      'All Intercity Tolls, Parking & Driver Charges',
    ],
    exclusions: ['Optional Electric Golf Cart Inside Complex', 'Personal Souvenirs'],
  },
  {
    id: 'jaipur-heritage',
    title: 'Jaipur – Royal Pink City Heritage',
    subtitle: 'Amer Fort • Hawa Mahal • City Palace • Chokhi Dhani',
    badge: 'Royal Palace Heritage',
    badgeColor: 'bg-amber-600 text-white',
    duration: '5 Days / 4 Nights',
    price: '₹52,499',
    perPerson: 'per person',
    image: '/images/jaipur_hawa_mahal.jpg',
    transitInfo: 'Luxury AC Tourist Coach ex-Nagpur via National Highway with dual commercial drivers (Approx. 1,900–2,100 km round trip).',
    stayInfo: '4-Star Rajasthani Heritage Hotel in Jaipur featuring courtyards, swimming pool, and folk dance.',
    meals: 'Daily Buffet Breakfast & Authentic Rajasthani Thali Dinners (Dal Baati Churma).',
    highlights: [
      'Amer Fort Guided Excursion & Elephant/Jeep Ascent',
      'City Palace Royal Residence & Museum Walk',
      'Hawa Mahal & Jal Mahal Iconic Photo Stops',
      'Jantar Mantar UNESCO Astronomical Observatory',
      'Chokhi Dhani Cultural Village Evening with Traditional Feast',
    ],
    shortPlan:
      'Immerse in the grandeur of Rajasthan with our curated Nagpur-to-Jaipur tour. Features 4-star heritage stay, guided fort excursions, iconic palace visits, and a traditional cultural village evening at Chokhi Dhani.',
    itinerary: [
      { day: 'Day 1', title: 'Nagpur Departure to Jaipur', desc: 'Morning boarding from Nagpur by AC Tourist Coach. Highway journey across central India with regular meal stops and scenic countryside views.' },
      { day: 'Day 2', title: 'Arrival in Jaipur & Evening Bazaar', desc: 'Midday arrival in Jaipur. Hotel check-in and refresh. Evening visit to Birla Temple and guided walk through colourful Johari & Bapu Bazaars.' },
      { day: 'Day 3', title: 'Amer Fort & Royal Palaces', desc: 'Full day sightseeing: Majestic Amer Fort atop Cheel ka Teela, photo point at Jal Mahal, City Palace complex, and Jantar Mantar solar observatory.' },
      { day: 'Day 4', title: 'Hawa Mahal & Chokhi Dhani Village', desc: 'Morning visit to Hawa Mahal facade and Albert Hall Museum. Evening excursion to Chokhi Dhani for camel rides, puppet shows, and royal Rajasthani dinner.' },
      { day: 'Day 5', title: 'Shopping & Return to Nagpur', desc: 'Breakfast, souvenir shopping for Jaipuri quilts and blue pottery, followed by return highway journey towards Nagpur.' },
    ],
    inclusions: [
      'Round-Trip AC Highway Coach Transit ex-Nagpur',
      '3 Nights 4-Star Heritage Hotel Stay in Jaipur',
      'Daily Buffet Breakfast & Dinners',
      'Chokhi Dhani Village Entry & Royal Feast',
      'All Entry Tickets, Parking & State Tolls',
    ],
    exclusions: ['Camera & Video Permits at Forts', 'Personal Tipping & Laundry'],
  },
  {
    id: 'kashmir-paradise',
    title: 'Srinagar & Kashmir Valley Paradise',
    subtitle: 'Dal Lake Shikara • Gulmarg Gondola • Pahalgam Valleys',
    badge: 'Himalayan Paradise',
    badgeColor: 'bg-emerald-600 text-white',
    duration: '9 Days / 8 Nights',
    price: '₹54,999',
    perPerson: 'per person',
    image: '/images/kashmir_dal_lake.jpg',
    transitInfo: 'AC Sleeper Coach ex-Nagpur up to Jammu/Srinagar + Local Kashmiri deluxe tempo traveller / SUV for valley sightseeing.',
    stayInfo: '1 Night Luxury Dal Lake Houseboat + 4 Nights Premium Valley Resorts in Srinagar and Pahalgam.',
    meals: 'Daily Buffet Breakfast & Authentic Kashmiri Wazwan / Pure Veg Dinners.',
    highlights: [
      'Sunset Shikara Ride on Dal Lake with Floating Gardens',
      'Gulmarg Gondola Cable Car Ride to Snow Peaks',
      'Betaab Valley, Aru Valley & Chandanwari in Pahalgam',
      'Mughal Gardens: Shalimar Bagh & Nishat Bagh Guided Tour',
      'Authentic Kashmiri Saffron & Pashmina Craft Shopping',
    ],
    shortPlan:
      'The ultimate Himalayan escape from Nagpur to the crown of India. Experience staying on a heritage Dal Lake houseboat, riding the world-famous Gulmarg Gondola, and exploring the pine forests of Pahalgam.',
    itinerary: [
      { day: 'Day 1–2', title: 'Nagpur to Kashmir Gateway', desc: 'Departure from Nagpur by AC Sleeper Coach. Travel across central and northern India via Delhi-Jammu expressway with scheduled rest stops.' },
      { day: 'Day 3', title: 'Scenic Tunnel Crossing to Srinagar', desc: 'Ascent through Banihal Tunnel into the Kashmir Valley. Check-in to luxury Dal Lake houseboat and evening relaxation with Kashmiri Kahwa.' },
      { day: 'Day 4', title: 'Srinagar Mughal Gardens & Shikara', desc: 'Visit Shalimar Bagh, Nishat Bagh, and Shankaracharya Temple. Sunset 2-hour Shikara boat cruise past the floating vegetable market.' },
      { day: 'Day 5', title: 'Gulmarg Snow Mountain Excursion', desc: 'Full day excursion to Gulmarg (Meadow of Flowers). Take the Gondola cable car up to Apharwat peak for snow views and pine trail walks.' },
      { day: 'Day 6', title: 'Pahalgam Valley of Shepherds', desc: 'Scenic drive along Lidder River to Pahalgam. Excursion to Betaab Valley and Chandanwari. Evening bonfire at riverside resort.' },
      { day: 'Day 7', title: 'Pahalgam to Srinagar Heritage', desc: 'Morning leisure in Pahalgam pine woods. Return drive to Srinagar with stops at saffron fields of Pampore and dry fruit cooperative.' },
      { day: 'Day 8–9', title: 'Return Transit to Nagpur', desc: 'Departure from Kashmir on return highway journey towards Nagpur, arriving on Day 9 with cherished Himalayan memories.' },
    ],
    inclusions: [
      'AC Sleeper Coach Transit + Local Kashmiri Valley Transport',
      '1 Night Deluxe Dal Lake Houseboat + 4 Nights Resort Stays',
      'Daily Breakfast & Dinner with Veg & Jain Options',
      '1-Hour Complimentary Dal Lake Shikara Ride',
      'All Border Permits, Tolls & Parking Charges',
    ],
    exclusions: ['Gulmarg Gondola Phase 2 Ticket (~₹950)', 'Pony / Horse Riding in Pahalgam'],
  },
  {
    id: 'munnar-kerala',
    title: 'Munnar & Kerala Green Trails',
    subtitle: 'Tea Hills • Eravikulam Sanctuary • Mattupetty Dam',
    badge: 'Misty Hill Station',
    badgeColor: 'bg-emerald-600 text-white',
    duration: '8 Days / 7 Nights',
    price: '₹58,500',
    perPerson: 'per person',
    image: '/images/munnar_tea_gardens.jpg',
    transitInfo: 'Comfortable AC Highway Coach ex-Nagpur across southern highways (Approx. 2,800–3,000 km round trip).',
    stayInfo: 'Hilltop Tea Plantation Resort in Munnar + Kochi Heritage Hotel with modern amenities.',
    meals: 'Daily South Indian & Multi-cuisine Buffet Breakfast & Chef-special Dinners.',
    highlights: [
      'Munnar Endless Rolling Tea Plantations & Tea Museum',
      'Eravikulam National Park (Home of Endangered Nilgiri Tahr)',
      'Mattupetty Dam Boating & Echo Point Mountain Acoustics',
      'Guided Spice Plantation Walk with Naturalist',
      'Traditional Kathakali & Kalaripayattu Cultural Performance',
    ],
    shortPlan:
      'Immerse yourself in God’s Own Country with our direct coach tour from Nagpur to Munnar. Walk through aromatic spice gardens, explore mist-shrouded tea estates, and witness Kerala’s world-renowned cultural arts.',
    itinerary: [
      { day: 'Day 1–2', title: 'Nagpur Departure towards Kerala', desc: 'Morning departure from Nagpur by AC coach. Travel southwards across Maharashtra, Telangana and Tamil Nadu with regular rest stops.' },
      { day: 'Day 3', title: 'Ascent to Munnar Hill Station', desc: 'Scenic climb through Western Ghats past Cheeyappara and Valara waterfalls. Check-in to tea garden resort in Munnar.' },
      { day: 'Day 4', title: 'Eravikulam National Park & Tea Museum', desc: 'Morning visit to Rajamalai in Eravikulam National Park to spot Nilgiri Tahr. Afternoon tour of Munnar Tea Museum with tea-making demonstration.' },
      { day: 'Day 5', title: 'Mattupetty Dam & Spice Gardens', desc: 'Sightseeing at Mattupetty Dam, Echo Point, and Kundala Lake. Afternoon guided walk through cardamom, pepper, and cinnamon plantations.' },
      { day: 'Day 6', title: 'Cultural Show & Kochi Foothills', desc: 'Experience a captivating live Kathakali dance and Kalaripayattu martial arts show. Afternoon transfer towards Kochi foothills hotel.' },
      { day: 'Day 7–8', title: 'Return Transit to Nagpur', desc: 'Check-out after breakfast and commence return highway journey back to Nagpur, arriving on Day 8.' },
    ],
    inclusions: [
      'Round-Trip AC Coach Transit ex-Nagpur',
      '4 Nights Deluxe Resort Accommodations in Kerala',
      'Daily Buffet Breakfast & Dinner',
      'Spice Plantation Tour & Tea Museum Entry Ticket',
      'All Highway Tolls, Parking & Driver Allowances',
    ],
    exclusions: ['Mattupetty Speedboat Hire', 'Personal Ayurvedic Massage Treatments'],
  },
];

export default function DomesticPackages() {
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [sheetState, setSheetState] = useState('collapsed');
  const [activeTab, setActiveTab] = useState('itinerary');
  const [isClosing, setIsClosing] = useState(false);
  const [cardScrollTop, setCardScrollTop] = useState(0);
  const packages = domesticData;

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
    <section className="w-full py-16 bg-white border-b border-slate-200 scroll-mt-28 sm:scroll-mt-32" id="domesticPackagesSection">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              <span className="material-symbols-outlined text-[16px]">landscape</span>
              WEEKEND ESCAPES &amp; SAFARIS
            </div>
            <h2 className="text-2xl md:text-3xl text-slate-900 tracking-tight font-serif font-semibold">
              Curated Leisure &amp; Holiday Tours
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Handcrafted all-inclusive domestic holidays, hill stations, coastal escapes, and wildlife sanctuaries across India with luxury bus transit and boutique stays. Click any card to preview.
            </p>
          </div>
          <div>
            <a
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              href="/domestic"
            >
              <span>View all holiday getaways</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => handleOpenSheet(pkg)}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 transition-all duration-300 flex flex-col group cursor-pointer active:scale-[0.99]"
            >
              <div className="relative h-28 sm:h-40 md:h-48 w-full overflow-hidden bg-slate-100">
                <img
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={pkg.image}
                />
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg bg-slate-900/80 text-white font-bold text-[9px] sm:text-xs">
                  {pkg.duration}
                </span>
                <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-950/80 text-white text-[9px] sm:text-xs font-medium truncate flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-emerald-400">landscape</span>
                  <span className="truncate">{pkg.subtitle}</span>
                </div>
              </div>

              <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] sm:text-xs font-bold text-emerald-600 block mb-0.5 sm:mb-1 truncate">{pkg.badge}</span>
                  <h3 className="text-xs sm:text-base font-bold font-serif text-slate-900 mb-1 sm:mb-1.5 group-hover:text-emerald-700 transition-colors line-clamp-1 sm:line-clamp-2">
                    {pkg.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed mb-1.5 sm:mb-3 line-clamp-1 sm:line-clamp-2">{pkg.shortPlan}</p>
                </div>
                <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-[8px] sm:text-[10px] text-slate-400 block font-medium">Package from</span>
                    <div className="flex items-baseline gap-0.5 sm:gap-1">
                      <span className="text-sm sm:text-xl font-extrabold text-brand-scarlet">{pkg.price}</span>
                      <span className="text-[9px] sm:text-[11px] text-slate-400">/person</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSheet(pkg);
                    }}
                    className="px-2.5 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-xs rounded-lg sm:rounded-xl bg-slate-900 hover:bg-brand-scarlet text-white font-bold transition-colors shrink-0"
                    type="button"
                  >
                    Explore Package
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          DOMESTIC HOLIDAY 2D EXPANSION & 82.5% VH SCROLL CARD SHEET
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
            className={`bg-white rounded-3xl shadow-2xl border border-slate-200/80 transition-all duration-500 ease-out flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar pb-[2.5vh] mb-[2.5vh] ${
              sheetState === 'collapsed'
                ? 'w-[94vw] sm:w-[90vw] max-w-2xl sm:w-[660px] h-[500px] sm:h-[530px] translate-y-0 shadow-emerald-900/15'
                : 'w-[94vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] max-w-5xl h-[85vh] sm:h-[82.5vh] max-h-[85vh] sm:max-h-[82.5vh] shadow-2xl ring-1 ring-slate-900/10'
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

              {/* Controls Bar */}
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
                <p className="text-xs sm:text-sm text-emerald-200 font-semibold truncate mt-1 drop-shadow">
                  🏔️ {selectedPkg.subtitle}
                </p>
              </div>
            </div>

            {/* CONTENT SHEET BELOW IMAGE */}
            <div className="relative z-10 bg-white rounded-t-3xl shadow-[0_-10px_25px_rgba(15,23,42,0.12)] border-t border-slate-100 mt-0 p-3.5 sm:p-6 md:p-8 flex flex-col justify-between overflow-x-hidden">
              {/* Quick Info Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 mb-3 gap-2.5 sm:gap-4 shrink-0">
                <div className="flex items-center justify-between sm:block">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                    All-Inclusive Holiday Rate
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{selectedPkg.price}</span>
                    <span className="text-[11px] font-medium text-slate-500">/ person</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                     href={`/customize-package?package=${encodeURIComponent(selectedPkg.id)}`}
                    className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">tune</span>
                    <span>Customize</span>
                  </a>
                  <a
                     href={`/packages/checkout?package=${encodeURIComponent(selectedPkg.id)}`}
                    className="flex-1 sm:flex-none justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Package</span>
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 rounded-lg text-[11px] font-semibold border border-emerald-200/60"
                    >
                      <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
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
                      <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-extrabold text-[10px] shrink-0">
                        {selectedPkg.itinerary[0].day}
                      </span>
                      <span className="font-bold text-slate-900 truncate">{selectedPkg.itinerary[0].title}</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded shrink-0 ml-1">
                      +{selectedPkg.itinerary.length - 1} More Days
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-1 text-[11px]">{selectedPkg.itinerary[0].desc}</p>
                </div>
              )}

              {/* SCROLL PROMPT */}
              {sheetState === 'collapsed' ? (
                <div
                  onClick={handleExpandFullWindow}
                  className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between cursor-pointer group bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-white px-3 sm:px-4 py-2 rounded-2xl border border-emerald-200/80 transition-all shadow-sm shrink-0 gap-2"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-emerald-900 min-w-0">
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-emerald-600 animate-bounce shrink-0">
                      arrow_upward
                    </span>
                    <span className="hidden sm:inline truncate">Scroll down or tap to expand full itinerary</span>
                    <span className="sm:hidden truncate">Tap to expand full plan</span>
                  </div>
                  <span className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-[11px] sm:text-xs font-extrabold group-hover:scale-105 transition-transform shadow-sm shrink-0">
                    EXPAND
                  </span>
                </div>
              ) : (
                /* TABBED SYSTEM FOR DOMESTIC HOLIDAY */
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-6">
                  {/* Tab Navigation Switcher */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1 font-bold text-xs overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setActiveTab('itinerary')}
                      className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs whitespace-nowrap sm:whitespace-normal ${
                        activeTab === 'itinerary'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">calendar_month</span>
                      <span className="hidden sm:inline">Day-by-Day Plan ({selectedPkg.itinerary.length} Days)</span>
                      <span className="sm:hidden">Plan ({selectedPkg.itinerary.length}D)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs whitespace-nowrap sm:whitespace-normal ${
                        activeTab === 'summary'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">hotel</span>
                      <span className="hidden sm:inline">Short Summary &amp; Hotels</span>
                      <span className="sm:hidden">Summary</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('inclusions')}
                      className={`flex-1 min-w-[90px] sm:min-w-0 py-2 px-2 sm:px-3 rounded-xl transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs whitespace-nowrap sm:whitespace-normal ${
                        activeTab === 'inclusions'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px] sm:text-[16px] shrink-0">verified</span>
                      <span className="hidden sm:inline">Inclusions &amp; Bus Transit</span>
                      <span className="sm:hidden">Inclusions</span>
                    </button>
                  </div>

                  {/* TAB 1: COMPLETE DAY-BY-DAY DETAILED ITINERARY */}
                  {activeTab === 'itinerary' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-bold text-slate-900 font-serif">
                        Complete Day-by-Day Travel Plan ({selectedPkg.duration})
                      </h3>
                      {selectedPkg.itinerary.map((dayItem, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 text-xs sm:text-sm flex flex-col sm:flex-row gap-3.5 items-start hover:border-emerald-400 transition-colors"
                        >
                          <span className="px-3 py-1 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shrink-0">
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
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <h4 className="text-sm font-bold text-emerald-900 mb-2 font-serif flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[18px]">landscape</span>
                          <span>Holiday Getaway Overview</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed mb-3">{selectedPkg.shortPlan}</p>

                        <div className="space-y-2 text-xs text-emerald-900 pt-2 border-t border-emerald-200/60">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">directions_bus</span>
                            <span><strong>Bus Transit:</strong> {selectedPkg.transitInfo}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">restaurant</span>
                            <span><strong>Meals:</strong> {selectedPkg.meals}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">hotel</span>
                            <span><strong>Resort Stays:</strong> {selectedPkg.stayInfo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: INCLUSIONS */}
                  {activeTab === 'inclusions' && (
                    <div className="space-y-4">
                      <div className="p-5 rounded-2xl bg-slate-900 text-white">
                        <h4 className="text-sm font-bold text-amber-300 mb-3 font-serif flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                          <span>What is Included in Your Holiday</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
                          {selectedPkg.inclusions.map((inc, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">check_circle</span>
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedPkg.exclusions && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950">
                          <h4 className="font-bold mb-2 text-red-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-red-600">cancel</span>
                            <span>Package Exclusions</span>
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
