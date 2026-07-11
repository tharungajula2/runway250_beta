# Runway 250: Comprehensive Features Guide, User Manual & Content Audit

Welcome to the Master Documentation and User Manual for **Runway 250** — a premium, local-first, installable Progressive Web Application (PWA) designed to gamify real-life habit building. 

Rather than feeding digital addictions with slot-machine points, leaderboards, or endless feeds, Runway 250 uses a **progressive resolution canvas engine**: as a user completes real-world tasks across 250 days, their 2D pixelated avatar and world gradually render from a blurry, low-resolution outline into high-definition focus.

---

## Table of Contents
1. [Core Theme & Philosophy](#1-core-theme--philosophy)
2. [Behavioral Science Foundation](#2-behavioral-science-foundation)
3. [Game Design & Mathematical Formulas](#3-game-design--mathematical-formulas)
4. [Progressive Resolution Canvas Engine](#4-progressive-resolution-canvas-engine)
5. [AI Quest Master & Fallback System](#5-ai-quest-master--fallback-system)
6. [Anti-Attention Session Cap](#6-anti-attention-session-cap)
7. [App Screens & Page-by-Page Content Audit](#7-app-screens--page-by-page-content-audit)
8. [User Manual & Interactive Demo Guide](#8-user-manual--interactive-demo-guide)
9. [Competitor Comparison & Proposed Monetization](#9-competitor-comparison--proposed-monetization)
10. [Repository Structure & Architecture](#10-repository-structure--architecture)

---

## 1. Core Theme & Philosophy

The central premise of Runway 250 is simple yet profound:
> **"On Day 1, you cannot see yourself. Every day you show up for your real life, you render your avatar into high definition."**

Runway 250 is built as a **pitch-ready demo prototype** rather than a standard commercial product. It models a fully simulated 250-day comeback journey for an anonymized persona ("Arjun, 29") while providing a live playground to interface with Gemini for real personalization. 

### Core Pillars of the Identity Journey
Every quest logged in Runway 250 corresponds to one of **six core life pillars**:
1. **Body (Activity):** Movement, stretching, hydration, and physical energy.
2. **Mind (Brain):** Focus, reading, mindfulness, and clarity.
3. **Craft (Code):** Professional building, coding, writing, and skill acquisition.
4. **Voice (Mic):** Public building, peer updates, networking, and direct expression.
5. **Order (Layout-grid):** Digital hygiene, workspace decluttering, and environments.
6. **Bonds (Heart):** Family connection, genuine social networks, and relationships.

---

## 2. Behavioral Science Foundation

Runway 250 rejects superficial "gamification" in favor of peer-reviewed behavioral research. The design translates scientific principles into concrete app mechanics:

| Scientific Principle | Academic Source | In-App Runway 250 Mechanic |
| :--- | :--- | :--- |
| **Habit Formation Timeline** | Lally et al. (2010), *Eur. J. Soc. Psychol.* 40(6): 998–1009. Median timeline: **59–66 days** to reach automaticity. | A **250-day roadmap** (Act I–IV) that acknowledges habit building is a marathon, not a 21-day sprint. |
| **Motivational Troughs** | PMC11641623 (2024 review). Retention dips and habit "decay" occur post-novelty phase. | **Procedural Dip modeling**: Days 22–50 feature lower simulated completion rates and missed days. |
| **Ethical Streak Forgiveness** | Duolingo Streak Studies. Having 2 freezes increases D14 retention by 3.3%. | **2 auto-regenerating Streak Freezes** prevent streak loss on missed days. |
| **Loss Aversion (λ ≈ 2.25)** | Tversky & Kahneman (1992), *J. Risk & Uncertainty* 5: 297–323. | Streak preservation and "resolution loss risk" leverage natural loss aversion ethically. |
| **Overjustification Effect** | Deci, Koestner & Ryan (1999), *Psych. Bulletin* 125(6): 627–668. | **Intrinsic Rewards Only**: The "prize" is seeing your avatar resolve, not earning slot-machine coins. |
| **Fogg Behavior Model** | BJ Fogg, Stanford Behavior Design Lab. $B=MAP$. | **Tiny Quest Tier** (e.g. "read 1 page") so habits trigger even during low-motivation states. |
| **Implementation Intentions** | Peter Gollwitzer. "After I [Routine], I will [Action]." | Every quest forces a contextual **anchor statement** linking cues to habits. |
| **Self-Determination Theory** | Deci & Ryan. Core pillars map to Autonomy, Competence, and Relatedness. | **Autonomy** (choose pillars), **Competence** (tiered difficulty), **Relatedness** (Bonds, Voice + reflections). |

---

## 3. Game Design & Mathematical Formulas

The telemetry displayed in the prototype is powered by a set of interconnected game-logic formulas.

### 3.1 Experience Point (XP) Tiers
Base XP is awarded based on quest difficulty:
* **Tiny:** $10\text{ XP}$ (Low friction, $<2\text{ mins}$)
* **Standard:** $25\text{ XP}$ (Medium effort, $10-20\text{ mins}$)
* **Hard:** $50\text{ XP}$ (Significant effort, $>45\text{ mins}$)

### 3.2 Streak Multiplier
To reward consistency without causing runaway inflation, the streak multiplier caps at 30 days ($+30\%$):
$$\text{Streak Multiplier} = 1 + \min(\text{streak}, 30) \times 0.01$$

The total XP earned on day $d$ is:
$$\text{Daily XP} = \left( \sum \text{Base XP for completed quests} \right) \times \text{Streak Multiplier}$$

### 3.3 Cumulative XP to Saturating Resolution
To mimic habit automaticity (where early efforts produce dramatic gains and late efforts add incremental refinement), the XP maps to a saturating exponential curve targeting $6000\text{ XP}$ (the optimal XP for 250 days):
$$\text{Raw Ratio} = \frac{\text{Cumulative XP}}{6000}$$
$$\text{Resolution \%} = 100 \times \left(1 - e^{-2.5 \times \text{Raw Ratio}}\right)$$

* **Day 1:** Begins at approximately $1\%$.
* **Day 50:** Renders to $\sim 30-40\%$, resolving early static.
* **Day 250:** Approaches $\sim 97-99\%$, representing high definition but never a suspicious $100\%$ ("High definition, not perfection").

---

## 4. Progressive Resolution Canvas Engine

The core visual mechanic—the transition from a blurry silhouette to a sharp, detailed avatar—is rendered dynamically in code.

```typescript
// Custom canvas rendering loop (PixelAvatar.tsx)
const dpr = window.devicePixelRatio || 1;
canvas.width = rect.width * dpr; // Retina display sharpness calibration
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);

ctx.imageSmoothingEnabled = false; // Force crisp nearest-neighbor pixel blocks

function drawProgressiveResolution(resolutionPct: number) {
  // Convert resolution percentage (0-100) to a downscaling level (0.02 - 1.0)
  const level = 0.02 + (resolutionPct / 100) * 0.98;
  
  // Compute small image dimensions
  const w = Math.max(1, Math.floor(baseWidth * level));
  const h = Math.max(1, Math.floor(baseHeight * level));
  
  // Step 1: Draw downscaled image into tiny memory canvas
  ctx.drawImage(originalImage, 0, 0, w, h);
  
  // Step 2: Draw tiny canvas back up to main scale, creating blocky pixelation
  ctx.drawImage(canvas, 0, 0, w, h, 0, 0, baseWidth, baseHeight);
}
```

### Aesthetic Calibration
* **Low Resolution ($<25\%$):** Desaturated, dim gray colors, wide pixel blocks (outline only).
* **Medium Resolution ($25\% - 75\%$):** Saturation returns, details emerge, pixel size shrinks.
* **High Resolution ($>75\%$):** Warm tones, crisp pixels, highlights, and full lighting.

---

## 5. AI Quest Master & Fallback System

Runway 250 includes a state-of-the-art AI layer powered by the **Google Gemini API** (`gemini-2.5-flash` model), running safely inside a secure Next.js Server Route.

### 5.1 Route Handler API (`app/api/quest/route.ts`)
The server route intercepts requests from the client, reads the payload, executes the schema-structured Gemini call, and returns strict JSON.

```typescript
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const QUEST_MASTER_MODEL = "gemini-2.5-flash"; // Swappable constant

// Configured using structured output schemas
const config = {
  responseMimeType: "application/json",
  responseSchema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        pillar: { type: "string" }, // "Body" | "Mind" | "Craft" | ...
        tier:   { type: "string" }, // "Tiny" | "Standard" | "Hard"
        text:   { type: "string" }, // Real-world action item
        anchor: { type: "string" } // Cue: "After I [Routine]..."
      },
      required: ["pillar", "tier", "text", "anchor"]
    }
  }
};
```

### 5.2 The System Prompt Guide
> *"You are the Quest Master for Runway 250, a calm life-transformation game. You generate real-world quests (never in-app tasks). Given the player's chosen life pillars, their recent completion history, and today's energy level (1=low, 2=mid, 3=high), return 1–3 quests as strict JSON. Rules: (1) On energy 1, return exactly one Tiny quest (<2 min). (2) Balance pillars over time — don't repeat yesterday's. (3) Every quest includes an anchor 'After I [existing routine], I will [tiny action]'. (4) Warm, concise, non-preachy tone. (5) Never suggest anything unsafe, medical, or that requires money."*

### 5.3 Bulletproof Fallback
If the network is offline, the API key is missing, or Google's free-tier rate limits are exceeded:
1. The API route throws a `502 Fallback` signal.
2. The client catches the error and **silently falls back to pre-seeded static quests** matching that day's narrative milestone.
3. The UI tags the fallback quests with a **"SIMULATED"** tag while successful Gemini requests receive a pulsing **"LIVE AI"** badge.

---

## 6. Anti-Attention Session Cap

To demonstrate a commitment to user wellness and combat screen addiction, Runway 250 implements a physical lock on usage:

1. **Daily Timer:** Entering the `/today` screen starts a **10-minute (600 seconds)** count-down.
2. **Soft-Lock:** Once a user completes today's quests and logs a reflection:
   * The app transitions to a **"Session Complete"** lock screen.
   * The daily loop is grayed out and disabled.
   * The message reads: *"Go live your real life. The game is outside."*
3. **Linger Nudge:** If the user stays idle on the page for more than 10 minutes without logging a reflection, a warning banner appears:
   * **Anti-Attention Warning:** *"You have lingered past the recommended 10 minutes. This app works best when you close it."*

---

## 7. App Screens & Page-by-Page Content Audit

This section lists the exact text copy, layout assets, and user interface elements present on every screen:

### 7.1 Landing / Story Page (`/`)
* **Layout:** Centered column layout, clean canvas previews on left (blurry) and right (rendered).
* **Header Copy:**
  * Title: `"Runway 250"`
  * Subtitle: `"A 250-Day Behavior Science Experiment"`
  * Description: `"On Day 1, you cannot see yourself. Every day you show up for your real life, you render your avatar into high definition."`
* **Preview Section:**
  * Day 1: `"Day 1: Blurry Outline"` (displays a 15% resolution canvas pixel avatar)
  * Day 250: `"Day 250: Rendered"` (displays a 98% resolution canvas pixel avatar)
* **The Three Anti-Attention Promises Section:**
  * Title: `"The Anti-Attention Promises"`
  * Promise 1: `"10-Minute Session Cap"` — `"The daily loop soft-locks after you check off and reflect. No infinite scrolls, no retention loops."`
  * Promise 2: `"Intrinsic Rewards Only"` — `"The prize is watching your own avatar gain resolution—not winning artificial points, badges, or cosmetic items."`
  * Promise 3: `"Ethical Forgiveness"` — `"Streak freezes absorb missed days automatically. Designed to bend, not break your habit momentum."`
* **CTA Button:** `"Enter the Runway"` (Sub-label: `"Takes ~2 minutes • Fully local database"`)

### 7.2 Onboarding Page (`/onboarding`)
* **Step 1: Pillar Selection Screen**
  * Title: `"1. Select Your Pillars"`
  * Subtitle: `"Choose the areas of life you want to render into high definition."`
  * Options: Body, Mind, Craft, Voice, Order, Bonds (displays icons and descriptions).
  * Navigation: `"Continue to Audit"` (disabled if no pillars selected).
* **Step 2: Baseline State Audit Screen**
  * Title: `"2. Current-State Audit"`
  * Subtitle: `"Be honest. Where is the static densest right now?"`
  * Interface: 1 to 10 sliders for each active pillar. Helper text tags: `"1 (Blurry)"`, `"Partial Outline"`, `"Severe Static / Blur"`, `"High Contrast / Sharp"`, `"10 (Crisp)"`.
  * Navigation: `"Back"` and `"Assemble Runway"`.
* **Step 3: Runway Generation Screen**
  * Title: `"3. Customizing Your Runway"`
  * Subtitle: `"Calculating daily loops & habit cues..."`
  * Loading logs: `"Initiating live Quest Master validation..."`, `"Reaching Gemini API via server route..."`, `"Analyzing selected focus pillars..."`, `"wiring up Fogg anchor intentions..."`, etc.
  * Successful Generation Details:
    * Card: `"Runway Parameters"` showing Days, Active Pillars, Initial Resolution, and Streak Freezes.
    * Card: `"Live Quest Sample Created"` showing the first generated quest details.
  * CTA Button: `"Begin Journey (Day 1)"`.

### 7.3 Daily Loop Page (`/today`)
* **State 1: Quests Dashboard**
  * Sub-header: `"Act [I-IV]: [Act Name]"` and the `"LIVE AI"` or `"SIMULATED"` source chip.
  * Main Header: `"Day X of 250"`.
  * Demo Controls (If Live AI toggled on): `"Simulate Energy Level: 1 (Low / Tiny) | 2 (Mid) | 3 (High)"`.
  * Interactive Quest Tiles: Displays icon, tier badge (Tiny, Standard, Hard), and Fogg anchor formula: `"After I [Anchor], I will [Text]"`.
  * CTA Button: `"Log Today's Reflections"`.
* **State 2: Reflection Submission**
  * Title: `"Reflect on Your Actions"`
  * Subtitle: `"How did carrying out these intentions feel?"`
  * Textarea Label: `"First-Person Reflection Log"`.
  * Identity Tip: `"Reflections reinforce your new identity by casting a vote for the person you are becoming."`
  * CTA Button: `"Commit & Render Resolution"`.
* **State 3: Resolving Animation**
  * Display: Backdrop blur, spinning status loader, and high-contrast avatar canvas updating.
  * Output: Large ticking resolution number (e.g. `23.5%`) with subtitle `"Avatar Definition"`.
* **State 4: Session Locked**
  * Icon: Standalone smartphone icon.
  * Header: `"Session Complete"`
  * Subtitle: `"Go live your real life. The game is outside."`
  * Message: `"You have logged your daily choices and reflections. Your avatar resolution has rendered to X%."`
  * Warn Card: `"Daily Loop Soft-Locked. To prevent digital compulsion, the Daily Loop has locked. We will seed new intentions tomorrow."`
  * Linger Warning (Triggered after 10m): `"Anti-Attention Warning: You have lingered past the recommended 10 minutes. This app works best when you close it."`
  * Navigation: `"Go to Settings & Selector"`.

### 7.4 Identity Journey Page (`/journey`)
* **Header Copy:**
  * Title: `"Identity Journey"`
  * Subtitle: `"Watch your avatar render in high-definition resolution across 250 days."`
* **Scrubber Viewport:**
  * Core PixelAvatar image display (large rendering).
  * Telemetry Labels: `"Timeline Position: Day X / 250"` and `"Resolution: X%"`.
  * Slider: Horizontal range slider (`Day 1 (Low-Res)` to `Day 250 (High-Res)`).
* **Control Panel:**
  * Primary Button: `"Play Journey (15s)"` or `"Pause Render"`.
  * Secondary Button: `"Reset Scrubber"` (returns slider to Day 1).
* **Day Details Card:**
  * Act tag: `"Act: [Name]"`
  * Statistics: `"Current Streak: X Days"`, `"Pillar Actions Done: X Completed"`.
  * Reflection snippet output: `"Reflection Snippet: '[Logged Reflection]'"`
  * Milestone Event banner: `"Milestone Event: [Milestone message]"`
* **Milestones Feed:**
  * Feed title: `"Milestones Unlocked"`.
  * Displays checklist badges of milestones: Day 1 (Boot begins), Day 7 (Week rendered), Day 21 (Boot complete), Day 50 (The Dip), Day 100 (Halfway sharp), Day 150 (Plateau broken), Day 200 (HD unlocked), and Day 250 (Runway complete). Unlocked items display colored icons, locked items display grayscale lock icons.

### 7.5 Behavior Analytics Dashboard (`/analytics`)
* **Header Copy:**
  * Title: `"Behavior Analytics"`
  * Subtitle: `"Quantitative telemetry of the 250-day simulated cohort and habits."`
* **Disclaimer:** `"PROTOTYPE telemetry: All metrics and user indices plotted are simulated models illustrating habit persistence curves."`
* **KPI Metric Cards:**
  * Card 1: `"Stickiness Ratio: 31.4%"` (Sub-label: `>25% = strong (AppsFlyer)`)
  * Card 2: `"Target D30 Retention: 14.0%"` (Sub-label: `VS 7.0% category median`)
* **Charts Panel (Recharts):**
  * Area Chart: `"Avatar Resolution Growth"` (saturating curve displaying amber milestones).
  * Line Chart: `"Cohort Retention Decay (30d)"` (comparing Runway 250's D1/D7/D30 target projections against the industry median).
  * Radar Chart: `"Pillar Balance Allocation"` (radar diagram plotting completion symmetry over the six pillars).
  * Bar Chart: `"Habit Completion Progression"` (completions binned into 10-day averages, visually mapping the Day 22-50 dip).
  * Heatmap Strip: `"Weekly Active Pattern Strip"` (grid representation showing active days per week for the first 12 weeks).

### 7.6 Business & Monetization Page (`/business`)
* **Header Copy:**
  * Title: `"Business & Monetization"`
  * Subtitle: `"Proposed India-first unit economics and competitor anchors."`
* **India-First Pricing Rationale Card:**
  * Description: `"UPI is India's default payment rail (~640M+ daily transactions, ~84% of digital payments). However, consumer willingness to pay recurring monthly fees is historically low... Indian users heavily reject small recurring fees and respond far better to annual/seasonal pricing... Decision: Leverage UPI Autopay for upfront annual seasons and one-time founder options."`
* **Proposed Price Point Cards:**
  * Season Card: `₹499` — `"Premium Season Arc: Per 250-day custom themed expansion pack."`
  * Founder Card: `₹199` — `"Founder Lifetime: One-time payment for the initial proof-of-concept run."`
* **Competitor Pricing Reference Table:**
  * Shows core mechanics, pricing models, and structural shortcomings of **Finch** ($9.99/mo), **Habitica** ($4.99/mo), and **Forest** (One-time/IAP).

### 7.7 About Page (`/about`)
* **Header Copy:**
  * Title: `"About Runway 250"`
  * Subtitle: `"The behavior science, competitor landscape, and story behind the project."`
* **The Founder Story Card:**
  * Content: `"An engineer who stacked skills across tech, product, analytics, and finance, stalled, and is now building his comeback in public over 250 days."`
* **Science & Competitor Matrices:**
  * Behavior Science Foundations table (detail in Section 2).
  * Competitive Comparison matrix (detail in Section 9).
* **SuperBetter RCT Evidence Citation Card:**
  * Details the Roepke et al. (2015) randomized controlled trial metrics showing reduction in depression/anxiety (posttest Cohen's $d = 0.67$).

### 7.8 Settings Page (`/settings`)
* **Header Copy:**
  * Title: `"Settings & Scrubber"`
  * Subtitle: `"Scrub the timeline or customize execution behaviors."`
* **Persona-Day Selector Card:**
  * Description: `"Jump the prototype timeline to any day (1–250) to preview quests, reflections, and rendering status..."`
  * Controls: Slider + Direct numeric input.
  * Day info box: Displays selected Day number, Act name, expected resolution percentage, and milestone flags.
* **App Preferences Card:**
  * Theme Mode Toggle: Switches between warm paper light background and deep dark theme.
  * LIVE AI Mode Toggle: Activates Gemini API connection on `/api/quest`.
* **Reset Operations Card:**
  * Control: `"Clear Local Storage & Reload"` button. Clears zustand cache, unlocks screens, and resets back to onboarding.

### 7.9 Offline Fallback Page (`/~offline`)
* **Header Copy:**
  * Title: `"Connection Suspended"`
  * Message: `"You're offline. Good."`
  * Description: `"Go live your life — your runway is saved."`

---

## 8. User Manual & Interactive Demo Guide

This user guide walks you through setting up, configuring, and demonstrating Runway 250 to stakeholders.

### 8.1 Setup and Installation
1. Ensure you have **Node.js (version 20.9.0 or higher)** installed.
2. In the project root directory, verify or install dependencies:
   ```bash
   npm install
   ```
3. Copy or create a `.env.local` file in the root repository and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   > **Note:** Do not commit `.env.local` to git. It is ignored by default in the `.gitignore`.

4. Start the Turbopack-powered Next.js dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) on your desktop browser or mobile emulator.

---

### 8.2 The 5-Minute Pitch Demo Script

Follow these steps to present Runway 250 to family, friends, or potential seed investors:

#### Minute 0:00 — The Hook (Landing Screen)
1. Load the Landing screen (`/`).
2. Point at the thesis statement: *"On Day 1 you can't see yourself. Every day you show up for your real life, you render your avatar into high definition."*
3. Highlight the two preview avatars side-by-side: Day 1 (blurry silhouette) vs Day 250 (sharp, detailed character).
4. Explain the **Anti-Attention Promises**: *"Unlike typical apps that exploit you for attention, Runway 250 caps your usage to 10 minutes and rejects points-based rewards in favor of intrinsic identity alignment."*
5. Click **"Enter the Runway"** to proceed.

#### Minute 0:45 — Setup and Baseline (Onboarding)
1. On the onboarding page, select focus pillars (e.g. choose **Craft**, **Mind**, and **Body**).
2. Click **"Continue to Audit"**.
3. Adjust the sliders to represent a starting scenario (e.g., set Craft to `2` and Body to `3`).
4. Click **"Assemble Runway"**.
5. Let the setup run. Explain: *"The app is mapping out a 250-day procedural habit curve. If LIVE AI is toggled on, it will fetch our first habit tasks from Gemini."*
6. Click **"Begin Journey"** to land on the Today loop.

#### Minute 1:45 — The Daily Routine (Today Loop)
1. Explain the **Quest Master**: *"Today is Day 1. Here are our tasks. Notice the Fogg anchoring structure: 'After I [Routine], I will [Behavior]'."*
2. Complete today's quests by checking them off.
3. Click **"Log Reflections"**. 
4. Write a reflection (e.g., *"Did the code block. It was hard to start but felt great once I did."*)
5. Click **"Commit & Render Resolution"**.
6. Watch the **progressive resolution canvas animation**: the avatar visibly sharpens, saturation increases, and the resolution percentage ticks up.
7. Land on the **Session Complete** screen: *"Notice that the Daily Loop is now soft-locked. The app closes and encourages you to go live your real life. No doomscroll trap."*

#### Minute 3:00 — The Scrubber (Identity Journey Screen)
1. Navigate to the **Journey** tab in the navigation bar.
2. **This is the "Money Shot":** Drag the slider slowly from **Day 1** to **Day 250**, or click **"Play Journey"** for the 15-second animated render.
3. Show how the avatar transitions dynamically from an un-rendered blur to a crisp, high-definition character.
4. Point out the milestone tags popping up (e.g., *Day 21 - Boot Complete*, *Day 50 - The Dip*, *Day 250 - Runway Complete*).
5. Highlight the changing reflection logs and streaks: *"This represents Arjun's complete 250-day history. You can see his emotional progression through his reflections."*

#### Minute 4:00 — Metrics & Economics (Metrics & Business Tabs)
1. Open the **Metrics** page.
2. Walk through the charts:
   * **Cohort Retention Decay:** *"Here is our target retention curve. Because of our low-friction, ethical design, we aim for a D30 retention of 14%, double the industry average of 7%."*
   * **Habit Completion Progression:** *"See the dip in completion between days 20 and 50? That is the scientifically predicted motivational trough. Our streak freezes absorb this dip, keeping users from abandoning their habits."*
3. Open the **Business** page.
4. Explain the monetization framework: *"Indian users reject monthly recurring SaaS. We propose UPI-powered seasonal expansion passes (₹499) and a lifetime Founder tier (₹199). Finch charges $69.99/year to grow a virtual pet. Runway 250 does it to grow **you**."*

#### Minute 4:50 — The Ask
* *"This is a working prototype. It represents a vision of humane, scientifically backed software. I am asking for 250 days of runway to turn this simulation into a tool that helps real users render their lives into high definition."*

---

## 9. Competitor Comparison & Proposed Monetization

Runway 250 positions itself as a humane alternative to the current market.

### 9.1 Competitor Landscape Matrix

| App | Core Habit Mechanic | Pricing / Monetization | Core Weakness | Runway 250 Difference |
| :--- | :--- | :--- | :--- | :--- |
| **Habitica** | Gamified RPG character. Tasks earn gold and XP; failures deal damage to health. | Free core. **$4.99/month** subscription for cosmetics and premium guilds. | **Scaffolding Overhead:** The heavy RPG layer can become a distraction, gamifying the interface rather than the habit. | **Self-Reflective Alignment:** The avatar rendering represents *your* focus, not a fantasy wizard. |
| **Finch** | Self-care check-ins nurture a virtual pet bird, sending it on adventures. | **$9.99/month** or **$69.99/year** subscription for premium items. | **Mascot Disconnect:** The reward loops center on the growth of the pet mascot rather than the user's personal identity. | **You are the Asset:** The character changing and coming into focus *is* you. |
| **Forest** | Focus timer grows virtual trees. Leaving the app before the timer ends kills the tree. | One-time download fee. In-app purchases for custom seed types. | **Single-Dimension:** Limited to focus sessions. Does not track multi-pillar daily habits or log long-term identity reflection. | **Holistic Life Pillars:** Tracks six dimensions of life across a 250-day narrative arc. |
| **Duolingo** | Gamified language loops. Leaderboards, leagues, and aggressive notifications. | Freemium. **$12.99/month** or **$83.99/year** premium subscription. | **Retention Addiction:** Relies on streak anxiety and dark patterns to force daily login, sometimes hurting genuine learning. | **Session Capped:** Capped daily loops. Inherent streak forgiveness by default to prevent anxiety. |

### 9.2 India-First Unit Economics
Most digital applications fail in India by trying to copy Western SaaS monthly recurring models. Runway 250 adapts directly to Indian payment behaviors:
* **UPI-Centric:** Leverages UPI Autopay and quick-scan QR codes instead of credit cards (historically low penetration).
* **No Monthly Fees:** Indian consumers show high churn rates on monthly recurring digital subscriptions. Runway 250 packages content as **Seasons** (250-day themed journey packages) at a flat **₹499 per season**, or a flat **Founder Lifetime Pass for ₹199** during the early-bird launch.

---

## 10. Repository Structure & Architecture

A directory map of the codebase for developers:

```
runway250_beta/
├── app/                      # Next.js 16.2 App Router Structure
│   ├── api/quest/route.ts    # Gemini API integration & Fallback logic
│   ├── onboarding/page.tsx   # Pillar setup & Baseline state audit
│   ├── today/page.tsx        # Daily Loop, Reflection, and Soft-Lock Screen
│   ├── journey/page.tsx      # The Timeline Scrubber & Canvas renderer
│   ├── analytics/page.tsx    # Recharts telemetry graphs
│   ├── business/page.tsx     # Pricing economics & competitor data
│   ├── about/page.tsx        # Founder story & scientific citations
│   ├── settings/page.tsx     # Theme toggle, LIVE AI toggle, and Day Jump Selector
│   ├── ~offline/page.tsx     # PWA Offline fallback view
│   ├── layout.tsx            # Root shell with global footer and badges
│   └── globals.css           # Core styling tokens & grid animations
├── src/                      # Client UI Components & Business Logic
│   ├── components/           # PixelAvatar canvas engine, Card, QuestTile, etc.
│   ├── lib/
│   │   ├── data/             # 250-day procedural pre-seeded journey json
│   │   └── game/formulas.ts  # XP calculations & saturating exponential curve
│   └── store/                # Zustand State (LocalStorage persistance)
├── BLUEPRINT.md              # Master engineering specifications
└── USER_MANUAL.md            # [This File] Complete manual, features, and page audit
```
