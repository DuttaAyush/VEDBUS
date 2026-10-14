'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DatePickerPopover from '@/components/ui/DatePickerPopover';

const spiritualOrigins = [
  { city: 'Nagpur', state: 'Maharashtra', desc: 'Direct AC Sleeper' },
  { city: 'Pune', state: 'Maharashtra', desc: 'Swargate / Wakad' },
  { city: 'Mumbai', state: 'Maharashtra', desc: 'Dadar / Borivali' },
  { city: 'Delhi', state: 'NCR', desc: 'Kashmere Gate' },
  { city: 'Varanasi', state: 'Uttar Pradesh', desc: 'Cantt Depot' },
  { city: 'Haridwar', state: 'Uttarakhand', desc: 'Ganga Ghat' },
  { city: 'Lucknow', state: 'Uttar Pradesh', desc: 'Charbagh' },
  { city: 'Bengaluru', state: 'Karnataka', desc: 'Majestic / Shantinagar' },
  { city: 'Hyderabad', state: 'Telangana', desc: 'MGBS Corridor' },
  { city: 'Ahmedabad', state: 'Gujarat', desc: 'Geeta Mandir' },
  { city: 'Indore', state: 'Madhya Pradesh', desc: 'Sarwate / Vijay Nagar' },
  { city: 'Ayodhya', state: 'Uttar Pradesh', desc: 'Dham Special' },
];

const spiritualDestinations = [
  { name: 'Varanasi & Ayodhya Ram Mandir', state: 'Uttar Pradesh', badge: 'VIP Darshan Pass', duration: '4 Days / 3 Nights' },
  { name: 'Char Dham Yatra & Haridwar Special', state: 'Uttarakhand', badge: 'Kedarnath • Badrinath', duration: '10 Days / 9 Nights' },
  { name: 'Shirdi Sai Baba & Shani Shingnapur', state: 'Maharashtra', badge: 'Kakad Aarti Sync', duration: '2 Days / 1 Night' },
  { name: 'Maharashtra 5 Jyotirlinga Circuit', state: 'Maharashtra', badge: 'Trimbak • Bhimashankar', duration: '7 Days / 6 Nights' },
  { name: 'Tirupati Balaji & Meenakshi Amman', state: 'South India', badge: 'Special Entry Darshan', duration: '5 Days / 4 Nights' },
  { name: 'Gujarat Somnath-Dwarka & Nageshwar', state: 'Gujarat', badge: 'Jyotirlinga & Krishna Dham', duration: '6 Days / 5 Nights' },
  { name: 'Ujjain Mahakaleshwar & Omkareshwar', state: 'Madhya Pradesh', badge: 'Bhasma Aarti Assist', duration: '3 Days / 2 Nights' },
  { name: 'Jagannath Puri & Konark Sun Temple', state: 'Odisha', badge: 'Chariot & Sea Snan', duration: '4 Days / 3 Nights' },
  { name: 'Rameswaram & Madurai Meenakshi', state: 'Tamil Nadu', badge: '22 Theertham Snan', duration: '5 Days / 4 Nights' },
  { name: 'Rishikesh & Haridwar Ganga Aarti', state: 'Uttarakhand', badge: 'Triveni Ghat Assist', duration: '3 Days / 2 Nights' },
];

