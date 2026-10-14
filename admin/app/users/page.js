"use client";

import { useCallback, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { displayId, recordHref } from '@/lib/records';

export default function UsersPage() {
  const resource = useResource(useCallback(() => apiData('/api/admin/users?limit=50'), []));
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const users = resource.data?.users || [];
  const filtered = users.filter(user => `${user.name} ${user.email} ${user.phone}`.toLowerCase().includes(search.toLowerCase()));
  async function toggle(user) { try { await apiData(`/api/admin/users/${user.id}/status`, { method:'PATCH', body:JSON.stringify({ action:user.isActive === false ? 'unblock' : 'block' }) }); resource.reload(); } catch (error) { setMessage(error.message); } }
  async function remove(user) { if (!window.confirm(`Delete ${user.name}?`)) return; try { await apiData(`/api/admin/users/${user.id}`, { method:'DELETE' }); resource.reload(); } catch (error) { setMessage(error.message); } }
  return <AdminShell>
    <PageHeader title="Customer directory" description="Live customer accounts returned by the admin API." />
    {message && <Notice error>{message}</Notice>}
    <ResourceState resource={resource}><Stats items={[["Customers", users.length], ["Active", users.filter(u=>u.isActive !== false).length], ["Blocked", users.filter(u=>u.isActive === false).length]]} /><input className="portal-filter" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, or phone" /><DataTable rows={filtered} empty="No customer accounts are available." columns={[{label:'Customer',render:u=><a href={recordHref('users',u.id)} title={u.id}>{u.name || '—'}<small> · {displayId(u.id)}</small></a>},{label:'Email',render:u=>u.email},{label:'Phone',render:u=>u.phone || '—'},{label:'Bookings',render:u=>(u._count?.busBookings || 0) + (u._count?.packageBookings || 0)},{label:'Status',render:u=>u.isActive === false ? 'Blocked' : 'Active'},{label:'Actions',render:u=><span className="portal-actions"><button onClick={()=>toggle(u)}>{u.isActive === false ? 'Unblock' : 'Block'}</button><button onClick={()=>remove(u)}>Delete</button></span>}]} /></ResourceState>
  </AdminShell>;
}
