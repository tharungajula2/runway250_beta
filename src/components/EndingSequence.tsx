"use client";

import { useState, useEffect, useRef } from "react";
import { useRunwayStore } from "@/store/useRunwayStore";
import PixelAvatar from "@/components/PixelAvatar";
import { playSound, startEndingDrone, stopEndingDrone, triggerHaptic } from "@/lib/game/audio";
import journeyData from "@/lib/data/journey.json";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface EndingSequenceProps {
  onClose: () => void;
}

type EndingStep = "FADE_OUT" | "INTRO" | "RENDERING" | "OUTRO" | "CREDITS" | "FINAL_SCREEN";

function Typewriter({
  text,
  speed = 40,
  delay = 0,
  onComplete,
  className = "",
}: {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        setDisplayed((prev) => prev + text.charAt(idx));
        idx++;
        if (idx >= text.length) {
          clearInterval(interval);
          if (onComplete) onComplete();
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete]);

  return <p className={className}>{displayed}</p>;
}

export default function EndingSequence({ onClose }: EndingSequenceProps) {
  const router = useRouter();
  const { resetEntireGame, liveQuests, soundEnabled } = useRunwayStore();
  const [step, setStep] = useState<EndingStep>("FADE_OUT");
  const [introSubStep, setIntroSubStep] = useState(0);
  const [outroSubStep, setOutroSubStep] = useState(0);
  const [renderDay, setRenderDay] = useState(1);
  const [ambientMode, setAmbientMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  const creditsRef = useRef<HTMLDivElement>(null);

  // Monitor prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Step 1: FADE_OUT Transition
  useEffect(() => {
    if (step === "FADE_OUT") {
      const timer = setTimeout(() => {
        setStep("INTRO");
        // Start the continuous low warm drone under the render
        startEndingDrone();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Step 2: INTRO Text Typewriting
  useEffect(() => {
    if (step === "INTRO") {
      if (introSubStep === 0) {
        // Line 1 finished typewriter -> wait and show Line 2
        const timer = setTimeout(() => {
          setIntroSubStep(1);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (introSubStep === 1) {
        // Line 2 finished typewriter -> wait and go to RENDERING
        const timer = setTimeout(() => {
          setStep("RENDERING");
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [step, introSubStep]);

  // Step 3: RENDERING auto-scrub animation
  useEffect(() => {
    if (step === "RENDERING") {
      if (reducedMotion) {
        // Instantly jump to Day 250
        setRenderDay(250);
        setStep("OUTRO");
        return;
      }

      const totalDuration = 20000; // 20 seconds total
      let startTime = 0;
      let lastFrameTime = 0;
      let lastUpdateTimestamp = 0;
      let lastRenderedDay = 1;
      const frameDeltas: number[] = [];
      let frameId: number;

      const tick = (timestamp: number) => {
        if (!startTime) {
          startTime = timestamp;
          lastFrameTime = timestamp;
        }

        // Measure frame time delta
        const delta = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        frameDeltas.push(delta);
        if (frameDeltas.length > 10) frameDeltas.shift();

        // Calculate average frame duration over the last 10 frames
        const avgFrame = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;

        // Dynamically choose update throttle threshold:
        // If average frame is > 40ms (~25fps), throttle updates to every 120ms
        // If average frame is > 25ms (~40fps), throttle to 60ms
        // Otherwise, allow updates every 16ms (full rate)
        const throttleMs = avgFrame > 40 ? 120 : (avgFrame > 25 ? 60 : 16);

        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / totalDuration);
        
        // Linear mapping of days 1 to 250 based on elapsed time progress
        const nextDay = Math.round(1 + progress * 249);

        // Commit day value changes only on throttle windows or final completion
        if (timestamp - lastUpdateTimestamp >= throttleMs || progress === 1) {
          if (nextDay !== lastRenderedDay) {
            // Play a small tick sound on milestone days passed
            for (let d = lastRenderedDay + 1; d <= nextDay; d++) {
              if ([7, 21, 50, 100, 150, 200, 250].includes(d)) {
                playSound("scrub_tick");
                triggerHaptic(10);
              }
            }
            setRenderDay(nextDay);
            lastRenderedDay = nextDay;
          }
          lastUpdateTimestamp = timestamp;
        }

        if (progress < 1) {
          frameId = requestAnimationFrame(tick);
        } else {
          setRenderDay(250);
          setTimeout(() => {
            setStep("OUTRO");
          }, 800);
        }
      };

      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    }
  }, [step, reducedMotion]);

  // Step 4: OUTRO Text Typewriting
  useEffect(() => {
    if (step === "OUTRO") {
      // Fade out the drone when outro begins
      stopEndingDrone();

      if (outroSubStep === 0) {
        const timer = setTimeout(() => {
          setOutroSubStep(1);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (outroSubStep === 1) {
        const timer = setTimeout(() => {
          setOutroSubStep(2);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (outroSubStep === 2) {
        const timer = setTimeout(() => {
          setStep("CREDITS");
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [step, outroSubStep]);

  // Step 5: CREDITS Complete Callback
  useEffect(() => {
    if (step === "CREDITS") {
      if (reducedMotion) {
        // Statically show credits, no auto-advance, user clicks skip/done
        return;
      }
      // Automate credits exit after 35 seconds if not skipped
      const timer = setTimeout(() => {
        setStep("FINAL_SCREEN");
      }, 38000);
      return () => clearTimeout(timer);
    }
  }, [step, reducedMotion]);

  // Calculate statistics for credits
  const totalDaysCount = journeyData.days.length; // 250
  
  // Calculate total quests done using liveQuests store combined with journeyData defaults
  let totalQuestsDone = 0;
  for (let d = 1; d <= 250; d++) {
    const qs = liveQuests[d] || journeyData.days[d - 1]?.quests || [];
    totalQuestsDone += qs.filter((q: any) => q.done).length;
  }

  // Filter shields caught
  const shieldsList = journeyData.days
    .filter((d) => d.freezeUsed)
    .map((d, index) => ({
      index: index + 1,
      day: d.day,
      date: getDayDate(d.day),
    }));

  // Selected player reflections for quotes
  const reflectionQuotes = [15, 45, 90, 135, 180, 225]
    .map((dayNum) => {
      const rec = journeyData.days[dayNum - 1];
      return {
        day: dayNum,
        text: rec?.reflection || "",
      };
    })
    .filter((q) => q.text.length > 0);

  function getDayDate(day: number) {
    const d = new Date();
    d.setDate(d.getDate() - (250 - day));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function getActLabel(dayNum: number) {
    if (dayNum <= 50) return "ACT I: BOOT";
    if (dayNum <= 120) return "ACT II: RENDERING";
    if (dayNum <= 200) return "ACT III: SHARPENING";
    return "ACT IV: FOCUS";
  }

  const currentResPct = journeyData.days[renderDay - 1]?.resolutionPct || 0;

  const handleBeginNewRunway = () => {
    stopEndingDrone();
    resetEntireGame();
    onClose();
    router.push("/onboarding");
  };

  const handleSkip = () => {
    stopEndingDrone();
    setStep("FINAL_SCREEN");
  };

  // Render the credit scroll list content
  const renderCreditsContent = () => (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-12 font-mono text-center px-4">
      {/* Film Header */}
      <div className="flex flex-col gap-2 mt-20">
        <h2 className="text-2xl font-black tracking-widest text-teal uppercase">RUNWAY 250</h2>
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
          A 250-Day Game Where Your Real Life is the Controller
        </p>
      </div>

      <div className="w-12 h-px bg-neutral-800" />

      {/* Stats Block */}
      <div className="flex flex-col gap-3">
        <span className="text-[9px] tracking-widest text-teal uppercase font-bold">THE RECORD</span>
        <div className="text-xs flex flex-col gap-1.5 text-neutral-300">
          <p>Total Quests Traced: <span className="text-white font-bold">{totalQuestsDone}</span></p>
          <p>Days Shown Up: <span className="text-white font-bold">{totalDaysCount} / 250</span></p>
        </div>
      </div>

      <div className="w-12 h-px bg-neutral-800" />

      {/* Quote 1 */}
      {reflectionQuotes[0] && (
        <div className="italic text-xs text-neutral-400 max-w-sm leading-relaxed px-4">
          &ldquo;{reflectionQuotes[0].text}&rdquo;
          <span className="block mt-2 text-[9px] not-italic text-teal uppercase tracking-widest">
            — Day {reflectionQuotes[0].day} Reflection
          </span>
        </div>
      )}

      <div className="w-12 h-px bg-neutral-800" />

      {/* Chapter Dates */}
      <div className="flex flex-col gap-4">
        <span className="text-[9px] tracking-widest text-teal uppercase font-bold">THE CALIBRATIONS</span>
        <div className="text-[10px] text-neutral-400 flex flex-col gap-2 leading-relaxed">
          <p>Day 1: Act I: Boot &mdash; <span className="text-white font-semibold">{getDayDate(1)}</span></p>
          <p>Day 7: The First Calibration &mdash; <span className="text-white font-semibold">{getDayDate(7)}</span></p>
          <p>Day 21: Habitual Lockout &mdash; <span className="text-white font-semibold">{getDayDate(21)}</span></p>
        </div>
      </div>

      <div className="w-12 h-px bg-neutral-800" />

      {/* Quote 2 */}
      {reflectionQuotes[1] && (
        <div className="italic text-xs text-neutral-400 max-w-sm leading-relaxed px-4">
          &ldquo;{reflectionQuotes[1].text}&rdquo;
          <span className="block mt-2 text-[9px] not-italic text-teal uppercase tracking-widest">
            — Day {reflectionQuotes[1].day} Reflection
          </span>
        </div>
      )}

      <div className="w-12 h-px bg-neutral-800" />

      {/* Shields Block */}
      <div className="flex flex-col gap-4">
        <span className="text-[9px] tracking-widest text-teal uppercase font-bold">THE SHIELDS</span>
        {shieldsList.length > 0 ? (
          <div className="text-[10px] text-neutral-400 flex flex-col gap-2">
            {shieldsList.map((s) => (
              <p key={s.index}>
                Shield #{s.index} &mdash; caught you on Day {s.day} ({s.date})
              </p>
            ))}
            <p className="text-[9px] text-teal/80 italic mt-1 max-w-xs">
              Thank you, Shields. You kept the runway straight.
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-teal italic">
            Zero Shields used. A flawless rendering sequence.
          </p>
        )}
      </div>

      <div className="w-12 h-px bg-neutral-800" />

      {/* Quote 3 */}
      {reflectionQuotes[2] && (
        <div className="italic text-xs text-neutral-400 max-w-sm leading-relaxed px-4">
          &ldquo;{reflectionQuotes[2].text}&rdquo;
          <span className="block mt-2 text-[9px] not-italic text-teal uppercase tracking-widest">
            — Day {reflectionQuotes[2].day} Reflection
          </span>
        </div>
      )}

      <div className="w-12 h-px bg-neutral-800" />

      {/* Milestone Chapters Continued */}
      <div className="flex flex-col gap-4">
        <span className="text-[9px] tracking-widest text-teal uppercase font-bold">THE RENDERING ARC</span>
        <div className="text-[10px] text-neutral-400 flex flex-col gap-2 leading-relaxed">
          <p>Day 50: The Dip &mdash; <span className="text-white">{getDayDate(50)}</span></p>
          <p>Day 100: Halfway Calibration &mdash; <span className="text-white">{getDayDate(100)}</span></p>
          <p>Day 150: Act III: Sharpening &mdash; <span className="text-white">{getDayDate(150)}</span></p>
          <p>Day 200: High Definition Lock &mdash; <span className="text-white">{getDayDate(200)}</span></p>
          <p>Day 250: Finale: The Rendered Self &mdash; <span className="text-white">{getDayDate(250)}</span></p>
        </div>
      </div>

      <div className="w-12 h-px bg-neutral-800" />

      {/* Quote 4 */}
      {reflectionQuotes[3] && (
        <div className="italic text-xs text-neutral-400 max-w-sm leading-relaxed px-4">
          &ldquo;{reflectionQuotes[3].text}&rdquo;
          <span className="block mt-2 text-[9px] not-italic text-teal uppercase tracking-widest">
            — Day {reflectionQuotes[3].day} Reflection
          </span>
        </div>
      )}

      <div className="w-12 h-px bg-neutral-800" />

      {/* Creator Credits */}
      <div className="flex flex-col gap-2 mt-4">
        <span className="text-[9px] tracking-widest text-teal uppercase font-bold font-mono">CREATORS</span>
        <p className="text-xs text-neutral-300">IRIS Character &mdash; Gemini Engine</p>
        <p className="text-xs text-neutral-300">Synthesizer Procedural Audio &mdash; Web Audio</p>
        <p className="text-xs text-neutral-300">Design Framework &mdash; Tailwind CSS &amp; Framer Motion</p>
      </div>

      <div className="w-24 h-px bg-neutral-800 my-8" />

      {/* Ending Quote */}
      {reflectionQuotes[4] && (
        <div className="italic text-xs text-neutral-400 max-w-sm leading-relaxed px-4">
          &ldquo;{reflectionQuotes[4].text}&rdquo;
          <span className="block mt-2 text-[9px] not-italic text-teal uppercase tracking-widest">
            — Day {reflectionQuotes[4].day} Reflection
          </span>
        </div>
      )}

      <div className="w-12 h-px bg-neutral-800" />

      {/* Final Card */}
      <div className="flex flex-col gap-3 py-16">
        <h3 className="text-sm font-extrabold text-teal uppercase tracking-[0.2em] font-sans">
          RUNWAY 250
        </h3>
        <p className="text-xs text-neutral-300 uppercase tracking-widest">
          Player: Founder
        </p>
        <p className="text-sm font-black text-teal uppercase tracking-widest animate-pulse">
          RENDERED.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden select-none font-mono">
      {/* Background soft lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,0.85)_0%,rgba(0,0,0,1)_100%)] pointer-events-none" />

      {/* Top right control buttons */}
      {step !== "FINAL_SCREEN" && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={handleSkip}
            className="text-[9px] tracking-widest text-neutral-500 hover:text-white uppercase font-bold px-3 py-1.5 border border-neutral-800 hover:border-neutral-700 bg-neutral-950/80 rounded transition-all duration-200 cursor-pointer"
          >
            [ Skip Ending ]
          </button>
        </div>
      )}

      {/* Main interactive state switch */}
      <AnimatePresence mode="wait">
        {step === "FADE_OUT" && (
          <motion.div
            key="fade"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center text-center gap-2"
          >
            <span className="text-[10px] text-teal tracking-widest uppercase font-bold animate-pulse">
              Finalizing Sequence...
            </span>
          </motion.div>
        )}

        {step === "INTRO" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="flex flex-col items-center gap-12 text-center"
          >
            <div className="relative border border-neutral-900 rounded-2xl p-4 bg-neutral-950/60 backdrop-blur-sm">
              <PixelAvatar resolutionPct={0} size={160} />
            </div>

            <div className="min-h-[80px] flex flex-col items-center justify-center gap-2 text-xs leading-relaxed max-w-sm px-4">
              {introSubStep === 0 && (
                <Typewriter
                  text="Do you remember this person?"
                  speed={50}
                  className="text-neutral-200 font-bold"
                />
              )}
              {introSubStep === 1 && (
                <Typewriter
                  text="All static. Could barely see you."
                  speed={50}
                  className="text-neutral-400"
                />
              )}
            </div>
          </motion.div>
        )}

        {step === "RENDERING" && (
          <motion.div
            key="rendering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-10 text-center"
          >
            <div className="relative border-2 border-teal/20 rounded-3xl p-6 bg-neutral-950/80 shadow-[0_0_50px_rgba(20,184,166,0.1)]">
              <PixelAvatar resolutionPct={currentResPct} size={180} />
            </div>

            <div className="flex flex-col gap-2 items-center">
              <span className="text-[10px] tracking-[0.2em] text-teal font-bold animate-pulse uppercase">
                {getActLabel(renderDay)}
              </span>
              <div className="text-xl font-bold tracking-widest font-sans tabular-nums text-white">
                Day {renderDay} of 250
              </div>
              <div className="text-xs text-neutral-400 font-mono mt-1">
                Resolution: {currentResPct.toFixed(1)}%
              </div>
            </div>

            {/* Loading track visualizer */}
            <div className="w-48 h-1 bg-neutral-900 rounded-full overflow-hidden mt-2 border border-neutral-850">
              <div
                className="h-full bg-teal transition-all duration-75"
                style={{ width: `${(renderDay / 250) * 100}%` }}
              />
            </div>
          </motion.div>
        )}

        {step === "OUTRO" && (
          <motion.div
            key="outro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-10 text-center"
          >
            <div className="relative border-2 border-teal/30 rounded-3xl p-6 bg-neutral-950 shadow-[0_0_60px_rgba(20,184,166,0.15)]">
              <PixelAvatar resolutionPct={currentResPct} size={180} />
            </div>

            <div className="min-h-[90px] flex flex-col items-center justify-center gap-3 text-xs leading-relaxed max-w-sm px-4">
              {outroSubStep === 0 && (
                <Typewriter
                  text="Day 1, you couldn't see yourself."
                  speed={55}
                  className="text-neutral-400"
                />
              )}
              {outroSubStep === 1 && (
                <Typewriter
                  text="Look at you now."
                  speed={55}
                  className="text-neutral-200 font-bold"
                />
              )}
              {outroSubStep === 2 && (
                <Typewriter
                  text="All signal."
                  speed={65}
                  className="text-teal font-black text-sm uppercase tracking-widest"
                />
              )}
            </div>
          </motion.div>
        )}

        {step === "CREDITS" && (
          <motion.div
            key="credits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col relative overflow-hidden bg-black"
          >
            {reducedMotion ? (
              // Reduced motion: standard scrollable credits
              <div className="w-full h-full overflow-y-auto py-12 px-6 flex flex-col gap-6 text-center select-text">
                {renderCreditsContent()}
                <button
                  onClick={() => setStep("FINAL_SCREEN")}
                  className="mx-auto max-w-xs mt-10 py-3 px-6 rounded-lg bg-teal text-white font-semibold text-xs transition-all duration-200 cursor-pointer"
                >
                  Proceed to Final Screen
                </button>
              </div>
            ) : (
              // Normal animated cinematic scroll
              <div className="w-full h-full relative overflow-hidden">
                <motion.div
                  ref={creditsRef}
                  initial={{ y: "100vh" }}
                  animate={{ y: "-150%" }}
                  transition={{ duration: 34, ease: "linear" }}
                  onAnimationComplete={() => setStep("FINAL_SCREEN")}
                  className="absolute left-0 right-0 py-10"
                >
                  {renderCreditsContent()}
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {step === "FINAL_SCREEN" && (
          <motion.div
            key="final"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center gap-10 w-full max-w-md mx-auto"
          >
            <div className="relative border-2 border-teal/40 rounded-3xl p-6 bg-neutral-950/80 shadow-[0_0_70px_rgba(20,184,166,0.2)]">
              <PixelAvatar resolutionPct={currentResPct} size={200} />
            </div>

            {!ambientMode ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col gap-6 w-full px-4"
              >
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl font-bold tracking-widest text-teal uppercase font-sans">
                    The Runway is Clear
                  </h2>
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-mono">
                    You have arrived at maximum clarity. All vectors resolved.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleBeginNewRunway}
                    className="w-full py-3.5 px-6 rounded-xl bg-teal hover:bg-teal-deep text-white font-bold text-xs tracking-wider uppercase shadow-md transition-all duration-300 cursor-pointer active:scale-97"
                  >
                    Begin a new Runway (NG+)
                  </button>

                  <button
                    onClick={() => {
                      setAmbientMode(true);
                      playSound("envelope_open");
                    }}
                    className="w-full py-3 px-6 rounded-xl border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/40 text-neutral-300 font-semibold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer active:scale-97"
                  >
                    Sit here a while
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-2 px-6 rounded-xl text-neutral-500 hover:text-neutral-400 font-semibold text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer"
                  >
                    [ Go to Dashboard ]
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 mt-2"
              >
                <p className="text-[10px] italic text-neutral-500 max-w-xs animate-pulse">
                  Breathe in. Clear skies.
                </p>
                <button
                  onClick={() => setAmbientMode(false)}
                  className="mt-6 text-[9px] tracking-widest text-neutral-500 hover:text-white uppercase font-bold px-3 py-1.5 border border-neutral-950 hover:border-neutral-800 bg-neutral-950/20 hover:bg-neutral-950/80 rounded transition-all duration-200 cursor-pointer"
                >
                  [ Show Controls ]
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
