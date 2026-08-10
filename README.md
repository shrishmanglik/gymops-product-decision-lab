# GymOps Product Decision Lab

An independent, synthetic product-management work sample for vertical software operations. It converts a replayable evidence packet into a defensible priority call, a functioning waitlist prototype, an engineer-buildable specification, and a canonical decision receipt.

## Truth boundary

This is an unaffiliated work sample. It uses repository-owned synthetic scenarios and does not represent any employer's product, customers, architecture, backlog, metrics, endorsement, or current behavior. Product outcomes and productivity effects remain `UNKNOWN`.

Runtime AI, accounts, databases, secrets, tracking, and external writes are deliberately absent. AI assisted the authoring workflow; deterministic controls and human review own every public claim and release decision.

## Recruiter journey

1. `/signals`: separate observations, interpretations, and requested solutions.
2. `/decision`: compare build, defer, and reject dispositions with reason codes.
3. `/prototype`: operate a timed class-waitlist offer through happy and blocked paths.
4. `/spec`: inspect scope, non-goals, transitions, edge cases, acceptance criteria, rollout, and rollback.
5. `/proof`: reproduce the controls, receipts, claim ceiling, and source boundaries.

## Local proof

```powershell
npm.cmd ci
npm.cmd run verify
npm.cmd run proof
npm.cmd run test:e2e
npm.cmd audit --omit=dev
```

`npm run proof` executes the same normalized seed twice and refuses to write a receipt unless the two SHA-256 digests match.

## Architecture

Next.js 16, TypeScript, Tailwind CSS, Zustand, Zod, Vitest, and Playwright. Domain rules and the prototype state machine are pure modules with no provider dependency. See [the product requirements](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), [experience contract](docs/UX-SPEC.md), and [AI workflow](docs/AI-WORKFLOW.md).

## Release state

- Claim ceiling: `SOTA_CANDIDATE`
- Source: local author branch
- Public URL: `UNKNOWN` until provider readback proves it
- Independent review: required before release
- Application action: none
