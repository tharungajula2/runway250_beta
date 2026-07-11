"use client";

import React from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import journeyData from "@/lib/data/journey.json";
import { ArrowLeft, Dumbbell, Brain, Code, MessageSquare, Sparkles, Heart } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

const PILLAR_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  body: Dumbbell,
  mind: Brain,
  craft: Code,
  voice: MessageSquare,
  order: Sparkles,
  bonds: Heart,
};

export default function Archive() {
  const { currentDay, reflections } = useRunwayStore();

  const getActHeader = (day: number) => {
    if (day === 1) return "ACT I: BOOT";
    if (day === 51) return "ACT II: RENDERING";
    if (day === 121) return "ACT III: SHARPENING";
    if (day === 201) return "ACT IV: HIGH DEFINITION";
    return null;
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-6 text-left max-w-md mx-auto w-full">
        <div>
          <Link
            href="/journey"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-teal hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft size={12} /> Return to The Rendering
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
            The Archive
          </h1>
          <p className="text-xs text-text-muted mt-1 font-mono uppercase tracking-wider">
            "The book you didn't know you were writing."
          </p>
          <p className="text-[11px] text-text-muted mt-0.5 font-sans">
            One entry per day. Searchless, statless, calm.
          </p>
        </div>

        <div className="border-t border-[var(--border-color)] my-1" />

        <div className="flex flex-col gap-6 font-sans">
          {journeyData.days.map((d: any) => {
            const actHeader = getActHeader(d.day);
            const isLocked = d.day > currentDay;
            
            // Get reflection: custom reflection from store first, else mock reflection from journey.json
            const reflection = reflections[d.day] || d.reflection || "Just showing up. That counts.";
            
            // Get unique pillars for the day
            const uniquePillars = Array.from(new Set(d.quests.map((q: any) => q.pillar.toLowerCase()))) as string[];

            return (
              <React.Fragment key={d.day}>
                {actHeader && (
                  <div className="mt-6 first:mt-2 mb-2 border-b border-teal/15 pb-1 flex justify-between items-center select-none">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-teal">
                      {actHeader}
                    </span>
                    <span className="text-[9px] font-mono text-text-muted/60 uppercase">
                      {d.day === 1 ? "Days 1-50" : d.day === 51 ? "Days 51-120" : d.day === 121 ? "Days 121-200" : "Days 201-250"}
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col gap-2 p-4 rounded-xl border transition-all duration-300 ${
                    isLocked
                      ? "border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-100/30 dark:bg-neutral-900/30 blur-[2px] select-none pointer-events-none opacity-40"
                      : "border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 shadow-xs"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-teal">
                      DAY {d.day}
                    </span>

                    {/* Pillar stamps */}
                    <div className="flex gap-1.5">
                      {uniquePillars.map((pillar) => {
                        const Icon = PILLAR_ICONS[pillar] || Brain;
                        return (
                          <div
                            key={pillar}
                            title={pillar}
                            className={`p-1 rounded-md border ${
                              isLocked
                                ? "border-neutral-300 dark:border-neutral-700 text-neutral-400"
                                : "border-teal/15 bg-teal/5 text-teal"
                            }`}
                          >
                            <Icon size={10} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-text-primary italic leading-relaxed font-sans mt-0.5">
                    &ldquo;{reflection}&rdquo;
                  </p>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
