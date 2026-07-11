"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRunwayStore } from "@/store/useRunwayStore";
import Card from "@/components/Card";
import PixelAvatar from "@/components/PixelAvatar";
import { Dumbbell, Brain, Code, MessageSquare, Sparkles, Heart, ArrowRight, ArrowLeft } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion, useReducedMotion } from "framer-motion";

type Pillar = "Body" | "Mind" | "Craft" | "Voice" | "Order" | "Bonds";

const PILLAR_DETAILS: Record<Pillar, { label: string; icon: any; poeticDesc: string }> = {
  Body: { label: "Body", icon: Dumbbell, poeticDesc: "The machine you live in." },
  Mind: { label: "Mind", icon: Brain, poeticDesc: "The quiet behind your eyes." },
  Craft: { label: "Craft", icon: Code, poeticDesc: "The thing your hands are learning." },
  Voice: { label: "Voice", icon: MessageSquare, poeticDesc: "What you say out loud." },
  Order: { label: "Order", icon: Sparkles, poeticDesc: "The space around you." },
  Bonds: { label: "Bonds", icon: Heart, poeticDesc: "The people who matter." },
};

const HEX_POINTS = [
  { x: 0, y: -72, pillar: "Body" as Pillar },
  { x: 62, y: -36, pillar: "Mind" as Pillar },
  { x: 62, y: 36, pillar: "Craft" as Pillar },
  { x: 0, y: 72, pillar: "Voice" as Pillar },
  { x: -62, y: 36, pillar: "Order" as Pillar },
  { x: -62, y: -36, pillar: "Bonds" as Pillar },
];

