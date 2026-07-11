"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import PixelAvatar from "@/components/PixelAvatar";
import MilestoneBadge from "@/components/MilestoneBadge";
import journeyData from "@/lib/data/journey.json";
import { Play, Pause, RotateCcw, Calendar, Flame, Target, Trophy } from "lucide-react";

export default function Journey() {
  const { currentDay, setCurrentDay, setSessionLocked } = useRunwayStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startDayRef = useRef<number>(1);

  // Parse milestones from static journey JSON
  const milestoneDays = journeyData.days.filter((d: any) => d.milestone);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

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

  const getMilestoneIcon = (title: string): string => {
    const t = title.toLowerCase();
    if (t.includes("kickoff") || t.includes("commitment")) return "Compass";
    if (t.includes("freeze")) return "Wind";
    if (t.includes("midpoint") || t.includes("halfway")) return "Target";
    if (t.includes("lock") || t.includes("rhythm")) return "Lock";
    if (t.includes("groove") || t.includes("velocity")) return "Zap";
    if (t.includes("plateau") || t.includes("resistance")) return "TrendingUp";
    if (t.includes("terminal") || t.includes("acceleration")) return "Flame";
    if (t.includes("complete") || t.includes("finish")) return "Trophy";
    return "Award";
  };

  return (
    <div className="flex flex-col gap-6 py-6 text-left max-w-md mx-auto w-full">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
          Identity Journey
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

        {/* Timeline Day Scrubber */}
        <div className="w-full flex flex-col gap-2">
          <input
            type="range"
            min="1"
            max="250"
            value={currentDay}
            onChange={(e) => handleScrubberChange(parseInt(e.target.value))}
            className="w-full accent-teal h-2.5 bg-teal/10 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-text-muted font-bold font-mono">
            <span>DAY 1 (LOW-RES)</span>
            <span>DAY 125</span>
            <span>DAY 250 (HIGH-RES)</span>
          </div>
        </div>

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
            <span className="text-text-muted">Current Streak:</span>
            <span className="font-bold text-text-primary flex items-center gap-1">
              <Flame size={12} className="text-amber-500" /> {activeRecord.streak} Days
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-text-muted">Pillar Actions Done:</span>
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

      {/* Milestones Timeline Tracker */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-sm text-teal font-heading px-1">Milestones Unlocked</h3>
        <div className="flex flex-col gap-3">
          {milestoneDays.map((m: any) => {
            const isUnlocked = m.day <= currentDay;
            return (
              <MilestoneBadge
                key={m.day}
                day={m.day}
                title={m.milestone}
                description={`Resolution reached ${m.resolutionPct}% on Act: ${m.act}`}
                iconName={getMilestoneIcon(m.milestone)}
                isUnlocked={isUnlocked}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
