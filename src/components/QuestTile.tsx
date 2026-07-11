import React from "react";
import Card from "./Card";
import { Dumbbell, Brain, Code, MessageSquare, Sparkles, Heart } from "lucide-react";
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
}

function cleanAnchor(str: string): string {
  let cleaned = (str || "").trim();
  if (cleaned.toLowerCase().startsWith("after i ")) {
    cleaned = cleaned.substring(8);
  } else if (cleaned.toLowerCase().startsWith("after ")) {
    cleaned = cleaned.substring(6);
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
  // Strip trailing periods if they will be followed by punctuation
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
}: QuestTileProps) {
  const Icon = PILLAR_ICONS[pillar] || Brain;
  const shouldReduce = useReducedMotion();

  const tierColors = {
    Tiny: "bg-teal/10 text-teal-deep border-teal/20",
    Standard: "bg-teal-deep/10 text-teal border-teal-deep/20",
    Hard: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  };

  const displayAnchor = cleanAnchor(anchor);
  const displayText = cleanText(text);

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 10 }}
      animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
      whileHover={shouldReduce ? {} : { scale: 1.01, y: -1 }}
      whileTap={shouldReduce ? {} : { scale: 0.99 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full"
    >
      <Card
        variant={done ? "pixel" : "default"}
        className={`p-4 transition-all duration-200 border ${
          done ? "border-teal bg-teal/5" : "border-[var(--border-color)]"
        }`}
      >
        <div className="flex gap-3 items-start">
          <div className={`p-2 rounded-lg ${done ? "bg-teal text-white" : "bg-teal/10 text-teal-deep"}`}>
            <Icon size={16} />
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{pillar}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${tierColors[tier]}`}>
                {tier}
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              After I <span className="font-semibold text-text-primary underline decoration-teal/40 decoration-2">{displayAnchor}</span>, I will <span className="font-semibold text-text-primary">{displayText}</span>.
            </p>
          </div>

          <button
            onClick={onToggle}
            disabled={disabled}
            className={`text-xs py-1.5 px-3 rounded-lg font-semibold border transition-all duration-200 cursor-pointer ${
              done
                ? "bg-teal text-white border-teal hover:bg-teal-deep"
                : "bg-transparent text-text-primary border-[var(--border-color)] hover:bg-teal/5"
            }`}
          >
            {done ? "Done" : "Complete"}
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
