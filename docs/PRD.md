# Product requirements: GymOps Product Decision Lab

- State: `IMPLEMENTED_LOCAL_PENDING_DISTINCT_REVIEW`
- Claim ceiling: `SOTA_CANDIDATE`
- Evidence class: public role brief plus repository-owned synthetic scenarios
- External mutation: `false`

## 1. Product thesis

Product teams in vertical software often receive a proposed feature before they have a stable statement of the operating problem. This lab demonstrates a complete product-management loop: separate observations from interpretations and requests, reconstruct a versioned workflow, compare interventions, operate the selected edge cases, hand engineering a buildable contract, and preserve a canonical decision receipt.

It is an independent work sample. It does not represent an employer's present product, customer evidence, roadmap, architecture, metrics, or endorsement.

## 2. Governing constraint

No roadmap decision without replayable operator evidence, a versioned current-workflow snapshot, a bounded intervention, operational guardrails, and a reversible delivery plan. AI may accelerate synthesis and prototyping; it may not invent user evidence, set priority, or authorize release.

## 3. Synthetic scenario

The seed packet concerns a class-capacity and waitlist exception workflow spanning scheduling, attendance, membership eligibility, and communications.

- A booked member cancels.
- Capacity becomes available.
- The next waitlisted member is checked for eligibility and communication permission.
- An offer is opened for a bounded window.
- Acceptance reserves the place; expiry advances one queue position.
- Full capacity, ineligibility, absent permission, or staff pause blocks the transition with an exact reason.
- Staff can resume or reset the entirely local flow.

Three interventions are compared:

1. A timed offer advances to `PROTOTYPE_CANDIDATE` because it is bounded, reversible, and guardrailed.
2. Unlimited overbooking is `DO_NOT_BUILD` because it violates capacity and creates member and staff harm.
3. Predictive no-show scoring is `DISCOVERY_REQUIRED` because data sufficiency, consent, bias, locale policy, and monitoring are unresolved.

No option carries an unsourced return estimate or outcome claim.

## 4. Users and jobs

| Actor | Job | Product response |
|---|---|---|
| Recruiter or hiring team | Inspect product judgment in minutes | Six-route, no-login journey with working controls and receipts |
| Product manager | Separate problem evidence from requested features | Signal ledger and problem frame |
| Engineer | Implement without a discovery meeting | Goals, exclusions, transitions, edge cases, acceptance criteria, instrumentation, rollout, rollback |
| Operator | Keep workflow control under exceptions | Pause, explicit block reason, reset, and reconciliation path |
| Member | Avoid invalid or ambiguous offers | Capacity, eligibility, permission, active-token, and expiry controls |

## 5. Functional requirements

### FR-01 Signal truth

Every signal stores source class, actor, operating surface, observation, interpretation, requested solution, synthetic status, locale, confidence, timestamp, and a verified content digest.

### FR-02 Current workflow

A proposal cannot advance without a versioned, unexpired workflow snapshot linked to known signal identifiers. Unknown product behavior remains explicitly unknown.

### FR-03 Problem before solution

A requested solution must resolve to a separate problem frame with evidence, counterevidence, severity/frequency bands, non-goals, and a discovery expiry.

### FR-04 Evidence convergence

Priority requires at least two source classes and visible counterevidence. One loud request cannot satisfy the contract.

### FR-05 Actor cost

The selected intervention must assess member impact and staff/operator cost. Both receive no-harm guardrails.

### FR-06 Surface impact

Scheduling, attendance, membership, and communications dependencies must be explicit for the selected intervention.

### FR-07 Defensible priority

The comparison must contain an exact build, defer, and reject call with option-specific reasons for evidence strength, impact, fit, risk, effort, and constrained capacity.

### FR-08 Buildable specification

The handoff contains goal, scope, non-goals, current state, state transitions, at least five named edge cases, acceptance criteria, instrumentation, staged rollout, rollback, and unknowns.

### FR-09 Measurement

A baseline is sourced or `UNKNOWN`. The outcome contract contains a leading indicator plus member, operator, reliability, and support guardrails.

### FR-10 Reversibility

The selected intervention has a staff pause, bounded rollout, explicit rollback triggers, and a reconciliation procedure.

### FR-11 AI accountability

AI suggestions cite only permitted evidence identifiers or remain suggestions. The control refuses author self-approval and all external mutation.

## 6. Prototype state contract

The prototype exposes `FULL`, `PLACE_AVAILABLE`, `OFFER_ACTIVE`, `RESERVED`, `EXPIRED`, `BLOCKED_INELIGIBLE`, `BLOCKED_PERMISSION`, `BLOCKED_FULL`, `BLOCKED_PAUSED`, and `QUEUE_EXHAUSTED`.

Required executable scenarios:

- eligible acceptance before expiry;
- expiry and one-position advancement;
- membership restriction;
- missing communication permission;
- capacity remaining full;
- staff pause and explicit resume;
- wrong or stale offer token;
- duplicate or post-expiry acceptance;
- exact seed reset.

Every event records prior state, next state, exact reason code, synthetic member identifier, local minute, and `externalMutation=false`.

## 7. Non-functional requirements

- Next.js 16 App Router, strict TypeScript, Tailwind CSS, Zustand, Zod, Vitest, and Playwright.
- Pure domain engine and prototype state machine with no UI/provider dependency.
- No runtime AI, account, database, secret, analytics tracker, or external write.
- SHA-256 canonical input, control, state, and receipt digests.
- WCAG 2.2 A/AA, keyboard operation, visible focus, non-color status, reduced motion.
- No horizontal overflow at 375, 768, 1440, or 1920 pixels.
- Known-bad and clean fixtures for every rule.
- Missing rule, disabled evaluator, wrong issue code, corrupt digest, stale replay, self-approval, and locale-overreach mutations must fail.
- Two normalized runs from the same seed and rule version must be byte-identical.
- Clean exact-commit clone must reproduce install, test, and build before release.

## 8. Public source-to-requirement trace

The public role brief asks for problem discovery beneath requests, evidence-backed prioritization, precise goals and edge cases, customer judgment that AI cannot replace, end-to-end ownership, code-adjacent prototyping, and systematic AI use. The product responds through the signal ledger, three-way intervention call, state machine, specification, AI receipt, and deterministic controls.

The work sample does not establish employment tenure, B2B software tenure, industry experience, prior metric movement, customer outcomes, or employer-specific product knowledge. Those remain `UNKNOWN` rather than being inferred from the artifact.

## 9. Claim register

### IMPLEMENTED after local proof

- Synthetic signal-to-spec workflow.
- Eleven deterministic controls with paired fixtures.
- Timed waitlist state machine and recovery paths.
- Buildable specification and canonical receipt.
- Responsive no-login user journey.

### PROPOSED

- Authorized current-product evidence adapter.
- Authenticated tenancy and provider persistence.
- Live communication, membership, or scheduling integration.
- Runtime AI assistance.
- Production rollout.

### HYPOTHESIS

The workflow may improve decision clarity or reduce engineering clarification. No timed or production comparison has been performed.

### UNKNOWN

Real product behavior, customer needs, architecture, product-market fit, adoption, outcomes, willingness to pay, and productivity improvement.

## 10. Release acceptance

Release requires current dependency validation, typecheck, lint, all unit and mutation tests, production build, production dependency audit, browser journey, accessibility scan, viewport inspection, deterministic proof, contamination scan, screenshots, clean-clone reproduction, distinct-session `APPROVE`, provider binding to that reviewed commit, and anonymous desktop/mobile live smoke.

Local author proof cannot authorize release or link an application package.
