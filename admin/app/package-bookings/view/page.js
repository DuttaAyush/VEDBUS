"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/package-bookings/[id]/ClientPage";

export default function PackageBookingViewQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading package booking…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
