"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Card, DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime, money, recordHref } from '@/lib/records';

export default function UserDetailPage({ id }) {
  const router = useRouter();
  const resource = useResource(useCallback(() => id ? apiData(`/api/admin/users/${id}`) : Promise.reject(new Error('A user id is required.')), [id]));
  const [message, setMessage] = useState('');
  async function toggle(user) { try { await apiData(`/api/admin/users/${user.id}/status`, { method:'PATCH', body:JSON.stringify({ action:user.isActive === false ? 'unblock' : 'block' }) }); resource.reload(); } catch (error) { setMessage(error.message); } }
  async function remove(user) { if (!window.confirm(`Delete ${user.name}?`)) return; try { await apiData(`/api/admin/users/${user.id}`, { method:'DELETE' }); router.push('/users'); } catch (error) { setMessage(error.message); } }
  return <AdminShell><PageHeader title="User details" description="Live customer account and booking history."><Link href="/users">Back to users</Link></PageHeader>{message && <Notice error>{message}</Notice>}<ResourceState resource={resource}>{resource.data && <><Card><h2>{resource.data.name} <small title={resource.data.id}>{resource.data.id}</small></h2><p>{resource.data.email} · {resource.data.phone || 'No phone'}</p><p>Joined {dateTime(resource.data.createdAt)} · {resource.data.isActive === false ? 'Blocked' : 'Active'}</p><div className="portal-actions"><button onClick={()=>toggle(resource.data)}>{resource.data.isActive === false ? 'Unblock' : 'Block'} user</button><button onClick={()=>remove(resource.data)}>Delete user</button></div></Card><Stats items={[["Bus bookings", resource.data._count?.busBookings], ["Package bookings", resource.data._count?.packageBookings], ["Confirmed spend", money(resource.data.totalSpend)]]} /><Card title="Bus booking history"><DataTable rows={resource.data.busBookings || []} empty="No bus bookings for this user." columns={[{label:'Booking',render:b=><Link href={recordHref('bookings',b.id)}>{b.id}</Link>},{label:'Trip',render:b=>`${b.trip?.route?.originCity || '—'} → ${b.trip?.route?.destinationCity || '—'}`},{label:'Date',render:b=>dateTime(b.bookingDate)},{label:'Amount',render:b=>money(b.totalAmount)},{label:'Status',render:b=>b.status}]} /></Card><Card title="Package booking history"><DataTable rows={resource.data.packageBookings || []} empty="No package bookings for this user." columns={[{label:'Booking',render:b=><Link href={recordHref('package-bookings',b.id)}>{b.id}</Link>},{label:'Package',render:b=>b.package?.title || '—'},{label:'Travel date',render:b=>dateTime(b.travelDate)},{label:'Amount',render:b=>money(b.totalAmount)},{label:'Status',render:b=>b.status}]} /></Card></>}</ResourceState></AdminShell>;
}
