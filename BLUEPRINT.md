# BLUEPRINT.md — **Runway 250**
### Master Build Specification for an AI Coding Agent (Google Antigravity)
**A local-first, installable PWA. A 250-day "life-as-a-game" experience. Current as of July 11, 2026.**

---

## TL;DR
- **This document is a complete, self-contained specification** for building a fully demoable prototype of *Runway 250* — a premium, minimal, 2D PWA where a player's real life renders a pixelated avatar/world from low-resolution to high-resolution across 250 days. Build it with **Next.js 16.2.x (App Router) + TypeScript + Tailwind v4 + Zustand + Recharts + Framer Motion + Serwist (PWA) + the `@google/genai` SDK**, deployed free on Vercel, with **no backend** (all data in localStorage/IndexedDB) and **no paid service except the founder's own Gemini API key**.
- **The signature mechanic (progressive resolution)** should be built as a **canvas-based progressive pixelation engine**: draw a hero illustration tiny, scale it up with `imageSmoothingEnabled = false` (nearest-neighbour), and shrink the pixel blocks as the resolution % rises — with a **Day 1 → Day 250 scrubber slider** wired directly to the pixelation level. This is the "money shot" of the pitch.
- **The prototype is a pitch artifact, not a product with traction.** It ships a **fully simulated, science-grounded 250-day winning journey** for one anonymized persona ("Arjun, 29"), plus a **live AI layer** (real Gemini quest generation) with a **guaranteed offline fallback** so the demo can never break. Every mock screen must carry a visible **"SIMULATION"** badge so the founder is never accused of faking real users.

---

## KEY FINDINGS (Design & Research Basis)

These are the researched facts every mechanic in this blueprint is grounded in. The AI agent should preserve these citations in an in-app "Sources" note so technically-minded viewers can verify the thinking.

1. **Habit formation is slow and non-linear.** In Lally, van Jaarsveld, Potts & Wardle (2010), *European Journal of Social Psychology* 40(6): 998–1009, "the time it took participants to reach 95% of their asymptote of automaticity ranged from **18 to 254 days**," with a **median around 66 days** — not the 21-day myth. A 2024 systematic review (PMC11641623) found medians of **59–66 days** and means of 106–154 days. Critically, **missing a single day did not impair habit formation**. → *The mock resolution curve must be non-linear: fast early wins, a realistic motivational dip/plateau around days 20–50, a comeback arc, then steady sharpening.*
2. **Loss aversion is real and quantified.** Tversky & Kahneman (1992), *Journal of Risk and Uncertainty* 5: 297–323, estimate a loss-aversion coefficient **λ ≈ 2.25** — losses weighted ~2.25× more heavily than equivalent gains. → *Streaks and "resolution you could lose" are powerful, but must be handled ethically (see forgiveness mechanic).*
3. **Duolingo's streak + freeze is the gold standard of ethical loss-aversion design.** Its "Streak Freeze" reduced churn for at-risk users; separating the streak from the daily goal produced a **3.3% increase in Day-14 retention**; users with 7+ day streaks retain far better. Experiments showed **two** freezes beat one, but three were no better than two. Duolingo retains **~55% of daily active users month-over-month**.
4. **Extrinsic "pointsification" can backfire — the "chocolate-covered broccoli" problem.** Ian Bogost (Georgia Tech), "Persuasive Games: Exploitationware," *Gamasutra*, May 3, 2011, argues gamifiers "mistake incidental properties like points and levels for primary features." The empirical backbone is the **overjustification effect**: Deci, Koestner & Ryan (1999), *Psychological Bulletin* 125(6): 627–668 — a meta-analysis of **128 experiments** found "engagement-contingent, completion-contingent, and performance-contingent rewards significantly undermined free-choice intrinsic motivation (d = −0.40, −0.36, and −0.28)." → *Runway 250 rewards must be intrinsic-first: the "reward" is watching your real self render into focus, not slot-machine confetti.*
5. **Self-Determination Theory (Deci & Ryan)** identifies three needs — **autonomy, competence, relatedness**. An mHealth SEM study (PMC8391751, n=307) found intrinsic motivation significantly driven by autonomy (β=.312), competence (β=.346), and relatedness (β=.165). → *Every mechanic maps to one of these three.*
6. **Consumer app retention benchmarks (for credible-but-ambitious mock numbers).** Per Adjust's Mobile App Trends 2026 data: **median D1 ≈ 26%, D7 ≈ 13%, D30 ≈ 7%** across all verticals. **DAU/MAU stickiness of ~20% is good, >25% is strong** (AppsFlyer). Health & Fitness is harder: D1 ~20–27%, D30 ~3%.

---

## 1. TECH STACK & SCAFFOLD

