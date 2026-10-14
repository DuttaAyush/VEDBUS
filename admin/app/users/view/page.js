"use client";

import { Suspense } from "react";
import RecordQueryPage from "@/components/layout/RecordQueryPage";
import ClientPage from "@/app/users/[id]/ClientPage";

export default function UserViewQueryPage() {
  return <Suspense fallback={<div style={{ padding: "2rem" }}>Loading user…</div>}><RecordQueryPage Component={ClientPage} /></Suspense>;
}
