import Card from "@/components/Card";

export default function Settings() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-teal font-heading">
          Settings
        </h1>
        <p className="text-xs text-text-muted">
          Control app themes and developer configurations.
        </p>
      </div>

      <Card variant="default">
        <h2 className="font-semibold text-sm mb-3 text-teal">Preferences</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for Theme toggles, LIVE AI switches, reset tools, and persona-day select controls]
        </p>
      </Card>
    </div>
  );
}
