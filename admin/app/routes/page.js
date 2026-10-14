"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { recordHref, displayId } from '@/lib/records';

export default function RoutesPage() {
  const resource = useResource(useCallback(() => apiData('/api/admin/routes'), []));
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const routes = Array.isArray(resource.data) ? resource.data : [];
  const filtered = routes.filter(route => `${route.originCity} ${route.destinationCity} ${route.id}`.toLowerCase().includes(search.toLowerCase()));
  async function remove(route) {
    if (!window.confirm(`Delete ${route.originCity} → ${route.destinationCity}?`)) return;
    try { await apiData(`/api/admin/routes/${route.id}`, { method:'DELETE' }); resource.reload(); } catch (error) { setMessage(error.message); }
  }
  return <AdminShell>
    <PageHeader title="Bus routes" description="Manage route definitions and intermediate stops."><Link className="primary" href="/routes/new">Add route</Link></PageHeader>
    {message && <Notice error>{message}</Notice>}
    <ResourceState resource={resource}>
      <Stats items={[["Total routes", routes.length], ["Cities", new Set(routes.flatMap(r => [r.originCity, r.destinationCity])).size], ["Trips using routes", routes.reduce((sum, r) => sum + (r._count?.trips || 0), 0)]]} />
      <input className="portal-filter" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search route or city" />
      <DataTable rows={filtered} empty="No routes are registered." columns={[{ label:'Route ID', render:r=><Link href={recordHref('routes', r.id, 'edit')} title={r.id}>{displayId(r.id)}</Link> }, { label:'From', render:r=>r.originCity }, { label:'To', render:r=>r.destinationCity }, { label:'Stops', render:r=>Array.isArray(r.waypoints) ? r.waypoints.join(', ') || 'Direct' : 'Direct' }, { label:'Distance', render:r=>`${r.distanceKm} km` }, { label:'Actions', render:r=><span className="portal-actions"><Link href={recordHref('routes', r.id, 'edit')}>Edit</Link><button onClick={() => remove(r)}>Delete</button></span> }]} />
    </ResourceState>
  </AdminShell>;
}
