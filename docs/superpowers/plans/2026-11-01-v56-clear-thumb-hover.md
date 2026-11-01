# v56 Clear Idle Thumb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for this single-agent GitHub-connected implementation. Steps use checkbox syntax.

**Goal:** Fix Max's Android v55 screenshot where the thumb already covers CHECK IN at rest, while preserving double-sized connected source hand and a collision-safe tip-only tap.

**Architecture:** Source-skinned browser probes measure both distal and total thumb coverage of the button. A v56 controller re-anchors the static grip outside the right bezel and solves a reachable native distal-joint contact path without moving the wrist mid-tap.

**Tech Stack:** Three.js r180, pinned CC0 MakeHuman GLB, Playwright/Chromium Actions, GitHub Pages.

**Spec:** docs/superpowers/specs/2026-11-01-v56-clear-thumb-hover-design.md

## Global Constraints
- Phone glass z=+.024; physical CHECK IN x[-.097,+.097], y[-.158,-.113].
- Source connected hand stays scaled 2.4x; no detached meshes, proxies or extra downloads.
- Mobile 390x844 is decisive, then narrow and desktop.
- Review-only; live New Game entrypoints untouched.

## Review Focus
1. Idle thumb flesh still projects across CHECK IN: test both distal (<=10) and whole-thumb (<=25) skin vertex counts.
2. Static grip moved too far to reach: full-press real skin point lies inside button and within 1-10mm of glass.
3. Source thumb passes through case while curling: all weighted thumb skin sampled through tap/lift is outside the solid.
4. Whole hand moves for tap: wrist, palm and first two thumb joints maintain pose throughout the stroke.
5. Finger direction or HUD regresses on mobile: inspect portrait screenshot and phone-hidden right-hand continuity.

### Task 1: Capture the failure with the native source skin
- [ ] Commit v56 mobile browser regression with idle-button clearance assertions and a fixed-grip outward-offset diagnostic sweep.
- [ ] Run against unchanged v55 controller; confirm RED from the 264-vertex source skin overlap.

### Task 2: Re-anchor grip and solve native fingertip path
- [ ] Copy versioned controller to opening/makehuman-forearm-v56.js, update review imports v56.
- [ ] Solve static grip offset and optional static proximal pre-pose, without animating proximal thumb joints.
- [ ] Reject solutions with idle button overlap, failed contact, mid-path casing intersections or deformed anatomy.
- [ ] Rerun the focused test to GREEN with mobile screenshots.

### Task 3: Release only the verified review
- [ ] Run three-layout visual, full cinematic, accessibility and production-isolation checks.
- [ ] Merge preview-only PR, confirm hosted v56 assets/title and unchanged production entrypoints.
- [ ] Update DEVELOPMENT_HANDOFF.md with source vertex counts and remaining Max visual-approval gate.
