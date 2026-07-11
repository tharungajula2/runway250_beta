import Card from "@/components/Card";

export default function About() {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-teal font-heading">
          About Runway 250
        </h1>
        <p className="text-xs text-text-muted">
          The behavior science and story behind the project.
        </p>
      </div>

      <Card variant="default">
        <h2 className="font-semibold text-sm mb-3 text-teal">The Science Basis</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          [Placeholder for behavioral research findings, self-determination theory, and founder bio]
        </p>
      </Card>
    </div>
  );
}
