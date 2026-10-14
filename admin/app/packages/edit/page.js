"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/packages/[id]/edit/ClientPage";

export default function PackageEditQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading package editor…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
