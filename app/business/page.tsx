import Card from "@/components/Card";

export default function Business() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-teal font-heading">
          Monetization & Pitch
        </h1>
        <p className="text-xs text-text-muted">
          Sustainable business models & target markets.
        </p>
      </div>

      <Card variant="default">
        <h2 className="font-semibold text-sm mb-3 text-teal">India-First Pricing Strategy</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for competitors comparison, seasonal pricing, and UPI autopay rationale]
        </p>
      </Card>
    </div>
  );
}
