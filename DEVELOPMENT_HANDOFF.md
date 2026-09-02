# Development Handoff: The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** **Always use the connected GitHub plugin/connector first for Pinewood repository work. Never claim access is unavailable before checking the GitHub plugin.**  
**Source-of-truth rule:** Read `AGENTS.md` and this file first, then inspect the latest commits/current repository files. The repository and the user's newest explicit request override older chat history.

## Current narrative/audio checkpoint — v19

The deployed loader now continues past the visual/local-asset stack through four narrative/audio layers:

1. `patches/retail-geometry-v16.js.txt`
2. `patches/story-foundation-v17.js.txt`
3. `patches/chapter1-story-v18.js.txt`
4. `patches/pcas-voice-v19.js.txt`

Narrative authority is `STORY_BIBLE.md`; implementation staging is tracked in `NARRATIVE_IMPLEMENTATION_PLAN.md`. Story Foundation v17 supplies six-chapter data, versioned save migration, people/evidence/timeline state, StoryEventManager and the structured Journal. Chapter 1 Story v18 introduces Renee Ward by name, delays PCAS identifying the player as Contractor Fourteen until after power returns, fixes the Attendant's first-reveal countdown, and rewrites LS-01 through LS-03 as character-authored 1997 evidence.

PCAS Voice v19 gives the overhead PA a pre-rendered distorted robotic voice. Nineteen authored announcements are generated offline with eSpeak NG and processed offline with FFmpeg, then committed as OGG files under `assets/audio/pa/`. The browser never calls a cloud TTS provider or browser speech synthesis. Runtime subtitles use each recording's manifest duration; ambient PA chatter and authored PCAS story beats share the same local voice system. Browser telemetry `window.__PINEWOOD_PCAS_V19__` reports line count, decoded clip count and failures so automated regression can verify all local voice assets without manual playtesting.

`scripts/audit-pcas-voice-v19.mjs` reconstructs the runtime through v19, verifies all 19 audio hashes/text mappings/local paths, checks the live loader chain, rejects browser/cloud TTS paths and syntax-checks the assembled runtime. `scripts/capture-store-visuals.mjs` also requires all 19 PCAS clips to decode in Chromium and preserves the same-origin network gate.

## Permanent local-runtime-asset rule

**NEVER use remote assets or remote browser libraries at runtime. ALWAYS download/vendor verified dependencies into this repository and serve them locally.** This is a permanent no-regression rule.

- Models, GLTF/GLB buffers and model textures must be repository-local before use.
- PBR/material textures, images and decals must be repository-local before use.
- Sound effects, ambience and music must be repository-local before use.
- Three.js, Pako and any future browser/runtime library must be pinned and served from this repository rather than a CDN.
- External URLs are allowed only for provenance/documentation or development-time vendoring. They must never be browser fetch/load targets in the shipped game.
- New third-party assets require verified licensing, a local vendored copy, source/pin/hash provenance, and an updated local-assets audit.
- If an asset cannot be legally verified and vendored, omit it or choose another verified asset. Do not create a remote-runtime exception.
- Do not restore the historical strategy of GitHub Raw/Poly Haven/OpenGameArt/CDN runtime URLs plus fallbacks.

---

## 1. Game direction

The Attendant is a first-person browser horror game set in a decaying 1990s mall. Pinewood should feel lonely, dirty, physically believable, and increasingly impossible: dead storefronts, stained tile, service corridors, old PA equipment, obsolete retail technology, failing lights, distant sound, and architecture that feels wrong without becoming arbitrary.

The player is a contractor, not an action hero. The core loop is exploration, maintenance-style objectives, environmental discovery, hiding, sound/stamina management, distraction, and surviving The Attendant long enough to complete Pinewood's closing routine.

Use verified CC0 assets where suitable. Keep `LICENSES.md` and in-game attribution current.

---

## 2. Runtime architecture