export default function SpiritualHero() {
  const router = useRouter();
  const searchContainerRef = useRef(null);
  const [fromCity, setFromCity] = useState('Nagpur');
  const [devsthan, setDevsthan] = useState('Varanasi & Ayodhya');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [passengers, setPassengers] = useState(2);
  const [selectedDate, setSelectedDate] = useState({
    mainText: 'Tomorrow, 24 Oct',
    subText: 'Festival Special'
  });
  const [scrollScale, setScrollScale] = useState(1);
  const [textY, setTextY] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [isLoaded, setIsLoaded] = useState(true);

  const getFilteredSpiritualOrigins = () => {
    const q = fromCity.trim().toLowerCase();
    const exact = spiritualOrigins.some(c => c.city.toLowerCase() === q);
    if (!q || exact) return spiritualOrigins;
    const matches = spiritualOrigins.filter(c => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
    if (matches.length >= 4) return matches;
    const others = spiritualOrigins.filter(c => !matches.some(m => m.city === c.city));
    return [...matches, ...others].slice(0, 8);
  };

  const getFilteredSpiritualDestinations = () => {
    const q = devsthan.trim().toLowerCase();
    const exact = spiritualDestinations.some(d => d.name.toLowerCase() === q || d.name.toLowerCase().startsWith(q));
    if (!q || exact) return spiritualDestinations;
    const matches = spiritualDestinations.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) || d.badge.toLowerCase().includes(q));
    if (matches.length >= 4) return matches;
    const others = spiritualDestinations.filter(d => !matches.some(m => m.name === d.name));
    return [...matches, ...others].slice(0, 8);
  };

  useEffect(() => {
    setIsLoaded(true);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const calculatedScale = 1 + Math.min(Math.max(scrollY, 0) / 800, 1) * 0.25;
          const calculatedY = Math.min(Math.max(scrollY, 0) * 0.35, 150);
          const calculatedOpacity = Math.max(1 - Math.max(scrollY, 0) / 550, 0);

          setScrollScale(calculatedScale);
          setTextY(calculatedY);
          setTextOpacity(calculatedOpacity);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsFromOpen(false);
        setIsToOpen(false);
        setIsPassengerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (dateResult) => {
    setSelectedDate({
      mainText: dateResult.mainText,
      subText: dateResult.subText,
    });
  };

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(devsthan);
    setDevsthan(temp);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsFromOpen(false);
    setIsToOpen(false);
    setIsPassengerOpen(false);
    const destination = devsthan.trim() || 'Varanasi';
    const params = new URLSearchParams({
      from: fromCity.trim() || 'Nagpur',
      to: destination,
      date: selectedDate?.mainText || 'Tomorrow, 24 Oct',
      passengers: String(passengers),
      category: 'Spiritual',
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20 pt-10 w-full sticky top-0 z-0" id="hero">
      <div className="absolute inset-0 z-0">
        <img
          alt="Spiritual Yatra Sacred Darshan Background"
          className="w-full h-full object-cover object-center will-change-transform transition-transform duration-100 ease-out"
          style={{ transform: `scale(${scrollScale})` }}
          src="/images/yatra_dedicated_spiritual_yatra_sacred_darshan_booking_refined_5.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/50 to-amber-950/30 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <div
          style={{
            transform: `translateY(${isLoaded ? textY * 0.7 : 20}px)`,
            opacity: isLoaded ? textOpacity : 0,
            transition: isLoaded && textY > 0
              ? 'transform 0.1s ease-out, opacity 0.1s ease-out'
              : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.05s, opacity 0.8s ease-out 0.05s'
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-200 font-bold text-xs uppercase tracking-wider mb-4 border border-amber-400/30 shadow-lg shadow-amber-950/40"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-300 animate-pulse">temple_hindu</span>
          DIVINE SPIRITUAL DARSHAN &amp; DEVSTHAN YATRAS
        </div>

        <h1
          style={{
            transform: `translateY(${isLoaded ? textY : 35}px)`,
            opacity: isLoaded ? textOpacity : 0,
            transition: isLoaded && textY > 0
              ? 'transform 0.1s ease-out, opacity 0.1s ease-out'
              : 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 0.9s ease-out 0.2s'
          }}
          className="text-3xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight mb-4 max-w-4xl mx-auto drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)] font-serif font-medium"
        >
          India&apos;s Dedicated <span className="bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 bg-clip-text text-transparent font-serif font-medium">Spiritual Yatra</span> &amp; Sacred Darshan Booking
        </h1>

        <p
          style={{
            transform: `translateY(${isLoaded ? textY * 0.85 : 35}px)`,
            opacity: isLoaded ? textOpacity : 0,
            transition: isLoaded && textY > 0
              ? 'transform 0.1s ease-out, opacity 0.1s ease-out'
              : 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.35s, opacity 0.9s ease-out 0.35s'
          }}
          className="text-base md:text-lg text-amber-100/90 max-w-2xl mx-auto mb-8 font-medium drop-shadow-md leading-relaxed"
        >
          Direct AC BharatBenz sleeper buses, guaranteed VIP Darshan passes, pure Satvik meals, and verified temple-proximate stays with assigned bus numbers.
        </p>

        {/* Search Matrix */}
        <div
          ref={searchContainerRef}
          style={{
            transform: `translateY(${isLoaded ? textY * 0.5 : 45}px)`,
            opacity: isLoaded ? textOpacity : 0,
            transition: isLoaded && textY > 0
              ? 'transform 0.1s ease-out, opacity 0.1s ease-out'
              : 'transform 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, opacity 1s ease-out 0.5s'
          }}
          className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-3 md:p-4 max-w-7xl mx-auto mb-6 text-left shadow-2xl relative z-30"
        >
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center">
            {/* 1. FROM CITY FIELD */}
            <div className="relative md:col-span-3 flex items-center bg-slate-950/60 rounded-2xl px-4 py-3 border border-amber-500/20 focus-within:border-amber-400 transition-all">
              <span className="material-symbols-outlined text-amber-400 mr-3 text-[22px] shrink-0">departure_board</span>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/80 cursor-pointer">From City</label>
                <input
                  className="w-full bg-transparent font-bold text-white text-base outline-none p-0 border-0 focus:ring-0 placeholder-white/40"
                  value={fromCity}
                  onFocus={() => {
                    setIsFromOpen(true);
                    setIsToOpen(false);
                    setIsPassengerOpen(false);
                    setIsDatePickerOpen(false);
                  }}
                  onChange={(e) => {
                    setFromCity(e.target.value);
                    setIsFromOpen(true);
                  }}
                  type="text"
                  placeholder="Departure city"
                />
                <p className="text-[11px] text-amber-200/60 truncate">Dharampeth, Chatrapati Sq</p>
              </div>

              {/* FROM AUTOCOMPLETE DROPDOWN */}
              {isFromOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 text-left animate-fadeIn"
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/80 px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                    <span>Select Boarding City</span>
                    <span className="text-[9px] text-amber-200/50">{getFilteredSpiritualOrigins().length} Cities</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    {getFilteredSpiritualOrigins().map((item) => (
                      <button
                        key={item.city}
                        type="button"
                        onClick={() => {
                          setFromCity(item.city);
                          setIsFromOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          fromCity.toLowerCase() === item.city.toLowerCase()
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'text-amber-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-amber-400">location_on</span>
                          <div>
                            <span className="block text-xs font-bold leading-none">{item.city}</span>
                            <span className="text-[10px] text-white/50">{item.desc}</span>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-amber-200">{item.state}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SWAP BUTTON */}
            <div className="md:col-span-1 flex justify-center -my-3 md:my-0">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-slate-800 border border-amber-500/30 shadow-md flex items-center justify-center text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                title="Swap From and Devsthan"
              >
                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              </button>
            </div>

            {/* 2. DEVSTHAN / DESTINATION FIELD */}
            <div className="relative md:col-span-3 flex items-center bg-slate-950/60 rounded-2xl px-4 py-3 border border-amber-500/20 focus-within:border-amber-400 transition-all">
              <span className="material-symbols-outlined text-amber-400 mr-3 text-[22px] shrink-0">temple_hindu</span>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/80 cursor-pointer">Select Devsthan / Circuit</label>
                <input
                  className="w-full bg-transparent font-bold text-white text-base outline-none p-0 border-0 focus:ring-0 placeholder-white/40"
                  value={devsthan}
                  onFocus={() => {
                    setIsToOpen(true);
                    setIsFromOpen(false);
                    setIsPassengerOpen(false);
                    setIsDatePickerOpen(false);
                  }}
                  onChange={(e) => {
                    setDevsthan(e.target.value);
                    setIsToOpen(true);
                  }}
                  type="text"
                  placeholder="Temple or sacred circuit"
                />
                <p className="text-[11px] text-amber-200/60 truncate">Kashi Vishwanath, Ram Janmabhoomi</p>
              </div>

              {/* DEVSTHAN AUTOCOMPLETE DROPDOWN */}
              {isToOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-80 bg-slate-950/95 backdrop-blur-2xl border border-amber-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 text-left animate-fadeIn"
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/80 px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                    <span>Sacred Teerth Circuits</span>
                    <span className="text-[9px] text-amber-200/50">{getFilteredSpiritualDestinations().length} Options</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    {getFilteredSpiritualDestinations().map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          setDevsthan(item.name);
                          setIsToOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          devsthan.toLowerCase() === item.name.toLowerCase()
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                            : 'text-amber-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-amber-400">temple_hindu</span>
                          <div>
                            <span className="block text-xs font-bold leading-none">{item.name}</span>
                            <span className="text-[10px] text-amber-300/70">{item.duration} • {item.state}</span>
                          </div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. DATE PICKER TRIGGER WITH FLOATING SPEECH BUBBLE */}
            <div
              className={`relative md:col-span-2 flex items-center bg-slate-950/60 hover:bg-amber-950/40 rounded-2xl px-4 py-3 border border-amber-500/20 hover:border-amber-400 cursor-pointer transition-all active:scale-[0.98] ${isDatePickerOpen ? 'z-[9999]' : 'z-10'}`}
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsPassengerOpen(false);
              }}
            >
              <span className="material-symbols-outlined text-amber-400 mr-2.5 text-[22px] shrink-0">calendar_month</span>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/80 cursor-pointer">Yatra Date</label>
                <div className="text-sm font-bold text-white truncate">{selectedDate.mainText}</div>
                <p className="text-[11px] text-amber-400 font-semibold truncate">{selectedDate.subText}</p>
              </div>

              {/* Floating Speech Bubble */}
              <DatePickerPopover
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate.mainText}
                themeColor="amber"
                position="auto"
                defaultPosition="top"
              />
            </div>

            {/* 4. PILGRIMS / DEVOTEES FIELD */}
            <div
              className={`relative md:col-span-1 flex items-center bg-slate-950/60 hover:bg-amber-950/40 rounded-2xl px-3 py-3 border border-amber-500/20 hover:border-amber-400 text-center cursor-pointer transition-all select-none ${isPassengerOpen ? 'z-[9999]' : 'z-10'}`}
              onClick={() => {
                setIsPassengerOpen(!isPassengerOpen);
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsDatePickerOpen(false);
              }}
            >
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-300/80 cursor-pointer">Pilgrims</label>
                <div className="text-xs font-bold text-white truncate">{passengers} {passengers === 1 ? 'Devotee' : 'Devotees'}</div>
                <p className="text-[10px] text-amber-200/60 truncate">{passengers <= 2 ? 'Family' : 'Group Sangha'}</p>
              </div>

              {/* DEVOTEES POPUP */}
              {isPassengerOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Devotees Selection Bubble"
                  className="absolute bottom-full mb-3.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[99999] w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.35)] border border-slate-200/90 p-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left"
                >
                  {/* Speech Bubble Arrow Indicator */}
                  <div className="absolute top-full right-8 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.08)]" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-amber-500">
                        group
                      </span>
                      <span className="font-serif text-sm font-bold text-slate-900">Pilgrims &amp; Devotees</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPassengerOpen(false)}
                      className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>

                  {/* Stepper only */}
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Seats to reserve</span>
                      <span className="text-[10px] text-slate-500">Reserved sacred berths</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-sm text-amber-600 w-6 text-center">{passengers}</span>
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.min(6, passengers + 1))}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. SEARCH BUTTON */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full min-h-[58px] rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all flex items-center justify-center gap-2 font-bold text-xs tracking-wider uppercase shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                <span>FIND YATRAS</span>
              </button>
            </div>
          </form>
        </div>

        {/* Trust Badges Bar */}
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-between gap-3 px-6 py-3.5 bg-amber-950/40 backdrop-blur-md rounded-2xl border border-amber-500/30 text-amber-100 text-xs font-semibold">
          <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-300 text-[18px]">verified</span> Guaranteed VIP Darshan Pass</div>
          <span className="hidden sm:inline text-white/40">•</span>
          <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-300 text-[18px]">restaurant</span> Pure Satvik Dining (No Garlic/Onion)</div>
          <span className="hidden md:inline text-white/40">•</span>
          <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-cyan-300 text-[18px]">airline_seat_recline_extra</span> Real-Time Bus Seat Lock</div>
          <span className="hidden lg:inline text-white/40">•</span>
          <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-pink-300 text-[18px]">support</span> Purohit &amp; Temple Escort Assist</div>
        </div>
      </div>
    </section>
  );
}
