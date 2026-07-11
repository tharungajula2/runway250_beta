"use client";

import Link from "next/link";
import Card from "@/components/Card";
import PixelAvatar from "@/components/PixelAvatar";
import PageTransition from "@/components/PageTransition";

import { LEXICON } from "@/lib/game/lexicon";

export default function Home() {
  return (
    <PageTransition>
      <div className="flex flex-col flex-1 justify-center py-8 gap-8">
        {/* Hero Header */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-teal font-heading">
            Runway 250
          </h1>
          <p className="text-sm font-semibold tracking-wider text-teal-deep uppercase">
            {LEXICON.subtitle}
          </p>
          <p className="text-base text-text-muted max-w-md mx-auto leading-relaxed mt-2">
            On Day 1, you cannot see yourself. Every day you show up for your real life, you render your avatar into high definition.
          </p>
        </div>

        {/* Side-by-Side Preview */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
          {/* Day 1 Blurry Preview */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-text-muted">Day 1: Blurry Outline</span>
            <PixelAvatar resolutionPct={15} size={112} />
          </div>

          {/* Day 250 Crisp Preview */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-teal">Day 250: Rendered</span>
            <PixelAvatar resolutionPct={98} size={112} />
          </div>
        </div>

        {/* The Three Anti-Attention Promises */}
        <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
          <h3 className="text-xs font-bold text-teal-deep uppercase tracking-wider text-center">
            The Anti-Attention Promises
          </h3>
          
          <Card variant="surface" className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2">
              <span className="text-teal font-extrabold text-base">①</span>
              <h4 className="font-bold text-sm text-teal font-heading">10-Minute Session Cap</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed pl-6">
              The daily loop soft-locks after you check off and reflect. No infinite scrolls, no retention loops.
            </p>
          </Card>

          <Card variant="surface" className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2">
              <span className="text-teal font-extrabold text-base">②</span>
              <h4 className="font-bold text-sm text-teal font-heading">Intrinsic Rewards Only</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed pl-6">
              The prize is watching your own avatar gain resolution—not winning artificial points, badges, or cosmetic items.
            </p>
          </Card>

          <Card variant="surface" className="flex flex-col gap-1 p-4">
            <div className="flex items-center gap-2">
              <span className="text-teal font-extrabold text-base">③</span>
              <h4 className="font-bold text-sm text-teal font-heading">Shields</h4>
            </div>
            <p className="text-xs text-text-muted leading-relaxed pl-6">
              Shields absorb missed days automatically. Designed to bend, not break your momentum.
            </p>
          </Card>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-2 flex flex-col items-center">
          <Link
            href="/onboarding"
            className="w-full max-w-xs py-3 px-6 rounded-xl bg-teal text-white font-semibold text-sm shadow-md hover:bg-teal-deep transition-all duration-200"
          >
            Enter the Runway
          </Link>
          <span className="text-[10px] text-text-muted mt-2">
            Takes ~2 minutes • Runs locally
          </span>
        </div>
      </div>
    </PageTransition>
  );
}
