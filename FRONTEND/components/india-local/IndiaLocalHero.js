'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DatePickerPopover from '@/components/ui/DatePickerPopover';

const domesticPackagesList = [
  { id: 'himachal-manali', title: 'Himachal & Manali Mountain Escape', duration: '5 Days / 4 Nights', price: '₹9,499', badge: 'Hill Station', highlight: 'Rohtang Pass • Solang Valley • Kasol' },
  { id: 'kerala-backwaters', title: 'Kerala Backwaters & Munnar Hills', duration: '6 Days / 5 Nights', price: '₹12,850', badge: 'Serene Nature', highlight: 'Alleppey Houseboat • Tea Gardens • Kochi' },
  { id: 'goa-beach', title: 'Goa Beachfront Villa & Catamaran Cruise', duration: '4 Days / 3 Nights', price: '₹7,999', badge: 'Coastal Getaway', highlight: 'Baga & Calangute • Mandovi Cruise • Old Goa' },
  { id: 'jim-corbett', title: 'Jim Corbett & Nainital Lake Paradise', duration: '4 Days / 3 Nights', price: '₹6,999', badge: 'Wildlife Safari', highlight: 'Jeep Safari • Naini Lake Boating • Viewpoint' },
  { id: 'kashmir-paradise', title: 'Kashmir Valley & Dal Lake Shikara', duration: '6 Days / 5 Nights', price: '₹14,499', badge: 'Paradise on Earth', highlight: 'Srinagar Houseboat • Gulmarg Gondola • Pahalgam' },
  { id: 'rajasthan-royal', title: 'Royal Rajasthan Jaipur & Udaipur Forts', duration: '6 Days / 5 Nights', price: '₹11,999', badge: 'Heritage & Palaces', highlight: 'Amber Fort • Lake Pichola • Desert Culture' },
  { id: 'andaman-island', title: 'Andaman Radhanagar Beach & Scuba', duration: '5 Days / 4 Nights', price: '₹19,999', badge: 'Island Paradise', highlight: 'Havelock Island • Cellular Jail • Water Sports' },
  { id: 'meghalaya-hills', title: 'Meghalaya Living Roots & Shillong Hills', duration: '5 Days / 4 Nights', price: '₹13,500', badge: 'Hidden Gem', highlight: 'Cherrapunji Waterfalls • Dawki River • Mawlynnong' },
];

const domesticDepartureCities = [
  { city: 'Mumbai', state: 'Maharashtra', desc: 'Direct Coach & Flight' },
  { city: 'Delhi', state: 'NCR', desc: 'North India Gateway' },
  { city: 'Pune', state: 'Maharashtra', desc: 'Express Corridor' },
  { city: 'Nagpur', state: 'Maharashtra', desc: 'Central Hub' },
  { city: 'Bengaluru', state: 'Karnataka', desc: 'South India Transit' },
  { city: 'Hyderabad', state: 'Telangana', desc: 'Deccan Gateway' },
  { city: 'Ahmedabad', state: 'Gujarat', desc: 'Western Fleet' },
  { city: 'Kolkata', state: 'West Bengal', desc: 'Eastern Gateway' },
];

