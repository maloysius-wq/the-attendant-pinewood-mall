# The Call v54 Anatomical Forearm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Replace The Call's visually broken right hand with an anatomically continuous, high-detail CC0 right forearm grip and believable thumb tap.
**Architecture:** Offline deterministic skin-weight crop of pinned MakeHuman-derived 163-bone GLB; browser-only loads the local cropped skinned arm. Pose is phone-local, original weighted fingers behind phone, thumb presses the app glass.
**Tech Stack:** Node.js 22 asset vendor + audits, Three.js r180 GLTFLoader, Playwright, GitHub Pages review-only.
**Spec:** docs/superpowers/specs/2026-10-31-real-right-forearm-design.md

## Global Constraints
- Preserve the production root game, six-chapter v27 runtime and the separate review gate.
- Runtime assets must be repository-local; source must be CC0 pinned and documented.
- Do not use procedurally modeled substitute fingers, no manual WASD.
- Full human source must not render; only a real connected arm and hand.

## Review Focus
- Smartphone foreground rendering against depth-buffer writes still displays real digits.
- Original thumb tip travels into button rather than pointing away.
- Forearm enters naturally from lower-right on 390px portrait.
- Long finger mesh stays behind the case across 632px narrow.
- Source asset cannot silently drift via an upstream replacement.

### Task 1: Vendor source anatomical forearm
**Files:** Create scripts/vendor-call-right-forearm-v54.mjs; scripts/audit-call-right-forearm-v54.mjs; opening/assets/v54/*.glb/manifest.json; update LICENSES.md.
**Interfaces:** Produces one skinned GLB with original node names and a verified manifest.
- [ ] Write source/geometry manifest audit first.
- [ ] Run audit to see the missing-manifest failure (RED).
- [ ] Download exact source by SHA; crop weighted right forearm and five original fingers.
- [ ] Execute audit to confirm GLB geometry/skin and hash (GREEN).
- [ ] Commit vendor files and license provenance.

### Task 2: Pose real source rig and prove interaction
**Files:** Modify opening/playerhands-v48.js, opening/phone-v45.js, opening/intro.js; modify scripts/smoke-playerhands-v48.mjs and .github/workflows/playerhands-v48-visual.yml.
**Interfaces:** Produces existing RiggedPlayerHand status shape with v54 source and physical thumb target.
- [ ] Update regression to demand v54 and hand/forearm anatomical invariants; verify RED on old source.
- [ ] Orient wrist and source fingers in phone local space; pose thumb with bounded rig joints; preserve app/front glass.
- [ ] Run static and 3-layout Chromium tests (GREEN).
- [ ] Inspect each actual screenshot before considering the visual accepted; iterate on root causes only.
- [ ] Commit isolated review build, confirm local assets and no production changes.

### Task 3: Review handoff
**Files:** Update DEVELOPMENT_HANDOFF.md.
- [ ] Record source SHA, verification command, review URL/status, remaining owner-only approval gate.
- [ ] Keep preview isolated until visible screenshots are actually acceptable.
