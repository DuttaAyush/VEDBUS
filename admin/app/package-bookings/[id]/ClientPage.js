"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Card, DataTable, Field, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime, displayId, money } from '@/lib/records';

export default function PackageBookingDetailPage({ id }) {
  const resource=useResource(useCallback(()=>id?apiData(`/api/admin/package-bookings/${id}`):Promise.reject(new Error('A package booking id is required.')),[id]));
  const [status,setStatus]=useState(''); const [message,setMessage]=useState(''); const [saving,setSaving]=useState(false); const booking=resource.data; const active=status||booking?.status||'';
  async function update(){setMessage('');try{setSaving(true);await apiData(`/api/admin/package-bookings/${id}/status`,{method:'PATCH',body:JSON.stringify({status:active})});setMessage('Package booking status saved.');resource.reload();}catch(e){setMessage(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Package booking details" description={id ? `Canonical booking ID: ${id}` : 'Package booking'}><Link href="/package-bookings">Back to package bookings</Link></PageHeader>{message&&<Notice>{message}</Notice>}<ResourceState resource={resource}>{booking&&<><div className="portal-grid"><Card title="Booking"><p><strong>{displayId(booking.id)}</strong></p><p>Created: {dateTime(booking.createdAt)}</p><p>Travel date: {dateTime(booking.travelDate)}</p><p>Status: {booking.status}</p></Card><Card title="Customer"><p>{booking.user?.name||'—'}</p><p>{booking.user?.email||'—'}</p><p>{booking.user?.phone||'—'}</p></Card><Card title="Package"><p>{booking.package?.title||'—'}</p><p>{booking.package?.category||'—'} · {booking.package?.durationDays||'—'} days</p></Card><Card title="Payment"><Stats items={[["Total",money(booking.totalAmount)],["Travellers",booking.travelersCount]]} /></Card></div><Card title="Admin status action"><Field label="Status"><select value={active} onChange={e=>setStatus(e.target.value)}><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>Refunded</option></select></Field><p>Refunded is a manual record only; this panel does not call a payment gateway.</p><button className="primary" onClick={update} disabled={saving}>{saving?'Saving…':'Save status'}</button></Card><Card title="Travellers"><DataTable rows={booking.travelers||[]} empty="Traveller details were not supplied by the API." columns={[{label:'Name',render:t=>t.name},{label:'Age',render:t=>t.age},{label:'Gender',render:t=>t.gender}]} /></Card></>}</ResourceState></AdminShell>;
}
