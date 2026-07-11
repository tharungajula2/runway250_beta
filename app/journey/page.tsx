"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import PixelAvatar from "@/components/PixelAvatar";
import journeyData from "@/lib/data/journey.json";
import { Play, Pause, RotateCcw, Calendar, Flame, Target, Trophy } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { playSound } from "@/lib/game/audio";

const CHAPTERS = [
  { day: 1, name: "Chapter I: Boot Sequence", aside: "First vector placed. The loop begins." },
  { day: 7, name: "Chapter II: First Week", aside: "One week. The shapes are starting to trace themselves." },
  { day: 21, name: "Chapter III: Outline Visible", aside: "Habit lines are scoring into the system. Keep tracing." },
  { day: 50, name: "Chapter IV: The Dip", aside: "You are in the thick of it now. The motivation dip is a feature, not a bug. Weariness is the sign of real remodeling. Keep showing up." },
  { day: 100, name: "Chapter V: Centenary Vector", aside: "Day 100. Double digits are behind you. The outline is stable." },
  { day: 150, name: "Chapter VI: Halfway Signal", aside: "System resolution has passed the halfway mark. Contrast is returning." },
  { day: 200, name: "Chapter VII: Deep Sharpening", aside: "Deep sharpening. The borders are almost clean." },
  { day: 250, name: "Chapter VIII: Render Complete", aside: "Look at you. All signal now." },
];

const getActCaption = (act: string) => {
  const a = act.toLowerCase();
  if (a === "boot") return "Act I: System Boot";
  if (a === "rendering") return "Act II: Rendering Vectors";
  if (a === "sharpening") return "Act III: Sharpening Signal";
  return "Act IV: High Definition Focus";
};

