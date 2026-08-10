import { RouteHeading } from "@/components/route-heading";
import { StatusPill } from "@/components/status-pill";
import { evaluatePacket } from "@/lib/engine/control-engine";
import { seedPacket } from "@/lib/data/seed";

export const metadata = { title: "Proof" };

export default function ProofPage() {
  const receipt = evaluatePacket(seedPacket);
  return (
    <>
      <RouteHeading
        eyebrow="Proof · Reproducibility"
        title="Inspect the controls, not the confidence."
        description="The clean seed passes only when every registered evaluator exists, every exact reason contract matches, source digests verify, and AI and release authority remain bounded."
        aside={<StatusPill tone={receipt.disposition === "SPEC_READY_FOR_HUMAN_REVIEW" ? "good" : "warn"}>{receipt.disposition}</StatusPill>}
      />
      <div className="content-shell proof-layout">
        <section className="proof-receipt" aria-labelledby="receipt-title">
          <div className="proof-receipt-header"><div><p className="eyebrow">Canonical receipt</p><h2 id="receipt-title">GymOpsDecisionReceipt.v1</h2></div><code>{receipt.ruleSetVersion}</code></div>
          <dl><div><dt>Input</dt><dd><code>{receipt.inputDigest}</code></dd></div><div><dt>Controls</dt><dd><code>{receipt.controlDigest}</code></dd></div><div><dt>Release authorized</dt><dd>FALSE</dd></div><div><dt>External mutation</dt><dd>FALSE</dd></div></dl>
        </section>
        <section className="control-list" aria-label="Control results">
          {receipt.results.map((result) => (
            <article key={result.id}>
              <div className="control-id"><code>{result.id}</code><StatusPill tone={result.state === "PASS" ? "good" : result.state === "FAIL" ? "bad" : "warn"}>{result.state}</StatusPill></div>
              <div><h2>{result.name}</h2><p>{result.summary}</p><code>{result.code}</code></div>
            </article>
          ))}
        </section>
        <section className="ai-proof">
          <div><p className="eyebrow">AI assistance boundary</p><h2>Suggestions are not evidence.</h2><p>AI assisted synthesis and implementation drafting from an allowed context packet. Every suggestion was reviewed against the synthetic source ledger; unsupported outcome and prediction suggestions were rejected.</p></div>
          <dl><div><dt>Citation coverage</dt><dd>{Math.round(seedPacket.aiReceipt.citationCoverage * 100)}%</dd></div><div><dt>Accepted suggestions</dt><dd>{seedPacket.aiReceipt.acceptedSuggestions.length}</dd></div><div><dt>Rejected suggestions</dt><dd>{seedPacket.aiReceipt.rejectedSuggestions.length}</dd></div><div><dt>Human disposition</dt><dd>{seedPacket.aiReceipt.humanReviewDisposition}</dd></div></dl>
        </section>
        <section className="claim-ledger">
          <div><p className="eyebrow">Public claim ceiling</p><h2>SOTA_CANDIDATE</h2></div>
          <div className="claim-columns">
            <article><StatusPill tone="good">Implemented</StatusPill><ul><li>Synthetic evidence workflow</li><li>Deterministic controls and fixtures</li><li>Functioning local prototype</li><li>Buildable specification</li></ul></article>
            <article><StatusPill tone="info">Proposed</StatusPill><ul><li>Authorized product adapter</li><li>Authenticated tenancy</li><li>Provider persistence</li><li>Production rollout</li></ul></article>
            <article><StatusPill tone="neutral">Unknown</StatusPill><ul><li>Real product behavior</li><li>Customer needs and adoption</li><li>Product outcomes</li><li>Productivity improvement</li></ul></article>
          </div>
        </section>
      </div>
    </>
  );
}
