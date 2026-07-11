"use client";

import { useState, useEffect, useRef } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import QuestTile from "@/components/QuestTile";
import SessionTimer from "@/components/SessionTimer";
import LiveAIChip from "@/components/LiveAIChip";
import journeyData from "@/lib/data/journey.json";
import { ArrowRight, RefreshCw, Smartphone, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import PixelAvatar from "@/components/PixelAvatar";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { RIDDLES_BANK } from "@/lib/game/riddles";
import { playSound, triggerHaptic } from "@/lib/game/audio";
import ApertureLoader from "@/components/ApertureLoader";

type LoopState = "QUESTS" | "REFLECTION" | "RESOLVING" | "COMPLETED";

const IRIS_REACTIONS = [
  "Vector lock. Excellent.",
  "Static clearing. I see you.",
  "Signal strength increasing. Keep tracing.",
  "A perfect coordinate. Well done.",
  "Runway holds. Keep moving.",
];

const getGreeting = (act: string, energy: number) => {
  if (act.toLowerCase() === "boot") {
    if (energy === 1) return "System load high. Let's keep the footprint small today.";
    if (energy === 2) return "Booting daily vectors. Keep your pace steady.";
    return "Full bandwidth detected. Let's make progress.";
  } else if (act.toLowerCase() === "rendering") {
    if (energy === 1) return "Static levels are rising. Slow down to render cleanly.";
    if (energy === 2) return "Lines are rendering. Let's place the next coordinates.";
    return "Clear signal. Ready to render details.";
  } else if (act.toLowerCase() === "sharpening") {
    if (energy === 1) return "Contrast check. Focus on the smallest detail today.";
    if (energy === 2) return "Edges are aligning. Maintain the calibration.";
    return "High definition. Let's sharpen the focus.";
  } else {
    if (energy === 1) return "Resolution lock. Steady as you go.";
    if (energy === 2) return "Signal is near-perfect. Trace the final lines.";
    return "Maximum clarity. Execute the loop.";
  }
};

const getActText = (day: number) => {
  if (day <= 50) return "ACT I: BOOT";
  if (day <= 120) return "ACT II: RENDERING";
  if (day <= 200) return "ACT III: SHARPENING";
  return "ACT IV: FOCUS";
};

export default function Today() {
  const {
    currentDay,
    liveAI,
    liveQuests,
    setLiveQuestsForDay,
    toggleLiveQuestDone,
    updateQuestDescription,
    isSessionLocked,
    setSessionLocked,
    sessionTimeLeft,
    selectedPillars,
    solvedRiddles,
    solveRiddle,
  } = useRunwayStore();

  const [loopState, setLoopState] = useState<LoopState>("QUESTS");
  const [questsList, setQuestsList] = useState<any[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [tickerRes, setTickerRes] = useState(0);
  const [loadingLive, setLoadingLive] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<number>(2);

  // Elegant Entry & Power Down state
  const [showDayCard, setShowDayCard] = useState(true);
  const [isPoweredDown, setIsPoweredDown] = useState(false);
  const [irisComment, setIrisComment] = useState("");

  // Daily Riddle state
  const [isRiddleOpen, setIsRiddleOpen] = useState(false);
  const [currentRiddle, setCurrentRiddle] = useState<any>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [loadingRiddle, setLoadingRiddle] = useState(false);
  const [riddleMessage, setRiddleMessage] = useState("");
  const riddleInputRef = useRef<HTMLInputElement>(null);

  // Get static record for baseline stats
  const dayIndex = currentDay - 1;
  const staticRecord = journeyData.days[dayIndex] || journeyData.days[journeyData.days.length - 1];

  const prevRecord = dayIndex > 0 ? journeyData.days[dayIndex - 1] : null;
  const startRes = prevRecord ? prevRecord.resolutionPct : 0.0;
  const endRes = staticRecord.resolutionPct;

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<any>(null);

  const fetchLiveQuests = async (energyVal = energyLevel) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    setLoadingLive(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Get recent history
    const prevDays = journeyData.days.slice(
      Math.max(0, currentDay - 8),
      Math.max(0, currentDay - 1)
    );
    const recentHistory = prevDays
      .map((d: any) => `Day ${d.day}: ${d.quests.filter((q: any) => q.done).map((q: any) => q.text).join(", ")}`)
      .join("\n");

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

      if (controller.signal.aborted) return;

      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      if (!res.ok) throw new Error(`API error: status ${res.status}`);

      const data = await res.json();
      if (controller.signal.aborted) return;

      if (data.quests && Array.isArray(data.quests)) {
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
            isHunt: q.isHunt || false,
          };
        });

        setLiveQuestsForDay(currentDay, normalized);
        setQuestsList(normalized);
      } else {
        throw new Error("Invalid structure returned");
      }
    } catch (err: any) {
      if (controller.signal.aborted && abortControllerRef.current !== controller) {
        return;
      }
      console.warn("QUEST_API_FALLBACK_TRIGGERED:", err.message || err);
      // Fallback
      const slicedQuests = staticRecord.quests.slice(0, energyVal).map((q: any) => ({
        ...q,
        done: false,
      }));
      setQuestsList(slicedQuests);
    } finally {
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

  // Entry Transition and Page Setup
  useEffect(() => {
    setShowDayCard(true);
    // Play low boot up tone
    playSound("boot_up");

    const cardTimer = setTimeout(() => {
      setShowDayCard(false);
    }, 1200);

    if (isSessionLocked) {
      setLoopState("COMPLETED");
    } else {
      setLoopState("QUESTS");
    }

    const defaultEnergy = staticRecord.energy || 2;
    setEnergyLevel(defaultEnergy);
    setIrisComment(getGreeting(staticRecord.act, defaultEnergy));

    if (liveAI) {
      if (!liveQuests[currentDay]) {
        fetchLiveQuests(defaultEnergy);
      } else {
        setQuestsList(liveQuests[currentDay]);
      }
    } else {
      const slicedQuests = staticRecord.quests.slice(0, defaultEnergy).map((q: any) => ({
        ...q,
        done: false,
      }));
      setQuestsList(slicedQuests);
    }

    setReflectionText(staticRecord.reflection);

    return () => {
      clearTimeout(cardTimer);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, [currentDay, liveAI, isSessionLocked, staticRecord]);
  const handleToggleQuest = (questId: string) => {
    let updated;
    if (liveAI) {
      toggleLiveQuestDone(currentDay, questId);
      updated = questsList.map((q) => (q.id === questId ? { ...q, done: !q.done } : q));
    } else {
      updated = questsList.map((q) => (q.id === questId ? { ...q, done: !q.done } : q));
    }
    setQuestsList(updated);

    const clickedQuest = updated.find((q) => q.id === questId);
    if (clickedQuest && clickedQuest.done) {
      const randomReaction = IRIS_REACTIONS[Math.floor(Math.random() * IRIS_REACTIONS.length)];
      setIrisComment(randomReaction);
      
      // Synthesized cue and tactile response
      playSound("quest_complete");
      triggerHaptic(15);
    }
  };

  const handleHuntDescriptionChange = (questId: string, val: string) => {
    const updated = questsList.map((q) =>
      q.id === questId ? { ...q, description: val } : q
    );
    setQuestsList(updated);

    if (liveAI) {
      updateQuestDescription(currentDay, questId, val);
    }
  };

  const loadRiddleForToday = async () => {
    setLoadingRiddle(true);
    setRiddleMessage("");
    setTypedAnswer("");

    if (liveAI) {
      try {
        const res = await fetch("/api/riddle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completedQuests: questsList.map((q) => q.text),
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.riddle && data.answer) {
            setCurrentRiddle(data);
            setLoadingRiddle(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load live riddle, falling back", err);
      }
    }

    const primaryPillar = questsList[0]?.pillar || "Mind";
    const bank = RIDDLES_BANK.filter((r) => r.pillar.toLowerCase() === primaryPillar.toLowerCase());
    const matched = bank.length > 0 
      ? bank[currentDay % bank.length] 
      : RIDDLES_BANK[currentDay % RIDDLES_BANK.length];

    setCurrentRiddle(matched);
    setLoadingRiddle(false);
  };

  const handleProceedToReflection = () => {
    const completedHunt = questsList.find((q) => q.isHunt && q.done);
    if (completedHunt && completedHunt.description) {
      setReflectionText(completedHunt.description);
    }
    setLoopState("REFLECTION");
  };

  const handleCommitReflection = () => {
    setLoopState("RESOLVING");
    let current = startRes;
    const finalTarget = endRes + (solvedRiddles[currentDay] ? 0.5 : 0.0);
    const stepValue = (finalTarget - startRes) / 30;
    let count = 0;

    const interval = setInterval(() => {
      current += stepValue;
      count++;
      if (count >= 30) {
        setTickerRes(finalTarget);
        clearInterval(interval);
        // Play fuller two-note resolve sound
        playSound("day_complete");
        setTimeout(() => {
          setSessionLocked(true);
          setLoopState("COMPLETED");
        }, 1000);
      } else {
        setTickerRes(Math.round(current * 10) / 10);
      }
    }, 55);
  };

  // Live Resolution Calc
  const completedCount = questsList.filter(q => q.done).length;
  const totalQuests = questsList.length;
  const isRiddleSolved = solvedRiddles[currentDay] || false;
  const riddleBonusVal = isRiddleSolved ? 0.5 : 0.0;
  const currentResolution = totalQuests > 0
    ? startRes + (completedCount / totalQuests) * (endRes - startRes) + riddleBonusVal
    : startRes + riddleBonusVal;

  const renderContent = () => {
    switch (loopState) {
      case "QUESTS":
        if (loadingLive) {
          return (
            <div className="py-12 flex items-center justify-center">
              <ApertureLoader label="Consulting IRIS..." />
            </div>
          );
        }

        return (
          <div className="flex flex-col gap-6">
            {/* Immersive Header Avatar */}
            <div className="border border-neutral-200/60 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md rounded-2xl p-4 flex gap-4 items-center">
              <div className="relative shrink-0 border border-teal/15 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-950">
                <PixelAvatar resolutionPct={currentResolution} size={42} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono tracking-widest text-teal uppercase font-bold">
                    IRIS System Link
                  </span>
                  <span className="text-[10px] font-mono font-bold text-text-muted">
                    Res: {currentResolution.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-text-primary mt-1 italic leading-relaxed font-sans">
                  "{irisComment}"
                </p>
              </div>
            </div>

            {/* In-world Fuel Selector */}
            <div className="flex flex-col gap-2 border border-teal/10 bg-teal/5 dark:bg-teal-deep/5 p-4 rounded-xl text-left">
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-teal flex items-center justify-between">
                <span>In-game Fuel Gauge</span>
                <LiveAIChip isLive={liveAI} />
              </span>
              <p className="text-xs font-semibold text-text-primary">
                "How much fuel today?"
              </p>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map((lvl) => {
                  let label = "Steady";
                  if (lvl === 1) label = "Running on fumes";
                  if (lvl === 3) label = "Fully charged";

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setEnergyLevel(lvl);
                        if (liveAI) {
                          fetchLiveQuests(lvl);
                        } else {
                          const sliced = staticRecord.quests.slice(0, lvl).map((q: any) => ({ ...q, done: false }));
                          setQuestsList(sliced);
                        }
                      }}
                      className={`flex-1 text-[10px] py-2.5 px-2 rounded-lg font-bold border transition-all duration-300 cursor-pointer ${
                        energyLevel === lvl
                          ? "bg-teal text-white border-teal shadow-md"
                          : "bg-white/80 dark:bg-neutral-900/80 text-text-muted border-neutral-200/60 dark:border-neutral-800/60 hover:border-teal/30"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] italic text-teal/80 mt-1 font-mono transition-all duration-300">
                IRIS: &ldquo;{energyLevel === 1 
                  ? "Then we go tiny today. Tiny still counts." 
                  : energyLevel === 2 
                    ? "Steady vectors. A solid pace. Let's proceed." 
                    : "Full energy. A powerful surge. Make it count."
                }&rdquo;
              </p>
            </div>

            {/* Collectible Quest Cards */}
            <div className="flex flex-col gap-3.5">
              {questsList.map((quest) => (
                <QuestTile
                  key={quest.id}
                  pillar={quest.pillar}
                  tier={quest.tier}
                  text={quest.text}
                  anchor={quest.anchor}
                  done={quest.done}
                  isHunt={quest.isHunt}
                  description={quest.description || ""}
                  onDescriptionChange={(val) => handleHuntDescriptionChange(quest.id, val)}
                  onToggle={() => handleToggleQuest(quest.id)}
                />
              ))}
            </div>

            {/* Live Quest Refresher */}
            {liveAI && (
              <div className="flex justify-end -mt-2">
                <button
                  onClick={() => fetchLiveQuests(energyLevel)}
                  disabled={loadingLive}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal hover:text-teal-deep disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={10} className={loadingLive ? "animate-spin" : ""} />
                  Ask IRIS for different quests
                </button>
              </div>
            )}

            <button
              onClick={handleProceedToReflection}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200 cursor-pointer"
            >
              Record today&apos;s signal <ArrowRight size={14} />
            </button>
          </div>
        );

      case "REFLECTION":
        const hasCompletedHunt = questsList.some((q) => q.isHunt && q.done);
        return (
          <div className="flex flex-col gap-6 text-left max-w-md mx-auto py-4">
            <div className="text-center">
              <span className="text-[10px] font-mono tracking-widest uppercase text-teal">
                Recording the Signal
              </span>
              <h2 className="text-xl font-black text-text-primary mt-1 font-heading">
                The Daily Log
              </h2>
            </div>

            <Card variant="pixel" className="p-6 flex flex-col gap-4 bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-teal font-bold">
                  IRIS Inquiry
                </span>
                <p className="text-xs font-semibold text-text-primary">
                  {hasCompletedHunt
                    ? "Your hunt discovery has been mapped as today's signal."
                    : "\u201COne honest sentence. That\u2019s the whole ask.\u201D"}
                </p>
              </div>

              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-transparent focus:outline-none focus:border-teal text-text-primary font-mono leading-relaxed"
                placeholder={hasCompletedHunt ? "Your logged discovery content..." : "Write today's signal..."}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (hasCompletedHunt) {
                      const firstHunt = questsList.find((q) => q.isHunt && q.done);
                      setReflectionText(firstHunt?.description || "");
                    } else {
                      setReflectionText(staticRecord.reflection);
                    }
                  }}
                  className="text-[9px] text-teal hover:underline font-bold uppercase tracking-wider font-mono cursor-pointer"
                >
                  {hasCompletedHunt ? "[ Reset to hunt discovery ]" : "[ Accept default signal ]"}
                </button>
              </div>
            </Card>

            <button
              onClick={handleCommitReflection}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200 cursor-pointer"
            >
              Commit & Render Resolution <RefreshCw size={14} />
            </button>
          </div>
        );

      case "RESOLVING":
        return (
          <div className="flex flex-col flex-1 items-center justify-center py-20 text-center relative">
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
        const allQuestsDone = questsList.length > 0 && questsList.every((q) => q.done);
        const isRiddleSolved = solvedRiddles[currentDay] || false;
        const riddleBonusVal = isRiddleSolved ? 0.5 : 0.0;
        const finalResolutionPct = endRes + riddleBonusVal;

        return (
          <div className="flex flex-col flex-1 items-center justify-center py-6 text-center gap-6">
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center text-teal mb-1">
              <Smartphone size={28} />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-teal font-heading uppercase">
                Day {currentDay} Rendered
              </h2>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                You have logged your daily choices and reflections.
              </p>
            </div>

            {/* Before / After Slivers */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/40 dark:bg-neutral-900/40">
                <PixelAvatar resolutionPct={startRes} size={64} />
                <span className="text-[9px] uppercase font-mono text-text-muted tracking-wider">Before</span>
                <span className="text-[11px] font-mono font-bold text-text-primary">{startRes.toFixed(1)}%</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-teal/20 bg-teal/5">
                <PixelAvatar resolutionPct={finalResolutionPct} size={64} />
                <span className="text-[9px] uppercase font-mono text-teal tracking-wider">After</span>
                <span className="text-[11px] font-mono font-bold text-teal">{finalResolutionPct.toFixed(1)}%</span>
              </div>
            </div>

            {/* Daily Riddle Section */}
            {allQuestsDone && (
              <div className="w-full max-w-sm flex flex-col gap-3">
                {isRiddleSolved ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-teal/5 border border-teal/20 rounded-xl p-4 text-left font-mono flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center text-teal shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-teal block">
                        IRIS Riddle Decoded
                      </span>
                      <p className="text-xs text-text-primary mt-0.5 leading-snug">
                        Decryption successful. Bonus resolution (+0.5%) applied to today's loop.
                      </p>
                    </div>
                  </motion.div>
                ) : !isRiddleOpen ? (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={async () => {
                      setIsRiddleOpen(true);
                      playSound("envelope_open");
                      await loadRiddleForToday();
                    }}
                    className="w-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-400/30 rounded-xl p-4 text-left font-mono flex items-center justify-between group transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                        <Mail size={18} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-500 block">
                          IRIS left you something.
                        </span>
                        <p className="text-xs text-text-primary font-semibold mt-0.5">
                          Unseal today's riddle
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 text-left font-mono relative overflow-hidden flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] uppercase font-bold text-amber-600 dark:text-amber-500 tracking-wider">
                        IRIS Riddle Link
                      </span>
                      <button
                        onClick={() => setIsRiddleOpen(false)}
                        className="text-[10px] text-text-muted hover:text-text-primary cursor-pointer font-bold"
                      >
                        [ Hide ]
                      </button>
                    </div>

                    {loadingRiddle ? (
                      <div className="py-6 flex items-center justify-center">
                        <ApertureLoader label="Unsealing..." size={36} />
                      </div>
                    ) : currentRiddle ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-xs text-text-primary leading-relaxed font-sans italic border-l-2 border-amber-500/50 pl-3 py-1 bg-amber-500/[0.02] rounded-r-md">
                          &ldquo;{currentRiddle.riddle}&rdquo;
                        </p>

                        <div className="mt-1">
                          <span className="text-[9px] uppercase font-bold text-text-muted block mb-1.5">
                            Decryption Matrix ({currentRiddle.answer.length} letters):
                          </span>

                          <div 
                            onClick={() => riddleInputRef.current?.focus()} 
                            className="relative cursor-text py-2 select-none"
                          >
                            <div className="flex gap-1.5 justify-center">
                              {currentRiddle.answer.split("").map((expectedChar: string, idx: number) => {
                                const typedChar = (typedAnswer[idx] || "").toLowerCase();
                                const isCorrect = typedChar === expectedChar.toLowerCase();
                                return (
                                  <div
                                    key={idx}
                                    className={`w-8 h-10 border-2 rounded-lg flex items-center justify-center font-mono text-sm font-bold uppercase transition-all duration-300 ${
                                      isCorrect
                                        ? "border-teal bg-teal/10 text-teal [filter:blur(0px)]"
                                        : "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-text-muted/60 [filter:blur(1.5px)]"
                                    }`}
                                  >
                                    {typedChar || ""}
                                  </div>
                                );
                              })}
                            </div>

                            <input
                              ref={riddleInputRef}
                              type="text"
                              maxLength={currentRiddle.answer.length}
                              value={typedAnswer}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-Z]/g, "").toLowerCase();
                                setTypedAnswer(val);

                                if (val === currentRiddle.answer.toLowerCase()) {
                                  solveRiddle(currentDay);
                                  setRiddleMessage("Decryption complete. Alignment locked.");
                                  playSound("quest_complete");
                                  triggerHaptic(15);
                                }
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-text"
                              autoFocus
                            />
                          </div>

                          <p className="text-[9px] text-center text-text-muted mt-2">
                            [ Tap boxes to begin typing ]
                          </p>
                        </div>

                        {riddleMessage && (
                          <div className="mt-1 text-center py-1.5 px-2 bg-teal/5 border border-teal/15 rounded-lg text-teal text-[10px] font-bold">
                            {riddleMessage}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">Failed to retrieve riddle from IRIS.</p>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            <div className="w-full max-w-sm bg-neutral-900 text-white font-mono rounded-xl p-4 text-left border border-neutral-800 shadow-md">
              <span className="text-[9px] text-teal uppercase tracking-widest block mb-1">
                IRIS Log
              </span>
              <p className="text-xs leading-relaxed font-sans text-neutral-200">
                &ldquo;Day {currentDay}, rendered. Now close me. Your real life is the game.&rdquo;
              </p>
            </div>

            <button
              onClick={() => setIsPoweredDown(true)}
              className="w-full max-w-xs py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200 cursor-pointer"
            >
              Go live your life
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Fullscreen Power-down Screen
  if (isPoweredDown) {
    return (
      <div 
        onClick={() => setIsPoweredDown(false)}
        className="fixed inset-0 z-50 bg-bg-app flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-mono tracking-widest text-teal uppercase font-bold animate-pulse">
            IRIS
          </span>
          <p className="text-xs font-mono text-text-muted max-w-xs leading-relaxed">
            Runway active. Go live your life. The game is outside.
          </p>
          <div className="mt-12 text-[8px] text-text-muted/40 font-mono">
            [ Click anywhere to wake screen ]
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-4">
        {/* Entry elegant title card */}
        <AnimatePresence>
          {showDayCard && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-bg-app flex flex-col items-center justify-center text-center p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-1.5"
              >
                <span className="text-[9px] font-mono tracking-widest text-teal uppercase font-bold">
                  System Load Sequence
                </span>
                <h1 className="text-xl md:text-2xl font-black text-teal font-heading tracking-wide uppercase">
                  {getActText(currentDay)}
                </h1>
                <p className="text-sm font-mono text-text-primary">
                  Day {currentDay} of 250
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {loopState !== "COMPLETED" && <SessionTimer />}

        {renderContent()}
      </div>
    </PageTransition>
  );
}
