"use client";

import React from "react";
import { motion } from "framer-motion";

interface ApertureLoaderProps {
  label?: string;
  size?: number;
}

export default function ApertureLoader({
  label = "IRIS is thinking...",
  size = 48,
}: ApertureLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-4 select-none">
      <motion.div
        animate={{
          scale: [0.96, 1.04, 0.96],
        }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Rotating outer ring and blades */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            ease: "linear",
            repeat: Infinity,
          }}
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="text-teal"
        >
          {/* Circular dotted backdrop */}
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

          {/* Aperture blades or lines */}
          <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-90">
            <line x1="30" y1="20" x2="50" y2="10" />
            <line x1="70" y1="20" x2="80" y2="38" />
            <line x1="80" y1="60" x2="70" y2="80" />
            <line x1="50" y1="90" x2="30" y2="80" />
            <line x1="20" y1="68" x2="10" y2="50" />
            <line x1="10" y1="38" x2="20" y2="20" />
          </g>

          {/* Inner ring */}
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

        {/* Small center blinking core */}
        <div className="absolute w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
      </motion.div>

      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-mono font-bold text-teal tracking-wider animate-pulse">
          {label}
        </span>
        <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">
          Reading the static...
        </span>
      </div>
    </div>
  );
}
