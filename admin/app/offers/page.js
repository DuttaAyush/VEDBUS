"use client";

import { useCallback, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Card, DataTable, Field, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime, money } from '@/lib/records';

const emptyForm = { code:'', discountPercentage:'', maxDiscountAmount:'', validUntil:'' };
export default function OffersPage() {
  const resource = useResource(useCallback(() => apiData('/api/admin/offers'), []));
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const offers = Array.isArray(resource.data) ? resource.data : [];
  async function create(event) { event.preventDefault(); setSaving(true); setMessage(''); try { await apiData('/api/admin/offers', { method:'POST', body:JSON.stringify({ ...form, discountPercentage:Number(form.discountPercentage), maxDiscountAmount:Number(form.maxDiscountAmount) }) }); setForm(emptyForm); resource.reload(); } catch(error) { setMessage(error.message); } finally { setSaving(false); } }
  async function toggle(offer) { try { await apiData(`/api/admin/offers/${offer.id}`, { method:'PATCH', body:JSON.stringify({ isActive:!offer.isActive }) }); resource.reload(); } catch(error) { setMessage(error.message); } }
  async function remove(offer) { if (!window.confirm(`Delete offer ${offer.code}?`)) return; try { await apiData(`/api/admin/offers/${offer.id}`, { method:'DELETE' }); resource.reload(); } catch(error) { setMessage(error.message); } }
  return <AdminShell><PageHeader title="Offers & coupons" description="Persisted promotional offers from the admin API." />{message && <Notice error>{message}</Notice>}<ResourceState resource={resource}><Stats items={[["Offers", offers.length], ["Active", offers.filter(o=>o.isActive).length], ["Redemptions", offers.reduce((sum,o)=>sum+(o.timesUsed || 0),0)]]} /><div className="portal-grid"><Card title="Create offer"><form onSubmit={create}><Field label="Code"><input required value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} /></Field><Field label="Discount percentage"><input required type="number" min="1" max="100" value={form.discountPercentage} onChange={e=>setForm({...form,discountPercentage:e.target.value})} /></Field><Field label="Maximum discount amount"><input required type="number" min="1" value={form.maxDiscountAmount} onChange={e=>setForm({...form,maxDiscountAmount:e.target.value})} /></Field><Field label="Valid until"><input required type="date" value={form.validUntil} onChange={e=>setForm({...form,validUntil:e.target.value})} /></Field><button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Create offer'}</button></form></Card><Card title="Offer rules"><p>The backend currently supports percentage discounts and maximum discount amounts. Unsupported flat-discount fields are not shown as saveable controls.</p></Card></div><DataTable rows={offers} empty="No offers have been created." columns={[{label:'Code',render:o=>o.code},{label:'Discount',render:o=>`${o.discountPercentage}% up to ${money(o.maxDiscountAmount)}`},{label:'Valid until',render:o=>dateTime(o.validUntil)},{label:'Used',render:o=>o.timesUsed || 0},{label:'Status',render:o=>o.isActive ? 'Active' : 'Inactive'},{label:'Actions',render:o=><span className="portal-actions"><button onClick={()=>toggle(o)}>{o.isActive ? 'Disable' : 'Enable'}</button><button onClick={()=>remove(o)}>Delete</button></span>}]} /></ResourceState></AdminShell>;
}
