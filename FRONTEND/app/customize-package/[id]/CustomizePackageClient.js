'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { getLocalPackage, resolvePackage, canonicalPackageId } from '@/lib/packages';

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function CustomizePackageClient({ params }) {
  const router = useRouter();
  const rawId = params?.id || '';
  const canonicalId = canonicalPackageId(rawId);

  // Synchronously initialize with local catalog package so UI renders instantly with 0 delay/flicker
  const initialPkg = getLocalPackage(canonicalId);
  const [pkg, setPkg] = useState(initialPkg);
  const [loading, setLoading] = useState(!initialPkg);
  const [error, setError] = useState('');
  const [hotelTier, setHotelTier] = useState('3star');
  const [transportMode, setTransportMode] = useState('coach');
  const [travelerCount, setTravelerCount] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [activeAddons, setActiveAddons] = useState(
    initialPkg?.addons ? initialPkg.addons.map((addon) => ({ ...addon, selected: Boolean(addon.selected) })) : []
  );

  useEffect(() => {
    let cancelled = false;

    // Read any pending package state from session storage
    try {
      const pending = JSON.parse(sessionStorage.getItem('pending_package') || 'null');
      if (pending && (pending.packageId === canonicalId || pending.pkgId === canonicalId || pending.pkgId === rawId)) {
        if (pending.hotelTier) setHotelTier(pending.hotelTier);
        if (pending.transportMode) setTransportMode(pending.transportMode);
        if (pending.travelerCount) setTravelerCount(Number(pending.travelerCount));
        if (pending.travelDate) setTravelDate(pending.travelDate);
        if (Array.isArray(pending.selectedAddons) && initialPkg?.addons) {
          const selectedIds = new Set(pending.selectedAddons.map((addon) => addon.id));
          setActiveAddons(initialPkg.addons.map((addon) => ({ ...addon, selected: selectedIds.has(addon.id) })));
        }
      }
    } catch {
      // Ignored
    }

    // Asynchronously check live API for any backend price updates or availability
    resolvePackage(canonicalId)
      .then((livePackage) => {
        if (cancelled || !livePackage) return;
        setPkg(livePackage);
        if (livePackage.addons && livePackage.addons.length > 0) {
          setActiveAddons((current) => {
            if (current.length > 0) {
              const currentSelected = new Set(current.filter((a) => a.selected).map((a) => a.id));
              return livePackage.addons.map((addon) => ({
                ...addon,
                selected: currentSelected.has(addon.id) || Boolean(addon.selected),
              }));
            }
            return livePackage.addons.map((addon) => ({ ...addon, selected: Boolean(addon.selected) }));
          });
        }
      })
      .catch(() => {
        // Fallback to local catalog package is already active
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canonicalId, rawId]);

  const hotelCost = hotelTier === '5star' ? 9500 : hotelTier === '4star' ? 4500 : 0;
  const transportCost = transportMode === 'private-suv' ? 8000 : transportMode === 'private-sedan' ? 5000 : 0;
  const selectedAddons = activeAddons.filter((addon) => addon.selected);
  const addonsPerPerson = selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const subtotal = (pkg ? pkg.basePrice + hotelCost + addonsPerPerson : 0) * travelerCount + transportCost;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const toggleAddon = (id) => {
    setActiveAddons((addons) =>
      addons.map((addon) => (addon.id === id ? { ...addon, selected: !addon.selected } : addon))
    );
  };

  const handleConfirmAndBook = (event) => {
    event.preventDefault();
    if (!pkg) return;
    if (!travelDate || travelDate < tomorrowDate()) {
      setError('Choose a future travel date before continuing.');
      return;
    }

    const pendingPackage = {
      packageId: pkg.id,
      pkgId: pkg.slug || canonicalId,
      dbId: pkg.dbId,
      dbSlug: pkg.dbSlug,
      title: pkg.title,
      subtitle: pkg.subtitle,
      duration: pkg.duration,
      image: pkg.image,
      category: pkg.category,
      basePrice: pkg.basePrice,
      hotelTier,
      transportMode,
      travelerCount,
      travelDate,
      selectedAddons,
    };

    try {
      sessionStorage.setItem('pending_package', JSON.stringify(pendingPackage));
    } catch {
      setError('Your browser could not save the checkout session. Please enable session storage and try again.');
      return;
    }
    router.push(`/packages/checkout?package=${encodeURIComponent(pkg.id)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm font-semibold text-slate-600">Loading package details...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-xl font-serif font-bold text-slate-900">Package unavailable</h1>
            <p className="text-sm text-slate-600">{error || 'This package is not currently available.'}</p>
            <div className="flex justify-center gap-2">
              <Link href="/packages" className="px-4 py-2 rounded-xl bg-brand-scarlet text-white text-xs font-bold">
                Browse packages
              </Link>
              <Link href="/contact" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                Contact support
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
      <Header />
      <div className="bg-white border-b border-slate-200 shadow-sm py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link
            href="/packages"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition-colors"
            aria-label="Back to packages"
          >
            ←
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-scarlet">{pkg.category}</p>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Customize {pkg.title}</h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm sm:flex">
            <img
              src={pkg.image || '/images/screen.png'}
              alt={pkg.title}
              className="w-full sm:w-2/5 h-48 sm:h-auto object-cover"
            />
            <div className="p-6 space-y-2 flex flex-col justify-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 w-fit">
                {pkg.duration}
              </span>
              <h2 className="text-xl font-serif font-bold text-slate-900">{pkg.title}</h2>
              <p className="text-xs text-slate-500 font-semibold">{pkg.subtitle}</p>
              <p className="text-sm text-slate-700">
                Base price: <strong className="text-slate-900">₹{pkg.basePrice.toLocaleString('en-IN')} / person</strong>
              </p>
              <p className="text-xs text-slate-400">All itineraries, stay, and inclusions customizable below.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-slate-900">Travel date and group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-600">
                Travel date *
                <input
                  type="date"
                  min={tomorrowDate()}
                  value={travelDate}
                  onChange={(event) => setTravelDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <span className="text-xs font-bold text-slate-600">Travelers</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <strong className="text-sm">{travelerCount}</strong>
                  <button
                    type="button"
                    onClick={() => setTravelerCount(Math.min(10, travelerCount + 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-slate-900">Accommodation Tier</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['3star', '3★ Standard', 0],
                ['4star', '4★ Deluxe', 4500],
                ['5star', '5★ Luxury', 9500],
              ].map(([id, label, cost]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setHotelTier(id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    hotelTier === id
                      ? 'border-brand-scarlet bg-red-50/50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <strong className="block text-xs text-slate-900">{label}</strong>
                  <span className="text-xs text-slate-500">
                    {cost ? `+₹${cost.toLocaleString('en-IN')} / person` : 'Included in base'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-slate-900">Transit preference</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['coach', 'Shared AC Coach', 0],
                ['private-sedan', 'Private Sedan', 5000],
                ['private-suv', 'Private SUV', 8000],
              ].map(([id, label, cost]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setTransportMode(id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    transportMode === id
                      ? 'border-brand-scarlet bg-red-50/50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <strong className="block text-xs text-slate-900">{label}</strong>
                  <span className="text-xs text-slate-500">
                    {cost ? `+₹${cost.toLocaleString('en-IN')} total` : 'Included in base'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeAddons.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-base font-serif font-bold text-slate-900">Curated Add-ons & Fast Passes</h2>
              {activeAddons.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 font-medium text-slate-800">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-brand-scarlet rounded"
                      checked={Boolean(addon.selected)}
                      onChange={() => toggleAddon(addon.id)}
                    />
                    {addon.label || addon.name}
                  </span>
                  <strong className="text-brand-scarlet shrink-0">
                    +₹{Number(addon.price || 0).toLocaleString('en-IN')} / person
                  </strong>
                </label>
              ))}
            </div>
          )}

          {pkg.inclusions && pkg.inclusions.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-base font-serif font-bold text-slate-900">Standard Package Inclusions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {pkg.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 lg:sticky lg:top-36 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-100 pb-3">
            Estimated request total
          </h2>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Base Package ({travelerCount} {travelerCount > 1 ? 'travelers' : 'traveler'})</span>
              <strong className="text-slate-900">₹{(pkg.basePrice * travelerCount).toLocaleString('en-IN')}</strong>
            </div>
            {hotelCost > 0 && (
              <div className="flex justify-between">
                <span>Hotel upgrade ({hotelTier})</span>
                <strong className="text-slate-900">₹{(hotelCost * travelerCount).toLocaleString('en-IN')}</strong>
              </div>
            )}
            {transportCost > 0 && (
              <div className="flex justify-between">
                <span>Vehicle upgrade</span>
                <strong className="text-slate-900">₹{transportCost.toLocaleString('en-IN')}</strong>
              </div>
            )}
            {addonsPerPerson > 0 && (
              <div className="flex justify-between">
                <span>Add-ons ({selectedAddons.length})</span>
                <strong className="text-slate-900">₹{(addonsPerPerson * travelerCount).toLocaleString('en-IN')}</strong>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>Tax estimate (5%)</span>
              <strong>₹{tax.toLocaleString('en-IN')}</strong>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900">
              <span>Total estimate</span>
              <span className="text-brand-scarlet">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirmAndBook}
            className="w-full py-3.5 rounded-2xl bg-brand-scarlet hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Continue to booking request
          </button>
          <p className="text-[11px] text-slate-500 leading-relaxed text-center">
            No payment is charged now. You can review and confirm your passenger details on the next step.
          </p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
