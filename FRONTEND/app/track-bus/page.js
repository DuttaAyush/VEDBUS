'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackBusClient from './[id]/TrackBusClient';

function TrackBusQueryPage() {
  const params = useSearchParams();
  return <TrackBusClient params={{ id: params.get('id') || '' }} />;
}

export default function TrackBusPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading tracking...</div>}><TrackBusQueryPage /></Suspense>;
}
