"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/trips/[id]/edit/ClientPage";

export default function TripEditQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading trip editor…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
