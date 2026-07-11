import Link from "next/link";
import Card from "@/components/Card";

export default function Onboarding() {
  return (
    <div className="flex flex-col flex-1 justify-center py-6">
      <h1 className="text-2xl font-bold tracking-tight text-teal mb-2 font-heading">
        Onboarding Setup
      </h1>
      <p className="text-xs text-text-muted mb-6 leading-relaxed">
        Let&apos;s customize your 250-day life journey.
      </p>

      <Card className="p-6 mb-8" variant="default">
        <h2 className="font-semibold text-sm mb-3">Define Your Runway</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for Pillar Audit and Character Customization]
        </p>
      </Card>

      <div className="flex justify-between items-center mt-auto gap-4">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Back to Landing
        </Link>
        <Link
          href="/today"
          className="py-2.5 px-6 rounded-xl bg-teal text-white font-semibold text-sm shadow-md hover:bg-teal-deep transition-all duration-200"
        >
          Complete Setup
        </Link>
      </div>
    </div>
  );
}
