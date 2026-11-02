# Pinewood Mall v67 Physical Construction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax.

**Goal:** Construct a reusable, coherent 3D architectural shell from the approved 41-room v66 plan, with real openings, floors, doors, stairs, and verified local CC0 materials/models.

**Architecture:** `mall/physical-shell-v67.mjs` emits exact architectural coordinates and collision boundaries independent of rendering. `mall/render-shell-v67.js` turns that into local Three.js textured geometry and places curated vendored CC0 fixtures after measured bounding boxes. A review-only fixed-camera inspection UI and deterministic browser checks prove all the geometry before the existing six-chapter runtime migrates.

**Tech Stack:** JS ES modules, local Three.js r180 + GLTFLoader, existing CC0 Poly Haven textures and Kenney/City-Builder fixture GLBs, Node 22 tests, Playwright 1.55 Chromium on GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-02-pinewood-master-mall-design.md`.

## Global constraints

- Preserve cinematic front wall Z=-22.5, service entrance X=12 with 1.78m width and 2.27m height, boarded main entrance X=-10.5, east staff exit (86,-42).
- G single shopping floor Y=0, B1 Y=-4.3, limited M1 Y=5.4, central atrium height12.
- Stay in a review folder; do not edit `game.js`, live `index.html`, `opening/scene.js` or runtime patches.
- All imported models and texture maps must come from vendored, previously licensed local assets; no remote fetch, no banned Cassette Castle shelf models.
- Do not use manual WASD; deterministic fixed viewpoint image probes instead. Preserve all nine evidence locations and the full story bible.
- Preview shows construction geometry (not final weathering or authored gameplay), with no false claim that the playable six-chapter map has migrated.

## Review focus

1. Moving through the service door must find a precise 1.78 m aperture, while boarded public entry remains solid — direct cross-wall collision test in Task 1.
2. The Chapter 6 employee exit must remain physically blocked in Chapter 5 and open only after clock-out — gate collision test in Task 1.
3. A corridor portal must not look open yet have a hidden colliding wall behind it — bilateral portal clearance test in Task 1.
4. Elevators and stair rises must occupy the true world coordinates, without solid floor through their shafts — shaft void/riser test in Task 1.
5. Browser screenshot first frame must have all local textures and GLBs already loaded — preload/no-network automated checks in Task 3.

---

### Task 1: Geometry and collision contract

**Files:**
- Create `mall/physical-shell-v67.mjs`
- Create `scripts/test-physical-shell-v67.mjs`

**Interfaces:**
- Consumes `MALL` from `mall/masterplan-v66.mjs`.
- Produces `constructPhysicalShell({level,chapter})`, `isSegmentBlocked(shell,from,to)`, `validatePhysicalShell(shell)`.

- [ ] Write exact failing tests for both G external doors, three physical levels, portal gaps, shafts, risers and side-door collision.
- [ ] Run tests on intentional stub via GitHub Action and confirm failure for missing construction.
- [ ] Implement the minimal deterministic shell with slit walls, data-driven portals, slabs/voids, vertical stair treads, railings and fixtures.
- [ ] Rerun Node test suite to zero failures; commit.

### Task 2: Textured construction scene

**Files:**
- Create `mall/render-shell-v67.js`
- Create `review/mall-construction-v67/index.html`, `review/mall-construction-v67/main.js`

**Interfaces:**
- Consumes physical geometry contract and local asset URLs.
- Produces `await renderConstructionScene({scene,level,chapter,showRoof})`, returns groups, measurement metrics, failed asset list.
- Fixed camera presets: service entry, boarded entrance, atrium, west retail, East Wing, B1 switchgear, fire stair, M1 overlook, PA, final exit.
- DOM QA `window.__PINEWOOD_MALL_CONSTRUCTION_V67__` with ready only after texture and fixture preload.

- [ ] Add failing browser smoke for preloaded PBR textures/GLBs and fixed full-res screenshots (no WASD).
- [ ] Implement Three.js room wall geometry, original/annex material identity, physically modeled stair steps, existing licensed GLBs measured and grounded, inspection camera controls.
- [ ] Verify browser images with Chromium and iterate if needed; commit.

### Task 3: Stable review, CI and forward migration handoff

**Files:**
- Create `scripts/smoke-physical-shell-v67.mjs`
- Create `.github/workflows/mall-physical-shell-v67.yml`
- Modify `DEVELOPMENT_HANDOFF.md`

- [ ] CI runs geometry tests and browser smoke on desktop/mobile with local HTTP server and all imported materials.
- [ ] Verify no external network calls, script errors, missing models or first-frame texture popping, and retained v66 test suite.
- [ ] Audit changed filenames against no-production-switch contract and finish review.
- [ ] Merge review-only after scoped CI passes; update handoff with URL and next runtime migration steps.

## Deferred to next phase (not claimed here)

Use `mall/physical-shell-v67.mjs` and actual mesh/collision outputs inside unified game world, replace old disconnected carveRect generation, wire chapter objectives/AI/audio/streaming/saves, and run complete six-chapter regression and both endings.