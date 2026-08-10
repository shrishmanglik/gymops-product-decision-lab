import { RouteHeading } from "@/components/route-heading";
import { StatusPill } from "@/components/status-pill";
import { seedPacket } from "@/lib/data/seed";

export const metadata = { title: "Signals" };

export default function SignalsPage() {
  return (
    <>
      <RouteHeading
        eyebrow="01 · Evidence packet"
        title="Separate the event from the request."
        description="Four repository-owned signals are deliberately mixed across support, usage, observation, and strategy. Each row keeps the observation, interpretation, and requested solution separate."
        aside={<><StatusPill tone="info">Synthetic</StatusPill><p className="aside-copy">No customer record, production event, or external system is present.</p></>}
      />
      <div className="content-shell">
        <section aria-labelledby="signal-inbox-title">
          <div className="section-label-row">
            <h2 id="signal-inbox-title">Signal inbox</h2>
            <span>{seedPacket.signals.length} traceable inputs</span>
          </div>
          <div className="signal-ledger">
            {seedPacket.signals.map((signal) => (
              <article key={signal.id} className="signal-row">
                <div className="signal-meta">
                  <StatusPill tone={signal.confidence === "HIGH" ? "good" : signal.confidence === "LOW" ? "warn" : "neutral"}>{signal.confidence}</StatusPill>
                  <code>{signal.id}</code>
                  <span>{signal.sourceClass} · {signal.actor}</span>
                  <span>{signal.surface} · {signal.locale}</span>
                </div>
                <div className="signal-columns">
                  <div><small>Observed</small><p>{signal.observation}</p></div>
                  <div><small>Interpreted</small><p>{signal.interpretation}</p></div>
                  <div><small>Requested</small><p>{signal.requestedSolution ?? "No solution was requested."}</p></div>
                </div>
                <div className="signal-digest"><span>Verified content digest</span><code>{signal.sourceDigest}</code></div>
              </article>
            ))}
          </div>
        </section>

        <section id="problem" className="problem-frame" aria-labelledby="problem-title">
          <div className="problem-number" aria-hidden="true">02</div>
          <div>
            <p className="eyebrow">Problem frame · expires {seedPacket.problem.discoveryExpiresAt.slice(0, 10)}</p>
            <h2 id="problem-title">{seedPacket.problem.job}</h2>
            <p className="problem-failure">{seedPacket.problem.observedFailure}</p>
            <dl className="frame-grid">
              <div><dt>Evidence</dt><dd>{seedPacket.problem.evidenceIds.join(", ")}</dd></div>
              <div><dt>Counterevidence</dt><dd>{seedPacket.problem.counterEvidenceIds.join(", ")}</dd></div>
              <div><dt>Frequency</dt><dd>{seedPacket.problem.frequencyBand}</dd></div>
              <div><dt>Severity</dt><dd>{seedPacket.problem.severityBand}</dd></div>
            </dl>
          </div>
          <aside>
            <h3>Not solving</h3>
            <ul>{seedPacket.problem.nonGoals.map((item) => <li key={item}>{item}</li>)}</ul>
          </aside>
        </section>

        <section className="workflow-snapshot" aria-labelledby="snapshot-title">
          <div className="section-label-row">
            <div><p className="eyebrow">Versioned current-state model</p><h2 id="snapshot-title">Workflow snapshot {seedPacket.workflow.version}</h2></div>
            <StatusPill tone="warn">Synthetic model</StatusPill>
          </div>
          <ol>{seedPacket.workflow.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
          <div className="unknowns"><strong>Unknowns preserved</strong><ul>{seedPacket.workflow.unknowns.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </section>
      </div>
    </>
  );
}
