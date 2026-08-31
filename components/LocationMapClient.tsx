"use client";

import dynamic from "next/dynamic";

export const LocationMap = dynamic(
  () => import("@/components/LocationMap").then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-3xl border border-line bg-surface animate-pulse" />
    ),
  },
);
