# Development Handoff — The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Rule:** Read this file first, then inspect the latest commits and current repository files. The repository and the user's newest explicit request always override older chat history.

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
11. `patches/cassette-castle-rebuild-v9.js.txt`
12. Food Court builder replacement from `patches/foodcourt-v3.js.txt`

Patch order is intentional. Later patches depend on earlier markers.

`scripts/audit-runtime.mjs` reconstructs the same deployed patch chain, validates critical behavior markers, checks the local CC0 audio bank, and syntax-checks both the loader and final runtime. `.github/workflows/runtime-audit.yml` runs it automatically on relevant changes.

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

### Footsteps

Current footstep mix:

- normal dry gain approximately `.18`,
- sprint dry gain approximately `.28`,
- quiet/held-breath movement further attenuates the cue,
- two low-level delayed copies at roughly **110 ms** and **230 ms** create a subtle empty-mall slapback/echo.

Do not turn the echo into a large cavern reverb unless explicitly requested.

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

## 10. Cassette Castle — authoritative v9 rebuild

`patches/cassette-castle-rebuild-v9.js.txt` is now the authoritative Cassette Castle implementation.

### Retired implementation

The old store mixed a Kenney Mini Market shelf that already contained baked-in retail stock with a second generated cassette-stock layer. It also had:

- `fallbackCassette(...)` generated cassette bodies/reels,
- generated cassette fallback stock when the real tape component was unavailable,
- procedural glowing `TorusGeometry` listening-station rings,
- primitive shelf/table/box fallbacks through the general `placeModel(...)` helper.

**Do not restore any of those in Cassette Castle.**

### v9 asset rule

All visible Cassette Castle merchandising fixtures, listening furniture, listening hardware and cassette stock are actual imported CC0 models/components.

Current sources:

- **Kenney Furniture Kit `bookcaseOpen.glb`** — empty full-height wall browsing racks.
- **Quaternius `Shelf Large.glb` / `Shelf Small.glb`** — empty freestanding retail displays.
- **Quaternius `Table Round Small.glb` / `Stool.glb`** — listening-station furniture.
- **Poly Haven Cassette Player** — actual listening hardware.
- **Poly Haven cassette/tape component extracted from that model** — actual cloned cassette retail stock and loose listening media.

Cassette Castle uses its own `placeCassetteCc0(...)` helper. If a required remote CC0 model fails, the object is **skipped**. It is not replaced by generated boxes, tables, shelves or fake products.

If the Poly Haven tape component cannot be extracted, those shelf positions remain honestly empty. There is no procedural cassette fallback.

### v9 layout

The store is intentionally laid out as a music/cassette shop rather than a reskinned Video Planet:

- open storefront sightline and central circulation,
- imported full-height browsing racks along the left/rear perimeter,
- multiple imported freestanding cassette display fixtures through the middle,
- three actual listening stations on the right side with tables, cassette players and stools,
- CC0 checkout counter/register area,
- physical hiding cabinet moved into the back-right corner away from the listening aisle,
- authored `NEW WAVE`, `LISTEN BEFORE YOU BUY`, and `TOP 40` store graphics for identity.

Vinyl-record props were intentionally not added in v9 because candidate assets found during research were not all CC0. Do not slip CC-BY record/turntable assets into this project just to fill the category.

The current runtime audit explicitly fails if the old `marketShelfEnd` Cassette Castle builder usage, `fallbackCassette`, old cassette-stock helper, procedural listening torus, or primitive Cassette Castle fallbacks return.

---

## 11. Chapter/story arc

### Chapter 1 — Closing Time
Restore A/B/C, find the Master Service Key, use the freight elevator, and discover that it descends instead of escaping.

### Chapter 2 — Service Level
Find the security keycard, restore D/E, and reach the north stairwell. The work order is revealed to have been filed in 1997.

### Chapter 3 — The Last Shift
Recover the Last Shift material and end Pinewood's closing/accountability routine from PA control. Do not reduce the ending to simply cutting power.

There are nine numbered Last Shift logs, `LS-01` through `LS-09`. Recovering all nine changes the ending.

---

## 12. Chapter 1 stores

The four authored walkable storefronts are:

- Sunburst Arcade
- Video Planet
- Pinewood Food Court
- Cassette Castle

Preserve their distinct visual identities and keep entrances/navigation clear.

Food Court v3 specifically uses clamped wall imagery (`THREE.ClampToEdgeWrapping`, repeat `(1,1)`) to prevent the old tiled-wallpaper regression.

Named storefront neon is game-specific local art with independent randomized flicker.

Cassette Castle v9 should remain visibly distinct from Video Planet: Video Planet is a rental/video store; Cassette Castle is an analog music shop with cassette browsing and listening stations.

---

## 13. Hiding / menus / death

Hiding cabinets are physical CC0 cabinet models with animated doors and camera movement into/out of the cabinet. Do not reduce hiding to teleport-only behavior.

Opening a modal/menu must pause gameplay, pause/silence appropriate audio, release pointer lock, and render above the cabinet peek mask.

Death displays:

**YOU'VE BEEN ATTENDED TO**

with the existing gore/death presentation and restart/quit flow.

---

## 14. Navigation baseline

Most recently recorded authored reachability baseline:

- Chapter 1: **1852 / 1852** walkable cells reachable
- Chapter 2: **1190 / 1190**
- Chapter 3: **1405 / 1405**

Chapter 1 store entrances, breakers A/B/C, Master Service Key, and elevator approach must remain reachable.

The elevator AI-only exclusion, fountain collision, and Cassette Castle fixture collision must stay separate from authored floor walkability.

---

## 15. Asset/licensing policy

Major documented sources include Kenney kits, Quaternius, KayKit Dungeon Remastered, Poly Haven, GGBotNet/OpenGameArt VHS, Reactorcore blood decals, and OpenGameArt audio/music. See `LICENSES.md` and `assets/audio/cc0/README.md` for exact provenance and normalization notes.

For third-party store props/models, preserve the project's CC0-only policy. If an attractive candidate is CC-BY or unclear, do not embed it. Either find a verified CC0 alternative or omit that category.

Keep provenance pinned/documented when adding assets.

---

## 16. Development workflow

For every future runtime change:

1. inspect current files and latest commits,
2. preserve unrelated working systems,
3. update/add a patch rather than mutating the encoded bundle directly,
4. keep `game.js` patch order explicit,
5. update `scripts/audit-runtime.mjs` when adding or changing guarded behavior,
6. require the runtime audit to pass,
7. verify the GitHub Pages build/deploy,
8. be explicit if interactive visual playtesting could not be performed.

The current runtime audit guards the normalized CC0 audio bank, zero oscillator/random-noise SFX synthesis, breaker lever animation, authoritative elevator model/state/collision, AI-only cab exclusion, key-gated elevator progression, exact-fit CC0/PBR fountain and retirement of its old square collider, Cassette Castle v9's CC0-only fixtures/stock/listening layout and retirement of its procedural/baked-stock implementation, Food Court v3, and warped mall music.

---

## 17. Fresh-session restart prompt

> Continue development of The Attendant: Pinewood Mall. Use `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `DEVELOPMENT_HANDOFF.md` first, inspect the latest commits and relevant current files, preserve the documented no-regression constraints, implement directly in the repo, run the runtime audit, and verify GitHub Pages after game changes.
