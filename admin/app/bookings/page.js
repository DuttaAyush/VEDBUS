"use client";

import { useCallback, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime, displayId, money, recordHref } from '@/lib/records';

export default function BusBookingsPage() {
  const resource=useResource(useCallback(()=>apiData('/api/admin/bookings?limit=50'),[])); const [search,setSearch]=useState(''); const [message,setMessage]=useState('');
  const bookings=resource.data?.bookings||[]; const filtered=bookings.filter(b=>`${b.id} ${b.user?.name||''} ${b.user?.email||''}`.toLowerCase().includes(search.toLowerCase()));
  return <AdminShell><PageHeader title="Bus bookings" description="Live bus booking records and status controls." />{message&&<Notice error>{message}</Notice>}<ResourceState resource={resource}><Stats items={[["Total",bookings.length],["Confirmed",bookings.filter(b=>b.status==='Confirmed').length],["Pending",bookings.filter(b=>b.status==='Pending').length],["Cancelled",bookings.filter(b=>b.status==='Cancelled').length]]} /><input className="portal-filter" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search booking, customer, or email" /><DataTable rows={filtered} empty="No bus bookings are available." columns={[{label:'Booking',render:b=><a href={recordHref('bookings',b.id)} title={b.id}>{displayId(b.id)}</a>},{label:'Customer',render:b=><>{b.user?.name||'—'}<br/><small>{b.user?.email||'—'}</small></>},{label:'Route',render:b=>`${b.trip?.route?.originCity||'—'} → ${b.trip?.route?.destinationCity||'—'}`},{label:'Departure',render:b=>dateTime(b.trip?.departureDatetime)},{label:'Seats',render:b=>(b.seatNumbers||[]).join(', ')||'—'},{label:'Amount',render:b=>money(b.totalAmount)},{label:'Status',render:b=>b.status}]} /></ResourceState></AdminShell>;
}
