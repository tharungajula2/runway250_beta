"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import journeyData from "@/lib/data/journey.json";
import { Sliders, Sun, Moon, Sparkles, RefreshCcw, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export default function Settings() {
  const {
    darkMode,
    setDarkMode,
    liveAI,
    setLiveAI,
    currentDay,
    setCurrentDay,
    setSessionLocked,
    mode,
    setMode,
    soundEnabled,
    setSoundEnabled,
  } = useRunwayStore();

  // Long press hook state
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    setPressing(true);
    setProgress(0);
    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / 2000) * 100);
      setProgress(pct);
      
      if (elapsed >= 2000) {
        // Hold complete
        setMode(mode === "pitch" ? "game" : "pitch");
        cancelPress();
      }
    }, 50);
  };

  const cancelPress = () => {
    setPressing(false);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  const isPitch = mode === "pitch";

  // Find info about the currently selected day
  const dayIndex = Math.max(0, Math.min(249, currentDay - 1));
  const selectedDayRecord = journeyData.days[dayIndex];

  const handleDayChange = (dayNum: number) => {
    const validated = Math.max(1, Math.min(250, dayNum));
    setCurrentDay(validated);
    // When scrubbing persona-day, unlock the session so the flow is testable on the new day
    setSessionLocked(false);
  };

  const handleReset = () => {
    const message = isPitch
      ? "Are you sure you want to reset the demo? This clears all local storage state."
      : "Are you sure you want to start a new game? This will erase all of your progress and history permanently.";
    if (confirm(message)) {
      localStorage.removeItem("runway-storage");
      window.location.reload();
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-6 text-left max-w-md mx-auto w-full">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
            {isPitch ? "Settings & Scrubber" : "Settings"}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {isPitch
              ? "Scrub the timeline or customize execution behaviors."
              : "Customize your in-game preferences."}
          </p>
        </div>

        {/* Persona-Day Scrubber */}
        {isPitch && (
          <Card variant="pixel" className="p-5 border-teal bg-teal/5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sliders className="text-teal w-4.5 h-4.5" />
              <h2 className="text-sm font-bold text-teal font-heading">Persona-Day Selector</h2>
            </div>

            <p className="text-[11px] text-text-muted leading-relaxed">
              Jump the prototype timeline to any day (1–250) to preview quests, reflections, and rendering status. Changing this will auto-unlock the session for testing.
            </p>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="250"
                value={currentDay}
                onChange={(e) => handleDayChange(parseInt(e.target.value))}
                className="flex-1 accent-teal cursor-pointer h-2 bg-teal/10 rounded-lg appearance-none"
              />
              <input
                type="number"
                min="1"
                max="250"
                value={currentDay}
                onChange={(e) => handleDayChange(parseInt(e.target.value) || 1)}
                className="w-16 text-center text-xs font-bold p-1 border border-teal/30 bg-transparent rounded focus:outline-none focus:border-teal text-text-primary"
              />
            </div>

            {selectedDayRecord && (
              <div className="bg-white dark:bg-dark-surface p-3 rounded-lg border border-[var(--border-color)] text-[11px] flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-teal">Day {currentDay} Info:</span>
                  <span className="text-text-muted">Act: {selectedDayRecord.act}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Expected Resolution:</span>
                  <span className="font-bold text-text-primary">{selectedDayRecord.resolutionPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Milestone Event:</span>
                  <span className="font-bold text-text-primary">{selectedDayRecord.milestone || "None"}</span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Preference Toggles */}
        <Card variant="default" className="p-5 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-teal font-heading">Preferences</h2>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                {darkMode ? <Moon size={14} className="text-teal" /> : <Sun size={14} className="text-teal" />}
                Appearance Mode
              </span>
              <span className="text-[10px] text-text-muted">Switch between warm paper light and dark backgrounds</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                darkMode ? "bg-teal" : "bg-neutral-300 dark:bg-neutral-800"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-1 border-t border-[var(--border-color)] pt-4">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                {soundEnabled ? <Volume2 size={14} className="text-teal" /> : <VolumeX size={14} className="text-teal" />}
                Sound Effects
              </span>
              <span className="text-[10px] text-text-muted">Enable audio feedback for quest completion and milestones</span>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                soundEnabled ? "bg-teal" : "bg-neutral-300 dark:bg-neutral-800"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  soundEnabled ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* IRIS Connection Toggle */}
          <div className="flex items-center justify-between py-1 border-t border-[var(--border-color)] pt-4">
            <div className="flex flex-col pr-4">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Sparkles size={14} className="text-teal" />
                IRIS connection
              </span>
              <span className="text-[10px] text-text-muted leading-relaxed">
                When connected, IRIS shapes your quests personally. When resting, quests come from the archive.
              </span>
            </div>
            <button
              onClick={() => setLiveAI(!liveAI)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                liveAI ? "bg-teal" : "bg-neutral-300 dark:bg-neutral-800"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  liveAI ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Demo Controls / Reset */}
        <Card variant="default" className="p-5 flex flex-col gap-4 border-red-500/20">
          <h2 className="text-sm font-bold text-red-600 font-heading">
            {isPitch ? "Reset Operations" : "Start a new game (erases everything)"}
          </h2>
          <p className="text-[11px] text-text-muted leading-relaxed">
            {isPitch
              ? "Clear all locally persisted states, streaks, logged reflection variables, and cached data. Returns the application to its default clean demonstration state."
              : "This will erase all your progress, history, and shields, starting you back on Day 1."}
          </p>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500 text-red-600 font-semibold text-xs hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
          >
            <RefreshCcw size={14} /> {isPitch ? "Clear Local Storage & Reload" : "Erase Progress & Start New Game"}
          </button>
        </Card>

        {/* Builder Access Holder Button */}
        <div className="flex items-center justify-between py-4 border-t border-[var(--border-color)] mt-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary">Builder access</span>
            <span className="text-[10px] text-text-muted">
              {isPitch ? "Hold button for 2s to exit developer view" : "Hold button for 2s to unlock developer view"}
            </span>
          </div>
          <button
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            className="relative overflow-hidden px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-xs font-bold text-text-primary select-none active:scale-95 transition-transform duration-100 min-w-[120px] text-center cursor-pointer"
          >
            {pressing && (
              <div
                className="absolute inset-0 bg-teal/20 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10 text-xs">
              {isPitch ? "Disable Pitch" : "Hold 2s to enter"}
            </span>
          </button>
        </div>
      </div>
    </PageTransition>
  );
}
