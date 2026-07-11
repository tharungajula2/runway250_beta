import React from "react";
import * as Icons from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface MilestoneBadgeProps {
  day: number;
  title: string;
  description?: string;
  iconName: string;
  isUnlocked: boolean;
}

export default function MilestoneBadge({ day, title, description, iconName, isUnlocked }: MilestoneBadgeProps) {
  const IconComponent = (Icons as any)[iconName] || Icons.Award;
  const shouldReduce = useReducedMotion();

  // If unlocked, animate the card gently
  const variants = {
    hidden: { opacity: 0.5, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: shouldReduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }
    }
  } as any;

  return (
    <motion.div
      initial={shouldReduce ? "visible" : "hidden"}
      animate={isUnlocked ? "visible" : "hidden"}
      variants={variants}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
        isUnlocked
          ? "bg-teal/5 border-teal/20 text-text-primary"
          : "bg-neutral-500/5 border-neutral-500/10 text-text-muted opacity-60"
      }`}
    >
      <motion.div
        animate={isUnlocked ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={shouldReduce ? { duration: 0 } : { duration: 0.4, delay: 0.1 }}
        className={`flex items-center justify-center w-12 h-12 rounded-lg border transition-all duration-300 ${
          isUnlocked
            ? "bg-teal text-white border-teal/20"
            : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 border-neutral-300 dark:border-neutral-700"
        }`}
      >
        <IconComponent className="w-6 h-6" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm truncate">{title}</h4>
          <span className="shrink-0 text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded">
            Day {day}
          </span>
        </div>
        {description && <p className="text-xs text-text-muted mt-0.5 truncate">{description}</p>}
      </div>
    </motion.div>
  );
}
