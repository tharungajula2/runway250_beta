# Runway 250 - Demo Scripts

This document contains two distinct presentation scripts designed to showcase Runway 250.

---

## 1. THE FAMILY DEMO (3 Minutes)
**Target Audience**: Family, friends, and game-design enthusiasts.  
**Focus**: Visual polish, calm game ethos, satisfying tactile feel, and the narrative journey.  
**Constraints**: Game Mode only. No business models or technical terms.

| Time | Step | Action & Visual Focus | Voiceover Guide / Narrative |
| :--- | :--- | :--- | :--- |
| **0:00 - 0:45** | **Boot & Onboarding** | Start on the Landing page (`/`). Click "Enter the Runway". Step through **Choose what to render** (Pillars as clean cards). Tap to toggle cards (observe the blur-to-sharpen lens focus). Next, on **Calibration**, drag the sliders (observe the procedural pixel static clearing out). | *"Welcome to Runway 250. This is a 250-day game where your real life is the controller. Let's create our character by choosing what parts of life to render—body, mind, craft. Honesty is the controller here: drag the static slider to show where your life is currently out of focus."* |
| **0:45 - 1:15** | **The Assembly** | Hit "Assemble". Watch the hexagonal orbit animation, the runway drawing itself, and the Shields slotting in. Click "Begin Day 1". | *"Now the system compiles our character. Pillars orbit into place, shield tokens lock in to protect us from missed days, and we begin Act I: Boot."* |
| **1:15 - 2:15** | **Daily Ritual (Today)** | On the Today page (`/today`), select your fuel level ("Steady"). Check off a quest (observe the marimba sound blip, the card sharpening, and the glowing mote flying to the header). Open the Riddle Envelope, solve the riddle (type letters, watch cells sharpen), type your reflection, and click "Commit Day". Watch the Before/After avatar comparison and hit "Go live your life" (fade to black). | *"This is our daily check-in. Tell the game how much fuel you have today, and it adapts. Complete your quests to send resolution energy to your avatar. No casino tricks—just a clean blip and a bonus riddle. Once done, write a single line of reflection. Here is the before-and-after of today's progress. Now: go live your life."* |
| **2:15 - 3:00** | **The Rendering (Journey)** | Go to the Journey page. Hit "Play Journey (15s)". Watch the timeline scrubber glide across the four Act color bands. Show the milestone cards flipping open as the scrubber passes them. End with Day 250 dialogue. | *"The Journey tab—called 'The Rendering'—shows our 250-day arc. Let's fast-forward. Watch the timeline scrubber pass each Act, flipping open memories and milestone messages. At the very end on Day 250, the static is completely gone. IRIS says: 'Look at you. All signal now.'"* |

---

## 2. THE TECHNICAL DEMO (5 Minutes)
**Target Audience**: Developers, engineers, product managers, and investors.  
**Focus**: Hybrid client-server architecture, local-first offline resilience, analytics/retention benchmarks, and monetization models.

### Step 1: The Core Game Experience (2 Minutes)
* Run the **Family Demo** in a compressed format (fast-forward through onboarding and one quest completion to establish the visual vocabulary, sound design, and custom theme/reduced-motion overrides).

### Step 2: Unlocking Builder Access (1 Minute)
* Navigate to the **Settings** page (`/settings`).
* Scroll to the very bottom to find the **Builder Access** row.
* Click and hold the toggle button for **2 seconds** (watch the circular indicator fill up).
* Release to toggle **Pitch Mode ON**. Point out the amber alert banner (`PITCH MODE ● ACTIVE`) at the top of the viewport.

### Step 3: Architecture & Live IRIS Demo (1 Minute)
* Go back to the **Today** page.
* Note that the **IRIS Live Connection** toggle is now active.
* Click **"Ask IRIS for different quests"**.
* Hover over the elegant **IRIS ● LIVE** badge. Point out the diagnostic tooltip:
  * Model ID: `gemini-3.1-flash-lite`
  * API Latency (e.g. `240ms`)
  * Tokens: Prompt and Completion details.
  * API Cost (micro-cents validation).
* **Kill the Network Link** (simulate offline/no network connection). Show that clicking "Ask IRIS" gracefully and silently degrades back to the local database, serving highly contextual quests from the deterministic formulas with zero crashes or loader hangs.

### Step 4: Metrics & Cohort Retention (45 Seconds)
* Navigate to the **Metrics** page (`/analytics`) via the newly visible bottom nav link.
* Showcase the dashboard built using custom-styled Recharts:
  * **Resolution Area Chart**: Interactive milestone pulses.
  * **Cohort Retention Curves**: Explain the D30 curve beating the industry standard. Call out the explicit comparison line: *"ambitious target vs. category median (Adjust 2026)"*.
  * **Weekly Commitment Heatmap**: Explain how visual consistency reinforces habit adherence.

### Step 5: Monetization & The Ask (15 Seconds)
* Navigate to the **Business** page (`/business`).
* Showcase the pricing tiers:
  * Single purchase unlock model (no recurring subscription trap).
  * Regional pricing (UPI India alignment: ₹199 - ₹499 tiers).
* Conclude with the investment thesis: A highly polished, offline-first habit wrapper that uses game mechanics instead of dark patterns to sustain long-term engagement.

---

## 3. COMPLIANCE CHECKLIST
* **The Terminology Law**: Checked and verified. Banned strings ("behavior science", "Gemini", "AI", "localStorage", "API", "LLM", "audit") do not exist in Game Mode strings or UI templates.
* **Themes**: Both light and dark modes fully support local preferences with no layout flashing on mount.
* **Reduced Motion**: Verified that `useReducedMotion()` silences and skips all non-essential canvas/SVG animations.
* **Offline PWA**: Fully functional service worker scope `/` caching static assets and providing a styled offline fallback page.
