"use client";

import React, { useEffect } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import { Clock } from "lucide-react";

export default function SessionTimer() {
  const timeLeft = useRunwayStore((state) => state.sessionTimeLeft);
  const setTimeLeft = useRunwayStore((state) => state.setSessionTimeLeft);
  const isLocked = useRunwayStore((state) => state.isSessionLocked);

  useEffect(() => {
    if (isLocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, setTimeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const pct = (timeLeft / 600) * 100;
  const isLinger = timeLeft === 0;

  return (
    <div className="flex flex-col gap-1.5 w-full bg-white dark:bg-dark-surface border border-[var(--border-color)] p-3.5 rounded-xl shadow-xs">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-text-muted">
          <Clock className="w-3.5 h-3.5 text-teal" />
          Daily Runway Session
        </span>
        <span className={`font-mono font-bold ${isLinger ? "text-amber-500" : "text-text-primary"}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isLinger ? "bg-amber-500" : "bg-teal"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {isLinger && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 leading-normal font-medium animate-pulse">
          This app works best when you close it. Your real life is the game.
        </p>
      )}
    </div>
  );
}
