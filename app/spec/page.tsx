import { RouteHeading } from "@/components/route-heading";
import { StatusPill } from "@/components/status-pill";
import { seedPacket } from "@/lib/data/seed";

export const metadata = { title: "Buildable Spec" };

const sections = [
  ["Goal", [seedPacket.spec.goal]],
  ["Scope", seedPacket.spec.scope],
  ["Non-goals", seedPacket.spec.nonGoals],
  ["Current state", seedPacket.spec.currentState],
  ["State transitions", seedPacket.spec.transitions],
  ["Edge cases", seedPacket.spec.edgeCases],
  ["Acceptance criteria", seedPacket.spec.acceptanceCriteria],
  ["Instrumentation", seedPacket.spec.instrumentation],
  ["Rollout", seedPacket.spec.rollout],
  ["Rollback", seedPacket.spec.rollback],
  ["Unknowns", seedPacket.spec.unknowns],
] as const;

export default function SpecPage() {
  return (
    <>
      <RouteHeading
        eyebrow="05 · Engineering handoff"
        title="A spec that names what breaks."
        description="Goals and happy paths are not enough. This contract carries exclusions, transitions, failure states, instrumentation, staged rollout, rollback, and unresolved product questions."
        aside={<StatusPill tone="warn">Human review required</StatusPill>}
      />
      <div className="content-shell spec-layout">
        <aside className="spec-index" aria-label="Specification sections">
          <p className="eyebrow">Contract index</p>
          <ol>{sections.map(([name], index) => <li key={name}><a href={`#spec-${index + 1}`}><span>{String(index + 1).padStart(2, "0")}</span>{name}</a></li>)}</ol>
        </aside>
        <div className="spec-document">
          <div className="spec-cover">
            <code>SPEC / TIMED-WAITLIST-OFFER / 1.0.0</code>
            <h2>Bounded class-place recovery</h2>
            <p>Implementation candidate based entirely on a synthetic workflow. Provider contracts, real rules, baselines, and production behavior remain unknown.</p>
          </div>
          {sections.map(([name, items], index) => (
            <section key={name} id={`spec-${index + 1}`} className="spec-section">
              <div className="spec-section-number">{String(index + 1).padStart(2, "0")}</div>
              <div><h2>{name}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
            </section>
          ))}
          <section className="outcome-contract">
            <div><p className="eyebrow">Outcome contract</p><h2>Measure without inventing the baseline.</h2><p>{seedPacket.outcome.baseline}</p></div>
            <div className="guardrail-grid">{Object.entries(seedPacket.outcome.guardrails).map(([name, value]) => <article key={name}><strong>{name}</strong><p>{value}</p></article>)}</div>
          </section>
        </div>
      </div>
    </>
  );
}
