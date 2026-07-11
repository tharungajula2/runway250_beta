import Link from "next/link";
import Card from "@/components/Card";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center py-10 text-center">
      <h1 className="text-4xl font-black tracking-tight text-teal mb-4 font-heading">
        Runway 250
      </h1>
      <p className="text-text-muted max-w-sm mb-8 text-sm leading-relaxed">
        On Day 1 you can&apos;t see yourself. Over 250 days, your real life renders you into focus.
      </p>
      
      <Card className="w-full max-w-md p-6 mb-8 text-left" variant="default">
        <h2 className="font-semibold text-md mb-3 text-teal">The Anti-Attention Promises</h2>
        <ul className="text-xs text-text-muted space-y-2 list-none pl-0">
          <li className="flex items-start gap-2">
            <span className="text-teal font-bold">✓</span>
            <span>Daily loop soft-locks after logging, enforcing boundaries</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal font-bold">✓</span>
            <span>No infinite content feeds, leaderboards, or variable-ratio rewards</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal font-bold">✓</span>
            <span>Designed for deliberate, short sessions of under 10 minutes</span>
          </li>
        </ul>
      </Card>

      <Link
        href="/onboarding"
        className="w-full max-w-xs py-3 px-6 rounded-xl bg-teal text-white font-semibold shadow-md hover:bg-teal-deep transition-all duration-200"
      >
        Enter the Runway
      </Link>
    </div>
  );
}
