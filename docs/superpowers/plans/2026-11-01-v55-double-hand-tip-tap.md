# The Call v55 Double-Size Right Hand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for this single-agent implementation. Steps use checkbox syntax for tracking.

**Goal:** Twice-size authentic right hand, distal-only hover/tap/lift and no thumb-skin phone penetration in the isolated intro.

**Architecture:** A versioned v55 skinned-hand controller reuses the pinned v54 source GLB, measures actual distal skin vertices and solves contact-limited distal bone rotation. The v55 smoke inspects rendered browser frames and geometry, while the full opening regression stays intact.

**Tech Stack:** Browser Three.js r180, ES modules, Playwright deterministic Chromium on GitHub Actions, GitHub Pages.

**Spec:** docs/superpowers/specs/2026-11-01-v55-double-hand-tip-tap-design.md

## Global Constraints
- Exactly local CC0 pinned GLB; original 163 source bones.
- Model scaling goal 2.4 versus v54 1.2.
- Surface phone glass z=+.024; real skin may touch but never pass behind.
- Review-only; production game.js and index.html untouched; no manual WASD.
- Visual correctness on mobile, narrow and desktop.

## Review Focus
1. Oversized forearm clipping out of mobile viewport: mobile screenshot retains visible palm and forearm, screen legibility.
2. Distal tip collision at intermediate press fractions: sample all phases for surface minimum depth.
3. The thumb base moves when only the tip should move: compare native proximal joint transforms and pad trajectory.
4. The press never reaches CHECK IN: require pad XY inside actual button and z near glass at peak.
5. A successful downstroke without lift: require the release state equal to hover and verify caption/state progression.

### Task 1: Regression Test — Size and Tip Surface

**Files:** Create scripts/smoke-thumb-v55.mjs; create .github/workflows/the-call-v55-visual.yml.

- [ ] Add test against real preview requiring 2.4× effective arm scale, source skeleton, thumb-pad point and skin clearance at hold/tap/release.
- [ ] Sample the surface at t=0..1, requiring minimum clearance >=0.001m while thumb is over glass, and pressed pad z <=0.035m.
- [ ] Assert first two thumb joints move <=0.04rad, distal joint moves visibly, and release returns to hover.
- [ ] Run branch workflow against old rig and record expected RED for missing v55 behavior.

### Task 2: Source-Skinned Tip Solver

**Files:** Create opening/makehuman-forearm-v55.js; modify opening/phone-v45.js, opening/intro.js and review/the-call-v34/index.html.

- [ ] Implement authentic skin-weight distal-pad extraction/pose sensor and collision-limited tip flexion.
- [ ] Scale model to 2.4× and anchor wrist outside right edge, with pad hovering above button.
- [ ] Drive only distal joint during down/up; cap the final contact at real skin plane.
- [ ] Run v55 focused smoke to GREEN, inspect three-layout hold/contact/release/unobstructed images, correct any real failures.

### Task 3: Full-Scene Preservation and Review Release

**Files:** Modify .github/workflows/the-call-v54-visual.yml to archival manual trigger; update DEVELOPMENT_HANDOFF.md.

- [ ] Feed full cinematic gate forward and verify accessibility, full opening and six-chapter hardening.
- [ ] Verify main index.html and game.js source blobs remain unchanged.
- [ ] Merge only isolated preview when actual browser screenshots pass and verify hosted v55 asset/title.
- [ ] Record PR/test SHA, proof and owner's still-closed production gate in the handoff.
