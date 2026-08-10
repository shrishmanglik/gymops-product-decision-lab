import Link from "next/link";
import { StageMap } from "@/components/stage-map";
import { StatusPill } from "@/components/status-pill";
import { evaluatePacket } from "@/lib/engine/control-engine";
import { seedPacket } from "@/lib/data/seed";

export default function HomePage() {
  const receipt = evaluatePacket(seedPacket);
  return (
    <>
      <section className="hero page-shell">
        <div className="hero-copy">
          <div className="hero-flags">
            <StatusPill tone="info">Independent work sample</StatusPill>
            <StatusPill tone="neutral">Synthetic evidence only</StatusPill>
          </div>
          <p className="eyebrow">Vertical software product practice</p>
          <h1>Turn a messy request into a decision engineering can trust.</h1>
          <p className="hero-lede">
            Replay the evidence, challenge three interventions, operate a timed waitlist offer,
            and inspect the specification and receipt that keep the final call human-owned.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/signals">Open the synthetic evidence packet</Link>
            <Link className="text-link" href="/prototype">Jump to the functioning prototype <span aria-hidden="true">→</span></Link>
          </div>
          <p className="truth-note">
            This lab does not represent a real company&apos;s product, customer evidence, architecture, backlog, or results.
          </p>
        </div>
        <aside className="control-preview" aria-label="Current control receipt summary">
          <div className="preview-header">
            <span>CONTROL RECEIPT / GO-1.0.0</span>
            <StatusPill tone={receipt.disposition === "SPEC_READY_FOR_HUMAN_REVIEW" ? "good" : "warn"}>
              {receipt.disposition}
            </StatusPill>
          </div>
          <div className="receipt-digest">
            <small>Input digest</small>
            <code>{receipt.inputDigest}</code>
          </div>
          <div className="control-tally">
            <strong>{receipt.results.filter((result) => result.state === "PASS").length}</strong>
            <span>of 11 fail-closed controls pass on the clean seed</span>
          </div>
          <div className="mini-rules" aria-hidden="true">
            {receipt.results.map((result) => <span key={result.id} className={result.state === "PASS" ? "passed" : "failed"}>{result.id.replace("GO-", "")}</span>)}
          </div>
          <p>Passing controls prepare a decision for human review. They never authorize release.</p>
        </aside>
      </section>
      <section className="workflow-section page-shell">
        <div className="section-heading">
          <p className="eyebrow">The full loop, not a static mock</p>
          <h2>Five inspectable handoffs from evidence to measurement</h2>
        </div>
        <StageMap />
      </section>
      <section className="constraint-band">
        <div className="page-shell constraint-inner">
          <p className="eyebrow">Governing constraint</p>
          <blockquote>No roadmap decision without replayable operator evidence, a versioned workflow snapshot, a bounded intervention, operational guardrails, and a reversible delivery plan.</blockquote>
          <p>AI may accelerate synthesis and prototyping. It may not invent user evidence, set priority, or authorize release.</p>
        </div>
      </section>
    </>
  );
}