`game.js` reconstructs the immutable encoded base runtime from `bundle2/`, normalizes Three.js imports, then applies authored patches in this order:

1. `patches/worldprops-v1.js.txt`
2. `patches/industrial-cc0-v1.js.txt`
3. `patches/visual-fixes-v1.js.txt`
4. `patches/store-polish-v2.js.txt`
5. `patches/systems-polish-v3.js.txt`
6. `patches/reliability-v4.js.txt`
7. `patches/status-lights-v5.js.txt`
8. `patches/audio-immersion-v6.js.txt`
9. `patches/elevator-rebuild-v7.js.txt`
10. `patches/fountain-rebuild-v8.js.txt`
11. `patches/cassette-castle-rebuild-v9.js.txt` (historical/transitional Cassette Castle rebuild)
12. Food Court builder replacement from `patches/foodcourt-v3.js.txt`
13. `patches/poster-polish-v10.js.txt`
14. `patches/footstep-mix-v11.js.txt`
15. `patches/poster-diversity-v12.js.txt`
16. `patches/cassette-castle-rebuild-v13.js.txt` (grounding/shelf-ban foundation)
17. `patches/cassette-castle-rebuild-v14.js.txt` (**final authoritative Cassette Castle layout/finish override**)
18. `patches/local-assets-v15.js.txt` (**final runtime asset localization layer; all media resolves to repository-local vendored files**)
19. `patches/retail-geometry-v16.js.txt` (**final retail/elevator geometry reliability layer**)
20. `patches/story-foundation-v17.js.txt` (**structured narrative/save/Journal foundation**)
21. `patches/chapter1-story-v18.js.txt` (**Chapter 1 Renee/PCAS/evidence retrofit**)
22. `patches/pcas-voice-v19.js.txt` (**local pre-rendered distorted overhead-PA voice layer**)

Patch order is intentional. Poster v10 runs after the Food Court replacement, v12 diversifies the final store posters, v13 establishes the permanent geometry-grounding and banned-shelf foundation, and v14 runs last to replace the v13 store layout with the final open-floor design while preserving those grounding rules.

`.github/workflows/runtime-audit.yml` runs:

- `scripts/audit-runtime.mjs`
- `scripts/audit-footstep-mix-v11.mjs`
- `scripts/audit-poster-diversity-v12.mjs`
- `scripts/audit-cassette-castle-v13.mjs`
- `scripts/audit-cassette-castle-v14.mjs`
- `scripts/audit-local-assets-v15.mjs`
- `scripts/audit-retail-geometry-v16.mjs`
- `scripts/audit-story-foundation-v17.mjs`
- `scripts/audit-chapter1-story-v18.mjs`
- `scripts/audit-pcas-voice-v19.mjs`

The v13 audit now verifies that v13 reconstructs cleanly as the foundation handed to v14. The v14 audit reconstructs the complete deployed chain through v14, checks the final Cassette Castle layout plus protected earlier systems, and syntax-checks the assembled runtime.

Do not use `runtime-audit.js` as the deployed source of truth. It is a decoded reference/audit copy of the old base runtime.

---

## 3. Architecture constraints

Keep these systems separate:

1. authored walkable floorplan,
2. rendered geometry,
3. physical prop collision,
4. AI navigation,
5. story/game state.

Do not return to runtime store carving or decorative geometry mutating the fundamental walkability grid.

The collision system supports **navigation-only blockers** via `physicalBlock:false`. This exists specifically so spaces such as the freight elevator cab can remain physically enterable by the player while being excluded from The Attendant's A* navigation.

---

## 4. Controls

- WASD: move
- Mouse: look
- Shift: sprint
- C: hold breath / move quietly
- E: interact
- F: flashlight
- Q: throw decoy
- J: journal
- Esc: pause

---

## 5. The Attendant

The Attendant is an original black articulated humanoid silhouette with white emissive eyes, blurry/fuzzy edge treatment, gait animation, glitch particles, and afterimages.

