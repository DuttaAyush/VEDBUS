'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DatePickerPopover from '@/components/ui/DatePickerPopover';

const popularCities = [
  { city: 'Nagpur', state: 'Maharashtra', tag: 'Direct Fleet' },
  { city: 'Pune', state: 'Maharashtra', tag: 'Direct Express' },
  { city: 'Mumbai', state: 'Maharashtra', tag: 'Borivali & Dadar' },
  { city: 'Delhi', state: 'NCR', tag: 'Kashmere Gate' },
  { city: 'Haridwar', state: 'Uttarakhand', tag: 'Ganga Ghat' },
  { city: 'Indore', state: 'Madhya Pradesh', tag: 'Vijay Nagar' },
  { city: 'Goa', state: 'Goa', tag: 'Panjim & Mapusa' },
  { city: 'Shirdi', state: 'Maharashtra', tag: 'Mandir Gate 2' },
  { city: 'Bengaluru', state: 'Karnataka', tag: 'Majestic' },
  { city: 'Hyderabad', state: 'Telangana', tag: 'MGBS / Ameerpet' },
  { city: 'Ahmedabad', state: 'Gujarat', tag: 'Paldi Hub' },
  { city: 'Varanasi', state: 'Uttar Pradesh', tag: 'Cantt Depot' },
  { city: 'Jaipur', state: 'Rajasthan', tag: 'Sindhi Camp' },
];

