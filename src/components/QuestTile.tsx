import React, { useState } from "react";
import Card from "./Card";
import { Dumbbell, Brain, Code, MessageSquare, Sparkles, Heart, Compass } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const PILLAR_ICONS = {
  Body: Dumbbell,
  Mind: Brain,
  Craft: Code,
  Voice: MessageSquare,
  Order: Sparkles,
  Bonds: Heart,
};

interface QuestTileProps {
  pillar: "Body" | "Mind" | "Craft" | "Voice" | "Order" | "Bonds";
  tier: "Tiny" | "Standard" | "Hard";
  text: string;
  anchor: string;
  done: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isHunt?: boolean;
  description?: string;
  onDescriptionChange?: (val: string) => void;
}

function cleanAnchor(str: string): string {
  let cleaned = (str || "").trim();
  if (cleaned.toLowerCase().startsWith("after i ")) {
    cleaned = cleaned.substring(8);
  } else if (cleaned.toLowerCase().startsWith("after ")) {
    cleaned = cleaned.substring(6);
  }
  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

function cleanText(str: string): string {
  let cleaned = (str || "").trim();
  if (cleaned.toLowerCase().startsWith("i will ")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.toLowerCase().startsWith("will ")) {
    cleaned = cleaned.substring(5);
  }
  // Strip trailing periods
  if (cleaned.endsWith(".")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

export default function QuestTile({
  pillar,
  tier,
  text,
  anchor,
  done,
  onToggle,
  disabled = false,
  isHunt = false,
  description = "",
  onDescriptionChange,
}: QuestTileProps) {
  const Icon = isHunt ? Compass : (PILLAR_ICONS[pillar] || Brain);
  const shouldReduce = useReducedMotion();
  const [showMote, setShowMote] = useState(false);

  const displayAnchor = cleanAnchor(anchor);
  const displayText = cleanText(text);

  const handleToggleDone = () => {
    if (!done) {
      setShowMote(true);
      // Let it animate for 1.2s then fade
      setTimeout(() => {
        setShowMote(false);
      }, 1200);
    }
    onToggle();
  };

  const renderPixelBlocks = () => {
    const count = tier === "Tiny" ? 1 : tier === "Standard" ? 2 : 3;
    return (
      <div className="flex gap-0.5 items-center mt-1" title={`${tier} Quest`}>
        {Array.from({ length: count }).map((_, idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-xs inline-block ${
              done 
                ? "bg-white/80" 
                : isHunt
                  ? "bg-amber-500"
                  : tier === "Hard"
                    ? "bg-amber-500"
                    : "bg-teal"
            }`}
          />
        ))}
      </div>
    );
  };

  const isDoneDisabled = disabled || (isHunt && !done && !description.trim());

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 12 }}
      animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
      whileHover={shouldReduce ? {} : { scale: 1.01, y: -1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-full select-none"
    >
      {/* Floating "+resolution" Mote */}
      {showMote && (
        <motion.div
          initial={{ opacity: 1, y: 0, scale: 0.8, x: 0 }}
          animate={{ 
            opacity: 0, 
            y: -140, 
            x: [0, -25, 20, -5],
            scale: 1.3 
          }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute z-50 text-teal dark:text-teal font-mono font-bold text-xs pointer-events-none flex items-center gap-1 bg-white/90 dark:bg-neutral-900/90 py-1 px-2 rounded-full border border-teal/20 shadow-md"
          style={{ right: "10%", top: "10%" }}
        >
          ✨ {isHunt ? "+sharpen hunt" : "+resolution"}
        </motion.div>
      )}

      <Card
        variant={done ? "pixel" : "default"}
        className={`p-5 relative overflow-hidden border flex flex-col gap-3 transition-colors duration-300 ${
          done 
            ? "border-teal bg-teal/5 dark:bg-teal/5" 
            : isHunt
              ? "border-amber-400/50 dark:border-amber-600/40 hover:border-amber-500/70 bg-amber-500/[0.02] dark:bg-amber-500/[0.01]"
              : "border-neutral-200/60 dark:border-neutral-800/60 hover:border-teal/40 bg-white/80 dark:bg-neutral-900/80"
        }`}
        animate={{
          filter: done
            ? ["blur(0.5px)", "blur(2.0px)", "blur(0px)"]
            : isHunt
              ? "blur(1.2px)"
              : "blur(0.5px)",
        }}
        transition={{
          duration: shouldReduce ? 0 : 0.4,
          times: [0, 0.25, 1],
          ease: "easeOut",
        }}
      >
        <div className="flex gap-4 items-center w-full">
          {/* Stamp Icon */}
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
            done 
              ? "bg-teal text-white border-white/20" 
              : isHunt
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-teal/5 text-teal border-teal/10"
          }`}>
            <Icon size={18} />
          </div>

          {/* Quest Info */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${
                done 
                  ? "text-teal/80" 
                  : isHunt
                    ? "text-amber-600 dark:text-amber-500"
                    : "text-text-muted"
              }`}>
                {isHunt ? "Hunt Mode" : pillar}
              </span>
              {renderPixelBlocks()}
            </div>

            {/* Whispered Anchor line */}
            <span className={`text-[10px] italic font-mono block leading-relaxed ${
              done 
                ? "text-teal/70" 
                : isHunt
                  ? "text-amber-600/70 dark:text-amber-400/70"
                  : "text-text-muted"
            }`}>
              after you {displayAnchor}...
            </span>

            {/* Hero text */}
            <h3 className={`text-xs md:text-sm font-semibold mt-0.5 leading-snug transition-colors duration-300 ${
              done 
                ? "text-teal-deep/90 dark:text-teal/90 line-through opacity-85" 
                : isHunt
                  ? "text-amber-900 dark:text-amber-100"
                  : "text-text-primary"
            }`}>
              I will {displayText}
            </h3>
          </div>

          {/* Action Ritual Done Checkbox */}
          <button
            type="button"
            onClick={handleToggleDone}
            disabled={isDoneDisabled}
            title={isHunt && !done && !description.trim() ? "Describe what you found first" : ""}
            className={`shrink-0 text-[10px] py-1.5 px-3 rounded-lg font-bold border tracking-wide uppercase transition-all duration-200 cursor-pointer ${
              done
                ? "bg-teal text-white border-teal hover:bg-teal-deep"
                : isDoneDisabled
                  ? "bg-transparent text-text-muted/40 border-neutral-200 dark:border-neutral-800 cursor-not-allowed"
                  : isHunt
                    ? "bg-transparent text-amber-600 dark:text-amber-400 border-amber-400 dark:border-amber-600 hover:bg-amber-500/5 hover:border-amber-500"
                    : "bg-transparent text-text-primary border-neutral-300 dark:border-neutral-700 hover:border-teal hover:bg-teal/5"
            }`}
          >
            {done ? "Completed" : "Done — mark it"}
          </button>
        </div>

        {/* Hunt Discovery Input */}
        {isHunt && !done && (
          <div className="w-full mt-1 pt-2 border-t border-dashed border-amber-500/20">
            <span className="text-[9px] uppercase font-mono font-bold text-amber-600 dark:text-amber-500 block mb-1">
              Hunt Log (Describe what you found in one line) *
            </span>
            <input
              type="text"
              placeholder="e.g. A small mossy pebble under the porch light"
              value={description}
              onChange={(e) => onDescriptionChange?.(e.target.value)}
              disabled={disabled}
              className="w-full text-xs bg-amber-500/[0.03] dark:bg-amber-500/[0.02] border border-amber-300/40 dark:border-amber-700/30 rounded-lg py-2 px-3 focus:outline-none focus:border-amber-500 font-mono transition-colors text-text-primary"
            />
          </div>
        )}

        {/* Hunt Done View */}
        {isHunt && done && description && (
          <div className="w-full mt-1 pt-2 border-t border-dashed border-teal/20 text-left font-mono">
            <span className="text-[9px] uppercase font-bold text-teal block">
              Discovered & Logged:
            </span>
            <p className="text-xs text-teal-deep dark:text-teal/80 italic mt-0.5">
              &ldquo;{description}&rdquo;
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
