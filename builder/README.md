# Pinewood World Builder

## Atmospheric wall/calendar and realistic desk-plant update (v101)

Previously bright poster/notice surfaces now use fully scene-lit, non-emissive paper materials in dark rooms. Original ambientCG grime/photo masks are boosted in-memory and darkened, so the existing saved opacity slider visibly changes the dirt strength. Clicking empty Builder space deselects the current prop and detaches its gizmo without breaking switching to another item.

Four new photo-based 1997 wall calendars (two larger commercial and two personal sizes) can be hung/rotated/scaled using the existing transparent wall-stamp system. Three sourced CC0 PBR desk-plant 3D models plus a browning, retextured variation of one of them are added. The source GLB geometry and embedded photo maps remain untouched. **Calendars are period-correct composites based on independently released PD/CC0 photographs of real calendar objects, not independently sourced 3D calendar models.** See `LICENSES.md` and the v101 manifest for full provenance. Builder library count is 618. No existing catalog IDs or saved world layouts are changed.


---

## Builder lighting + grime visibility + click-off deselection (2026-11-11)

This is an isolated fix that **does not depend on the not-yet-downloaded calendars/plants v101 asset bundle**.

- The old wall-paper/poster/notice/cobweb and v100 peeling paper decals were created with `MeshBasicMaterial`, ignoring any scene light. Now paper uses **`MeshStandardMaterial`**, roughness 1, metalness 0, black zero-intensity emissive, preserving the real pinned source image and alpha, so they stop glowing inside the abandoned dark mall.
- The 36 pinned `ambientCG` CC0 dirt/glass/water/fingerprint decals remained nearly invisible at 100% because their authored alpha was low. A new in-memory `CanvasTexture` recalibrates **only nonzero alpha and photo-derived pigment** of the exact original pinned CC0 PNGs. No source PNG changes and no invented photo patches; saved opacity sliders still control strength between .08 and 1. Material is dark (not emitted light).
- `builder/editor-scene.js` left-clicking the empty world now calls the existing `select(null)` to clear selected object and 3D handles; clicking an actual different object still selects it, and a transform handle is exempt.
- These are **Builder-only**, with all 610 existing catalog entries and 41-room architecture, user save/import schema and source/license manifests untouched. No cinema/game/story modification, no new network dependencies.

Dedicated desktop smoke `scripts/smoke-builder-paper-grime-deselect-v101.mjs` tests all three kinds of paper, two grime samples, and empty-click selection followed by JSON/IndexedDB persistence. Focused workflow: `.github/workflows/pinewood-builder-atmosphere-fix-v101.yml`. The following v101 asset update subsequently downloaded/pinned all source binaries and is tracked in the newer section above.


## Scuffed office boards and peeling paper (v100)

Eight additional locally sourced and textured catalog entries: two source-authentic CC0 3D props under **Abandoned Office Boards** (a used wheeled meeting whiteboard and a pinned cork board) plus six individually placeable wall decals under **Peeling Posters & Paper**. Both models preserve their original embedded PBR materials and are gently aged using non-destructive tint/roughness plus translucent actual ambientCG CC0 finger-smear/dust scan overlays. No replacement source meshes or source UV modifications. All six poster images derive from a *real independently released CC0 torn-poster artwork* by GGBotNet, with faded/alpha-torn edge treatments and a slight raised corner/edge to give realistic 3D separation at the wall. These are processed photographic/illustration textures, **not six separately sourced 3D models**. See `LICENSES.md` and `assets/vendor/builder/wall-decay-v100/manifest-v100.json` for full provenance and file checksums.

The sourced cork board is now **architectural wall-aware**: select it, point at a real mall wall and click to mount at the chosen height with a small surface offset. Rotate the preview in the plane of the wall. The source whiteboard is a wheeled floor-standing model, not a wall poster.

The Builder now lists **610** items. Existing wall finishes, saves, decals, actor/cinematic/game assets and default grid/overlap choices are unchanged. Desktop test: `scripts/test-builder-wall-decay-v100.mjs`, `scripts/smoke-builder-wall-decay-v100.mjs`.