function CalibrationSquare({ score, Icon }: { score: number; Icon: any }) {
  const blurAmount = (10 - score) * 0.8; // 0px to 7.2px
  const staticOpacity = (10 - score) / 9; // 0 to 1

  return (
    <div className="relative w-12 h-12 rounded-lg border border-[var(--border-color)] overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shrink-0">
      {/* Icon showing behind/inside static */}
      <div
        className="text-teal transition-all duration-200"
        style={{ filter: `blur(${blurAmount}px)` }}
      >
        <Icon size={20} />
      </div>

      {/* SVG fractal static overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          opacity: staticOpacity * 0.85,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const shouldReduce = useReducedMotion();
  const { setCurrentDay, resetSession, setSelectedPillars } = useRunwayStore();
  const [step, setStep] = useState(1);

  // Selected Pillars
  const [selectedPillars, setSelectedPillarsState] = useState<Record<Pillar, boolean>>({
    Body: true,
    Mind: true,
    Craft: true,
    Voice: true,
    Order: true,
    Bonds: true,
  });

  // Calibration Scores
  const [pillarScores, setPillarScores] = useState<Record<Pillar, number>>({
    Body: 5,
    Mind: 5,
    Craft: 5,
    Voice: 5,
    Order: 5,
    Bonds: 5,
  });

  // Assembly Animation States
  const [assemblyStage, setAssemblyStage] = useState(0);

  useEffect(() => {
    if (step !== 3) {
      setAssemblyStage(0);
      return;
    }

    const t1 = setTimeout(() => setAssemblyStage(1), 800);   // Staggered flying icons
    const t2 = setTimeout(() => setAssemblyStage(2), 2000);  // Runway line draws
    const t3 = setTimeout(() => setAssemblyStage(3), 3200);  // Shields slot in
    const t4 = setTimeout(() => setAssemblyStage(4), 4400);  // Button & dialogue complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [step]);

  const togglePillar = (pillar: Pillar) => {
    setSelectedPillarsState(prev => ({
      ...prev,
      [pillar]: !prev[pillar],
    }));
  };

  const handleScoreChange = (pillar: Pillar, score: number) => {
    setPillarScores(prev => ({
      ...prev,
      [pillar]: score,
    }));
  };

  const handleCompleteSetup = () => {
    const active = (Object.keys(selectedPillars) as Pillar[]).filter(k => selectedPillars[k]);
    setSelectedPillars(active);

    // Save Day 1 setup state
    setCurrentDay(1);
    resetSession();
    router.push("/today");
  };

  const getIrisDialogue = () => {
    if (assemblyStage === 0) return "IRIS: \"Assembling Runway system metrics...\"";
    if (assemblyStage === 1) return "IRIS: \"Runway assembled.\"";
    if (assemblyStage === 2) return "IRIS: \"Runway assembled. Vector grids aligned.\"";
    if (assemblyStage === 3) return "IRIS: \"Runway assembled. Two Shields loaded — they'll catch you if you slip.\"";
    return "IRIS: \"Runway assembled. Two Shields loaded — they'll catch you if you slip. See you on Day 1.\"";
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col gap-6 flex-1">
            <div className="text-center">
              <h2 className="text-2xl font-black text-teal font-heading uppercase tracking-wide">
                Choose what to render
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Select the aspects of your life to bring into definition.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {(Object.keys(PILLAR_DETAILS) as Pillar[]).map((key) => {
                const Icon = PILLAR_DETAILS[key].icon;
                const isSelected = selectedPillars[key];
                return (
                  <motion.button
                    key={key}
                    type="button"
                    onClick={() => togglePillar(key)}
                    whileTap={shouldReduce ? {} : { scale: 0.97 }}
                    className={`relative p-5 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xs select-none transition-all duration-300 ${
                      isSelected
                        ? "border-teal shadow-md"
                        : "border-neutral-200/40 dark:border-neutral-800/40"
                    }`}
                    animate={{
                      filter: isSelected
                        ? ["blur(1.5px)", "blur(2.2px)", "blur(0px)"]
                        : "blur(1.5px)",
                      opacity: isSelected ? 1 : 0.6,
                    }}
                    transition={{
                      duration: shouldReduce ? 0 : 0.4,
                      times: [0, 0.25, 1],
                      ease: "easeOut",
                    }}
                  >
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${
                      isSelected ? "bg-teal text-white" : "bg-neutral-200/80 dark:bg-neutral-800/80 text-text-muted"
                    }`}>
                      <Icon size={24} />
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-xs text-text-primary block">
                        {PILLAR_DETAILS[key].label}
                      </span>
                      <p className="text-[10px] text-text-muted mt-1 leading-normal px-1">
                        {PILLAR_DETAILS[key].poeticDesc}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!Object.values(selectedPillars).some(v => v)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep disabled:bg-teal/40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              Continue to Calibration <ArrowRight size={14} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-6 flex-1">
            <div className="bg-teal/5 dark:bg-teal-deep/5 border border-teal/10 rounded-xl p-4 text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-teal">
                IRIS Connection Active
              </span>
              <p className="text-xs text-text-primary font-medium italic mt-1.5 leading-relaxed">
                "Be honest. Where is the static densest right now? No one is watching. That's the point."
              </p>
            </div>

            <div className="flex flex-col gap-3.5">
              {(Object.keys(PILLAR_DETAILS) as Pillar[])
                .filter(key => selectedPillars[key])
                .map((key) => {
                  const score = pillarScores[key];
                  const Icon = PILLAR_DETAILS[key].icon;
                  let staticLabel = "Severe Static";
                  if (score > 3 && score < 8) staticLabel = "Partial Outline";
                  else if (score >= 8) staticLabel = "High Contrast";

                  return (
                    <Card key={key} variant="default" className="p-4 flex gap-4 items-center">
                      {/* Calibration feedback square */}
                      <CalibrationSquare score={score} Icon={Icon} />

                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-text-primary">{key}</span>
                          <span className="text-[10px] font-mono text-teal bg-teal/10 px-1.5 py-0.5 rounded">
                            Level: {score}/10
                          </span>
                        </div>

                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={score}
                          onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                          className="w-full accent-teal cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none"
                        />

                        <div className="flex justify-between text-[9px] text-text-muted">
                          <span>1 (Dense Blur)</span>
                          <span className="font-semibold text-teal">{staticLabel}</span>
                          <span>10 (Crisp Focus)</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-teal text-teal font-semibold text-xs hover:bg-teal/5 transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200 cursor-pointer"
              >
                Assemble Runway <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-6 flex-1 items-center justify-center py-4 text-center">
            <div>
              <h2 className="text-xl font-black text-teal font-heading uppercase tracking-wide">
                THE ASSEMBLY
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Materializing your controller vectors...
              </p>
            </div>

            {/* Geometry Assembly Area */}
            <div className="relative w-full h-[220px] flex flex-col items-center justify-center bg-white/30 dark:bg-neutral-900/30 rounded-2xl border border-[var(--border-color)] overflow-hidden">
              {/* Day 1 Blurry Avatar */}
              <div className="relative z-10">
                <PixelAvatar resolutionPct={15} size={72} />
              </div>

              {/* Runway Line */}
              {assemblyStage >= 2 && (
                <motion.div
                  className="absolute w-[180px] h-[3px] bg-teal rounded-full shadow-xs"
                  style={{ top: "60%" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              )}

              {/* Staggered Flying Icons */}
              {HEX_POINTS.map((pt, idx) => {
                const isSelected = selectedPillars[pt.pillar];
                const Icon = PILLAR_DETAILS[pt.pillar].icon;
                return (
                  <motion.div
                    key={pt.pillar}
                    className="absolute z-20 flex items-center justify-center w-8 h-8 rounded-full border bg-bg-app shadow-xs"
                    style={{
                      borderColor: isSelected ? "var(--teal)" : "var(--border-color)",
                      color: isSelected ? "var(--teal)" : "var(--text-muted)",
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={
                      assemblyStage >= 1
                        ? { x: pt.x, y: pt.y, scale: 1, opacity: isSelected ? 1 : 0.25 }
                        : { x: 0, y: 0, scale: 0, opacity: 0 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 120,
                      damping: 14,
                      delay: idx * 0.12,
                    }}
                  >
                    <Icon size={14} />
                  </motion.div>
                );
              })}

              {/* Shields Loading */}
              {assemblyStage >= 3 && (
                <div className="absolute bottom-4 flex gap-4">
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 10 }}
                    className="flex items-center gap-1 bg-teal/15 text-teal border border-teal/20 px-2 py-0.5 rounded font-mono text-[9px] font-bold"
                  >
                    🛡️ SHIELD
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 150, damping: 10, delay: 0.2 }}
                    className="flex items-center gap-1 bg-teal/15 text-teal border border-teal/20 px-2 py-0.5 rounded font-mono text-[9px] font-bold"
                  >
                    🛡️ SHIELD
                  </motion.div>
                </div>
              )}
            </div>

            {/* IRIS Send-off Dialog */}
            <div className="w-full max-w-sm bg-neutral-900 text-white font-mono rounded-xl p-4 text-left border border-neutral-800 shadow-lg min-h-[90px] flex flex-col justify-between">
              <span className="text-[9px] text-teal uppercase tracking-widest block mb-1">
                IRIS Communications
              </span>
              <p className="text-xs leading-relaxed font-sans text-neutral-200">
                {getIrisDialogue()}
              </p>
            </div>

            {/* Final Action Button */}
            {assemblyStage >= 4 && (
              <motion.button
                onClick={handleCompleteSetup}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-xs mt-2 py-3 px-6 rounded-xl bg-teal text-white font-semibold text-xs shadow-md hover:bg-teal-deep transition-all duration-200 cursor-pointer"
              >
                Begin Day 1
              </motion.button>
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
