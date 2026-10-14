"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import { Field, Notice, PageHeader } from '@/components/ui/AdminUI';
import { packagePayload } from '@/lib/records';

const initial = { title:'', category:'Domestic', pricePerPerson:'', durationDays:'', isActive:true, itinerary:'{}' };
export default function NewPackagePage() {
  const router = useRouter(); const [form,setForm]=useState(initial); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  async function submit(event){event.preventDefault();setError('');try{setSaving(true);await apiData('/api/admin/packages',{method:'POST',body:JSON.stringify(packagePayload(form))});router.push('/packages');}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Create package" description="A focused package form that preserves the itinerary JSON metadata."><Link href="/packages">Cancel</Link></PageHeader>{error&&<Notice error>{error}</Notice>}<form onSubmit={submit} className="portal-card portal-grid"><Field label="Title"><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></Field><Field label="Category"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Domestic</option><option>International</option><option>Spiritual</option></select></Field><Field label="Price per person"><input required type="number" min="1" value={form.pricePerPerson} onChange={e=>setForm({...form,pricePerPerson:e.target.value})}/></Field><Field label="Duration days"><input required type="number" min="1" value={form.durationDays} onChange={e=>setForm({...form,durationDays:e.target.value})}/></Field><Field label="Itinerary metadata (JSON object)"><textarea rows="10" value={form.itinerary} onChange={e=>setForm({...form,itinerary:e.target.value})}/></Field><label className="portal-field"><span>Status</span><select value={form.isActive?'active':'inactive'} onChange={e=>setForm({...form,isActive:e.target.value==='active'})}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><div className="portal-actions"><button className="primary" disabled={saving}>{saving?'Saving…':'Create package'}</button></div></form></AdminShell>;
}