### 1.1 Exact versions (verified July 2026)
| Concern | Choice | Version | Why |
|---|---|---|---|
| Framework | **Next.js** (App Router) | **16.2.x** (latest stable 16.2.10, released July 1 2026) | Turbopack is the default bundler; Node 20+ required; App Router is the only sensible default. |
| UI runtime | **React** | 19.2 | Ships with Next 16. |
| Language | **TypeScript** | 5.x | Type-safe mock data + AI schemas. |
| Styling | **Tailwind CSS** | v4 | Utility-first; fast for a solo builder. |
| State | **Zustand** | **5.0.14** | 1.2 KB, ~42M weekly downloads; use `persist` middleware → localStorage. |
| Charts | **Recharts** | latest 2.x | Declarative React charts for the analytics dashboard. |
| Icons | **lucide-react** | **1.24.0** | Clean, minimal line icons. |
| Animation | **framer-motion** (Motion) | **12.42.x** — import from `motion/react` | Calm, production-grade motion; supports `useReducedMotion`. |
| PWA | **@serwist/next** (+ `@serwist/precaching`, `@serwist/sw`) | latest | **`next-pwa` is unmaintained**; Serwist is its actively-maintained Workbox-based successor. |
| AI SDK | **@google/genai** | **2.11.0** | The current unified Google Gen AI SDK. (The old `@google/generative-ai` / `getGenerativeModel` pattern is deprecated — use `new GoogleGenAI({...})` + `ai.models.generateContent`.) |
| Deploy | **Vercel** | Free (Hobby) tier | Zero-config Next.js hosting. |

### 1.2 Scaffold command (Phase 0)
```bash
npx create-next-app@latest runway250 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd runway250
npm i zustand recharts lucide-react framer-motion @google/genai
npm i @serwist/next serwist
```
> Note: Next 16 requires **Node ≥ 20.9**. If `node --version` is below that, install Node 22 LTS first. The dev server boots via Turbopack.

### 1.3 PWA configuration (Serwist)
- Create `app/manifest.ts` (App Router native manifest) with `name: "Runway 250"`, `short_name: "Runway"`, `display: "standalone"`, `theme_color: "#2A7F7F"`, `background_color: "#F7F6F2"`, and 192/512 px icons in `/public/icons/`.
- Create `app/sw.ts` (Serwist service worker) and wire `withSerwistInit` in `next.config.ts` with `swSrc: "app/sw.ts"`, `swDest: "public/sw.js"`, and an `/~offline` fallback entry.
- Add `"@serwist/next/typings"` to `tsconfig.json` `types` and `"webworker"` to `lib`; exclude `public/sw.js`.
- **Disable Serwist in dev**; test the PWA with a production build (`next build && next start`), which serves over localhost (treated as secure for install).

### 1.4 Local-first data
- **Zustand + `persist` → localStorage** for app state (settings, LIVE-AI toggle, current persona-day, live-generated quests).
- **The 250-day mock dataset** is generated by a build-time/seed script and imported as a static JSON/TS module (see §3). No server, no DB. This keeps the demo instantly loadable and offline-capable.

---

## 2. DEMO PERSONA & 250-DAY MOCK JOURNEY

### 2.1 The persona (anonymized, pitch-safe)
> **Arjun, 29.** An engineer who "lost his way" — spent years stacking skills across tech, product, analytics, and finance, then stalled out staying at home. He's rebuilding his comeback in public over 250 days. **No real names, employers, locations, health details, or identifying data.** He is fictional-but-relatable, explicitly a composite.

### 2.2 The six life pillars
| Pillar | Icon (lucide) | SDT need served | Example real-world quest |
|---|---|---|---|
| **Body** | `activity` | Competence | "Walk 20 minutes before your first coffee." |
| **Mind** | `brain` | Autonomy | "Read 5 pages of anything and write one sentence about it." |
| **Craft** | `code` | Competence | "Ship one tiny commit / one paragraph of your project." |
| **Voice** | `mic` | Relatedness | "Send one honest message to someone you've been avoiding." |
| **Order** | `layout-grid` | Competence | "Clear one surface. Just one." |
| **Bonds** | `users` | Relatedness | "Call a family member for 5 minutes, no agenda." |

### 2.3 The seed script (`src/lib/data/generateJourney.ts`)
A deterministic (seeded RNG) procedural generator that outputs a `Journey` object: **250 `DayRecord`s**. Rules encode the habit science from Key Finding #1 so the curve looks credible, not linear.

