"use client";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { useLabStore } from "@/lib/store/lab-store";
import { stateDigest, type ScenarioId } from "@/lib/prototype/waitlist-machine";

const scenarios: Array<{ id: ScenarioId; label: string; purpose: string }> = [
  { id: "happy", label: "Happy path", purpose: "Eligible member accepts before expiry" },
  { id: "expiry", label: "Expiry", purpose: "Deadline advances to the next member" },
  { id: "ineligible", label: "Ineligible", purpose: "Membership restriction blocks offer" },
  { id: "no-permission", label: "No permission", purpose: "Communication boundary blocks offer" },
  { id: "full", label: "Full", purpose: "No released capacity blocks offer" },
  { id: "paused", label: "Staff pause", purpose: "Human pause stops progression" },
];

function tone(status: string) {
  if (status === "RESERVED") return "good" as const;
  if (status.startsWith("BLOCKED") || status === "EXPIRED") return "warn" as const;
  return "info" as const;
}

export function PrototypeLab() {
  const { scenario, waitlist, setScenario, step, togglePause, reset, seedStateDigest } = useLabStore();
  const currentDigest = stateDigest(waitlist);
  const active = waitlist.activeOffer;
  return (
    <div className="prototype-layout">
      <aside className="scenario-panel" aria-label="Prototype scenarios">
        <p className="eyebrow">Scenario controls</p>
        {scenarios.map((item) => (
          <button key={item.id} className={scenario === item.id ? "scenario active" : "scenario"} onClick={() => setScenario(item.id)} aria-pressed={scenario === item.id}>
            <strong>{item.label}</strong><small>{item.purpose}</small>
          </button>
        ))}
        <div className="scenario-boundary"><strong>Local-only boundary</strong><p>No message is sent. No account, member record, or class is written.</p></div>
      </aside>
      <div className="machine-panel">
        <div className="machine-toolbar">
          <div><p className="eyebrow">Timed offer state machine</p><h2>Saturday Fundamentals · 10:00</h2></div>
          <StatusPill tone={tone(waitlist.status)}>{waitlist.status}</StatusPill>
        </div>
        <div className="capacity-track" aria-label={`${waitlist.booked} of ${waitlist.capacity} places booked`}>
          <div className="capacity-label"><span>Class capacity</span><strong>{waitlist.booked} / {waitlist.capacity}</strong></div>
          <div className="capacity-cells" aria-hidden="true">{Array.from({ length: waitlist.capacity }, (_, index) => <span key={index} className={index < waitlist.booked ? "booked" : "open"} />)}</div>
        </div>
        <section className="queue-board" aria-labelledby="queue-title">
          <div className="queue-head"><h3 id="queue-title">Waitlist lane</h3><span>Minute {waitlist.nowMinute}</span></div>
          <ol>
            {waitlist.queue.map((member, index) => {
              const isActive = active?.memberId === member.id;
              const isPast = index < waitlist.cursor;
              return (
                <li key={member.id} className={isActive ? "queue-member active" : isPast ? "queue-member past" : "queue-member"}>
                  <span className="queue-order">{index + 1}</span>
                  <div><strong>{member.label}</strong><small>{member.id}</small></div>
                  <div className="member-checks"><span data-pass={member.eligible}>eligibility</span><span data-pass={member.communicationPermission}>permission</span></div>
                  <div className="offer-state">{isActive ? <><strong>{active.expiresAtMinute - waitlist.nowMinute} min</strong><small>offer active</small></> : isPast ? <small>processed</small> : <small>waiting</small>}</div>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="machine-actions">
          <Button onClick={step} data-testid="primary-step">Run next valid transition</Button>
          <Button variant="secondary" onClick={togglePause}>{waitlist.paused ? "Resume workflow" : "Pause workflow"}</Button>
          <Button variant="ghost" onClick={reset}>Reset exact seed</Button>
        </div>
        <section className="event-receipt" aria-live="polite" aria-label="Canonical transition receipt">
          <div className="event-receipt-head"><h3>Transition receipt</h3><code>{currentDigest}</code></div>
          {waitlist.events.length === 0 ? <p className="empty-state">No transition yet. Run the next valid transition to create a local receipt.</p> : (
            <ol>{[...waitlist.events].reverse().map((event) => <li key={event.sequence}><span>{String(event.sequence).padStart(2, "0")}</span><strong>{event.action}</strong><code>{event.from} → {event.to}</code><small>{event.reason}</small></li>)}</ol>
          )}
          <div className="digest-proof"><span>Exact seed restored</span><strong>{currentDigest === seedStateDigest && waitlist.events.length === 0 ? "YES" : "NO"}</strong><span>External mutation</span><strong>FALSE</strong></div>
        </section>
      </div>
    </div>
  );
}
