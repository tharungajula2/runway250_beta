import Card from "@/components/Card";
import SessionTimer from "@/components/SessionTimer";

export default function Today() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-teal font-heading">
            Daily Loop
          </h1>
          <p className="text-xs text-text-muted">
            Day 1 of 250 • Boot Sequence
          </p>
        </div>
      </div>

      <SessionTimer />

      <Card variant="default">
        <h2 className="font-semibold text-sm mb-3 text-teal">Today&apos;s Quests</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for Quest Master lists, quest completion, reflection entry, and resolution-gain animations]
        </p>
      </Card>
    </div>
  );
}