Important behavior:

- physical contact kills outside a valid hiding/safe state,
- decoys divert and briefly stun/distract,
- sprinting is faster and louder,
- holding C is quieter/slower and consumes breath,
- danger/hearing uses route/path distance rather than straight-line distance through walls,
- walls genuinely protect from impossible through-wall proximity sensing.

The freight elevator cab is an AI-excluded end-of-chapter space. The Attendant cannot path into the cab, and a small cab safety check prevents contact-death edge cases during the active elevator sequence.

---

## 6. Audio

The old generated Web Audio SFX engine is retired. Non-music SFX use locally vendored CC0 recordings in `assets/audio/cc0/`.

All vendored files are normalized with FFmpeg EBU R128 processing to approximately:

- **-20 LUFS integrated**
- **-2 dBTP true peak**
- **7 LU target LRA**
- stereo 44.1 kHz Vorbis OGG

### Footsteps: authoritative v11 mix

Current footstep mix:

- normal dry gain approximately **`.09`**,
- sprint dry gain approximately **`.14`**,
- quiet/held-breath movement further attenuates the cue,
- two low-level delayed copies at roughly **110 ms** and **230 ms** preserve the subtle empty-mall slapback/echo at the same proportional mix.

These values are intentionally about 50% of the previous `.18/.28` base gains. Do not restore the louder values unless explicitly requested.

### Mall music

The CC0 mall loop remains intentionally degraded: roughly half-speed playback, pitch preservation disabled, delayed copies for hollow slapback, and occasional playback-rate drift. Threat music fades in with The Attendant's route-distance proximity while the mall loop recedes.

### Cassette Castle localized mix

v14 reduces roomtone to roughly **62%** and static to roughly **72%** of their normal loop mix while the listener is physically inside Cassette Castle. This is localized ambience shaping only. It does not change threat music logic.

---

## 7. Breakers

Chapter 1 breaker IDs: **A / B / C**  
Chapter 2 relay IDs: **D / E**

Current breaker behavior:

- wall-mounted CC0 Kenney Factory Kit cabinet housing,
- dim red status LED while off,
- bright red LED plus restrained local glow when restored,
- physical lever rests at a clear OFF angle,
- lever smoothly animates to the opposite ON angle when activated,
- recorded normalized CC0 breaker-switch sound.

Do not revert the active LED to green or remove the lever animation.

---

## 8. Freight elevator: authoritative implementation

`patches/elevator-rebuild-v7.js.txt` is authoritative.

The old Chapter 1 procedural `East Service Shutter` directly in front of the elevator is completely retired. Do not reintroduce it.

Visible architecture is assembled from verified Kenney CC0 GLB content. The threshold blocker stays solid until the visible leaves are essentially fully open. The Master Service Key operates the elevator's own service lock.

Required Chapter 1 sequence:

1. restore A/B/C,
2. acquire Master Service Key,
3. unlock/call freight elevator,
4. imported leaves open,
5. player physically enters,
6. doors close,
7. player is centered/locked during ride,
8. chapter transitions after the ride.

The doors remain open indefinitely while waiting for the player. The Attendant is excluded from the cab and boarding has short grace windows so entering the cab reliably ends the chase.

Never restore the old shutter, second door collision, key-to-shutter behavior, early collision disable, or AI cab access.

---

## 9. Central fountain: authoritative implementation

`patches/fountain-rebuild-v8.js.txt` is authoritative.

The old two-cylinder fountain and oversized `3.2 × 3.2 m` square collider are retired.

Current fountain rules:

- center remains exactly at `(0,0,0)`,
- visible footprint radius **1.64 m**,
- custom-authored basin/rim exactly fills the existing spot,
- Poly Haven **Marble Tiles** on the worn rim/coping,
- Poly Haven **Grey Tiles** inside the dry basin,
- pinned Kenney Starter Kit City Builder `pavement-fountain.glb` fitted as the center feature,
- dry basin includes mineral/waterline staining, rust, damp remnant, coins and paper trash,
- no active water surface or spray,
- nine narrow collider strips approximate the circular footprint without changing the authored floor grid.

