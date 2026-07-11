import React from "react";

export default function SimulationBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono tracking-wider uppercase font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      Simulation
    </div>
  );
}
