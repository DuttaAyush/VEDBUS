"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import { Field, Notice, PageHeader } from '@/components/ui/AdminUI';

export default function NewRoutePage() {
  const router=useRouter(); const [form,setForm]=useState({originCity:'',destinationCity:'',distanceKm:'',waypoints:''}); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  async function submit(event){event.preventDefault();setError('');if(form.originCity.trim().toLowerCase()===form.destinationCity.trim().toLowerCase()){setError('Origin and destination must be different.');return;}try{setSaving(true);await apiData('/api/admin/routes',{method:'POST',body:JSON.stringify({originCity:form.originCity.trim(),destinationCity:form.destinationCity.trim(),distanceKm:Number(form.distanceKm),waypoints:form.waypoints.split(',').map(v=>v.trim()).filter(Boolean)})});router.push('/routes');}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Create route" description="Define the route fields supported by the admin API."><Link href="/routes">Cancel</Link></PageHeader>{error&&<Notice error>{error}</Notice>}<form onSubmit={submit} className="portal-card portal-grid"><Field label="Origin city"><input required value={form.originCity} onChange={e=>setForm({...form,originCity:e.target.value})}/></Field><Field label="Destination city"><input required value={form.destinationCity} onChange={e=>setForm({...form,destinationCity:e.target.value})}/></Field><Field label="Distance (km)"><input required type="number" min="1" value={form.distanceKm} onChange={e=>setForm({...form,distanceKm:e.target.value})}/></Field><Field label="Intermediate stops (comma separated)"><input value={form.waypoints} onChange={e=>setForm({...form,waypoints:e.target.value})}/></Field><div className="portal-actions"><button className="primary" disabled={saving}>{saving?'Saving…':'Create route'}</button></div></form></AdminShell>;
}
