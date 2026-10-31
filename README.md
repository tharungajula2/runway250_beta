# Runway 250

> A calm, local-first life-planning game where small real-world actions render a 250-day journey into focus.

Runway 250 is an installable web prototype for turning daily actions into a visual story. Players choose life pillars, complete short anchored quests, record a reflection, and watch a pixelated avatar sharpen along a seeded journey. The project pairs a complete, explorable pitch experience with an optional Gemini-backed quest and riddle service.

**[Read the Project Blueprint](PROJECT_BLUEPRINT.md)** for the source-grounded architecture, data flow, formulas, setup, and limitations.

## What you can explore

| Area | What is implemented |
| --- | --- |
| Daily loop | Energy selection, quest cards, optional hunt descriptions, reflection, a 10-minute timer with a reminder, riddle, and a day-complete lock/sequence |
| Journey | A 250-day timeline, avatar rendering, milestone chapters, and animated playback of the sample journey |
| Archive | A chronological reflection view, combining saved local reflections with seeded sample entries |
| Pitch tools | Separate analytics and business pages with simulated cohort data and proposed, unvalidated pricing |
| Offline install | Web app manifest, icons, Serwist service worker, cached assets, and an offline document fallback |
| Optional generation | Server-side Gemini endpoints for quests and riddles, with local quest/riddle fallbacks |

## How the prototype behaves

The application is a **demonstration, not a live habit-tracking service**. Its 250-day history is generated deterministically and stored in [`src/lib/data/journey.json`](src/lib/data/journey.json). Scrubbing or playing the journey previews that fixed sample. Current quest interactions, reflections, preferences, and riddle completion are stored in the browser through Zustand persistence; they do not recalculate the sample's historical XP, streak, or analytics.

There is no account system, server database, cross-device sync, payment flow, or evidence of real users. The analytics and business pages identify their data and prices as simulated or proposed. The repository's `BUILDLOG.md` mentions `https://runway250-beta.vercel.app`; that deployment URL was **not verified as reachable** during this review.

## Technology

| Layer | Verified choices |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript 5 |
| UI | Tailwind CSS 4, Framer Motion 12, Lucide React, Recharts 3 |
| Client state | Zustand 5 with browser `localStorage` persistence |
| Install/offline | Serwist 9, Next.js manifest, service worker |
| Optional AI | `@google/genai` server routes; `GEMINI_API_KEY` enables live generation |

Versions are declared in [`package.json`](package.json); see the [blueprint](PROJECT_BLUEPRINT.md#technology-and-project-layout) for how each layer is used.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Live generation is optional: add `GEMINI_API_KEY` to a local `.env.local` to enable the API routes. Without a key, the client uses seeded quests and the local riddle bank.

Useful repository scripts:

| Command | Purpose |
| --- | --- |
| `npm run lint` | Run ESLint |
| `npm run seed` | Regenerate the deterministic 250-day sample JSON |
| `npm run seed:check` | Print sample-journey counts and checkpoints |
| `npm run build` | Create a production build |

There is no test script declared in `package.json`.

## Project map

- [`app/`](app/) — route pages, shared layout, API handlers, manifest, and service worker.
- [`src/components/`](src/components/) — reusable interface, animation, timer, and avatar components.
- [`src/store/useRunwayStore.ts`](src/store/useRunwayStore.ts) — persisted client state.
- [`src/lib/game/`](src/lib/game/) — scoring formulas, riddle bank, audio, and interface vocabulary.
- [`src/lib/data/`](src/lib/data/) — seeded journey, generator, validator, and illustrative cohort data.
- [`src/lib/ai/`](src/lib/ai/) — prompts used by optional generation endpoints.

## Project documents

- **[PROJECT_BLUEPRINT.md](PROJECT_BLUEPRINT.md)** — detailed product and technical guide.
- [`DEMO.md`](DEMO.md) — existing guided demo scripts.
- [`BUILDLOG.md`](BUILDLOG.md) — implementation history; treat deployment claims there as historical until independently checked.
- [`BLUEPRINT.md`](BLUEPRINT.md) — retained historical build specification, not a description of every shipped behavior.

## Current maturity

The core routes, local daily interaction, seeded journey, visual playback, optional generation endpoints, and PWA scaffolding are present in source. This is best described as a **feature-rich pitch prototype**. The static sample is not a validated behavior model, and the code does not yet provide robust request validation, identity, backup, real cohort analytics, or production-grade personal-data controls.
