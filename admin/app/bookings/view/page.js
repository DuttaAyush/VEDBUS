"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/bookings/[id]/ClientPage";

export default function BookingViewQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading booking…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
