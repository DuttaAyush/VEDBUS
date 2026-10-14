"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Card, DataTable, Field, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime, displayId, money, recordHref } from '@/lib/records';

export default function BusBookingDetailPage({ id }) {
  const resource=useResource(useCallback(()=>id?apiData(`/api/admin/bookings/${id}`):Promise.reject(new Error('A booking id is required.')),[id]));
  const [status,setStatus]=useState(''); const [message,setMessage]=useState(''); const [saving,setSaving]=useState(false);
  const booking=resource.data; const activeStatus=status || booking?.status || '';
  async function update(){setMessage('');try{setSaving(true);await apiData(`/api/admin/bookings/${id}/status`,{method:'PATCH',body:JSON.stringify({status:activeStatus})});setMessage('Booking status saved.');resource.reload();}catch(e){setMessage(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Booking details" description={id ? `Canonical booking ID: ${id}` : 'Booking details'}><Link href="/bookings">Back to bookings</Link></PageHeader>{message&&<Notice error={message.includes('failed')||message.includes('not')}>{message}</Notice>}<ResourceState resource={resource}>{booking&&<><div className="portal-grid"><Card title="Booking"><p><strong>{displayId(booking.id)}</strong></p><p>Created: {dateTime(booking.bookingDate)}</p><p>Status: {booking.status}</p></Card><Card title="Customer"><p>{booking.user?.name || '—'}</p><p>{booking.user?.email || '—'}</p><p>{booking.user?.phone || '—'}</p>{booking.user?.id&&<Link href={recordHref('users',booking.user.id)}>View user</Link>}</Card><Card title="Trip"><p>{booking.trip?.route?.originCity || '—'} → {booking.trip?.route?.destinationCity || '—'}</p><p>Departure: {dateTime(booking.trip?.departureDatetime)}</p><p>Bus: {booking.trip?.bus?.plateNumber || '—'} · {booking.trip?.bus?.type || '—'}</p><p>Seats: {(booking.seatNumbers||[]).join(', ') || '—'}</p></Card><Card title="Payment"><Stats items={[["Total",money(booking.totalAmount)], ["Transaction",booking.transactionId || 'Not recorded']]} /></Card></div><Card title="Admin status action"><Field label="Status"><select value={activeStatus} onChange={e=>setStatus(e.target.value)}><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>Refunded</option></select></Field><p>Refunded is a manual record only. No gateway refund is initiated by this panel.</p><button className="primary" onClick={update} disabled={saving || !activeStatus}>{saving?'Saving…':'Save status'}</button></Card><Card title="Passenger details"><DataTable rows={booking.passengers||[]} empty="Passenger detail was not supplied by the API." columns={[{label:'Name',render:p=>p.name},{label:'Age',render:p=>p.age},{label:'Gender',render:p=>p.gender},{label:'Seat',render:p=>p.seat || '—'}]} /></Card><button className="no-print" onClick={()=>window.print()}>Print live booking details</button></>}</ResourceState></AdminShell>;
}