---

## 10. Cassette Castle: authoritative v14 rebuild

`patches/cassette-castle-rebuild-v14.js.txt` is the **final authoritative Cassette Castle layout, visual-finish, and localized-ambience implementation**. It runs after v13.

v13 remains a required foundation. Its model-bounds grounding helpers, real Poly Haven cassette-component stock, and permanent tiny-shelf ban remain active and protected. v14 replaces the v13 floor layout, not the safety rules that made v13 necessary.

### Permanent shelf ban

The following resources are **permanently banned from all Pinewood runtime use**:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- any URL/alias containing `Shelf%20Large.glb`, `Shelf%20Small.glb`, `/ShelfLarge/`, or `/ShelfSmall/`

v13 scrubs those historical resources from the assembled runtime, v14 verifies they remain absent, and `AGENTS.md` repeats the prohibition. Do not rename, re-add, or retry these resources.

### Geometry-grounding rule

Cassette Castle visible furniture and merchandise must not use guessed absolute world-Y placement.

The retained v13 helpers use `THREE.Box3` bounds to:

- scale imported furniture to intended human-scale target height,
- ground floor fixtures/stools/counters to the floor,
- discover usable shelf support levels from real fixture geometry,
- anchor cassette stock to those supports,
- measure counter tops before placing cassette players, loose tapes, or registers.

Important retained helpers include:

- `cassetteWorldBox(...)`
- `cassetteScaleToHeight(...)`
- `placeCassetteGrounded(...)`
- `placeCassetteOnSurface(...)`
- `cassetteShelfLevels(...)`
- `stockCassetteFixture(...)`
- `addCassetteFullRack(...)`

If the real Poly Haven cassette/tape component is unavailable, those stock positions remain empty. If a required CC0 model fails or has invalid bounds, omit the affected object rather than create a visible fake primitive replacement or leave unsupported props floating.

### v14 final store layout

The store is intentionally open-plan rather than a shelf maze:

- **six** full-height Kenney Furniture Kit `bookcaseOpen.glb` perimeter racks, three on the left wall and three on the rear wall, target measured height **2.00 m**,
- **three** true low Kenney Furniture Kit `bookcaseOpenLow.glb` center merchandising fixtures, target measured height **1.08 m**,
- a coherent **three-module** listening bar on the right using imported Kenney Space Kit `KSI_counter.glb` modules,
- one grounded Poly Haven cassette player per listening module,
- one grounded Quaternius stool per listening module,
- real extracted Poly Haven tape components placed only when available,
- a separate imported Kenney `KSI_counter.glb` checkout with grounded register near the entrance side,
- the physical CC0 hiding cabinet preserved at the back-right.

v14 retires the v13 center double-rack runs and the three isolated round listening-table islands. Do not restore either layout.

### v14 store finishes and lighting

v14 adds a visual-only retail finish group:

- dark blue-grey store floor treatment,
- muted blue wall panels,
- warm worn accent strips,
- restrained wall rail detail,
- three localized warm dying-store point lights.

The finish group is explicitly visual-only and must not add colliders, carve floor cells, or alter AI navigation.

### Retired Cassette Castle systems

Do not restore:

- Mini Market baked-stock browsing shelf,
- `fallbackCassette(...)`,
- generated cassette bodies/reels,
- procedural listening torus/rings,
- primitive shelf/table/box fallbacks,
- v9 `placeCassetteCc0(...)`,
- `stockRealCassetteFixture(...)`,
- `addCassetteDisplayFixture(...)`,
- `dressCassetteListeningTable(...)`,
- v13 center `addCassetteDoubleRackBay(...)` layout usage,
- v13 isolated `dressGroundedListeningStation(...)` layout usage,
- hard-coded absolute world-Y placement for visible shelf/table/counter stock.

