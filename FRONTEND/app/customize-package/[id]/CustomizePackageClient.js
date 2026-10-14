'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { apiFetch } from '@/lib/api';
import { normalizePackageRecord } from '@/lib/packages';

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export default function CustomizePackageClient({ params }) {
  const router = useRouter();
  const packageId = params?.id || '';
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(Boolean(packageId));
  const [error, setError] = useState('');
  const [hotelTier, setHotelTier] = useState('3star');
  const [transportMode, setTransportMode] = useState('coach');
  const [travelerCount, setTravelerCount] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [activeAddons, setActiveAddons] = useState([]);

  useEffect(() => {
    if (!packageId) {
      setLoading(false);
      setError('No package was selected.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    apiFetch(`/api/packages/${encodeURIComponent(packageId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.success === false) {
          throw new Error(data?.message || 'This package is no longer available.');
        }
        return normalizePackageRecord(data, packageId);
      })
      .then((livePackage) => {
        if (cancelled || !livePackage.id || !livePackage.title || livePackage.basePrice <= 0) {
          if (!cancelled) setError('This package is no longer available for booking.');
          return;
        }
        setPkg(livePackage);
        setActiveAddons(livePackage.addons.map((addon) => ({ ...addon, selected: Boolean(addon.selected) })));
        try {
          const pending = JSON.parse(sessionStorage.getItem('pending_package') || 'null');
          if (pending && (pending.packageId === livePackage.id || pending.pkgId === livePackage.slug || pending.pkgId === packageId)) {
            if (pending.hotelTier) setHotelTier(pending.hotelTier);
            if (pending.transportMode) setTransportMode(pending.transportMode);
            if (pending.travelerCount) setTravelerCount(Number(pending.travelerCount));
            if (pending.travelDate) setTravelDate(pending.travelDate);
            if (Array.isArray(pending.selectedAddons)) {
              const selectedIds = new Set(pending.selectedAddons.map((addon) => addon.id));
              setActiveAddons(livePackage.addons.map((addon) => ({ ...addon, selected: selectedIds.has(addon.id) })));
            }
          }
        } catch {
          // A malformed pending session is ignored; the live package remains usable.
        }
      })
      .catch((fetchError) => {
        if (!cancelled) setError(fetchError.message || 'Unable to load this package.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [packageId]);

  const hotelCost = hotelTier === '5star' ? 9500 : hotelTier === '4star' ? 4500 : 0;
  const transportCost = transportMode === 'private-suv' ? 8000 : transportMode === 'private-sedan' ? 5000 : 0;
  const selectedAddons = activeAddons.filter((addon) => addon.selected);
  const addonsPerPerson = selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const subtotal = (pkg ? pkg.basePrice + hotelCost + addonsPerPerson : 0) * travelerCount + transportCost;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const toggleAddon = (id) => {
    setActiveAddons((addons) => addons.map((addon) => addon.id === id ? { ...addon, selected: !addon.selected } : addon));
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
      pkgId: pkg.slug || packageId,
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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm font-semibold text-slate-600">Loading live package details...</p></div>;
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h1 className="text-xl font-serif font-bold text-slate-900">Package unavailable</h1>
            <p className="text-sm text-slate-600">{error || 'This promotional package is not currently available.'}</p>
            <div className="flex justify-center gap-2">
              <Link href="/packages" className="px-4 py-2 rounded-xl bg-brand-scarlet text-white text-xs font-bold">Browse packages</Link>
              <Link href="/contact" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">Contact support</Link>
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
          <Link href="/packages" className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center" aria-label="Back to packages">←</Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-scarlet">{pkg.category}</p>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">Customize {pkg.title}</h1>
          </div>
        </div>
      </div>

      {error && <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4"><div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{error}</div></div>}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm sm:flex">
            <img src={pkg.image || '/images/screen.png'} alt={pkg.title} className="w-full sm:w-2/5 h-48 object-cover" />
            <div className="p-6 space-y-2">
              <h2 className="text-xl font-serif font-bold text-slate-900">{pkg.title}</h2>
              <p className="text-xs text-slate-500 font-semibold">{pkg.subtitle}</p>
              <p className="text-sm text-slate-700">Live base price: <strong>₹{pkg.basePrice.toLocaleString('en-IN')} / person</strong></p>
              <p className="text-xs text-slate-500">Package details and allowed add-ons come from the current booking catalog.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-slate-900">Travel date and group</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-600">Travel date *<input type="date" min={tomorrowDate()} value={travelDate} onChange={(event) => setTravelDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900" /></label>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"><span className="text-xs font-bold text-slate-600">Travelers</span><div className="flex items-center gap-3"><button type="button" onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-300">−</button><strong>{travelerCount}</strong><button type="button" onClick={() => setTravelerCount(Math.min(10, travelerCount + 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-300">+</button></div></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-slate-900">Accommodation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[['3star', '3★ Standard', 0], ['4star', '4★ Deluxe', 4500], ['5star', '5★ Luxury', 9500]].map(([id, label, cost]) => <button type="button" key={id} onClick={() => setHotelTier(id)} className={`p-4 rounded-2xl border-2 text-left ${hotelTier === id ? 'border-brand-scarlet bg-red-50' : 'border-slate-200 bg-slate-50'}`}><strong className="block text-xs text-slate-900">{label}</strong><span className="text-xs text-slate-500">{cost ? `+₹${cost.toLocaleString('en-IN')} / person` : 'Included in base'}</span></button>)}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-serif font-bold text-slate-900">Transit preference</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[['coach', 'Shared coach', 0], ['private-sedan', 'Private sedan', 5000], ['private-suv', 'Private SUV', 8000]].map(([id, label, cost]) => <button type="button" key={id} onClick={() => setTransportMode(id)} className={`p-4 rounded-2xl border-2 text-left ${transportMode === id ? 'border-brand-scarlet bg-red-50' : 'border-slate-200 bg-slate-50'}`}><strong className="block text-xs text-slate-900">{label}</strong><span className="text-xs text-slate-500">{cost ? `+₹${cost.toLocaleString('en-IN')} total` : 'Included in base'}</span></button>)}
            </div>
          </div>

          {activeAddons.length > 0 && <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"><h2 className="text-base font-serif font-bold text-slate-900">Allowed add-ons</h2>{activeAddons.map((addon) => <label key={addon.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"><span className="flex items-center gap-2"><input type="checkbox" checked={Boolean(addon.selected)} onChange={() => toggleAddon(addon.id)} />{addon.label || addon.name}</span><strong>+₹{Number(addon.price || 0).toLocaleString('en-IN')} / person</strong></label>)}</div>}
        </section>

        <aside className="lg:col-span-4 lg:sticky lg:top-36 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-100 pb-3">Estimated request total</h2>
          <div className="space-y-2 text-xs text-slate-600"><div className="flex justify-between"><span>Package and options</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div><div className="flex justify-between"><span>Tax estimate (5%)</span><strong>₹{tax.toLocaleString('en-IN')}</strong></div><div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900"><span>Total estimate</span><span className="text-brand-scarlet">₹{total.toLocaleString('en-IN')}</span></div></div>
          <button type="button" onClick={handleConfirmAndBook} className="w-full py-3.5 rounded-2xl bg-brand-scarlet hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider">Continue to booking request</button>
          <p className="text-[11px] text-slate-500 leading-relaxed">The server recalculates the final amount. No payment is collected here; the booking remains pending until provider confirmation.</p>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
