"use client";

import { useCallback, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime, displayId, money } from '@/lib/records';

export default function PackageBookingsPage() {
  const resource=useResource(useCallback(()=>apiData('/api/admin/package-bookings?limit=50&page=1'),[])); const [search,setSearch]=useState(''); const [message,setMessage]=useState('');
  const bookings=resource.data?.bookings||[]; const filtered=bookings.filter(b=>`${b.id} ${b.user?.name||''} ${b.package?.title||''}`.toLowerCase().includes(search.toLowerCase()));
  async function status(booking,value){try{await apiData(`/api/admin/package-bookings/${booking.id}/status`,{method:'PATCH',body:JSON.stringify({status:value})});resource.reload();}catch(e){setMessage(e.message);}}
  return <AdminShell><PageHeader title="Package bookings" description="Live holiday package booking records and persisted status updates." />{message&&<Notice error>{message}</Notice>}<ResourceState resource={resource}><Stats items={[["Total",bookings.length],["Confirmed",bookings.filter(b=>b.status==='Confirmed').length],["Pending",bookings.filter(b=>b.status==='Pending').length],["Cancelled",bookings.filter(b=>b.status==='Cancelled').length]]} /><input className="portal-filter" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search booking, customer, or package" /><DataTable rows={filtered} empty="No package bookings are available." columns={[{label:'Booking',render:b=><a href={`/package-bookings/view?id=${encodeURIComponent(b.id)}`} title={b.id}>{displayId(b.id)}</a>},{label:'Customer',render:b=>b.user?.name||'—'},{label:'Package',render:b=>b.package?.title||'—'},{label:'Travel date',render:b=>dateTime(b.travelDate)},{label:'Travellers',render:b=>b.travelersCount||'—'},{label:'Amount',render:b=>money(b.totalAmount)},{label:'Status',render:b=><select value={b.status} onChange={e=>status(b,e.target.value)}><option>Pending</option><option>Confirmed</option><option>Cancelled</option><option>Refunded</option></select>}]} /></ResourceState></AdminShell>;
}
