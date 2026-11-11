# Development Handoff: The Attendant: Pinewood Mall

## Builder lighting + grime visibility + click-off deselection (2026-11-11)

This is an isolated fix that **does not depend on the not-yet-downloaded calendars/plants v101 asset bundle**.

- The old wall-paper/poster/notice/cobweb and v100 peeling paper decals were created with `MeshBasicMaterial`, ignoring any scene light. Now paper uses **`MeshStandardMaterial`**, roughness 1, metalness 0, black zero-intensity emissive, preserving the real pinned source image and alpha, so they stop glowing inside the abandoned dark mall.
- The 36 pinned `ambientCG` CC0 dirt/glass/water/fingerprint decals remained nearly invisible at 100% because their authored alpha was low. A new in-memory `CanvasTexture` recalibrates **only nonzero alpha and photo-derived pigment** of the exact original pinned CC0 PNGs. No source PNG changes and no invented photo patches; saved opacity sliders still control strength between .08 and 1. Material is dark (not emitted light).
- `builder/editor-scene.js` left-clicking the empty world now calls the existing `select(null)` to clear selected object and 3D handles; clicking an actual different object still selects it, and a transform handle is exempt.
- These are **Builder-only**, with all 610 existing catalog entries and 41-room architecture, user save/import schema and source/license manifests untouched. No cinema/game/story modification, no new network dependencies.

Dedicated desktop smoke `scripts/smoke-builder-paper-grime-deselect-v101.mjs` tests all three kinds of paper, two grime samples, and empty-click selection followed by JSON/IndexedDB persistence. Focused workflow: `.github/workflows/pinewood-builder-atmosphere-fix-v101.yml`. A separate source-authentic calendar/plant development branch remains incomplete until third-party binaries can be downloaded/pinned and does not belong on main yet.


## Builder v100: independently sourced used whiteboard, cork board and damaged posters (2026-11-11)

The user explicitly asked for *actual* textured source assets, not newly fabricated 3D stand-ins. Added two publisher-supplied unmodified GLBs (Grab3D CC0 whiteboard with existing charts/marker tray, and Grab3D CC0 cork bulletin board with pinned curled notes) plus six aged wall-poster decals processed from one independently sourced GGBotNet CC0 torn-poster image. The source model GLBs retain embedded PBR maps; their Builder-only roughness/neutral aging patina preserves every source image. The runtime now also lays transparent photo-derived ambientCG v97 `grime-wall-smears` / `wall-dust-bloom` overlays over the board panels (no invented grime or replacement mesh), with textures cached and disposed by `attachBoardGrimeV100`. Paper decals vary alpha tears, missing edges, lifted corners and curling geometry, using actual licensed poster imagery as input. **Provenance distinction:** Grab3D's publisher license documents Blender procedural scripts with AI-assisted coding (not human hand-sculpted); GGBotNet created one source poster collage, and six derivative decals were processed from it. Do not claim these are six distinct authored poster models.

Cork bulletin board placement now raycasts actual architectural walls, hangs centered at the pointer hit with source mesh forward, and preserves the wall-facing rotation and pose in v1 drafts; no support/floor collider for its decorative wall anchor. The used wheeled whiteboard remains a floor-standing object. Added catalog categories Abandoned Office Boards (2 models) and Peeling Posters & Paper (6 wall stamps), total 602 → **610**. Exact source page/download URLs, hashes, dimensions and credit in `assets/vendor/builder/wall-decay-v100/manifest-v100.json` and `LICENSES.md`. The poster stamp path whitelist and source GLB whitelist are extended narrowly; the 41-room canonical shell, Builder saves/exports, 36 prior grime decals, all v98/v99 assets, placement settings Snap OFF/Allow overlap ON, cinematic and campaign are unchanged. v100 focused desktop browser/hash tests and publication must be checked before calling this shipped. Temporary write-enabled vendor workflow should be deleted before merging.

---


## Builder v99: replace all ten generated contractor models with real third-party source models (2026-11-11)

**Owner request:** Replace every Python/Trimesh-generated 3D contractor prop from v98 with genuinely found downloadable third-party models; never generate more mesh stand-ins. Six CC0 Innerscene models were downloaded as exact original GLBs, and four authored Poly Haven CC0 glTF packages, with real 1K texture maps and source buffer files, were downloaded and repackaged as standalone GLBs. The Poly Haven modular electrical kit supplies its own three straight cable meshes for the loose conduit item. No original 3D mesh was procedurally recreated. Source authors, direct URLs, every source hash, final GLB SHA-256, model anatomy, bytes and license are pinned in assets/vendor/builder/vestibule-v98/manifest-v98.json and LICENSES.md. All ten existing IDs and paths preserved. 19/19 contractor GLBs now sourced. Source material colors and eight original texture-bearing models preserved. The new work light is portable rather than a tall tripod. Innerscene's own modeling method (human vs AI) is unverified, despite its original CC0 designation.

**Safeguards:** 602-entry catalog, Quaternius originals, all 36 wall/ceiling graphics, all 36 grime decals, 41-room shell, saved schema 1, Snap OFF / Allow overlap ON, game runtime and cinematic unchanged. One-time vendoring script tools/vendor-builder-v99.mjs. Temporary privileged workflows must be removed before merge. CI must verify source provenance, actual GLB loading, 602 catalog entries, old IDs and save/reload, no external requests, plus Pages.

---

## Builder v98 post-merge CI reliability follow-up (2026-11-11)

