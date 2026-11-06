# Pinewood World Builder

Standalone desktop editor: **`/builder/`** (a separate page from the playable game).

The editor loads the same canonical 41-room, three-level Pinewood Mall shell and all 60 existing v69 furniture pieces. A dry ornamental fountain replaces only the old sculpture in this editor preview. The architectural basin, walls, stairs, shafts and chapter evidence remain protected.

## Controls

| Action | Control |
| --- | --- |
| Orbit / pan / zoom | Left drag / right drag / mouse wheel |
| Search models | Search and filter by category or condition in the left panel |
| Add a model | Choose a prop; move the preview; wheel up rotates left and wheel down rotates right in 15° steps; Shift+wheel moves near/far; left click places with the chosen rotation |
| Select an existing prop | Click it in the scene or the scene outliner |
| Move / rotate / scale | Top toolbar, gizmo, or exact Inspector values; shortcuts 1 / 2 / 3 |
| Duplicate / remove | Inspector; Delete removes selected |
| Undo / redo | Toolbar or Ctrl+Z / Ctrl+Y |
| Walk | Explore, WASD and mouse |
| Fly with no collision | Explore, Fly or F; Space up, Shift down |
| Return to gravity | F or Fly again; player descends to a physically supported surface |
| Visit another room/floor | Jump-to-room selector (41 actual rooms) |
| Operate doors | Select door/Open–Close tool; E near a doorway in Explore |
| Turn off builder-only unlocked access | Unlock all toggle (does not alter story locks) |

The editor saves automatically to **IndexedDB in this browser** after each edit. It also has manual Save, Export World Layout (JSON), Import JSON and Reset local draft. Use Export to create a portable, reviewable layout. Import validates the model allowlist and serialized transforms; invalid or remote-asset references are rejected.

## 482 new CC0 models

`assets/vendor/builder/catalog-v1.json` lists the 482 new self-contained licensed CC0 GLB binaries, source URLs, pinned upstream references, each model's exact SHA-256/byte count and any local thumbnail. The catalog joins 17 previously pinned CC0 furnishings in the selector. Models are grouped into 10 categories spanning vintage electronics, retail display and arcade fixtures, seating, food-court clutter, lighting, winter decorations, neglected foliage, damaged debris, and the authentic silted decorative fountain. Filter **Weathered / damaged** to find deliberately distressed assets.

The builder never fetches third-party runtime assets. The one-off vendoring tool `tools/vendor-builder-cc0-v1.mjs` is development-only and is executed by a GitHub Actions runner. `scripts/audit-builder-assets-v1.mjs` checks every local GLB signature, byte length and checksum.

## Campaign safety

The builder is intentionally independent from the chapter/story runtime. The export is **not** silently applied to playable chapters. `mall/editor-overlay-v1.mjs` supplies a guarded `prepareApprovedLayout` and opt-in, reversible `applyApprovedLayout` interface for a **future owner-reviewed** exported world. Applying that world to the actual campaign requires explicit owner approval of the specific exported JSON; story door locks and evidence/architectural geometry are never taken from the edit preview.

## Focused verification

`pinewood-builder-v1.yml` runs schema/traversal/overlay/property checks, a per-file CC0 asset audit and automated desktop Chromium editing/persistence/navigation tests. It intentionally does not invoke the unrelated six-chapter hardening suite.
