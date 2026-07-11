import React from "react";
import { useRunwayStore } from "@/store/useRunwayStore";

export default function LiveAIChip({ isLive }: { isLive: boolean }) {
  const { mode } = useRunwayStore();

  if (isLive) {
    return (
      <span className="relative group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-xs cursor-help">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
        </span>
        <span>IRIS ● LIVE</span>
        
        {mode === "pitch" && (
          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 bg-neutral-900 text-white text-[9px] font-sans font-normal p-2 rounded shadow-lg border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-normal z-50 text-center">
            Calling Gemini API via server route to generate customized quests based on your selected pillars and energy.
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20 shadow-xs">
      {mode === "pitch" ? "SIMULATED" : "LOCAL"}
    </span>
  );
}
