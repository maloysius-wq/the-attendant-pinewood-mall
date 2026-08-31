# Development Handoff — The Attendant: Pinewood Mall

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
16. `patches/cassette-castle-rebuild-v13.js.txt` (**final authoritative Cassette Castle override**)

Patch order is intentional. Poster v10 runs after the Food Court replacement, v12 diversifies the final store posters, and v13 runs last so its corrected Cassette Castle geometry/grounding cannot be overwritten by an older store builder.

`.github/workflows/runtime-audit.yml` runs:

- `scripts/audit-runtime.mjs`
- `scripts/audit-footstep-mix-v11.mjs`
- `scripts/audit-poster-diversity-v12.mjs`
- `scripts/audit-cassette-castle-v13.mjs`

The v13 audit reconstructs the entire deployed patch chain through v13 and syntax-checks the final runtime.

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

- WASD — move
- Mouse — look
- Shift — sprint
- C — hold breath / move quietly
- E — interact
- F — flashlight
- Q — throw decoy
- J — journal
- Esc — pause

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

### Footsteps — authoritative v11 mix

Current footstep mix:

- normal dry gain approximately **`.09`**,
- sprint dry gain approximately **`.14`**,
- quiet/held-breath movement further attenuates the cue,
- two low-level delayed copies at roughly **110 ms** and **230 ms** preserve the subtle empty-mall slapback/echo at the same proportional mix.

These values are intentionally about 50% of the previous `.18/.28` base gains. Do not restore the louder values unless explicitly requested.

### Mall music

The CC0 mall loop remains intentionally degraded: roughly half-speed playback, pitch preservation disabled, delayed copies for hollow slapback, and occasional playback-rate drift. Threat music fades in with The Attendant's route-distance proximity while the mall loop recedes.

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

## 8. Freight elevator — authoritative implementation

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

## 9. Central fountain — authoritative implementation

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

## 10. Cassette Castle — authoritative v13 rebuild

`patches/cassette-castle-rebuild-v13.js.txt` is the **final authoritative Cassette Castle geometry, merchandising, and grounding implementation**. It runs after v12. The earlier v9 patch is transitional history only and must not be treated as the final store design.

### Why v13 exists

A full visual audit of v9 found two concrete problems:

1. Quaternius `Shelf Large.glb` / `Shelf Small.glb` had been normalized to undersized, toy-like fixture heights.
2. Merchandise, listening hardware, loose tapes, and checkout props used guessed absolute world-Y values instead of being anchored to actual support geometry, causing obvious floating/clipping.

v13 replaces both systems rather than tuning the old numbers.

### Permanent shelf ban

The following resources are **permanently banned from all Pinewood runtime use**:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- any URL/alias containing `Shelf%20Large.glb`, `Shelf%20Small.glb`, `/ShelfLarge/`, or `/ShelfSmall/`

v13 removes the v9 keys and scrubs historical aliases/URLs from the final assembled source. `AGENTS.md` repeats this prohibition. Do not rename, re-add, or “try again” with these resources for any reason.

### v13 fixtures and scale

Cassette Castle now uses the verified CC0 Kenney Furniture Kit `bookcaseOpen.glb` as its empty browsing fixture:

- perimeter racks target **2.08 m** measured height,
- center browsing runs use two back-to-back empty racks at **1.78 m** measured height,
- center depth/offset is derived from the imported fixture's bounding box rather than guessed dimensions.

The layout includes:

- four full-size racks along the left wall,
- six full-size racks along the rear wall,
- two substantial center browsing runs assembled from six double-sided rack bays,
- three listening stations along the right side,
- grounded checkout counter/register near the entrance side,
- physical hiding cabinet preserved at the back-right.

### Geometry-grounding rule

Cassette Castle v13 does **not** place visible fixtures/merchandise by guessed Y coordinates.

The final helpers use `THREE.Box3` model bounds to:

- scale imported furniture to human-scale target height,
- ground floor fixtures/stools/tables/counter to the floor,
- discover usable shelf support levels from actual fixture meshes,
- anchor cassette stock to those support surfaces,
- measure table/counter tops before placing cassette players, loose tapes, or the cash register.

Key final helpers:

