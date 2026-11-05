# Pinewood World Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a standalone desktop `/builder/` editor for the canonical Pinewood Mall, with reversible prop edits, local saves, accessible rooms, fly/gravity, openable doors, a broad verified CC0 catalog, a real dry fountain and a safe campaign overlay handoff.

**Architecture:** The builder loads existing v69 Three.js mall modules and treats their geometry as an immutable base. Pure editor state/schema modules manage reversible prop overrides and placement, while a browser-only interaction layer attaches selection/transform controls and local storage to the same scene. Asset catalog manifests reference only locally vendored pinned CC0 models; importing an approved exported layout into the campaign is a separate guarded step.

**Tech Stack:** Browser ES modules, vendored Three.js r-compatible modules, IndexedDB, Node 22 node:test, desktop Chromium Playwright, GitHub Actions/Pages.

**Spec:** `docs/superpowers/specs/2026-11-05-pinewood-standalone-builder-design.md`

## Global Constraints

- GitHub connector is the repository read/write/build interface; no local git clone or remote runtime model loading.
- Keep the 41-room three-level v66 plan and existing 60 v69 furniture pieces, all narrative evidence, and the current cinematic exactly intact.
- Only locally pinned and individually license-verified CC0 additions, with hashes in `LICENSES.md`; never use banned Cassette Castle Quaternius shelves.
- Desktop Chromium automated QA only; no manual WASD or mobile suites.
- No full-game production hardening for individual editor tasks. Run focused workflows and local-asset audits on shipped asset changes.
- Story-bound evidence supports, shafts, walls, floors and stairs stay immutable; the fountain visual may be replaced if evidence geometry remains reachable.

## Review Focus

1. A removed legacy fixture must remain removed after refresh and import → Task 1 state round-trip test.
2. Malformed imported JSON (NaN, duplicate IDs, unlicensed paths) must be rejected without partial state mutation → Task 1 validation test.
3. Selecting an architectural wall must never permit deletion or transform → Task 2 browser smoke.
4. Fly-off above B1, shaft holes and outside must land on a real surface or safely restore prior grounded location → Task 3 landing test.
5. An asset unavailable at runtime must show a clear error, never a primitive/remote substitute → Task 4 asset failure test.

---

### Task 1: Pure state, schema and locally licensed starter catalog

**Files:**
- Create: `mall/editor-schema-v1.mjs`, `mall/editor-catalog-v1.mjs`
- Create: `scripts/test-builder-schema-v1.mjs`, `.github/workflows/pinewood-builder-v1.yml`

**Interfaces:**
- `createEmptyDraft(): Draft`, `validateDraft(draft, catalog): string[]`, `reduceDraft(draft, action): Draft`, `exportDraft(draft): string`, `importDraft(json, catalog): Draft`
- `EDITOR_CATALOG_V1: ReadonlyArray<{id,label,category,path,dimensions?}>` uses pinned CC0 GLB paths already present in runtime manifest, excluding banned shelves.

- [ ] Step 1: Add failing Node tests for initial state, added props, move/scale, deleted legacy fixture overrides, undo snapshot, JSON round-trip, duplicate IDs and nonfinite/unlicensed import rejection.
- [ ] Step 2: Run `node --test scripts/test-builder-schema-v1.mjs` in focused GitHub Actions and observe RED due to missing modules.
- [ ] Step 3: Implement state/schema/catalog with immutable reducers, bounded transforms, id validation and versioned portable JSON.
- [ ] Step 4: Run same focused workflow, observe GREEN; record commit.

### Task 2: Render and edit the real three-level mall

**Files:**
- Create: `builder/index.html`, `builder/main.js`, `builder/builder.css`, `builder/editor-scene.js`
- Create: `scripts/smoke-builder-v1.mjs`
- Modify: `.github/workflows/pinewood-builder-v1.yml`

**Interfaces:**
- `createBuilderScene({scene,camera,domElement,onSelect}): Promise<EditorScene>` loads `renderPinewoodV69`, identifies unlocked v69 furniture by `fixtureId`, uses Three.js `TransformControls`.
- `EditorScene`: `select(id)`, `place(catalogId,point)`, `applyDraft(draft)`, `setTransformMode(mode)`, `dispose()`, `objects: Map`.

