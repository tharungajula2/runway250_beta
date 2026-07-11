import Card from "@/components/Card";

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-teal font-heading">
          Analytics Dashboard
        </h1>
        <p className="text-xs text-text-muted">
          Scientifically modeled retention & behavior charts.
        </p>
      </div>

      <Card variant="default">
        <h2 className="font-semibold text-sm mb-3 text-teal">Retention & Resolution</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for Recharts growth curves, retention benchmarks, and weekly heatmaps]
        </p>
      </Card>
    </div>
  );
}
