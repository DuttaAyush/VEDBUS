"use client";

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Field, Notice, PageHeader, ResourceState } from '@/components/ui/AdminUI';
import { packagePayload } from '@/lib/records';

export default function EditPackagePage({ id }) {
  const router=useRouter(); const resource=useResource(useCallback(()=>id?apiData(`/api/admin/packages/${id}`):Promise.reject(new Error('A package id is required.')),[id]));
  const [draft,setDraft]=useState(null); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  const serverForm=useMemo(()=>resource.data?{title:resource.data.title||'',category:resource.data.category||'Domestic',pricePerPerson:String(resource.data.pricePerPerson||''),durationDays:String(resource.data.durationDays||''),isActive:resource.data.isActive!==false,itinerary:JSON.stringify(resource.data.itinerary||{},null,2)}:null,[resource.data]);
  const form=draft||serverForm;
  async function submit(event){event.preventDefault();setError('');try{setSaving(true);await apiData(`/api/admin/packages/${id}`,{method:'PATCH',body:JSON.stringify(packagePayload(form))});router.push('/packages');}catch(e){setError(e.message);}finally{setSaving(false);}}
  return <AdminShell><PageHeader title="Edit package" description={id ? `Canonical package ID: ${id}` : 'Package editor'}><Link href="/packages">Cancel</Link></PageHeader>{error&&<Notice error>{error}</Notice>}<ResourceState resource={resource}>{form&&<form onSubmit={submit} className="portal-card portal-grid"><Field label="Title"><input required value={form.title} onChange={e=>setDraft({...form,title:e.target.value})}/></Field><Field label="Category"><select value={form.category} onChange={e=>setDraft({...form,category:e.target.value})}><option>Domestic</option><option>International</option><option>Spiritual</option></select></Field><Field label="Price per person"><input required type="number" min="1" value={form.pricePerPerson} onChange={e=>setDraft({...form,pricePerPerson:e.target.value})}/></Field><Field label="Duration days"><input required type="number" min="1" value={form.durationDays} onChange={e=>setDraft({...form,durationDays:e.target.value})}/></Field><Field label="Itinerary metadata (JSON object)"><textarea rows="14" value={form.itinerary} onChange={e=>setDraft({...form,itinerary:e.target.value})}/></Field><label className="portal-field"><span>Status</span><select value={form.isActive?'active':'inactive'} onChange={e=>setDraft({...form,isActive:e.target.value==='active'})}><option value="active">Active</option><option value="inactive">Inactive</option></select></label><div className="portal-actions"><button className="primary" disabled={saving}>{saving?'Saving…':'Save package'}</button></div></form>}</ResourceState></AdminShell>;
}
