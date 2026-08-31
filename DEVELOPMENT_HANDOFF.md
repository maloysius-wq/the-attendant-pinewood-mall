# Development Handoff: The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** **Always use the connected GitHub plugin/connector first for Pinewood repository work. Never claim access is unavailable before checking the GitHub plugin.**  
**Source-of-truth rule:** Read `AGENTS.md` and this file first, then inspect the latest commits/current repository files. The repository and the user's newest explicit request override older chat history.

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

Patch order is intentional. Poster v10 runs after the Food Court replacement, v12 diversifies the final store posters, v13 establishes the permanent geometry-grounding and banned-shelf foundation, and v14 runs last to replace the v13 store layout with the final open-floor design while preserving those grounding rules.

`.github/workflows/runtime-audit.yml` runs:

- `scripts/audit-runtime.mjs`
- `scripts/audit-footstep-mix-v11.mjs`
- `scripts/audit-poster-diversity-v12.mjs`
- `scripts/audit-cassette-castle-v13.mjs`
- `scripts/audit-cassette-castle-v14.mjs`

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
11. Be explicit if interactive visual playtesting could not be performed.

Current CI coverage includes normalized CC0 audio, v11 footstep mix, zero oscillator/random-noise SFX synthesis, breaker lever animation, authoritative elevator state/collision rules, AI-only cab exclusion, key-gated elevator progression, exact-fit fountain invariants, Food Court v3, v10/v12 poster systems, and Cassette Castle v14's permanent tiny-shelf ban, open-floor fixture markers, geometry-grounded support logic, visual-only finish rule, localized ambience change, protected elevator/fountain invariants, and final JavaScript syntax.

---

## 18. Verified v14 checkpoint and known follow-up

The last runtime-changing commit before the documentation-only bookkeeping commits is:

`09806df21c0763e76b75e4ee186d3143ddd145d6`  
**Commit:** `Refine v14 listening bar and store lighting`

Exact automated verification for that revision:

- Runtime audit: **run 33434375417**, run #45, **success**
- Store visual regression: **run 33434375284**, run #6, **success**
- GitHub Pages build/deployment: **run 33434360381**, run #140, **success**
- Visual artifact: **9773941583**, `pinewood-store-visuals`, digest `sha256:275db03fe22cbcc241c1206763983e73c73d2ab19420599abc5c4ec14d9ecda2`

The final artifact's `cassette-front.png`, `cassette-center.png`, and `cassette-listening.png` were downloaded and visually inspected. They confirm the v14 open center, low fixtures, three-module listening bar, checkout counter, and localized warmer lighting are present.

### Important known reliability issue discovered during that visual inspection

The visual workflow itself passed, but its report exposed pre-existing remote-asset failures that are outside the v14 layout assertion. Do **not** interpret the green visual check as proof that every remote asset URL is healthy.

The artifact reported 404s for several pinned `Enthceph/hangman` remote GLBs, including:

- `pickupJournal` / `book.glb`
- `pickupNote` / `banner.glb`
- `breakerCabinet` / `machine-window.glb`
- `elevatorFrame` / `wall-doorway-wide.glb`
- `elevatorDoorHalf` / `door-wide-half.glb`
- `elevatorFloor` / `floor.glb`
- `elevatorWall` / `structure-wall.glb`
- `elevatorButton` / `button-floor-square-small.glb`

The same capture also showed intermittent timeouts for `cassetteShelfWall` and the Kenney fountain, plus failed Poly Haven cassette-player texture requests. The runtime's fallback/omit behavior allowed the visual workflow to complete, but these remote dependencies need a dedicated reliability repair pass. Prefer vendored or verified pinned replacements rather than weakening the no-fake-visual rules for the elevator/Cassette Castle.

**No manual interactive WASD playtest has been performed for v14.** Automated runtime and visual checks are not a substitute for a full human playthrough.

---

## 19. Fresh-session restart prompt

> Continue development of The Attendant: Pinewood Mall. **Use the GitHub plugin first for all repository work.** Use `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `AGENTS.md` and `DEVELOPMENT_HANDOFF.md` first, inspect the latest commits and relevant current files, preserve all documented no-regression constraints, implement directly in the repo, run the relevant runtime audits, inspect visual artifacts for visual changes, and verify GitHub Pages after game changes. Cassette Castle v14 is authoritative, while v13's permanent shelf ban and geometry-grounding rules remain mandatory. Never reintroduce the permanently banned Quaternius Shelf Large/Shelf Small resources. The next known reliability target is the set of stale/timing-out remote CC0 asset dependencies recorded in Section 18.