export default function BusHero() {
  const router = useRouter();
  const searchContainerRef = useRef(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [passengers, setPassengers] = useState(2);
  const initialJourneyDate = new Date();
  initialJourneyDate.setDate(initialJourneyDate.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState(() => ({
    mainText: `Tomorrow, ${initialJourneyDate.getDate()} ${initialJourneyDate.toLocaleDateString('en-US', { month: 'short' })}`,
    subText: initialJourneyDate.toLocaleDateString('en-US', { weekday: 'long' }),
    date: initialJourneyDate.toISOString().slice(0, 10),
  }));
  const [fromCity, setFromCity] = useState('Nagpur');
  const [toCity, setToCity] = useState('Pune');
  const [scrollScale, setScrollScale] = useState(1);
  const [textY, setTextY] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [bgOpacity, setBgOpacity] = useState(1);

  const getFilteredFromCities = () => {
    const q = fromCity.trim().toLowerCase();
    const exact = popularCities.some(c => c.city.toLowerCase() === q);
    if (!q || exact) return popularCities;
    const matches = popularCities.filter(c => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
    if (matches.length >= 4) return matches;
    const others = popularCities.filter(c => !matches.some(m => m.city === c.city));
    return [...matches, ...others].slice(0, 8);
  };

  const getFilteredToCities = () => {
    const q = toCity.trim().toLowerCase();
    const exact = popularCities.some(c => c.city.toLowerCase() === q);
    if (!q || exact) return popularCities;
    const matches = popularCities.filter(c => c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q));
    if (matches.length >= 4) return matches;
    const others = popularCities.filter(c => !matches.some(m => m.city === c.city));
    return [...matches, ...others].slice(0, 8);
  };

  const handleSwap = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

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

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const calculatedScale = 1 + Math.min(Math.max(scrollY, 0) / 800, 1) * 0.25;
          const calculatedY = Math.min(Math.max(scrollY, 0) * 0.35, 150);
          const calculatedOpacity = Math.max(1 - Math.max(scrollY, 0) / 450, 0);
          const calculatedBgOpacity = Math.max(1 - Math.max(scrollY - 500, 0) / 400, 0);

          setScrollScale(calculatedScale);
          setTextY(calculatedY);
          setTextOpacity(calculatedOpacity);
          setBgOpacity(calculatedBgOpacity);
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

  const handleDateSelect = (dateResult) => {
    setSelectedDate({
      mainText: dateResult.mainText,
      subText: dateResult.subText,
      date: dateResult.date,
    });
  };

  return (
    <section
      className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-2 sm:pt-8 md:pt-10 pb-6 sm:pb-12 md:pb-16 bg-slate-950 sticky top-0 z-0"
      id="heroSearch"
    >
      {/* TAJ MAHAL HERO BACKGROUND IMAGE WITH PARALLAX ZOOM & EXIT FADE */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-150"
        style={{ opacity: bgOpacity }}
      >
        <img
          alt="Ancient Indian Taj Mahal bathed in golden sunrise light"
          className="w-full h-full object-cover object-center will-change-transform transition-transform duration-100 ease-out"
          style={{ transform: `scale(${scrollScale})` }}
          src="/images/domestic-hero.jpg"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        {/* Subtle Bottom Fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div
        className="w-full max-w-[1700px] mx-auto px-2 sm:px-6 lg:px-8 xl:px-12 relative z-10 space-y-3 sm:space-y-8 md:space-y-10"
        style={{
          transform: `translateY(${textY}px)`,
          opacity: textOpacity,
          pointerEvents: textOpacity < 0.05 ? 'none' : 'auto',
          transition: textY > 0 ? 'transform 0.1s ease-out, opacity 0.1s ease-out' : undefined,
        }}
      >
        {/* LEFT-ALIGNED HERO TEXT CONTENT */}
        <div className="max-w-3xl space-y-2 sm:space-y-4 text-left text-white">
          {/* Tag / Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-[#e5a97d] font-semibold text-[9px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-0.5 sm:mb-2">
            <span className="w-6 sm:w-10 h-[1.5px] bg-[#e5a97d]/80 inline-block"></span>
            <span>BHARAT &amp; SPIRITUAL YATRAS</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white tracking-tight leading-[1.15] sm:leading-[1.1] drop-shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
            Sacred Yatras &amp;
            <br />
            <span className="text-white">Intercity Bus Network</span>
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-[11px] sm:text-base md:text-lg text-slate-100 max-w-2xl font-medium leading-relaxed drop-shadow-md line-clamp-2 sm:line-clamp-none">
            Daily luxury BharatBenz AC sleeper coaches, VIP Temple Darshan passes, verified Satvik dining, and handpicked local escapes across India.
          </p>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-0.5 sm:pt-1">
            <Link
              href="/spiritual"
              className="px-2.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full bg-amber-500/30 backdrop-blur-md border border-amber-300/50 text-amber-200 text-[10px] sm:text-xs font-bold hover:bg-amber-500/40 transition-all shadow-sm"
            >
              🛕 Spiritual Circuits
            </Link>
            <Link
              href="/domestic"
              className="px-2.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full bg-red-500/30 backdrop-blur-md border border-red-300/50 text-red-200 text-[10px] sm:text-xs font-bold hover:bg-red-500/40 transition-all shadow-sm"
            >
              🚍 Bus &amp; Local Escapes
            </Link>
          </div>
        </div>

        {/* ULTRA-TRANSPARENT GLASS SEARCH BAR CAPSULE */}
        <div ref={searchContainerRef} className="w-full max-w-[calc(100vw-1rem)] sm:max-w-6xl mx-auto relative z-30">
          <div className="w-full max-w-[calc(100vw-1rem)] sm:max-w-full rounded-full p-0.5 sm:p-2 md:py-2 md:pl-4 md:pr-4 bg-white/[0.07] backdrop-blur-md border border-white/15 shadow-2xl relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsFromOpen(false);
                setIsToOpen(false);
                setIsPassengerOpen(false);
                const params = new URLSearchParams({
                  from: fromCity.trim() || 'Nagpur',
                  to: toCity.trim() || 'Pune',
                  date: selectedDate.date,
                  passengers: String(passengers),
                });
                router.push(`/search?${params.toString()}`);
              }}
              className="flex flex-row items-center justify-between w-full"
            >
              {/* 1. FROM FIELD */}
              <div className="relative flex-1 min-w-0 px-0.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-2 md:py-2.5 flex items-center gap-1 sm:gap-2 md:gap-3">
                <span className="material-symbols-outlined text-amber-300 text-[13px] sm:text-[20px] md:text-[24px] shrink-0">
                  departure_board
                </span>
                <div className="min-w-0 flex-1">
                  <label className="block text-[7.5px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-300/90 cursor-pointer truncate">
                    FROM
                  </label>
                  <input
                    type="text"
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
                    className="w-full bg-transparent font-medium text-white text-[10.5px] sm:text-sm md:text-base lg:text-lg outline-none border-0 p-0 focus:ring-0 placeholder-white/40 truncate leading-tight sm:leading-snug block"
                    placeholder="From"
                  />
                </div>

                {/* FROM AUTOCOMPLETE DROPDOWN */}
                {isFromOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full left-0 mt-3 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 text-left animate-fadeIn"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/80 px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                      <span>Select Departure City</span>
                      <span className="text-[9px] text-white/50">{getFilteredFromCities().length} cities</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                      {getFilteredFromCities().map((item) => (
                        <button
                          key={item.city}
                          type="button"
                          onClick={() => {
                            setFromCity(item.city);
                            setIsFromOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            fromCity.toLowerCase() === item.city.toLowerCase()
                              ? 'bg-brand-scarlet text-white font-bold shadow-sm'
                              : 'text-white/90 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-300">location_on</span>
                            <div>
                              <span className="block text-xs leading-none">{item.city}</span>
                              <span className="text-[10px] text-white/50">{item.state}</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-amber-200">{item.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CENTER DIVIDER LINE & SWAP ARROW */}
              <div className="flex items-center justify-center relative shrink-0 w-4 sm:w-6 md:w-8 self-stretch">
                <div className="h-3 sm:h-5 md:h-6 w-[1px] bg-white/20 pointer-events-none" />
                <button
                  type="button"
                  onClick={handleSwap}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/25 flex items-center justify-center text-amber-300 hover:text-amber-200 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer z-10"
                  title="Swap From and To"
                >
                  <span className="material-symbols-outlined text-[10px] sm:text-[14px] md:text-[17px]">swap_horiz</span>
                </button>
              </div>

              {/* 2. TO FIELD */}
              <div className="relative flex-1 min-w-0 px-0.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-2 md:py-2.5 flex items-center gap-1 sm:gap-2 md:gap-3">
                <span className="material-symbols-outlined text-amber-300 text-[13px] sm:text-[20px] md:text-[24px] shrink-0">
                  pin_drop
                </span>
                <div className="min-w-0 flex-1">
                  <label className="block text-[7.5px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-300/90 cursor-pointer truncate">
                    TO
                  </label>
                  <input
                    type="text"
                    value={toCity}
                    onFocus={() => {
                      setIsToOpen(true);
                      setIsFromOpen(false);
                      setIsPassengerOpen(false);
                      setIsDatePickerOpen(false);
                    }}
                    onChange={(e) => {
                      setToCity(e.target.value);
                      setIsToOpen(true);
                    }}
                    className="w-full bg-transparent font-medium text-white text-[10.5px] sm:text-sm md:text-base lg:text-lg outline-none border-0 p-0 focus:ring-0 placeholder-white/40 truncate leading-tight sm:leading-snug block"
                    placeholder="To"
                  />
                </div>

                {/* TO AUTOCOMPLETE DROPDOWN */}
                {isToOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-full right-0 sm:right-auto sm:left-0 mt-3 w-64 sm:w-72 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2 z-50 text-left animate-fadeIn"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300/80 px-3 py-1.5 border-b border-white/10 flex items-center justify-between">
                      <span>Select Destination City</span>
                      <span className="text-[9px] text-white/50">{getFilteredToCities().length} cities</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                      {getFilteredToCities().map((item) => (
                        <button
                          key={item.city}
                          type="button"
                          onClick={() => {
                            setToCity(item.city);
                            setIsToOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                            toCity.toLowerCase() === item.city.toLowerCase()
                              ? 'bg-brand-scarlet text-white font-bold shadow-sm'
                              : 'text-white/90 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-amber-300">pin_drop</span>
                            <div>
                              <span className="block text-xs leading-none">{item.city}</span>
                              <span className="text-[10px] text-white/50">{item.state}</span>
                            </div>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-amber-200">{item.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* DIVIDER */}
              <div className="h-3.5 sm:h-5 md:h-6 w-[1px] bg-white/20 shrink-0 mx-0.5 sm:mx-1" />

              {/* 3. DATE OF JOURNEY FIELD */}
              <div
                className={`relative flex-1 min-w-0 px-0.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-2 md:py-2.5 flex items-center gap-1 sm:gap-2 md:gap-3 cursor-pointer hover:bg-white/5 rounded-full transition-all ${
                  isDatePickerOpen ? 'z-[9999]' : 'z-10'
                }`}
                onClick={() => {
                  setIsDatePickerOpen(!isDatePickerOpen);
                  setIsFromOpen(false);
                  setIsToOpen(false);
                  setIsPassengerOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-amber-300 text-[13px] sm:text-[20px] md:text-[24px] shrink-0">
                  calendar_month
                </span>
                <div className="min-w-0 flex-1">
                  <label className="block text-[7.5px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-300/90 cursor-pointer truncate">
                    <span className="sm:hidden">DATE</span>
                    <span className="hidden sm:inline">DATE OF JOURNEY</span>
                  </label>
                  <div className="text-[10.5px] sm:text-sm md:text-base lg:text-lg font-medium text-white truncate leading-tight sm:leading-snug">
                    <span className="hidden sm:inline">{selectedDate.mainText}</span>
                    <span className="sm:hidden">{selectedDate.mainText.replace(/^(Today|Tomorrow),\s*/, '')}</span>
                  </div>
                </div>

                <DatePickerPopover
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onSelectDate={handleDateSelect}
                  selectedDate={selectedDate.mainText}
                  themeColor="red"
                  position="auto"
                  defaultPosition="top"
                />
              </div>

              {/* DIVIDER */}
              <div className="h-3.5 sm:h-5 md:h-6 w-[1px] bg-white/20 shrink-0 mx-0.5 sm:mx-1" />

              {/* 4. PASSENGERS FIELD */}
              <div
                className={`relative flex-1 min-w-0 px-0.5 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-2 md:py-2.5 flex items-center gap-1 sm:gap-2 md:gap-3 cursor-pointer hover:bg-white/5 rounded-full transition-all select-none ${
                  isPassengerOpen ? 'z-[9999]' : 'z-10'
                }`}
                onClick={() => {
                  setIsPassengerOpen(!isPassengerOpen);
                  setIsFromOpen(false);
                  setIsToOpen(false);
                  setIsDatePickerOpen(false);
                }}
              >
                <span className="material-symbols-outlined text-amber-300 text-[13px] sm:text-[20px] md:text-[24px] shrink-0">
                  group
                </span>
                <div className="min-w-0 flex-1">
                  <label className="block text-[7.5px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-300/90 truncate cursor-pointer">
                    <span className="sm:hidden">PAX</span>
                    <span className="hidden sm:inline">PASSENGERS</span>
                  </label>
                  <div className="text-[10.5px] sm:text-sm md:text-base lg:text-lg font-medium text-white truncate leading-tight sm:leading-snug">
                    <span className="hidden sm:inline">{passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}</span>
                    <span className="sm:hidden">{passengers} Pax</span>
                  </div>
                </div>

                {/* PASSENGERS SELECTION POPOVER */}
                {isPassengerOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Passengers Selection Bubble"
                    className="absolute bottom-full mb-3.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[99999] w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.35)] border border-slate-200/90 p-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left"
                  >
                    {/* Speech Bubble Arrow Indicator */}
                    <div className="absolute top-full right-8 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.08)]" />

                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-brand-scarlet">
                          group
                        </span>
                        <span className="font-serif text-sm font-bold text-slate-900">Passengers</span>
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
                        <span className="text-[10px] text-slate-500">Direct coach berths</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setPassengers(Math.max(1, passengers - 1))}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-extrabold text-sm text-brand-scarlet w-6 text-center">{passengers}</span>
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
              <div className="shrink-0 flex-shrink-0 p-0.5 sm:p-1">
                <button
                  type="submit"
                  aria-label="Search buses"
                  className="w-7 h-7 sm:w-9 sm:h-9 md:w-auto md:px-7 md:py-3.5 rounded-full bg-brand-scarlet hover:bg-brand-hover text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center md:gap-2 shadow-lg md:shadow-xl md:shadow-red-600/35 hover:scale-[1.03] active:scale-95 cursor-pointer shrink-0 flex-shrink-0"
                  title="Search buses"
                >
                  <span className="material-symbols-outlined text-[15px] sm:text-[18px] md:text-[20px]">search</span>
                  <span className="hidden md:inline">SEARCH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
