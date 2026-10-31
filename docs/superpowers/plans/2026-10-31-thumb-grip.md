# The Call v53 anatomical thumb grip implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Make Max's right hand visibly and anatomically hold the phone and tap CHECK IN without an inverted/floating thumb.

**Architecture:** Keep the original 20-bone CC0 skinned source. Replace free 3D thumb-tip CCD with an authored, joint-limited pose that starts at the real thumb knuckle near the lower-right case, solves hover and tap once during model load, and interpolates two source-bone poses during the cinematic. Judge the whole chain with both deterministic geometry and final rendered screenshots.

**Tech Stack:** Three.js GLTFLoader, source CC0 GLB, Playwright Chromium, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-31-thumb-grip-design.md`

## Global Constraints
- The isolated preview only; production `index.html` and `game.js` unchanged.
- Locally vendored sandsound Playerhands original 20-bone skinned forearm only.
- No replacement/procedural hand and no remote runtime requests.
- No manual WASD playtest.
- Source and phone proportions preserved.

## Review Focus
1. v52 inverted thumb root -> knuckle must be below tip and outside display, with first joint in front of case.
2. v52 apparently unattached thumb -> source thumb bones must form a continuous, inward/upward chain from the visible wrist/hand.
3. Free CCD extreme bone flips -> each thumb joint must stay within a bounded angular range of its saved native rest pose.
4. Mobile scale divergence -> all geometry/skin/LCD checks must pass at 1280×720, 632×748 and 390×844.
5. Pseudo-contact with wrong image -> save/inspect paused CHECKED IN, pre-tap and tap screenshots before merge.

---

### Task 1: Make the original visual regression fail on v52

**Files**
- Modify: `scripts/smoke-playerhands-v48.mjs`

**Interfaces:** Existing `hold.hand` rig status. Extend status read-only with three thumb joint positions and joint-rest rotation deltas; validate positions, order, positive glass depth, and bounded angular pose.

- [ ] Add failing assertions for real `ThumbA` base near right edge, below `ThumbTip`; `ThumbB` between base/tip inward/up; no unrealistic tip swipe.
- [ ] Run the focused 3-layout CI on the unmodified v52 grip and confirm it fails for the owner-reported inverted thumb, not a syntax error.

### Task 2: Author the anatomical pose

**Files**
- Modify: `opening/playerhands-v48.js`

**Interfaces:** `RiggedPlayerHand.load()` computes an anchored bounded pair of source-bone `hover` and `tap` poses; `update(tap)` interpolates them. `status` exposes joint positions, pose limits and thumb-tip distance.

- [ ] Position the original `ThumbA` base at a phone-local lower-right front/edge anchor after the finger grip is oriented.
- [ ] Limit original thumb `ThumbA`/`ThumbB` rotations relative to their rest/bind quaternions while solving a hover directly above CHECK IN and a short Z press onto glass.
- [ ] Remove free per-frame CCD and interpolate only the two solved original thumb poses; keep original fingers behind the case.
- [ ] Re-run focused tests until they pass without relaxing anatomical assertions.

### Task 3: Prove the appearance and isolate production

**Files**
- Modify: `opening/phone-v45.js`, `opening/intro.js`, `review/the-call-v34/index.html` to bump v53 imports; only after image review.
- Update: `DEVELOPMENT_HANDOFF.md` after published owner-review checkpoint.

- [ ] Inspect real desktop, narrow and mobile HOLD, TAP and paused CHECKED IN captures: reject inverted or floating thumb even if CI passes.
- [ ] Run complete preview cinematic and accessibility gates and verify no remote assets/errors.
- [ ] Merge only a convincing isolated preview; verify public Pages serves v53. Leave live New Game untouched pending Max's visual approval.
- [ ] Record exact results honestly in handoff.

## Self-review
The tasks cover original attachment, thumb order, joint limits, scale layouts, screenshot review, and deployment isolation. The main risk remains original 447-vertex low-poly silhouette, which will be reviewed separately rather than concealed by IK metrics.
