"use client";

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Field, Notice, PageHeader, ResourceState } from '@/components/ui/AdminUI';
import { tripPayload } from '@/lib/records';

export default function NewTripPage() {
  const router=useRouter(); const resource=useResource(useCallback(()=>Promise.all([apiData('/api/admin/routes'),apiData('/api/admin/fleet')]),[]));
  const [form,setForm]=useState({routeId:'',busId:'',departureDatetime:'',arrivalDatetime:'',baseFare:''}); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  async function submit(event){event.preventDefault();setError('');try{setSaving(true);await apiData('/api/admin/trips',{method:'POST',body:JSON.stringify(tripPayload(form))});router.push('/trips');}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Create trip" description="Select real persisted route and bus records, then set both timestamps."><Link href="/trips">Cancel</Link></PageHeader>{error&&<Notice error>{error}</Notice>}<ResourceState resource={resource}>{resource.data&&<form onSubmit={submit} className="portal-card portal-grid"><Field label="Route"><select required value={form.routeId} onChange={e=>setForm({...form,routeId:e.target.value})}><option value="">Select a route</option>{resource.data[0].map(r=><option key={r.id} value={r.id}>{r.originCity} → {r.destinationCity}</option>)}</select></Field><Field label="Bus"><select required value={form.busId} onChange={e=>setForm({...form,busId:e.target.value})}><option value="">Select a bus</option>{resource.data[1].map(b=><option key={b.id} value={b.id}>{b.plateNumber} · {b.type}</option>)}</select></Field><Field label="Departure"><input required type="datetime-local" value={form.departureDatetime} onChange={e=>setForm({...form,departureDatetime:e.target.value})}/></Field><Field label="Arrival"><input required type="datetime-local" value={form.arrivalDatetime} onChange={e=>setForm({...form,arrivalDatetime:e.target.value})}/></Field><Field label="Base fare"><input required type="number" min="1" value={form.baseFare} onChange={e=>setForm({...form,baseFare:e.target.value})}/></Field><div className="portal-actions"><button className="primary" disabled={saving}>{saving?'Saving…':'Create trip'}</button></div></form>}</ResourceState></AdminShell>;
}
