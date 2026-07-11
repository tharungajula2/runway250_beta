"use client";

import { useState, useEffect } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import QuestTile from "@/components/QuestTile";
import SessionTimer from "@/components/SessionTimer";
import LiveAIChip from "@/components/LiveAIChip";
import journeyData from "@/lib/data/journey.json";
import { ArrowRight, RefreshCw, Smartphone } from "lucide-react";
import Link from "next/link";

type LoopState = "QUESTS" | "REFLECTION" | "RESOLVING" | "COMPLETED";

export default function Today() {
  const {
    currentDay,
    liveAI,
    liveQuests,
    setLiveQuestsForDay,
    toggleLiveQuestDone,
    isSessionLocked,
    setSessionLocked,
    sessionTimeLeft,
  } = useRunwayStore();

  const [loopState, setLoopState] = useState<LoopState>("QUESTS");
  const [questsList, setQuestsList] = useState<any[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [tickerRes, setTickerRes] = useState(0);

  // Get static record for baseline stats
  const dayIndex = currentDay - 1;
  const staticRecord = journeyData.days[dayIndex] || journeyData.days[journeyData.days.length - 1];

  const prevRecord = dayIndex > 0 ? journeyData.days[dayIndex - 1] : null;
  const startRes = prevRecord ? prevRecord.resolutionPct : 0.0;
  const endRes = staticRecord.resolutionPct;

  // 1. Initialize quests list on mount or when day/mode changes
  useEffect(() => {
    // If the session is already locked for this day, default to completed screen
    if (isSessionLocked) {
      setLoopState("COMPLETED");
    } else {
      setLoopState("QUESTS");
    }

    if (liveAI) {
      // Check if we have live quests for this day
      if (!liveQuests[currentDay]) {
        // Build live quests from static ones on first load of the day (simulated)
        const mockLiveQuests = staticRecord.quests.map((q: any) => ({
          ...q,
          done: false, // Start fresh for live tracking
        }));
        setLiveQuestsForDay(currentDay, mockLiveQuests);
        setQuestsList(mockLiveQuests);
      } else {
        setQuestsList(liveQuests[currentDay]);
      }
    } else {
      // Simulated mode - copy quests from JSON
      setQuestsList(
        staticRecord.quests.map((q: any) => ({
          ...q,
        }))
      );
    }

    setReflectionText(staticRecord.reflection);
  }, [currentDay, liveAI, isSessionLocked, liveQuests, staticRecord, setLiveQuestsForDay]);

  // Handle toggling completion of a quest
  const handleToggleQuest = (questId: string) => {
    if (liveAI) {
      toggleLiveQuestDone(currentDay, questId);
      // Keep local list in sync
      setQuestsList((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, done: !q.done } : q))
      );
    } else {
      setQuestsList((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, done: !q.done } : q))
      );
    }
  };

  // Submit quests and proceed to reflection
  const handleProceedToReflection = () => {
    setLoopState("REFLECTION");
  };

  // Submit reflection and proceed to resolution calculation
  const handleCommitReflection = () => {
    setLoopState("RESOLVING");
    // Start ticking animation from startRes to endRes
    let current = startRes;
    const stepValue = (endRes - startRes) / 30; // 30 steps
    let count = 0;

    const interval = setInterval(() => {
      current += stepValue;
      count++;
      if (count >= 30) {
        setTickerRes(endRes);
        clearInterval(interval);
        setTimeout(() => {
          setSessionLocked(true);
          setLoopState("COMPLETED");
        }, 1000);
      } else {
        setTickerRes(Math.round(current * 10) / 10);
      }
    }, 50);
  };

  // Render different states of the page
  const renderContent = () => {
    switch (loopState) {
      case "QUESTS":
        return (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold">
                  Act {staticRecord.act === "Boot" ? "I" : staticRecord.act === "Rendering" ? "II" : staticRecord.act === "Sharpening" ? "III" : "IV"}: {staticRecord.act}
                </span>
                <LiveAIChip isLive={liveAI} />
              </div>
              <h2 className="text-xl font-black text-teal font-heading">
                Day {currentDay} of 250
              </h2>
              <p className="text-xs text-text-muted">
                Energy Level: {staticRecord.energy === 1 ? "Low (1 Quest)" : staticRecord.energy === 2 ? "Mid (2 Quests)" : "High (3 Quests)"}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {questsList.map((quest) => (
                <QuestTile
                  key={quest.id}
                  pillar={quest.pillar}
                  tier={quest.tier}
                  text={quest.text}
                  anchor={quest.anchor}
                  done={quest.done}
                  onToggle={() => handleToggleQuest(quest.id)}
                />
              ))}
            </div>

            <button
              onClick={handleProceedToReflection}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200"
            >
              Log Today&apos;s Reflections <ArrowRight size={14} />
            </button>
          </div>
        );

      case "REFLECTION":
        return (
          <div className="flex flex-col gap-6 text-left">
            <div>
              <h2 className="text-lg font-bold text-teal font-heading">Reflect on Your Actions</h2>
              <p className="text-xs text-text-muted">How did carrying out these intentions feel?</p>
            </div>

            <Card variant="default" className="p-4 flex flex-col gap-3">
              <label className="text-[10px] font-bold text-teal uppercase tracking-wider">
                First-Person Reflection Log
              </label>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-lg border border-[var(--border-color)] bg-transparent focus:outline-none focus:border-teal text-text-primary"
                placeholder="Write your reflection..."
              />
              <p className="text-[10px] text-text-muted italic">
                Reflections reinforce your new identity by casting a vote for the person you are becoming.
              </p>
            </Card>

            <button
              onClick={handleCommitReflection}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200"
            >
              Commit & Render Resolution <RefreshCw size={14} />
            </button>
          </div>
        );

      case "RESOLVING":
        return (
          <div className="flex flex-col flex-1 items-center justify-center py-20 text-center relative">
            {/* Soft Focus Backdrop Animation blur */}
            <div className="absolute inset-0 bg-paper/40 backdrop-blur-md z-10 pointer-events-none rounded-xl" />
            
            <div className="z-20 flex flex-col items-center gap-4">
              <RefreshCw size={40} className="text-teal animate-spin" />
              <h3 className="text-lg font-bold text-teal font-heading">Rendering Avatar Resolution</h3>
              <p className="text-xs text-text-muted">Consolidating daily habit signals...</p>
              
              <div className="mt-6 flex flex-col items-center">
                <span className="text-5xl font-extrabold text-teal font-heading tabular-nums">
                  {tickerRes.toFixed(1)}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted mt-2">
                  Avatar Definition
                </span>
              </div>
            </div>
          </div>
        );

      case "COMPLETED":
        const isLinger = sessionTimeLeft === 0;

        return (
          <div className="flex flex-col flex-1 items-center justify-center py-8 text-center gap-6">
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center text-teal mb-2">
              <Smartphone size={28} />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-teal font-heading">Session Complete</h2>
              <p className="text-sm font-medium text-teal-deep">Go live your real life. The game is outside.</p>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed mt-2">
                You have logged your daily choices and reflections. Your avatar resolution has rendered to{" "}
                <span className="font-bold text-teal">{endRes}%</span>.
              </p>
            </div>

            <Card variant="surface" className="p-4 max-w-sm w-full text-left flex flex-col gap-1.5 border-teal/20 bg-teal/5">
              <h4 className="font-bold text-xs text-teal">Daily Loop Soft-Locked</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                To prevent digital compulsion and screens lingering, the Daily Loop has locked. We will seed new intentions tomorrow.
              </p>
            </Card>

            {isLinger && (
              <Card variant="default" className="p-4 max-w-sm w-full text-left border-amber-500/20 bg-amber-500/5 animate-pulse">
                <h4 className="font-bold text-xs text-amber-600">Anti-Attention Warning</h4>
                <p className="text-[11px] text-amber-700 leading-relaxed mt-1">
                  You have lingered past the recommended 10 minutes. This app works best when you close it. Go live your life.
                </p>
              </Card>
            )}

            <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
              <Link
                href="/settings"
                className="py-2.5 px-4 rounded-xl border border-teal text-teal hover:bg-teal/5 text-xs font-semibold"
              >
                Go to Settings & Selector
              </Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Session Timer (Only show when not fully completed or soft-locked) */}
      {loopState !== "COMPLETED" && <SessionTimer />}

      {renderContent()}
    </div>
  );
}
