"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/routes/[id]/edit/ClientPage";

export default function RouteEditQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading route editor…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
