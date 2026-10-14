"use client";

import { useSearchParams } from "next/navigation";

export default function RecordQueryPage({ Component }) {
  const searchParams = useSearchParams();
  const id = searchParams?.get("id") || "";
  return <Component id={id} />;
}
