"use client";

import { useState, useEffect, useRef } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import QuestTile from "@/components/QuestTile";
import SessionTimer from "@/components/SessionTimer";
import LiveAIChip from "@/components/LiveAIChip";
import journeyData from "@/lib/data/journey.json";
import { ArrowRight, RefreshCw, Smartphone } from "lucide-react";
import Link from "next/link";
import PixelAvatar from "@/components/PixelAvatar";
import PageTransition from "@/components/PageTransition";

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
    selectedPillars,
  } = useRunwayStore();

  const [loopState, setLoopState] = useState<LoopState>("QUESTS");
  const [questsList, setQuestsList] = useState<any[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [tickerRes, setTickerRes] = useState(0);
  const [loadingLive, setLoadingLive] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<number>(2);

  // Get static record for baseline stats
  const dayIndex = currentDay - 1;
  const staticRecord = journeyData.days[dayIndex] || journeyData.days[journeyData.days.length - 1];

  const prevRecord = dayIndex > 0 ? journeyData.days[dayIndex - 1] : null;
  const startRes = prevRecord ? prevRecord.resolutionPct : 0.0;
  const endRes = staticRecord.resolutionPct;

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<any>(null);

  const fetchLiveQuests = async (energyVal = energyLevel) => {
    // Cancel any previous pending request & timeout
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    setLoadingLive(true);
    
    // Create new abort controller and store in ref
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Get recent history (previous 7 days)
    const prevDays = journeyData.days.slice(
      Math.max(0, currentDay - 8),
      Math.max(0, currentDay - 1)
    );
    const recentHistory = prevDays
      .map((d: any) => `Day ${d.day}: ${d.quests.filter((q: any) => q.done).map((q: any) => q.text).join(", ")}`)
      .join("\n");

    // Set 6-second timeout to abort the controller
    timeoutIdRef.current = setTimeout(() => {
      controller.abort();
    }, 6000);

    try {
      const activePillars = selectedPillars && selectedPillars.length > 0
        ? selectedPillars
        : ["Body", "Mind", "Craft", "Voice", "Order", "Bonds"];

      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pillars: activePillars,
          recentHistory: recentHistory || "Day 0: No prior history.",
          energy: energyVal,
        }),
        signal: controller.signal,
      });

      // If aborted/cancelled during fetch, exit silently
      if (controller.signal.aborted) return;

      // Clear timeout upon successful response
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      if (!res.ok) throw new Error(`API error: status ${res.status}`);

      const data = await res.json();
      if (controller.signal.aborted) return;

      if (data.quests && Array.isArray(data.quests)) {
        // Normalize
        const normalized = data.quests.map((q: any, idx: number) => {
          let pillar = q.pillar;
          const match = ["Body", "Mind", "Craft", "Voice", "Order", "Bonds"].find(
            (p) => p.toLowerCase() === pillar.toLowerCase()
          );
          pillar = match || "Mind";

          let tier = q.tier;
          const tierMatch = ["Tiny", "Standard", "Hard"].find(
            (t) => t.toLowerCase() === tier.toLowerCase()
          );
          tier = tierMatch || "Standard";

          return {
            id: `live-${currentDay}-${idx}-${Date.now()}`,
            pillar,
            tier,
            text: q.text || "Do a quick focus check",
            anchor: q.anchor || "I open my eyes",
            done: false,
          };
        });

        setLiveQuestsForDay(currentDay, normalized);
        setQuestsList(normalized);
      } else {
        throw new Error("Invalid structure returned");
      }
    } catch (err: any) {
      // Ignore if this is not the active controller anymore
      if (controller.signal.aborted && abortControllerRef.current !== controller) {
        return;
      }

      console.warn("QUEST_API_FALLBACK_TRIGGERED:", err.message || err);
      // Fallback silently to static quests
      const fallbackQuests = staticRecord.quests.map((q: any) => ({
        ...q,
        done: false,
      }));
      setQuestsList(fallbackQuests);
    } finally {
      // Clean up refs and loading state if this is still the active request
      if (abortControllerRef.current === controller) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        setLoadingLive(false);
        abortControllerRef.current = null;
      }
    }
  };

  // Sync energy level and load quests on day/liveAI change
  useEffect(() => {
    if (isSessionLocked) {
      setLoopState("COMPLETED");
    } else {
      setLoopState("QUESTS");
    }

    const defaultEnergy = staticRecord.energy || 2;
    setEnergyLevel(defaultEnergy);

    if (liveAI) {
      if (!liveQuests[currentDay]) {
        fetchLiveQuests(defaultEnergy);
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

    // Clean up abort controller and timeout when effect unmounts or restarts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [currentDay, liveAI, isSessionLocked, staticRecord]);

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
        if (loadingLive) {
          return (
            <div className="flex flex-col gap-6 py-12 items-center justify-center text-center">
              <RefreshCw size={36} className="text-teal animate-spin mb-2" />
              <h3 className="font-bold text-teal text-sm">Consulting the AI Quest Master...</h3>
              <p className="text-[11px] text-text-muted max-w-xs leading-relaxed">
                Structuring personalized intentions for Day {currentDay} using Gemini Flash...
              </p>
            </div>
          );
        }

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
              
              {/* Interactive energy selection for live validation and demo */}
              {liveAI ? (
                <div className="mt-1 flex flex-col gap-1.5 border border-teal/10 bg-teal/5 p-2.5 rounded-lg text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-teal">
                    Simulate Energy Level:
                  </span>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => {
                          setEnergyLevel(lvl);
                          fetchLiveQuests(lvl);
                        }}
                        className={`flex-1 text-[10px] py-1 rounded font-bold border transition-all duration-200 ${
                          energyLevel === lvl
                            ? "bg-teal text-white border-teal shadow-sm"
                            : "bg-white text-text-muted border-[var(--border-color)] hover:border-teal/30"
                        }`}
                      >
                        {lvl === 1 ? "1 (Low / Tiny)" : lvl === 2 ? "2 (Mid)" : "3 (High)"}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-muted">
                  Energy Level: {staticRecord.energy === 1 ? "Low (1 Quest)" : staticRecord.energy === 2 ? "Mid (2 Quests)" : "High (3 Quests)"}
                </p>
              )}
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

            {liveAI && (
              <div className="flex justify-end -mt-2">
                <button
                  onClick={() => fetchLiveQuests(energyLevel)}
                  disabled={loadingLive}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal hover:text-teal-deep disabled:opacity-50"
                >
                  <RefreshCw size={10} className={loadingLive ? "animate-spin" : ""} />
                  Regenerate with Gemini
                </button>
              </div>
            )}

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
              <PixelAvatar resolutionPct={tickerRes} size={140} className="mb-2" />
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-teal animate-spin" />
                <h3 className="text-sm font-bold text-teal font-heading">Rendering Avatar Resolution</h3>
              </div>
              <p className="text-[11px] text-text-muted">Consolidating daily habit signals...</p>
              
              <div className="mt-4 flex flex-col items-center">
                <span className="text-4xl font-extrabold text-teal font-heading tabular-nums">
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
    <PageTransition>
      <div className="flex flex-col gap-6 py-4">
        {/* Session Timer (Only show when not fully completed or soft-locked) */}
        {loopState !== "COMPLETED" && <SessionTimer />}

        {renderContent()}
      </div>
    </PageTransition>
  );
}
