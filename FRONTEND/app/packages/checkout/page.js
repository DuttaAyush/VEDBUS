'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import AuthGuard from '@/components/auth/AuthGuard';
import { apiFetch } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { normalizePackageRecord } from '@/lib/packages';

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function PackageCheckoutContent() {
  const searchParams = useSearchParams();
  const requestedPackageId = searchParams.get('package') || '';
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(Boolean(requestedPackageId));
  const [error, setError] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelerCount, setTravelerCount] = useState(1);
  const [travelers, setTravelers] = useState([]);
  const [hotelUpgrade, setHotelUpgrade] = useState('3star');
  const [transportMode, setTransportMode] = useState('coach');
  const [includeAirportTransfer, setIncludeAirportTransfer] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const requestKeyRef = useRef(null);

  useEffect(() => {
    if (!requestedPackageId) {
      setLoading(false);
      setError('No package was selected.');
      return;
    }

    let cancelled = false;
    apiFetch(`/api/packages/${encodeURIComponent(requestedPackageId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data?.success === false) throw new Error(data?.message || 'This package is no longer available.');
        return normalizePackageRecord(data, requestedPackageId);
      })
      .then((livePackage) => {
        if (cancelled) return;
        if (!livePackage.id || !livePackage.title || livePackage.basePrice <= 0) {
          setError('This package is no longer available for booking.');
          return;
        }
        setPkg(livePackage);
        const user = getStoredUser();
        if (user?.email) setContactEmail(user.email);
        if (user?.phone) setContactPhone(user.phone);

        let pending = null;
        try {
          pending = JSON.parse(sessionStorage.getItem('pending_package') || 'null');
        } catch {
          pending = null;
        }
        const pendingMatches = pending && (pending.packageId === livePackage.id || pending.pkgId === livePackage.slug || pending.pkgId === requestedPackageId);
        const count = pendingMatches ? Math.max(1, Math.min(10, Number(pending.travelerCount) || 1)) : 1;
        setTravelerCount(count);
        setTravelers(pendingMatches && Array.isArray(pending.travelers) && pending.travelers.length === count
          ? pending.travelers
          : Array.from({ length: count }, () => ({ name: '', age: '', gender: 'other' })));
        if (pendingMatches) {
          setTravelDate(pending.travelDate || '');
          setHotelUpgrade(pending.hotelTier || '3star');
          setTransportMode(pending.transportMode || 'coach');
          const ids = new Set(Array.isArray(pending.selectedAddons) ? pending.selectedAddons.map((addon) => addon.id) : []);
          setSelectedAddons(livePackage.addons.filter((addon) => ids.has(addon.id)));
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
  }, [requestedPackageId]);

  const hotelCost = hotelUpgrade === '5star' ? 9500 : hotelUpgrade === '4star' ? 4500 : 0;
  const transportCost = transportMode === 'private-suv' ? 8000 : transportMode === 'private-sedan' ? 5000 : 0;
  const addonCostPerPerson = selectedAddons.reduce((sum, addon) => sum + Number(addon.price || 0), 0);
  const subtotal = pkg ? (pkg.basePrice + hotelCost + addonCostPerPerson) * travelerCount + transportCost + (includeAirportTransfer ? 999 : 0) : 0;
  const tax = Math.round(subtotal * 0.05);
  const estimatedTotal = subtotal + tax;

  const updateTravelerCount = (count) => {
    const nextCount = Math.max(1, Math.min(10, count));
    setTravelerCount(nextCount);
    setTravelers((current) => Array.from({ length: nextCount }, (_, index) => current[index] || ({ name: '', age: '', gender: 'other' })));
  };

  const updateTraveler = (index, field, value) => {
    setTravelers((current) => current.map((traveler, travelerIndex) => travelerIndex === index ? { ...traveler, [field]: value } : traveler));
  };

  const submitBookingRequest = async (event) => {
    event.preventDefault();
    setError('');
    if (!pkg) return;
    if (!travelDate || travelDate < tomorrowDate()) {
      setError('Choose a future travel date.');
      return;
    }
    if (!contactEmail.trim() || !/^\S+@\S+\.\S+$/.test(contactEmail.trim()) || !contactPhone.trim()) {
      setError('Provide a valid contact email and phone number.');
      return;
    }
    if (travelers.length !== travelerCount || travelers.some((traveler) => !traveler.name.trim() || !traveler.age || Number(traveler.age) < 1)) {
      setError('Complete the name and age for every traveler.');
      return;
    }

    if (!requestKeyRef.current) requestKeyRef.current = `pkg-${Date.now()}-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    setIsProcessing(true);
    try {
      const response = await apiFetch('/api/packages/book', {
        method: 'POST',
        body: JSON.stringify({
          packageId: pkg.id,
          travelersCount: travelerCount,
          travelDate,
          travelers: travelers.map((traveler) => ({ name: traveler.name.trim(), age: Number(traveler.age), gender: traveler.gender })),
          contact: { email: contactEmail.trim(), phone: contactPhone.trim() },
          options: { hotelUpgrade, transportMode, includeAirportTransfer, selectedAddons },
          totalAmount: estimatedTotal,
          requestKey: requestKeyRef.current,
        }),
      });
      const data = await response.json();
      const savedBooking = data?.data?.booking || data?.booking;
      if (!response.ok || !data?.success || !savedBooking?.id) {
        setError(data?.message || 'The booking request could not be saved. Nothing was confirmed.');
        return;
      }
      setBooking(savedBooking);
      try { sessionStorage.removeItem('pending_package'); } catch {}
    } catch {
      setError('Unable to reach the booking service. Nothing was confirmed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm font-semibold text-slate-600">Loading live package details...</p></div>;

  if (error && !pkg) {
    return <div className="min-h-screen bg-slate-50 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center p-6"><div className="max-w-md w-full text-center space-y-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm"><h1 className="text-xl font-serif font-bold text-slate-900">Package unavailable</h1><p className="text-sm text-slate-600">{error}</p><div className="flex justify-center gap-2"><Link href="/packages" className="px-4 py-2 rounded-xl bg-brand-scarlet text-white text-xs font-bold">Browse packages</Link><Link href="/contact" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">Contact support</Link></div></div></main><Footer /></div>;
  }

  return (
    <AuthGuard title="Login to submit a package booking request" subtitle="Your request will remain pending until the booking provider confirms availability." redirectTo="/packages">
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
        <Header />
        <div className="bg-white border-b border-slate-200 shadow-sm py-4 px-4 sm:px-6 lg:px-8"><div className="max-w-7xl mx-auto flex items-center gap-3"><Link href="/packages" className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center" aria-label="Back to packages">←</Link><div><p className="text-xs font-bold uppercase tracking-wider text-brand-scarlet">Live package checkout</p><h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{pkg.title}</h1></div></div></div>
        {error && <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4"><div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{error}</div></div>}

        <form onSubmit={submitBookingRequest} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm sm:flex"><img src={pkg.image || '/images/screen.png'} alt={pkg.title} className="w-full sm:w-2/5 h-48 object-cover" /><div className="p-6 space-y-2"><h2 className="text-xl font-serif font-bold text-slate-900">{pkg.title}</h2><p className="text-xs text-slate-500 font-semibold">{pkg.subtitle}</p><p className="text-sm text-slate-700">Live base price: <strong>₹{pkg.basePrice.toLocaleString('en-IN')} / person</strong></p><p className="text-xs text-slate-500">Final pricing is recalculated by the server when this request is submitted.</p></div></div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><h2 className="text-base font-serif font-bold text-slate-900">Travel date and options</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-xs font-bold text-slate-600">Travel date *<input type="date" min={tomorrowDate()} value={travelDate} onChange={(event) => setTravelDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900" /></label><div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3"><span className="text-xs font-bold text-slate-600">Travelers</span><div className="flex items-center gap-3"><button type="button" onClick={() => updateTravelerCount(travelerCount - 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-300">−</button><strong>{travelerCount}</strong><button type="button" onClick={() => updateTravelerCount(travelerCount + 1)} className="w-8 h-8 rounded-lg bg-white border border-slate-300">+</button></div></div></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[['3star', '3★ Standard', 0], ['4star', '4★ Deluxe', 4500], ['5star', '5★ Luxury', 9500]].map(([id, label, cost]) => <button type="button" key={id} onClick={() => setHotelUpgrade(id)} className={`p-3 rounded-xl border-2 text-left ${hotelUpgrade === id ? 'border-brand-scarlet bg-red-50' : 'border-slate-200 bg-slate-50'}`}><strong className="block text-xs">{label}</strong><span className="text-[11px] text-slate-500">{cost ? `+₹${cost.toLocaleString('en-IN')} / person` : 'Included'}</span></button>)}</div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{[['coach', 'Shared coach', 0], ['private-sedan', 'Private sedan', 5000], ['private-suv', 'Private SUV', 8000]].map(([id, label, cost]) => <button type="button" key={id} onClick={() => setTransportMode(id)} className={`p-3 rounded-xl border-2 text-left ${transportMode === id ? 'border-brand-scarlet bg-red-50' : 'border-slate-200 bg-slate-50'}`}><strong className="block text-xs">{label}</strong><span className="text-[11px] text-slate-500">{cost ? `+₹${cost.toLocaleString('en-IN')} total` : 'Included'}</span></button>)}</div><label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"><input type="checkbox" checked={includeAirportTransfer} onChange={(event) => setIncludeAirportTransfer(event.target.checked)} /> Add terminal/airport transfer (+₹999 total)</label></div>

            {selectedAddons.length > 0 && <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"><h2 className="text-base font-serif font-bold text-slate-900 mb-3">Selected allowed add-ons</h2><div className="flex flex-wrap gap-2">{selectedAddons.map((addon) => <span key={addon.id} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">{addon.label || addon.name} · ₹{Number(addon.price || 0).toLocaleString('en-IN')} / person</span>)}</div></div>}

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><h2 className="text-base font-serif font-bold text-slate-900">Contact and traveler details</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-xs font-bold text-slate-600">Email *<input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-slate-600">Phone *<input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label></div>{travelers.map((traveler, index) => <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200"><label className="sm:col-span-6 text-[11px] font-bold text-slate-600">Traveler {index + 1} name *<input value={traveler.name} onChange={(event) => updateTraveler(index, 'name', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label><label className="sm:col-span-3 text-[11px] font-bold text-slate-600">Age *<input type="number" min="1" max="120" value={traveler.age} onChange={(event) => updateTraveler(index, 'age', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label><label className="sm:col-span-3 text-[11px] font-bold text-slate-600">Gender<select value={traveler.gender} onChange={(event) => updateTraveler(index, 'gender', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div>)}</div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"><h2 className="text-base font-serif font-bold text-slate-900">Payment status</h2><p className="text-sm text-slate-600 mt-2">Payment provider integration is not enabled. This form submits a booking request only; it does not collect card, UPI, or bank details.</p></div>
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-36 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-100 pb-3">Estimated request total</h2><div className="space-y-2 text-xs text-slate-600"><div className="flex justify-between"><span>Package and options</span><strong>₹{subtotal.toLocaleString('en-IN')}</strong></div><div className="flex justify-between"><span>Tax estimate (5%)</span><strong>₹{tax.toLocaleString('en-IN')}</strong></div><div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900"><span>Estimate</span><span className="text-brand-scarlet">₹{estimatedTotal.toLocaleString('en-IN')}</span></div></div><button type="submit" disabled={isProcessing || Boolean(booking)} className="w-full py-3.5 rounded-2xl bg-brand-scarlet hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider">{isProcessing ? 'Submitting request...' : booking ? 'Request submitted' : 'Submit booking request'}</button><p className="text-[11px] text-slate-500">The server returns the authoritative total and status.</p></aside>
        </form>

        {booking && <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="max-w-md w-full bg-white rounded-3xl p-7 text-center space-y-4 shadow-2xl"><div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto"><span className="material-symbols-outlined text-3xl">schedule</span></div><h2 className="text-2xl font-serif font-bold text-slate-900">Booking request received</h2><p className="text-sm text-slate-600">Request <strong className="font-mono">{booking.id}</strong> is <strong>{booking.status || 'Pending'}</strong>. No payment was collected and no voucher is confirmed yet.</p><div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2"><div className="flex justify-between"><span>Package</span><strong>{pkg.title}</strong></div><div className="flex justify-between"><span>Travel date</span><strong>{travelDate}</strong></div><div className="flex justify-between"><span>Server total</span><strong>₹{Number(booking.totalAmount || estimatedTotal).toLocaleString('en-IN')}</strong></div></div><Link href="/profile" className="w-full inline-flex justify-center py-3 rounded-xl bg-brand-scarlet text-white font-bold text-xs">View my booking requests</Link><Link href="/" className="block text-xs font-bold text-slate-600">Back to home</Link></div></div>}
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default function PackageCheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm font-semibold text-slate-600">Loading checkout...</p></div>}><PackageCheckoutContent /></Suspense>;
}
