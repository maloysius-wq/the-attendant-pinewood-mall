# Pinewood Licensed Interior Furnishings v69 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [x]\`) syntax for tracking.

**Goal:** furnish the approved 41-room, three-level mall with legal, realistic, correctly grounded legacy CC0 models, preserve full walking clearance, and expose a deterministic visual/story-placement review without changing the playable game.

**Architecture:** A pure authored placement contract names specific vendored models and exact room coordinates. One separate Three.js adapter measures and grounds every imported GLB, supports small tabletop objects from measured furniture bounding boxes, and exposes collision footprints for future gameplay. A review-only scene composes v68's proven architecture with v69 props before the first rendered frame.

**Tech Stack:** Native ES modules, vendored Three.js and GLTFLoader, Node's test runner, Playwright Chromium, GitHub Actions and Pages.

**Spec:** \`docs/superpowers/specs/2026-11-02-pinewood-master-mall-design.md\`

## Global Constraints
- Approved single retail level, B1 Y=-4.3, M1 Y=5.4; 12m original atrium and 1979/annex geography immutable.
- Entry X=12, Z=-22.5 must remain usable; public entry X=-10.5 blocked; east exit X=86,Z=-42 chapter gated.
- Permanent banned Cassette shelf models and aliases prohibited. Use full-height empty Kenney bookcases, grounded via measured dimensions.
- All third-party models and textures must already be pinned in \`assets/vendor/runtime/manifest.json\` and documented in \`LICENSES.md\`; no external runtime URLs.
- Model furniture must not occlude structural openings or story pickups. Countertop props must measure their supports; no guessed world-Y.
- Production \`game.js\`, \`index.html\`, \`opening/*\`, chapter patches, saves, audio and narrative authority remain unchanged.
- No manual WASD. Verification via deterministic Node contracts and scripted desktop/mobile camera screenshots.

## Review Focus
1. Fixtures too large for their designated room: fitting must enforce target height and horizontal footprint, and report any overrun.
2. A counter or chair crossing a 2.55m door: tests must check actual portal approach rectangles plus an interior route to each destination.
3. Floating registers, cups, VHS or books: all loose objects require a measured support, including relocation of the legacy floor-level Cassette register.
4. Duplicate or banned Cassette fixtures: exact set and full-size measurements are audited, with no guessed shelf stock or substitute stand-ins.
5. Browser slow-start/asset popping: all models must preload before first visible frame; desktop/mobile error, remote-request and screenshot audits.

---

### Task 1: Author physical furniture and evidence-placement contract

**Files:**
- Create: \`mall/furnishing-plan-v69.mjs\`
- Create: \`scripts/test-furnishing-v69.mjs\`

**Interfaces:**
- Consumes: \`MALL\` from \`mall/masterplan-v66.mjs\`; \`constructPhysicalShell\` from v67.
- Produces: \`FURNISHINGS_V69\` with \`fixtures\`, \`storyAnchors\`, \`tourRoutes\`; \`validateFurnishingPlan(plan)\`; \`isFurnishingRouteClear(plan,level,a,b,radius)\`.

- [x] Step 1: Write Node tests for at least 40 authored fixtures; each fixture in its correct room, model vendored and not banned; all LS-01..09 anchors once and in canonical rooms; supported loose props; empty Cassette shelving.
- [x] Step 2: Run the new Node test on a contract stub and verify failures for absent furniture/anchors and blocked openings.
- [x] Step 3: Implement the data and clearance validator with portal approach and route tests (including service entry, retail storefronts, East Wing, B1 spine, M1 gallery).
- [x] Step 4: Run full v66-v69 Node suite, verify green; commit.

### Task 2: Import and ground actual models, relocate the legacy register

**Files:**
- Create: \`mall/render-furnishing-v69.js\`
- Create: \`mall/render-shell-v69.js\`
- Test: \`scripts/smoke-furnishing-v69.mjs\` browser QA.

**Interfaces:**
- Consumes: v68 \`renderPinewoodV68({scene,chapter})\` and \`FURNISHINGS_V69\`.
- Produces: \`renderPinewoodV69({scene,chapter})\` returning \`furnishingsLoaded\`, \`supportChecks\`, \`clearanceWarnings\`, \`storyAnchors\`, \`firstFrameFullyLoaded\`, plus existing v68 scene state.

- [x] Step 1: Write browser-red test requiring model support measurements, grounded boxes, complete preloading, no banned models, and no external runtime fetches.
- [x] Step 2: Verify failure against a placeholder review page.
- [x] Step 3: Build GLB adapter that clones fully preloaded vendor GLBs, scales to height and footprint, grounds through measured Box3, then places supported objects on measured top bounds, relocates v67 floor-level register, and attaches collision metadata.
- [x] Step 4: Run browser smoke, verify support and no-pop-in state on desktop/mobile; commit.

### Task 3: Deliver responsive survey and handoff

**Files:**
- Create: \`review/mall-interiors-v69/index.html\`, \`review/mall-interiors-v69/main.js\`
- Create: \`.github/workflows/mall-furnishing-v69.yml\`
- Modify: \`DEVELOPMENT_HANDOFF.md\`

**Interfaces:**
- Consumes: \`renderPinewoodV69\` and fixed cameras from v68.
- Produces: review-only URL \`/review/mall-interiors-v69/\`, deterministic camera survey, expanded telemetry and GitHub artifacts.

- [x] Step 1: Add test that exercises fixed cameras for Cassette, Arcade, Video Planet, Food Court, Security, East Wing, B1 and M1 at desktop/mobile sizes.
- [x] Step 2: Verify RED, implement responsive review-only UI, verify GREEN.
- [x] Step 3: Check the verified screenshot artifact, 40+ fixtures, all nine evidence anchors and at least 22 Node tests. Update handoff.
- [x] Step 4: Merge only after scoped CI green. Verify GitHub Pages deployment. Preserve playable game.

**Verification:** [GitHub Actions v69 41531295302](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41531295302) passed 28 Node tests plus fifteen fixed cameras per desktop/mobile, with 30 screenshot/audit artifacts. Human subjective art-direction review is pending; production remains isolated.
