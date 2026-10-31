# The Call Natural Right-Hand Grip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-rig the source CC0 forearm into a plausible right-hand phone grip without covering the screen.

**Architecture:** Bind the palm anchor in phone-local space; align fingers up and slightly behind the right edge; curl weighted finger chains; solve the thumb with joint IK only after grip settles. The handset and cinematic camera are immutable.

**Tech Stack:** Three.js ES modules, GLTFLoader, OpenGameArt CC0 GLB, Playwright Chromium, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-30-right-hand-grip-design.md`

## Global Constraints
- Keep preview-only, no live New Game wiring.
- No external runtime asset requests.
- Preserve original full forearm and hand mesh; do not replace with geometry primitives.
- Test desktop 1280x720, narrow 632x748, portrait 390x844.

## Review Focus
- Source wrist must be located behind case at all viewport sizes.
- Palm polygons must not cover the lower screen/button in the idle hold.
- Thumb tip must reach the right-side CHECK IN target and retract.
- Forearm must remain connected and visible below/right of the phone.
- No text obscured, clipping, crashes, or remote assets.

### Task 1: Pose geometry and visual regression

**Files:**
- Modify: `scripts/smoke-playerhands-v48.mjs`
- Modify: `opening/playerhands-v48.js`

**Interfaces:**
- Consumes: `RiggedPlayerHand.update(tap)`, `RiggedPlayerHand.status`.
- Produces: a phone-local wrist anchor, upright four-finger direction, right-inward thumb motion and telemetry for visual auditing.

- [ ] **Step 1: Write failing browser assertions** for upright finger direction, wrist z behind chassis, inward thumb direction, low skin-colored obstruction on LCD, and visible right-side hand.
- [ ] **Step 2: Run `node scripts/smoke-playerhands-v48.mjs` in the focused GitHub Actions workflow.** Expected: FAIL against current v51 rendering, with the hand/palm crossing the app.
- [ ] **Step 3: Anchor the palm and forearm behind right edge before thumb IK.** Do not translate the entire rig to match the thumb tip. Preserve existing 20 source bones and shader depth handling.
- [ ] **Step 4: Re-run focused browser workflow.** Expected: PASS three viewports with thumb-to-target distance <0.048m and screenshots visually inspected.
- [ ] **Step 5: Commit changes to the preview branch.**

### Task 2: Safety and release checks

**Files:**
- Modify only relevant preview cache-busters, tests or handoff notes if required.

**Interfaces:** Consumes the preview branch from Task 1; production root remains unchanged.

- [ ] **Step 1: Run full cinematic, accessibility and six-chapter gates.** Expected: no new failures.
- [ ] **Step 2: Inspect actual desktop, narrow and mobile HOLD/TAP/CONFIRMED captures.** Expected: clear text and believable right-side grip.
- [ ] **Step 3: Verify root `index.html` and `game.js` unchanged, then merge and confirm GitHub Pages review deployment.** Expected: new review URL only; no activation in New Game.
- [ ] **Step 4: Update development handoff with evidence and pending owner visual approval.**
