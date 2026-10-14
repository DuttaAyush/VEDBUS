"use client";

import { useCallback, useState } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { dateTime } from '@/lib/records';

export default function SupportPage() {
  const resource=useResource(useCallback(()=>apiData('/api/admin/support?limit=50'),[])); const [message,setMessage]=useState(''); const tickets=resource.data?.tickets||[];
  async function update(ticket,status){try{await apiData(`/api/admin/support/${ticket.id}`,{method:'PATCH',body:JSON.stringify({status})});resource.reload();}catch(e){setMessage(e.message);}}
  return <AdminShell><PageHeader title="Support tickets" description="Live support records and persisted status updates." />{message&&<Notice error>{message}</Notice>}<ResourceState resource={resource}><Stats items={[["Tickets",tickets.length],["Open",tickets.filter(t=>t.status==='Open').length],["In progress",tickets.filter(t=>t.status==='In_Progress').length],["Resolved",tickets.filter(t=>t.status==='Resolved').length]]} /><DataTable rows={tickets} empty="No support tickets are available." columns={[{label:'Ticket',render:t=>t.id},{label:'Customer',render:t=>t.user?.name||'—'},{label:'Subject',render:t=>t.subject||t.message||'—'},{label:'Created',render:t=>dateTime(t.createdAt)},{label:'Status',render:t=><select value={t.status} onChange={e=>update(t,e.target.value)}><option>Open</option><option>In_Progress</option><option>Resolved</option><option>Closed</option></select>}]} /></ResourceState></AdminShell>;
}
