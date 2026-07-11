"use client";

import React from "react";
import { useRunwayStore } from "@/store/useRunwayStore";

export default function SimulationBadge() {
  const { mode } = useRunwayStore();

  if (mode !== "pitch") {
    return (
      <span className="text-[9px] text-text-muted/50 font-mono tracking-widest uppercase">
        Prototype
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono tracking-wider uppercase font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      Simulation
    </div>
  );
}
