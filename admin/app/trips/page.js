"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { displayId, dateTime, recordHref } from '@/lib/records';

export default function TripsPage() {
  const resource = useResource(useCallback(() => apiData('/api/admin/trips?limit=50'), []));
  const [message, setMessage] = useState('');
  const trips = resource.data?.trips || [];
  async function cancel(trip) {
    if (!window.confirm(`Cancel trip ${displayId(trip.id)}?`)) return;
    try { await apiData(`/api/admin/trips/${trip.id}`, { method:'PATCH', body:JSON.stringify({ status:'Cancelled' }) }); resource.reload(); } catch (error) { setMessage(error.message); }
  }
  return <AdminShell>
    <PageHeader title="Trips & operations" description="Live scheduled trips, assignments, capacity, and status."><Link className="primary" href="/trips/new">Create trip</Link></PageHeader>
    {message && <Notice error>{message}</Notice>}
    <ResourceState resource={resource}><Stats items={[["Total trips", trips.length], ["Scheduled", trips.filter(t => ['Scheduled','On_Time'].includes(t.status)).length], ["Delayed", trips.filter(t => t.status === 'Delayed').length], ["Completed", trips.filter(t => t.status === 'Completed').length]]} /><DataTable rows={trips} empty="No trips are scheduled." columns={[{label:'Trip ID',render:t=><Link href={recordHref('trips',t.id,'edit')} title={t.id}>{displayId(t.id)}</Link>},{label:'Route',render:t=>`${t.route?.originCity || '—'} → ${t.route?.destinationCity || '—'}`},{label:'Bus',render:t=>t.bus?.plateNumber || '—'},{label:'Departure',render:t=>dateTime(t.departureDatetime)},{label:'Seats',render:t=>`${t.seatsLeft ?? '—'} / ${t.bus?.totalSeats ?? '—'}`},{label:'Status',render:t=>t.status || '—'},{label:'Actions',render:t=><span className="portal-actions"><Link href={recordHref('trips',t.id,'seats')}>Seats</Link><Link href={recordHref('trips',t.id,'edit')}>Edit</Link>{t.status !== 'Cancelled' && <button onClick={() => cancel(t)}>Cancel</button>}</span>}]} /></ResourceState>
  </AdminShell>;
}