- [ ] Step 1: Write browser smoke asserting separate `/builder/` loads the actual v69 room count, legacy fixtures are selected, drag/inspector transforms and delete/duplicate/undo/redo work, persistence survives refresh, export/import is lossless, and architecture is locked.
- [ ] Step 2: Dispatch focused workflow to observe RED because Builder page is absent.
- [ ] Step 3: Implement desktop UI: search/catalog, outliner, inspector numeric transforms, placement ghost and ray/wheel depth, TransformControls translation/rotation/scale, camera, IndexedDB save, export/import, and undo/redo. Keep camera and transform control mouse ownership exclusive.
- [ ] Step 4: Verify desktop Chromium and Node schema tests GREEN; commit.

### Task 3: Doors, floor navigation, fly/noclip and gravity

**Files:**
- Create: `mall/editor-traversal-v1.mjs`, `builder/editor-navigation.js`
- Add tests: `scripts/test-builder-traversal-v1.mjs`; extend `scripts/smoke-builder-v1.mjs`.

**Interfaces:**
- `findGroundBelow(x,y,z,physicalShell): number|null` handles multi-level plates and holes.
- `EditorNavigation`: `gotoRoom(roomId)`, `toggleFly()`, `setDoorOpen(portalId,open)`, `update(dt)`, `dispose()`.

- [ ] Step 1: Add RED tests for floor landings, shafts, door-gate clearance and gravity restoration; browser smoke for room/floor teleport and fly toggle.
- [ ] Step 2: Implement desktop first-person camera transport, fly/noclip, physical ground-down landing, room navigation, inspector roof/ceiling visibility and editor-only open/close door leaves on authored portals. Campaign gates remain unchanged.
- [ ] Step 3: Verify targeted tests GREEN; commit.

### Task 4: Expand CC0 inventory, curated condition variants and dry fountain

**Files:**
- Create: `assets/vendor/builder/catalog-v1.json`, `tools/vendor-builder-cc0-v1.mjs` and pin manifest; add repository-local model/thumbnail files; update `LICENSES.md`, `mall/editor-catalog-v1.mjs`, `builder/editor-scene.js`, `scripts/audit-builder-assets-v1.mjs`; extend workflow.

**Interfaces:**
- Model IDs are immutable and serialized; manifest records source URLs for provenance only, CC0 evidence, SHA-256, scale/size metadata and local paths. GLB loading is lazy and same-origin.
- `replaceDryFountainVisual(scene,asset)` keeps existing x=0,z=-71 evidence accessible.

- [ ] Step 1: Write RED asset audit for >=100 unique selectable, legally pinned model IDs, no banned shelves, no remote runtime requests, fountain replacement and support grounding.
- [ ] Step 2: Vendor and independently license-check Kenney/Poly Haven/Poly Pizza candidate files; convert where needed on authorized GitHub runner and commit actual binaries. Omit candidates whose licensing or geometry fails.
- [ ] Step 3: Add catalog filters, aging/condition controls and local thumbnails; replace fountain mesh without changing story evidence.
- [ ] Step 4: Run asset audit, desktop visual and targeted Builder regressions GREEN; commit.

### Task 5: Approved layout integration and handoff

**Files:**
- Create: `mall/editor-overlay-v1.mjs`, `scripts/test-builder-overlay-v1.mjs`
- Modify: only the necessary runtime compositor after owner-provided layout approval; update handoff after integration.

**Interfaces:**
- `applyApprovedLayout({building,draft,catalog})` is an opt-in renderer overlay, never auto-importing local drafts into story mode.
- [ ] Step 1: Write RED tests protecting mandatory evidence, chapter lock states, collision clearances, existing fixture IDs, no broken GLBs and no changes to story save.
- [ ] Step 2: Implement reviewed-layout loader only for a concrete approved JSON export; do not invent the owner's eventual decoration choices.
- [ ] Step 3: Run scoped complete layout integration tests, local asset audits and desktop Pages smoke; commit and update documentation.

## Native execution and release gates

Implement tasks in order in a feature branch or the existing approved design branch; commit after each test-green task. Open a PR before main changes, read relevant Actions results and verify Pages on merge. Task 5 cannot publish a non-existent owner's future layout: ship its safe loader and request an actual approved export when the user has authored one.
