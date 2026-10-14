"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { recordHref, displayId, dateTime } from '@/lib/records';

export default function BusesPage() {
  const resource = useResource(useCallback(() => apiData('/api/admin/fleet'), []));
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const buses = Array.isArray(resource.data) ? resource.data : [];
  const filtered = buses.filter(bus => `${bus.plateNumber} ${bus.type}`.toLowerCase().includes(search.toLowerCase()));
  async function remove(bus) {
    if (!window.confirm(`Remove bus ${bus.plateNumber}?`)) return;
    try { await apiData(`/api/admin/fleet/${bus.id}`, { method:'DELETE' }); resource.reload(); } catch (error) { setMessage(error.message); }
  }
  return <AdminShell>
    <PageHeader title="Bus fleet" description="Manage only buses returned by the fleet service."><Link className="primary" href="/buses/new">Add bus</Link></PageHeader>
    {message && <Notice error>{message}</Notice>}
    <ResourceState resource={resource}>
      <Stats items={[["Total buses", buses.length], ["Active", buses.filter(b => b.status === 'Active').length], ["Maintenance", buses.filter(b => b.status === 'In_Maintenance').length], ["Retired", buses.filter(b => b.status === 'Retired').length]]} />
      <input className="portal-filter" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search registration or type" />
      <DataTable rows={filtered} empty="No buses are registered." columns={[{ label:'Registration', render:b=><Link href={recordHref('buses', b.id, 'edit')}>{b.plateNumber}<small title={b.id}> · {displayId(b.id)}</small></Link> }, { label:'Type', render:b=>b.type }, { label:'Seats', render:b=>b.totalSeats }, { label:'Status', render:b=>b.status || '—' }, { label:'Last serviced', render:b=>dateTime(b.lastServiced) }, { label:'Actions', render:b=><span className="portal-actions"><Link href={recordHref('buses', b.id, 'edit')}>Edit</Link><button onClick={() => remove(b)}>Delete</button></span> }]} />
    </ResourceState>
  </AdminShell>;
}
