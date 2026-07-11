"use client";

import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import journeyData from "@/lib/data/journey.json";
import { Sliders, Sun, Moon, Sparkles, RefreshCcw, HelpCircle } from "lucide-react";

export default function Settings() {
  const {
    darkMode,
    setDarkMode,
    liveAI,
    setLiveAI,
    currentDay,
    setCurrentDay,
    setSessionLocked,
    resetSession,
  } = useRunwayStore();

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
    if (confirm("Are you sure you want to reset the demo? This clears all local storage state.")) {
      localStorage.removeItem("runway-storage");
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6 py-6 text-left max-w-md mx-auto w-full">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
          Settings & Scrubber
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Scrub the timeline or customize execution behaviors.
        </p>
      </div>

      {/* Persona-Day Scrubber */}
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

      {/* Preference Toggles */}
      <Card variant="default" className="p-5 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-teal font-heading">App Preferences</h2>

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

        {/* LIVE AI Toggle */}
        <div className="flex items-center justify-between py-1 border-t border-[var(--border-color)] pt-4">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles size={14} className="text-teal" />
              LIVE AI Mode
            </span>
            <span className="text-[10px] text-text-muted">
              Connect to Gemini API (requires key in env.local). Defaults to static fallback.
            </span>
          </div>
          <button
            onClick={() => setLiveAI(!liveAI)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
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

      {/* Demo Controls */}
      <Card variant="default" className="p-5 flex flex-col gap-4 border-red-500/20">
        <h2 className="text-sm font-bold text-red-600 font-heading">Reset Operations</h2>
        <p className="text-[11px] text-text-muted leading-relaxed">
          Clear all locally persisted states, streaks, logged reflection variables, and cached data. Returns the application to its default clean demonstration state.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500 text-red-600 font-semibold text-xs hover:bg-red-500/5 transition-all duration-200 cursor-pointer"
        >
          <RefreshCcw size={14} /> Clear Local Storage & Reload
        </button>
      </Card>
    </div>
  );
}
