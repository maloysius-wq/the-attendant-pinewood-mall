# V120 | Public mall lounges and fixed directory wayfinding

**Goal:** Repair barren central and side shopping galleries without random debris/prop scattering. Reuse the real 1979 mall structure and original CC0 models, preserving original owner-only Builder data, the six chapters and nine LS evidence markers.

## Source-grounded placement plan

The source floor has an original x−11…11, z−112…−43 fountain atrium, western x−29…−11 shopping aisle, and eastern x11…29 shopping aisle. V118 installed 28 real grounded 1979-era structural supports with 5.19m retail soffits and 12.8m solid atrium roof. This pass stages period rest spaces **in that actual structure**, not free-floating invented slabs.

| Amenity | Coordinates (world metres) | Actual physical role |
| --- | --- | --- |
| Southwest atrium bench | x−5, z−58, yaw +π/2 | Original CC0 bench, preserves original fountain and entrance orientation |
| Southeast atrium bench | x5, z−58, yaw −π/2 | Opposite real CC0 seat, clear of LS−01 |
| Northwest atrium bench | x−5, z−84, yaw +π/2 | Far-side rest area beyond actual fountain |
| Northeast atrium bench | x5, z−84, yaw −π/2 | Opposite far-side original bench |
| West shopping recess bench | x−15.8, z−87 | Fits between old original columns, x−20 spine stays open |
| East shopping recess bench | x15.8, z−87 | Matches original west side while x20 walking spine stays open |
| South two-sided directory | x−3,z−52 | Actual 2.25m built-in mall map with concrete plinth and framed printed tenant diagram |
| Northern directory | x3,z−101 | Matching real floor-standing map kiosk for north-side orientation |
| West attached wayfinding | V118 pillar `v118_west_inner_03` (x−13.4,z−79) | Metal-bracket mounted 1989 wayfinding, real Cassette Castle/Fallow's/Arcade labels |
| East attached wayfinding | V118 pillar `v118_east_inner_03` (x13.4,z−79) | Opposite authentic source pillar with Video Planet/Food Court/East Wing labels |

**Asset:** Existing pinned local **Kenney Graveyard Kit Bench** `assets/vendor/builder/models/graveyard-kit/kenney-graveyard-kit-bench.glb`, licensed **CC0-1.0**, original catalog id `kenney-graveyard-kit-bench`, verified catalog SHA256 `3bcc3bf463e9e09038688ba8f1ffd44ffa095920255a2e1cbc655edbaaab97b9`. Source targets real 0.95m stature with a conservative radius 2.10m base footprint, and the actual GLB is measured and scale-validated after runtime preload. Do not replace with procedurally made cube benches. The only new printed geometry is the original-1989 map and steel/stone kiosk frame and bracket, which are genuinely grounded/attached to real original piers.

**Central-circulation correction:** The first source run caught that directories centered at x0 blocked the historic atrium spine (the original V118 test takes x0 from z−52 to z−108). The physical directories have now been shifted 3m to alternating sides, where measured support/evidence clearance is preserved. A new test protects the entire center route, not just the storefront entrances.\n\n**Physical source and gameplay agreement:** `mall/gallery-amenities-v120.mjs` holds exact ground plan, validates original 41 rooms / nine evidence context, source shop thresholds, V118 28 support clearances, real dry fountain rim radius5.1 plus 1.1m buffer, LS−01 (7,−66), LS−02 (7,−94) original positions, original two shopping spines x±20, and all eight anchored public objects against each other. `mall/physical-shell-v67.mjs` publishes amenity source, tracks actual line-segment blocking; `mall/gameplay-layout-v70.mjs` adds real AABB ground collision on the six benches and two directories. The overhead pillar signs do not obstruct the player's walk.

`mall/render-gallery-amenities-v120.js` loads the exact pinned bench GLB before the scene first frame in the same shared Builder, opening and game architecture; instances are measured/grounded in true source metres. Original material map cards are CanvasTextures in two permanent 2.25m directory structures, mounted to real fixed plinths. The two mall signboards mount to existing actual x±13.4 source pillars via physical short brackets. No user-authored Builder placements are accessed or published.

## Evidence and release gates

- Dedicated `scripts/test-gallery-amenities-v120.mjs` enforces true CC0 catalog integrity, source construction/physics, actual mall exits and shop entry clearance, fountain and nine LS anchors, all six chapter spawns, original 41 rooms, V113 hinged E anti-trap and V115–V119 architecture.
- Real 1440×900 Chromium/WebGL `scripts/smoke-gallery-amenities-v120.mjs` screenshots of atrium lounge, two physical directories, both retail benches, west/east retail aisles and aerial survey. Capture each **actual 3D scene** with measured licensed model provenance/scale. No fake image concept art as proof.
- Inherited source, Builder, scene and real Chapter 1 E-door CI must all pass on the exact **final PR head**, and genuine screenshots must be visually inspected for realistic bench scale, physical walls/ceilings, wayfinding legibility and natural traffic routing before merge.
- Keep the original 638-model Builder library and original owner IndexedDB `pinewood-builder-v1` untouched, six chapters, 41 rooms, nine LS evidence, V115 seven glass shop fronts, V116 13 shut tenants, V117 check-in, V118 28 grounded columns and V119 1997 food court.
- Do not claim full mall completion; remaining 520m² of unassigned ground floor and under-dressed tenant/office interiors remain Issue #119 priorities. No manual WASD or mobile test is claimed.

**Visual-correctness decision:** The first actual WebGL capture of the Furniture Kit 'bench' revealed a *single narrow white chair*, measured only 0.40m×0.81m at 0.95m height. It was rejected as misclassified for a shopping-mall lounge. The existing alternative CC0 Graveyard Kit bench is being trialed in original source and must show at least 1.25m long actual seat footprint in real desktop QA before release. If it is also inappropriate, redesign this public seating using a vetted third original model; never stretch tiny chairs into furniture or mislabel their scale.