Vinyl-record props remain omitted because previously identified candidates were not all CC0. Do not slip CC-BY record/turntable assets into the project to fill the category.

---

## 11. Store poster marketing: v10 + v12

`patches/poster-polish-v10.js.txt` establishes the Chapter 1 store poster campaigns. `patches/poster-diversity-v12.js.txt` is the final poster-layout authority.

The old `makePoster(...)` renderer is retired.

Each store keeps one v10 hero design and uses two visually distinct v12 alternates, including different illustration/layout systems and different physical frame treatments.

### Sunburst Arcade

- **GALAXY STRIKE**: retained v10 neon-grid hero
- **TOKEN FRENZY**: v12 radial token-promotion design
- **PRIZE VAULT**: v12 ticket-redemption/prize-catalog design

### Video Planet

- **BE KIND • REWIND**: retained v10 rental-store hero
- **MIDNIGHT RENTALS**: v12 horror-night one-sheet design
- **2 NIGHTS • 1 PRICE**: v12 membership/rental-coupon design

Do not replace these with copyrighted real movie posters.

### Pinewood Food Court

- **SLICE CITY**: retained v10 food-promo hero
- **POLAR POP**: v12 soda/refill advertisement
- **WOK THIS WAY**: v12 illustrated takeout/noodle/combo design

### Cassette Castle

- **NEW WAVE**: retained v10 music-zine hero
- **LISTEN BEFORE YOU BUY**: v12 listening/headphones/audio-waveform design
- **PINEWOOD TOP 40**: v12 ranked chart-board design

Do not collapse the posters back into one shared composition with swapped text/colors.

---

## 12. Chapter/story arc

### Chapter 1: Closing Time
Restore A/B/C, find the Master Service Key, use the freight elevator, and discover that it descends instead of escaping.

### Chapter 2: Service Level
Find the security keycard, restore D/E, and reach the north stairwell. The work order is revealed to have been filed in 1997.

### Chapter 3: The Last Shift
Recover the Last Shift material and end Pinewood's closing/accountability routine from PA control. Do not reduce the ending to simply cutting power.

There are nine numbered Last Shift logs, `LS-01` through `LS-09`. Recovering all nine changes the ending.

---

## 13. Chapter 1 stores

The four authored walkable storefronts are:

- Sunburst Arcade
- Video Planet
- Pinewood Food Court
- Cassette Castle

Preserve their distinct visual identities and keep entrances/navigation clear.

Food Court v3 specifically uses clamped wall imagery (`THREE.ClampToEdgeWrapping`, repeat `(1,1)`) to prevent the old tiled-wallpaper regression.

Named storefront neon is game-specific local art with independent randomized flicker.

Cassette Castle must remain visibly distinct from Video Planet. Video Planet is a rental/video store. Cassette Castle is an analog music shop with open sightlines, perimeter browsing racks, low center merchandising fixtures, and a dedicated listening bar.

---

## 14. Hiding / menus / death

Hiding cabinets are physical CC0 cabinet models with animated doors and camera movement into/out of the cabinet. Do not reduce hiding to teleport-only behavior.

Opening a modal/menu must pause gameplay, pause/silence appropriate audio, release pointer lock, and render above the cabinet peek mask.

Death displays:

**YOU'VE BEEN ATTENDED TO**

with the existing gore/death presentation and restart/quit flow.

---

## 15. Navigation baseline

Most recently recorded authored reachability baseline:

- Chapter 1: **1852 / 1852** walkable cells reachable
- Chapter 2: **1190 / 1190**
- Chapter 3: **1405 / 1405**

Chapter 1 store entrances, breakers A/B/C, Master Service Key, and elevator approach must remain reachable.

The elevator AI-only exclusion, fountain collision, and Cassette Castle fixture collision must stay separate from authored floor walkability.

