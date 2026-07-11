"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import { Dumbbell, Brain, Code, MessageSquare, Sparkles, Heart, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";

type Pillar = "Body" | "Mind" | "Craft" | "Voice" | "Order" | "Bonds";

const PILLAR_DETAILS: Record<Pillar, { label: string; icon: any; desc: string }> = {
  Body: { label: "Body", icon: Dumbbell, desc: "Movement, stretching, and physical energy" },
  Mind: { label: "Mind", icon: Brain, desc: "Silence, reading, focus, and clarity" },
  Craft: { label: "Craft", icon: Code, desc: "Coding, writing, and deep building" },
  Voice: { label: "Voice", icon: MessageSquare, desc: "Writing in public, peer check-ins, networking" },
  Order: { label: "Order", icon: Sparkles, desc: "Workspace clearing, digital hygiene, decluttering" },
  Bonds: { label: "Bonds", icon: Heart, desc: "Family check-ins, genuine social ties, love" },
};

export default function Onboarding() {
  const router = useRouter();
  const { setCurrentDay, resetSession, liveAI, setSelectedPillars } = useRunwayStore();
  const [step, setStep] = useState(1);

  // Step 1: Selected Pillars
  const [selectedPillars, setSelectedPillarsState] = useState<Record<Pillar, boolean>>({
    Body: true,
    Mind: true,
    Craft: true,
    Voice: true,
    Order: true,
    Bonds: true,
  });

  // Step 2: Slider values
  const [pillarScores, setPillarScores] = useState<Record<Pillar, number>>({
    Body: 5,
    Mind: 5,
    Craft: 5,
    Voice: 5,
    Order: 5,
    Bonds: 5,
  });

  // Step 3: Animation logs
  const [generationLog, setGenerationLog] = useState<string>("Analyzing selected focus pillars...");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [liveTestQuest, setLiveTestQuest] = useState<any>(null);

  const togglePillar = (pillar: Pillar) => {
    setSelectedPillarsState(prev => ({
      ...prev,
      [pillar]: !prev[pillar]
    }));
  };

  const handleScoreChange = (pillar: Pillar, score: number) => {
    setPillarScores(prev => ({
      ...prev,
      [pillar]: score
    }));
  };

  // Step 3 loading sequence simulation
  useEffect(() => {
    if (step !== 3) return;

    let isSubscribed = true;

    if (liveAI) {
      setGenerationLog("Initiating live Quest Master validation...");
      setGenerationProgress(10);

      const runLiveAIOnboarding = async () => {
        const activePillars = (Object.keys(selectedPillars) as Pillar[]).filter(k => selectedPillars[k]);
        
        try {
          if (isSubscribed) {
            setGenerationLog("Reaching Gemini API via server route...");
            setGenerationProgress(30);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const res = await fetch("/api/quest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pillars: activePillars,
              recentHistory: "Day 0: No prior history. User has just completed onboarding and selected focus pillars.",
              energy: 2
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!res.ok) throw new Error("API Route failure");

          const data = await res.json();
          if (isSubscribed) {
            setGenerationLog("Personalized quest received. Parsing parameters...");
            setGenerationProgress(70);
          }

          if (data.quests && data.quests.length > 0) {
            if (isSubscribed) {
              setLiveTestQuest(data.quests[0]);
              setGenerationLog("Gemini Quest Master initialized.");
              setGenerationProgress(100);
            }
          } else {
            throw new Error("No quests returned");
          }
        } catch (err) {
          console.warn("Onboarding live AI call failed or timed out. Falling back silently.", err);
          if (isSubscribed) {
            setGenerationLog("API offline or slow. Falling back to local offline generation...");
            setGenerationProgress(50);
            setTimeout(() => {
              if (isSubscribed) {
                setGenerationLog("Calibrating 250 offline milestones...");
                setGenerationProgress(80);
                setTimeout(() => {
                  if (isSubscribed) {
                    setGenerationLog("Runway initialized offline successfully.");
                    setGenerationProgress(100);
                  }
                }, 600);
              }
            }, 800);
          }
        }
      };

      runLiveAIOnboarding();
    } else {
      const logs = [
        "Analyzing selected focus pillars...",
        "Measuring initial baseline static...",
        "Structuring 250 daily quest blocks...",
        "Wiring up Fogg anchor intentions...",
        "Seeding 2 Duolingo-style streak freezes...",
        "Generating your custom Runway arc..."
      ];

      let currentLogIndex = 0;
      const interval = setInterval(() => {
        currentLogIndex++;
        if (currentLogIndex < logs.length) {
          setGenerationLog(logs[currentLogIndex]);
          setGenerationProgress(prev => prev + 16);
        } else {
          setGenerationProgress(100);
          setGenerationLog("Runway initialized successfully.");
          clearInterval(interval);
        }
      }, 600);

      return () => {
        isSubscribed = false;
        clearInterval(interval);
      };
    }

    return () => {
      isSubscribed = false;
    };
  }, [step, liveAI]);

  const handleCompleteSetup = () => {
    // Save selected pillars to store
    const active = (Object.keys(selectedPillars) as Pillar[]).filter(k => selectedPillars[k]);
    setSelectedPillars(active);

    // Reset to Day 1 for active play!
    setCurrentDay(1);
    resetSession();
    router.push("/today");
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-5 flex-1">
            <div>
              <h2 className="text-lg font-bold text-teal font-heading">1. Select Your Pillars</h2>
              <p className="text-xs text-text-muted">Choose the areas of life you want to render into high definition.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(PILLAR_DETAILS) as Pillar[]).map((key) => {
                const Icon = PILLAR_DETAILS[key].icon;
                const isSelected = selectedPillars[key];
                return (
                  <Card
                    key={key}
                    variant={isSelected ? "pixel" : "surface"}
                    className={`cursor-pointer transition-all duration-200 p-4 border flex gap-4 items-center ${
                      isSelected ? "border-teal bg-teal/5" : "border-transparent"
                    }`}
                    onClick={() => togglePillar(key)}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? "bg-teal text-white" : "bg-teal/10 text-teal-deep"}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-xs flex justify-between">
                        <span>{PILLAR_DETAILS[key].label}</span>
                        {isSelected && <span className="text-[10px] text-teal">Selected</span>}
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">{PILLAR_DETAILS[key].desc}</p>
                    </div>
                  </Card>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!Object.values(selectedPillars).some(v => v)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep disabled:bg-teal/40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue to Audit <ArrowRight size={14} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-5 flex-1">
            <div>
              <h2 className="text-lg font-bold text-teal font-heading">2. Current-State Audit</h2>
              <p className="text-xs text-text-muted">Be honest. Where is the static densest right now?</p>
            </div>

            <div className="flex flex-col gap-4">
              {(Object.keys(PILLAR_DETAILS) as Pillar[])
                .filter(key => selectedPillars[key])
                .map((key) => {
                  const score = pillarScores[key];
                  let label = "Partial Outline";
                  if (score <= 3) label = "Severe Static / Blur";
                  else if (score >= 8) label = "High Contrast / Sharp";

                  return (
                    <Card key={key} variant="default" className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-teal">{key}</span>
                        <span className="text-[10px] bg-teal/10 text-teal-deep px-2 py-0.5 rounded font-mono">
                          Score: {score}/10
                        </span>
                      </div>
                      
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={score}
                        onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                        className="w-full accent-teal cursor-pointer"
                      />
                      
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>1 (Blurry)</span>
                        <span className="font-semibold text-teal-deep">{label}</span>
                        <span>10 (Crisp)</span>
                      </div>
                    </Card>
                  );
                })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-teal text-teal font-semibold text-xs hover:bg-teal/5 transition-all duration-200"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200"
              >
                Assemble Runway <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-6 flex-1 justify-center py-10 text-center">
            <div>
              <h2 className="text-xl font-bold text-teal font-heading">3. Customizing Your Runway</h2>
              <p className="text-xs text-text-muted mt-1">Calculating daily loops & habit cues...</p>
            </div>

            <div className="flex flex-col items-center gap-4 my-6">
              {generationProgress < 100 ? (
                <Loader2 size={36} className="text-teal animate-spin" />
              ) : (
                <div className="w-12 h-12 bg-teal text-white rounded-full flex items-center justify-center font-bold text-lg animate-bounce">
                  ✓
                </div>
              )}
              
              <div className="w-full bg-teal/10 rounded-full h-1.5 max-w-xs overflow-hidden">
                <div
                  className="bg-teal h-1.5 transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              
              <p className="text-xs font-mono text-teal-deep h-8 px-4">{generationLog}</p>
            </div>

            {generationProgress === 100 && (
              <div className="flex flex-col gap-4 max-w-sm mx-auto w-full px-2">
                <Card variant="pixel" className="p-4 bg-teal/5 border-teal text-left flex flex-col gap-2">
                  <h4 className="font-bold text-xs text-teal">Runway Parameters</h4>
                  <ul className="text-[11px] text-text-muted space-y-1.5 list-disc pl-4">
                    <li>Total Journey: 250 structured days</li>
                    <li>Active Pillars: {Object.keys(selectedPillars).filter(k => selectedPillars[k as Pillar]).join(", ")}</li>
                    <li>Initial Resolution: 1.0% (Day 1)</li>
                    <li>Streak Freezes: 2 loaded</li>
                  </ul>
                </Card>

                {liveTestQuest && (
                  <Card variant="default" className="p-3 border-teal/20 bg-teal/5 text-left flex flex-col gap-1.5 border">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 bg-teal rounded-full animate-pulse" />
                      <h5 className="font-bold text-[10px] text-teal uppercase tracking-wider">Live Quest Sample Created</h5>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Pillar: <span className="font-bold text-text-primary">{liveTestQuest.pillar}</span> ({liveTestQuest.tier})<br/>
                      After I <span className="underline decoration-teal/30">{liveTestQuest.anchor}</span>, I will <span className="text-text-primary font-medium">{liveTestQuest.text}</span>.
                    </p>
                  </Card>
                )}

                <button
                  onClick={handleCompleteSetup}
                  className="w-full py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200"
                >
                  Begin Journey (Day 1)
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="flex flex-col flex-1 justify-center py-4 min-h-[80vh]">
        {renderStep()}
      </div>
    </PageTransition>
  );
}
