"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/trips/[id]/seats/ClientPage";

export default function TripSeatsQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading seat map…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
