"use client";

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Field, Notice, PageHeader, ResourceState } from '@/components/ui/AdminUI';

export default function EditRoutePage({ id }) {
  const router=useRouter(); const resource=useResource(useCallback(()=>id?apiData(`/api/admin/routes/${id}`):Promise.reject(new Error('A route id is required.')),[id]));
  const [draft,setDraft]=useState(null); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  const serverForm=useMemo(()=>resource.data?{originCity:resource.data.originCity||'',destinationCity:resource.data.destinationCity||'',distanceKm:String(resource.data.distanceKm||''),waypoints:Array.isArray(resource.data.waypoints)?resource.data.waypoints.join(', '):''}:null,[resource.data]);
  const form=draft||serverForm;
  async function submit(event){event.preventDefault();setError('');if(form.originCity.trim().toLowerCase()===form.destinationCity.trim().toLowerCase()){setError('Origin and destination must be different.');return;}try{setSaving(true);await apiData(`/api/admin/routes/${id}`,{method:'PATCH',body:JSON.stringify({...form,distanceKm:Number(form.distanceKm),waypoints:form.waypoints.split(',').map(v=>v.trim()).filter(Boolean)})});router.push('/routes');}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Edit route" description={id ? `Canonical route ID: ${id}` : 'Route editor'}><Link href="/routes">Cancel</Link></PageHeader>{error&&<Notice error>{error}</Notice>}<ResourceState resource={resource}>{form&&<form onSubmit={submit} className="portal-card portal-grid"><Field label="Origin city"><input required value={form.originCity} onChange={e=>setDraft({...form,originCity:e.target.value})}/></Field><Field label="Destination city"><input required value={form.destinationCity} onChange={e=>setDraft({...form,destinationCity:e.target.value})}/></Field><Field label="Distance (km)"><input required type="number" min="1" value={form.distanceKm} onChange={e=>setDraft({...form,distanceKm:e.target.value})}/></Field><Field label="Intermediate stops (comma separated)"><input value={form.waypoints} onChange={e=>setDraft({...form,waypoints:e.target.value})}/></Field><div className="portal-actions"><button className="primary" disabled={saving}>{saving?'Saving…':'Save route'}</button></div></form>}</ResourceState></AdminShell>;
}
