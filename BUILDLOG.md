# Runway 250 - Build Log

## Phase 0: Scaffold and Dependency Installation
- **Built**: Verified Node version (v22.14.0 >= v20.9). Next.js 16.2.10 project was verified as scaffolded in the repository root. Installed dependencies specified in §1.1 (`zustand`, `recharts`, `lucide-react`, `framer-motion`, `@google/genai`, `@serwist/next`, `serwist`). Created `.env.local` with empty `GEMINI_API_KEY` placeholder. Staged all files and made the initial git commit.
- **Decisions**: Preserved the existing root scaffolding and package structure to maintain directory cleanliness, directly installing all required UI, animation, charting, PWA, and AI SDKs in the project root. Verified `.env.local` is ignored via the existing `.env*` rule in `.gitignore`.
- **Note**: Dev server is configured to boot.

## Phase 1: Design System and Layout
- **Built**: Implemented full design token set in Tailwind v4 `app/globals.css`, supporting primary teal, deep teal, warm paper background, dark mode overrides, and a faint 24px pixel-grid background motif. Established Geist for headings and Inter for body via Next.js native font loaders (offline-safe). Built global app shell in `app/layout.tsx` featuring a centered max-width 520px column layout, bottom navigation with Lucide-react icons, and a persistent footer with the simulation badge. Built shared components: `Card` (with default, surface, and pixel styles), `SimulationBadge`, `MilestoneBadge`, `LiveAIChip`, `SessionTimer` (persistent countdown via Zustand), and `ThemeProvider` (class-based dark mode). Added placeholder pages for every route.
- **Decisions**: Set up a custom `paths` alias mapping in `tsconfig.json` to enable clean `@/components/*` and `@/store/*` imports while keeping the `app/` folder at the root. Decided to conditionally hide the navigation bar on the Landing (`/`) and Onboarding (`/onboarding`) screens to keep the pitch-deck setup flow clean and self-contained. Used a small head script in `app/layout.tsx` to read the theme preference from local storage before rendering, preventing any screen flash on load.