---

## 16. Asset/licensing policy

Major documented sources include Kenney kits, Quaternius, KayKit Dungeon Remastered, Poly Haven, GGBotNet/OpenGameArt VHS, Reactorcore blood decals, and OpenGameArt audio/music. See `LICENSES.md` and `assets/audio/cc0/README.md` for exact provenance and normalization notes.

Cassette Castle v14 provenance is now explicitly documented in `LICENSES.md`, including Kenney Furniture Kit `bookcaseOpenLow.glb` and Kenney Space Kit `KSI_counter.glb`.

For third-party store props/models, preserve the project's CC0-only policy. If an attractive candidate is CC-BY or unclear, do not embed it. Either find a verified CC0 alternative or omit that category.

The store posters are original Pinewood canvas artwork and use no third-party marketing/movie/album artwork.

Keep provenance pinned/documented when adding assets.

---

### Local runtime assets — authoritative v15

`patches/local-assets-v15.js.txt` runs after Cassette Castle v14 and rewrites the final assembled runtime to repository-local vendored media. `assets/vendor/runtime/manifest.json` is the authoritative source-to-local map and includes SHA-256 provenance. The migration currently vendors **59 top-level runtime media assets plus 30 dependent GLTF/model files**.

Three.js **0.180.0** is served from `vendor/three/`; Pako **2.1.0** is served from `vendor/pako/`. The deployed import map and decompression fallback do not use unpkg or jsDelivr. Music that was formerly fetched from OpenGameArt is also served from the repository.

`scripts/audit-local-assets-v15.mjs` hash-verifies the vendored asset graph, verifies local Three.js/Pako files, reconstructs the complete runtime through v15, rejects surviving external media URLs, and syntax-checks the final localized module. A runtime change is not complete unless this audit passes.

The source/provenance URLs retained in `LICENSES.md`, the vendoring script, and the manifest are documentation/development-time inputs only. They are not runtime dependencies.

## 17. Development workflow

For every future Pinewood runtime change:

1. **Use the GitHub plugin first.**
2. Read `AGENTS.md` and this handoff.
3. Inspect current files and latest commits.
4. Preserve unrelated working systems.
5. Update/add a patch rather than mutating the encoded bundle directly.
6. Keep `game.js` patch order explicit.
7. Update/add focused audit coverage for changed guarded behavior.
8. Require the relevant runtime audits to pass.
9. Inspect relevant visual-regression artifacts when a visual system changes.
10. Verify the GitHub Pages build/deploy on the final head.
11. Do not perform manual interactive WASD playtests. Use automated runtime audits and deterministic visual regression instead.

Current CI coverage includes normalized CC0 audio, v11 footstep mix, zero oscillator/random-noise SFX synthesis, breaker lever animation, authoritative elevator state/collision rules, AI-only cab exclusion, key-gated elevator progression, exact-fit fountain invariants, Food Court v3, v10/v12 poster systems, and Cassette Castle v14's permanent tiny-shelf ban, open-floor fixture markers, geometry-grounded support logic, visual-only finish rule, localized ambience change, protected elevator/fountain invariants, and final JavaScript syntax.

---

## 18. Verified Local Assets v15 checkpoint

The remote-runtime reliability issue recorded in the former v14 checkpoint is **resolved by Local Assets v15**. The browser no longer depends on third-party hosts for runtime models, model sidecars, PBR textures, decals/images, sound effects, ambience, music, Three.js, or Pako.

### Authoritative v15 local-asset state

