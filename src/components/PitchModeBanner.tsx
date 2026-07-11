"use client";

import React from "react";
import { useRunwayStore } from "@/store/useRunwayStore";

export default function PitchModeBanner() {
  const { mode } = useRunwayStore();

  if (mode !== "pitch") {
    return null;
  }

  return (
    <div className="w-full bg-amber-500 text-amber-950 dark:bg-amber-600 dark:text-amber-955 text-center py-1 px-4 text-[10px] font-mono font-bold tracking-wider uppercase border-b border-amber-600/30 select-none animate-pulse relative z-50">
      PITCH MODE — internal view
    </div>
  );
}
