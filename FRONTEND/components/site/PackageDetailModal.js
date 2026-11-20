'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { allPackagesData } from '@/lib/data/packagesData';
import { canonicalPackageId } from '@/lib/packages';

export default function PackageDetailModal({ pkg, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('itinerary'); // 'itinerary' | 'summary' | 'inclusions'
  const [isClosing, setIsClosing] = useState(false);
  const contentScrollRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('itinerary');
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !pkg || !mounted) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 200);
  };

  // Merge with rich package catalog data if available
  const rawId = pkg.id || pkg.slug || '';
  const canonicalId = canonicalPackageId(rawId);
  const catalogPkg = allPackagesData[canonicalId] || allPackagesData[rawId] || {};

  const title = pkg.title || catalogPkg.title || 'Curated Travel Package';
  const subtitle = pkg.subtitle || pkg.country || catalogPkg.subtitle || 'Exclusive Holiday Experience';
  const badge = pkg.badge || pkg.tag || catalogPkg.badge || 'Popular Package';
  const badgeColor = pkg.badgeColor || pkg.tagBg || catalogPkg.badgeColor || 'bg-teal-600 text-white';
  const duration = pkg.duration || catalogPkg.duration || '7 Days / 6 Nights';
  const price = pkg.price || (catalogPkg.basePrice ? `₹${Number(catalogPkg.basePrice).toLocaleString('en-IN')}` : '₹1,39,999');
  const image = pkg.image || catalogPkg.image || '/images/screen.png';
  const shortPlan = pkg.shortPlan || pkg.description || catalogPkg.description || 'Curated holiday experience with verified luxury stays and premium sightseeing.';

  const itinerary = Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
    ? pkg.itinerary
    : Array.isArray(catalogPkg.itinerary) && catalogPkg.itinerary.length > 0
      ? catalogPkg.itinerary
      : [
          { day: 'Day 1', title: 'Arrival & Welcome Reception', desc: 'Private transfer from airport/station to luxury hotel. Evening welcome dinner and briefing.' },
          { day: 'Day 2', title: 'Guided Sightseeing & Culture Tour', desc: 'Full-day escorted tour of landmark monuments, cultural sites, and historic quarters.' },
          { day: 'Day 3', title: 'Scenic Excursions & Local Experiences', desc: 'Signature regional excursions, leisure activities, and authentic cuisine trails.' },
          { day: 'Day 4', title: 'Leisure & Return Transit', desc: 'Morning breakfast at resort, souvenir shopping, and scheduled airport drop.' },
        ];

  const highlights = Array.isArray(pkg.highlights) && pkg.highlights.length > 0
    ? pkg.highlights
    : Array.isArray(catalogPkg.highlights) && catalogPkg.highlights.length > 0
      ? catalogPkg.highlights
      : Array.isArray(catalogPkg.inclusions) && catalogPkg.inclusions.length > 0
        ? catalogPkg.inclusions.slice(0, 4)
        : ['Luxury 4★ Hotel Stays', 'Daily Breakfast & Dinners', 'All City Sightseeing Transfers', 'Dedicated Tour Guide'];

  const inclusions = Array.isArray(pkg.inclusions) && pkg.inclusions.length > 0
    ? pkg.inclusions
    : Array.isArray(catalogPkg.inclusions) && catalogPkg.inclusions.length > 0
      ? catalogPkg.inclusions
      : ['4 Nights Deluxe AC Accommodation', 'Daily Buffet Breakfast & Dinner', 'Private AC Vehicle for Sightseeing', 'All Highway Tolls, Permits & Parking'];

  const exclusions = Array.isArray(pkg.exclusions) && pkg.exclusions.length > 0
    ? pkg.exclusions
    : Array.isArray(catalogPkg.exclusions) && catalogPkg.exclusions.length > 0
      ? catalogPkg.exclusions
      : ['Personal Expenses & Laundry', 'Optional Water Sports & Adventure Rides', 'Entry tickets not mentioned in inclusions'];

  const hotels = Array.isArray(pkg.hotels) && pkg.hotels.length > 0
    ? pkg.hotels
    : Array.isArray(catalogPkg.hotels) && catalogPkg.hotels.length > 0
      ? catalogPkg.hotels
      : [
          { city: 'Primary Destination', hotel: '4★ Luxury Resort / Deluxe AC Hotel', meal: 'Breakfast & Dinner Included' },
        ];

  const packageId = canonicalId || rawId;

  const modalJSX = (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-200 overflow-y-auto ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Floating Modal Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl lg:max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden my-auto transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* HERO IMAGE HEADER */}
        <div className="relative w-full h-48 sm:h-56 md:h-64 bg-slate-900 shrink-0 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent"></div>

          {/* Top Badge & Close Button Bar */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase shadow-sm ${badgeColor}`}>
                {badge}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold">
                {duration}
              </span>
            </div>

            <button
              onClick={handleClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/25 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-white tracking-tight leading-tight drop-shadow-md">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-semibold truncate mt-1 drop-shadow">
              {subtitle}
            </p>
          </div>
        </div>

        {/* QUICK ACTION BAR: PRICE & BOOKING BUTTONS */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Package Price
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">{price}</span>
              <span className="text-[11px] font-medium text-slate-500">/ person</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {packageId ? (
              <Link
                href={`/customize-package?package=${encodeURIComponent(packageId)}`}
                onClick={handleClose}
                className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Customize</span>
              </Link>
            ) : null}

            {packageId ? (
              <Link
                href={`/packages/checkout?package=${encodeURIComponent(packageId)}`}
                onClick={handleClose}
                className="flex-1 sm:flex-none justify-center px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Book Package</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            ) : (
              <Link
                href="/contact"
                onClick={handleClose}
                className="flex-1 sm:flex-none justify-center px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-200 text-center"
              >
                Contact support
              </Link>
            )}
          </div>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-2">
                Tour Highlights
              </span>
              <div className="flex flex-wrap gap-1.5">
                {highlights.map((hl, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-200/70"
                  >
                    <span className="material-symbols-outlined text-[14px] text-teal-600">check_circle</span>
                    <span>{hl}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 gap-1 font-bold text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('itinerary')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'itinerary'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day-by-Day Itinerary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stays &amp; Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('inclusions')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                activeTab === 'inclusions'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inclusions &amp; Policies
            </button>
          </div>

          {/* TAB 1: ITINERARY */}
          {activeTab === 'itinerary' && (
            <div className="space-y-3">
              {itinerary.map((dayItem, idx) => (
                <div key={idx} className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-teal-100 text-teal-900 font-extrabold text-xs shrink-0 self-start">
                    {dayItem.day}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1 text-xs sm:text-sm">{dayItem.title}</h4>
                    <p className="text-slate-600 leading-relaxed text-xs">{dayItem.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: OVERVIEW & STAYS */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200">
                <h4 className="text-sm font-bold text-teal-900 mb-1.5 font-serif flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
                  <span>Trip Overview</span>
                </h4>
                <p className="text-xs text-teal-950 leading-relaxed">{shortPlan}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2.5 font-serif">Accommodations &amp; Transit</h4>
                <div className="space-y-2">
                  {hotels.map((h, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{h.city}</span>
                        <span className="text-teal-700 font-semibold">{h.hotel}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-bold w-fit">
                        {h.meal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INCLUSIONS & EXCLUSIONS */}
          {activeTab === 'inclusions' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white">
                <h4 className="text-sm font-bold text-teal-300 mb-2.5 font-serif flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>What is Included</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                  {inclusions.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-teal-400 shrink-0 mt-0.5">check_circle</span>
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {exclusions && exclusions.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950">
                  <h4 className="font-bold mb-2 text-red-900 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-red-600">cancel</span>
                    <span>Package Exclusions</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {exclusions.map((exc, i) => (
                      <li key={i}>{exc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