- `patches/local-assets-v15.js.txt` runs after Cassette Castle v14 and rewrites the assembled runtime to repository-local media.
- `assets/vendor/runtime/manifest.json` records the source/provenance mapping, local path, byte count, SHA-256 digest, and dependent model files.
- The migration contains **59 top-level runtime media assets plus 30 dependent GLTF/model files**.
- Three.js **0.180.0** and Pako **2.1.0** are served locally from `vendor/three/` and `vendor/pako/`.
- Three.js r180's internal `three.core.js` dependency is also vendored locally. Its exact Git blob SHA is `7dcd0fbcbc04b8d9a20ecb96c1ce344cb55150d5`.
- Poly Haven cassette-player sidecar textures and other GLTF dependencies are local, preserving the real cassette/tape component used by Cassette Castle v13/v14.
- The freight elevator's no-fake-visible-fallback rule, v8 fountain footprint, v11 footsteps, v12 posters, v13 geometry grounding/shelf ban, and authoritative v14 Cassette Castle layout remain protected.
- `scripts/audit-local-assets-v15.mjs` rejects surviving external runtime-media URLs, verifies local asset hashes, verifies the exact Three.js core dependency, reconstructs the complete runtime through v15, checks protected invariants, and syntax-checks the final module.

### Exact automated verification

The final local-assets runtime and permanent read-only browser-verification setup were verified across these commits:

- `64acc283da2c311dc1b866e540b331bec3c23e2b` — `Vendor Three.js r180 core dependency`
- `220a837afbb35519cbaf3f089bda38361af070be` — `Audit pinned Three.js core dependency`
- `a38afe5e918bdd22af526da6bfef3ce90f360189` — `Make local browser verification self-contained`
- `53d6cbe6a2aa2ec706fdcd790ae4e294b0fa1198` — `Remove one-shot Three.js vendor workflow`

Verification results:

- Runtime audit: **run 33442213807**, run #49, **success**
- Store visual regression: **run 33442231414**, run #12, **success**
- Visual artifact: **9776792785**, `pinewood-store-visuals`, 562,140 bytes, digest `sha256:9301188f822177033ff5d7102d53e97fe5bf74e497cd65954c38eeab4a73d6a5`
- GitHub Pages after the permanent workflow cleanup: **run 33442241162**, run #176, **success**

The run #12 artifact's `report.json` reports `failed: false`, all three deterministic Cassette Castle views are `ok: true`, and no page errors or runtime `assetFailures` were reported. `cassette-front.png`, `cassette-center.png`, and `cassette-listening.png` were downloaded and visually inspected; the authoritative v14 open-floor store, low center fixtures, perimeter racks, checkout, three-module listening bar, stools, and warm localized lighting remain present after localization.

### Residual non-network warnings

The deterministic software-WebGL harness still emits two local-model warnings that are **not external fetch failures**: the Kenney fountain model can hit its model-load timeout and retain the already-approved v8 modeled fallback, and the elevator floor GLB reports degenerate/invalid bounds while the protected elevator state/collision rules remain intact. These should be treated as separate model/runtime-hardening work if revisited; they do not reintroduce remote dependencies.

**Permanent playtest rule:** Do not perform manual interactive WASD playtests for Pinewood. Automated runtime audits and deterministic visual-regression captures are the required verification methods unless the user explicitly changes this rule.

---

## 19. Fresh-session restart prompt

> Continue development of The Attendant: Pinewood Mall. **Use the GitHub plugin first for all repository work.** Use `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `AGENTS.md` and `DEVELOPMENT_HANDOFF.md` first, inspect the latest commits and relevant current files, preserve all documented no-regression constraints, implement directly in the repo, run the relevant runtime audits, inspect visual artifacts for visual changes, and verify GitHub Pages after game changes. Local Assets v15 is authoritative: **never use remote runtime assets or CDN browser libraries; always verify, vendor, document, and serve third-party runtime dependencies locally from this repository.** Cassette Castle v14 remains authoritative, while v13's permanent Quaternius Shelf Large/Shelf Small ban and geometry-grounding rules remain mandatory. The old stale/timing-out remote dependency issue from v14 has been resolved; do not reintroduce those URLs. Do not perform a manual interactive WASD playtest; rely on automated audits and deterministic visual-regression captures.
