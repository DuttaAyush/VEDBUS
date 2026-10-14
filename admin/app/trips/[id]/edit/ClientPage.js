"use client";

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Field, Notice, PageHeader, ResourceState } from '@/components/ui/AdminUI';
import { localDateTime, tripPayload, recordHref } from '@/lib/records';

export default function EditTripPage({ id }) {
  const router=useRouter(); const resource=useResource(useCallback(()=>id?Promise.all([apiData(`/api/admin/trips/${id}`),apiData('/api/admin/routes'),apiData('/api/admin/fleet')]):Promise.reject(new Error('A trip id is required.')),[id]));
  const [draft,setDraft]=useState(null); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  const serverForm=useMemo(()=>resource.data?(()=>{const [trip]=resource.data;return {routeId:trip.routeId||'',busId:trip.busId||'',departureDatetime:localDateTime(trip.departureDatetime),arrivalDatetime:localDateTime(trip.arrivalDatetime),baseFare:String(trip.baseFare||''),status:trip.status||'Scheduled',seatPricingConfig:trip.seatPricingConfig||{},seatStatuses:trip.seatStatuses||{}}})():null,[resource.data]);
  const form=draft||serverForm;
  async function submit(event){event.preventDefault();setError('');try{setSaving(true);await apiData(`/api/admin/trips/${id}`,{method:'PATCH',body:JSON.stringify({...tripPayload(form),seatPricingConfig:form.seatPricingConfig,seatStatuses:form.seatStatuses})});router.push('/trips');}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Edit trip" description={id ? `Canonical trip ID: ${id}` : 'Trip editor'}><span className="portal-actions"><Link href={recordHref('trips',id,'seats')}>Seat map</Link><Link href="/trips">Cancel</Link></span></PageHeader>{error&&<Notice error>{error}</Notice>}<ResourceState resource={resource}>{form&&<form onSubmit={submit} className="portal-card portal-grid"><Field label="Route"><select required value={form.routeId} onChange={e=>setDraft({...form,routeId:e.target.value})}>{resource.data[1].map(r=><option key={r.id} value={r.id}>{r.originCity} → {r.destinationCity}</option>)}</select></Field><Field label="Bus"><select required value={form.busId} onChange={e=>setDraft({...form,busId:e.target.value})}>{resource.data[2].map(b=><option key={b.id} value={b.id}>{b.plateNumber} · {b.type}</option>)}</select></Field><Field label="Departure"><input required type="datetime-local" value={form.departureDatetime} onChange={e=>setDraft({...form,departureDatetime:e.target.value})}/></Field><Field label="Arrival"><input required type="datetime-local" value={form.arrivalDatetime} onChange={e=>setDraft({...form,arrivalDatetime:e.target.value})}/></Field><Field label="Base fare"><input required type="number" min="1" value={form.baseFare} onChange={e=>setDraft({...form,baseFare:e.target.value})}/></Field><Field label="Status"><select value={form.status} onChange={e=>setDraft({...form,status:e.target.value})}>{['Scheduled','On_Time','Delayed','Completed','Cancelled'].map(status=><option key={status}>{status}</option>)}</select></Field><div className="portal-actions"><button className="primary" disabled={saving}>{saving?'Saving…':'Save trip'}</button></div></form>}</ResourceState></AdminShell>;
}
