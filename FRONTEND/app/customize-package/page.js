'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CustomizePackageClient from './[id]/CustomizePackageClient';

function CustomizePackageQueryPage() {
  const params = useSearchParams();
  return <CustomizePackageClient params={{ id: params.get('package') || '' }} />;
}

export default function CustomizePackagePage() {
  return <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading package customizer...</div>}><CustomizePackageQueryPage /></Suspense>;
}
