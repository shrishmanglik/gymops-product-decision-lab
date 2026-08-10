import Link from "next/link";
import { RouteHeading } from "@/components/route-heading";
import { StatusPill } from "@/components/status-pill";
import { seedPacket } from "@/lib/data/seed";

export const metadata = { title: "Decision" };

const tone = {
  PROTOTYPE_CANDIDATE: "good",
  DISCOVERY_REQUIRED: "warn",
  DO_NOT_BUILD: "bad",
  SPEC_READY_FOR_HUMAN_REVIEW: "good",
  INDETERMINATE: "neutral",
} as const;

export default function DecisionPage() {
  return (
    <>
      <RouteHeading
        eyebrow="03 · Intervention choice"
        title="A roadmap needs a credible no."
        description="The same problem frame produces three different calls. There is no blended score, invented return estimate, or volume-based popularity shortcut."
        aside={<p className="decision-principle"><strong>Capacity rule</strong><br />Prototype one bounded option. Defer the evidence-heavy option. Reject the harmful shortcut.</p>}
      />
      <div className="content-shell">
        <div className="decision-table" role="table" aria-label="Intervention comparison">
          <div className="decision-table-head" role="row">
            <span role="columnheader">Intervention</span><span role="columnheader">Disposition</span><span role="columnheader">Evidence / Risk / Effort</span><span role="columnheader">Reason contract</span>
          </div>
          {seedPacket.interventions.map((option) => (
            <article className="decision-row" role="row" key={option.id}>
              <div role="cell"><code>{option.id}</code><h2>{option.name}</h2><p>{option.hypothesis}</p></div>
              <div role="cell"><StatusPill tone={tone[option.disposition]}>{option.disposition}</StatusPill><p>{option.reversible ? "Reversible" : "Not safely reversible"}</p></div>
              <div role="cell" className="band-stack">
                <span><small>Evidence</small><strong>{option.evidenceStrength}</strong></span>
                <span><small>Risk</small><strong>{option.operationalRisk}</strong></span>
                <span><small>Effort</small><strong>{option.effort}</strong></span>
              </div>
              <div role="cell"><ul className="reason-list">{option.reasonCodes.map((reason) => <li key={reason}><code>{reason}</code></li>)}</ul></div>
            </article>
          ))}
        </div>
        <section className="candidate-detail">
          <div>
            <p className="eyebrow">Selected intervention</p>
            <h2>Why the timed offer advances only to prototype</h2>
            <p>{seedPacket.interventions[0].hypothesis}</p>
          </div>
          <dl>
            <div><dt>In scope</dt><dd>{seedPacket.interventions[0].scope.join(" · ")}</dd></div>
            <div><dt>Excluded</dt><dd>{seedPacket.interventions[0].exclusions.join(" · ")}</dd></div>
            <div><dt>Dependencies</dt><dd>{seedPacket.interventions[0].dependencies.join(" · ")}</dd></div>
            <div><dt>Operating risks</dt><dd>{seedPacket.interventions[0].operationalRisks.join(" · ")}</dd></div>
          </dl>
          <Link className="button button-primary" href="/prototype">Operate the bounded prototype</Link>
        </section>
      </div>
    </>
  );
}
