"use client";

import Card from "@/components/Card";
import PageTransition from "@/components/PageTransition";

export default function About() {
  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-6 text-left max-w-xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
            About Runway 250
          </h1>
          <p className="text-xs text-text-muted mt-1">
            The behavior science, competitor landscape, and story behind the project.
          </p>
        </div>

        {/* Founder Story */}
        <Card variant="pixel" className="p-5 bg-teal/5 border-teal">
          <h2 className="text-sm font-bold text-teal font-heading mb-2">The Founder Story</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            An engineer who stacked skills across tech, product, analytics, and finance, stalled, and is now building his comeback in public over 250 days.
          </p>
        </Card>

        {/* Honesty Statement */}
        <Card variant="surface" className="p-5 border-amber-500/20 bg-amber-500/5">
          <h2 className="text-sm font-bold text-amber-700 mb-2">Demonstration Disclosure</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            This is a demonstration prototype. All journeys, users, and metrics shown are simulated to illustrate the concept and the founder&apos;s execution ability. There are no real users yet.
          </p>
        </Card>

        {/* Behavior Science Foundations */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-teal font-heading">Behavior Science Foundations</h2>
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-white dark:bg-dark-surface">
            <table className="min-w-full divide-y divide-[var(--border-color)] text-[11px] leading-relaxed">
              <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Science</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Runway 250 Mechanic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-text-muted">
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Fogg B=MAP / Tiny Habits</td>
                  <td className="px-3 py-2.5">BJ Fogg, Stanford Behavior Design Lab</td>
                  <td className="px-3 py-2.5">Quests are tiny and anchored; Tiny tier enables action at low motivation.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Implementation intentions</td>
                  <td className="px-3 py-2.5">Gollwitzer; &quot;After I ___, I will ___&quot;</td>
                  <td className="px-3 py-2.5">Every quest ships with an anchor field (&quot;After I brush my teeth...&quot;).</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Self-Determination Theory</td>
                  <td className="px-3 py-2.5">Deci & Ryan; PMC8391751</td>
                  <td className="px-3 py-2.5">Pillar choice (autonomy), tiered difficulty (competence), Bonds/Voice quests + reflections (relatedness).</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Habit loop (cue-routine-reward)</td>
                  <td className="px-3 py-2.5">Duhigg</td>
                  <td className="px-3 py-2.5">Anchor = cue; quest = routine; resolution render = reward.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Identity-based habits</td>
                  <td className="px-3 py-2.5">James Clear, Atomic Habits</td>
                  <td className="px-3 py-2.5">Reflections framed as &quot;votes for the person you are becoming.&quot;</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Loss aversion (λ≈2.25)</td>
                  <td className="px-3 py-2.5">Tversky & Kahneman (1992)</td>
                  <td className="px-3 py-2.5">Streak & resolution loss risk is present but softened by streak freezes.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Overjustification</td>
                  <td className="px-3 py-2.5">Deci/Koestner/Ryan (1999)</td>
                  <td className="px-3 py-2.5">Intrinsic reward model (avatar rendering) rather than points/confetti.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Honest Competitive Comparison */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-teal font-heading">Competitive Comparison</h2>
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-white dark:bg-dark-surface">
            <table className="min-w-full divide-y divide-[var(--border-color)] text-[11px] leading-relaxed">
              <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">App</th>
                  <th className="px-3 py-2 text-left">Core Mechanic</th>
                  <th className="px-3 py-2 text-left">Monetization</th>
                  <th className="px-3 py-2 text-left">Shortcoming</th>
                  <th className="px-3 py-2 text-left">Runway 250 Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-text-muted">
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Habitica</td>
                  <td className="px-3 py-2.5">RPG character; HP/XP/gold; party boss battles</td>
                  <td className="px-3 py-2.5">$4.99/mo cosmetic subscription</td>
                  <td className="px-3 py-2.5">RPG scaffolding can obscure real behavior; high complexity.</td>
                  <td className="px-3 py-2.5">One evolving you; visual representation is your real-life progress.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Finch</td>
                  <td className="px-3 py-2.5">Nurture a pet bird via self-care check-ins</td>
                  <td className="px-3 py-2.5">Finch Plus: $9.99/mo or $69.99/yr</td>
                  <td className="px-3 py-2.5">Reward is pet&apos;s growth, one step removed from your own.</td>
                  <td className="px-3 py-2.5">The avatar that renders is you, not a mascot.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Forest</td>
                  <td className="px-3 py-2.5">Grow a tree during focus sessions; tree dies if you leave</td>
                  <td className="px-3 py-2.5">One-time / IAP</td>
                  <td className="px-3 py-2.5">Single-purpose focus timer, not a whole-life habit system.</td>
                  <td className="px-3 py-2.5">Whole-life pillars + narrative 250-day arc.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">SuperBetter</td>
                  <td className="px-3 py-2.5">Epic Wins, Quests, Bad Guys, Power-Ups, Secret Identity</td>
                  <td className="px-3 py-2.5">Hero subscription</td>
                  <td className="px-3 py-2.5">Framing-heavy; solo depth paywalled.</td>
                  <td className="px-3 py-2.5">RCT-grade framing, but calmer, resolution-native, and session-capped.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Duolingo</td>
                  <td className="px-3 py-2.5">Streaks, leagues, XP, hearts</td>
                  <td className="px-3 py-2.5">Freemium / Max</td>
                  <td className="px-3 py-2.5">Streak anxiety; learning the game, not the skill; pushy patterns.</td>
                  <td className="px-3 py-2.5">Forgiveness defaults; session cap prevents compulsion.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SuperBetter Citation */}
        <div className="flex flex-col gap-2 bg-neutral-100 dark:bg-neutral-800/50 p-4 rounded-xl text-[11px] text-text-muted leading-relaxed">
          <span className="font-bold text-text-primary">SuperBetter RCT Evidence Citation:</span>
          <p>
            Roepke, Jaffee, Riffle, McGonigal, Broome & Maxwell (2015), <em>Games for Health Journal</em> 4(3):235–46 — an RCT of <strong>283 adults with significant depression symptoms</strong>, randomized to CBT-PPT SuperBetter, General SuperBetter, or waitlist; 30 days of play &quot;significantly reduced symptoms of depression and anxiety, and increased optimism, self-efficacy, perceived social support and life satisfaction, compared to waitlist controls&quot; (posttest Cohen&apos;s <em>d</em> = 0.67; follow-up <em>d</em> = 1.05, to be read cautiously given attrition and a self-selected sample). This is the credibility bar Runway 250&apos;s real (post-demo) version should aspire to.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