- `cassetteWorldBox(...)`
- `cassetteScaleToHeight(...)`
- `placeCassetteGrounded(...)`
- `placeCassetteOnSurface(...)`
- `cassetteShelfLevels(...)`
- `stockCassetteFixture(...)`
- `addCassetteFullRack(...)`
- `addCassetteDoubleRackBay(...)`
- `dressGroundedListeningStation(...)`
- `buildGroundedCheckout(...)`

If the real Poly Haven cassette/tape component is unavailable, those positions remain empty. If a required CC0 model fails or has invalid bounds, the object is omitted. Do not add visible primitive/fake replacements or leave unsupported props floating.

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
- absolute hard-coded world-Y placement for shelf/table/counter objects.

Listening furniture remains Quaternius `Table Round Small.glb` / `Stool.glb`; listening hardware and cassette stock remain the CC0 Poly Haven Cassette Player and its extracted real tape component.

Vinyl-record props remain omitted because previously identified candidates were not all CC0. Do not slip CC-BY record/turntable assets into the project to fill the category.

---

## 11. Store poster marketing — v10 + v12

`patches/poster-polish-v10.js.txt` establishes the Chapter 1 store poster campaigns. `patches/poster-diversity-v12.js.txt` is the final poster-layout authority.

The old `makePoster(...)` renderer is retired.

Each store keeps one v10 hero design and uses two visually distinct v12 alternates, including different illustration/layout systems and different physical frame treatments.

### Sunburst Arcade

Campaigns:

- **GALAXY STRIKE** — retained v10 neon-grid hero
- **TOKEN FRENZY** — v12 radial token-promotion design
- **PRIZE VAULT** — v12 ticket-redemption/prize-catalog design

### Video Planet

Campaigns:

- **BE KIND • REWIND** — retained v10 rental-store hero
- **MIDNIGHT RENTALS** — v12 horror-night one-sheet design
- **2 NIGHTS • 1 PRICE** — v12 membership/rental-coupon design

Do not replace these with copyrighted real movie posters.

### Pinewood Food Court

Campaigns:

- **SLICE CITY** — retained v10 food-promo hero
- **POLAR POP** — v12 soda/refill advertisement
- **WOK THIS WAY** — v12 illustrated takeout/noodle/combo design

### Cassette Castle

Campaigns:

- **NEW WAVE** — retained v10 music-zine hero
- **LISTEN BEFORE YOU BUY** — v12 listening/headphones/audio-waveform design
- **PINEWOOD TOP 40** — v12 ranked chart-board design

Do not collapse the posters back into one shared composition with swapped text/colors.

---

## 12. Chapter/story arc

### Chapter 1 — Closing Time
Restore A/B/C, find the Master Service Key, use the freight elevator, and discover that it descends instead of escaping.

### Chapter 2 — Service Level
Find the security keycard, restore D/E, and reach the north stairwell. The work order is revealed to have been filed in 1997.

### Chapter 3 — The Last Shift
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

Cassette Castle must remain visibly distinct from Video Planet: Video Planet is a rental/video store; Cassette Castle is an analog music shop with full-size browsing racks and grounded listening stations.

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
9. Verify the GitHub Pages build/deploy on the final head.
10. Be explicit if interactive visual playtesting could not be performed.

Current CI coverage includes the normalized CC0 audio bank, v11 footstep mix, zero oscillator/random-noise SFX synthesis, breaker lever animation, authoritative elevator model/state/collision, AI-only cab exclusion, key-gated elevator progression, exact-fit CC0/PBR fountain and retirement of its old square collider, Food Court v3, v10/v12 poster systems, and Cassette Castle v13's permanent tiny-shelf ban, human-scale fixture markers, geometry-grounded support logic, retirement of v9 floating-placement helpers, and final JavaScript syntax.

---

## 18. Fresh-session restart prompt

> Continue development of The Attendant: Pinewood Mall. **Use the GitHub plugin first for all repository work.** Use `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `AGENTS.md` and `DEVELOPMENT_HANDOFF.md` first, inspect the latest commits and relevant current files, preserve all documented no-regression constraints, implement directly in the repo, run the relevant runtime audits, and verify GitHub Pages after game changes. Never reintroduce the permanently banned Quaternius Shelf Large/Shelf Small resources.
