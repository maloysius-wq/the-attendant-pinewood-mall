# V150: three grounded staff belongings in the original Chapter 1

## Narrative purpose and strict boundaries

The **canonical `STORY_BIBLE.md`** introduces Pinewood's 1997 staff as ordinary people well before their later story reveals. This first Phase D pass adds **three physically modeled, small, optional visual belongings** inside the *existing full original* Chapter 1 public mall. They are environmental objects, **not** E pickups, journal unlocks, story flags or additional LS evidence. No new rooms, walls, gameplay colliders, asset fetches, dialogue, audio triggers or AI.

| Owner | Object | Original location and real support | What it foreshadows |
| --- | --- | --- | --- |
| Jo Alvarez, closing manager | Physical 1997 closing-round clipboard with a metal clip and short list of food-court closing checks | Food Court, original `food_table_4` licensed `Table_Round_Small.glb` surface | Jo cares about checking with individual closers, not merely signing a form. **Not** LS-04/LS-07 roster or the later suppressed statement |
| Tessa Kim, Cassette Castle clerk | Lightly worn hand-written Top 40 staff picks / weekend scribbles on cardstock with a physical chart tab | Cassette Castle, original `cassette_counter` licensed `KSI_counter.glb` surface | The music-shop clerk is a person with weekend plans, **not** the later LS-06 cassette side B recording |
| Luis Ortega, night Security supervisor | Manila-coloured physical video-copy request sleeve with a folded flap, marked for night Security | Video Planet, original `video_counter` licensed `KSI_counter.glb` surface | The ordinary reason Luis handled copied rental/security tapes, **not** the LS-03 map, LS-05 VHS recording or Chapter 3 body |

The original nine source `LS-01..09` anchors remain untouched. Jo and Tessa's survival, Luis's death, PCAS's fundamental mistake, and the Attendant's supernatural cause are **not explained** in these early Chapter 1 belongings. They merely seed names and humane context for later recognition.

## Physical implementation

`mall/chapter1-staff-belongings-v150.mjs` references only original `FURNISHINGS_V69` source fixtures and validates their Chapter 1 room, license-pinned local model path, size, real original walking navigation and non-overlap with LS anchors. Its three viewing positions are actual `layout.canStand` points reachable from the authored cinematic entry via `shortestRouteV70`.

`mall/chapter1-staff-belongings-v150.js` resolves the **actual scene Object3D** by its source `furnished_<fixtureId>` ID, verifies the exact `fixtureId` and `modelSource`, and measures the source model's **true world `THREE.Box3`** with current transforms. It refuses an absent, hidden, short, narrow or non-supporting source fixture rather than silently floating a keepsake. Objects have a few millimeters of clearance on the measured original top surface, small textured cardstock/clipboard physical depth and a deliberately restrained printed canvas texture. They belong to the original rendered group, do not enter original `world.interactables` or `world.colliders`, and use no remote resource or saved progress.

**Measured width correction:** The actual licensed Video Planet counter is only **0.80765m wide along X** (original desktop GLB `Box3` minX=34.59617, maxX=35.40383), although its approximate fixture radius is larger. Initial Luis sleeve x=35.24 overhung by roughly 0.018m and failed the strict desktop startup guard at 68%. The source-corrected placement uses **(x=35, z=-64.66)**, on the counter's *long* Z axis and away from its existing demo VHS at (35,-65). A dedicated regression checks its complete physical `width/depth` inside that measured bound, without removing the runtime Box3 check.

## Real original restart and lifecycle

`game.js` installs the V150 source controller only inside existing Chapter 1 V70 `relocateStory`, after V139–V149 and unchanged Chapters 2–6. Reinstallation is idempotent for the same three real supports.

V148 proved the original fatal **world.clear → resetState → scene rebuild → V70 post-build binding** order. V150 follows this exactly: it calls the previous original reset chain and **disposes only** its old geometry, materials and textures. It does **not** require or bind absent furniture during reset. The existing post-build hook recreates each object on the freshly restored original support once. This protects the actual Death → Restart screen, real source E/Q pickups, source Fallow cabinet, V149 hunt/search and original A/B/C wall circuits.

## QA scope

- `scripts/test-chapter1-staff-belongings-v150.mjs`: canon/story-only boundaries, original room and source fixtures, exact three IDs, real approach navigation, preserved nine LS anchors, measured video-counter footprint and source reset isolation.
- `scripts/smoke-chapter1-staff-belongings-v150.mjs`: original **1440×900 desktop game**, three physically attached source surfaces and texture heights; local-only first-person real camera raycasts and authentic screenshots of all three in their rooms; original real source breaker → first reveal → lethal Attendant contact → original Death Restart → full source-world rebind and Begin Shift. Reports no failed local assets, off-origin requests, or runtime errors.
- `.github/workflows/chapter1-staff-belongings-v150.yml`: targeted source, established V145/V148/V149 regressions and pinned local asset audit, plus the authentic original desktop test and screenshot/JSON artifact upload.

No manual WASD, mobile emulation, synthetic test arena, private Builder draft publication, or fabricated puzzle collectible. This is a visual environmental-storytelling pass. **No claim of in-game inspect/journal functionality** until that is separately implemented and tested.

## Subsequent work

Consider extending optional *genuine* inspection and People journal recognition only if integrated without corrupting existing E interactions, then continue Chapter 2 Renee/PCAS transition, Chapter 4 evidence progression and six-chapter older-save/Continue audits. Preserve the current story bible, source Last Shift progression, original 41 rooms, thirteen sealed bays, original V113 cinematic/door, licensed local CC0 and original Attendant.
