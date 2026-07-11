"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import { Dumbbell, Brain, Code, MessageSquare, Sparkles, Heart, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";

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
  const { setCurrentDay, resetSession } = useRunwayStore();
  const [step, setStep] = useState(1);

  // Step 1: Selected Pillars
  const [selectedPillars, setSelectedPillars] = useState<Record<Pillar, boolean>>({
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

  const togglePillar = (pillar: Pillar) => {
    setSelectedPillars(prev => ({
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

    return () => clearInterval(interval);
  }, [step]);

  const handleCompleteSetup = () => {
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
              
              <p className="text-xs font-mono text-teal-deep h-8">{generationLog}</p>
            </div>

            {generationProgress === 100 && (
              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <Card variant="pixel" className="p-4 bg-teal/5 border-teal text-left flex flex-col gap-2">
                  <h4 className="font-bold text-xs text-teal">Runway Parameters</h4>
                  <ul className="text-[11px] text-text-muted space-y-1.5 list-disc pl-4">
                    <li>Total Journey: 250 structured days</li>
                    <li>Active Pillars: {Object.keys(selectedPillars).filter(k => selectedPillars[k as Pillar]).join(", ")}</li>
                    <li>Initial Resolution: 1.0% (Day 1)</li>
                    <li>Streak Freezes: 2 loaded</li>
                  </ul>
                </Card>

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
    <div className="flex flex-col flex-1 justify-center py-4 min-h-[80vh]">
      {renderStep()}
    </div>
  );
}
