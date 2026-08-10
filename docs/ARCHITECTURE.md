# Architecture

## System boundary

The public product is a static-first Next.js application. All scenario data is repository-owned and synthetic. Evaluation and prototype transitions execute locally using pure TypeScript functions. There is no persistence adapter, external API call, runtime model call, account, secret, or employer system.

```text
Repository seed
    |
    +-- Zod schemas --> parsed DecisionPacket
    |                         |
    |                         +-- 11 deterministic evaluators
    |                         |        |
    |                         |        +-- canonical decision receipt
    |                         |
    |                         +-- route projections
    |
    +-- waitlist seed --> pure state machine --> canonical transition receipt
```

## Module ownership

| Module | Responsibility | Forbidden dependency |
|---|---|---|
| `lib/domain/schema.ts` | Runtime and compile-time contracts | UI, provider, persistence |
| `lib/data/seed.ts` | Synthetic signal/workflow/problem/spec packet | Network, environment values |
| `lib/engine/canonical.ts` | Key-sorted serialization and SHA-256 | Mutable clock, random values |
| `lib/engine/control-engine.ts` | Rule registry, exact reason contracts, receipt verification | UI state, provider response |
| `lib/prototype/waitlist-machine.ts` | Capacity, offer, expiry, pause, recovery transitions | Browser API, real member data |
| `lib/store/lab-store.ts` | Ephemeral route-level demo state | Persistence, external writes |
| `app/*` and `components/*` | Accessible product explanation and controls | Business-rule decisions |

## Determinism contract

Canonical serialization recursively sorts object keys and preserves array order. SHA-256 covers the normalized packet, control result list, and prototype state. Identical input plus the same `GO-1.0.0` rule set must produce byte-identical output. No current time, locale formatter, random value, browser fingerprint, or provider value enters the receipt.

The offer token is derived from the synthetic member identifier, queue position, and local scenario minute. It is not an authentication token and never leaves local state.

## Rule integrity

The registry expects exactly eleven rule identifiers. A missing rule or undefined evaluator produces `INDETERMINATE`, never pass. Each identifier is bound to one canonical failure code outside the evaluator. Substituting a different code produces `EVALUATOR_CONTRACT_BREACH`; therefore a rejection for an adjacent reason cannot satisfy the intended check.

The receipt verifier independently recomputes packet and result digests. A receipt from another packet returns `STALE_RECEIPT_REPLAY`; a modified result list returns `CONTROL_DIGEST_MISMATCH`.

## Waitlist invariants

1. `booked` never exceeds `capacity`.
2. An offer requires an available place, eligible member, communication permission, and inactive staff pause.
3. Only the current unexpired token can reserve a place.
4. Expiry advances exactly one cursor position before the next offer evaluation.
5. Blocked members remain visible with a reason and require a staff skip.
6. Reset constructs a fresh repository seed; it does not reverse events imperatively.
7. Every event has `externalMutation=false`.

## Security and privacy

- No personal data, browser storage, cookies, analytics, environment values, or external requests.
- Synthetic identifiers are visibly prefixed and cannot be confused with customer records.
- React escapes displayed strings; no raw HTML injection exists.
- Source defines a same-origin content policy, clickjacking protection, MIME hardening, no-referrer policy, and disabled camera, microphone, and geolocation permissions. Browser tests verify the local production response; the release lane must still read the deployed headers back from the provider object.
- Dependency audit is a release gate, not an assertion from this document.

## Recovery

The user can pause progression or reset the local seed at any time. A future real adapter is only `PROPOSED`. Its minimum contract would require idempotency, authorization, jurisdiction rules, concurrency handling, reconciliation, audit retention, and a provider-tested rollback before this architecture permits an external mutation.

## Toolchain compatibility receipt

The registry-current TypeScript 7.0.2 compiler completed typecheck, but the TypeScript ESLint integration bundled by the registry-current Next.js 16.3.0 lint configuration explicitly rejects the TypeScript 7 compiler API and points to pending support work. ESLint 10.8.1 also exceeds the peer range of the React, import, and accessibility plugins bundled by that Next.js configuration and crashes inside their rule API. The project therefore uses TypeScript 6.0.3 and ESLint 9.39.5, the newest compatible published releases reported by the registry resolver, while retaining current Next.js 16.3.0, React 19.2.8, and the rest of the validated toolchain. These are measured compatibility ceilings, not stale version guesses.
