'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import AuthGuard from '@/components/auth/AuthGuard';
import { apiFetch } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

function getBaseFare(booking) {
  return Array.isArray(booking?.selectedSeats)
    ? booking.selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0)
    : 0;
}

function CheckoutContent() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [includeCabPickup, setIncludeCabPickup] = useState(false);
  const [includeSatvikMeal, setIncludeSatvikMeal] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [savedPassengers, setSavedPassengers] = useState([]);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    try {
      const user = getStoredUser();
      if (user?.email) setContactEmail(user.email);
      if (user?.phone) setContactPhone(user.phone);
      const raw = sessionStorage.getItem('pending_booking');
      const parsed = raw ? JSON.parse(raw) : null;
      if (!sessionStorage.getItem('active_checkout_flow') || !parsed?.tripId || !Array.isArray(parsed.selectedSeats) || parsed.selectedSeats.length === 0) {
        setError('Your seat selection session has expired. Search again to start a new booking.');
        return;
      }
      setBookingData(parsed);
      setPassengers(parsed.selectedSeats.map((seat) => ({ seat: seat.id || seat.name, name: '', age: '', gender: 'other' })));
      const key = user?.id ? `saved_passengers_${user.id}` : user?.phone ? `saved_passengers_${user.phone}` : '';
      if (key) {
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        if (Array.isArray(saved)) setSavedPassengers(saved);
      }
    } catch {
      setError('The seat selection session could not be read. Search again to start a new booking.');
    } finally {
      setLoading(false);
    }
  }, []);

  const baseFare = getBaseFare(bookingData);
  const mealCost = includeSatvikMeal ? 149 * passengers.length : 0;
  const cabCost = includeCabPickup ? 199 : 0;
  const subtotal = baseFare + mealCost + cabCost;
  const discount = appliedCoupon ? Math.min(Math.round(subtotal * Number(appliedCoupon.discountPercentage || 0) / 100), Number(appliedCoupon.maxDiscountAmount || 0)) : 0;
  const tax = Math.round((subtotal - discount) * 0.05);
  const estimate = Math.max(0, subtotal - discount) + tax;

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponMessage('');
    try {
      const response = await apiFetch('/api/offers/validate', { method: 'POST', body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok || !data.success || !data.data) {
        setAppliedCoupon(null);
        setCouponMessage(data.message || 'Invalid or expired offer code.');
        return;
      }
      setAppliedCoupon(data.data);
      setCouponCode(data.data.code);
      setCouponMessage(`Offer applied. The server will recalculate the final discount.`);
    } catch {
      setAppliedCoupon(null);
      setCouponMessage('Unable to validate this offer right now.');
    }
  };

  const updatePassenger = (index, field, value) => {
    setPassengers((current) => current.map((passenger, passengerIndex) => passengerIndex === index ? { ...passenger, [field]: value } : passenger));
  };

  const submitBookingRequest = async (event) => {
    event.preventDefault();
    setError('');
    if (!bookingData) return;
    if (!contactEmail.trim() || !/^\S+@\S+\.\S+$/.test(contactEmail.trim()) || !contactPhone.trim()) {
      setError('Provide a valid contact email and phone number.');
      return;
    }
    if (passengers.some((passenger) => !passenger.name.trim() || !passenger.age || Number(passenger.age) < 1)) {
      setError('Complete the name and age for every passenger.');
      return;
    }
    setProcessing(true);
    try {
      const response = await apiFetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          tripId: bookingData.tripId,
          selectedSeats: bookingData.selectedSeats.map((seat) => seat.id || seat.name),
          passengers: passengers.map((passenger) => ({ seat: passenger.seat, name: passenger.name.trim(), age: Number(passenger.age), gender: passenger.gender })),
          contact: { email: contactEmail.trim(), phone: contactPhone.trim() },
          options: { meal: includeSatvikMeal, cab: includeCabPickup, insurance: false },
          includeSatvikMeal,
          includeCabPickup,
          includeInsurance: false,
          totalAmount: estimate,
          couponCode: appliedCoupon?.code || null,
          requestKey: bookingData.requestKey,
        }),
      });
      const data = await response.json();
      const savedBooking = data?.data?.booking || data?.booking;
      if (!response.ok || !data?.success || !savedBooking?.id) {
        setError(data?.message || 'The booking request could not be saved. Nothing was confirmed.');
        return;
      }
      setBooking(savedBooking);
      sessionStorage.removeItem('pending_booking');
      sessionStorage.removeItem('active_checkout_flow');
    } catch {
      setError('Unable to reach the booking service. Nothing was confirmed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-sm font-semibold text-slate-600">Checking seat selection...</p></div>;
  if (!bookingData) return <div className="min-h-screen bg-slate-50 flex flex-col"><Header /><main className="flex-1 flex items-center justify-center p-6"><div className="max-w-md w-full text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4"><h1 className="text-xl font-serif font-bold text-slate-900">Checkout unavailable</h1><p className="text-sm text-slate-600">{error}</p><Link href="/search" className="inline-flex px-4 py-2 rounded-xl bg-brand-scarlet text-white text-xs font-bold">Search buses</Link></div></main><Footer /></div>;

  return (
    <AuthGuard title="Login to submit a bus booking request" subtitle="Your seat hold must be verified before the server accepts this request." redirectTo="/search">
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased">
        <Header />
        <div className="bg-white border-b border-slate-200 shadow-sm py-4 px-4 sm:px-6 lg:px-8"><div className="max-w-7xl mx-auto flex items-center gap-3"><Link href="/select-seats" className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center" aria-label="Back to seats">←</Link><div><p className="text-xs font-bold uppercase tracking-wider text-brand-scarlet">Bus booking request</p><h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{bookingData.from || 'Origin'} → {bookingData.to || 'Destination'}</h1><p className="text-xs text-slate-500">{bookingData.operator || 'Live fleet result'} · {bookingData.date || 'Scheduled date'}</p></div></div></div>
        {error && <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4"><div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{error}</div></div>}

        <form onSubmit={submitBookingRequest} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"><div className="flex flex-wrap gap-2 mb-3">{bookingData.selectedSeats.map((seat) => <span key={seat.id || seat.name} className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">Seat {seat.name || seat.id} · ₹{Number(seat.price || 0).toLocaleString('en-IN')}</span>)}</div><p className="text-xs text-slate-500">Seats were held by the server for {bookingData.holdExpiresInSeconds ? `${bookingData.holdExpiresInSeconds} seconds` : 'a limited time'}. The server validates the hold again when you submit.</p></div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><h2 className="text-base font-serif font-bold text-slate-900">Contact details</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><label className="text-xs font-bold text-slate-600">Email *<input type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-slate-600">Phone *<input type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label></div></div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><div className="flex items-center justify-between"><h2 className="text-base font-serif font-bold text-slate-900">Passenger details</h2>{savedPassengers.length > 0 && <span className="text-[11px] text-slate-500">Saved profiles available per passenger</span>}</div>{passengers.map((passenger, index) => <div key={passenger.seat} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200"><span className="sm:col-span-12 text-xs font-bold text-brand-scarlet">Passenger {index + 1} · Seat {passenger.seat}</span><label className="sm:col-span-6 text-[11px] font-bold text-slate-600">Full name *<input value={passenger.name} onChange={(event) => updatePassenger(index, 'name', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label><label className="sm:col-span-3 text-[11px] font-bold text-slate-600">Age *<input type="number" min="1" max="120" value={passenger.age} onChange={(event) => updatePassenger(index, 'age', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" /></label><label className="sm:col-span-3 text-[11px] font-bold text-slate-600">Gender<select value={passenger.gender} onChange={(event) => updatePassenger(index, 'gender', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label></div>)}</div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"><h2 className="text-base font-serif font-bold text-slate-900">Optional services</h2><label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"><span className="flex items-center gap-2"><input type="checkbox" checked={includeSatvikMeal} onChange={(event) => setIncludeSatvikMeal(event.target.checked)} /> Meal service</span><strong>+₹149 / person</strong></label><label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"><span className="flex items-center gap-2"><input type="checkbox" checked={includeCabPickup} onChange={(event) => setIncludeCabPickup(event.target.checked)} /> Cab pickup</span><strong>+₹199 total</strong></label><p className="text-[11px] text-slate-500">Insurance is not offered because the current provider integration does not support it.</p></div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"><h2 className="text-base font-serif font-bold text-slate-900">Payment status</h2><p className="text-sm text-slate-600 mt-2">Payment provider integration is not enabled. This form submits a pending booking request only; it does not collect card, UPI, or bank details.</p></div>
          </section>

          <aside className="lg:col-span-4 lg:sticky lg:top-36 space-y-5"><div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><h2 className="text-base font-serif font-bold text-slate-900">Offer code</h2><div className="flex gap-2"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="Optional code" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs" /><button type="button" onClick={applyCoupon} className="px-3 rounded-xl bg-slate-900 text-white text-xs font-bold">Apply</button></div>{couponMessage && <p className="text-[11px] text-slate-600">{couponMessage}</p>}</div><div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"><h2 className="text-base font-serif font-bold text-slate-900">Estimated request total</h2><div className="space-y-2 text-xs text-slate-600"><div className="flex justify-between"><span>Seat fare</span><strong>₹{baseFare.toLocaleString('en-IN')}</strong></div>{includeSatvikMeal && <div className="flex justify-between"><span>Meal service</span><strong>₹{mealCost.toLocaleString('en-IN')}</strong></div>}{includeCabPickup && <div className="flex justify-between"><span>Cab pickup</span><strong>₹{cabCost.toLocaleString('en-IN')}</strong></div>}{discount > 0 && <div className="flex justify-between text-emerald-700"><span>Offer estimate</span><strong>-₹{discount.toLocaleString('en-IN')}</strong></div>}<div className="flex justify-between"><span>Tax estimate (5%)</span><strong>₹{tax.toLocaleString('en-IN')}</strong></div><div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-black text-slate-900"><span>Estimate</span><span className="text-brand-scarlet">₹{estimate.toLocaleString('en-IN')}</span></div></div><button type="submit" disabled={processing || Boolean(booking)} className="w-full py-3.5 rounded-2xl bg-brand-scarlet hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider">{processing ? 'Submitting request...' : booking ? 'Request submitted' : 'Submit booking request'}</button><p className="text-[11px] text-slate-500">The server returns the authoritative total and status.</p></div></aside>
        </form>

        {booking && <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"><div className="max-w-md w-full bg-white rounded-3xl p-7 text-center space-y-4 shadow-2xl"><div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto"><span className="material-symbols-outlined text-3xl">schedule</span></div><h2 className="text-2xl font-serif font-bold text-slate-900">Booking request received</h2><p className="text-sm text-slate-600">Request <strong className="font-mono">{booking.id}</strong> is <strong>{booking.status || 'Pending'}</strong>. No payment was collected and no ticket is confirmed yet.</p><div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2"><div className="flex justify-between"><span>Route</span><strong>{bookingData.from || 'Origin'} → {bookingData.to || 'Destination'}</strong></div><div className="flex justify-between"><span>Server total</span><strong>₹{Number(booking.totalAmount || estimate).toLocaleString('en-IN')}</strong></div></div><Link href="/profile" className="w-full inline-flex justify-center py-3 rounded-xl bg-brand-scarlet text-white font-bold text-xs">View my booking requests</Link><Link href="/" className="block text-xs font-bold text-slate-600">Back to home</Link></div></div>}
        <Footer />
      </div>
    </AuthGuard>
  );
}

export default function CheckoutPage() {
  return <CheckoutContent />;
}
