import Card from "@/components/Card";

export default function Journey() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-teal font-heading">
          Journey & Scrubber
        </h1>
        <p className="text-xs text-text-muted">
          Watch yourself come into focus.
        </p>
      </div>

      <Card variant="default">
        <h2 className="font-semibold text-sm mb-3 text-teal">Resolution Engine</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for Evolving Avatar Canvas and Day 1 → 250 Scrubber Slider]
        </p>
      </Card>
    </div>
  );
}
