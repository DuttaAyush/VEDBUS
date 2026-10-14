"use client";

import { useCallback } from 'react';
import AdminShell from '@/components/layout/AdminShell';
import { apiData } from '@/lib/api';
import useResource from '@/lib/useResource';
import { Card, DataTable, PageHeader, ResourceState, Stats } from '@/components/ui/AdminUI';
import { money } from '@/lib/records';

export default function AnalyticsPage() {
  const revenue = useResource(useCallback(() => apiData('/api/admin/analytics/revenue?days=30'), []));
  const bookings = useResource(useCallback(() => apiData('/api/admin/analytics/bookings?days=30'), []));
  const routes = useResource(useCallback(() => apiData('/api/admin/analytics/routes'), []));
  return <AdminShell>
    <PageHeader title="Analytics" description="Live aggregates returned by the analytics endpoints."><button onClick={() => { revenue.reload(); bookings.reload(); routes.reload(); }}>Refresh</button></PageHeader>
    <ResourceState resource={revenue}><Stats items={[["Total revenue", money(revenue.data?.summary?.total)], ["Bus revenue", money(revenue.data?.summary?.totalBus)], ["Package revenue", money(revenue.data?.summary?.totalPackages)]]} /></ResourceState>
    <div className="portal-grid"><Card title="Revenue by day"><ResourceState resource={revenue}>{revenue.data?.chart?.length ? <DataTable rows={revenue.data.chart} columns={[{ label:'Date', render:r=>r.date }, { label:'Bus', render:r=>money(r.bus) }, { label:'Packages', render:r=>money(r.packages) }, { label:'Total', render:r=>money(r.total) }]} empty="No confirmed revenue records are available." /> : <p>No confirmed revenue records are available.</p>}</ResourceState></Card><Card title="Booking volume"><ResourceState resource={bookings}>{bookings.data ? <Stats items={[["Total", bookings.data.total], ["Bus", bookings.data.busBookings], ["Packages", bookings.data.packageBookings]]} /> : null}</ResourceState></Card></div>
    <Card title="Popular routes"><ResourceState resource={routes}><DataTable rows={Array.isArray(routes.data) ? routes.data : []} empty="No route booking aggregates are available." columns={[{ label:'Route', render:r=>r.name }, { label:'Bookings', render:r=>r.bookings }, { label:'Revenue', render:r=>money(r.revenue) }]} /></ResourceState></Card>
  </AdminShell>;
}