export default function Journey() {
  const { currentDay, setCurrentDay, setSessionLocked } = useRunwayStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startDayRef = useRef<number>(1);
  const shouldReduce = useReducedMotion();

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Tick sound on milestone chapters
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (CHAPTERS.some((ch) => ch.day === currentDay)) {
      playSound("scrub_tick");
    }
  }, [currentDay]);

  const dayIndex = Math.max(0, Math.min(249, currentDay - 1));
  const activeRecord = journeyData.days[dayIndex];

  // Easing function for smooth acceleration & deceleration (cubic easeInOut)
  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const handleScrubberChange = (val: number) => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    setCurrentDay(val);
    // Auto-unlock today's session if reviewer changes day so they can re-try loops
    setSessionLocked(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      setIsPlaying(true);
      const startDay = currentDay >= 250 ? 1 : currentDay;
      setCurrentDay(startDay);
      startDayRef.current = startDay;

      const totalDaysToAnimate = 250 - startDay;
      const durationPerDay = 60; // 60ms per day = ~15 seconds total for 250 days
      const totalDuration = totalDaysToAnimate * durationPerDay;

      startTimeRef.current = performance.now();

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(1, totalDuration > 0 ? elapsed / totalDuration : 1);

        const easedProgress = easeInOutCubic(progress);
        const nextDay = Math.round(startDay + easedProgress * totalDaysToAnimate);

        setCurrentDay(Math.min(250, nextDay));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const getMilestoneForDay = (dayNum: number) => {
    const rec = journeyData.days.find((d: any) => d.day === dayNum);
    return rec ? rec.milestone : "";
  };

  const getReflectionForDay = (dayNum: number) => {
    const rec = journeyData.days.find((d: any) => d.day === dayNum);
    return rec ? rec.reflection : "";
  };

  const getResolutionForDay = (dayNum: number) => {
    const rec = journeyData.days.find((d: any) => d.day === dayNum);
    return rec ? rec.resolutionPct : 0.0;
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-6 text-left max-w-md mx-auto w-full">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
            The Rendering
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Watch your avatar render in high-definition resolution across 250 days.
          </p>
        </div>

        {/* Main Canvas Display Card */}
        <Card variant="pixel" className="p-6 flex flex-col items-center gap-5 border-teal bg-teal/5">
          <PixelAvatar resolutionPct={activeRecord.resolutionPct} size={280} />

          <div className="w-full flex items-center justify-between gap-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Timeline Position</span>
              <span className="text-base font-extrabold text-teal flex items-center gap-1">
                <Calendar size={14} className="text-teal" /> Day {currentDay} <span className="text-xs font-normal text-text-muted">/ 250</span>
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Resolution</span>
              <span className="text-base font-extrabold text-teal">
                {activeRecord.resolutionPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Segmented Scrubber Track */}
          <div className="w-full flex flex-col gap-2 mt-2">
            <div className="relative w-full h-2.5 rounded-lg overflow-hidden flex">
              {/* Boot (1-50): 20% */}
              <div className="h-full bg-teal/30 dark:bg-teal/20" style={{ width: "20%" }} />
              {/* Rendering (51-120): 28% */}
              <div className="h-full bg-indigo-500/30 dark:bg-indigo-500/20" style={{ width: "28%" }} />
              {/* Sharpening (121-200): 32% */}
              <div className="h-full bg-amber-500/30 dark:bg-amber-500/20" style={{ width: "32%" }} />
              {/* High Definition (201-250): 20% */}
              <div className="h-full bg-emerald-500/30 dark:bg-emerald-500/20" style={{ width: "20%" }} />

              <input
                type="range"
                min="1"
                max="250"
                value={currentDay}
                onChange={(e) => handleScrubberChange(parseInt(e.target.value))}
                className="absolute inset-0 w-full accent-teal h-full bg-transparent appearance-none cursor-pointer"
                style={{ outline: "none" }}
              />
            </div>
            
            <div className="flex w-full text-[8px] font-mono font-bold tracking-wider text-text-muted select-none">
              <span style={{ width: "20%" }} className="text-left text-teal/80">BOOT (1-50)</span>
              <span style={{ width: "28%" }} className="text-left text-indigo-500/80">RENDERING (51-120)</span>
              <span style={{ width: "32%" }} className="text-left text-amber-600/80">SHARPENING (121-200)</span>
              <span style={{ width: "20%" }} className="text-right text-emerald-600/80">HIGH DEF (201-250)</span>
            </div>
          </div>

          {/* Playback Captions */}
          <AnimatePresence mode="wait">
            {isPlaying && (
              <motion.div
                key={activeRecord.act}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center font-mono text-[10px] font-extrabold uppercase tracking-widest text-teal border border-teal/15 bg-teal/5 py-1.5 px-3 rounded-lg w-full mt-1"
              >
                {getActCaption(activeRecord.act)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Day 250 IRIS Ending aside */}
          {currentDay === 250 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-teal/10 border border-teal text-teal p-3.5 rounded-xl text-left font-sans shadow-sm mt-1"
            >
              <span className="text-[9px] font-mono text-teal uppercase tracking-widest block font-bold mb-0.5">
                IRIS Transmission
              </span>
              <p className="text-xs italic leading-relaxed">
                &ldquo;Look at you. All signal now.&rdquo;
              </p>
            </motion.div>
          )}

          {/* Animation Playback Panel */}
          <div className="flex items-center gap-3 w-full mt-2">
            <button
              onClick={togglePlay}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                isPlaying
                  ? "bg-amber-500 text-white hover:bg-amber-600 shadow-md"
                  : "bg-teal text-white hover:bg-teal-deep shadow-md"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={14} /> Pause Render
                </>
              ) : (
                <>
                  <Play size={14} /> Play Journey (15s)
                </>
              )}
            </button>
            
            <button
              onClick={() => handleScrubberChange(1)}
              title="Reset Scrubber"
              className="flex items-center justify-center p-3 rounded-xl border border-[var(--border-color)] bg-white dark:bg-dark-surface text-text-muted hover:text-teal hover:border-teal transition-all duration-200 cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </Card>

        {/* Selected Day Stats & Reflection Snippet */}
        <Card variant="default" className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
            <h3 className="font-bold text-xs text-teal font-heading uppercase tracking-wider">Day Status details</h3>
            <span className="text-[10px] bg-teal/10 text-teal px-2 py-0.5 rounded-full font-bold">
              Act: {activeRecord.act}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted">Days showing up:</span>
              <span className="font-bold text-text-primary flex items-center gap-1">
                <Flame size={12} className="text-amber-500" /> {activeRecord.streak} Days
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-text-muted">Quests done:</span>
              <span className="font-bold text-text-primary flex items-center gap-1">
                <Target size={12} className="text-teal" /> {activeRecord.quests.length} Completed
              </span>
            </div>
          </div>

          {activeRecord.reflection && (
            <div className="bg-neutral-100 dark:bg-neutral-900/60 p-3.5 rounded-lg border border-[var(--border-color)] text-xs">
              <div className="font-semibold text-text-muted mb-1 text-[10px] uppercase tracking-wider">Reflection Snippet</div>
              <p className="text-text-primary italic leading-relaxed">&ldquo;{activeRecord.reflection}&rdquo;</p>
            </div>
          )}

          {activeRecord.milestone && (
            <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/25 p-3 rounded-lg text-xs">
              <Trophy size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-800 dark:text-amber-500">Milestone Event:</span>
                <p className="text-text-primary mt-0.5">{activeRecord.milestone}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Milestone Chapter Cards (3D Flip & Blur Unlock) */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-sm text-teal font-heading px-1">Unlockable Chapters</h3>
          <div className="grid grid-cols-1 gap-4">
            {CHAPTERS.map((ch, idx) => {
              const isUnlocked = ch.day <= currentDay;
              const milestoneText = getMilestoneForDay(ch.day);
              const reflectionText = getReflectionForDay(ch.day);
              const resolution = getResolutionForDay(ch.day);

              return (
                <div key={ch.day} className="w-full h-44 [perspective:1000px] cursor-pointer">
                  <motion.div
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: isUnlocked ? 0 : 180 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="w-full h-full relative"
                  >
                    {/* FRONT SIDE (Unlocked Card) */}
                    <div
                      style={{ backfaceVisibility: "hidden" }}
                      className="absolute inset-0 w-full h-full bg-white dark:bg-neutral-900 border border-teal/20 rounded-xl p-4 flex flex-col justify-between shadow-sm overflow-hidden"
                    >
                      <motion.div
                        initial={{ filter: "blur(4px)" }}
                        animate={{
                          filter: isUnlocked
                            ? ["blur(4px)", "blur(6px)", "blur(0px)"]
                            : "blur(4px)"
                        }}
                        transition={{
                          duration: shouldReduce ? 0 : 0.8,
                          times: [0, 0.125, 1],
                          ease: "easeOut"
                        }}
                        className="w-full h-full flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-teal font-extrabold uppercase tracking-widest">
                            {ch.name}
                          </span>
                          <span className="text-[9px] bg-teal/10 text-teal px-1.5 py-0.5 rounded font-mono font-bold">
                            {resolution.toFixed(1)}% Res
                          </span>
                        </div>

                        <div className="flex-1 my-1.5 min-h-0 overflow-y-auto">
                          <p className="text-xs font-bold text-text-primary leading-snug">
                            &ldquo;{milestoneText}&rdquo;
                          </p>
                          {reflectionText && (
                            <p className="text-[10px] text-text-muted mt-1 italic leading-relaxed line-clamp-2">
                              &ldquo;{reflectionText}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="border-t border-teal/10 pt-1.5 mt-1">
                          <span className="text-[8px] font-mono text-teal/80 block uppercase tracking-wider">IRIS Aside</span>
                          <p className="text-[10px] text-teal italic leading-normal truncate">
                            &ldquo;{ch.aside}&rdquo;
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    {/* BACK SIDE (Locked Card) */}
                    <div
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        backgroundImage: "radial-gradient(circle, var(--text-muted) 1px, transparent 1px)",
                        backgroundSize: "8px 8px",
                      }}
                      className="absolute inset-0 w-full h-full bg-neutral-100 dark:bg-neutral-950 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl flex flex-col items-center justify-center gap-1 shadow-inner"
                    >
                      <div className="text-2xl font-black text-text-muted/40 font-mono tracking-widest select-none animate-pulse">
                        ?
                      </div>
                      <span className="text-[9px] font-mono text-text-muted/50 uppercase tracking-widest">
                        {ch.name} Locked
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