Standalone desktop editor: **`/builder/`** (a separate page from the playable game).

The editor loads the same canonical 41-room, three-level Pinewood Mall shell and all 60 existing v69 furniture pieces. A dry ornamental fountain replaces only the old sculpture in this editor preview. The architectural basin, walls, stairs, shafts and chapter evidence remain protected. The Builder also mounts the **same fully licensed cinematic parking-lot set** (sedan, lamp fixtures, cracked sidewalk, boarded facade, rain and eight aged planters) as a connected exterior staging area; original cinematic set pieces remain protected while new objects can be placed around them.

## Coherent cinematic front parking lot (v84)

The actual opening-cinematic asphalt (115 × 88 m) has been repainted into
**196 perpendicular parking spaces** in seven rows, with consistent 2.75–3.0 m
stall widths, 5.6 m depths, 7.4 m two-way aisles, a mall-front drive lane,
and a pedestrian painted crossing aimed at the existing service entrance.
**Each space has two side stripes and one rear stripe, with the drive-in end
unpainted/open.** Back-to-back bays share a single rear stripe. The original
cinematic sedan at x=-10, z=17.5 remains centered in a parking space.
The old scattered angled dashes and enclosed rectangular stalls are gone.

Exactly eight exterior decorations use **source-licensed, repository-local
CC0 GLBs** without any custom prop modelling: four genuinely leafless trees
(two original Gothic dead-tree instances and two original post-apocalyptic
dead-tree instances) plus the four existing Kenney furniture-kit trash cans.
The earlier crooked/fallen *pines* have been removed because they looked too
lush and stylized for Pinewood's abandoned setting. Both replacement tree
GLBs are pinned with SHA-256 hashes, original source pages and CC0 license in
`opening/assets/v85/manifest.json`, with no runtime CDN requests.

**Camera-facing landscaping (v86):** Three of the original leafless CC0
tree instances now grow from the soil surfaces of three **existing**
weathered steel mall-front planters at x=-24.7, -17.5 and +3.7
(z≈-18.9); the remaining fourth tree dresses the lot perimeter. The
existing pots and withered shrubs stay. These placements were checked
against the real 66° opening-camera cues: the silhouettes register during
seated windshield arrival, car exit and walking toward the entrance, while
the contractor's walking path and service door stay clear. The cinematic
and standalone Builder share these positions; no additional scenery
models are created. The original eight weathered planters, sedan,
façade and lamps remain.

Only painted asphalt line geometry is authored here. The paint is an
instanced, non-colliding overlay; there are no new asphalt, curb, planter,
tree, receptacle, or street-sign meshes. Original licensed cinematic props
remain part of the protected exterior set; new Builder catalog placements
and your saved draft remain unaffected. See
`opening/parking-layout-v84.mjs`, `opening/parking-markings-v84.js` and
`opening/parking-props-v84.js`. Trash-can source hashes and licensing remain in
`assets/vendor/builder/catalog-v1.json`; leafless tree provenance is in
`opening/assets/v85/manifest.json`.


## Precision editing and 1990s materials (v87)

The viewport shows a pointer-tracking **reticle**, switching to screen-center while Explore/Fly pointer-lock is active. Click a catalog item to load its preview; preview loading must complete before placing is enabled. Scrolling while a new prop preview is loading or visible rotates **the preview object** by 15° per notch (Shift+wheel changes preview depth), never the camera. After placing or selecting an existing prop, the ordinary wheel also rotates that selected prop by 15° per notch (Shift+wheel zooms the camera instead). With nothing selected, the wheel zooms the camera normally. Clicking a placement or an already-selected fixture cannot unexpectedly capture the cursor and flip the view.

The checked **Snap** option quantizes object placement and transform gizmo moves to a visible grid. Choose **0.25 m / 0.5 m / 1 m** steps or uncheck Snap for free placement. The grid follows the active support surface including other elevations. The unchecked **Allow overlap** option means new placements and edits are checked against real mall walls and floor support; items overlapping architecture, entering floor holes, or hovering without support cannot be confirmed by default. Check **Allow overlap** when intentionally placing objects through surfaces or making theatrical set dressings. Existing saved placements are preserved without migration or deletion. Placing computers on desks uses the licensed furniture's existing top surface as support.

