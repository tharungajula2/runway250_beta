import Card from "@/components/Card";
import PageTransition from "@/components/PageTransition";

export default function Business() {
  return (
    <PageTransition>
      <div className="flex flex-col gap-6 py-6 text-left max-w-xl mx-auto w-full">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-teal font-heading">
            Business & Monetization
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Proposed India-first unit economics and competitor anchors.
          </p>
        </div>

        {/* Rationale Callout */}
        <Card variant="pixel" className="p-5 bg-teal/5 border-teal flex flex-col gap-2">
          <h2 className="text-sm font-bold text-teal font-heading">India-First Pricing Rationale</h2>
          <p className="text-xs text-text-muted leading-relaxed">
            UPI is India&apos;s default payment rail (~640M+ daily transactions, ~84% of digital payments). However, consumer willingness to pay recurring monthly fees is historically low. Consumer research indicates Indian users heavily reject small recurring fees and respond far better to annual/seasonal pricing structures and one-time purchases with visible value.
          </p>
          <div className="mt-1 text-[10px] text-teal-deep font-bold font-mono">
            → Decision: Leverage UPI Autopay for upfront annual seasons and one-time founder options, avoiding monthly SaaS fatigue.
          </div>
        </Card>

        {/* Honesty / Proposed Tag */}
        <Card variant="surface" className="p-4 border-amber-500/20 bg-amber-500/5 text-xs text-text-muted">
          <span className="font-bold text-amber-700 uppercase tracking-wider block mb-1">Demonstration Disclosure</span>
          These price points and business model options are <span className="font-bold text-text-primary">proposed and not yet validated</span> in production. All metrics are illustrative targets.
        </Card>

        {/* Model Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Monetization Model Options</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Card variant="default" className="p-4 flex flex-col gap-1">
              <h4 className="font-bold text-xs text-teal">1. Freemium with Premium &quot;Seasons&quot;</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every 250-day habit cycle constitutes a &quot;Season.&quot; The baseline season is free. Premium seasons unlock unique narrative themes, visual avatar variations, and advanced AI quest personalization.
              </p>
            </Card>

            <Card variant="default" className="p-4 flex flex-col gap-1">
              <h4 className="font-bold text-xs text-teal">2. One-Time &quot;Founder&quot; Lifetime Access</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                For early adopters, a one-time purchase grants lifetime access to all future seasons and unlimited AI quest generation, creating immediate cash-flow validation.
              </p>
            </Card>

            <Card variant="default" className="p-4 flex flex-col gap-1">
              <h4 className="font-bold text-xs text-teal">3. B2B Corporate Wellness Partnerships</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Sponsor licenses for teams and companies looking for clean, non-compulsive, focus-centric wellness tools for employees to counter burnout.
              </p>
            </Card>
          </div>
        </div>

        {/* Proposed Pricing Tiers */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Proposed India Price Points</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Card variant="default" className="p-4 border-teal/20 text-center flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-muted">Premium Season Arc</span>
                <div className="text-2xl font-black text-teal font-heading my-1">₹499</div>
                <span className="text-[9px] font-semibold text-teal-deep bg-teal/10 px-2 py-0.5 rounded font-mono">
                  PROPOSED
                </span>
              </div>
              <p className="text-[10px] text-text-muted mt-3 leading-relaxed">
                Per 250-day custom themed expansion pack.
              </p>
            </Card>

            <Card variant="pixel" className="p-4 border-teal text-center flex flex-col justify-between bg-teal/5">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal">Founder Lifetime</span>
                <div className="text-2xl font-black text-teal font-heading my-1">₹199</div>
                <span className="text-[9px] font-semibold text-teal bg-teal/20 px-2 py-0.5 rounded font-mono">
                  EARLY BIRD
                </span>
              </div>
              <p className="text-[10px] text-text-muted mt-3 leading-relaxed">
                One-time payment for the initial proof-of-concept run.
              </p>
            </Card>
          </div>
        </div>

        {/* Competitor Price Anchors */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Competitor Price Anchors</h3>
          
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-xl bg-white dark:bg-dark-surface">
            <table className="min-w-full divide-y divide-[var(--border-color)] text-[11px] leading-relaxed">
              <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">App</th>
                  <th className="px-3 py-2 text-left">Core Mechanic</th>
                  <th className="px-3 py-2 text-left">Monetization</th>
                  <th className="px-3 py-2 text-left">Shortcoming</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-text-muted">
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Finch</td>
                  <td className="px-3 py-2.5">Self-care mascot</td>
                  <td className="px-3 py-2.5">Finch Plus: $9.99/mo or $69.99/yr</td>
                  <td className="px-3 py-2.5">High Western SaaS pricing; mascot growth is one step removed.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Habitica</td>
                  <td className="px-3 py-2.5">RPG game layer</td>
                  <td className="px-3 py-2.5">$4.99/mo subscription</td>
                  <td className="px-3 py-2.5">High complexity; gamification can become distracting.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-bold text-text-primary">Forest</td>
                  <td className="px-3 py-2.5">Focus timer</td>
                  <td className="px-3 py-2.5">One-time / IAP</td>
                  <td className="px-3 py-2.5">Single-use focus utility, not a habit lifestyle system.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
