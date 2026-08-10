# Author-side visual preparation review

- State: `PASS_PENDING_DISTINCT_REVIEW`
- Scope: post-build screenshots from Chromium at 1440 by 1000 and 390 by 844
- Generated evidence: `evidence/screenshots/`

This is author preparation, not independent release review.

## Images inspected

- `home-desktop.png`
- `signals-desktop.png`
- `decision-desktop.png`
- `prototype-desktop.png`
- `spec-desktop.png`
- `proof-desktop.png`
- `home-mobile.png`
- `prototype-mobile.png`

## Findings and corrections

1. The initial dark-section eyebrow color failed automated contrast. It now uses the high-contrast lime token and the WCAG scan passes.
2. The initial 375-pixel proof page overflowed because long control content did not permit a grid child to shrink. All code strings now wrap and every tested width fits.
3. The initial mobile workflow heading compressed its eyebrow into a narrow vertical column. The section heading now stacks normally below 600 pixels.
4. The contract-aligned twelve control cards fill six complete rows on wide screens and return to one column on mobile. The odd-card fallback applies only when the final card is actually odd, so it cannot manufacture an empty cell beside card eleven.
5. Chromium full-page capture tiled sticky navigation and index surfaces at intermediate scroll positions. The evidence-only capture freezes those surfaces and the skip link while interactive browser tests continue to exercise the production sticky behavior and focusable skip link.
6. A clean clone of pre-fix commit `084ecc2` changed `prototype-desktop.png`. A known-positive RGB comparator measured 17,197 changed pixels, bounded to `(411,1016)-(659,1102)`, which is the primary-action button rather than PNG metadata or page geometry. Clicking the button, then scrolling to the top, removed hover and left its 160 ms transform/background transition in flight during capture. The evidence boundary now disables transitions before pointer evacuation and scrolling, waits for fonts and two paint frames, and asserts that the button is not hovered, has no transform, and has zero transition duration.
7. A mutation control removed the transition freeze. The capture failed before writing the prototype image with `transform: matrix(1, 0, 0, 1, 0, -9.70475e-06)` and `transitionDuration: 0.16s, 0.16s`, while the restored control passed. The pinned PNG encoder and static evidence-only sticky surfaces remain in place.
8. Contract alignment changed the home tally to 12, filled the proof grid to six complete rows, added the waitlist-transition control, and exposed the matching-token acceptance criterion in the specification. Fresh desktop and mobile images remain unclipped, balanced, and readable; the proof page has no manufactured empty card cell.

## Final geometry review

- No clipping, overlap, orphaned label, or horizontal overflow is visible.
- Primary actions remain reachable and visually distinct.
- The capacity lane, member order, eligibility/permission states, offer deadline, event receipt, and no-write boundary remain legible at both captured viewports.
- Long digests and exact reason codes wrap inside their containers.
- Navigation is complete at mobile width and exposes all five routes without truncation.
- Empty, active, blocked, expired, reserved, recovered, indeterminate, and human-review states use text in addition to color.
- Typography, whitespace, and hierarchy remain consistent across the six-route journey.

Final author-side verdict: `PASS_PENDING_DISTINCT_REVIEW`.
