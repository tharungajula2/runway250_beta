"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime crash captured by layout boundary:", error);
  }, [error]);

  const handleRerender = () => {
    try {
      reset();
    } catch (e) {
      window.location.replace("/journey");
    }
  };

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-neutral-200 dark:bg-neutral-950 flex justify-center items-center p-6 text-center select-none font-sans">
        <div className="w-full max-w-[520px] min-h-[50vh] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col justify-center items-center gap-6 shadow-xl">
          {/* Static error glyph / SVG placeholder */}
          <div className="relative flex items-center justify-center w-16 h-16">
            <svg
              width="64"
              height="64"
              viewBox="0 0 100 100"
              className="text-teal animate-spin [animation-duration:15s]"
            >
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="opacity-30"
              />
              <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-90">
                <line x1="30" y1="20" x2="50" y2="10" stroke="teal" />
                <line x1="70" y1="20" x2="80" y2="38" stroke="teal" />
                <line x1="80" y1="60" x2="70" y2="80" stroke="teal" />
                <line x1="50" y1="90" x2="30" y2="80" stroke="teal" />
                <line x1="20" y1="68" x2="10" y2="50" stroke="teal" />
                <line x1="10" y1="38" x2="20" y2="20" stroke="teal" />
              </g>
              <circle
                cx="50"
                cy="50"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-60"
              />
            </svg>
            <div className="absolute w-3 h-3 rounded-full bg-teal animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase text-teal font-bold">
              IRIS Link Offline
            </span>
            <p className="text-sm font-medium italic leading-relaxed text-neutral-500 dark:text-neutral-400">
              &ldquo;Static surge. Give me a second.&rdquo;
            </p>
          </div>

          <button
            onClick={handleRerender}
            className="w-full py-3 px-6 rounded-xl bg-teal text-white hover:bg-teal-deep font-bold text-xs shadow-md transition-all active:scale-97 cursor-pointer"
          >
            Re-render
          </button>
        </div>
      </body>
    </html>
  );
}
