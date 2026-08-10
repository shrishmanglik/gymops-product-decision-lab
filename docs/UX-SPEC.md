# Experience specification

## Design intent

The experience is an operations board, not a generic analytics dashboard. Schedule lanes, capacity cells, queue positions, reason codes, and state receipts carry the product meaning. The visual system uses an original deep-navy, paper, cyan, lime, and amber palette. It contains no employer logo, screenshot, trade dress, or implied affiliation.

## Three-minute journey

| Time | Route | User outcome |
|---|---|---|
| 0 to 25 seconds | `/` | Understands the independent synthetic boundary and opens the packet |
| 25 to 65 seconds | `/signals` | Distinguishes observations, interpretations, requests, counterevidence, and unknowns |
| 65 to 110 seconds | `/decision` | Sees exact build, defer, and reject reasons |
| 110 to 155 seconds | `/prototype` | Operates happy and blocked transitions |
| 155 to 180 seconds | `/spec` | Inspects implementation and rollback contracts |
| Optional | `/proof` | Verifies controls, digests, AI boundary, and claim ceiling |

## Route contracts

### `/`

- One primary action: open the evidence packet.
- Disclosure appears before any outcome or capability statement.
- Clean-seed control receipt shows preparation for human review, never release approval.
- Signal-to-problem-to-intervention-to-edge-case-to-measurement map exposes the full method.

### `/signals`

- Each row presents observed, interpreted, and requested content in separate columns.
- Source class, actor, surface, locale, confidence, identifier, and digest are visible.
- The problem frame preserves counterevidence, expiry, non-goals, and product unknowns.

### `/decision`

- Three interventions align in one comparison matrix at wide viewports and remain legible in a stacked layout on mobile.
- Disposition is encoded by words, not color alone.
- The reject row carries the capacity constraint explicitly.

### `/prototype`

- Six scenarios are reachable by keyboard buttons.
- The primary action runs one valid product transition; it never jumps to a decorative final state.
- Capacity cells, queue order, member checks, offer deadline, state, event trail, reset proof, and no-write boundary remain visible.
- Event updates use an `aria-live` region without moving keyboard focus.

### `/spec`

- A sticky section index supports rapid review on desktop and becomes inline on small viewports.
- Eleven specification sections carry goals through unknowns.
- The outcome contract visually separates its four no-harm guardrails.

### `/proof`

- Canonical input and control digests precede control claims.
- All twelve control results expose rule identifier, state, exact code, and plain-language meaning.
- AI assistance, claim ceiling, implemented scope, proposals, and unknowns remain distinct.

## State language

Required visible states are pending, active, blocked, expired, reserved, indeterminate, recovered, and ready for human review. No state relies on color alone. Empty event history has an instructional empty state rather than a blank panel.

## Accessibility

- Semantic landmarks, one page-level heading, ordered workflows, tables/definitions where relationships matter.
- Skip link, visible three-pixel focus treatment, at least 44-pixel primary targets.
- Native buttons and links; no clickable generic containers.
- WCAG A/AA automated scan on all six routes in desktop and mobile browser projects.
- Reduced-motion media rule and no essential animation.
- Text equivalents for capacity and status visuals.

## Responsive inspection

The release lane must inspect 375, 768, 1440, and 1920 pixels for horizontal overflow, clipped reason codes, navigation reachability, queue-row wrapping, receipt digest wrapping, whitespace, and typography. Automated width proof supplements but does not replace screenshot review.
