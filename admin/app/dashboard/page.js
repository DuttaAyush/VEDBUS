"use client";

import { useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Card, DataTable, Notice, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { displayId, money, dateTime, recordHref } from '@/lib/records';

export default function DashboardPage() {
  const loader = useCallback(() => apiData('/api/admin/dashboard/stats'), []);
  const resource = useResource(loader);
  const stats = resource.data?.stats || {};
  const recent = resource.data?.recentBookings || [];
  const revenue = resource.data?.revenueChart || [];
  const rows = recent.map((booking) => ({ ...booking, displayId: displayId(booking.id) }));
  return <AdminShell>
    <PageHeader title="Operations dashboard" description="Live operational totals from the admin API."><button onClick={resource.reload}>Refresh</button></PageHeader>
    <ResourceState resource={resource}>
      <Stats items={[["Total revenue", money(stats.totalRevenue)], ["Total bookings", stats.totalBookings], ["Active trips", stats.activeTrips], ["Registered users", stats.totalUsers]]} />
      <div className="portal-grid">
        <Card title="Revenue overview"><p>Confirmed revenue by day for the available reporting window.</p>{revenue.length ? <ul>{revenue.map(item => <li key={item.date}>{item.date}: {money(item.amount)}</li>)}</ul> : <Notice>No confirmed revenue records are available.</Notice>}</Card>
        <Card title="Booking mix"><p>Bus bookings: {stats.busBookings ?? '—'} · Package bookings: {stats.packageBookings ?? '—'}</p><Link href="/bookings">Open bus bookings</Link> · <Link href="/package-bookings">Open package bookings</Link></Card>
      </div>
      <DataTable rows={rows} empty="No recent bookings are available." columns={[
        { label:'Booking ID', render: row => <Link href={row.type === 'Package' ? recordHref('package-bookings', row.id) : recordHref('bookings', row.id)} title={row.id}>{row.displayId}</Link> },
        { label:'Type', render: row => row.type || '—' },
        { label:'Customer', render: row => <>{row.customer || '—'}<br /><small>{row.email || '—'}</small></> },
        { label:'Route / package', render: row => row.route || '—' },
        { label:'Date', render: row => dateTime(row.date) },
        { label:'Amount', render: row => money(row.amount) },
        { label:'Status', render: row => row.status || '—' },
      ]} />
    </ResourceState>
  </AdminShell>;
}
