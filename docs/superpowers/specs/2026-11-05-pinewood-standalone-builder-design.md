# Pinewood Mall Standalone World Builder — Design

**Date:** 2026-11-05  
**Status:** Proposed for Amanda/Max approval. This is a specification, not a completed editor.  
**Repository:** `maloysius-wq/the-attendant-pinewood-mall`

## Intent

Give the owner a practical desktop 3D editor for dressing the existing late-1990s, closed, decaying Pinewood Mall: place and reposition actual locally vendored CC0 furnishings, store props, holiday decorations, paper clutter, office equipment, trees, dead vegetation and lights; substitute a real fountain asset; then save, revisit and export the result for the playable game. The editor is a **separate browser route**, not an edit toggle in story mode.

## Approved approach and alternatives

- **Chosen:** A standalone `/builder/` browser editor that renders the same physical property as the campaign, with local draft autosave and portable JSON import/export. Campaign content changes only when an exported layout has been reviewed and integrated in the GitHub repository.
- **Not chosen:** Editable live-campaign mode. It would couple authoring with story state, collisions, enemy paths and player saves.
- **Deferred:** One-click authenticated publication from a public static site. GitHub Pages cannot safely write to the repository by itself; this would require a secure backend/authorization workflow.

## Project contracts

- Reuse `mall/masterplan-v66.mjs` (41 rooms, G/B1/M1), `mall/render-shell-v69.js`, `mall/render-furnishing-v69.js` (60 placed fixtures), `mall/gameplay-layout-v70.mjs` (walk/collision), and the existing approved facade/scene.
- Keep all current authored assets, story placements, evidence locations, original cinematic service entrance at x=12, boarded main entrance and East Wing layout.
- Only CC0 asset-catalog entries, with exact creator/source/license, pinned download hash, measurements, local repository path and any compressed texture dependencies; no third-party browser fetches. An already-present non-CC0 environment mesh (e.g. the licensed sedan) is not silently reclassified as CC0 or offered as a CC0 prop.
- The permanent Cassette Castle shelf bans, desktop-only automated testing, and no manual WASD playtest rule remain in force.
- Architecture is structural, not a generic editable prop: floors, load-bearing walls, shafts, stairs, mandatory story/evidence triggers **and any visible support object physically bound to a mandatory story/evidence interaction** are selectable for inspection but locked against moving/deletion in v1. Noncritical furnishings, decorative fixtures, plants and fountains are editable. Story-critical props are clearly labeled in the inspector, so the user can dress freely around them.

## User experience

### Workspace

A standalone URL `/builder/` opens the actual property and a loading screen. A left panel contains a searchable, categorized catalog with thumbnails, descriptions, dimensions, style/condition tags, and favorites. Categories initially include Retail & Displays, Food Court, Benches & Seating, Offices & 1990s Electronics, Holiday & Seasonal, Fountains & Planters, Living/Dead Vegetation, Lighting & Electrical, Debris/Papers, and Exterior/Service.

A right inspector shows the selected entity and exact position (x/y/z), pitch/yaw/roll, scale, floor, visibility, grouping and collision toggle. A top bar offers Save, Import, Export, Undo/Redo, Duplicate, Delete, Reset Draft, floor/room jump, day/night presentation controls, grid/snap settings, and a searchable scene-outliner. Clear selection outlines must not become part of the saved game.

### Authoring actions

Click an existing editable object to select it, then manipulate its transform using on-screen translate/rotate/scale handles, numeric fields or keyboard shortcuts. Drag a catalog item to the scene, preview a translucent ghost, and click to commit. While placing an item, mouse wheel moves it closer/farther along the camera ray; Shift modifies increment, with optional surface/grid snapping. The default placement grounds full-sized models from their measured bounds on the actual surface under the cursor. A separate explicit control permits elevating objects, placing decorations on shelves/counters, and rotating wall-mounted pieces. Support and clipping warnings must be visible without inventing filler geometry. Delete is undoable; duplicating produces a fresh stable instance ID. Objects can be hidden temporarily. Existing v69 assets retain stable IDs so moved/deleted objects do not respawn on reload.

Editor can author a worn/abandoned variant using material tint, grime, surface decals or a genuinely weathered source mesh. Such variants must look physically attached and remain CC0/local. Do not expose random out-of-period branding as 1990s canon.

### Traversal, doors, and gravity

Desktop mouse/keyboard: walk/look, collision, sprint and room/floor teleport controls; a **Fly/Noclip** toggle allows vertical movement and passage through editor-only obstacles to reach ceilings, basements and awkward locations. Leaving Fly mode restores gravity and resolves downward onto the nearest valid physical surface below the avatar, respecting floor openings and stairwells; if no valid landing surface exists, return safely to the most recent grounded position rather than falling forever or clipping through the mall.