Builder v98 (PR #93) is on main at `97920279d949f7ace3c25fc1127159139133c152`; its focused Builder v98, v97, v96, v95, v93, v87, v90, and v1 PR checks passed, and Pages deployment `43049201291` succeeded. The unrelated, main-push **Store visual regression** `43049203314` failed **before** running screenshots or story/audio checks because `npx playwright install --with-deps chromium` tried to download optional Ubuntu fonts during a GitHub-hosted package mirror DNS outage. There was no evidenced game regression in that failed run.

The minimal workflow-only fix was squash-merged via [PR #94](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/94) as `01de7449b035f0d8b512377a81adb94653fb3512`: full-store CI now uses the same `npx playwright install chromium` as the successful v98 focused desktop tests. The rerun on the new main SHA is [Store visual run 43053151036](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/43053151036); its installation and local-server steps passed, and full deterministic captures began. [Pages run 43053152707](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/43053152707) succeeded. **Check the store run's terminal result before calling the entire regression suite green.** No gameplay, Builder, source GLB, saved draft, collision, cinematic, licensing, or audio changes were made for this CI fix.

---

## Builder v98: placeable contractor vestibule, wall notices, and ceiling cobwebs (2026-11-11)

The user requested **ceiling spider webs**, more period-appropriate wall décor (**adverts, whiteboards, paper calendars, notices and bulletin boards**) plus **wooden pallets, compact forklift and contractor vestibule props**. Built on v97 without changing canonical mall shells, game story, saved layout schema, room finishes, or previously placed props.

**55 new catalog entries** in three coherent categories:
- **Contractor Vestibule & Loading (19)**: nine real Quaternius CC0 self-contained models (wood pallet, broken pallet, two traffic cones, plastic work barrier, spare pipe bundle, concrete cinder block, contractor steel barrel and metal traffic barrier), plus ten original authored GLB models (period-appropriate compact yellow industrial forklift, manual pallet jack, folding aluminum ladder, rolling tool chest, metal toolbox, cable reel, two-tier utility cart, unpowered work light, push broom and loose electrical conduit).
- **Wall Notices & Advertising (28)**: twelve original period-appropriate maintenance/safety/door notices, four faded paper calendars, three aged bulletin boards with multiple notices, three 1990s contractor work-order whiteboards and six retro fictitious Pinewood advertising posters.
- **Cobwebs & Ceiling Dust (8)**: five transparent ceiling cobweb patterns (corners, radial, old draped strands, etc.) and three wall cobweb patterns. Each is separate, feathered and resizeable.

Nine real Quaternius glTF sources come from the publicly archived **Quaternius Zombie Apocalypse Kit** in `agentkaerf/FreeModels` (official source creator CC0 rights verified at https://quaternius.com/faq.html; each original glTF URI/SHA-256 and locally converted embedded-image GLB hash pinned). The compact forklift, hand pallet jack and other ten model meshes were *newly authored in Python/Trimesh* specifically for the Builder rather than using unverified or attribution-required third-party model files. All paper signs and cobweb artwork are *originally authored* in Pillow at 768×768 RGBA. The one-time vendoring source is `tools/vendor-vestibule-v98.py`. File hashes, dimensions, labels, authorship/licensing and local paths are in `assets/vendor/builder/vestibule-v98/manifest-v98.json`. Temporary write-enabled vendoring and link-probe workflows deleted after use. The shippable browser fetches **zero external assets**.

`builder/vestibule-catalog-v98.mjs` independently validates all 55 new manifest records (license, source, file names, sizes, SHA-256) before registration, without altering previous vendor validation or the 36 v97 CC0 grime entries. `builder/main.js` loads the manifest as a local fetch and populates the three new categories. Catalog count changes **547 → 602**; old saved draft IDs unchanged. `builder/decals-v97.js` now additionally handles `surface:'ceiling'` while preserving the strict exact 36 original v97 manifest policy. `builder/editor-scene.js` raycasts the **real underside of room ceiling meshes** (negative world-Y normal), aligns the web stamp to the underside and offsets it slightly, with normal floor/wall placement unchanged; old physical collisions and wall support validation remain intact. Original palette material meshes are not auto-textured. Wall and ceiling decals remain editable with opacity, scale, rotation, selection, copy, undo/redo and saved JSON/IndexedDB (same schema 1). If hiding ceilings, remember ceiling raycast placement requires ceilings shown.

Full original assets and new authored assets audited by `scripts/test-builder-vestibule-v98.mjs`, desktop Chromium `scripts/smoke-builder-vestibule-v98.mjs` and focused `.github/workflows/pinewood-builder-vestibule-v98.yml`. Existing v1/v87/v97 catalog size/style assertions updated. Preserve v96 powered-off CRT, v95 collision warnings, v97 default Snap OFF / Allow overlap ON and 41-room shell.

**Recommended contractor vestibule layout:** old safety/site noticeboard, work-order whiteboard and calendar beside the check-in door; one small pallet stack and manual pallet jack against the loading wall; a rolling tool chest, spare conduit, electrical cable reel and one traffic cone; subtle ceiling cobwebs/dust in high unvisited corners. Keep human passage and opening cinematic contractor-door/pinpad vestibule path clear. Place forklift in the adjoining service/loading zone, not the narrow walkway. No automatic structural scene placement; user controls arrangement in Builder.

---

## Builder v97: 36 surface grime decals, targeted appliance texture scale and preferred defaults (2026-11-10)

The owner approved adding individually placeable **floor and wall stains, dust, scuffs, water streaks and grime** to the standalone Pinewood Mall Builder, and requested fixes for obvious tiny repeated patterns on the **Kenney Trashcan** and **Kitchencoffeemachine** plus defaults **Snap Off / Allow overlap On**.

The development-only `tools/vendor-builder-decals-v97.py` downloaded seven CC0 ambientCG official 1K JPEG source archives (SurfaceImperfections004/005/006, Smear005, Fingerprints001/002, Scratches005). It generated **36 individually named, soft alpha-masked 640px RGBA PNGs** with nonrepeating irregular edge silhouettes, including dust accumulation, scuffed tile, grime and oil/rust/coffee stains, floor puddle rings and varied vertical wall runoff/water damage. All 7 official source ZIP SHA-256s and member IDs, each exported PNG SHA-256/size, source pages and license are pinned in `assets/vendor/builder/decals-v97/manifest-v97.json`. All public browser asset URLs are local. The temporary privileged one-time vendoring workflow was deleted after pinning.

`builder/decals-v97.js` validates the exact on-disk manifest and registers 36 image-bearing catalog entries in new **Surface Decals & Grime** category, without weakening GLB-only vendor registration. It builds noncolliding, transparent two-sided planes with local CC0 RGBA maps, size and opacity presets; `builder/editor-scene.js` raycasts **architectural floors or walls**, rejects preview clicks without a real matching surface, orients the decal along the actual struck surface normal, offsets slightly to avoid z-fighting, lets the mouse wheel rotate within the attached plane, and includes them in existing select/move/scale/undo/redo/export/import/IndexedDB saved layouts. The inspector exposes an optional 0.08..1 opacity slider for only decals. Schema remains `version:1`; an optional per-decal `opacity` property is allowed in placed entries without invalidating legacy layouts. Existing mall shell, ceiling, room materials and story campaign stay untouched.

To fix the two remaining user-reported miniature tiled photo patterns, `isBroadSurfacePropV97` targets just Kenney `Trashcan` and `Kitchencoffeemachine`, routing their source color-only material groups through a single broad panel projection (<=0.92 repeats on the largest mesh axis), while preserving all existing original material roles, geometry, and dark/silver details. Decal additions do not affect fixed model source files or the saved room finish IDs.

Startup now calls `setPlacementOptions({gridSize:0,overlap:true})`, initial DOM and inspector state agree. This is only a Builder preference; the existing strict validation remains fully available on unchecking Allow overlap and never applies to the playable campaign. Old v1/v87 desktop expectations updated.

Focused `scripts/test-builder-decals-v97.mjs` validates 36 RGBA hashes/source ZIP provenance and glTF hash/scale mapping, canvas orientation, and v1 opacity persistence. `scripts/smoke-builder-decals-v97.mjs` validates live desktop Chromium including initial settings, source can/coffee meshes, real local textures, opacity changes, reload/export, no external requests. Focused CI `.github/workflows/pinewood-builder-decals-v97.yml`; existing v1/v87/v91 material workflows. PR #92. Confirm CI and GitHub Pages before claiming live.

---

## Builder v96: de-energize original 1990s CRT screen (2026-11-10)

User requests that placed desktop computer screens appear **blank and unpowered**, replacing the green imagery currently baked onto their faces. The exact source is the already licensed CC-BY GLB at `assets/vendor/builder/models/era-v87/retro-crt-pc-1990s.glb`. Its separately authored `Monitor_Glass` material contains the display texture; the named `Additional_Reflection` mesh / `Monitor_Reflection` geometry is a composited overlay. The original model has twelve meshes, eight materials and twenty embedded source images. The 1990s case, cream housing, keyboard (source material `Ucupaint_Keyboard_Creme`) and mouse (`Mouse_Cream`) must retain their image maps.

Builder-only `builder/crt-powered-off-v96.js` now replaces **only** `Monitor_Glass` on each cloned GLTF instance with near-black, fully opaque neutral `MeshPhysicalMaterial`, with emissive black, no map/alpha/emission texture and a small physically lit glass clearcoat sheen. The source's separate reflection overlay is hidden without deleting its geometry. It fails loudly if the expected named screen and reflection anatomy change, to avoid accidentally recoloring the beige case or peripherals. `builder/editor-scene.js` invokes this during `template()`, therefore it applies equally to newly placed CRTs, existing saved placements, previews and the legacy Kenney LCD catalog alias that was previously redirected to the exact CRT model. Original source GLB bytes, 20 source textures, licenses, catalog and playable game are unchanged. No new runtime downloads.

Unit tests in `scripts/test-builder-crt-powered-off-v96.mjs` validate source model hash/parts, unpowered screen texture and emission, disabled baked overlay and non-mutated original model material with intact image-bearing keyboard/mouse. Desktop Chromium in `scripts/smoke-builder-crt-off-v96.mjs` verifies the real loaded GLB in three placements including the old LCD alias, screen/overlay state, preserved source case/keyboard/mouse, reload/import persistence, and no external network loading. Focused `pinewood-builder-crt-off-v96.yml`; asset audit. PR #91. Confirm targeted tests and GitHub Pages publication before claiming live.

---

## Builder v95: visible warnings for failed selected-object transforms (2026-11-10)

User confirmed a selected desktop CRT stopped rotating because **Allow overlap** was disabled and its existing collision check was rejecting further yaw turns; the true reason was already in the small save-status text but went unnoticed. User approved adding a more obvious in-scene warning. The previous speculative v94 PR #89 (changing support collision semantics) was **closed unmerged**; core collision validation on main remains unchanged.

Builder-only v95 adds a viewport overlay `#collision-warning`, with `role="alert"` and `pointer-events:none`, that appears **anchored near the selected object's world-space bounding-box top**, follows the camera frame by frame, clamps to viewport, and uses a fallback location if offscreen. Persistent until resolved or dismissed via successful edit, deselection/new selection, Undo/Redo, or updating **Allow overlap**. `blocked-feedback-v95.mjs` translates existing validator reasons into specific **Rotation blocked**, **Move blocked**, **Scale blocked** warnings, plus a direct, relevant explanation and the optional Allow overlap tip. The existing inspector save-status message stays in place. It is purely ephemeral UI state and deliberately NEVER touches exported JSON, IndexedDB or reversible draft history.

Desktop Chromium regression `scripts/smoke-builder-blocked-feedback-v95.mjs` tests a real baseline stool's rejected inspector move, banner visibility/accessibility/position and unchanged draft, and a real placed CRT's rejected wheel rotation outside floor support, warning persistence, Allow overlap checkbox clearing it, and successful wheel rotation afterward. Unit tests exercise warning reason classification. Dedicated focused workflow `.github/workflows/pinewood-builder-blocked-feedback-v95.yml`; normal Builder v87 checks run independently. No new assets, physics/validation changes, campaign changes or remote runtime fetches. PR #90. Confirm PR checks and GitHub Pages before reporting live.

---

## Builder v93: cardboard box physical-material correction and source keyboard/mouse restoration (2026-11-10)

Owner supplied a screenshot of both existing Kenney `Cardboardboxopen` and `Cardboardboxclosed` still showing intense timber-like surface pattern after v92, and reported that keyboard and mouse accessories lost their previous visual detail; requested exactly their **pre-material-change original model appearance**, not another computer accessory texture.

Full source GLB inspection (using connected GitHub Action `scripts/inspect-builder-asset-sources-v93.mjs`) confirmed:
- Both box GLBs contain one mesh with **88 source vertices / two material groups**, but those two source material names are **`wood` and `woodDark`**, misclassified as wood instead of cardboard. Neither box has image maps; the original shapes, interior folds and group boundaries are retained.
- The standalone original `kenney-furniture-kit-computerkeyboard` is a 38-vertex two-color low-poly GLB with source materials **`metalDark` and `metalMedium`**; the standalone mouse has 113 vertices and source material **`metalDark`**. Their original sources have **zero** embedded image maps, so do not invent texture detail or swap in other models under those existing IDs.
- The completely separate and more detailed CC-BY 1990s CRT bundle has **20 source images**, with dedicated original `Ucupaint_Keyboard_Creme` and `Mouse_Cream` image maps that must remain intact.

Created `builder/cardboard-materials-v93.mjs` for exactly the original two cardboard model/material names and `builder/prop-materials-v91.js` routes those roles to locally pinned correct **ambientCG CC0 real cardboard photos** instead of wood. Two 1K diffuse JPEGs are vendored under `assets/vendor/builder/materials-v93/` (Cardboard001 worn for open, Cardboard002 smooth for closed). The manifest and LICENSES record official URL, archive SHA-256 and source and distributed JPG hashes. Photo projection uses **0.82 broad repeats per cardboard panel**, preserves 2 distinct source surfaces, and applies properly matte nonmetallic shading instead of wood or metallic. Source GLBs are never modified. One-time write-enabled material-download workflow deleted from branch after source pinning.

`builder/source-peripherals-v93.mjs` explicitly clones the exact original standalone keyboard/mouse source GLB meshes and materials per Builder instance and bypasses auto-texturing, preventing shared GLTF clones from altering their original color palettes. The original mapped CRT keyboard and mouse are untouched and remain inside the CRT bundle. Existing Builder saved JSON, 41 rooms, canonical mall geometry and campaign remain unchanged.

Focused source/license/geometry/restore checks in `scripts/test-builder-cardboard-peripherals-v93.mjs`; desktop Chromium in `scripts/smoke-builder-material-v91.mjs` includes exact material roles, source image paths, box surface scaling, peripheral original color, CRT source images and import/reload. Update all old v91 source material role audits with the specific two legal cardboard roles. PR #88. Verify current CI and Pages after merge before claiming public.
 
---

## Builder v92: whole-panel texture scale and colored keyboard/mouse (2026-11-10)

User supplied a real Builder screenshot of a desk with CRT, keyboard and mouse
showing painfully obvious small repeated image stamps on desk wood and
metal hardware. They specifically requested **less repetition / much bigger
tile scale or stretch**, and **return keyboards and mice to their original
solid colors**. Root cause: v91 assigned every source-colored GLB texture
a small per-face projected UV grid (`tileMeters: .48` on wood, `.72` on
other materials). Some source color-only GLBs also had usable but repetitive
original UVs, so only changing missing UV projection would be insufficient.
Room finishes likewise repeated every 2.6 m, including carpet and plaster.

Builder-only `builder/material-scale-v92.mjs` implements precise reusable
policies. `builder/prop-materials-v91.js` now projects photographs across
**a single broad furniture panel** with source-geometry aspect ratio
(`boxProjectFurnitureUVV92`, <=0.92 repeats on its longest axis), even
where a source color-only mesh has existing UVs. This happens on cloned
geometry only when no material in that mesh has a source image map, to
avoid destroying licensed source UVs. Furniture ordinary `wood` maps to
the already pinned smooth `oak_veneer_01` photo rather than v91's
noisy `wood_table_worn`. Distinct `woodDark` and `metal` group
assignment remains. Nonfurniture UV-free meshes receive a larger
proportional repeat scale. Name-based protection bypasses every standalone
keyboard and mouse source and keyboard/mouse child mesh, even when named
wood/metal. Original colors, geometry, saved layouts, story runtime and
binary asset hashes are protected.

Room-finish UV scale now caps repeating carpets, plaster and organic surfaces
at 1.55 cycles per panel, intentionally patterned tile floors at 2.7,
and leaves 1990s acoustic ceiling tile grid at 2.6-m cycle spacing.
Both original and new room finish IDs are preserved. Tests:
`scripts/test-builder-material-v92.mjs` validates actual source keyboard
and mouse GLBs, exclusion behavior, full desktop UV spread, role mapping
and room finish repeat bounds. Expanded desktop smoke
`scripts/smoke-builder-material-v91.mjs` checks actual desk full-panel
oak veneer/independent metal plus real keyboard/mouse remaining texture-free,
alongside existing room-finish persistence and no external network.
The focused `pinewood-builder-material-v91.yml` workflow runs v91 and v92
tests. PR #87. Review targeted CI and GitHub Pages after merge.

---

## Builder v91: 50 new CC0 room materials and multi-surface 1990s props (2026-11-10)

User requested as many additional appropriate **wall, ceiling and floor textures** as possible and a comprehensive improvement of currently flat-colored asset materials. The original source audit had **324 of 482 new CC0 GLBs with no embedded image** plus **12 of 21** original selectable source models. Inspection of **1,051 primitive parts** revealed **458 primitives without usable TEXCOORD_0**, and revealed actual Kenney material groups: desks have `wood` and `metal`, and cabinet drawers have `wood`, `woodDark` and `metal`.

A one-time, write-controlled vendor used the official Poly Haven CC0 material catalog/API to select and download **50 genuine 1K JPEG diffuse photos** directly into `assets/vendor/builder/materials-v91/`; all are locally pinned to **official source page, source URL, SHA-256, bytes and CC0** in `manifest-v91.json` and `LICENSES.md`. One verified asset lacked the requested JPEG and was skipped; only successfully pinned IDs were added to the generated `builder/material-options-v91.mjs` allowlist. **20 new wall, 13 floor, 8 ceiling choices** supplement, never replace, previous immutable saved IDs; swatch thumbnails in the room finish inspector show the actual selected image. Two of the 50 are shared between room and prop roles; the material role map offers **18 semantic prop texture styles**. The temporary write-enabled GitHub vendor workflow was removed from main and feature branch after successful vendoring. The reproducible `tools/vendor-builder-materials-v91.mjs` is development-only; it is NEVER shipped as a browser fetch path.

New `builder/prop-materials-v91.js` applies CC0 images on separate original named GLB material surfaces, preserving original wood and metal tint instead of coating entire models or changing original .glb bytes. Named wood/woodDark/metal/fabric/leather/stone/panels are mapped individually; plain palette accents, transparent glass, CRT screens, emissive glows, plants and preserved original image maps remain untouched. For missing/degenerate source UVs, generator clones the mesh geometry and creates per-triangle box-projected UVs without changing positions, model scale, groups, or collider geometry. The original 41-room mall, playable campaign and v1 JSON layout schema remain unchanged.

`scripts/test-builder-material-v91.mjs` independently verified 50 SHA/source/CC0 records, complete 324 color-only source audit, and true desk/cabinet GLB material names. **258/324** source color-only new models contained appropriate named parts for enhancements (436 source material groups); the other 66 remain the source colors rather than receiving inappropriate blanket maps. `scripts/smoke-builder-material-v91.mjs` passed in desktop Chromium: original 68 Builder fixtures inspected, 55 independently texture-enhanced; placed desk had **different wood and metal JPEGs** and cabinet had **three distinct wood/woodDark/metal maps**; 41-room finish choice, original save/JSON import/reload, no external visitor network requests and no runtime errors passed. Focused workflow `.github/workflows/pinewood-builder-material-v91.yml` and existing v1/v87/90/asset checks. [PR #86](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/86). Confirm final PR head checks and Pages rollout before claiming live.

---


## Builder v90: contractor vestibule and every room's visible wall finishes (2026-11-09)

Owner found **Contractor Service Vestibule**'s outside mall wall did not change with the room's wall texture and requested a full-mall audit. Root cause in v87: `renderWalls` measured the nominal 0.46m canonical exterior wall, but the Builder hides the canonical front elevation and mounts the opening cinematic's real 0.90m-thick facade. The material plane was hidden inside the replacement solid. The previous renderer also painted some 12.8m exterior walls all the way above rooms' actual ceilings, and overlapping room-wall source segments could produce coplanar duplicate finishes.

New **Builder-only** `builder/room-wall-layout-v90.mjs` reads all FIVE actual local opening-scene facade wall meshes (left/right broad wall, two service-side infills and the door header) from `stage.world` via its unchanged source `serviceEntry` references. `builder/exterior-scene.js` exposes this physically measured source, `builder/main.js` passes it to the finish renderer, and `builder/room-finishes-v87.js` uses a shared geometry planner. Actual wall rectangles are clipped to each room and the real ceiling underside (or B1/M1 room height), face into the room rather than hiding in the wall, and partition overlaps are resolved into non-overlapping faces. Contractor door opening stays fully clear; the true head above it now takes the finish. Adjacent Boarded Main Entry gets its own finish. Preserve all 41 original rooms, existing walls/colliders, genuine facade, story doors, user layouts and campaign. No new assets, third-party runtime loads, invented mesh architecture, or schema migration.

`scripts/test-builder-room-walls-v90.mjs` runs a **41-room, three-level** source-wall geometry audit including exact staged door opening, independent vertical bounds, source wall face coverage and non-overlapping skins. `scripts/smoke-builder-room-walls-v90.mjs` checks the actual Builder in desktop Chromium, the real exterior geometry, per-room rendered panel counts and persistence/undo/redo. Focused workflow `.github/workflows/pinewood-builder-room-walls-v90.yml` plus existing v87/v1 Builder suites. Verify CI and Pages before claiming public deployment.

---


## Builder v89: scroll rotates existing selected objects, not the camera (2026-11-09)

Owner reported scrolling still zoomed the camera instead of rotating the **selected object**. Root cause: v87's `editor-scene.js` wheel handler returned immediately unless `placing && ghost`, so it covered only a model's pre-placement preview; selecting a saved or baseline object left the wheel for OrbitControls. v89 intercepts ordinary canvas wheel input whenever an existing prop is selected, dispatches 15-degree yaw changes through the same collision-checked, undoable, IndexedDB-persisted transform pipeline, and serializes rapid wheel gestures to avoid lost rotations. **Shift+wheel** zooms the camera while an existing item is selected; ordinary wheel zoom works when nothing is selected. Preview rotation and Shift+wheel depth are unchanged.

For slow-loading GLB previews, orbit navigation is disabled as soon as loading starts, and wheel turns made during loading are applied to the model once ready. Escape and load errors restore Orbit controls. Explore/Fly navigation also treats a pending preview as a placement interaction. Visual text in the inspector and Builder guide now explains both selected and preview behavior. Focused desktop regression `scripts/smoke-builder-v87.mjs` exercises real wheel input on an existing catalog prop **after** placement, original baseline furniture, multiple rapid turns, persisted transforms, undo/redo, and camera zoom only after deselection; previously missing in the v87 preview-only coverage. Campaign, Chapter scripts, assets, user drafts and runtime library code are unchanged. Check the dedicated Builder v87 workflow and GitHub Pages after merge; do not claim published until Pages succeeds.

---


## Builder v87 precision placement, independent finishes and 1990s CC0 props (2026-11-09)

[PR #82](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/82) upgrades only the standalone World Builder. The main campaign/story and canonical structure remain protected and unchanged. New viewport precision reticle follows pointer or locked screen center. Default `Snap` = 0.5 m with 0.25/0.5/1.0 m real grid options; optional free placement. Default `Allow overlap` is OFF: new props/inspector/gizmo transforms are checked against original wall bounding volumes and actual walkable floor or existing furniture support, rejecting unsupported/wall-clipped items unless the checkbox is enabled. Do not force migrated old drafts through new collision rules on load: old layouts remain valid. Preview wheel rotates **only prop**, Shift+wheel changes depth. Selecting/placing a model no longer initiates unintended camera pointer-lock; asynchronous model loading is tokenized so a stale CRT preview cannot later replace a new selection.

`builder/room-finishes-v87.js` uses room-clipped, zero-collision cosmetic surfaces over the real floor plates, partition interiors and room ceilings. Walls/floors/ceilings are separately selected per room and do NOT share material mutations or paint each other. Works with existing roof cutaway, original atrium, collision, chapter geometry. Original five runtime materials and acoustic ceiling images are reused. Six additional source-authenticated 1K CC0 Poly Haven wall/floor JPGs were pinned at `assets/vendor/builder/finishes/` with SHA-256 in `manifest-v87.json`. Optional v1 `draft.surfaces` persists via the same IndexedDB/save/export/import/undo/redo; old v1 JSON imports without a surfaces map still work.

`assets/vendor/builder/era-catalog-v87.json` registers eight fully local original GLBs: the genuine **MadeByYeshe (CrazyDrPants)** 1990s CRT desktop computer remixed by **TTT/tt-toe** (CC-BY-4.0 with full source/license/attribution in `LICENSES.md`), two CC0 desktop tower computers and five CC0 abandoned-mall debris/refuse/1989 magazines props. All source hashes and license pages are pinned. The Kenney flat-screen LCD model is hidden from new placement choices; old saved instances using that ID are remapped visually to the real CRT. No third-party browser runtime URL is used. Development-only one-time asset-vendoring write-enabled workflows were deleted after pinning source models and materials.

Follow-up polish: Explore-mode clicks on hovered/dragged transform gizmo handles are now excluded from camera pointer-lock, and canceling an invalid placement always clears the red reticle even after the preview disappears. This does not modify campaign controls.

Testing: `scripts/test-builder-v87.mjs` audits SHA/license/source, backwards-compatible finish persistence; `scripts/smoke-builder-v87.mjs` tests actual Chromium preview scroll/camera isolation, reticle, snap intervals, collision default/explicit overlap, independent finish rendering, undo/redo/export/reload. Focused GitHub Action `pinewood-builder-v87.yml`. Initial targeted v87 Chromium run `42695770361` passed including desktop WebGL (`PINEWOOD_BUILDER_V87_DESKTOP_PASS`) and Node/local-asset audits. Existing broader v1 smoke uses explicit overlap opt-in for its historical intentionally arbitrary placement coordinates, rather than weakening the new default. Confirm final PR/CI and GitHub Pages status before calling v87 published.

---



## Camera-visible dead-tree relocation (2026-11-09)

Owner observed that the four genuine leafless dead trees were all too far behind the opening camera to be appreciated. PR #81 moves **three existing CC0 models**, without modifying GLBs, into the soil of three original **V64** enlarged licensed mall-front weathered planters at x=-24.7, -17.5, and +3.7 (z≈-18.9; soil y=1.10 m). The original v63 shrub/pot assets, planter count (8), opening sedan, façade, service door, all 196 open-ended marked parking spaces, licensed props and saved Builder draft remain unchanged. One fourth bare tree remains on the outer lot perimeter for wide exploration. No new scenery geometry is authored or fetched.

`opening/parking-layout-v84.mjs` now imports the authoritative `opening/landscape-layout-v64.mjs` planter positions instead of guessing where soil is located, and `opening/parking-props-v84.js` respects the soil-height offset. Focused `scripts/test-parking-tree-sightlines-v86.mjs` uses the ACTUAL `HumanCameraRig` and 66° cinematic lens: all three foreground trees appear at multiple authored camera phases; real seated arrival, car-exit and mall-approach shots all frame dead-tree silhouettes. Regression checks also enforce >5 m of contractor walking-route clearance and the existence of the original licensed planters. Desktop `scripts/smoke-parking-v84.mjs` confirms three frontage trees, four total original dead tree models, eight licensed props, unchanged 279 painted markings and usable Editor. Read latest PR workflow and GitHub Pages run before claiming live.

---


## Open-front parking bays and truly leafless sourced trees (2026-11-09)

The owner rejected the boxed-in 196 stall outlines and original pine-like parking trees. [PR #80](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/80) redefines each v84 row's open aisle-facing side in `opening/parking-layout-v84.mjs`, draws side stripes and **only the closed rear line**, and deduplicates the rear seam shared by back-to-back rows: 279 painted segments (versus 319 before), with all 196 spaces still aligned, the original licensed sedan centered, and the contractor lane unobstructed.

Four original pines have been removed and replaced by **two each of two unmodified leafless CC0 models**, source-pinned locally at `opening/assets/v85/`: gnarled Gothic dead tree and bare post-apocalyptic dead tree. The manifest records original model pages, immutable upstream download versions, source authors/license, bytes, and SHA-256; `scripts/test-parking-v84.mjs` independently checks both hashes and forbids outside network references, procedural replacement props and any return of pines. Four existing Kenney trash cans stay. The one-time GitHub Actions vendoring writer was deleted after both unchanged GLB files were committed; the development-only vendoring script is retained for provenance/reproducibility, not used by runtime.

The cinematic and standalone Builder still share the same exterior. `scripts/smoke-parking-v84.mjs` checks 196 open parking spaces, 279 paint segments, four verified bare trees, eight total licensed decorations, original eight weathered planters, exact sedan and original façade, no external browser assets and intact walkable parking/saving. No changes to the protected campaign narrative or user Builder draft. Verify current PR and GitHub Pages deployment status before reporting the live site updated.

---


## Central atrium ceiling shown in World Builder (2026-11-06)

[PR #75](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/75) merged as `d1430628e8c052568b9b2bb40d867a5227142b79`. The physical shell already includes a glazed, twelve-metre-high central atrium skylight (`atrium-skylight`) and separate ground-floor room ceilings, but `builder/editor-scene.js` explicitly initialized `setRoofVisible(false)`, and the `Roof / ceilings` checkbox started unchecked. The standalone Builder now starts with both roof groups visible and the checkbox checked. The owner can still uncheck it to cut the roof away for top-down placement; the story runtime is unchanged.

Focused Builder run `42267392663` passed all pure model checks and full desktop Chromium editing smoke (`PINEWOOD_BUILDER_DESKTOP_PASS`, 41 rooms, 60 existing fixtures, 503 catalog models), including direct mesh/group presence and reversible visibility assertions. GitHub Pages build `42268381463` produced an artifact successfully but the deployment service left the rollout in `deployment_queued` before failing. Confirm a subsequent successful Pages run before claiming the public URL is updated.

---

## Connected cinematic parking lot in standalone Builder (2026-11-06)

[PR #73](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/73) merged as `31b8838e9a318dbd589dc34db9c2b7acd88141ff`. The standalone `/builder/` mounts the SAME original opening-cinematic exterior from `opening/scene.js` and `opening/facade-v65.js` after preloading it: licensed sedan, asphalt, streetlights, rain, storm sky, cracked sidewalk, weathered boarded facade and all eight scaled dying-planter GLBs. The canonical mall's overlapping old front elevation is retired in the Builder as it is in the cinematic. The original staging assets remain protected; new catalog props can be placed on transparent raycast parking/sidewalk surfaces and persist in the existing draft.

The `Parking Lot (Cinematic Exterior)` jump option connects orbit, walk and fly navigation to the lot. `mall/editor-traversal-v1.mjs` uses the exact slab and sidewalk footprints for gravity landings; game chapters and story doors are unchanged. New focused regression `scripts/test-builder-parking-v1.mjs` plus desktop `scripts/smoke-builder-v1.mjs` passed the complete Builder workflow (26 Node tests, 503 models, mouse-click placement on asphalt), and cinematic continuity workflows passed on the PR. Consult the latest GitHub Pages run before reporting publication; the first deployment timed out in GitHub's `updating_pages` state and a same-run retry was canceled.

---

## Standalone Pinewood World Builder shipped (2026-11-05)

**Current feature:** [PR #69](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/69) merged into `main` as `b4e1599acabb9732a271e460a506cf99bc8715aa`. The approved standalone editor is at **`/builder/`**, separate from the playable chapters. See [builder/README.md](builder/README.md) for controls and exact source paths. Check the latest Pages run for publication status.

- All 41 original rooms / three physical floors; 60 v69 licensed fixtures and seven safe pre-v69 decorative assets editable. Original building walls, stairs, shafts, chapter evidence and protected service panels remain fixed. New genuine silted CC0 fountain replaces only the old artwork in Builder preview.
- 482 new pinned **CC0 GLBs** plus 21 existing locally licensed selectable model types (503 total), including 1989 mall/arcade, storefronts, computers, chairs, benches, food clutter, dark/fallen trees, damaged props and seasonal holiday decorations. All 482 binaries are repo-local under `assets/vendor/builder`, with per-file SHA-256/source/license records in `catalog-v1.json` and `LICENSES.md`. Development-time collection via `tools/vendor-builder-cc0-v1.mjs`; no browser CDN requests or forbidden Cassette Castle shelves.
- Transform gizmos, searchable/filtered thumbnail catalog, ghost placements with scroll depth, move/rotate/scale/duplicate/remove, undo/redo, IndexedDB autosave and portable JSON import/export. Room jumps, WASD walk, F fly toggle, gravity fallback, and openable editor-only doors; no chapter door-lock change.
- Opt-in `mall/editor-overlay-v1.mjs` is available **only** for a later *specific owner-approved exported layout*. Do not auto-load a user draft into the story runtime or invent an approved decoration plan.
- Verification: focused Builder run `42121519719` passed **23 Node checks and desktop Chromium smoke**; reported 41 rooms, 60 v69 fixtures, 503 selectable model types and zero external browser requests. Separate vendoring run `42120183832` passed full SHA-256 and CC0 audit for 482 models. Do not run unrelated production hardening for minor Builder edits; follow `AGENTS.md`.

---

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** Use the connected GitHub connector first for Pinewood repository work.  
**Source-of-truth rule:** Read this file, `AGENTS.md`, `STORY_BIBLE.md`, and `NARRATIVE_IMPLEMENTATION_PLAN.md`, then inspect the actual current `main` HEAD and current workflow runs. The repository and the user's newest explicit request override old chat history.


---

## Car-door onset, exterior rain, and dashboard clock: v83 (2026-11-05)

**User request:** Start CarDoorOpen and outside rain at the first actual driver-door movement (not when the character finishes exiting), and move the 12:47 AM clock farther onto the sedan dashboard. Provide the unedited full dialogue for user-directed possible cuts; do not change the script without specific edits.

- First door rotation begins at owner phase .06. `opening/cinematic-sfx-cues-v82.mjs` exports shared `CAR_DOOR_OPEN_PHASE=.06`; `opening/camera-v65.js` hands off car/outside rain on that same frame; `opening/sedan-v75.js` closes its original physical front-left door exactly four seconds after the opening sound. Existing 1-5-8-3 beeps and contractor door sounds remain unchanged.
- `opening/dashboard-clock-v71.js` now searches actual upward-facing surfaces of the original sedan dashboard, converts the raycast surface normal to the same car-local coordinate system as the clock, and angles the screen toward the driver's seat. Keeps original GLB, covered roof, view clearance, 12:47 AM raster-style face and no substitute dashboard model.
- Both production New Game and review load v83 modules with cache-busting imports. Regression `scripts/test-door-rain-clock-v83.mjs`, v82 sounds, v72 acoustic tests, v75 sedan desktop screenshots and v72 dashboard integration checks. The original spoken dialogue in `opening/script.json` is intentionally untouched, pending the user's selection of cuts.

**Status:** [PR #63](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/63) squash-merged to `main` as `86c5116aa40eda7b02d1dc9c1924e49b5aa3f633`. Desktop v83 sound/physical-door tests and v72 cockpit/rain/clock checks passed on the development branch, with the clock measured on `Interior_InteriorPanel_0` at car-local y≈0.868 m, facing the driver with all four display corners unobstructed. Main-branch CI and Pages publish are asynchronous; consult current GitHub Actions runs before reporting their final status.

## Original owner-provided opening sound effects: v82 (2026-11-05)

**User request:** Beep on each physical keypad touch; contractor metal door open when it swings open and close as the player crosses into the vestibule; car door open as the player exits and close exactly four seconds later.

- Five unaltered owner-provided PCM WAV assets are bundled at `opening/audio/cinematic/v82/` with SHA-256 hashes in `LICENSES.md`. No external audio requests.
- `opening/cinematic-sfx-cues-v82.mjs` schedules original 1-5-8-3 contact beats on the media timeline, owner exit at phase .21 with exact +4-second closing, contractor door at inside phase .01 and .54. `opening/cinematic-sfx-v82.js` decodes all effects behind the loading cover and shares the existing gesture-unlocked, pause-aware rain AudioContext.
- `opening/sedan-v75.js` closes the real car mesh after the delayed slam; `opening/camera-v65.js` closes the actual service door once the character enters the vestibule. Original phone grip, keypad pose, mall geometry, dialogue and hand-authored camera route are unchanged.
- Regression: `scripts/test-cinematic-sfx-v82.mjs` and desktop Chromium `scripts/smoke-cinematic-sfx-v82.mjs` in `.github/workflows/cinematic-sfx-v82.yml`. No mobile/manual controls testing.

**Verification:** PR #62 and GitHub Actions; validate Pages after merge.

## Stormy night sky, neglected planters and natural keypad curl: v81 (2026-11-04)

**User request:** Retain the independent phone grip and the v79 pointing index, curl the middle/ring/pinky farther inward toward the palm while tapping contractor keys, replace the flat outdoor sky with a storm-cloud nighttime texture, and make all eight imported planter shrubs dying/overgrown with pots as dark green as the Pinewood Mall sign background.

- `opening/keypad-reach-v72.js` gently deepens three non-index finger hinges from the original CC0 forearm pose (not the phone hand), flexing DIP and MCP by smaller anatomical amounts; the thumb remains tucked and the index stays extended and physically aligned to all four buttons. The original phone GLB, pose and animation code are completely unchanged.
- `opening/assets/v81/storm-night-sky.jpg` is a new original 1536×768 locally stored photographic storm panorama. The scene waits for this same-origin JPEG and applies it as an equirectangular background **after** v37 atmosphere setup to avoid mist/haze overwriting the sky. The separate v80 sidewalk and ceiling finishes remain.
- `opening/landscape-v63.js` uses the same eight authentic GLB pots and shrubs, adds dried-out brown/olive leaf coloration, varied sagging leaf geometry and subtle non-identical lean, and paints the pot material `#21332f` to match the sign's principal background. No primitive plant replacement; v64 planter positions and scale remain unchanged.
- Regression: `scripts/test-storm-decay-v81.mjs` and desktop Chromium `scripts/smoke-storm-decay-v81.mjs`, workflow `.github/workflows/storm-and-decay-v81.yml`, plus existing v78/v80 suites. No manual WASD and no mobile tests.

**Live verification:** Complete CI and Pages deployment after merging; use current GitHub runs as source of truth.

## Age-appropriate ground-floor ceiling and sidewalk materials: v80 (2026-11-04)

**User request:** All previously added ground-floor room ceilings should have appropriate period finish; the front pedestrian sidewalk should look visibly dilapidated. Maintain the stable phone/keypad hand poses, the unified mall threshold and the selected sedan.

- **Root cause:** v79 placed ceiling mesh geometry but `mall/render-shell-v67.js` referred to undefined `mats.shopCeiling` and `mats.plasterCeiling`; the Three.js material default concealed this wiring mistake, leaving white untextured undersides. The exterior v65 sidewalk slab in `opening/scene.js` likewise used only a plain colored material.
- **Original local materials:** `opening/assets/v80/` contains three newly generated, inspected, 1024×1024 compressed albedos: grimed and water-stained mineral acoustic tiles in retail, mottled plasterboard in non-retail staff/gallery rooms, and fissured moss-stained concrete on the 103×9.6 m exterior pedestrian strip. SHA-256 provenance is in `LICENSES.md`. The source textures live wholly in the repository, with no remote runtime fetches.
- **Correct geometry/scale:** `mall/physical-shell-v67.mjs` includes new local texture paths; the renderer makes two actual `MeshStandardMaterial` finishes and scales shop tile repetition to ~2.44 m/UV sample for realistic 1.22×0.61 m sections. Staff plaster repeats every 3 m. Sidewalk UVs tile about every 3.4 m (no full-width stretch). Its original curb/parking geometry, service entrance and old production appearance stay preserved.
- **Preload and QA:** The v65 opening's existing opaque first-frame cover waits for the new sidewalk image, while the canonical v69 mall preload waits for both interior ceiling images. `scripts/test-surface-finishes-v80.mjs` verifies materials, per-room assignments, source hashes, and loading contracts; desktop Chromium `scripts/smoke-surface-finishes-v80.mjs` examines actual scene maps and captures ceiling/sidewalk images through fixed review probes. Workflow: `.github/workflows/architectural-surfaces-v80.yml`. No manual WASD and no mobile testing.
- **Merge/Pages:** Pending verification at authoring time; use the latest GitHub PR, Actions, and Pages runs as source of truth.

## Native keypad hand and ground-floor ceilings: v79 (2026-11-04)

**Source PR:** [#58](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/58). User observed that v78 looked anatomically bizarre while reaching the keypad, and requested a relaxed point from the original imported finger poses, keeping the phone-grip animation **exactly unchanged**. User also requested ceilings in all ground-floor rooms.

- **Hand root cause:** the v78 keypad mutated the already extensively reshaped cellphone-holding rig, then applied large multi-bone rotations to produce a clenched fist. The keypad now creates a separate instance of the same repository-local CC0 MakeHuman forearm GLB, records its genuinely original joint quaternions at load, gently straightens the source index and relaxes/curls the other three fingers, with the original weighted index flesh hitting keys 1-5-8-3. The phone rig stays attached to its original camera with no pose changes or restore action during keypad entry.
- **Architecture:** v67 physical shell now generates distinct ground-floor ceiling undersides from each enclosed room's exact rectangle. Height follows staff and retail proportions, with separate west/east gallery ceilings; the central 12-metre atrium retains its existing glazed roof. Actual freight lift, basement fire stair and administrative stairs are cut out using the existing rectangle subtraction method. Ground ceilings are shown/hidden with the roof control for the architectural cutaway.
- **Regression:** The pre-existing v78 desktop pointer smoke now verifies native joint pose, modest finger bends, true skinned-index contact and phone pose unaffected mid-entry. Physical shell Node test checks room coverage, height and all three shaft openings. Do not add mobile test matrices. Verify GH Actions and GitHub Pages before calling this complete.

## Contractor keypad index-pointing gesture: v78 (2026-11-04)

**Source PR:** [#57](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/57). User specifically requested that the opening cinematic's numpad entry no longer reuse the cellphone-holding grip. The index finger should point and press all four buttons; thumb, middle, ring and pinky should remain curled.

- **Root cause:** `opening/keypad-reach-v72.js` previously called `hand.update(press)`, which only flexes the cellphone grip's THUMB; its root was also anchored to the phone thumb target rather than an index finger.
- **Gesture:** During keypad entry, reuse the same connected skinned CC0 forearm but save its exact phone grip first. Align the native index MCP away from the phone edge, straighten both index PIP and distal phalanx to the actual weighted fingertip skin, and curl the other four digits inward. Camera-aligned orientation makes the extended pointing finger legible in the first-person shot. Each 1-5-8-3 key is reached by the original weighted index fingertip skin, with a short lift between contacts. End of reach restores all 15 finger joint quaternions and the original phone-model orientation.
- **Preserve:** Same licensed rig and asset, no extra geometry or disembodied hand, and all earlier v77 continuous-mall entry, service-door response, chosen v75 sedan, dispatch dialogue and phone animation are unchanged.
- **Regression:** `scripts/smoke-keypad-point-v78.mjs` and `.github/workflows/keypad-point-v78.yml` measure real bone angles, all four skin-to-key contact distances, phone grip restoration on replay, and no remote assets or browser exceptions. The legacy v72 smoke assertion now follows the actual index instead of the old thumb.
- **Verification:** [GREEN v78 desktop Chromium run 41881936079](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41881936079) checked four actual fingertip-skin contacts, finger curl, phone-grip restoration, no browser errors or remote assets, and saved a verified camera-facing screenshot. The same diagonal build passed [v72 cockpit/keypad](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41881936185), v75 sedan and v62 phone pacing. The older v77 continuity suite had screenshot timeouts with the crowded software WebGL runners, not assertion failures; its screenshot deadline is extended to 120 seconds without changing any gameplay or scene timing. Confirm final GitHub Pages deployment after merge.

## Contractor entrance cinematic continuity: v77 (2026-11-04)

**Source PR:** [#56](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/56). User reported lingering near the Pinewood sign, a sprint to the keypad while an apparently detached arm was already pressing buttons, a long post-grant delay, and a visible old/blank mall through the doorway until crossing.

- **Measured timing failure:** The old `lights` cue made the camera cover most of its last ~12 m in the final three seconds and peaked at **5.14 m/s**. Its keypad forearm started as soon as Renee finished speaking while the camera was still several metres from the pad. The `inside` service-door animation only began at 68% of another **14.66-second** line, and the camera stayed outside for that entire line. RED regression: [entry v77 first CI run](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41861828246), two failing tests.
- **Continuous approach:** `opening/camera-v65.js` advances the walk during `owner`, `entrance`, and `lights` with physical route continuity and no last-second dash. An independent 60 Hz scene-math audit of the new rig measured **2.87 m/s** maximum for the keypad approach and **0.22 m** from the access position at voice end. The actual selected v75 sedan and all original front-door car-exit camera coordinates are preserved.
- **Physical access response:** The real four-button 1-5-8-3 animation still happens after Renee's instruction, with the proven connected MakeHuman forearm brought in from the first-person shoulder side and withdrawn after input. The service door begins swinging immediately upon access confirmation and reaches fully open about **two seconds** later. The camera now follows the open door into the vestibule **during** the `inside` confirmation; the rain handoff follows the real building threshold.
- **One mall, no threshold scene swap:** After preloading, `opening/intro-v65.js` adds the exact licensed v69 physical mall group to the existing v65 exterior Three.js scene, retires the duplicate canonical exterior facade and two front-wall strips, and renders that same graph before and after crossing. The real contractor vestibule is visibly present through the opened door beforehand. The outdoor parking slab stops before the actual indoor floor to prevent flickering overlap. The canonical six-chapter game structure and all locally vendored assets stay intact.
- **Verification:** Dedicated Node timing regressions and desktop WebGL capture assertions live in `scripts/test-entry-sequence-v77.mjs`, `scripts/smoke-entry-sequence-v77.mjs`, and `.github/workflows/entry-continuity-v77.yml`. [Dedicated v77 desktop Chromium run 41865855457](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41865855457) **GREEN**: Node timing contracts and five real WebGL screenshots passed, including the camera at the panel before typing, the actual MakeHuman forearm, door fully open before crossing, and canonical mall already mounted in the same scene. The legacy v71 test was updated to assert unified geometry rather than the now-retired scene swap; v72 avoids a redundant screenshot after a direct WebGL framebuffer capture. Other broader suites and GitHub Pages deployment still need final checking. No mobile tests or manual WASD.

## Current sedan camera and driver-door exit correction: v76 (2026-11-04)

**Source PR:** [#55](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/55). User confirmed that the v75 sedan was a substantial visual improvement, but the player was sitting too far back and passed through the rear door while leaving.

- **Measured root cause, not a model defect:** At the car's real-world 1.86 m width and the existing placement, original GLB `FL_Door` occupies world Z ≈ **16.62–17.50** and the solid `RL_Door` spans **17.58–18.30**. The v75 seated camera began at world Z **17.72**, and the initial exit lean stayed at **17.68**, genuinely overlapping the rear-door region. A geometry-derived desktop regression captured both failures RED in [Actions 41851040793](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41851040793).
- **Correction:** `opening/camera-v65.js` seats the driver at world `[-10.33,1.22,17.42]`, 0.30 m closer to the windshield, and moves toward the open *front-left* doorway at Z ≈ **17.19**, then outside at Z ≈ **17.05**, fully clear of the solid rear door. The wheel remains forward of the eye; the intact roof is still 0.564 m above it. The `FL_Door` animation starts earlier, reaching fully open before the body crosses the side. `opening/assets/v75/manifest.json` and dashboard raycast eye origin reflect the new position. The imported car geometry and license are unchanged.
- **Regression:** `scripts/test-sedan-v75.mjs` now checks the seated eye against measured front/rear door bounds and samples the entire exit crossing; the actual browser `scripts/smoke-sedan-v75.mjs` checks the front threshold and that the original `FL_Door` is open before crossing. Workflow also parses the browser test script before Playwright startup. [Dedicated GREEN run 41851720754](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41851720754): 4 Node tests passed, complete desktop car/clock/door scene passed, no page errors or remote requests. The broader [v72 dashboard/keypad suite](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41851720204) and [v62 pacing suite](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41851374859) also passed.
- **Preserve:** The user's chosen #4 sedan, actual GLB roof and seats, 12:47 AM clock, original driver door hinge, dialogue, rain, external mall and canonical interior. Do not regress eye/exit Z into the rear-door band.

## Current opening vehicle: v75 Low-Poly Sedan (2026-11-04)

**Source PR:** [#54](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/54). User explicitly selected option **#4, scailman's Low-Poly Sedan**, and uploaded the exact original GLB. This section supersedes the old v74 hatchback cockpit; historical v74 notes below remain for context.

- **One original imported car:** `opening/assets/v75/low-poly_sedan_car.glb` is vendored locally, 422,016 bytes, SHA-256 `224db7dfd80b36dccf868f8bc71e221a284df6b8e7dca9986843c382c7722b7e`; source [Sketchfab model](https://sketchfab.com/3d-models/low-poly-sedan-car-aeb2699532b4402e8b75ec8888b800b9), credited to scailman under **CC BY 4.0** in `LICENSES.md` and `opening/assets/v75/manifest.json`. Original 44 mesh parts, real interior, roof, transparent glass, wheel and independent `FL_Door`; absolutely no hand-authored overlapping car body, second windshield, or seat geometry. The old hatchback remains in repo solely as a historical asset; it is **not loaded** by the active intro.
- **Real first-person cabin:** `opening/sedan-v75.js` scales the source to 1.86 m wide, grounds it, and points its nose toward the mall. `opening/camera-v65.js` starts at world `[-10.33,1.22,17.72]`, with an actual overhead roof hit 0.564 m above the eye and a clear forward sightline. The original left-front door rotates around its native hinge from 0 to about -1.11 radians as the camera exits, then closes during the next exterior shot.
- **Factory dashboard clock:** `opening/dashboard-clock-v71.js` now mounts the 12:47 AM readout to a ray-measured `Interior_InteriorPanel_0` dashboard surface at car-local `[0.040,0.979,-0.684]`, approximately one meter ahead of the driver. All four corners are demonstrably unobstructed. The clock glance remains timed to Renee's line. Opening PBR textures, rain/audio transition, access keypad, unchanged mall continuity and desktop-only testing remain intact.
- **Regression evidence:** `scripts/test-sedan-v75.mjs` and `scripts/smoke-sedan-v75.mjs`, run by `.github/workflows/sedan-v75.yml`. The **desktop v75 full test is GREEN** in [Actions 41769015366](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41769015366), including screenshots of seated view, clock glance, opening/closing real door; 3 Node tests passed, and Playwright reported no browser errors or remote requests. The equivalent [push run 41769022672](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41769022672) also passed. Continuity, facade, landscape, keypad and broader v72 tests passed at branch commit `505a5f756777d30f5e1c2196114f529e58cb021a`.
- **Do not regress:** Never load the old hatchback in the current cinematic, add a procedural car, place the eye inside a seat/dash, accidentally hide the clock behind trim, animate a separate dummy door, use remote runtime assets, or reintroduce mobile/manual-WASD testing.

## Current driver-seat cockpit correction: v74 (2026-11-03)

**Source PR:** [#52](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/52). The opening cinematic's CC0 enclosed hatchback is still the **single original GLB** (`opening/assets/v42/1990s-hatchback.glb`); no additional vehicle shell, replacement windshield or vector seats were introduced. The earlier v73 Pinewood sign/roof clearance is preserved.

- **Owner-reported defect:** from the clock glance, huge pale seat/interior panels filled the foreground and the 12:47 AM clock was too large, partly blocked, or appeared stuck to an arbitrary upholstery polygon.
- **Measured root cause:** the old cinematic eye sat behind the real front seatback (car-local `[-0.20, 1.24, 0.19]`). An attempted dash-ray mount hit seat upholstery only ~47 cm away. A subsequent taller camera avoided some upholstery but sat ahead of the sloping roof or was occluded by it. Desktop browser raycasts against the original GLB were used to evaluate 50 seated eye candidates; `[-0.30, 1.10, -0.32]` sits about 12 cm beneath the real roof, ahead of the seatback, and yields a genuinely visible front-dash surface.
- **Cockpit correction:** `opening/camera-v65.js` now places the eye at world `[-10.30,1.10,17.18]`, with a continuous door exit. Seated camera near plane is only 0.18 m; the separate anatomical hand/phone camera still uses 0.08 m. Original car geometry remains intact inside and outside.
- **Factory-sized clock:** `opening/dashboard-clock-v71.js` selects the actual forward dashboard from GLB ray intersections, not a seat surface. The 12:47 AM readout is 0.151 m across, faces the seated driver, and its thick molded dark bezel intersects the real dash surface rather than floating or being cut off. A permanent **four-LCD-corner raycast** rejects any installation with clipped digits. The unchanged clock dialogue glance is still motivated by Renee's line.
- **Exterior glass and car trim:** imported glass opacity is reduced to avoid a large diagonal windshield tint, and the original body/dash PBR material is darkened for the midnight scene. No import, mesh, exterior landmark, dialogue recording or gameplay file is replaced.
- **Desktop-only regression:** `scripts/smoke-cinematic-refinements-v72.mjs` validates a sheltered camera, true dashboard mount, 4 visible clock corners, legible screen, real connected keypad forearm and 1-5-8-3 entry, instant outdoor rain handoff, zero retired-mall geometry and the canonical fully loaded mall. `scripts/smoke-opening-pacing-v62.mjs` checks the new front-seat pose and preserved cinematic timing. The [v74 final clock/seat run 41726900939](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41726900939) passed all permanent dashboard/keypad/mall checks; its screenshot artifact was reviewed to confirm the oversized seat panels no longer fill the car view and the small clock is fully legible. The existing facade, accessibility, continuity and six-chapter workflows remain relevant. **Never reintroduce mobile QA or manual WASD.**

## Current exterior sign/roof clearance checkpoint: v73 (2026-11-03)

**Status: MERGED TO MAIN AS `4aa6746531df14d54d00ee3c3de61966d2c869b0`** in [PR #51](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/51). The user reported a horizontal roof line crossing the PINEWOOD MALL sign in the car-arrival exterior.

- Root cause verified with actual Three.js mesh bounds: the west parapet coping (front z≈−21.81) crossed 5.05 m of the sign's x-range and 0.34 m vertically while sitting 0.05 m in front of the sign surface (z=−21.86). Thus it visibly drew over the sign.
- In `opening/facade-v65.js`, shorten that **one** coping from x=−45..−19 to x=−45..−26, ending flush at the left edge of the central tower. Do not change the original sign mesh, texture, tower, roof height, service entry, rain, car or dialogue.
- Permanent desktop regression added to `scripts/smoke-opening-facade-v65.mjs`: construct the real v65 facade in a temporary Three.js world and measure the sign plane against all parapet cap bounding boxes. No cap may protrude in front of the sign while overlapping it in x/y. This test was demonstrated RED on original geometry ([run 41712959954](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41712959954)) and GREEN after the fix ([run 41713240895](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41713240895)); desktop screenshot artifacts are attached to the green run.
- Additional PR suites GREEN: v71 canonical mall entry [41713240742](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41713240742), v72 full cockpit/rain/keypad [41713240768](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41713240768), opening accessibility [41713241017](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41713241017). The larger six-chapter production hardening [41713241089](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41713241089) was still processing Chapter 1–4 screenshots at merge. The permanent no-WASD, desktop-only, and local-asset rules still apply.

## Current opening-cinematic checkpoint: v72 (2026-11-03)

**Status: MERGED TO MAIN AS `fb8351bdb3fb29f859a9dc5c10ebf8bb1fcbaaf8`.** Production fix tracked in [PR #50](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/50). The v72 opening refinements replace the prior v71 clock placement, rain transition, retired vestibule flash and blank access entry. The canonical full-size imported hatchback, original connected CC0 hand and preloaded unified Pinewood Mall remain intact.

- The small 12:47 AM digital readout is mounted flush against the real imported hatchback's driver-facing dashboard panel (the first safe visible surface found through actual GLB triangles); the clock now shows all digits without clipping and does not float over the windshield. It is 0.218 m wide and visually confirmed by desktop capture.
- Interior/exterior rain audio switches at the physical camera boundary as the player steps out of the car (x=-11.15), independent of how long Renee's dialogue lasts. Exterior rain continues through the contractor code entry and only transitions as the player crosses into the mall.
- The old procedural mall mini-interior is not constructed at all when the abandoned facade is in use (0 retired interior meshes). The current preloaded v69 canonical mall replaces the exterior exactly at the contractor threshold; no prior layout can flash during the cut.
- The contractor keypad is centered and large enough to read nine physical number labels. Each digit of 1-5-8-3 visibly depresses its corresponding 3D key, the illuminated display updates while typing, and the original licensed anatomical right forearm is placed in the real 3D scene for physical presses. Key entry occurs within the pause between Renee's recorded lines; approved voice assets/scripts remain unchanged.
- Regression: `scripts/test-opening-v72.mjs` and desktop-only `scripts/smoke-cinematic-refinements-v72.mjs`, via `.github/workflows/cinematic-refinements-v72.yml`. The browser runner's full-page screenshot sometimes captures an out-of-date GPU composite at the keypad; the smoke test additionally captures the **actual WebGL framebuffer** and verifies the genuine arm contributes a draw call and changes scene pixels, plus the code display, physical bounds, canonical mall and zero remote dependencies. v72 desktop workflow [run 41694854589](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41694854589) passed. All desktop regression suites passed on the release PR head, including the full six-chapter production hardening [run 41694854386](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41694854386) (SUCCESS: chapters 1–6, both endings, desktop menu accessibility, and Last Shift captures). The v72 release was published by GitHub Pages [run 41696820318](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41696820318) (SUCCESS); live game: https://maloysius-wq.github.io/the-attendant-pinewood-mall/.
- No mobile QA is permitted; don't reintroduce mobile viewport tests. Preserve all previous cinematic audio timings, phone check-in, story canon, CC0 local assets, gameplay and save migration.

## Current cinematic continuity checkpoint: v71 (2026-11-03)

**Status: MERGED TO MAIN AS `f929cd294f9b57f250afdf111ff507fbebc72803`; GITHUB PAGES PUBLISHES FROM THE REPOSITORY ROOT.** PR #49 reconnects the shipped v70 single-property gameplay to its opening: after the real contractor-entry threshold, the cinematic uses `renderPinewoodV69` in a separately preloaded scene instead of its retired miniature interior. The camera follows the x=9..16 service vestibule to the x≈10 connection at z=-43, then enters the actual central atrium. The same 17 licensed interior model types remain local and preloaded under the opaque cover; exterior and interior are never superimposed with z-fighting.

- Owner-requested exterior/arrival refinements: four exactly mirrored pairs of existing CC0 planters around x=-10.5, clear x=12 contractor path, faster/denser rain (1,500 points), correctly separated raised facade belt, 18 uneven weathered entrance planks/braces rather than 37, CLOSED sign unobstructed, cinematic text selection disabled.
- Arrival details: a 12:47 AM digital dashboard readout attached to the authentic enclosed CC0 car; scripted four-key access-panel presses during the pause *after* Renee's directions, with the confirmation complete before her next line. No existing local voice recordings, true hand/phone model, or dialogue text changed.
- Tests: `scripts/test-cinematic-continuity-v71.mjs`, `scripts/smoke-cinematic-continuity-v71.mjs`, and desktop-only `.github/workflows/cinematic-continuity-v71.yml`. On PR head `f5b4e625d230ed7416e91388c427a8e1b5eababb`, the browser reports the physical central-gallery camera at x≈6.13, z≈−56.91, interior ready with 17 unique licensed model types, no script errors/off-origin requests; deterministic images include dashboard, keypad, vestibule, and atrium. Full six-chapter production hardening [Actions run 41668980639](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41668980639) **SUCCESS** on the same PR head, including chapter captures, save/HUD migration, accessibility, and both Chapter 6 endings.
- The separate one-off Renee neural renderer is now **manual-only** because its upstream approved source returned HTTP 404; shipped local Renee voice assets and the permanent v27 audio regression remain untouched. Do not silently restore its auto-run until the licensed source is available.
- Preserve the permanent desktop-only testing policy and no-manual-WASD rule. Subjective framing and clock readability remain owner-review points; automated scene/geometry gates alone do not prove art direction.

## Current platform testing policy: Desktop-only (Max, 2026-11-02)

The Attendant is not a mobile game. Max explicitly requested **removal of every mobile automated test**. All current scripts and workflows were revised to run **desktop-only browser regression**; older archived workflow matrices no longer launch mobile Chromium. Desktop reduced-motion checks remain. Do not reintroduce mobile viewport/device permutations, mobile test assertions, mobile screenshot artifacts, or mobile CI matrices in later milestones. Prior v66–v69 handoff entries documenting old successful mobile runs describe history, not present/future coverage.

## Current production checkpoint: unified Pinewood Mall gameplay v70 (2026-11-02)

**Status: MERGED TO MAIN; GITHUB PAGES BUILDS FROM REPOSITORY ROOT.** The v70 migration supersedes the older v69 review-only interior status below. The existing six-chapter game now runs within the canonical v66/v67/v68/v69 unified single-story retail mall, B1 service level, and M1 administrative mezzanine. Public URL (automatically published from main): https://maloysius-wq.github.io/the-attendant-pinewood-mall/. A direct HTTP/browser smoke check was unavailable in the migration session; if public changes lag, confirm Pages build propagation before reporting external availability.

- Migration PR: [#47](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/47), branch `feat/unified-mall-gameplay-v70`. Implementation plan: `docs/superpowers/plans/2026-11-02-pinewood-gameplay-migration-v70.md`.
- Gameplay now uses `mall/gameplay-layout-v70.mjs` for canonical floor-level navigation, real door/stair/elevator-shaft collision, and an actual east employee exit. Chapter/Last Shift interactions are placed in correct physical rooms through `mall/story-placement-v70.mjs` and `mall/story-runtime-v70.js` without abandoning existing narrative state/saves. The nine LS evidence pieces are reachable; six chapters and both endings remain.
- `patches/unified-mall-v70.js.txt` handles compatibility with existing game runtime, floor-aware enemy and chapter positions, stair/exit state transitions, and a paved exterior apron. `game.js` loads the new bridge. The approved `opening/intro-v65.js` integrates with the game without repeating the dispatch briefing after an unskipped cinematic.
- The v69 imported licensed CC0 furnishing meshes are preloaded behind the loading screen before gameplay/cinematic world display. Do not replace these with invented placeholder furniture.
- New `.github/workflows/unified-mall-v70.yml` validates mall navigation, physical story triggers, last-shift evidence, visual camera anchors, and intro handoff. All eleven desktop GitHub Actions workflows passed on v70 PR head `9aa1dc410c99d1ae2d6bd2ee8c71b6c18cf4309b`, including saves, all six chapters, both endings, accessibility, cinematic pacing, audio and screenshots. **All testing remains desktop-only. No mobile suites or mobile viewport permutations.**
- Maintain the 3D continuity between the rainy parking lot, boarded main facade, side contractor entrance, single-story mall atrium, B1 and M1, and true East Wing exit. The player must not phase through walls, walk across elevator voids, or escape through an invented side passage.
- Next visual review: inspect chapter6 memory-echo composition (legacy groups use anisotropic scale) once live; this is a presentation refinement and not a blocker for physical-navigation or story regression.

## Current licensed interior design checkpoint: Pinewood Mall v69 (2026-11-02)

**Status:** The next **review-only** unified-mall milestone is complete and green on its feature branch. It furnishes the connected v67 shell and preserves v68's abandoned facade. It does **not** replace the six-chapter production game, alter the opening cinematic, change saves or claim full gameplay migration.

- PR: [Licensed interiors v69 — #45](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/45). Branch: `construction/licensed-interiors-v69`.
- `docs/superpowers/plans/2026-11-02-pinewood-interiors-v69.md` records the stepwise plan. The TDD RED phase was run on the empty furnishing contract, then the 30-test suite passed after implementation.
- `mall/furnishing-plan-v69.mjs` authors exactly 60 physical CC0 imported fixtures across 21 **real** rooms and all three levels: 12 full-height empty racks, three counters, arcade games, four food tables, chairs, office desks/cabinets, mechanical equipment and seven supported props. It preserves the nine canonical LS-01–LS-09 narrative evidence coordinates and six main circulation routes, validates model footprints against real room bounds and physical doorway apertures. No banned Cassette Castle shelves or pre-stocked miniature retail shelves.
- `mall/render-furnishing-v69.js` preloads 17 distinct pinned CC0 model files before attaching the scene; scales each model using measured imported geometry and its circular collision envelope, grounds each model on the actual level, places seven loose props on measured counters/tables, and relocates v67's legacy register **onto the new physical Cassette counter**. Eight measured support checks pass. An independent code review caught undersized equipment and oversize hand props; corrected the room collision envelopes and authored true-scale VHS, book, cup, pizza-box and radio footprints. The importer now rejects any model that would shrink under 82% of its requested height; desktop/mobile smoke asserts actual measured prop dimensions.
- `mall/render-shell-v69.js` composes these interiors over `renderPinewoodV68`, retaining the 148 partitions, three connected floors, weathered vintage sign, boarded main entrance, contractor side door, gated East Wing exit and complete first-frame loading.
- `review/mall-interiors-v69/` includes fixed indoor and outdoor cameras for Cassette Castle, Sunburst Arcade, Video Planet, food court, Security, East Wing, Training T04, lockers, B1 mechanical, M1 records, PA control, atrium, facade and cutaway. Reviewer can choose chapters and a roof cutaway without using manual WASD. After branch integration, review URL: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/mall-interiors-v69/.
- `scripts/test-furnishing-v69.mjs` and `scripts/smoke-furnishing-v69.mjs`, run by `.github/workflows/mall-furnishing-v69.yml`: **30 Node tests pass**, as do scripted desktop 1440×900 and mobile 390×844 sweeps of 15 review camera positions each. They require an opaque preload, zero JavaScript/browser errors, zero external runtime asset requests, grounded models, no clip past fixture collision footprints, all nine evidence anchors, eight measured supports and unblocked doorways. GitHub Actions [v69 run 41533199394](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41533199394) **SUCCESS**. Thirty screenshot/audit files uploaded as [artifact 13182453574](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41533199394/artifacts/13182453574). Scripted captures pass; subjective art direction is still Max's review.

**Next:** Let Max inspect v69 furnishings and sightlines, address visual feedback, then move **actual chapter events/actors/pickups/interactions** into these canonical rooms with an end-to-end story, audio, AI, movement, transitions and save migration audit. Leave `game.js`, `index.html`, `opening/*` and the existing playable six-chapter production map untouched until the new integrated campaign is entirely tested and approved.

## Current exterior design checkpoint: Pinewood Facade v68 (2026-11-02)

**Status:** Abandoned exterior architectural treatment is complete **for review only**, layered on the validated v67 physical shell. This does not replace production Chapter 1 or modify the opening cinematic.

- `docs/superpowers/plans/2026-11-02-pinewood-facade-v68.md` records the authored exterior implementation boundaries.
- `mall/facade-plan-v68.mjs` anchors the 1979 exterior at Z=-22.5: tall 12.8m original shell, deliberately no arbitrary front windows, 32m-wide PINEWOOD MALL enamel sign, three boarded plywood bays at the main lobby X=-10.5, safe contractor entry at X=12 (1.78m × 2.27m opening), weathered masonry, and later East Wing exit X=86 Z=-42.
- `mall/weathered-facade-v68.js` builds forty-one physically attached architectural details (sign, actual plywood/fasteners/bracing, doorway frame, contractor plaque and weathering) using deterministic locally generated surface finishes and existing material/geometry conventions. No floating arbitrary blocks or runtime external requests.
- `mall/render-shell-v68.js` composes the proven licensed v67 shell and architectural facade before the first rendered frame.
- `review/mall-facade-v68/` offers front, boarded entry, contractor door, atrium, east employee exit and cutaway cameras on desktop/mobile. On main: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/mall-facade-v68/.
- `scripts/test-facade-v68.mjs`, `scripts/smoke-facade-v68.mjs`, `.github/workflows/mall-facade-v68.yml` protect sign geometry, real blocked/open door positions, no windows, same-origin and fully preloaded rendering. All 22 combined v66/v67/v68 Node tests passed; desktop/mobile v68 camera sweeps passed, 41 facade details, 148 shell partitions, zero external requests (Actions run `41525608630`).

**Still required for a playable replacement:** enrich the mall with licensed coherent interiors rather than arbitrary boxes; import/migrate every authored game chapter and evidence object into these same coordinates; integrate collision, navigation, AI, saves, cutscene alignment, audio/flooding/lighting and true-ending routes; run comprehensive deterministic production regression tests. Keep the live game unchanged until the whole campaign is ready.

## Current construction implementation: Unified Physical Shell v67 (2026-11-02)

**Status:** First **review-only physical construction milestone** complete. Do not mistake this for a playable-world migration. The default branch keeps shipping the original six-chapter production runtime and cinematic independently. The unified shell, loaded models, fixtures, doors, and stairs are separate review artifacts.

- `docs/superpowers/plans/2026-11-02-pinewood-construction-v67.md` — implementation milestone and acceptance plan.
- `mall/physical-shell-v67.mjs` — deterministic three-level geometry, 148 structural partitions, real doorway apertures, world floor slabs with freight/stair shafts, chapter-gated barriers, impassable boarded public lobby, and aligned 24-step B1 and 30-step mezzanine stairways.
- `mall/render-shell-v67.js` — combined Three.js property with licensed pre-vendored CC0 models and PBR textures, fitted fixtures, true room partitions, atrium, structural roofs, and all visual assets loaded before the first visible frame.
- `review/mall-construction-v67/` — fixed-camera desktop/mobile architectural inspection, no WASD, chapter selector, roof cutaway. Pages URL after merging: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/mall-construction-v67/.
- `scripts/test-physical-shell-v67.mjs`, `scripts/smoke-physical-shell-v67.mjs`, `.github/workflows/mall-physical-shell-v67.yml` — tests for openings/collision, chapter gates, shafts, stairs, local assets, preload, and desktop/mobile captures. All 18 combined v66/v67 Node tests passed. Desktop/mobile captures: 148 partitions, 8 material maps, 10 CC0 fixtures, zero browser errors, zero remote asset requests (Actions run `41523973512`).

**Next architectural work, not yet done:** recognizable boarded facade and weathered sign, richer licensed derelict retail fixtures, stronger structural collision/nav layer, cinematic-to-game coordinate handoff, and migration of each chapter's authored interactions, evidence, AI and endings into the new world. The v66 plan and Story Bible remain authoritative. The existing playable game must remain intact until full campaign and audio hardening passes.

## Current architectural rebuild: Unified Pinewood Mall v66 (2026-11-02)

**User-approved architectural direction:** Max chose a **single-story public mall** with a **12 m central atrium/dry fountain**, a **real below-grade mechanical level (B1)**, and an **administrative mezzanine (M1)** overlooking the atrium. The six chapters must occupy **one continuous physical property** and not be six detached room layouts.

**Initial deliverable — review-only v66 floorplan and interactive massing study:**
- `docs/superpowers/specs/2026-11-02-pinewood-master-mall-design.md` — approved spatial/narrative specification and timeline.
- `docs/superpowers/plans/2026-11-02-pinewood-master-mall.md` — staged implementation milestones.
- `mall/masterplan-v66.mjs` — 41 authored spaces, 46 tested portal connections, three physical levels, 9 evidence sites, and all six chapter trajectories.
- `review/mall-masterplan-v66/` — scaled room blueprints, interactive 3D graybox, floor and chapter selectors, door/landmark markers and story details. When on main, Pages URL: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/mall-masterplan-v66/**.
- `scripts/test-mall-masterplan-v66.mjs`, `scripts/smoke-mall-masterplan-v66.mjs`, `.github/workflows/mall-masterplan-v66.yml` — topology, door, evidence, browser, local-runtime and desktop/mobile checks. Automated preview does not use WASD.

**Entrances are sacred cinematic coordinates:** original front wall Z=-22.5, authorized service entry X=12, boarded public lobby X=-10.5, and future real east Employee Exit at X=86, Z=-42. Original 1979 mall X=-47..47, rear to Z=-118.5; later annex X=47..86, Z=-34..-115. Freight lift joins G/B1, north fire stair joins B1/G Security, Receiving R-12 stair joins G/M1. The narrow upper records gallery reaches west over the original atrium, but there is no second shopping floor.

**Critical distinction:** v66 is an architectural graybox **not** a replacement for the shipped meshes/rooms or game code. Do not claim the mall is already rebuilt for play. The six-chapter production runtime remains at v27, and the v65 facade cinematic remains separately review-only. Do not switch production to v66 floor rectangles or lose narrative and input systems.

**Next required implementation phases:**
1. Model and vendor verified licensed abandoned-mall shell/retail assets; align the modernized exterior to the approved main/front entrances. Graybox geometry is only for layout review.
2. Build a coherent shared world/streaming and collision layer from v66; remove chapter-island teleport assumptions and carveRect contradictions; preserve saves and AI pathing.
3. Integrate each chapter's authored interactions, collectibles LS-01..09, PCAS/Renee, flooding, false route E-17, safe egress, and Chapter 6 endings into real rooms and portals. Maintain `STORY_BIBLE.md` as narrative authority.
4. Run deterministic desktop/mobile visual, objective, ending, audio and asset audits; compare opening outside/inside geography before promotion.
5. Promote only after the entire unified campaign gate is green. Existing public game must remain playable until then.
---

## 0. Current canonical checkpoint: six chapters live, Audio Direction v27 shipped

As of September 6, 2026, all six authored chapters are live on `main`. The production runtime now feeds forward through Chapter 6 v25, Production Readability / Visual Identity v26, and **Audio Direction v27** as the terminal runtime layer.

Important checkpoints:

- `5930515cfb5e17fb04627e6de621471f9b1b2a46` — **Ship production readability and visual identity v26**.
- `aa89d989b88e33f62ef947c69de534607f3b3e2d` — **Ship sparse serialized voices and deep PCAS v27**. This is the current runtime-changing production checkpoint.
- `3b644f263d38b94368288ec101235d5ffca6e2f5` — **Fold Audio Direction v27 into production hardening**. This promotes the permanent cross-game hardening workflow to validate v27 as part of the comprehensive gate while retaining the historical workflow filename `.github/workflows/production-hardening-v26.yml`.

Documentation and workflow-only commits may follow these hashes without changing the playable runtime tree. Always inspect actual `main` before assuming any listed SHA remains terminal.

### Current playable stack

1. **Chapter 1 — Closing Time**
   - Story Foundation v17
   - Chapter 1 Story v18
   - local pre-rendered PCAS voice v19
   - reactive PCAS escalation v20
   - Renee Ward introduction, Contractor Fourteen escalation, LS-01 through LS-03

2. **Chapter 2 — Below Grade v21**
   - industrial/service-level identity
   - relay D/E progression and machinery/acoustic-risk gameplay
   - Gavin Cole / Contractor 13 material
   - handoff into Security

3. **Chapter 3 — Eyes in Security v22 family**
   - CCTV/security identity and surveillance systems
   - Luis set-piece material
   - readability/navigation polish through v22b/v22c/v22d
   - v22d remains a protected feed-forward readability foundation

4. **Chapter 4 — The East Wing v23 + v23b**
   - information-distrust / human-history chapter
   - staff lockers, Training, Receiving, route-map readability
   - Tessa/Jo/Luis history and LS-06
   - authored radio-imitation escalation and physical-verification mechanic
   - `PRE-1986-LOG` evidence

5. **Chapter 5 — Accountability v24**
   - Records / Management investigation
   - LS-07 final-shift roster
   - LS-09 Martin Kessler management override / falsified all-clear
   - sealed Eli Mercer route, Eli's remains and contractor badge
   - LS-08 Eli final job recorder
   - contractor sessions 01-14 reconciliation
   - `eliIsAttendant:false` is canonical

6. **Chapter 6 — The Last Shift v25**
   - PA / accountability-control environment
   - present/1997 memory overlays
   - ordered closing ritual consuming Chapters 1-5 evidence and systems knowledge
   - Contractor 14 physical clock-out and east Employee Exit
   - PCAS recalls route the Attendant toward named closing stations through existing `investigate` pathing
   - standard and true endings are implemented and regression-tested

7. **Production Readability / Visual Identity v26**
   - terminal presentation/readability layer before v27 audio
   - chapter-specific surface identity for Chapters 2-6
   - preserves Chapter 1 retail materials and the stronger Security/East Wing authored readability
   - motivated visibility rather than global brightness inflation
   - title kicker is `PINEWOOD MALL • AFTER HOURS`
   - approved target remains **readable darkness**, not a bright mall

8. **Audio Direction v27**
   - terminal live runtime layer after v26
   - sparse serialized PCAS and character voices
   - local-only lazy-loaded voice assets
   - overlap-safe voice reservation so authored voices do not pile on top of each other
   - deeper PCAS coverage while preserving deliberate quiet
   - authored radio-character voices remain separate from uncontrolled synthesis

### Audio Direction v27 production contract

The v27 local manifests are:

- `assets/audio/pa/manifest.json`
- `assets/audio/characters/manifest.json`

The permanent v27 smoke currently protects:

- PCAS manifest revision `27` with 25 authored PCAS entries,
- character manifest version `27` with 47 authored character entries,
- opening quiet window of 45 seconds,
- ambient PCAS spacing of 72-118 seconds,
- local OGG delivery for representative PCAS, Renee, fake-Renee/radio, Jo, and Eli material,
- no browser requests escaping the local Pinewood origin,
- no browser errors during the deterministic v27 smoke,
- runtime telemetry flags for sparse PCAS, serialized voices, radio voices, and deep PCAS.

Do not turn v27 into constant chatter. Silence is part of the horror pacing.

### Current development frontier

The approved story is complete. Continue with **validation and hardening**, not Chapter 7.

Priority areas:

1. keep the comprehensive v27 gate green,
2. verify GitHub Pages serves the current runtime and all local audio assets,
3. improve accessibility, reliability, balance, performance, and ending presentation only when supported by deterministic tests,
4. validate audio behavior around mute/unmute, browser autoplay restrictions, save/reload, chapter transitions, and representative mobile layouts,
5. clean dead assets only when source and runtime audits prove they are unused.

Per `AGENTS.md`, do **not** perform manual interactive WASD playtests. Use source inspection, deterministic browser tests, telemetry, captures, and deployment verification instead.

---

## 1. Canon that must remain stable

### Last Shift evidence IDs

The canonical Last Shift evidence set is exactly:

- LS-01
- LS-02
- LS-03
- LS-04
- LS-05
- LS-06
- LS-07
- LS-08
- LS-09

All nine are unique and form the complete-evidence requirement for the true ending.

### LS-07 — Final Shift Roster

LS-07 is reconstructed from three independent physical sources:

1. Jo Alvarez's handwritten closing pages,
2. Pinewood payroll archive,
3. physical punch/time-clock records.

The reconstructed physical exit count is **7 / 9**.

Confirmed physical exits:

- Jo Alvarez
- Tessa Kim
- Andre Bell
- Denise Park
- Marcus Reed
- Nina Flores
- Caleb Moss

No valid physical exit event:

- Luis Ortega
- Eli Mercer

The point is that Pinewood/PCAS's official clearance state does not match the physical record.

### LS-09 — Martin Kessler override

Kessler's records establish that management approved an all-clear/reopening path despite an unresolved contractor exception. Human accountability remains part of the story. Do not rewrite the mystery as "the computer did everything by itself."

### Eli Mercer / LS-08

Eli's remains are found in the sealed utility / PA-control approach with contractor-work context. LS-08 establishes that Eli was trying to resolve the unfinished closing/accountability condition and reach PA control.

**Eli is not The Attendant.** Chapter 5 deliberately disproves that interpretation.

### Contractor sessions

- Eli Mercer is Contractor Session 01.
- Gavin Cole is Contractor 13.
- The player is Contractor 14.
- Contractor 14 cannot be resolved before Chapter 6.

Legacy contractor sessions 01-14 are descendants of the same unresolved work-order/accountability pattern.

---

## 2. Chapter 6 canonical sequence and endings

The final closing sequence is implemented in this order:

1. acknowledge seven confirmed staff departures at Staff Accountability,
2. clear Key Control and Service State discrepancies,
3. process Eli Mercer / Contractor 01 using required evidence,
4. observe `ACCOUNTABILITY: 1`,
5. identify Contractor 14 as the remaining active account,
6. physically clock out Contractor 14 at Time / Attendance,
7. cross Pinewood toward the east Employee Exit while PCAS issues location-specific recalls,
8. release the Employee Exit,
9. cross the exit threshold and resolve the ending.

Required ordering is enforced:

- Eli cannot be processed before staff/key/service prerequisites and LS-08/LS-09 + Eli-body evidence.
- Contractor 14 cannot clock out before `ACCOUNTABILITY: 1`.
- Employee Exit cannot release before Contractor 14 clock-out.

### Final Attendant behavior

PCAS recall destinations cycle through named closing locations such as:

- PA CONTROL
- KEY CONTROL
- SERVICE STATE
- STAFF ACCOUNTABILITY

The Attendant uses existing `investigate` behavior and A* pathing toward the recalled location. The finale does not use a special speed buff or arbitrary hunt shortcut. Active decoys remain valid counterplay.

### Standard ending

Canonical ending ID: `pinewood_closed`.

Contractor 14 closes, but incomplete historical evidence leaves the recurrence unresolved. A later dispatch request appears as **CONTRACTOR 15**.

### True ending

Canonical ending ID: `everyone_clocked_out`.

Requires LS-01 through LS-09. The resolution reaches **`ACCOUNTABILITY: 0`**, the original Pinewood work order is archived, the Attendant becomes still and its white eyes extinguish, and no Contractor 15 is created.

---

## 3. Voice / imitation rule

There are separate authored concepts:

1. Chapter 4 radio imitation / information distrust is intentional.
2. v27 adds sparse, local, pre-rendered PCAS and character voices.
3. A broad supernatural runtime voice-imitation system using browser/cloud synthesis is **not** implemented and must not be introduced as a shortcut.

Permanent runtime constraints:

- no browser `speechSynthesis`,
- no runtime ElevenLabs/OpenAI/Google TTS calls,
- no remote runtime media,
- authored voice assets remain local and pre-rendered,
- subtitles/text must remain sufficient for story functionality with audio disabled.

Chapter 6's Renee/unknown overlap and PCAS recall material is authored dialogue, not uncontrolled generative behavior.

---

## 4. Runtime loader architecture

`game.js` reconstructs the encoded base runtime from `bundle2/`, normalizes local Three.js imports, then applies authored patches in order.

The narrative/presentation tail currently feeds forward through:

1. `patches/retail-geometry-v16.js.txt`
2. `patches/story-foundation-v17.js.txt`
3. `patches/chapter1-story-v18.js.txt`
4. `patches/pcas-voice-v19.js.txt`
5. `patches/chapter1-pcas-escalation-v20.js.txt`
6. `patches/chapter2-below-grade-v21.js.txt`
7. Chapter 3 Security v22 family through v22d
8. `patches/chapter4-east-wing-v23.js.txt`
9. `patches/chapter4-east-wing-readability-v23b.js.txt`
10. `patches/chapter5-accountability-v24.js.txt`
11. `patches/chapter6-last-shift-v25.js.txt`
12. `patches/production-readability-v26.js.txt`
13. `patches/audio-direction-v27.js.txt`

The terminal loader shape is conceptually:

```js
const chapter6V25Source = await applyChapter6LastShiftV25Runtime(
  chapter5V24Source,
  chapter6V25Patch
);
const productionReadabilityV26Source = await applyProductionReadabilityV26Runtime(
  chapter6V25Source,
  productionReadabilityV26Patch
);
const audioDirectionV27Source = await applyAudioDirectionV27Runtime(
  productionReadabilityV26Source,
  audioDirectionV27Patch,
  characterVoiceManifest
);
const source = audioDirectionV27Source + '\n//# sourceURL=pinewood-runtime.js\n';
```

### Feed-forward rule

Older audits validate their chapter plus the expected feed-forward relationship. They must not demand that their chapter remain terminal forever.

Any future post-v27 patch must extend downstream audit expectations without deleting older chapter invariants simply to make the new terminal layer pass.

---

## 5. Current validation gates

### Global runtime audit

`.github/workflows/runtime-audit.yml`

Broad reconstruction/static gate for the authored runtime stack and protected systems.

### Store / full visual regression

`.github/workflows/visual-regression.yml`

Deterministic browser capture suite protecting store, service, Security, and East Wing presentation and local-only runtime behavior.

### Chapter regressions

- `.github/workflows/security-v22-regression.yml`
- `.github/workflows/staged-east-wing-v23-regression.yml`
- `.github/workflows/staged-accountability-v24-regression.yml`
- `.github/workflows/chapter6-last-shift-v25-regression.yml`

Historical filenames are intentional. These gates validate the current feed-forward runtime, not frozen old builds.

### Audio Direction v27 regression

`.github/workflows/audio-direction-v27-regression.yml`

Permanent focused v27 gate. It runs:

1. `scripts/audit-audio-direction-v27.mjs`,
2. `scripts/audit-production-readability-v26.mjs`,
3. Playwright Chromium setup,
4. a local Pinewood server,
5. `scripts/smoke-audio-direction-v27.mjs`,
6. `scripts/simulate-chapter6-finale-v25.mjs`.

The original v27 production commit `aa89d989...` passed this focused gate as well as the existing chapter, visual, and production-hardening regressions.

### Six-chapter production hardening v27

**Historical filename retained:** `.github/workflows/production-hardening-v26.yml`  
**Current displayed workflow name:** `Six-chapter production hardening v27`

As of commit `3b644f263d38b94368288ec101235d5ffca6e2f5`, this is the comprehensive cross-game gate through v27. It now:

1. runs the complete authored source-audit chain through `scripts/audit-audio-direction-v27.mjs`,
2. installs Playwright Chromium,
3. starts the local Pinewood server with vendored dependencies,
4. runs `scripts/smoke-audio-direction-v27.mjs`,
5. runs `scripts/smoke-production-v26.mjs` for menus, saves/migrations, and six-chapter HUD/runtime state,
6. captures Chapters 1-4 deterministic views,
7. captures Chapter 5 Accountability,
8. simulates both Chapter 6 endings,
9. captures Chapter 6 Last Shift,
10. uploads the production hardening artifacts.

It also triggers when character voice assets under `assets/audio/characters/**` change, closing the v27 coverage gap that existed when the workflow still represented v26 only.

The integration commit automatically triggered production-hardening run **#28**. Inspect its current status before any further runtime change and treat a failure as a blocker.

### Useful direct audit commands

```bash
node scripts/audit-chapter3-security-readability-v22d.mjs
node scripts/audit-chapter5-accountability-v24.mjs
node scripts/audit-chapter6-finale-source-v25.mjs
node scripts/audit-chapter6-last-shift-v25.mjs
node scripts/audit-production-readability-v26.mjs
node scripts/audit-audio-direction-v27.mjs
node scripts/audit-runtime.mjs
```

Browser scripts require Playwright and a local server as configured in the workflows.

---

## 6. Permanent repository constraints

### Local runtime assets only

Never load runtime assets or browser libraries from third-party network URLs.

- models and model textures must be repository-local,
- PBR/material textures, images and decals must be local,
- sound, ambience, music and voices must be local,
- Three.js, Pako and future browser/runtime libraries must be pinned and served locally,
- external URLs are allowed only for provenance/documentation or development-time acquisition,
- new third-party assets require verified licensing, a vendored copy, provenance, and local-asset audit coverage,
- if licensing cannot be verified, omit the asset or choose another,
- do not restore GitHub Raw / Poly Haven / OpenGameArt / CDN runtime fallbacks.

### No manual WASD playtests

This is permanent unless the user explicitly reverses it. Use deterministic automation and deployment verification instead.

### Cassette Castle shelf ban

Never reintroduce:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- aliases/URLs corresponding to those retired resources

Use full-size empty CC0 fixtures, ground furniture from measured bounding boxes, and place shelf/tabletop objects from measured support surfaces. Omit unreliable components rather than creating visible procedural stand-ins.

---

## 7. Key files

Start with these before changing systems:

- `AGENTS.md`
- `DEVELOPMENT_HANDOFF.md`
- `STORY_BIBLE.md`
- `NARRATIVE_IMPLEMENTATION_PLAN.md`
- `game.js`
- `patches/production-readability-v26.js.txt`
- `patches/audio-direction-v27.js.txt`
- `story/dialogue.js`
- `story/pa-lines-v27.json`
- `assets/audio/pa/manifest.json`
- `assets/audio/characters/manifest.json`
- `scripts/audit-audio-direction-v27.mjs`
- `scripts/smoke-audio-direction-v27.mjs`
- `.github/workflows/audio-direction-v27-regression.yml`
- `.github/workflows/production-hardening-v26.yml`

For chapter-specific work, inspect that chapter's patch, audit, smoke/capture script, and dedicated workflow before editing.

---

## 8. Recommended continuation order

Unless the user supplies a more specific request:

1. inspect current `main` and all workflows attached to the latest commit,
2. resolve any red v27 hardening or chapter regression before feature work,
3. verify GitHub Pages is serving the current loader, v27 patch, both voice manifests, and representative local voice files,
4. continue automated full-game hardening around accessibility, audio lifecycle, save/reload, chapter boundaries, mobile layouts, performance, and ending presentation,
5. add permanent regression coverage with each meaningful behavior change,
6. keep this handoff synchronized whenever the shipping baseline or development frontier changes.

Do not create Chapter 7, new lore, or a new mystery layer unless the user explicitly asks for more story.

<!-- SUNBURST_ARCADE_V30_BEGIN -->
## Sunburst Arcade v30 — full-scale rebuild

Current Level 1 Sunburst Arcade direction replaces the Kenney Mini Arcade floor with the free **Token Gesture: Retro Arcade Props** base pack. The pack is CC0 1.0, vendored locally under `assets/vendor/arcade-v30/token_gesture/`, and its own README confirms 1 Blender unit = 1 metre / real-world scale. Runtime must never fetch the itch.io provenance URL.

The rebuilt floor uses 13 full-scale Token Gesture fixtures. Collision verification covers 15 total protected fixtures after adding the existing v16 compound checkout and the preserved gameplay cabinet: three 1.85–1.95 m uprights, claw, prize wall, skee-ball, driving cab, pinball, full-size air hockey, dance stage, cocktail cabinet, ticket eater, token changer, checkout, and the original interactive cabinet. The Noise Maker pickup remains in its original arcade gameplay role. The old `ASSETS.arcadeMachine`, `ASSETS.airHockey`, `ASSETS.basketballGame`, `ASSETS.clawMachine`, and randomized `ASSETS.prize` floor are retired from Sunburst Arcade and must not be reintroduced.

`patches/arcade-rebuild-v30.js.txt` loads the combined local `pack.glb` at native 1.0 scale. It measures actual THREE.Box3 bounds after placement, enforces an 8 cm fixture clearance, protects the south entrance, validates the real-world heights, and throws on any fixture/checkout intersection. Runtime telemetry is `window.__PINEWOOD_ARCADE_V30__`. The three existing arcade marketing posters and the v16 4.18 m shared checkout are preserved.

The v30 patch also carries a narrow Video Planet compatibility repair discovered by the full-mall browser gate: Store Polish v2's rental shelf still called a missing `makeVHSCase` symbol. v30 injects the uniquely named deterministic `makeVHSCaseV30` helper and explicitly rewrites that shelf call to the v30 helper. Do not revert it to symbol-detection logic. The browser gate is the authoritative end-to-end proof that Video Planet and Sunburst both complete boot.

Loader order is: Production Readability v26 -> Freight Elevator Reliability v28 -> Sunburst Arcade v30 -> terminal Audio Direction v27. Keep Audio Direction v27 terminal. Verification lives in `scripts/audit-arcade-v30.mjs` and `scripts/smoke-arcade-v30.mjs`; source/asset diagnostics live in `diagnostics/arcade-current-source.txt` and `diagnostics/arcade-v30-geometry.json`. Asset acquisition/provenance is reproducible through `scripts/vendor-arcade-assets-v30.mjs`.
<!-- SUNBURST_ARCADE_V30_END -->


<!-- MENU_ACCESSIBILITY_V31_BEGIN -->
## Menu accessibility / responsive regression v31 — IMPLEMENTED, CI VALIDATION IN PROGRESS (2026-10-27)

**Reason:** The six Settings sliders/selects currently show visual labels that are not linked to their controls. The production smoke verifies the controls exist, but does not protect accessible names, keyboard focus visibility, or narrow-screen menu layout.

**Planned implementation:**
1. Associate each Settings label explicitly with its slider/select using `for`/`id` while preserving its existing live-value span and behavior.
2. Show a high-contrast `:focus-visible` keyboard outline for menu controls, give screen buttons 44px minimum hit height, and disable menu-only motion when `prefers-reduced-motion: reduce` is active.
3. Add a deterministic Playwright browser smoke for desktop and 390px mobile menus covering accessible names, label click focusing, keyboard focus styling, narrow-screen column layout, touch-target size, reduced motion, and local-only/no-error runtime behavior.
4. Run the new smoke as part of the existing permanent six-chapter production hardening workflow. Do not alter the six-chapter story or v27 terminal audio layer.

**Implementation (committed to main):**
- `88e8194e`: `index.html` now associates all six Settings labels, adds menu-specific keyboard focus outlines, 44px minimum screen button heights, and reduced-motion support.
- `76279b9d`: `scripts/smoke-menu-accessibility-v31.mjs` adds deterministic Chromium checks at 1280x720 and 390x844 for keyboard order, accessible labels, label-click focus, layout, touch targets, reduced motion and local-only assets.
- `8e512bc6`: `.github/workflows/production-hardening-v26.yml` now executes the v31 menu smoke during comprehensive hardening.
- `2bd860fd`: `.github/workflows/menu-accessibility-v31-regression.yml` adds a focused, faster CI gate and preserves a JSON report.

**Verification status at handoff update:** The runtime audit passed after the HTML change, and GitHub Pages deployment for `8e512bc6` passed. The focused v31 run [40534019334](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40534019334) and comprehensive hardening run [40533660015](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40533660015) were in progress. The production-hardening job has already passed the complete authored runtime audit, v27 voice smoke, six-chapter HUD/save smoke, and the new desktop/mobile v31 accessibility smoke. The remaining visuals/endings and dedicated focused workflow were still in progress at this update. Inspect their terminal outcomes before marking the entire validation run fully green. Keep the existing audio, narrative, local-asset and no-manual-WASD invariants.
<!-- MENU_ACCESSIBILITY_V31_END -->


## v33 production release handoff (2026-10-27)

**Status: MERGED INTO MAIN, v33 production release delivered via PR #6.** User explicitly authorized updating live main after v32 narrative/physical and v33 instanced-wall audits. Release branch: `release/pinewood-v33-verified-mounts`, based on main commit `e2564bb0d7ca73b59d4654d40089b2c470cb9f99`.

Scope: promote only the 9 revised production patch files and 2 existing source-audit corrections from `audit/self-hosted-game-review-v32`. This includes Ch2 canonical LS-04 chronology and LS-05/LS-06 ownership, Gavin keycard spacing and Buzzer reachability; Ch3 CCTV support and Luis VCR/patch-chain anchor; Ch4 wall-grounded route map and wayfinding, cassette bench, physical locker keepsakes, named staff photo; Ch5 actual wall-secured directory signs; Ch6 PA sign and physical staff desk signage; v10 food posters. Preserve six-chapter canon, original local vendored assets, Cassette Castle shelf ban, and no-WASD test policy.

**Absolute release exclusion:** The audit branch's `game.js` is instrumented with nonshipping `geometryAuditV32` and `wallAuditV33` query hooks. Do not merge or copy this file; main's untouched `game.js` is the production loader. Exclude all `.github/workflows/*v32`, `*v33` and new `scripts/smoke-*v32/v33` audit-only files unless deliberately installing a production-safe test harness. Do not merge the entire audit branch. Run authored source audits + six-chapter browser compatibility smoke on staging release branch, then promote via PR, verify main HEAD, checks and Pages. No paid large runners or artifact uploads.

Relevant audit-only evidence: [wall mount v33 PASS](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40575163496) (audited mounted objects <=6cm wall gap, correct normals), [story/static PASS](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40575171523), [navigation PASS](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40578108018) (56/56 targets reachable). These runs used the audit instrumented loader; the **production-loader** release branch must be retested separately.

Release state tracking: PLANNED -> IN PROGRESS -> VERIFIED -> MERGED / DEPLOYED (or BLOCKED).

**Release staging validation:** 25/25 authored static audits passed on the unchanged production loader in standard hosted workflow [40579976341](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40579976341). Browser regression for the same staging release was still executing when this note was recorded. The temporary verification workflow is removed from the final PR diff before merge. All nonproduction diagnostic hooks and v32/v33 temporary test utilities remain excluded from main.

**Live main promotion confirmed (2026-10-27):** [PR #6](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/6) successfully squash-merged commit `31413b97839f671b800f064489f643df39895f6b`; GitHub branch `main` was verified at that exact SHA after merge. The production `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` was confirmed to contain no v32/v33 debug hooks. The final PR changed precisely 12 files (9 production patches, 2 existing test sources and this handoff). PR-targeted Runtime, Chapter 4, Chapter 5, Chapter 6, source audit and main-triggered initial diagnosis checks passed. Post-merge GitHub Actions and longer hosted screenshot sweeps were still processing at the last check; report final run outcomes, and address any later regressions as subsequent work. The repository advertises GitHub Pages (`has_pages=true`), but the published Pages URL could not be fetched from the current tool environment, so direct public URL deployment verification remains unconfirmed. Existing workflow jobs can upload ordinary screenshot artifacts (independent of the temporary release workflow, which uploaded none). No premium runner minutes were used.

## v34b Browser-only hosted preview (2026-10-28)

**DEPLOYED AND VERIFIED, OWNER REVIEW ONLY.** Cinematic remains draft PR #7, *not integrated into live New Game*. Browser preview is available at https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/ . A new isolated PR #9 squash-merged commit `f24965953372e42cd7448462fa3df7a45c63a459`, updating only the `opening/` preview scripts and local audio, `review/the-call-v34/index.html`, and `LICENSES.md`; root `index.html`, `game.js`, Chapter 1 and saves are byte-for-byte unchanged. Car-camera floor/geometry clipping fixed with hollow cockpit and correctly seated camera; work phone scaled to normal handheld proportions. Owner supplied `car-rain.wav` and `outside-rain.wav`; both are normalized and seam-crossfaded into local `opening/audio/*rain.ogg` loops, with voice ducking, car-to-outdoor crossfade and indoor fade-out, pause/skip cleanup. All 11 Renee recordings receive matching existing extreme production v29 handheld walkie (650–2150 Hz band, 12:1 compression, grit, hiss, squelch), with SHA-versioned audio URLs to bypass stale browser caches. Voice master [40737860775](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40737860775) PASSED, branch cinematic [40738636433](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40738636433) PASSED, Pages deployment [40739026613](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40739026613) PASSED, and public hosted browser [40739063234](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40739063234) PASSED after deployment, verifying both live rain loops, Renee audio and normal New Game/Skip. Await user visual/audio approval before integrating full cinematic and before broader ambience/music work.

## v35 Human-eye staging, dashboard phone and gapless rain review (2026-10-28)

**VERIFIED, awaiting isolated online-preview promotion** on `feature/the-call-v35-human-camera-gapless-rain`. User directly requested a more human first-person cinematic camera (natural glances/turns/steps rather than continuous zoom), a dashboard-mounted phone in a real holder instead of floating on the seat, and no dead air or abrupt seam at either user's car/outside rain loops. Use shot-keyed head/body choreography with deliberate pauses and walking gait, preserve existing spoken performances, remove redundant floating phone overlay. Create a single sample-accurate Web Audio playback engine with both ambient cues and scene crossfades; regenerate loop-ready OGG with edge-silence removal and tail-to-head overlap blend, verify seam/duration/no clipping. Test on the real hosted Pages preview; only promote isolated preview assets to `main` after green camera/audio browser test, never change main root `index.html` or `game.js` or merge draft PR #7. Update this entry when verified.

**v35 verification:** [GitHub Actions 40769492434](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40769492434) PASS with seven captured first-person shots, continuous human gaze shifts, physically seated driver's camera then exterior walking, scaled dashboard holder (mount in real car geometry), no onscreen floating phone card, car/outdoor rain weighting during physical exit and indoor cutoff, two looping AudioContext-decoded rain buffers playing concurrently, Renee local radio lines, and existing normal New Game handoff after Skip. Rain mastered with adaptive edge cleanup, real tail-to-head PCM crossfade, -26 LUFS target and decoded-sample edge repair; [audio master 40768699629](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40768699629) PASS. User can review on original distinct Pages path /review/the-call-v34/ after staging only these assets; main root game must remain byte-identical.


## v36 Preview accessibility lifecycle hardening (2026-10-29)

**PLANNED -> IN PROGRESS.** The current `main` is `28d50669f57e44ed4adbe2d5cd2d0f28886f0ac6`, which has already promoted v35's isolated preview assets, and its production hardening and Pages deployment passed. v35's hosted verification run `40770250764` passed. The v35 entry above predates its promotion; this entry supersedes its staging-only status. **The cinematic remains review-only** at `/review/the-call-v34/`; do not import the opening into live root `index.html` or `game.js` before owner approval.

**v36 work plan:** Make preview playback keyboard accessible and safer for screen readers without changing camera, story, dialogue, rain audio, or six-chapter runtime. Explicitly manage overlay focus and background inert state, restore focus after skip, prevent repeated identical live-caption DOM mutations, document toggle states, and give touchscreen transport controls a 44px minimum target. Add a deterministic desktop/390px mobile Playwright regression for focus, pause/skip, caption stability, mobile controls, browser errors and origin-local asset delivery. Keep this isolated preview-only and track CI before promotion.

**Implementation:** Commit `1676523f` adds isolated overlay focus/inert lifecycle, an accessible Tab loop, nonrepeating live-caption updates and toggle states. Commit `88f6997c` gives mobile transport controls 44px hit height. Commit `663588cc` marks the preview as a modal dialog. Commits `1f6e6d31` and `61748667` add the two-layout deterministic Playwright check and a dedicated PR/main CI workflow. Production `index.html`, `game.js`, narrative, authored audio and camera are untouched. **Status:** MERGED on main through PR #11 at commit db3611d9. All seven v36 feature and six-chapter CI checks on the PR passed, including focused v36 accessibility and production hardening. The 11 pinned Playwright workflows now use Ubuntu 24.04.

**CI blocker found on 2026-10-29:** GitHub's `ubuntu-latest` resolved to Ubuntu 26.04; pinned Playwright 1.55.0 refuses to install Chromium on that OS, failing both v36 and permanent production hardening before browser tests begin. The authored static audit and JS parsing did pass. Pin all 11 Playwright browser-regression workflows to supported `ubuntu-24.04` (including full-game hardening and focused v36). Revalidate on PR; do not mislabel the pre-browser infrastructure failure as a game regression.


## v37 CC0 cinematic environment development (2026-10-29)

Owner requested a dingy 1990s car interior, genuine mounted cellphone, wet foreboding parking asphalt, a neglected mall, fog and streetlights. Isolated preview only: do not connect to production New Game or change original six chapters without owner's review. Branch: feature/the-call-v37-cc0-atmosphere based on main 28d50669. Asset license sources are official Grab3D CC0-1.0 model API and Poly Haven CC0 materials (Asphalt 02, Cracked Concrete Wall, Rusty Metal, optional Street Lamp 01 glTF). Development-only script scripts/vendor-opening-assets-v37.mjs must commit bytes, checksums and URLs under opening/assets/v37/ before runtime references may ship. Asset pipeline status: VERIFIED. GitHub Actions run 40954456266 downloaded and committed 11 CC0 local files (two GLBs and nine PBR maps) at vendor commit 9d6f866. First full browser gate run 40954910799 passed desktop/mobile with full-scale car, mounted phone, three materials, 22 wet patches, four fog lamps, local-only origin requests, zero browser errors and safe skip. v37 head also reconciles fully green v36 accessibility PR #11, using merge commit 88f81552. New exact-head accessibility, v37 browser and six-chapter comprehensive checks are in progress. **Status: MERGED / PAGES DEPLOYED for owner review only.** PR #12 squash-merged to main at commit 3486a613abcf30d88fa495676c16ef9dd059eee1. Main branch verified at this SHA, and GitHub Pages deployment run 40956765892 succeeded. The current preview remains at https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/ (legacy URL, v37 visuals); direct public HTTP retrieval from this tool environment was unavailable, so public browser playback is not independently confirmed. Focused exact-head 40955691148 (v37 desktop/mobile, visual captures, local-only requests and safe skip) and 40955691189 (v36 accessibility) PASSED. Existing production index.html and game.js blobs are identical across the v37 promotion, so the cinematic is NOT enabled in New Game. Comprehensive six-chapter hardening on the PR and newly merged main is still in progress at this documentation update, not claimed green. The 3.9m Poly Haven street lamp was not vendored; authored full-size lamp posts with v37 fog halos remain.


## v38 Opening cinematic car-interior orientation regression (2026-10-30)

Owner supplied a paused v37 screenshot where the imported car's front-seat headrests are directly ahead of the first-person driver and the interior appears backwards. This is a real staging bug introduced with the Grab3D v37 GLB: the imported cabin and Pinewood's existing forward-looking (-Z) shell/camera were not aligned. Fix on `fix/the-call-v38-forward-facing-cockpit`: yaw the imported GLB 180 degrees **before** applying real-world centering/scale; keep the outer shell, cockpit camera, phone mount and entire authored shot choreography unchanged. The existing preview-only New Game isolation, Renee audio/rain, v36 accessible transport, fog and CC0 licensing must remain unchanged. Add a geometry-based driver's view clearance regression and save seated/phone-glance screenshots for desktop and mobile. Bust import cache queries to v38 to prevent the published preview from serving stale v37 modules. Before merging, verify focused v37 visual regression (now guarding v38), accessible intro, local assets and production hardening. On promotion, report exact Pages deployment and keep full-game index.html/game.js byte-identical. Status: **MERGED / PREVIEW-ONLY**. PR #13 squash merged into main at `5900f043cde7ecdf6ea3a09a50652a4fdcd5d4e9` on 2026-10-30. v38 first geometry smoke correctly detected an occlusion 8.7 cm from the first-person eye; the imported cabin was subsequently moved 34 cm rearward within the original shell while preserving the original camera path and dashboard phone. Latest desktop/mobile smoke run [41070687025](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41070687025) PASSED, with three nearest forward rays at 1.138 m, 0.984 m and 0.997 m, local-only GLB/PBR loads, saved seated/phone-glance screenshots, zero browser errors, and safe Skip. Focused v36 accessibility run [41070687208](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41070687208) PASSED. Production root index.html blob `022b99b3...` and game.js blob `5107c82b...` remain unchanged. Pages [41071125607](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41071125607) deployed preview commit 5900f043; verify live published URL is the unchanged `/review/the-call-v34/`. Comprehensive six-chapter CI running at time of this handoff and must not be represented as complete until its terminal state is checked. Owner visual review still required; cinematic remains isolated from live New Game.


## v39 The Call service entry framing and canopy scale (2026-10-30)

**User screenshot / direct instruction:** v38 service-side access door sits in a roughly 3.5m-wide × 4.6m-tall portal; the door is only 1.95m × 2.27m. The oversized 7.2m x 3.15m canopy makes the entry resemble a loading dock. Correct the *preview-only* geometry rather than changing the approved six-chapter game or the original pivot, phone/rain, pacing, camera, keypad and CC0 textures.

**Branch:** `fix/the-call-v39-service-doorway-scale` from main b68e097a. New aperture is 2.13m × 2.39m, with façade infill at the left, right and above the door, real frame jambs and lintel, and a 3.10m × 1.80m compact canopy. The original door slab/swing mechanism remains in place. `opening/intro.js` exposes actual world-space mesh bounds through `serviceEntryGeometry` so the dedicated desktop/mobile Playwright regression can verify the aperture-to-door clearance, three wall infills, frame edges and canopy dimensions, and save close-up animated doorway/threshold screenshots. Cache-bust preview modules to v39. **Status: implemented on review branch; verify CI and Pages before promotion.**


**v39 preview promotion verification:** [PR #14](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/14) squash-merged `ddd08cffed225d876b84977c2ea595694b177140` to main. Preview-focused [Chromium 41074602988](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41074602988) PASS for desktop and 390px mobile including measured real-world frame/door opening dimensions, wall infills, smaller canopy, close-up doorway and moving door screenshots, local asset requests, and safe skip. [Accessibility 41074603132](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41074603132) PASS. [Pages 41075160579](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41075160579) SUCCESS for merged code. Production root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e`, `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` are preserved; normal New Game remains unaffected. Comprehensive six-chapter regression [41074603126](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41074603126) is `in_progress/pending` at this update; it is not being represented as green until completed. Public review entry remains `/review/the-call-v34/` (legacy path now showing v39). Owner visual approval still outstanding.

## v40 Unified first-person car cabin and legible phone (2026-10-30)

**Owner correction:** v39 opening preview screenshots show the CC0 1990s interior and the old authored car still superimposed. A glaring multi-bar windshield/roof structure obstructs the view, and the mounted cell phone is far from the driver with a blank, effectively unusable screen. Prior response that said only "assessed" was not implementation. This branch MUST ship a cohesive driver-facing vehicle, one windshield, roof, and near-driver readable phone, not another diagnosis.

**Scope:** Branch `fix/the-call-v40-unified-car-cockpit` from main `cf1f468`. Remove the entire old procedural shell/body/dash/seats/duplicate glass from `opening/scene.js`; keep the locally vendored CC0 cabin as sole cockpit. Construct only a matching thin enclosing roof, A/B pillars and **one** transparent windshield in `opening/environment-v37.js` after the cabin loads. Anchor the existing CC0 phone holder immediately adjacent to the left-hand driver, add a **large camera-facing LCD** with the real CanvasTexture work-order, and keep it fully bright and double-sided. Revise camera's phone-glance target. Cache-bust the preview import chain through v40 and extend desktop/mobile Chromium regression to assert one roof/one windshield/no legacy objects, screen texture identity and size, facing and driver-eye distance, plus new windshield/phone screenshots. Do not alter production root `index.html`, `game.js`, approved voice, rain, scene pacing, six chapters, fog, or the newly sized service doorway. **Status: MERGED PREVIEW-ONLY.** PR #15 squash-merged to main as `2d71bef564e99545a76ebed13d60d1a9db7c9203`. Initially failed automated phone placement because a world-space mount box was incorrectly applied as a car-local LCD position; this was fixed by measuring the CC0 mount BEFORE parenting it under the translated car. Exact-head v40 Chromium run [41078599877](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41078599877) PASSED both desktop and mobile: no old shell meshes, one authored windshield and roof, real CanvasTexture 560×1000, screen normal dot eye 1.000, screen distance to driver 0.896m, uninterrupted local asset delivery, safe skip and saved first-person/phone captures. Accessibility [41078600233](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41078600233) PASSED. Production `index.html` SHA 022b99b3b3b613b326a34a92e900134aa370e60e and `game.js` SHA 5107c82b23cc8bce00dab099b2ac585229a1f1a8 preserved. Pages deployment workflow [41079009266](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41079009266) initiated; **verify successful publication before claiming it live**. Broad six-chapter production hardening still running at handoff update; user review of rendered cockpit remains necessary.


## v41 Owner-directed car replacement (2026-10-30)

**LATEST OWNER INSTRUCTION, overrides v35-v40 art plans:** Replace rejected 1990s car model with Grab3D Truck Cabin Interior (https://grab3d.com/models/vehicles/truck-cabin-interior/), CC0 1.0. ABSOLUTELY NO manually authored or procedural/vector car body, roof, pillars, windshield, wheel or dashboard. NO PHONE MOUNT, including the CC0 phone-holder mesh or floating LCD. Only the vendor utility/sleeper truck cabin. Keep narration/rain/night mall materials/service entry and six-chapter game unchanged. Do not reintroduce a shell or mounted phone without explicit new owner request.

Branch fix/the-call-v41-truck-cabin-only. Vendor script acquires and locally commits the ACTUAL CC0 truck-cabin-interior.glb under opening/assets/v41/ with license and SHA-256. Other PBR surfaces are retained but previous car/phone models are not requested at runtime. Reframe first-person driver eye to the truck layout; no extra car geometry or phone shots. Extend desktop/mobile browser smoke to enforce vendor-only car, no phone, and local-only requests. Isolated cinematic preview. STATUS: **MERGED & PAGES DEPLOYED for isolated owner review**. PR #16 squash-merged to main at `a2b2be04bff19cd9d91472effa9c5a8751b0d507`. Source-only Grab3D Truck Cabin Interior (light GLB, CC0 1.0, 1,104,372 bytes) vendored in asset workflow [41081634847](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41081634847), with SHA-256 in opening/assets/v41/manifest.json. First branch pass failed because removing the phone left a stale unconditional cleanup; corrected and exact-head checks succeeded: [Chromium 41082332238](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41082332238) PASSED desktop and mobile, showing a single 10-mesh vendor truck cabin, no added car geometry, zero phone mounts/screens, no third-party runtime requests, unchanged v39 service entrance and safe skip. [Accessibility 41082331979](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41082331979) PASSED. [GitHub Pages 41082818273](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41082818273) SUCCESS for merge commit. Current public review URL remains https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/ (legacy pathname; add ?v=41 to bypass caches). Production root index.html blob `022b99b3b3b613b326a34a92e900134aa370e60e` and game.js blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` unchanged. Comprehensive six-chapter hardening `41082331944` in_progress/pending at handoff update. **OWNER VISUAL REVIEW NOT YET PROVIDED; do not pretend successful automated checks prove correct appearance.** The chosen source is an open/cutaway truck cab, not a closed vehicle; do not manufacture additional frame or canopy without owner consent.


**v41 implementation:** Actual Grab3D Truck Cabin Interior GLB downloaded via CC0 metadata validated vendor job 41081634847 to opening/assets/v41. In the isolated preview the old authored roof/pillars/windshield and work-order phone object/code are entirely removed. Only one locally vendored utility cabin GLB is loaded, with truck-specific first-person driver position and radio/dashboard glance. No runtime use of the prior 1990s car or car-phone-holder GLBs. Browser smoke now rejects procedural car/phone meshes and checks only one imported model, no outside network, previous service door and night effects. CI PENDING.

## v42 ENCLOSED car, owner instruction (2026-10-30)

**OWNER REJECTED v41 open truck cab and every handmade car frame.** The cinematic must feature one roofed, weatherproof vehicle WITH an authentic interior/driver's seat. Select the Grab3D CC0 1990s Hatchback FULL vehicle (https://grab3d.com/models/vehicles/1990s-hatchback/), which is documented with actual long roof, windows, front seats, steering wheel and rear bench. Not the earlier Grab3D **1990s Car Interior** cutaway! No mix of 2 cars, no hand-made car roof or windshield and no phone mount. The prior v41 owner direction is superseded only for the new enclosed model. Keep preview-only and retain night lot/mall visuals, voice, and all six playable chapters.

Branch feature/the-call-v42-enclosed-hatchback. Developer-side source script scripts/vendor-enclosed-hatchback-v42.mjs obtains the exact CC0 full GLB into opening/assets/v42/ with material/node census, license proof and SHA. Browser scene must use this SINGLE model only, and camera must sit inside its driver seat under a **mesh roof** with actual see-through windshield toward mall. No blind faith in mesh counts: add a real roof raycast/visible-cabin camera and screenshots regression, alongside v41 accessible skip and no remote requests. If model proves solid/opaque and cannot be seen through, do NOT deploy it; look for alternative complete car. **Status: preview-only MERGED and published.** PR #17 squash-merged v42 to `main` at `f791185bbe2d09b7a5ca715ce50f2d05d28d59ef`. Cinematic run [41089221058](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41089221058) PASSED both desktop/mobile with real vendor roof distance 0.393m, full enclosed car, genuine source glass, local-only requests, fog/doorway unchanged and safe skip; accessibility run [41089221155](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41089221155) PASSED. The rendered driver-seat and exterior screenshots were inspected in-chat: they show the steering wheel behind the windshield and a continuous enclosed hatchback body. [Pages deploy 41091249362](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41091249362) SUCCESS. User visual review of the published cinematic still required; do not enable cinematic in production New Game without user approval.


**v42 implementation:** Selected full 1990s hatchback CC0 GLB has a complete body, four wheels and dedicated transparent BLEND window mesh. Model dimensions 1.86m wide × 4.06m long × 1.53m tall. Camera is lowered to a true seated height under the imported roof, with automatic roof raycast. Preview-only browser QA saves driver and exterior off-angle screenshots and outputs JPEG data for actual visual inspection. No custom car body or phone. CI pending, owner visual review required.


**v42 visual QA validated:** GH Actions actual GLB exterior screenshots show complete roof/windows. Early in-seat screenshots were black because vendor body material was double-sided; corrected to render original exterior faces from their proper side, retaining all original geometry and glass. Camera probes established proper cockpit positioning **world (-10.25,1.13,17.82)** behind the original steering wheel, showing windshield, gauges/dashboard and passenger-side glass. Reduced the temporary 1.7-intensity cabin fill to subtle 0.62. The earliest camera placed too far forward showed hood instead of wheel and was rejected. The revised eye also gets a roof-height/raycast check. Exact-head cinematic and accessibility CI passed and PR #17 was preview-only merged; public GitHub Pages build success confirmed. Production index.html and game.js remain byte-identical.


**Release safeguard:** Owner has repeatedly rejected open/cutaway cars, handmade roofs/windscreens, duplicate car bodies, and detached phone mounts. The *only* acceptable active v42 vehicle is `opening/assets/v42/1990s-hatchback.glb`; retired v37/v41 vehicle and phone GLBs and their old vendor workflows were removed. For future changes, inspect actual desktop driver-view AND exterior roof/browser screenshots before declaring success, not solely component counts. The complete six-chapter production regression of this PR (run 41089220974) was still in progress at the release decision; focused preview and accessibility are confirmed successful, and production game entry files were unchanged. Keep the cinematic review-only pending owner approval.


## v43 Owner screenshot: driver view still obstructed (2026-10-30)

Owner posted a paused first-person screenshot after v42 release. The steering wheel fills the center of the windshield, a red shape appears inside the wheel, and the dashboard/hood obscures most of the outside view. Owner asks whether the entire car is backwards again. DO NOT ASSUME orientation based on wheel object names, a roof raycast, or previous green CI: must visually prove forward/up and seat coordinates. Branch `fix/the-call-v43-driver-eye-orientation`. First step instrument real browser image probes from several LEFT and RIGHT cockpit points and also facing reverse (+Z), compare rendered frames against the actual enclosed hatchback model. Keep prior v42 asset, roof, transparent glass and service entrance; never rebuild the hybrid car or add a phone mount. Do not merge before actual visual review. State: diagnosing via recorded browser snapshots, not yet fixed.


**v43 camera root cause and correction (2026-10-30):** The hatchback is **not rotated backwards**: source front wheel nodes (+Z before 180° yaw) and exterior side visual show nose toward mall (-Z). However, the v42 world eye (-10.25,1.13,17.82) sat behind front steering wheel with the front-seat upholstery and steering hub dominating the view, aggravated by many old `G.phone` camera-glance cues at a near-field point despite phone removal. Browser screenshots of 20+ front/rear/side camera probes identified a clear windshield/dashboard/steering balance at world eye **(-10.20,1.24,17.60)**. v43 moves camera into front seat, changes residual old `phoneLean`/`G.phone` shot targeting to `dashLean`/`G.dash` at 4.3m forward so 'Got it' no longer zooms into the wheel; does not modify the GLB, orientation, roof, geometry or production game. Cinematic regression asserts exported exact eye and dashboard look-at and captures actual clock-line screenshot, not only initial arrival; owner review remains required. Status: **FIXED / MERGED PREVIEW-ONLY** through PR #18, commit dd465eba21a92c027a1bc4b6220c1c455cb66c41. Owner image was not a backwards vehicle (front wheels/nose point toward the mall), but a camera misplaced behind the vendor steering-wheel/front-seat area. Browser front/back/side camera probes and rendered screenshots identified the correct front-seat view at (-10.20,1.24,17.60), with wheel at lower left and clear windshield toward Pinewood Mall. The obsolete too-close phone-era camera target was removed; clock/Got it uses a farther dashboard glance. Verified actual arrival and clock screenshots from [cinematic Actions 41095225168](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41095225168), which PASSED desktop/mobile, local-only assets and safe skip, plus [accessibility 41095225164](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41095225164) SUCCESS. [Pages 41096186261](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41096186261) success for merged commit. Production index.html blob 022b99b3b3b613b326a34a92e900134aa370e60e and game.js blob 5107c82b23cc8bce00dab099b2ac585229a1f1a8 unchanged. Full six-chapter PR run 41095225621 in_progress/pending at handoff update, so do not represent it as green unless completed. Keep cinematic isolated until owner visual approval.

## v44 Retired-phone preview hardening (2026-10-30)

**Status: MERGED / PREVIEW-ONLY; GitHub Pages deployment SUCCESS.** [PR #19](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/19) was squash-merged into `main` at `db2901303b85a235dabbe0509d6bbc09a08a3d9e`.

The previously rejected work-phone UI was still present as a hidden HTML aside, responsive CSS, obsolete cleanup code and an unused phone shot; the original narrative metadata also still labelled three dashboard glances `shot: "phone"`. v44 removes the HTML/CSS, dormant `phoneUi` cleanup, dead phone texture telemetry and unused phone shot, while relabeling the three narration cues to `dash`. No changes to the spoken lines, narration files, v43 camera rig, hatchback model, mall/service entrance, weather, six chapters, or chapter endings.

`scripts/smoke-opening-v37.mjs` now rejects any retired phone-card HTML/CSS, rejects the old phone shot tags, checks the dashboard tag while the work-order beat is active, and verifies no phone overlay exists before or during desktop/mobile playback. The historical workflow file `.github/workflows/opening-v37-regression.yml` now watches `opening/script.json` and `opening/opening.css`, closing a path-filter blind spot; its displayed name is v44.

**Exact-head validation**: [v44 cinematic/geometry Chromium 41098080014](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098080014) SUCCESS; [accessible cinematic 41098080111](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098080111) SUCCESS; [Pages deployment 41098610720](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098610720) SUCCESS for merge commit. Full six-chapter v27 hardening [41098080009](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098080009) remained in progress at this checkpoint; do NOT describe it as green without checking its final result.

The production root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e` and `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` are byte-identical to pre-v44. Public review path remains `/review/the-call-v34/` (historical pathname), append `?v=44` to bypass cached HTML; the preview now fetches v44 CSS/JS URLs. **Owner visual approval is still required. Do not connect the opening cinematic to normal New Game until the owner approves the actual rendered experience.**

## v45 User-directed handheld check-in and voice-aligned subtitles (2026-10-30)

**Newest owner instruction overrides the v44 no-phone rule ONLY for a first-person phone actually held and used by the player.** The v42 enclosed, vendor-only hatchback remains the sole car. The phone must never be reintroduced as a dashboard mount, floating UI card, or second vehicle object. User explicitly wants the player checking in on the field-service app during Renee's opening lines, plus tighter subtitle/dialogue sync.

**Implementation in progress on PR #20** (`feature/the-call-v45-handheld-checkin-sync`), preview-only. `opening/phone-v45.js` builds an original camera-held smartphone, local CanvasTexture field-service app, rising and lowering animation, articulated gloved thumb tapping CHECK IN, and visibly CONFIRMED state during Renee's clock acknowledgement. Later work-order beat shows the three circuits on that same device. No new GLBs, car shells, remote assets, or changed voice clips. `opening/caption-sync-v45.js` creates sentence cues weighted by actual transcript lengths against the local voice manifest's precise per-clip OGG durations. `opening/intro.js` uses actual `Audio.currentTime` for caption and camera/phone timing, with pause and autoplay/decode fallback. This removes the old equal-sentence / estimated-reading-time source of drift.

**Testing status:** source audit verified exact matches for all 11 scripts and voice transcripts and deterministic clip-end caption cues. Initial Chromium run 41100249516 failed because the browser media clock had not yet moved when a test sampled it 650ms after starting a fresh clip. The branch was revised to use a bounded audio-start watchdog, a test that waits for real media playback, and local headless autoplay control. Accessibility's initial run 41100249615 logged both desktop/mobile PASS; do not interpret this as complete exact-head signoff. The current focused workflow is configured to capture desktop/mobile check-in pending, actual thumb tap, confirmation, stowed phone, and work-order screens, plus desktop JPEG frames for human visual inspection. PR remains **UNMERGED pending exact-head browser regression green**; do not state v45 is published until merge + Pages deployment are confirmed. The six-chapter production root `index.html` and `game.js` and the v42 hatchback manifest blob are unchanged on this branch. Public review still shows v44 until promotion.

**Owner approval is still required** before wiring this cinematic into the normal New Game path.

### v45 preview-only merge checkpoint

**PR #20 was squash-merged into `main` at `2246507158452eb8790e9c786427e2393870ac94`.** The owner-directed handheld phone and recording-synced caption implementation is committed. The production root `index.html`, `game.js` and v42 hatchback asset manifest remain unchanged. Do not reinterpret the previous v44 no-phone restriction as a ban on the explicitly approved first-person handheld check-in phone. No dashboard phone mounts or HTML cards.

**Exact-head post-merge statuses were still pending at documentation time**: GitHub Pages workflow [41102191308](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102191308) was queued, and v45 cinematic [41102192049](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102192049), accessible preview [41102192044](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102192044) and six-chapter [41102192018](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102192018) had also queued. GitHub's workflow state reporting was unusually delayed, with earlier jobs' logs showing finished work while their run metadata still claimed `in_progress`; do not invent PASS or Pages deployment. The earlier initial v45 cinematic [41100249516](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41100249516) failed specifically because a headless test sought nonzero audio time just 650ms after resetting playback. The revised branch handles delayed audio initialization and waits for actual audio before judging the subtitle clock. The earlier v45 accessibility run logged both desktop and mobile PASS; that does not replace exact-head verification. The new browser test also saves screenshots of pending/tap/confirmed check-in and the circuit work-order phone screen.

**Follow-up validation**: Verify Pages actually published the v45 HTML/module cache-bust and inspect desktop and mobile rendered phone screenshots. Check post-merge workflows to completion; fix genuine failures. Keep the cinematic isolated until owner visual approval, never connect it to production New Game based on an automated pass alone.


## v45 final reviewed preview release (2026-10-30)

**STATUS: MERGED, DEPLOYED, DESKTOP/MOBILE CINEMATIC AND ACCESSIBILITY PASSED. OWNER VISUAL APPROVAL STILL REQUIRED.** PR #20 merged as `2246507158452eb8790e9c786427e2393870ac94`. Follow-up audio-event subtitle timing, focus-release ordering, and foreground phone rendering/composition fixes are on `main` through `2f623e489f94ee411e3a8859e4d25be9845e5aff`. [v45 exact-head cinematic regression 41105647451](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41105647451) passed desktop and mobile; its screenshots were visually inspected and show the handheld phone's complete CHECK IN, CHECKED IN, DISPATCH NOTIFIED states, with nonoverlapping Renee captions. [v45 Pages 41105646566](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41105646566) success. [Accessibility 41103872924](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41103872924) passed desktop/mobile; v45 final phone-foreground iteration accessibility 41104648610 was also successful. Normal root `index.html` and `game.js` are unchanged; cinematic remains preview-only pending owner approval. Do not restore a dashboard phone mount or abstract HTML overlay.

## v46 door / frame correction (owner screenshot 2026-10-30)

Owner's paused screenshot at the contractor/service entrance shows substantial black gaps between the wooden slab and the fixed jambs, plus frame/head much larger than door. **Priority: FRAME MUST FIT THE DOOR, and door should be slightly thinner.** Former service slab was 1.95m wide, 2.27m high, .14m thick while the physical opening was 2.13m wide (90mm unfilled side clearance EACH side), exactly explaining the screenshot. In preview-only v46, scene door specs now drive ALL of slab width/height/thickness, steel jamb coordinates, header, wall infills and sill. New slab: width 1.78m, height 2.27m, thickness .095m; clearance 18mm each side and at head. Hinge moves to slab's actual left edge to preserve original swing. Door remains a full hinged slab and the surrounding facade stays closed, with no new car/phone assets. Regression in `scripts/smoke-opening-v37.mjs` now measures actual world-space frame and door bounds to millimeter tolerances and emits `V46_TIGHT_DOOR_JPEG` from a real paused closed-door browser view. Preview import cache bumped to v46. **Do not claim v46 successful until actual screenshot shows the close fit and CI/Pages succeed.**

### v46 merged and published checkpoint (2026-10-30)

**Status: MERGED / PAGES DEPLOYED / FOCUSED DESKTOP & MOBILE CINEMATIC AND ACCESSIBILITY GREEN; OWNER VISUAL APPROVAL STILL REQUIRED.** [PR #21](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/21) squash-merged into `main` as `409b90a2f95e8519eea22f9081aab5d5ec41812d`. [Cinematic regression 41107398448](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41107398448) PASS desktop and mobile; actual rendered `V46_TIGHT_DOOR_JPEG` reviewed. Door frame is visibly aligned, with no major side/head gaps. [Accessibility regression 41107398495](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41107398495) SUCCESS. [GitHub Pages 41108566235](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41108566235) build/report/deploy jobs SUCCESS on merged v46 commit. Preview review link: `https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=46`. The historical pathname is unchanged; query busts cached HTML, whose module now imports `opening/intro.js?v=46` and `opening/scene.js?v=46`.

**Exact final door spec:** width 1.78m, height 2.27m, 0.095m thick; wall opening width 1.816m, side clearance 0.018m each and head clearance 0.018m. All frame trim, infills and hinge derive from one spec; closed-door bounds, actual jamb edges and top header are tested. Compared to v45, old side clearance was 0.09m each and slab 0.14m thick, creating the owner's obvious dark gaps. All other preview features, single vendor hatchback and production root `index.html` / `game.js` were left unchanged. **Keep cinematic preview-only until owner explicitly approves visual result**; do not connect it to production New Game based solely on passing tests.


## v48 original CC0 Playerhands forearm release (2026-10-30)

**Status: MERGED / PUBLISHED / PRE-MERGE EXACT-HEAD CINEMATIC, FOCUSED VISUAL AND ACCESSIBILITY SUCCESS. OWNER VISUAL APPROVAL STILL REQUIRED.** [PR #22](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/22) was squash-merged into `main` as `72205d10d6b9279fef2d29958467975d6213215a`. [Merged GitHub Pages 41117417540](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41117417540) SUCCESS. Preview: `https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=48` (historical folder path, cache-busted JS). The main production root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e` and `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` remain unchanged. Intro is still **preview-only** pending owner approval; do not connect it to normal New Game.

The owner explicitly rejected the proposed **Innerscene hand-only** model and insisted on the **other previously offered source, OpenGameArt `Playerhands` by sandsound, with the attached forearm**. The abandoned v47 hand-only branch/model is NOT included in `main`. The original asset page is `https://opengameart.org/content/playerhands`; its author explicitly marked it CC0. The original `hand.zip` contains `hand_rig.blend` plus `hands.png` and MD5 versions. Asset pipelined by `scripts/vendor-playerhands-v48.mjs` + Blender `scripts/export-playerhands-v48.py` + workflow `.github/workflows/vendor-playerhands-v48.yml`; `opening/assets/v48/playerhands-forearm.glb` is 572300 bytes, contains one actual skinned forearm+hand mesh with real UV-mapped original CC0 skin texture and **20 source bones** including Root, Shoulder, ArmUp, ArmDown, Hand, PointA/B/Tip and ThumbA/B/Tip. `opening/assets/v48/manifest.json` records source archive SHA-256 `b93a08645a082b3bf638d66320f884db7e5536cf29f12568e9e71674de2dcff5` and local GLB SHA-256 `8e99f1fd0e6831a422051895d20cb35002953d61f9ae0ea376f04255a030be95`. `LICENSES.md` includes full provenance. No external runtime requests, no other hand model, no procedural wrist/palm/thumb fallback.

`opening/playerhands-v48.js` asynchronously loads and verifies the local original GLB, sizes it in **phone-local** rather than camera/world meters for mobile/desktop consistency, positions the continuous forearm with the source thumb tip hovering near the on-screen CHECK IN button, curls all four original grip finger bone chains, then solves thumb bone rotation via deterministic CCD to move the tip onto the real button and retract. The existing `opening/phone-v45.js` still drives app state and animation timeline, with the old capsule wrist/palm/thumb deleted. The initial desktop render showed an upright untextured arm that missed the button (~0.23m); its material and pose were corrected. The first focused mobile render showed a ~0.14m thumb miss caused by mixed world/local translations and oversized arm scale; both are corrected. **Final focused visual regression [41116090633](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41116090633) passed desktop AND mobile**, with genuine skinned thumb bone distance to button 0.0121m desktop and 0.0054m mobile. Captured hold/tap frames manually inspected, showing original skin-textured continuous arm and thumb reaching yellow button. Actual source is low-poly and may merit art polish if owner requests. [Exact-head full opening Chromium regression 41116101230](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41116101230) SUCCESS. [Exact-head accessibility 41116101397](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41116101397) SUCCESS. All checks use the committed source and vendored assets. Merged-head additional checks [41117419989](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41117419989), [41117419885](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41117419885), and six-chapter 41117420011 were still in progress at handoff write; check actual result, never invent success.


## v49 owner-screenshot handheld composition repair (2026-10-30)

**Status: MERGED / DEPLOYED TO ISOLATED PREVIEW ONLY. OWNER VISUAL APPROVAL STILL REQUIRED.** The owner's v48 screenshot rejected the image: grossly oversized-looking phone, original CC0 forearm drawing as shredded black/pale polygons across the LCD, and huge centered `PAUSED` pseudo-text behind the prop. Passing v48 rig-distance tests were **not** evidence of acceptable visuals. [PR #23](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/23) squash-merged as `e3a964ffe0ea4e07ee34fb2a35c449c333c7bf79`. Preview URL: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=49 . Main GitHub Pages deployment [41126143282](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41126143282) completed successfully, including build and deploy.

The root issue was a camera-held device scaled too close to the view, a skinned source model forced DoubleSide/depthTest=false/depthWrite=false, and the centered giant pause pseudo-label. V49 sizes/positions the existing handheld on widescreen, 632×748 narrow, and 390×844 portrait windows; keeps one local CC0 Playerhands model with **real weighted forearm and 20 source bones**; tucks it beside the left chassis edge; and renders handset+hand with their own foreground scene and depth-cleared pass. The physical chassis is depth-tested; the LCD draws after the case with `THREE.AlwaysDepth` **and depthWrite=true** at its actual z=.024 glass plane, so the app remains lit while subsequent source fingers respect the written glass depth. Ordinary LEQUAL depth testing hid the entire LCD in this renderer; the new real-pixel test correctly caught that failure, preventing a repeat of the v48 false green. The thumb still visibly reaches the yellow CHECK IN button using the original three weighted source thumb bones. The pause status is now a small lower-left badge and compact portrait-window captions move above the handset.

Exact-head pre-merge verification: [focused 3-layout pixel/screenshot + physical thumb smoke 41124778233](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41124778233) SUCCESS; [full cinematic 41124778413](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41124778413) SUCCESS; [preview accessibility 41124778234](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41124778234) SUCCESS. Pixel audit checks actual Chromium app text and actual skin-colored fingers rather than only CanvasTexture state/rig numbers. Three-layout app/skin counts from v49 review runs were >190/>260 per sampled frame; no external runtime assets. The six-chapter production hardening run [41124778389](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41124778389) remained in progress at handoff and must not be called green until its terminal result is checked.

**Production isolation is unchanged:** root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e` and root `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` still match the original production. The preview is NOT wired into live New Game. Do not promote it until Amanda approves the **actual** v49 visual shot. The selected source model remains low-poly; any further aesthetic hand improvement should preserve the owner's specific choice of OpenGameArt Playerhands with forearm. Possible later hardening: guard late async GLB load after immediate Skip; add asset-only PR trigger to `.github/workflows/playerhands-v48-visual.yml`; extend visual phone assertions to the work-ticket cue.


## v50 owner-screenshot hand orientation and size correction (2026-10-30)

**Status: MERGED / DEPLOYED TO THE ISOLATED REVIEW PAGE. OWNER VISUAL APPROVAL STILL REQUIRED.** Amanda rejected v49's skinny, backward, upright-looking hand while approving the phone's size relative to the wheel. [PR #24](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/24) squash-merged into main at `83ec879bb697b03569350032745f7cdbd93171ef`. Public review page: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=50 . Pages build/deploy [41130063644](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41130063644) succeeded.

**Root cause and final implementation:** v49 aligned the source hand's fingertip axis almost vertically, leaving the palm edge-on against the phone. An initial v50 attempt rotated the entire hand+forearm left and sent the whole forearm horizontally across the dashboard; it was deliberately rejected after real Chromium screenshots, even when math tests passed. The accepted-for-owner-review candidate instead normalizes the ORIGINAL skinned sandsound CC0 Playerhands to 0.53m in phone-local units, keeps the complete connected forearm rising vertically from below the phone, and bends **only the original `Hand` wrist bone** so the four fingers aim left and curl behind the chassis. A separate wrist roll puts the original weighted thumb above the fingers and across the phone's front glass; the original 3-thumb-bone CCD tap remains. The phone model, scale, root placement, steering wheel, car, and six-chapter production entrypoints were **not changed**.

**Actual pixel/pose evidence:** [v50 focused run 41129038259](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41129038259) SUCCESS; [PR focused run 41129043670](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41129043670) SUCCESS; [preview accessibility 41129043683](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41129043683) SUCCESS. Source real-mesh skin pixels: 562 desktop, 480 narrow, 262 mobile; readable phone text pixels: 303 desktop, 209 narrow, 196 mobile. Source thumb reaches app button within 0.0025m desktop, 0.0032m narrow, 0.0034m mobile; screenshots include paused CHECKED IN shot. The independent v48 end-to-end and production-hardening PR runs [41129043719](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41129043719) and [41129043727](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41129043727) were still in progress at time of merge and must not be declared green without verification.

**Production isolation verified after merge:** root `index.html` blob remains `022b99b3b3b613b326a34a92e900134aa370e60e`, root `game.js` blob remains `5107c82b23cc8bce00dab099b2ac585229a1f1a8`. Preview is deliberately NOT wired into the live New Game entrypoint. Wait for Amanda to visually approve the v50 grip and pose before any wider promotion.

## v51 natural right-hand grip review (2026-10-30)

**Status: MERGED / HOSTED REVIEW PAGE VERIFIED / OWNER VISUAL APPROVAL STILL REQUIRED.** [PR #25](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/25) squash-merged into `main` as `ac39142d0335b5c9b447436d9e3f6febe962cc9b`. Hosted page was loaded successfully in a browser at https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=51 , with the updated v51 page title and controls. This is **only the isolated opening preview**: the live New Game entrypoint is NOT wired to The Call. Do not promote the cinematic into normal gameplay until the owner explicitly approves the rendered result.

The owner requested a bigger adult-sized **right hand and attached forearm** gripping the **right side** of the phone, with the weighted thumb visible above the screen and physically tapping CHECK IN. Preserve the phone's approved relative size to the steering wheel. V51 retains the exact locally vendored sandsound OpenGameArt CC0 `Playerhands` GLB, one authentic skinned continuous arm and 20 source bones; no primitive/vector geometry or extra hand model. The arm normalizes to 0.66m phone-local length rather than v50's 0.53m. The wrist anchors at phone-local (+0.128,-0.154,-0.029), the four source finger chains curl upward/behind the chassis, and the three-bone thumb CCD reaches button-local (+0.061,-0.135,+0.044) from a right-edge hover without translating the entire palm onto the LCD. App, phone dimensions, car, roof, voice, and captions were not changed. Preview HTML, `opening/intro.js`, and `opening/phone-v45.js` have cache-bust v51 imports.

**Evidence (exact PR head `296a7564`):** Three-layout focused real-pixel, anatomy, screenshot and tap regression [41163313143](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41163313143) SUCCESS (1280×720 desktop, 632×748 narrow, 390×844 portrait). The original CC0 thumb tip makes contact within 0.0005m desktop, 0.0000m narrow/mobile. App text remains visible in all; a mobile-specific maximum 10% lower-glass skin-overlap allowance reflects the actual proportion of a natural thumb, not a full-palm wedge. Source actual-pixel crops reviewed visually. Full cinematic [41163313181](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41163313181) SUCCESS; preview accessibility [41163313168](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41163313168) SUCCESS. Independent six-chapter hardening [41163313159](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41163313159) was **still in progress** at writing; verify terminal result instead of assuming green.

**Production isolation verified after merge:** root `index.html` blob remains `022b99b3b3b613b326a34a92e900134aa370e60e`; root `game.js` remains `5107c82b23cc8bce00dab099b2ac585229a1f1a8`. No production chapter/runtime files changed in PR #25. Owner still needs to inspect v51 in its web preview and decide whether the pose is acceptable; do not claim that human approval from automated screenshots.

## v52 owner-screenshot right-hand finger-wrap repair (2026-10-31)

**Status: MERGED / HOSTED ISOLATED PREVIEW VERIFIED / THREE-LAYOUT FOCUSED, FULL OPENING AND ACCESSIBILITY GREEN. OWNER VISUAL APPROVAL STILL REQUIRED.** Max reported that v51's four fingers faced the wrong direction and visibly splayed out from the phone's right edge in an Android portrait screenshot. [PR #26](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/26) squash-merged to `main` as `9c1d4112e9248812984c66a47eb5db5d34478852`. The actual public review page was reopened and observed serving the **v52 title**, after an initial Pages deployment lag: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=52 . This historical review path remains preview-only; it is **not** the production New Game entrypoint.

**Root cause:** v51's `opening/playerhands-v48.js` aimed its grip finger vector at `(-.06,+.94,-.34)`, effectively upward. Its focused smoke test mistakenly REQUIRED upward travel, so v51's tests were green even while the four fingers stuck out visibly. V52 aims the four original, real skinned finger chains **leftward and behind** the physical chassis using `(-.85,+.18,-.49)`; curls the original finger joints without replacing geometry; and shifts the wrist's one immutable phone-local anchor to `(+.202,-.154,-.029)` so the original thumb base sits at the right edge and its three-bone CCD tip folds inward onto the CHECK IN button. No procedural replacement fingers/arm, no extra hand GLB, and no model swaps. The same locally vendored CC0 sandsound OpenGameArt Playerhands forearm, real weighted mesh and 20 source bones remain intact. The model's phone-local normalization remains 0.66m.

**Regression improvements:** `scripts/smoke-playerhands-v48.mjs` now rejects fingers aiming outward/upward by checking phone-local grip direction and all four authentic fingertip positions behind the chassis, and checks that the thumb base is near/outside the right edge with its tip leftward onto glass. It emits full desktop/narrow/mobile screenshots of the owner-reported paused **CHECKED IN** frame for visual review. Actual-pixel checks still require legible app text and visible original skin, and reject excessive skin overlap; the limits were not weakened to mask the first failed v52 iteration. Cache-bust imports are consistently v52 through review HTML, `opening/intro.js`, `opening/phone-v45.js`.

**Exact final PR head `458d8720d8842b772eab2328d4748181022b6373` verification:** [three-layout focused original forearm/tap visual run 41246925478](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41246925478) **SUCCESS**; [full opening Chromium regression 41246925430](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41246925430) **SUCCESS**; [preview accessibility 41246925433](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41246925433) **SUCCESS**. Checked-in desktop, 632×748 narrow and 390×844 portrait JPEG frames were inspected: no four-finger fan protrudes from the right edge, the thumb rests on the lower-right glass and app text remains legible. Final app/skin sample counts: desktop 303/535, narrow 209/404, mobile 196/357. Final active-glass lower-area skin fractions: 0%, 2.29%, 6.14% respectively, below the protected 5.5% desktop/narrow and 10% mobile thresholds. Independent [six-chapter production hardening run 41246925432](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41246925432) was still **in progress** at this documentation edit; verify its terminal status rather than assuming it passed.

**Production isolation reverified after merge:** root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e` and root `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` are unchanged. The six live chapters and v27 terminal audio runtime are untouched. Owner Max still needs to judge the actual hosted v52 pose before the cinematic can be promoted to normal New Game. Do not confuse automated signoff with owner approval.


## v54 connected right-hand and forearm replacement (2026-11-01)

**Status: ISOLATED THE CALL REVIEW ONLY / THREE-LAYOUT VISUAL QA GREEN / MAX'S VISUAL APPROVAL REQUIRED BEFORE ANY NEW GAME PROMOTION.** Max rejected the v53 source-Playerhands pose (open historical draft PR #27) because the thumbnail appeared inverted and detached, with a joint starting in the middle of the phone. This was a real visual failure, regardless of prior numeric bone tests. In Max's folder, address the user as **Max**, not Amanda.

**New source, not another re-pose of the rejected asset:** The v54 review branch replaces `opening/playerhands-v48.js` at the phone integration with `opening/makehuman-forearm-v54.js`, loading `opening/assets/v54/makehuman-right-forearm.glb` locally. The CC0 MakeHuman/Innerscene A-pose male base mesh was cropped to a **single continuous RIGHT forearm, right palm, and all five source finger chains** using skin weights. The cropped asset has 9,145 vertices, 14,325 triangles, one skinned mesh, and all 163 original bones/bind matrices, at 701,276 bytes. The source GLB is SHA256-pinned in `scripts/vendor-call-right-forearm-v54.mjs`, the generated asset SHA and counts in `opening/assets/v54/manifest.json`, and CC0 provenance in `LICENSES.md`. `scripts/audit-call-right-forearm-v54.mjs` audits this offline asset; the browser makes zero upstream requests.

**Rendered grip:** The four source fingers curl *behind* the handset, with their source knuckles/skin intact. The real thumb rests off the right/lower CHECK IN button edge at phone-local `(.086,-.151,.052)`, then flexes on two native joints inward toward `(.061,-.135,.032)`, producing an actual mobile tap tip near `(.073,-.141,.024)`, directly on the phone glass. The skin, palm, thumb base, and forearm are not detached/procedural pieces. A diagnostic portrait screenshot with the phone meshes temporarily hidden confirmed an anatomically connected hand and curved fingers. The finished mobile hold/tap/checked-in screenshots show the button readable at rest and the thumb moving onto it for the tap; the forearm remains visible below/right of the case. The phone/steering wheel layout and scene dialogue were preserved.

**Green visual evidence:** [v54 anatomical arm run 41255210067](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41255210067) succeeded for desktop 1280x720, narrow 632x748 and portrait 390x844 real Chromium screenshots. It checks source bones/skin mesh, joint direction, fingertip positions, right-edge thumb origin, tip contact and travel, screen text pixels, visible arm skin, maximum lower-screen overlap, and no remote runtime requests/browser exceptions. Mobile screen sample: 204 readable text pixels, 89 side-skin samples, 3.4% lower-screen skin overlap. The retired v48 test is manual-only in `.github/workflows/playerhands-v48-visual.yml`; the v54 visual workflow replaces it for review changes.

**Owner gate stays closed:** Review path is `/review/the-call-v34/` with v54 cache-busted imports. Production `index.html` and `game.js` are unchanged; six chapters and Audio Direction v27 remain live. Publishing this review-only build does **not** make it the New Game opening. Wait for Max to inspect the actual hosted Android portrait frame and explicitly approve it before production promotion. Automated tests are not a substitute for his visual judgment.


### v54 merge, hosted asset verification, and complete PR checks (2026-11-01)

[Review-only PR #28](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/28) **squash-merged into main** at `6186c68f0e9d44f964cc09ef96ddf6ed35a9568f`. The superseded, visually rejected v53 draft [PR #27](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/27) was closed without merging.

**All four exact-PR-head checks succeeded** (head `5bc708265c11e230517b36b038442aaf014137ef`):
- [v54 three-layout anatomical forearm/tap visual QA 41255557289](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41255557289) — SUCCESS.
- [v54 full cinematic regression 41255557252](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41255557252) — SUCCESS.
- [opening accessibility 41255557173](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41255557173) — SUCCESS.
- [six-chapter v27 production hardening 41255557118](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41255557118) — SUCCESS.

**Actual hosted GitHub Pages** `https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=54` returned HTTP 200 and the HTML identifies `THE CALL: CONNECTED RIGHT HAND REVIEW v54` with `./opening/intro.js?v=54`. `opening/assets/v54/manifest.json` returned HTTP 200 (695 bytes), and `makehuman-right-forearm.glb` returned HTTP 200 (701,276 bytes, model/gltf-binary). Post-merge production source blobs: root `index.html` `022b99b3b3b613b326a34a92e900134aa370e60e`; root `game.js` `5107c82b23cc8bce00dab099b2ac585229a1f1a8`, both unchanged. **The Call is still NOT the live New Game opening.** Max must personally approve the hosted v54 look before any production promotion.


## v55 doubled authentic hand / real-tip hover–tap–lift (2026-11-01)

**Status at implementation checkpoint: REVIEW-ONLY v55 branch; no New Game promotion.** Max inspected the connected v54 MakeHuman/Innerscene forearm and requested (1) about twice the hand size, (2) a clearly lifted initial thumb, (3) only the tip bending down and back up, and (4) absolutely no thumb phasing through the phone. Do not interpret machine geometry gates as Max's final visual approval. The production game remains isolated; `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e` and `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` remain unchanged.

**Root cause proved, not just guessed:** In a baseline against v54, 331 of 524 real distal-thumb weighted vertices penetrated the phone glass at press, by up to ~18 mm, while the actual terminal finger1-3.R source joint stayed immobile. v54 was moving the first two thumb joints and inspecting the bone position rather than the true skinned fingertip. v55 preserves the same locally pinned, continuous CC0 arm/hand asset (9,145 real vertices, 14,325 tris, one skinned mesh, 163 original source bones) and doubles its model scale from 1.2× to 2.4×. The wrist, hand and first two thumb joints remain stationary during the click; the source finger1-3.R terminal joint alone interpolates between an intentionally raised hover and a surface-limited press. No new proxy fingers, hand textures, detached thumbs or additional model files were added.

**Physical collision gate:** The v55 module probes all 524 original distal skin vertices using actual source weights and transforms. The real CHECK IN rectangle is phone-local x=[-0.097,+0.097], y=[-0.158,-0.113], LCD front z=+0.024. The contact test uses the lowest **fleshy source vertex over the button**; a farthest/nail-side marker is not the contact surface. Example full-press point: (+0.05884,-0.13460,+0.02576), ~1.76 mm above the glass, with **zero** distal flesh behind the glass through all test phases. The raised pose keeps the lower flesh at z~+0.0591, ~35 mm off the LCD; the raised fingertip is also shifted visibly upward in the image before it flexes downward. The independent browser test additionally checks all native thumb-bone weighted skin for occupancy of the physical phone casing, and verifies exact return to the hover pose.

**Skin rendering fix:** The original asset's front-face-only rendering exposed a hollow-looking dark patch as the thumb bent. `THREE.DoubleSide` renders the source skin's actual reverse faces instead of inventing a nail cap or proxy. Browser screenshots verified the patch disappears. Three-size focused real-Chromium tests, including mobile 390×844, narrow 632×748, desktop 1280×720, passed at [Actions run 41277241372](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41277241372). The review-specific v55 workflow runs these layouts independently; the old v54 workflow is archived as a historical manual-only suite.

**Next release checks:** Inspect the phone-hidden 390×844 source hand screenshot, complete full cinematic and preview accessibility/hardening PR checks, then merge only the isolated `/review/the-call-v34/` preview. Verify hosted `?v=55` serves new imports and that production root blobs remain unchanged. Ask Max to inspect the actual Android device before considering any New Game promotion.


### v55 merge and hosted review validation (2026-11-01)

[Review-only PR #29](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/29) **squash-merged into main** as `f4da7f8eded2d33b6da90d70eed9f2208a8dfabc`. The v55 import chain is present on `main`: review HTML title `DOUBLE-SIZE RIGHT HAND REVIEW v55` → `opening/intro.js?v=55` → `opening/phone-v45.js?v=55` → `opening/makehuman-forearm-v55.js?v=55`. The [Pages deployment 41277859594](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41277859594) succeeded and the exact [public review URL](https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=55) was opened in a browser with the v55 title and functioning opening/caption controls. Runtime WebGL/anatomical hand visuals were validated by deterministic Chromium screenshot QA, not inferred from the page title.

**Final PR-head review checks (head `0ab2d11a`)**: [v55 focused 41277562086](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41277562086) SUCCESS across mobile/narrow/desktop; [full cinematic 41277562052](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41277562052) SUCCESS; [opening accessibility 41277562069](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41277562069) SUCCESS. Independent [six-chapter production hardening 41277562023](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41277562023) was **still IN PROGRESS at merge**; do not call it green without checking its terminal result. A second hardening run started after merging to main. Browser test observed **1,093 authentic source thumb-weighted skin vertices**, zero phone-casing intersections at all sample phases, zero distal skin penetrations across hover, down, lift, plus a phone-hidden mobile screenshot proving one connected hand and forearm.

**Production isolation checked after merge:** root `index.html` blob remains `022b99b3b3b613b326a34a92e900134aa370e60e`; root `game.js` remains `5107c82b23cc8bce00dab099b2ac585229a1f1a8`. Neither the six-chapter playable game nor its opening hook changed. Max must review the actual hosted Android portrait result; **do not promote The Call into New Game without his explicit approval.**


## v57 Max-directed straight native-base-thumb check-in (2026-11-01)

**Status: MERGED AS REVIEW-ONLY / PUBLIC GITHUB PAGES PREVIEW VERIFIED / MAX'S ANDROID VISUAL APPROVAL STILL REQUIRED.** Max rejected v55's resting thumb visually because it looked planted on CHECK IN despite nominal 35 mm skin-to-glass clearance. His explicit correction was to leave the *whole original thumb straight*, pivot it from its attachment to the palm to press CHECK IN, and lift it again—using the **existing** model. Do not replace the CC0 model or revive the rejected v56 terminal-joint fixes.

[PR #30](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/30) squash-merged into main as **bb2c012489b6948888319759b0f4c23963e703d2**. The versioned opening/makehuman-forearm-v57.js retains the v54 source GLB opening/assets/v54/makehuman-right-forearm.glb, its complete 9,145-vertex continuous weighted right forearm/palm/fingers, 163 source bones, and the requested **2.4x scale**. It straightens the thumb's middle and distal joints once as an **immutable grip pose**, then slerps the native **finger1-1.R thumb base** between the elevated hover and the button press. The downstream original thumb joints remain stationary throughout the tap; the original weighted flesh stays attached to the palm. No extra mesh, procedural finger, source replacement, new runtime download, or production New Game hook was introduced.

**Root-cause evidence and TDD:** v55 at rest projected **289 / 1,093** authentic thumb-weighted vertices over the CHECK IN rectangle, with **zero native base-joint rotation**. New v57 regression first reproduced those defects RED in [Actions 41333432458](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41333432458), then passed with the base-driven controller. The pressed skin sample places the closest thumb flesh over CHECK IN at approximately **(+0.0567, -0.1466, +0.0338)** in phone-local coordinates, and the front LCD plane is at **z=+0.024**. Thus the physical remaining gap is approximately **9.8 mm** in phone-local units; it is safe and looks like a button press in rendered view, but **do not misrepresent the gap as skin touching the LCD** if Max asks for exact physical contact. Zero source thumb vertices project across CHECK IN in the raised pose; zero source thumb vertices enter the physical case at all 16 sampled down/lift phases, and no distal thumb skin vertex crosses the screen. The base joint rotates approximately **0.555 rad**, both smaller joints stay at **0**, and the original raised pose is restored exactly after release.

**Exact PR head** d0f1091be47cfc2eeb5c10dfa6e75678ae7a8c6c:
- [v57 mobile/narrow/desktop real-Chromium skin/phone and visual frames 41333945540](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41333945540) — **SUCCESS**, screenshots inspected in all three layouts.
- [Full opening/cinematic regression 41333945474](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41333945474) — **SUCCESS**.
- [Preview accessibility 41333945473](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41333945473) — **SUCCESS**.
- Independent six-chapter production hardening on PR, [41333945497](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41333945497), was **still running** at the post-merge review verification. Do not call it green without checking terminal outcome.

GitHub Pages deployment [41334512941](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41334512941) — **SUCCESS**. The public [v57 review](https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=57) was opened and its v57 title verified in a browser. Cache-busted chain: preview opening/intro.js?v=57 → opening/phone-v45.js?v=57 → opening/makehuman-forearm-v57.js?v=57. Historical v55 distal-only visual workflow is archived as manual-only; the v57 focused workflow is the permanent three-layout review gate. Production blobs remain root index.html **022b99b3b3b613b326a34a92e900134aa370e60e** and root game.js **5107c82b23cc8bce00dab099b2ac585229a1f1a8**, unchanged. **The Call is still not wired to New Game; Max has not yet approved the Android result.**


## v58 Max-directed complete-hand clearance against the phone (2026-11-01)

**Status: REVIEW-ONLY v58 MERGED AND GITHUB PAGES DEPLOYED; MAX'S VISUAL APPROVAL STILL PENDING.** Max's 1622×919 desktop screenshot revealed the v57 *original index finger* crossing the phone's text and physically phasing through its front. Do not misidentify it as the thumb: a per-digit native source-skin probe measured **799 of 1,479 index-weighted vertices inside the solid phone case** and **587 in front of the LCD**, plus **40 middle-finger vertices inside the case**. Earlier v57 checks covered the thumb only. The red reproducer is preserved in the v58 PR history.

[PR #31](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/31) squash-merged into `main` as **efe512bdbafa78f13002222251c6349f0e91ce6c**. The revision preserves the SAME original continuous MakeHuman/Innerscene CC0 right forearm GLB `opening/assets/v54/makehuman-right-forearm.glb`, **9,145 vertices**, **163 source bones**, **2.4 scale**, native joint skin weights, native straight thumb base pivot, existing phone and cockpit. The source anatomical **`finger2-1.R` index knuckle** is now rotated toward the rear of the handset (approximately **−1.4 radians about phone-local Y**), and the entire authentic forearm is translated **+0.030 phone-local X** to clear the phone's right edge instead of passing through its slab. The raised and tapped original thumb remains continuous and visible; there are no new finger meshes, nails, generated geometry, or source model replacements.

**Review-only module chain:** `review/the-call-v34/index.html` → `opening/intro-v58.js?v=58` → `opening/phone-v58.js?v=58` → `opening/makehuman-forearm-v58.js?v=58`. The original production `opening/intro.js` and `opening/phone-v45.js` are unchanged. Production root `index.html` blob remains **022b99b3b3b613b326a34a92e900134aa370e60e** and root `game.js` blob remains **5107c82b23cc8bce00dab099b2ac585229a1f1a8**. **The Call is NOT wired into production New Game without Max's explicit approval.**

**Actual source-skin and rendered-browser evidence:** [v58 focused full-hand visual run 41339291001](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41339291001) **SUCCESS** at Max's exact **1622×919 desktop** viewport and **390×844 mobile**. The test directly deforms and samples **all 9,145 weighted source-skin vertices**, plus the source bone-weighted thumb, index, middle, ring, and pinky separately. **Zero original hand/forearm skin vertices enter the solid phone case in either hold or contact. Zero non-thumb finger vertices appear in front of the LCD.** The clean desktop and mobile hold/contact screenshots were inspected and show the index wrapped behind the case, full readable app text, and the thumb descending over CHECK IN. The unchanged 16-phase hover/down/lift original-thumb regression [41339578780](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41339578780) **SUCCESS** across mobile/narrow/desktop; the v57 regression button x limit was aligned with the actual v58 button edge clearance. The real closest thumb flesh over CHECK IN in v58 is approximately **(+0.0867, −0.1466, +0.0338)**; the LCD surface remains z≈**+0.024**, hence about **9.8 mm physical gap**. It visually reads as a press but do not call it literal skin-to-glass contact.

The [GitHub Pages v58 deployment 41339796659](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41339796659) **SUCCESS** from merged commit `efe512b`. Public cache-busted preview: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=58**. The full cinematic, accessible preview, and independent six-chapter hardening checks launched for the PR and merge; consult their terminal Actions statuses instead of assuming they passed. Max still needs to inspect the Android result and approve the actual visual. **Do not ship it to the homepage without that explicit approval.**


## v59 Max-approved grip geometry / closer phone-to-thumb fit (2026-11-01)

**Status: REVIEW-ONLY v59 MERGED; GH PAGES DEPLOYMENT/OWNER'S FINAL VISUAL APPROVAL TO VERIFY.** Max approved the substantially cleaner v58 hand and requested exactly one small further adjustment: move the PHONE a little nearer the native base of the thumb. Preserve the existing right-hand anatomy/scale, no new hand model, no changes to the cockpit, dialogue, opening story, or production New Game. His attached v58 screenshot is `image(20261101-193920).png` in the conversation, not in the repository.

[PR #32](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/32) squash-merged into `main` as **268c12a935d0f342ebaab74076b7727aeef6d7b2**. Review-only chain: `review/the-call-v34/index.html` → `opening/intro-v59.js?v=59` → `opening/phone-v59.js?v=59` → the **unchanged** `opening/makehuman-forearm-v58.js?v=58` and locally pinned CC0 original 9,145-vertex continuous skinned right forearm. The phone's first-person camera-space X offset is increased by `0.010 × root.scale.x` while the hand's holder X receives the opposite **−0.010 phone-local** offset *after* the original v58 thumb pose solver completes; this visibly slides the PHONE about 10 mm toward the thumb while leaving the camera-relative hand essentially stationary. The authentic native index MCP (`finger2-1.R`) gets an extra **−0.35 rad** phone-normal Y rotation to tuck behind the edge; original skin, bones, scale **2.4**, and straight base-driven thumb-tap animation are preserved.

**Test-first evidence:** [RED v59 gap regression 41343234911](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41343234911) on unchanged v58 preview measured the native thumb-base-to-case-right-edge gap at **0.13721** phone-local and failed the specified at-most **0.130** gap. A direct all-vertex collision sweep confirmed that moving the phone alone by 10 mm would reintroduce **55 skinned source vertices inside the handset**; a source-digit-index sweep located them all in the native index and showed a further index MCP tuck of around **−0.30 to −0.40 rad** eliminated them. No guesswork offset or invisible depth masking was accepted.

**GREEN test and screenshot evidence:** [focused mobile 390×844 and desktop 1622×919 run 41343645066](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41343645066) **SUCCESS**. Real skinned geometry (all **9,145 original source vertices**) has **0 handset-case intersections** at raised and contact phases in both viewports; index/middle/ring/pinky each have **0 vertices in front of glass**, the thumb-base gap improves to **0.12721**, and the original tip flesh taps within CHECK IN at approximately **(+0.07675, −0.14659, +0.03380)** phone-local. The physical LCD plane remains at z≈+0.024; **visual press with ~9.8 mm actual skin-to-glass gap**, not literal skin contact. Clean phone/hand screenshots at both widths and both phases were inspected in the development chat; no new anatomical anomaly was visible. Full thumb hover-to-press regression [PR run 41343862773](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41343862773) passed mobile/narrow/desktop at the v59 head. Other independent PR and main checks may still run; consult Actions to confirm terminal statuses before calling them green.

**Production isolation after merge verified:** root `index.html` blob **022b99b3b3b613b326a34a92e900134aa370e60e**, root `game.js` blob **5107c82b23cc8bce00dab099b2ac585229a1f1a8**, and original `opening/intro.js` blob **519f0a14112df12ef577c07f000bd7d7073a5d90** remain unchanged. The Call is still only available for owner review, not wired into production New Game. Public cache-busted review target: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=59**. Confirm Pages deployment and Max's own final mobile/desktop visual before any production promotion.


## v60 Max-directed rightward phone-to-webbing review correction (2026-11-01)

**Status: v60 REVIEW-ONLY MERGED ON MAIN; PUBLIC PAGES DEPLOYMENT AND MAX'S VISUAL ACCEPTANCE TO VERIFY.** Max explicitly rejected v59's result and clarified that the **PHONE must move visibly RIGHT toward the lower webbing/pit between the index finger and thumb**, not toward only the isolated anatomical thumb-base joint. Do not treat the v59 proof as owner visual approval. [PR #33](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/33) squash-merged as **bcea39ea36d9b47a42eb71276183d7932db73b02**. The next review-only chain is `review/the-call-v34/index.html` → `opening/intro-v60.js?v=60` → `opening/phone-v60.js?v=60` → the unchanged original continuous `opening/makehuman-forearm-v58.js?v=58`. Public cache-busted review URL: https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=60 .

**Source of positioning:** v60 is derived from v58 rather than incrementally stacking camera and anatomy transforms on v59. `framingRight=.033` phone-local shifts the camera-facing PHONE to the RIGHT, while `thumbWebbingFit=.01225` leaves its original source hand partly following that framing, thus closing a small further gap toward the lower index/thumb webbing. The authentic index MCP receives the minimum proven native `-.35`-radian tuck behind the case; the original straight base-driven thumb raises and taps CHECK IN. No generated geometry, new index/finger parts, skin swaps, or depth masking. An earlier diagnostic confirmed moving the phone independently another full centimeter would cause more than 100 skinned-vertex intersections; therefore the safe v60 adjustment moves the entire composition right with an additional 2.25mm webbing fit relative to v59.

**Red/green geometry and actual screenshots:** [test-only failing baseline 41346820513](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41346820513) confirmed v59 did not meet the requested phone-to-webbing/rightward composition. [v60 focused screenshot and skin test 41347145150](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41347145150) **SUCCESS on 390×844 mobile and 1622×919 desktop**. The skin-grounded thumb-base case gap is **0.12496** (v59: **0.12721**), the midpoint of native thumb and index base to case edge is **0.07261** (v59: **0.07486**), the visible screen's normalized right edge moved from **0.912→0.949 mobile** and **0.761→0.775 desktop**, with all original **9,145 source-skin vertices outside the solid case** at hold and contact and zero non-thumb fingers crossing the LCD. Thumb flesh press lands at phone-local **(+0.07450, −0.14659, +0.03380)** within CHECK IN; LCD z≈+0.024, so do **not** claim literal skin-to-glass contact. Rendered hold/contact frames were personally inspected. Dedicated v57 original-thumb and v36 preview-accessibility PR checks passed. Longer cinematic and independent game hardening PR checks may still be running: verify their terminal statuses before claiming overall all-green.

**Production exclusion:** root `index.html`, `game.js` and the original `opening/intro.js` remain unchanged; v60 is NOT integrated into root New Game. Await Max's own Android/desktop visual assessment before any production promotion. Keep all future edits in review-only modules until he explicitly approves.


## v61 complete cinematic asset gate before first reveal (2026-11-01)

**Status: REVIEW-ONLY v61 MERGED ON MAIN; GITHUB PAGES DEPLOYED AND LIVE FIRST FRAME VERIFIED.** Max reported that the opening exposed an untextured mall, then visibly upgraded textures and loaded the enclosed car partway through the conversation. Root cause: the v60 intro revealed the stage and began Renee's first line while `stage.assetReady` asynchronously fetched three PBR texture sets and the local hatchback GLB. The full CC0 source hand also loaded asynchronously.

[PR #34](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/34) was squash-merged as **851827e251b5ccc7a75b70dddca4ec9801b41653**. The review entry now loads `opening/intro-v61.js?v=61` and `opening/opening.css?v=61`, preserving the v60 phone-to-webbing and v58 original connected MakeHuman forearm. The first frame remains behind an opaque, accessible **PREPARING YOUR SHIFT** cover until the complete mall environment has its local `asphalt_02`, `cracked_concrete_wall`, and `rusty_metal` maps, the 18-mesh enclosed hatchback car has loaded, the continuous original hand is ready, the scene and phone GPU programs have received a warm render, and two covered animation frames have elapsed. Only then does the cover disappear and the voice/dialogue/timeline start. Audio may be silently primed during loading to retain the original user-gesture entitlement, but no Renee speech plays before reveal. Loading Skip stays usable. A car/texture failure retains the cover and offers a clear failure message and Skip rather than exposing broken geometry. Non-WebGL caption fallback stays available.

**Test-first proof:** [RED run 41354003748](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41354003748) delayed the REAL local GLB on v60 and proved the untextured cinematic was visible and already speaking; [GREEN v61 run 41354371727](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41354371727) and [PR HEAD run 41354832773](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41354832773) passed mobile 390×844 and desktop 1280×720 with fully opaque cover while delayed, index -1/no audible voice, then confirmed car loaded, all maps/hand ready, first frame rendered, cover hidden, Pause focus and voice sequence started. The separate aborted-car test passed failure/Skip behavior. [PR accessibility run 41354832766](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41354832766), [three-width straight-thumb run 41354832776](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41354832776), and [both-width full-source skin check 41354832772](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41354832772) passed. A legacy grip test was amended to wait for v61 ready state before measuring camera-space coordinates; no hand/phone geometry was changed. The long independent cinematic and six-chapter hardening workflows may still be running; consult their final Actions status before describing them as green.

[Pages deployment 41355054994](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41355054994) **SUCCESS**. Hosted v61 review was opened in the browser; its title matched v61, its loading cover was observed, and it advanced to `data-preload-state=ready` with textured mall and enclosed car visible. Public review: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=61**.

**Production isolation:** only the review entry, a new v61 intro module, scoped opening CSS and test/workflow files changed. Root `index.html`, `game.js` and original `opening/intro.js` were untouched. The cinematic is still NOT integrated into production New Game. Await Max's visual approval on his own Android/desktop before production promotion. Do not regress v60 rightward grip positioning.


## v62 natural cinematic gaze, post-instruction check-in, fast phone stow, instant outside rain (2026-11-01)

**Status: REVIEW-ONLY v62 MERGED ON MAIN AND DEPLOYED TO GITHUB PAGES; MAX'S FINAL VISUAL APPROVAL PENDING.** Max accepted v61's loading fix and requested a slightly smaller apparent steering wheel, significantly less darting/near-field zooming in the POV camera, fluid human movement, CHECK IN only AFTER Renee instructs it, a much faster phone-lowering gesture, and outdoor rain immediately upon exiting the car.

[PR #35](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/35) squash-merged into main as **7b9a5359d4e466fe8c8d97ff951a21a88c7a7771**. Preview now loads `opening/intro-v62.js?v=62` → new review-only `camera-v62.js`, `phone-v62.js`, and `ambience-v62.js`. Original v60 rightward phone framing, 9,145-source-vertex connected forearm, finger transforms/collision clearances, full CC0 GLB enclosed car and roof, original production New Game, and original `opening/intro.js` all remain unchanged.

**Camera:** The wheel is baked into the CC0 body mesh and cannot safely be independently rescaled. Moving the seated driver's eye roughly **9 cm rearward** from z=17.60→17.69 makes its perspective silhouette smaller without changing geometry. The first five seated dialogue cues now hold distant windshield gazes, with at most restrained 1–2° shifts; rapid near-dashboard/mirror/poster swings are gone. Walking interpolates through path markers with damped eye/head motion, and a change to the next spoken line no longer forces a head snap. Screenshot captures from the actual v62 PR desktop run were inspected next to the v61 baseline; steering-wheel size and coverage reduced, car roof and phone alignment remain intact.

**Phone & audio:** Renee's first local voice clip is 6.852s. Arrival CHECK IN stays pending while she speaks, the source thumb taps/retracts in the **1.6s post-voice gap** (peak at about +0.25–0.4s), and the app confirms after contact. The phone now stows within about **0.8s** of the next line starting rather than drawing out over ~4s. The phone update follows full `elapsed`, not `voiceTime()` clamped to voice duration, so a post-voice tap is possible. Both original owner-supplied local OGG rain loops are now PCM-decoded behind the v61 loading screen. The driver crossing the car exit at owner-cue phase .32 switches the fully buffered indoor/outdoor gains through a **45ms** click-safe change, with suppression of the legacy 240ms slew while that short ramp completes. This does NOT replace original rain recordings or add remote assets.

**Red/green:** [RED baseline 41360330121](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41360330121) failed 30 desktop/mobile assertions against v61: steering wheel camera too close, 13–67° seated gaze range, near-field 2–6m dashboard targets, premature check-in, late phone lowering, and slow outside-rain change. [GREEN v62 focused 41360877480](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41360877480) and [PR v62 run 41361274235](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41361274235) SUCCESS desktop 1280×720/mobile 390×844. Actual log telemetry: gaze range **1–2°**, minimum focus ~41m; pre-instruction tap false, post-instruction tap true, confirmation and quick stow true; early car/outside volumes **.48/0**, after exit **0/.58**, with both local beds decoded and no off-origin requests or JS errors. [PR v61 preload 41361274309](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41361274309), [v57 three-width thumb 41361274303](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41361274303), [v60 two-width full-skin 41361274232](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41361274232), and [preview accessibility 41361274226](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41361274226) all passed. Older visual tests were updated to scrub the new post-voice tap and validate the new driver eye. Long independent cinematic and production hardening workflows were still in progress at merge; consult their terminal statuses before claiming them green.

[GitHub Pages deploy 41361546120](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41361546120) **SUCCESS**. Hosted v62 was opened in the connected browser, title verified, loader observed first, and the textured complete cockpit was visible after `data-preload-state=ready`. Public review: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=62**. Do **not** promote this preview cinematic to production New Game without Max's explicit approval and Android/desktop review.

## v63 imported third-party CC0 mall-front planters, service-route clearance (2026-11-02)

**Status: REVIEW-ONLY v63 MERGED ON MAIN; PAGES DEPLOYED; MAX'S VISUAL REVIEW PENDING.** Max identified the row of crude exterior planter boxes and dark-green cylinders as visually unacceptable and noted that the authored walking camera crossed one on the way to the side entrance. He explicitly required **found 3D models, not new AI/procedurally made substitute meshes**.

[PR #36](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/36) was squash-merged as **427b760b873d9e6751f8384d3264d341c2c8ddde**. The v63 review entry now loads `opening/intro-v63.js?v=63`, which preserves v62 timing, rain, camera, phone, hand and dialogue logic identically except for enabling `makeOpeningScene({useImportedLandscape:true})`. The shared `opening/scene.js` keeps its previous primitive planters ONLY for older/production entry points by default, while v63 omits all seven old boxes/cylinders. The v63 preview instead locally loads two independently sourced **Innerscene Corp CC0 1.0** GLB models, with source authorship/CC0 dedication embedded in their glTF metadata:

- **Weathering steel planter** (actual model, soil included): [source](https://www.innerscene.com/tools/library/3d-parts/weathering-steel-planter-1a0662ed), `opening/assets/v63/weathering-steel-planter.glb`, SHA-256 `10e21b1334a3277ac6d0df1a14045370c68ce487a46ddd921c0dff316261415f`.
- **Rounded leafy landscape shrub** (actual multi-mesh leaves/stems): [source](https://www.innerscene.com/tools/library/3d-parts/rounded-landscape-shrub-71bcc316), `opening/assets/v63/rounded-landscape-shrub.glb`, SHA-256 `bb5605f4367e53f4a11c007c5a46ae92e08c6a6f7a277d23d33e840f354ecef2`.

Both binaries and provenance are committed under `opening/assets/v63/`, with SHA, byte counts and source links in `manifest.json`, `SOURCES.md`, and `LICENSES.md`. All eight visible v63 plantings are cloned instances of the imported models (no BoxGeometry/CylinderGeometry replacements). They sit near the facade (z≈−18.85) at x≈−32, −31, −22, −13, −4, 20, 22, 30, leaving x≈5–15 unobstructed for the authored service-door approach. `opening/landscape-layout-v63.mjs` owns the placements. The existing opaque v61 preload now awaits both GLBs before uncovering the scene; a failed model load reports SCENE NOT READY, with no primitive fallback or remote runtime fetch.

**Verification:** [v63 PR automated audit and desktop/mobile screenshots 41364925687](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41364925687) **SUCCESS**. Source GLB byte lengths, binary headers, embedded CC0 metadata, SHA-256 hashes, no off-origin requests and an >1.8m clearance from the full authored walking path all passed. Deterministic Chromium screenshots were captured at arrival, near planters, and at service entrance on 1280×720 desktop and 390×844 mobile; actual desktop arrival and service-route images were viewed and show genuine leafy shrubs in compact rust-colored planters, with clear access to the door. Existing [v62 pacing 41364925762](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41364925762), [v61 preload 41364925607](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41364925607), [v60 hand clearance 41364925574](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41364925574) and preview accessibility checks succeeded on the v63 PR. [GitHub Pages deploy 41365263545](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41365263545) **SUCCESS**; public review: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=63**.

**Review/production boundary:** Root `index.html`, `game.js`, and original `opening/intro.js` remain unchanged. v63 is NOT promoted to production New Game; await Max's own Android/desktop visual approval. No manual WASD playtesting. The shared scene retains the legacy planter path when called without the v63 flag.

## v64 approximately double-size imported mall planters (2026-11-02)

**Status: REVIEW-ONLY v64 MERGED ON MAIN; MAX'S OWN VISUAL APPROVAL STILL PENDING.** Max liked v63's sourced third-party planters but requested they appear about **twice as large**. [PR #37](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/37) was squash-merged as **8446aa302929e69749edc33800db97fecf4b33e3**.

The v64 review entry `review/the-call-v34/index.html` loads new `opening/intro-v64.js?v=64`; it retains all v63/v62 dialogue, hand, phone, camera, rain and timing behavior. A v64-only post-v63-load adjustment in `opening/landscape-scale-v64.js` sets `group.scale=2` on each complete existing CC0 imported planter-plus-shrub group *while the v61 first-frame cover is still up*. This doubles actual model width/height/depth without authoring or generating ANY new visible mesh. Both Innerscene source GLBs, their local paths, embedded CC0 license metadata, source hashes and v63 loader are unchanged. In `opening/landscape-layout-v64.mjs`, former 1.46m-spaced pairs are now >4m apart; current x positions are approximately **−34.2, −30.15, −22.2, −13.2, −4.1, 20.15, 24.2, 32.2**, all near facade z≈−18.85. New units measure roughly 2.4m wide and 2.6m overall tall, and none intersect the side-entry walking path. The review runs local-only assets and maintains preload gating.

**Test-first:** The baseline v63 lacked 2× group scaling and the old 1.46m-spaced pairs would overlap if doubled. v64 adds `scripts/audit-opening-landscape-v64.mjs` and dedicated workflow/screenshots. [Focused desktop/mobile v64 run 41366269104](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41366269104) **SUCCESS**, confirming true 2× source-GLB assembly size, no planter overlap, >2.2m camera-route clearance, and no external asset requests. Actual 1280×720 desktop arrival and side-door screenshots were inspected: the shrubs are materially larger, adjacent pots separated, and service-entry approach remains unobstructed. Existing [v63 GLB audit 41366269121](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41366269121) and [v61 preload 41366269059](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41366269059) succeeded on the PR; other long workflows may finish later. [GitHub Pages deployment 41366540848](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41366540848) **SUCCESS**. Public review: **https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=64**.

**Production isolation:** Root `index.html`, `game.js`, original `opening/intro.js`, original v63 source/GLBs and authored walking path remain unchanged. v64 is review-only until Max approves. No manual WASD playtests.

## v65 boarded-up, taller abandoned mall exterior (2026-11-02)

**Status: REVIEW-ONLY v65 MERGED TO MAIN; MAX'S ANDROID/DESKTOP VISUAL APPROVAL PENDING.** Max requested a fundamentally different exterior: fewer windows and nonsense facade blocks, a closed/boarded primary public entrance, much larger period Pinewood Mall signage, substantially more dilapidation, and taller-looking mall architecture. [PR #38](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/38) was squash-merged as **4ee018ca4c5683c8ef4d09b3d88b3a5f0f5153b0**.

The review-only entry `review/the-call-v34/index.html` now loads `opening/intro-v65.js?v=65`. The new `makeOpeningScene({useImportedLandscape:true,useAbandonedFacade:true})` opt-in hides nine repeated full-height dummy storefront windows, thin vertical facade bars, the small former sign and obsolete sales posters **only for v65**. All earlier and production opening callers continue to use the old facade without change. New `opening/facade-v65.js` adds an architecturally continuous heavy masonry facade with approximately **17.3m** central parapet height, raised west/east wings, a **27.1m-wide** late-1970s/80s-inspired weathered forest-green/cream PINEWOOD MALL sign, only **two narrow elevated clerestory windows**, and a single ~9.6m-wide **closed public entrance** at x≈−10.5. The public entry is visibly blocked with dozens of solid weathered wooden planks, long exterior horizontal barricades and diagonal braces, a clear CLOSED / NO PUBLIC ACCESS placard and a weak surviving amber canopy lamp. The underlying structural wall remains solid: there is no accidental walk-through doorway.

Crucially, the **authorized contractor door** remains exactly at x=12 with original 1.78m × 2.27m slab, jambs, opening, hinge pivot, keypad and canopy; the scripted route to this door is untouched. Original v64 doubled authentic Innerscene planter/shrub GLBs, v62 human camera smoothing, phone/hand geometry, check-in timing, quick phone lowering, rain and dialogue are retained. `opening/camera-v65.js` changes only the high-sign gaze coordinates for the new sign position. Both the new facade and local wood texture load under the **v61 first-frame opaque preload** via `Promise.all`, preventing any untextured first-frame reveal.

**Material source:** Poly Haven [Weathered Planks](https://polyhaven.com/a/weathered_planks), CC0 1.0. Locally vendored `opening/assets/v65/weathered_planks_diff_1k.jpg` (599,581 bytes, SHA-256 `01c9a372cfd7a7bf471b59c2458ed3ccecc93448aebf7ba0cc5b3b5b6ed24349`); pinned in v65 `manifest.json`, `SOURCES.md` and `LICENSES.md`. The vintage sign is generated as a code-native local canvas graphic; no external asset CDN requests at runtime.

**Verification:** [V65 desktop/mobile CI + visual captures 41371289201](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41371289201) **SUCCESS**. Test audits check source hash, CC0 metadata, preserved v64 service-door dimensions, opt-in production isolation, both clerestory windows, tall contiguous upper wings and public-entry blocking; deterministic Chromium at **1280×720 desktop and 390×844 mobile** asserts all new assets/GLBs are preloaded before the first frame, all eight 2× planters are still real and clear, no JavaScript errors and zero off-origin runtime requests. Captures include story camera shots plus two fixed, review-only full-facade/boarding probes (no manual WASD). Actual images were viewed: full-height sign massing, boarded public door and separate contractor door render as intended; one initially dark closure was corrected with stronger planking and subtle amber light, and a gap between tower and raised right wing was closed. [v63 regression 41371289362](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41371289362) and [v64 doubled-planter regression 41371289312](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41371289312) both **SUCCESS**. Other independent long regressions were still running when v65 was merged; consult terminal statuses before claiming them green.

**Preview:** https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/?v=65 — review code is merged to main, but direct GitHub Pages HTTP reachability was **not independently verified** from this network-restricted environment. Root `index.html`, production `game.js` and `opening/intro.js` remain unchanged; **do not promote to live New Game** until Max approves the visual result. No manual WASD test was performed.

**v65 camera-regression follow-up (same date):** Long-running [v62 natural-motion workflow 41371289221](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41371289221) detected a 17° seated head dart in the early radio dialogue: v65 had incorrectly raised the **soft seated sign glance** to the high new sign. [PR #40](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/40) restored v62's original restrained `softSign:[.5,3.4,-22]` while retaining the high outdoor `sign:[-10.5,13.13,-22]` glance only when walking. The v62 CI workflow now automatically runs on changes to the v65 camera and intro. [Corrected v62 pacing run 41372053993](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41372053993) **SUCCESS** (desktop + mobile gaze, delayed check-in, quick phone stow, immediate outside rain); [corrected v65 facade run 41372053744](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41372053744) **SUCCESS**. PR #40 was squash-merged as **375a4c4ce83a1ecf5395b2ba7c144dd7734d9871**. v65 remains review-only; live New Game remains unchanged.
