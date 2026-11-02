# Mall masterplan v66 implementation plan

**Goal:** deliver a reviewable floorplan/graybox and machine-checked world contract without altering live chapters.

## Task A — Contract tests (RED)
- Write `scripts/test-mall-masterplan-v66.mjs` first with explicit expected facade doors, footprints, floors, physically adjacent portals, chapter traversals, evidence nodes, and gate rules.
- Run on CI against stubs and confirm expected assertion failures.

## Task B — Spatial model (GREEN)
- Implement `mall/masterplan-v66.mjs`, pure ES module, no browser dependencies.
- Define room rectangles, portal connections with floor-change types, landmarks, doors and six ordered chapter routes.
- Implement pathfinding and integrity validation. Rerun Node suite.

## Task C — Visual inspection artifact
- Add `review/mall-masterplan-v66/index.html` and `main.js`. Show all three drawn-to-scale floor plans and local Three.js 3D massing with chapter path highlights.
- Support selected floor, chapter, room details and hover/click. Add deterministic readiness hook for automation.
- Keep files review-only: `game.js`, `index.html`, `opening/*` unchanged.

## Task D — Reproducible verification
- Add `scripts/smoke-mall-masterplan-v66.mjs`: Playwright Chromium desktop/mobile screenshots, all floors/chapter routes, no script failures/third-party runtime calls.
- Add scoped GitHub Action with Node unit tests, syntax tests, Playwright capture, artifacts.
- CI and artifact review before merging. Preserve live game and Pages until approved migration.

## Subsequent migration (not part of v66)
- Decompose generated old-room carving into one new unified world builder; replace meshes with licensed PBR art; then transition Chapters 1–6 in order with deterministic evidence, endings, AI and saves checked at every phase.