Expose and animate existing room doors and three official exterior doors for editor inspection/open/close. Editor-only **Unlock All Doors** temporarily removes chapter gates, but saving visual decoration does not alter story locks or the canonical boarded entrance. Open doors must have matching traversal clearance and updated collision. Door positions/hinges and opening states are separately identified from movable decor; no sealed walls should masquerade as openable doors. A floor and room navigator can jump directly to every authored space irrespective of chapter.

### Save and publishing

Draft data autosaves in IndexedDB under a versioned local project ID; explicit Save shows saved timestamp. Export produces a portable UTF-8 JSON document (schema version, base map version, catalog IDs, stable instance IDs, additive placements, transforms, hidden/deleted fixture overrides and optional authored door-display states). Import validates schema, asset IDs, finite transforms and placement bounds before applying; conflicts show a preview and reversible choice. Undo/redo spans all authoring actions, including imports.

There is **no misleading Publish button**: the editor provides Export World Layout; the user supplies this JSON for review/merge into GitHub. A separate production overlay loader applies approved deltas to the actual game only after collision/story checks, so experimental drafts never overwrite a player's story save.

## Asset library

- Preserve the existing 39 pinned 3D model sources in the runtime manifest (some are architectural and remain locked); reuse their measured fixtures.
- Curate at least **100 distinct selectable CC0 model entries** for the first full Builder release, then support additive catalog batches. Prefer Kenney's Furniture (140 models), Nature (330), Food (200) and Holiday kits, select Poly Haven's worn/weathered electronics/furniture/vegetation/lighting, and individually verified CC0 Poly Pizza models (including a fountain and vintage-style computer pieces).
- The central gallery dry fountain at world x=0, z=-71 receives an actual imported sculpted fountain basin/model, appropriately scaled and weathered. It stays dry and abandoned. This is a **visual replacement of the existing fountain**, not a relocation or removal of any mandatory evidence: integration must preserve and verify the original story evidence anchor, interaction range and physical approach. Any future relocation of story-bound props requires a separate approved story-anchor migration and route test.
- Select low/medium-polygon GLB/glTF assets, convert/compress source packs at **build/vendor time**, store hashes and provenance in `LICENSES.md` and a catalog manifest. Lazy-load catalog models and thumbnails only when used; cache loaded assets, bound GPU memory and instance repeated props. The game never fetches Kenney/Poly Haven/Poly Pizza at runtime.

**Research entry points:** https://kenney.nl/assets/furniture-kit ; https://kenney.nl/assets/nature-kit ; https://kenney.nl/assets/food-kit ; https://kenney.nl/assets/holiday-kit ; https://polyhaven.com/models ; https://poly.pizza/m/WHc7dwttlk . Each individual binary still requires per-asset license/source/hash validation before vendoring.

## Technical boundaries

Create focused modules under `builder/` for UI/interaction, `mall/editor-*` for catalog/schema/scene overlay/collisions/door behavior; do not rewrite the encoded `bundle2/` campaign loader. Input state (viewing, placing, selected, transform drag, fly) is explicit, so clicks and scrolls cannot accidentally perform multiple operations. Treat original scene instances as an immutable baseline with reversible overrides; avoid copying entire geometry into saved JSON. The editor must run from GitHub Pages without accounts or extra dependencies beyond already vendored Three.js and loaders.

## Delivery and acceptance

1. **Foundation:** Separate page, actual connected Pinewood scene, existing fixture selection, transforms, delete/duplicate, undo/redo, local save and JSON round-trip. Desktop automated tests verify placement and scene restoration.
2. **Navigation:** All rooms/floors/exterior reachable; editor-only doors animate and permit traversal; fly/noclip and safe gravity landing verified at shafts, mezzanine, basement and outside.
3. **CC0 expansion and fountain:** At least 100 selectable models, curated themed categories, visually verified 90s/abandoned materials, a real imported dry fountain, fully local asset audit and sensible download/performance budgets.
4. **Publishing:** Import an approved exported layout through the existing GitHub workflow, apply its prop deltas to the campaign without moving story-critical anchors, and verify six chapter routes, evidence, entrance/exit, saves and desktop visuals.

**Core verification:** Node schema/geometry/collision tests; desktop Chromium editor controls, visual screenshots, save/reload/export/import; all referenced runtime resources same-origin; existing focused mall/story/cinematic regression tests. Never gate a small incremental builder edit on unrelated full-game production hardening. The full multi-system integration milestone runs appropriate broader checks before publishing world changes.

## Decisions for review

- Standalone editor + local autosave + downloadable JSON, not a live authenticated publisher.
- At least 100 first-release selectable CC0 entries; load on demand instead of all at startup.
- Noncritical decor and furnishings are editable; critical architecture, story/evidence anchors, and their physically bound visible supports are protected. The fountain may be visually replaced only with its evidence interaction preserved.
- All areas and doors are accessible **in Builder**, while campaign-specific locks and plot triggers remain intact.
- No mobile controls or manual WASD playtest runs.
