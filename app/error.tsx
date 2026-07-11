"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Runtime crash captured by page boundary:", error);
  }, [error]);

  const handleRerender = () => {
    try {
      reset();
    } catch (e) {
      window.location.replace("/journey");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-6 text-center select-none bg-bg-app text-text-primary">
      <div className="flex flex-col items-center justify-center gap-6 max-w-xs">
        {/* Animated Aperture Glyph */}
        <motion.div
          animate={{
            scale: [0.96, 1.04, 0.96],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="relative flex items-center justify-center w-16 h-16"
        >
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              ease: "linear",
              repeat: Infinity,
            }}
            width="64"
            height="64"
            viewBox="0 0 100 100"
            className="text-teal"
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
              <line x1="30" y1="20" x2="50" y2="10" />
              <line x1="70" y1="20" x2="80" y2="38" />
              <line x1="80" y1="60" x2="70" y2="80" />
              <line x1="50" y1="90" x2="30" y2="80" />
              <line x1="20" y1="68" x2="10" y2="50" />
              <line x1="10" y1="38" x2="20" y2="20" />
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
          </motion.svg>
          <div className="absolute w-3 h-3 rounded-full bg-teal animate-pulse" />
        </motion.div>

        {/* IRIS Communication */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-teal font-bold">
            IRIS Link Offline
          </span>
          <p className="text-sm font-medium italic font-sans leading-relaxed text-text-muted">
            &ldquo;Static surge. Give me a second.&rdquo;
          </p>
        </div>

        {/* Single Re-render Action */}
        <button
          onClick={handleRerender}
          className="mt-2 w-full py-3 px-6 rounded-xl bg-teal text-white hover:bg-teal-deep font-bold text-xs shadow-md transition-all active:scale-97 cursor-pointer"
        >
          Re-render
        </button>
      </div>
    </div>
  );
}