**Per-day generation rules:**
- **Quests/day:** 1–3, weighted by simulated "energy level" (low-energy days get 1 Tiny quest).
- **Completion probability by act (models the real dip/recovery):**
  - Days **1–21 (Boot Sequence):** completion starts ~0.55, climbs to ~0.85 (novelty + easy tiny habits).
  - Days **22–50 (early Rendering):** completion **dips to ~0.55–0.65** — this is the scientifically-predicted motivational trough (Key Finding #1). Include **2 explicit "missed" days** that consume streak freezes.
  - Days **51–100 (late Rendering):** recovery to ~0.75.
  - Days **101–200 (Sharpening):** stable ~0.85 with one short 3-day plateau (~day 150).
  - Days **201–250 (High Definition):** ~0.90+, near-automatic.
- **Reflection snippets:** short, human, first-person (10–25 words), varied by pillar. E.g. Day 34: *"Didn't want to. Did the tiny version anyway. Weird how that's enough some days."*
- **Streak data:** running streak with **up to 2 freezes** (Duolingo-modelled); a freeze absorbs a single missed day without resetting.
- **Resolution %:** computed from cumulative XP via the §3 formula. Ends at **~97–99%** on Day 250 (never a suspicious 100% — "high definition, not perfect").

**Narrative milestone beats (baked in):**
| Day | Beat title | On-screen message |
|---|---|---|
| 1 | *Boot Sequence begins* | "Everything is blurry. That's the point. Let's start rendering." |
| 7 | *First week rendered* | "Seven signals logged. The static is thinning." |
| 21 | *Boot complete* | "You showed up 21 times. The outline of you is visible." |
| 50 | *The Dip* | "This is the hard part the science warned about. You're still here." |
| 100 | *Halfway sharp* | "You can see the face now. Keep going." |
| 150 | *Plateau broken* | "Progress went quiet for a bit. Then it didn't." |
| 200 | *High Definition unlocked* | "Almost fully rendered. Detail everywhere." |
| 250 | *Runway complete* | "Day 1 you couldn't see yourself. Look now." |

### 2.4 Data shape (TypeScript)
```ts
type Pillar = "Body"|"Mind"|"Craft"|"Voice"|"Order"|"Bonds";
type Tier = "Tiny"|"Standard"|"Hard";
interface Quest { id:string; pillar:Pillar; tier:Tier; text:string; anchor:string; done:boolean; }
interface DayRecord {
  day:number; act:"Boot"|"Rendering"|"Sharpening"|"HighDef";
  energy:1|2|3; quests:Quest[]; reflection:string;
  streak:number; freezeUsed:boolean; xpGained:number;
  cumulativeXP:number; resolutionPct:number; milestone?:string;
}
interface Journey { persona:string; days:DayRecord[]; }
```

---

## 3. GAME DESIGN LOGIC (real formulas)

### 3.1 XP / Resolution formula
**Base XP by difficulty tier** (Fogg B=MAP: make it tiny → high ability → happens even at low motivation):
- **Tiny** = 10 XP, **Standard** = 25 XP, **Hard** = 50 XP.

**Streak multiplier** (loss-aversion, capped to avoid runaway):
```
streakMult = 1 + min(streak, 30) * 0.01     // +1% per day, max +30%
```

**Daily XP:**
```
dailyXP = Σ(tierBase for each completed quest) * streakMult
```

**Diminishing-returns mapping from cumulative XP → resolution %** (early wins feel huge; later wins are subtler — mirrors the automaticity asymptote):
```
TOTAL_XP_TARGET = 6000                       // tuned so a "won" journey lands ~97–99%
raw = cumulativeXP / TOTAL_XP_TARGET         // 0..~1
resolutionPct = 100 * (1 - Math.exp(-2.5 * raw))   // saturating curve
```
This yields ~0% at start, fast visible gains in the first ~50 days, then a long refined tail — exactly the emotional arc we want, and it never quite hits 100.

### 3.2 The anti-addiction session cap (a structural mechanic, not a slogan)
- A session **timer starts on entering the Daily Loop**. After the reflection is logged, the app shows a **"Session Complete — go live your life"** screen and **soft-locks the daily loop** (grays it, shows "Come back tomorrow").
- Target session length **≤ 10 minutes**; if a user lingers past ~10 min without acting, a gentle nudge appears: *"This app works best when you close it. Your real life is the game."*
- **No infinite feed, no notifications-bait, no leaderboards, no variable-ratio slot mechanics.** This is the deliberate inversion of the attention economy and should be stated on the Landing page as a feature.

### 3.3 Streak-with-forgiveness (ethical loss aversion)
- Streak increments on any day with ≥1 completed quest (streak decoupled from the *number* of quests — Duolingo's key insight that lifted D14 retention 3.3%).
- **2 Streak Freezes** available, auto-consumed on a missed day (max 2, per Duolingo's experiment that 2 > 1 and 3 ≈ 2). Freezes regenerate slowly (e.g., 1 per 14 clean days).
- Copy is **"bend, not break"**: a missed day shows *"You missed yesterday. A freeze caught you. Nothing lost — keep rendering."*

### 3.4 Difficulty tiers & badges
- Tiers (**Tiny / Standard / Hard**) are chosen by the Quest Master based on energy level (autonomy + right-sized competence).
- **Milestone badges** at days 1/7/21/50/100/150/200/250 (see §2.3). Badges celebrate **showing up**, not stre­aks-at-all-costs — avoiding the overjustification trap.

### 3.5 Act structure (250-day narrative)
| Act | Days | Theme | Visual state |
|---|---|---|---|
| **Boot Sequence** | 1–21 | Just show up; establish anchors | Heavy pixelation, dim, monochrome-ish |
| **Rendering** | 22–100 | Push through the Dip; consistency | Blocks shrinking, color returning |
| **Sharpening** | 101–200 | Depth, harder quests, identity | Fine detail emerging |
| **High Definition** | 201–250 | Mastery, near-automaticity | Crisp, warm, fully lit |

### 3.6 Behavior-science → mechanic map (put this table in the app's "Why it works" section)
| Science | Source | Concrete Runway 250 mechanic |
|---|---|---|
| **Fogg B=MAP / Tiny Habits** | BJ Fogg, Stanford Behavior Design Lab | Quests are tiny + anchored; Tiny tier exists so behavior happens at low motivation. |
| **Implementation intentions** | Gollwitzer; "After I ___, I will ___" | Every quest ships with an `anchor` field ("After I brush my teeth…"). |
| **Self-Determination Theory** | Deci & Ryan; PMC8391751 (β autonomy .312, competence .346, relatedness .165) | Pillar choice (autonomy), tiered difficulty (competence), Bonds/Voice quests + reflections (relatedness). |
| **Habit loop (cue-routine-reward)** | Duhigg | Anchor = cue; quest = routine; resolution render = reward. |
| **Identity-based habits** | James Clear, *Atomic Habits* | Reflections framed as "votes for the person you're becoming." |
| **Loss aversion (λ≈2.25)** | Tversky & Kahneman (1992) | Streak + resolution "you could lose," softened by freezes. |
| **Overjustification (avoid it)** | Deci/Koestner/Ryan (1999), 128 studies | Reward is intrinsic (seeing yourself render), not points/confetti. |

### 3.7 Honest competitive comparison (include this exact table in the Monetization/About area)
| App | Core mechanic | Monetization | Where it falls short | How Runway 250 answers it |
|---|---|---|---|---|
| **Habitica** | RPG character; HP/XP/gold; party boss battles | Free core; **$4.99/mo** cosmetic subscription | "Costume on chores" — heavy RPG scaffolding can obscure real behavior; complexity | One evolving *you*, not a fantasy avatar; the visual **is** your real progress |
| **Finch** | Nurture a pet bird via self-care check-ins | **Finch Plus: $9.99/mo or $69.99/yr** (per help.finchcare.com) | Reward is the bird's growth, one step removed from *your* growth | The thing that renders is **you**, not a mascot |
| **Forest** | Grow a tree during focus sessions; tree dies if you leave | One-time / IAP; plants real trees | Single-purpose (focus timer); not a life system | Whole-life pillars + narrative arc |
| **SuperBetter** | Epic Wins, Quests, Bad Guys, Power-Ups, Allies, Secret Identity | Freemium; **Hero subscription** | Framing-heavy; solo depth paywalled | RCT-grade framing, but calmer, resolution-native, anti-addiction |
| **Duolingo** | Streaks, leagues, XP, hearts | Freemium → Super/Max; streak-freeze monetization | Streak anxiety; "learning the game, not the language"; on deceptive.design for pushy patterns | Streak has forgiveness by default; **session cap** structurally prevents compulsion |

**SuperBetter's evidence base (cite honestly):** Roepke, Jaffee, Riffle, McGonigal, Broome & Maxwell (2015), *Games for Health Journal* 4(3):235–46 — an RCT of **283 adults with significant depression symptoms**, randomized to CBT-PPT SuperBetter, General SuperBetter, or waitlist; 30 days of play "significantly reduced symptoms of depression and anxiety, and increased optimism, self-efficacy, perceived social support and life satisfaction, compared to waitlist controls" (posttest Cohen's *d* = 0.67; follow-up *d* = 1.05, to be read cautiously given attrition and a self-selected sample). This is the credibility bar Runway 250's real (post-demo) version should aspire to.

---

## 4. AI QUEST MASTER (Gemini API)

### 4.1 Model choice (verified July 2026)
- **Use a low-cost fast Flash model.** As of **April 1, 2026, Gemini Pro models are paid-only**; **Flash and Flash-Lite retain free tiers with reduced daily quotas.** So the demo defaults to a Flash-class model, which works on the founder's free API key.
- **Recommended default: `gemini-2.5-flash`** (strong value, free-tier eligible). **Cheapest option: `gemini-2.5-flash-lite`** — per the Google Developers Blog (Feb 19, 2026), "It's our lowest-cost 2.5 model yet, priced at **$0.10 / 1M input tokens and $0.40 output tokens**." Make the model name a single constant (`QUEST_MASTER_MODEL`) so it's trivially swappable as newer Flash models (e.g., 3.x Flash) become free-tier eligible.
- **Free-tier reality:** quotas are **project-level, not per-key** (extra keys don't add quota); free-tier inputs/outputs may be used by Google for product improvement; check AI Studio for the live per-project limit. For a pitch demo this is fine — but the app must degrade gracefully (§4.4).

### 4.2 Key security (server-side only)
- API key lives in **`.env.local` as `GEMINI_API_KEY`**, **never** referenced in any client component or `NEXT_PUBLIC_` variable.
- All Gemini calls happen in a **Next.js Route Handler** at `app/api/quest/route.ts` (server-only). The client posts the persona context and receives JSON quests back. Add `.env.local` to `.gitignore`.

### 4.3 Route handler + strict JSON (using @google/genai)
```ts
// app/api/quest/route.ts
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const QUEST_MASTER_MODEL = "gemini-2.5-flash";

export async function POST(req: Request) {
  try {
    const { pillars, recentHistory, energy } = await req.json();
    const response = await ai.models.generateContent({
      model: QUEST_MASTER_MODEL,
      contents: buildPrompt({ pillars, recentHistory, energy }),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pillar: { type: "string" },
              tier:   { type: "string" },   // Tiny | Standard | Hard
              text:   { type: "string" },   // the real-world action
              anchor: { type: "string" }    // "After I ___, I will ___"
            },
            required: ["pillar", "tier", "text", "anchor"]
          }
        }
      }
    });
    return NextResponse.json({ quests: JSON.parse(response.text), source: "LIVE_AI" });
  } catch (e) {
    return NextResponse.json({ error: "fallback" }, { status: 502 }); // client falls back
  }
}
```

### 4.4 System prompt design (`buildPrompt`)
> **System role:** "You are the Quest Master for *Runway 250*, a calm life-transformation game. You generate **real-world** quests (never in-app tasks). Given the player's chosen life pillars, their recent completion history, and today's energy level (1=low, 2=mid, 3=high), return **1–3 quests** as strict JSON matching the schema. Rules: (1) On energy 1, return exactly one **Tiny** quest (<2 min, e.g. Fogg-style 'floss one tooth'). (2) Balance pillars over time — don't repeat yesterday's pillar. (3) Every quest includes an `anchor` in the form 'After I [existing routine], I will [tiny action]'. (4) Warm, concise, non-preachy tone. (5) Never suggest anything unsafe, medical, or that requires spending money."

### 4.5 Fallback mode (the demo must NEVER break)
- The client calls `/api/quest`. **On any error/timeout/offline**, it silently falls back to **pre-scripted quests pulled from the current mock `DayRecord`**, tagged `source: "SIMULATED"`.
- A **"LIVE AI" toggle** (in Settings and visible on the Daily Loop) switches between:
  - **LIVE:** hits Gemini, shows a small pulsing "LIVE AI" chip.
  - **SIMULATED:** uses mock quests only (safe default for a noisy conference Wi-Fi pitch).
- The founder can therefore *demonstrate real personalization live* and, if Wi-Fi dies, flip to SIMULATED without the audience noticing a seam.

---

## 5. SCREENS / PAGES SPECIFICATION

All screens: max-width ~480–560px column (mobile-first, feels like an app even on desktop), generous whitespace, one focal element each.

**(a) Landing / Story (`/`)** — doubles as the pitch-deck opener. Full-bleed: the **pixelated hero at ~15% resolution** on the left vs **~98%** on the right, with the thesis line: *"On Day 1 you can't see yourself. Over 250 days, your real life renders you into focus."* Below: the three anti-social-media promises (≤10-min sessions, no feed, no notifications-bait). CTA: "Enter the Runway."

**(b) Onboarding Simulation (`/onboarding`)** — shows how a new player sets up: (1) select life pillars (autonomy), (2) honest current-state audit (sliders per pillar → sets starting resolution near 0), (3) "AI generates your personal 250-day arc" moment (can call Gemini live or play a scripted reveal). Ends by dropping into Day 1.

**(c) Daily Loop (`/today`)** — the core. Shows today's 1–3 quests as **quest tiles** (pillar icon, tier chip, anchor line). Flow: tap **Complete** → short **reflection** textarea → **resolution-gain animation** (the hero visibly sharpens a notch + "+X resolution") → **Session-Complete screen** ("Go live your life") with the session timer. Carries LIVE-AI chip and SIMULATION badge as appropriate.

**(d) Journey / World (`/journey`)** — **the money shot.** The central evolving visual large and centered, with a **Day 1 → Day 250 scrubber slider**. Dragging the scrubber **re-renders the pixelation level in real time** and updates the day's milestone caption, streak, and resolution %. A "Play" button auto-scrubs 1→250 as a ~15-second cinematic. This is what convinces family/friends.

**(e) Analytics Dashboard (`/analytics`)** — built with **Recharts**, all from mock data, to show the founder thinks in metrics:
- **Resolution growth** (area chart, 250 days) — the saturating curve.
- **Retention curve** (line): show a *credible-but-ambitious* cohort — e.g., D1 **~38%**, D7 **~22%**, D30 **~14%**, plotted against the **industry medians (D1 26% / D7 13% / D30 7%)** as a dashed benchmark line, explicitly labeled "ambitious target vs. category median."
- **DAU/WAU stickiness** stat card — target **~30%** (labeled ">25% = strong per AppsFlyer").
- **Pillar balance** (radar chart) — completion by pillar.
- **Completion rate over time** (bar) — visibly showing the Day 20–50 dip and recovery (proof the founder understands real behavior).
- **Weekly active pattern** (heatmap-style bars).
- Every chart footered with a **"SIMULATED DATA"** tag.

**(f) Monetization / Business (`/business`)** — a clean slide baked into the app:
- **Model options:** (1) **Freemium with premium "Seasons"** (each 250-day arc is a season; premium unlocks new arcs/themes/AI depth), (2) **one-time "Founder" lifetime price** (avoids India subscription fatigue), (3) **B2B wellness** (companies sponsor employee runways).
- **India-first pricing reality (researched):** UPI is the default rail (~640M+ transactions/day, ~84% of digital payments) but **willingness to pay recurring fees is low** — a LocalCircles survey found ~75% would stop using UPI if even small fees were added; Indian users prefer **annual/quarterly plans over monthly** and respond to visible savings. → Recommend **INR annual + one-time founder tiers via UPI Autopay**, not monthly.
- **Competitor price anchors** (all in the table in §3.7): Finch **$9.99/mo or $69.99/yr**, Habitica **$4.99/mo** (generous free tier), Forest/Streaks lean on **one-time** pricing. → Runway 250's India price points should sit *below* Western SaaS: e.g. suggested **₹199 one-time founder / ₹499 per premium Season** (mark clearly as *proposed, not validated*).

**(g) About / Why (`/about`)** — the founder story, safely anonymized: *"An engineer who stacked skills across tech, product, analytics, and finance, stalled, and is now building his comeback in public over 250 days."* Plus the behavior-science table (§3.6) and honest competitor table (§3.7).

**(h) Settings (`/settings`)** — **LIVE AI toggle**, **Demo Reset** button (clears localStorage, regenerates journey), and a **persona-day selector** (jump the whole app to any day 1–250 for demoing specific moments). Also a dark-mode toggle.

---

## 6. DESIGN SYSTEM (premium, minimal, calm)

### 6.1 Design tokens
```
--color-teal:        #2A7F7F   /* primary / brand */
--color-teal-deep:   #1E5E5E
--color-paper:       #F7F6F2   /* warm background (light) */
--color-ink:         #1C1C1A   /* text */
--color-muted:       #6B6B63
--color-signal:      #E8A13A   /* warm accent for milestones */
--color-grid:        rgba(42,127,127,0.08)  /* subtle grid motif */
/* dark mode */
--dark-bg:           #14201F
--dark-surface:      #1B2B2A
```
- **Visual motifs:** a faint background **grid** (evokes pixels/resolution), and pixel-block accents on milestones.
- **Typography:** **Geist** (or Inter / Space Grotesk) — all free, premium-feeling. Geist for headings, Inter for body. Large type, tight tracking on headlines, roomy line-height on body.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px.
- **Radius:** 12–16px cards; **shadows:** soft, low-contrast.

### 6.2 Component inventory
- `Card`, `QuestTile` (pillar icon + tier chip + anchor line + Complete button)
- `ProgressRing` (SVG circular, for daily completion)
- `ResolutionMeter` (horizontal bar showing current resolution %)
- `PixelAvatar` (the canvas hero — §7)
- `DayScrubber` (range input styled as a filmstrip)
- `MilestoneBadge`, `SimulationBadge`, `LiveAIChip`, `SessionTimer`

### 6.3 Micro-interaction guidelines (Framer Motion)
- **Calm, not casino.** Ease-out, 200–400ms, subtle opacity/scale. **Respect `useReducedMotion`.**
- The **resolution-gain** animation is the one signature moment: a gentle "focus pull" (the pixel blocks shrink one step) over ~600ms — satisfying but not a dopamine slot pull.
- **No** confetti bursts, no bouncing coins, no red-dot notification anxiety. The restraint *is* the brand.

---

## 7. THE RESOLUTION VISUAL ENGINE

### 7.1 Approaches compared
| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **1. Canvas progressive pixelation** of one hero image (draw tiny → scale up, `imageSmoothingEnabled=false`) | Reliable, one asset, smooth continuous control, 60fps, graceful degrade | Must handle devicePixelRatio | ✅ **RECOMMENDED** |
| 2. SVG mosaic grid filling in over time | Crisp, scalable | Complex to author 250 states; heavier DOM | Secondary |
| 3. CSS `image-rendering: pixelated` with pre-generated steps | Simple | Needs many pre-rendered images; discrete not continuous; retina non-integer-DPR distortion | No |
| 4. Generative pixel-grid avatar adding detail | Novel | Hard to make "premium" quickly | Later |

### 7.2 Recommended implementation (Approach 1)
```ts
// PixelAvatar.tsx (core logic)
const dpr = window.devicePixelRatio || 1;
canvas.width  = rect.width  * dpr;   // account for retina to avoid blur
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
ctx.imageSmoothingEnabled = false;   // nearest-neighbour = crisp blocks

// resolutionPct: 0..100 (from the day's DayRecord or the scrubber)
function render(resolutionPct: number) {
  // more blocky at low %; near-full detail at high %
  const level = 0.02 + (resolutionPct / 100) * 0.98;  // 0.02..1.0
  const w = Math.max(1, Math.floor(baseW * level));
  const h = Math.max(1, Math.floor(baseH * level));
  ctx.drawImage(img, 0, 0, w, h);                       // down to tiny
  ctx.drawImage(canvas, 0, 0, w, h, 0, 0, baseW, baseH); // back up, blocky
}
```
- **Scrubber wiring:** the `/journey` `DayScrubber` sets a day → reads `resolutionPct` → calls `render()`. Continuous, buttery.
- **Performance:** only run the `requestAnimationFrame` loop during active transitions; **stop it when idle** (fully rendered or fully blocky). Preload the image (`img.complete` check) before first draw. Provide a CSS-hidden `<img>` fallback if canvas fails.
- **Aesthetic tip:** at low resolution also **desaturate + dim**; as % rises, restore **saturation + warmth + light**, so the emotional read is "coming to life," not just "un-blurring."

---

## 8. REPO STRUCTURE & BUILD PLAN

### 8.1 Proposed file tree
```
runway250/
├─ app/
│  ├─ layout.tsx            # shell, fonts, dark-mode, footer SimulationBadge
│  ├─ page.tsx              # (a) Landing/Story
│  ├─ onboarding/page.tsx   # (b)
│  ├─ today/page.tsx        # (c) Daily Loop
│  ├─ journey/page.tsx      # (d) scrubber money-shot
│  ├─ analytics/page.tsx    # (e) Recharts
│  ├─ business/page.tsx     # (f) Monetization
│  ├─ about/page.tsx        # (g)
│  ├─ settings/page.tsx     # (h) LIVE AI toggle, reset, day selector
│  ├─ api/quest/route.ts    # Gemini server route + fallback signal
│  ├─ manifest.ts           # PWA manifest
│  └─ sw.ts                 # Serwist service worker
├─ src/
│  ├─ components/           # QuestTile, PixelAvatar, ResolutionMeter, DayScrubber, ...
│  ├─ lib/
│  │  ├─ data/generateJourney.ts   # seed generator (§2.3)
│  │  ├─ data/journey.json          # generated 250-day dataset
│  │  ├─ game/formulas.ts           # XP/resolution/streak (§3.1)
│  │  └─ ai/prompt.ts               # buildPrompt (§4.4)
│  └─ store/useRunwayStore.ts       # Zustand + persist
├─ public/icons/ , public/hero.png
├─ .env.local              # GEMINI_API_KEY (gitignored)
└─ next.config.ts          # withSerwistInit
```

### 8.2 Ordered phases + acceptance criteria (verifiable by a non-developer)
| Phase | Build | Acceptance ("open X, you should see Y") |
|---|---|---|
| **0 — Scaffold** | `create-next-app`, install deps, run dev | Open `http://localhost:3000` → default Next welcome page loads, no errors. |
| **1 — Design system + layout** | Tokens, fonts, shell, footer SIMULATION badge, dark mode | Every page shares the warm-paper look, teal accents, and a footer "SIMULATION" badge. |
| **2 — Mock data generator** | `generateJourney.ts` → `journey.json` | Open `/analytics` (stub) → console/logs show 250 days, resolution ends ~97–99%, with a visible dip around days 20–50. |
| **3 — Core screens** | Landing, Onboarding, Daily Loop, About, Business, Settings | Click through all nav links; Daily Loop shows quests → reflection → session-complete screen. |
| **4 — Resolution engine** | `PixelAvatar` + `/journey` scrubber | Open `/journey`, drag slider Day 1→250 → hero visibly sharpens from blocky/dim to crisp/warm; "Play" auto-scrubs. |
| **5 — Analytics** | Recharts dashboard | Open `/analytics` → resolution area chart, retention line vs benchmark, radar, completion bars, stickiness card — all with SIMULATED tags. |
| **6 — Gemini + fallback** | `/api/quest`, LIVE AI toggle | With key + LIVE on → real quests appear with LIVE chip; turn Wi-Fi off or LIVE off → quests still appear (SIMULATED). Never blank/broken. |
| **7 — PWA + polish** | Serwist manifest/SW, icons, motion polish, `useReducedMotion` | `next build && next start`; on phone, "Add to Home Screen" works; app opens standalone; works offline. |
| **8 — Deploy** | Push to GitHub → import to Vercel; add `GEMINI_API_KEY` env var in Vercel | Public URL loads; installable; LIVE AI works with the key set in Vercel. |

### 8.3 Five-minute pitch demo script (for the founder)
1. **(0:00) Landing** — "On Day 1 you can't see yourself. Watch what 250 days does." Point at the blurry-vs-crisp hero.
2. **(0:45) Journey scrubber — THE MOMENT** — Open `/journey`, hit **Play**, let the avatar render Day 1→250 in ~15s. Say: *"That's not a graphic. Every notch of sharpness is a real quest Arjun completed."*
3. **(1:45) Daily Loop + LIVE AI** — Go to `/today`, flip **LIVE AI on**, generate a real quest live from Gemini: *"This is personalized to the player's history, energy, and pillars — in real time."* Complete one → show the resolution-gain focus-pull → hit the **Session-Complete "go live your life"** screen: *"The app closes the loop and pushes you back to reality. That's the anti-doomscroll design — a feature, not a slogan."*
4. **(3:00) Analytics credibility** — Open `/analytics`: *"I think in retention. Here's an ambitious cohort against the industry medians of D1 26 / D7 13 / D30 7. Notice the completion dip around day 30 — that's the real motivational trough the science predicts, and the streak-freeze catches it."*
5. **(4:00) Monetization close** — Open `/business`: seasons + one-time founder pricing + B2B, India-first via UPI annual. *"Finch makes $69.99/yr on a bird. This does it on **you**."*
6. **(4:40) The ask** — *"This is a working prototype, all simulated data, clearly labeled. It shows the vision and that I can build it. I'm asking for 250 days of runway to turn Arjun's journey into real users' journeys."*

---

## 9. SAFETY / HONESTY RAILS FOR THE PITCH
- **Persistent "SIMULATION" badge** in the global footer on every screen that shows mock data.
- **"SIMULATED DATA"** tag on every analytics chart, and on quests served in fallback mode.
- The `/about` and `/business` pages state plainly: *"This is a demonstration prototype. All journeys, users, and metrics shown are simulated to illustrate the concept and the founder's execution ability. There are no real users yet."*
- The LIVE-AI chip appears **only** when a genuine Gemini call succeeded — never faked.
- **Why this matters:** it protects trust with friends-and-family investors. The demo sells **vision + capability**, never fake traction.

---

## 10. WHAT COMES AFTER (post-demo roadmap)
- **Real accounts + backend:** move from localStorage to real auth + a database (e.g., Postgres/Supabase); persist real quests, streaks, reflections per user.
- **Real AI backend:** server-side Gemini (or Claude) with the founder's billed key, caching, and per-user rate limits; migrate off free-tier quotas.
- **Native shell:** wrap/rebuild in **React Native / Expo** once the loop is validated, for real push (used sparingly, honoring the anti-addiction ethos) and app-store presence.
- **Validation gates (do not rebuild until these pass):**
  1. **10 friends** in a closed beta.
  2. **5 of 10 playing 21 straight days** (past the Boot Sequence) before any significant rebuild.
  3. Only then invest in monetization infrastructure (UPI Autopay, seasons).

---

## RECOMMENDATIONS (staged, with thresholds)
1. **Build in the exact phase order (0→8).** Do not start the Gemini integration (Phase 6) until the fallback path works — the offline demo must be bulletproof before any live-AI flourish. **Threshold to proceed to Phase 6:** the Daily Loop shows quests with the key removed.
2. **Invest the most polish in `/journey` (the scrubber) and the resolution engine.** This single screen carries the pitch. **Threshold:** the Day 1→250 auto-play reads as emotionally satisfying on a mid-range Android phone at 60fps.
3. **Default the demo to SIMULATED mode; flip to LIVE only when you have confident Wi-Fi.** Keep the founder's Gemini key on a **Flash/Flash-Lite** model to stay inside the free tier; watch for 429s and let the fallback absorb them.
4. **Keep all monetization/retention numbers explicitly labeled "proposed / simulated."** If a technical investor probes, walk them through the formulas (§3.1) and the benchmark line (§5e) — that transparency is more convincing than big fake numbers.
5. **After the pitch, treat the validation gates in §10 as hard go/no-go lines.** If fewer than 5/10 friends reach 21 days, the problem is the core loop, not the tech — iterate the quest design before building a backend.

---

## CAVEATS
- **Fast-moving specifics.** Next.js patch versions, Gemini model names, and free-tier rules change frequently. Verified July 2026: Next.js **16.2.10** stable; **Gemini 2.5 Flash-Lite at $0.10/$0.40 per 1M tokens**; Pro models paid-only since **April 1, 2026**. Keep the model name in one constant and re-check `ai.google.dev/pricing` before any public launch. Newer Flash models (3.x) may become free-tier eligible — swap when they do.
- **Free-tier quotas are project-level and can hit 429s.** Extra API keys do not add quota; free-tier data may be used by Google for product improvement. This is acceptable for a demo but the fallback (§4.5) is mandatory, not optional.
- **Canvas pixelation on non-integer devicePixelRatio** (e.g., Windows at 125% scaling, some Android) can look uneven; the devicePixelRatio handling in §7.2 mitigates but test on real devices before the pitch.
- **The retention/monetization figures in the app are illustrative targets, not forecasts.** The industry medians cited (D1 26% / D7 13% / D30 7%) are real; the "ambitious cohort" is invented for the demo and must stay labeled as such.
- **Behavior-science effect sizes come from specific populations** (e.g., the SuperBetter RCT had a self-selected, motivated sample with attrition). They justify the *design direction*, not a promise of outcomes — present them as rationale, not proof of Runway 250's efficacy, which is unproven until the §10 gates are met.
- **This blueprint assumes a solo non-developer driving an AI coding agent.** If any phase's acceptance criterion fails, stop and fix before advancing — later phases (especially 6–7) assume earlier ones are solid.