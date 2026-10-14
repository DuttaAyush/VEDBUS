"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { displayId, money, recordHref } from '@/lib/records';

export default function PackagesPage() {
  const resource = useResource(useCallback(() => apiData('/api/admin/packages'), []));
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const packages = Array.isArray(resource.data) ? resource.data : [];
  const filtered = packages.filter(pkg => `${pkg.title} ${pkg.category}`.toLowerCase().includes(search.toLowerCase()));
  async function remove(pkg) { if (!window.confirm(`Delete or deactivate ${pkg.title}?`)) return; try { await apiData(`/api/admin/packages/${pkg.id}`, { method:'DELETE' }); resource.reload(); } catch (error) { setMessage(error.message); } }
  return <AdminShell>
    <PageHeader title="Holiday packages" description="Create and manage the package catalogue using persisted itinerary metadata."><Link className="primary" href="/packages/new">Add package</Link></PageHeader>
    {message && <Notice error>{message}</Notice>}
    <ResourceState resource={resource}><Stats items={[["Total packages", packages.length], ["Active", packages.filter(p => p.isActive !== false).length], ["Inactive", packages.filter(p => p.isActive === false).length]]} /><input className="portal-filter" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search package or category" /><DataTable rows={filtered} empty="No packages are available." columns={[{label:'Package',render:p=><Link href={recordHref('packages',p.id,'edit')} title={p.id}>{p.title}<small> · {displayId(p.id)}</small></Link>},{label:'Category',render:p=>p.category},{label:'Duration',render:p=>`${p.durationDays || '—'} days`},{label:'Price',render:p=>money(p.pricePerPerson)},{label:'Status',render:p=>p.isActive === false ? 'Inactive' : 'Active'},{label:'Actions',render:p=><span className="portal-actions"><Link href={recordHref('packages',p.id,'edit')}>Edit</Link><button onClick={() => remove(p)}>Delete</button></span>}]} /></ResourceState>
  </AdminShell>;
}