export default function IndiaLocalHero() {
  const router = useRouter();
  const searchContainerRef = useRef(null);
  const [destination, setDestination] = useState('Goa Beachfront Villa & Catamaran Cruise');
  const [departureFrom, setDepartureFrom] = useState('Mumbai');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isDepartureOpen, setIsDepartureOpen] = useState(false);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [passengers, setPassengers] = useState(2);
  const [selectedDate, setSelectedDate] = useState({
    mainText: 'Nov - Dec 2026',
    subText: 'Winter Getaway'
  });
  const [scrollScale, setScrollScale] = useState(1);
  const [textY, setTextY] = useState(0);
  const [textOpacity, setTextOpacity] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDestinationOpen(false);
        setIsDepartureOpen(false);
        setIsPassengerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 60);

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
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleDateSelect = (dateResult) => {
    setSelectedDate({
      mainText: dateResult.mainText,
      subText: dateResult.subText
    });
  };

  const getFilteredPackages = () => {
    const trimmed = destination.trim().toLowerCase();
    const isSelected = domesticPackagesList.some(p => p.title.toLowerCase() === trimmed);
    if (!trimmed || isSelected) {
      return domesticPackagesList;
    }
    const filtered = domesticPackagesList.filter(p =>
      p.title.toLowerCase().includes(trimmed) || p.highlight.toLowerCase().includes(trimmed)
    );
    return filtered.length > 0 ? filtered : domesticPackagesList;
  };

  const getFilteredDepartureCities = () => {
    const trimmed = departureFrom.trim().toLowerCase();
    const isSelected = domesticDepartureCities.some(c => c.city.toLowerCase() === trimmed);
    if (!trimmed || isSelected) {
      return domesticDepartureCities;
    }
    const filtered = domesticDepartureCities.filter(c =>
      c.city.toLowerCase().includes(trimmed) || c.state.toLowerCase().includes(trimmed)
    );
    return filtered.length > 0 ? filtered : domesticDepartureCities;
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsDestinationOpen(false);
    setIsDepartureOpen(false);
    setIsPassengerOpen(false);
    const query = destination.trim() || 'Goa';
    const params = new URLSearchParams({
      category: 'Domestic',
      q: query,
      from: departureFrom,
      travelers: String(passengers),
    });
    router.push(`/packages?${params.toString()}`);
  };

  return (
    <>
      {/* 1. HERO BANNER */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden pb-20 pt-10 sticky top-0 z-0" id="hero">
        <div className="absolute inset-0 z-0">
          <img
            alt="India Local Scenic Highway Banner"
            className="w-full h-full object-cover object-center will-change-transform transition-transform duration-100 ease-out"
            style={{ transform: `scale(${scrollScale})` }}
            src="/images/yatra_india_local_holiday_travel_packages_1.jpg"
            fetchPriority="high"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-teal-900/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 backdrop-blur-md text-teal-200 font-bold text-xs uppercase tracking-wider mb-4 border border-teal-400/30 shadow-lg shadow-teal-950/40"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-300">landscape</span>
            BHARAT &amp; DOMESTIC HOLIDAY PACKAGES
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
            Discover Beautiful Bharat in <span className="bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-100 bg-clip-text text-transparent font-serif font-medium">Greater Comfort</span>
          </h1>

          <p
            style={{
              transform: `translateY(${isLoaded ? textY * 0.85 : 35}px)`,
              opacity: isLoaded ? textOpacity : 0,
              transition: isLoaded && textY > 0
                ? 'transform 0.1s ease-out, opacity 0.1s ease-out'
                : 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.35s, opacity 0.9s ease-out 0.35s'
            }}
            className="text-base md:text-lg text-teal-100/90 max-w-2xl mx-auto mb-8 font-medium drop-shadow-md leading-relaxed"
          >
            Curated holiday packages across coastal retreats, serene backwaters, and misty Himalayan valleys with luxury sleeper coach connectivity.
          </p>

          <div
            style={{
              transform: `translateY(${isLoaded ? textY * 0.7 : 35}px)`,
              opacity: isLoaded ? textOpacity : 0,
              transition: isLoaded && textY > 0
                ? 'transform 0.1s ease-out, opacity 0.1s ease-out'
                : 'transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.45s, opacity 0.9s ease-out 0.45s'
            }}
            className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-teal-200/90"
          >
            <div className="flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-500/20">
              <span className="text-teal-400">✓</span> 100% Guaranteed Departures
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-500/20">
              <span className="text-teal-400">✓</span> BharatBenz &amp; Volvo AC Coaches
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-500/20">
              <span className="text-teal-400">✓</span> Handpicked 4★ &amp; 5★ Stays
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING SEARCH & FILTER WIDGET */}
      <div className="relative z-20 mx-auto px-4 sm:px-6 -mt-14 mb-12 max-w-7xl lg:px-8 w-full">
        <div ref={searchContainerRef} className="bg-white rounded-3xl shadow-2xl p-3 md:p-4 border border-slate-200/80 relative z-30">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* 1. DESTINATION / DOMESTIC PACKAGE */}
            <div className="relative md:col-span-4 flex items-center bg-slate-50 rounded-2xl px-3.5 py-2.5 border border-slate-200 focus-within:border-teal-600 transition-colors">
              <span className="material-symbols-outlined text-teal-600 text-[20px] mr-2.5 shrink-0">landscape</span>
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer">Curated Package / Destination</label>
                <input
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none truncate"
                  placeholder="Select Package (Goa, Manali, Kerala...)"
                  type="text"
                  value={destination}
                  onFocus={() => {
                    setIsDestinationOpen(true);
                    setIsDepartureOpen(false);
                    setIsPassengerOpen(false);
                    setIsDatePickerOpen(false);
                  }}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setIsDestinationOpen(true);
                  }}
                />
              </div>

              {/* DOMESTIC PACKAGE DROPDOWN */}
              {isDestinationOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 p-2 z-50 text-left animate-fadeIn"
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                    <span>Curated Bharat Holidays</span>
                    <span className="text-[9px] text-slate-400">Direct Fleets</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1 space-y-1 custom-scrollbar">
                    {getFilteredPackages().map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setDestination(pkg.title);
                          setIsDestinationOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          destination.toLowerCase() === pkg.title.toLowerCase()
                            ? 'bg-teal-50 text-teal-900 border border-teal-200'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs truncate">{pkg.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{pkg.highlight}</div>
                          <div className="text-[9px] text-teal-600 font-semibold mt-0.5">{pkg.duration}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-extrabold text-teal-700 block">{pkg.price}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-teal-100/80 text-teal-800">{pkg.badge}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. DEPARTURE CITY */}
            <div className="relative md:col-span-3 flex items-center bg-slate-50 rounded-2xl px-3.5 py-2.5 border border-slate-200 focus-within:border-teal-600 transition-colors">
              <span className="material-symbols-outlined text-teal-600 text-[20px] mr-2.5 shrink-0">location_on</span>
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer">Departure Hub</label>
                <input
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none truncate"
                  type="text"
                  value={departureFrom}
                  onFocus={() => {
                    setIsDepartureOpen(true);
                    setIsDestinationOpen(false);
                    setIsPassengerOpen(false);
                    setIsDatePickerOpen(false);
                  }}
                  onChange={(e) => {
                    setDepartureFrom(e.target.value);
                    setIsDepartureOpen(true);
                  }}
                />
              </div>

              {/* DEPARTURE CITY DROPDOWN */}
              {isDepartureOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 p-2 z-50 text-left animate-fadeIn"
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 px-3 py-1.5 border-b border-slate-100">
                    Select Departure Hub
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1 space-y-0.5 custom-scrollbar">
                    {getFilteredDepartureCities().map((c) => (
                      <button
                        key={c.city}
                        type="button"
                        onClick={() => {
                          setDepartureFrom(c.city);
                          setIsDepartureOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          departureFrom.toLowerCase() === c.city.toLowerCase()
                            ? 'bg-teal-50 text-teal-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <span className="block text-xs font-bold text-slate-900">{c.city}</span>
                          <span className="text-[10px] text-slate-400">{c.desc}</span>
                        </div>
                        <span className="text-[10px] text-teal-600 font-bold">{c.state}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. TRAVEL DATES PICKER */}
            <div
              className="md:col-span-2 flex items-center bg-slate-50 rounded-2xl px-3.5 py-2.5 border border-slate-200 focus-within:border-teal-600 transition-colors cursor-pointer relative select-none"
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                setIsDestinationOpen(false);
                setIsDepartureOpen(false);
                setIsPassengerOpen(false);
              }}
            >
              <span className="material-symbols-outlined text-teal-600 text-[20px] mr-2 shrink-0">calendar_month</span>
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer">Dates</label>
                <div className="text-xs font-bold text-slate-900 truncate">{selectedDate.mainText}</div>
              </div>

              <DatePickerPopover
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onSelectDate={handleDateSelect}
                selectedDate={selectedDate.mainText}
                themeColor="teal"
                position="auto"
                defaultPosition="top"
              />
            </div>

            {/* 4. TRAVELERS SELECTOR */}
            <div
              className={`relative md:col-span-2 flex items-center bg-slate-50 hover:bg-teal-50/50 rounded-2xl px-3 py-2.5 border border-slate-200 text-center cursor-pointer transition-all select-none ${isPassengerOpen ? 'z-[9999]' : 'z-10'}`}
              onClick={() => {
                setIsPassengerOpen(!isPassengerOpen);
                setIsDestinationOpen(false);
                setIsDepartureOpen(false);
                setIsDatePickerOpen(false);
              }}
            >
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 cursor-pointer">Travelers</label>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {passengers} {passengers === 1 ? 'Traveler' : 'Travelers'}
                </div>
              </div>

              {/* TRAVELERS POPUP */}
              {isPassengerOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Travelers Selection Bubble"
                  className="absolute bottom-full mb-3.5 right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-[99999] w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.35)] border border-slate-200/90 p-4 text-slate-800 animate-in fade-in zoom-in-95 duration-200 text-left"
                >
                  {/* Speech Bubble Arrow Indicator */}
                  <div className="absolute top-full right-8 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 w-0 h-0 border-x-[10px] border-x-transparent border-t-[10px] border-t-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.08)]" />

                  {/* Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-teal-600">
                        group
                      </span>
                      <span className="font-serif text-sm font-bold text-slate-900">Travelers</span>
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
                      <span className="text-[10px] text-slate-500">Reserved holiday seats</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.max(1, passengers - 1))}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-extrabold text-sm text-teal-700 w-6 text-center">{passengers}</span>
                      <button
                        type="button"
                        onClick={() => setPassengers(Math.min(10, passengers + 1))}
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
            <div className="md:col-span-1">
              <button
                type="submit"
                className="w-full min-h-[52px] bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-2xl flex items-center justify-center gap-1 shadow-lg shadow-teal-700/30 active:scale-[0.98] transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="hidden md:inline text-xs">GO</span>
              </button>
            </div>
          </form>
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-semibold">
              <span className="text-teal-700">⚡</span>
              <span>Upcoming Fixed Departures:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <a className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full font-semibold hover:bg-red-100 transition flex items-center gap-1.5" href="#fixed-batches">
                <span>Nov 29:</span> Goa Weekend Special
                <span className="bg-red-200 text-red-800 text-[10px] px-1.5 rounded-full font-bold">4 Seats Left</span>
              </a>
              <a className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-semibold hover:bg-amber-100 transition flex items-center gap-1.5" href="#fixed-batches">
                <span>Dec 06:</span> Kerala Backwaters
                <span className="bg-amber-200 text-amber-900 text-[10px] px-1.5 rounded-full font-bold">Fast Filling</span>
              </a>
              <a className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-semibold hover:bg-teal-100 transition flex items-center gap-1.5" href="#fixed-batches">
                <span>Dec 14:</span> Manali Snow Escape
                <span className="bg-teal-200 text-teal-900 text-[10px] px-1.5 rounded-full font-bold">Guaranteed Batch</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