The **Room surface finishes** inspector decorates one of 41 rooms, with separate **Walls**, **Floor**, and **Ceiling** selectors. The original floor/wall/ceiling geometry is immutable; each choice produces an independent, room-limited cosmetic surface. Ceiling finishes never copy the wall finish. Existing chapter-specific ceilings and atrium skylight are unchanged, and rooms without editable ceilings disable the ceiling finish control. All finishes are saved in the existing portable v1 JSON as the optional `surfaces` map and obey Save, Import, Undo, Redo and Reset. Old v1 JSON files without `surfaces` still import unchanged. Six new [Poly Haven](https://polyhaven.com) CC0 textures complement the existing 1990s terrazzo/tile/carpet, concrete, acoustic tile and aged plaster.

The catalog now includes the [MadeByYeshe / TTT CC-BY 4.0](../LICENSES.md) **1990s CRT desktop PC (with keyboard and mouse)**, two sourced CC0 desktop computer towers, and five licensed abandonment props: shattered tiles, concrete/rebar rubble, a dented bin spilling trash, bags of rubbish and a stack of old magazines. The outdated Kenney LCD is no longer offered for new placements, but existing saved IDs resolve to the real CRT so no draft is lost. All new binaries and texture maps are pinned locally with SHA-256/source/licensing records, and the campaign remains unchanged. Desktop CI: `scripts/test-builder-v87.mjs`, `scripts/smoke-builder-v87.mjs` and `.github/workflows/pinewood-builder-v87.yml`.

## Complete room-wall finish coverage (v90)

Room **Walls** finishes now follow the actual, visible wall faces rather than only the nominal architectural outlines. The opening cinematic's thicker front facade replaces the hidden original exterior wall in the Builder, so the Contractor Service Vestibule and Boarded Main Entry receive their chosen wall finish on the **inside of the visible facade**. The contractor doorway itself stays open, while the genuine wall header above its door also receives the selected finish.

A shared 41-room audit handles partitions and outer walls on all three floors. Wall finishes stop at the corresponding room ceiling or physical room height rather than continuing up the entire multi-storey exterior; adjoining rooms can select different textures, and overlaps between real wall segments are resolved instead of drawing multiple coplanar skins. Empty passageways, skylights, original doors, architectural collisions and the campaign are unchanged. Builder room finish layouts remain backwards compatible with v1 saved JSON. Source and desktop verification: `scripts/test-builder-room-walls-v90.mjs`, `scripts/smoke-builder-room-walls-v90.mjs`, and `.github/workflows/pinewood-builder-room-walls-v90.yml`.

## Furniture texture scale and original-color peripherals (v92)

A visual review of a desk with a 1990s desktop computer revealed the v91
furniture photographs had an obvious miniature repeated pattern, including on
the wooden desk surface and small hardware. v92 improves the **standalone
Builder** without touching any original GLB bytes or the saved world format.

For **desks, counters, cabinets, drawers, shelving, seating, benches and other
furniture**, photographs are projected over entire mesh panels at an
aspect-preserving scale, rather than every ~48 cm. Existing furniture image UVs
are replaced only on isolated copies of geometries that have **no source image
textures**. Any authored embedded image UVs are retained. The old noisy
worn-table photo is replaced with the already licensed, locally pinned
**light oak veneer** on ordinary furniture wood, with the source colors
still contributing tint. Dark wood and metal hardware remain separately
mapped and preserve their own shader finishes. Other color-only meshes
without UVs use a larger source-relative texture scale so stone, wood and
fabric patterns do not become tiny stamps.

**Computer keyboards and mice keep their original solid-color source
materials.** Their standalone models and keyboard/mouse submeshes are excluded
from the material enhancer, including when previously placed or imported in
saved layouts. This does not remove those props.

Room-specific finishes also use fewer repetitions on carpet, plaster, bare
concrete and similar organic surfaces; intended repeating terrazzo/tile
patterns remain at moderate scale and the acoustic ceiling grid remains at its
intended 2.6 m span. This changes only how the selected local JPEG is mapped,
not the original finish catalog IDs, shell geometry or any room's chosen
finish. See `builder/material-scale-v92.mjs`,
`scripts/test-builder-material-v92.mjs`, the focused v91/v92 Builder
material CI workflow, and its desktop regression.


## Source-authentic contractor props (v99)

All ten v98 Python-generated contractor meshes have been replaced with independently published CC0 3D models from Innerscene (six original GLBs) and Poly Haven (four authored glTF model kits repackaged into GLBs). The catalog's 602 entries and original ten contractor catalog IDs remain unchanged, so existing saved placement layouts still work without migration. Each actual source model retains its original colors or embedded textures. The light is a compact portable floor work stand, not a tall tripod; the cart includes a lower cabinet; the conduit uses three preexisting straight cable sections from a source model kit. See the license file and pinned model manifest for authorship/source SHA-256 details.

## 1990s wall dressing, ceiling webs and contractor loading props (v98)

The Builder now offers 55 additional **real local assets** in three searchable categories: **Contractor Vestibule & Loading** (19 model props); **Wall Notices & Advertising** (28 original, printed graphics); and **Cobwebs & Ceiling Dust** (8 translucent ceiling/wall spider webs). The supplied wooden pallets, broken pallets, construction barriers, traffic cones, pipe bundles, barrels and cinder blocks are truly Quaternius CC0 glTF models, converted into self-contained GLBs. A vintage-style compact forklift, hand pallet jack, folding ladder, toolboxes/chest, cable reel, trolley, work lamp, broom and spare conduit are standalone original locally authored GLBs. All 28 wall papers, framed bulletin boards, simple whiteboards, four paper calendars, and six nonbrand Pinewood adverts were drawn for the Builder, along with eight faint cobweb graphics. No online assets are requested at runtime.

Select a notice, poster, whiteboard, bulletin board or web in the catalog and aim at a matching **wall or ceiling underside**. The existing surface stamp picker attaches it to the real architectural surface (not arbitrary sky), with slight geometry offset to prevent flickering; scroll the preview to rotate, click to place. Room ceilings must be visible to receive cobwebs. All notices and webs can be moved, resized, rotated, duplicated, saved, undone, exported and individually blended with the **Decal opacity** inspector slider. If you select physical contractor items, the original snap/overlap preferences and existing transform gizmos still apply. Old drafts and game assets are unchanged.

**Vestibule dressing suggestion:** use two printed notices and a corkboard next to the staff door, a service work-order whiteboard, one pallet and a hand pallet jack set aside rather than across the entrance, toolbox and cable reel near the tools area, plus low-opacity web strands high in unused ceiling corners. Position the compact forklift in the adjacent loading/service bay rather than blocking the contractor’s passage.

Sources and art provenance: `assets/vendor/builder/vestibule-v98/manifest-v98.json`; original generation script `tools/vendor-vestibule-v98.py`; CC0 source reference `https://quaternius.com/faq.html`. All per-file hashes are pinned. Focused source and desktop CI `pinewood-builder-vestibule-v98.yml`.

## Placeable surface grime, scuffs and leaks (v97)

The **Surface Decals & Grime** prop category contains **36** different locally pinned, semi-transparent dust, dirt, coffee/drink/rust stains, shoe scuffs, scratches, wall water leaks, smears and old adhesive marks. These are individually placed transparent overlays, not room-wide finish replacements. Their original source imagery is from seven legally verified **ambientCG CC0** 1K materials, with SHA-256 hashes and download provenance in `assets/vendor/builder/decals-v97/manifest-v97.json`. The 640px transparent RGBA derivative decals are local to the repository, with softly feathered edges to avoid ugly flat boxes. Their browser runtime does not fetch from a CDN or outside service.

Select one in the catalog and aim at a **floor** or **wall**. The preview attaches itself to the real matching mall surface at a slight z-fighting-safe offset; click to commit, wheel to rotate the stamp, Esc to cancel. Decal props are decorative, non-colliding layers, so they are not blocked by the physical-prop placement validator. Floor decals lie horizontally; wall decals align to the detected wall-facing normal. Use the existing Inspector Scale/Pitch/Yaw/Roll fields, move/rotate gizmo and the new **Decal opacity** control to make subtle layered grime. Duplicate, undo/redo, save/export/import/reload retain individual placements and custom opacity without changing the underlying Builder draft version.

**New default preferences:** Snap starts **Off**, Allow overlap starts **On**. You can turn either back on/off from the normal Builder toolbar; this changes only the standalone Builder, not game collision detection.

**Source trash can and coffee machine texture fix:** Kenney `Trashcan` and `Kitchencoffeemachine` now project full-sized textures across their panels instead of repeating them at miniature UV intervals. Existing placed objects use the improvement automatically; they do not need replacement.

## CRT monitors are powered off (v96)

The original licensed **1990s CRT desktop computer (keyboard + mouse)** now has a genuinely **blank, powered-off near-black glass display**, with no baked green imagery, screen glow or emission. A separate reflection overlay from the source model is hidden so no green monitor content remains; the tube still has a restrained physical glass sheen under the existing lighting. The original cream monitor housing, PC case, detailed image-mapped keyboard and mouse are all preserved exactly.

This applies to **all current and saved Builder CRT instances**, newly placed previews, and previously saved entries for the retired LCD catalog ID (already redirected to the 1990s CRT). The original binary GLB and its 20 image assets remain pinned and unchanged. Builder-only treatment is implemented in `builder/crt-powered-off-v96.js`, called by `builder/editor-scene.js` when preparing CRT instances. The game campaign and all unrelated assets remain untouched.

Tests: `scripts/test-builder-crt-powered-off-v96.mjs`, `scripts/smoke-builder-crt-off-v96.mjs`, the focused `.github/workflows/pinewood-builder-crt-off-v96.yml` workflow, plus unchanged CC0 source asset audits.

## Visible selected-object collision warnings (v95)

If a wheel rotation, inspector move, gizmo placement or scale adjustment is rejected by the **existing strict collision protection**, the standalone Builder now shows a **prominent nonmodal warning directly near the selected object in the 3D viewport**. It follows the object as the camera moves, remains visible rather than fading before it can be read, and explains whether a **Rotation**, **Move** or **Scale** was blocked. It names the reason (wall intersection versus missing continuous floor/furniture support) and suggests moving the object or selecting **Allow overlap** when deliberate clipping is needed. The prior save-status text remains unchanged for accessibility and compatibility.

The warning is not part of the saved draft. It clears immediately after a successful edit, deselection/object switch, Undo/Redo, or change to the Allow overlap setting. It is pointer-transparent and does not intercept gizmo drags, camera movements, or the normal mousewheel. The core v87 collision check, existing 41 rooms, Builder saved layouts, and playable campaign are **unchanged**. The visible status is also `role="alert"` for assistive technology.

Implementation: `builder/blocked-feedback-v95.mjs`, `builder/main.js`, `builder/index.html`, `builder/builder.css`; focused tests `scripts/test-builder-blocked-feedback-v95.mjs`, `scripts/smoke-builder-blocked-feedback-v95.mjs`, and `.github/workflows/pinewood-builder-blocked-feedback-v95.yml`.

## Authentic cardboard boxes and original keyboard/mouse materials (v93)

After the expanded v91/v92 material library, the **Cardboardboxopen** and **Cardboardboxclosed** models still looked wooden with obvious tiny stamped patterns. This was caused by the original Kenney GLBs naming their paper materials `wood` and `woodDark`. Their material names are not physically accurate. Both original box meshes are now **explicitly classified as paperboard**, not timber. An **open box gets worn cardboard** and a **closed box gets clean brown cardboard**, each a source-verified, locally bundled **ambientCG CC0 1K JPEG** applied over a full broad face instead of tiny repeating tiles. The original folds, separate dark interiors, old placements, model IDs and saved layouts are preserved.

**Keyboard and mouse:** The standalone original Kenney keyboard always had two solid-colored materials and the mouse one; neither original source GLB contained image textures. Their source geometry and original colors are now explicitly cloned per placement and protected from all automatic photo texturing. The separately sourced, detailed 1990s **CRT computer with keyboard + mouse** retains its original image-mapped keyboard and mouse pieces without modification. To use that more detailed cream-colored equipment, choose the bundled **CRT desktop computer** model rather than standalone low-poly Kenney peripherals.

New sources and per-file SHA/licenses: `assets/vendor/builder/materials-v93/manifest-v93.json` and `LICENSES.md`. Safe remapping in `builder/cardboard-materials-v93.mjs` and exact peripheral-source isolation in `builder/source-peripherals-v93.mjs`; original `.glb` binaries remain unchanged. Automated checks: `scripts/test-builder-cardboard-peripherals-v93.mjs`, original asset SHA audit and desktop `scripts/smoke-builder-material-v91.mjs`. All resources load locally.

## Expanded textures and detailed prop materials (v91)

The standalone Builder now offers **50 more fully local, source-verified Poly Haven CC0 1K textures**: 20 new wall options, 13 floor options and 8 ceiling options (some source images are useful in more than one place). The original finishes remain, with all previous saved finish IDs unchanged. Interior options include chipped and faded wall plaster, brick and weathered retail cladding, 1980s-style tile, parquet, laminate, aged wood floors, stained plaster and old ceiling insulation. The Wall, Floor and Ceiling selectors include **live image swatches** of the actual chosen local texture, making the material appearance visible before applying it. The original architectural rooms, skylight, doors, walls, collision and campaign are untouched.

For the previously audited **324 source color-only** new GLBs and other color-only catalog props, the Builder uses actual named model material groups to apply matching photographs to wood, aged steel, fabric, leather, painted cabinet panels, stone, etc. Drawer handles get a steel surface while a desk's warm wood and darker cabinet panels each retain **different image textures**; colors continue to tint their separate parts. Glass, glow, lights, screens, snow, and colored signs intentionally retain their special source materials rather than being indiscriminately coated. Source GLBs with embedded image maps keep them. CC0 models that lack usable UVs receive **per-face box-projected UV coordinates on a copied mesh**; source GLB binaries never change, and the source's triangle positions, size and collision geometry remain untouched.

Material assets are hashed and source-pinned in `assets/vendor/builder/materials-v91/manifest-v91.json` with generated option allowlists in `builder/material-options-v91.mjs`, texture renderer `builder/prop-materials-v91.js`, and precise SHA/license details in `LICENSES.md`. Diagnostics `window.__PINEWOOD_BUILDER__.getMaterialStats()` and `inspectObjectMaterials(id)` report actual applied material roles and generated UVs. Tests: `scripts/test-builder-material-v91.mjs`, `scripts/smoke-builder-material-v91.mjs` and the focused `pinewood-builder-material-v91.yml` desktop workflow. This is **Builder-only**, with existing layouts, props, and original five room surfaces untouched.

## Controls

| Action | Control |
| --- | --- |
| Orbit / pan / zoom | Left drag / right drag / mouse wheel with no selection; Shift+wheel zooms with an existing object selected |
| Search models | Search and filter by category or condition in the left panel |
| Work lights | Toggle **Work lights** near the roof controls for a brighter decorating view with reduced fog, gently increased exposure and calibrated neutral fill. The calibrated mode preserves the browns and grays of authored furniture instead of bleaching solid-color benches and shelves nearly white. Uncheck to restore the exact atmospheric original. This never changes the playable game or exported layouts. |
| Atrium skylight / roof cutaway | **Roof / ceilings** starts checked: the central glass skylight and ground-floor ceilings are visible when the Builder opens. Uncheck it for unobstructed top-down furnishing; check it to review the enclosed mall again. This switch affects only the editor view, not the exported layout or chapter game. |
| Add a model | Choose a prop; aim in Orbit or Explore/Fly (screen center when mouse-look is locked); wheel up turns left, down turns right in 15° steps; Shift+wheel moves near/far; left click places with that rotation |
| Select an existing prop | Click it in the scene or the scene outliner |
| Move / rotate / scale | Top toolbar, gizmo, or exact Inspector values; shortcuts 1 / 2 / 3. With an existing object selected, wheel rotates it 15° and saves the edit (undo/redo supported) |
| Duplicate / remove | Inspector; Delete removes selected |
| Undo / redo | Toolbar or Ctrl+Z / Ctrl+Y |
| Walk | Explore, WASD and mouse |
| Fly with no collision | Explore, Fly or F; Space up, Shift down |
| Return to gravity | F or Fly again; player descends to a physically supported surface |
| Visit another room/floor | Jump-to-room selector (41 actual rooms) |\n| Visit the cinematic exterior | Choose **Parking Lot (Cinematic Exterior)** in Jump-to-room; orbit, walk and fly all work outside, with parking asphalt and sidewalk as placement surfaces |
| Operate doors | Select door/Open–Close tool; E near a doorway in Explore |
| Turn off builder-only unlocked access | Unlock all toggle (does not alter story locks) |

The editor saves automatically to **IndexedDB in this browser** after each edit. It also has manual Save, Export World Layout (JSON), Import JSON and Reset local draft. Use Export to create a portable, reviewable layout. Import validates the model allowlist and serialized transforms; invalid or remote-asset references are rejected.

## 482 new CC0 models

`assets/vendor/builder/catalog-v1.json` lists the 482 new self-contained licensed CC0 GLB binaries, source URLs, pinned upstream references, each model's exact SHA-256/byte count and any local thumbnail. The catalog joins 17 previously pinned CC0 furnishings in the selector. Models are grouped into 10 categories spanning vintage electronics, retail display and arcade fixtures, seating, food-court clutter, lighting, winter decorations, neglected foliage, damaged debris, and the authentic silted decorative fountain. Filter **Weathered / damaged** to find deliberately distressed assets.

The builder never fetches third-party runtime assets. The one-off vendoring tool `tools/vendor-builder-cc0-v1.mjs` is development-only and is executed by a GitHub Actions runner. `scripts/audit-builder-assets-v1.mjs` checks every local GLB signature, byte length and checksum.

## Image textures versus solid-color materials

The 482 newly imported CC0 GLBs are a mixture of asset styles. A complete
GLB material audit on 2026-11-06 found **324 models using solid material colors**
without embedded images, and **158 models containing embedded image maps**.
All had valid material assignments and no missing texture references, external
image dependencies, or missing texture-coordinate attributes. Lack of photo
detail in a color-only source model is not a missing-file bug.

The 21 original selectable fixtures are also checked: 12 have solid-color materials and 9 contain image maps; their eight relative image-file references resolve to locally bundled files.

Use **Surface material type** in the prop catalog to filter by **With embedded
image maps** or **Solid-color materials**. Each imported model also shows its
material type beneath the title. This filter does not modify your layout or
alter existing assets. It also does not promise realistic detail: some embedded
maps are palette/color atlases rather than photographic wear or woodgrain.

For more detailed 1990s surfaces, replace selected CC0 color-only models with
genuinely textured CC0 GLBs, or author appropriate texture maps and vendor
them locally with license/source/hash records. Avoid blanket texture
assignments across unrelated materials such as glass, CRTs, metals and plants.

## Campaign safety

The builder is intentionally independent from the chapter/story runtime. The export is **not** silently applied to playable chapters. `mall/editor-overlay-v1.mjs` supplies a guarded `prepareApprovedLayout` and opt-in, reversible `applyApprovedLayout` interface for a **future owner-reviewed** exported world. Applying that world to the actual campaign requires explicit owner approval of the specific exported JSON; story door locks and evidence/architectural geometry are never taken from the edit preview.

## Focused verification

`pinewood-builder-v1.yml` runs schema/traversal/overlay/property checks, a per-file CC0 asset audit and automated desktop Chromium editing/persistence/navigation tests. It intentionally does not invoke the unrelated six-chapter hardening suite.
