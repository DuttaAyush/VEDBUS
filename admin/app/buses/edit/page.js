"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/buses/[id]/edit/ClientPage";

export default function BusEditQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading bus editor…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
