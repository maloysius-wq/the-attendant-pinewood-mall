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
10. Food Court builder replacement from `patches/foodcourt-v3.js.txt`

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

The collision system now supports **navigation-only blockers** via `physicalBlock:false`. This exists specifically so spaces such as the freight elevator cab can remain physically enterable by the player while being excluded from The Attendant's A* navigation.

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

The freight elevator cab is now an AI-excluded end-of-chapter space. The Attendant cannot path into the cab, and a small cab safety check prevents contact-death edge cases during the active elevator sequence.

---

## 6. Audio

The old generated Web Audio SFX engine is retired. Non-music SFX use locally vendored CC0 recordings in `assets/audio/cc0/`.

The audio bank includes footsteps, breaker operation, doors/shutters/latches, impacts, pickups, interface/error cues, heartbeat, breath/whisper cues, radio static, electrical room tone, horror ambience, intercom bell, gore impact, and death scream.

All vendored files are normalized with FFmpeg EBU R128 processing to approximately:

- **-20 LUFS integrated**
- **-2 dBTP true peak**
- **7 LU target LRA**
- stereo 44.1 kHz Vorbis OGG

Runtime gains still preserve hierarchy.

### Footsteps

Current footstep mix intentionally sits slightly below the previous pass:

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

## 8. Freight elevator — authoritative current implementation

`patches/elevator-rebuild-v7.js.txt` is the authoritative Chapter 1 freight-elevator implementation.

### Important historical bug now retired

The old Chapter 1 scene placed a **procedurally generated `East Service Shutter` directly in front of the actual freight elevator**. Later patches separately changed elevator visuals, collision, and state behavior. This caused the visible door and collision to disagree: the shutter could appear closed while the player could pass through it, and the actual cab entry remained partially blocked.

**That procedural East Service Shutter is now completely removed from Chapter 1. Do not reintroduce it.**

### Current physical elevator

Visible architecture is assembled from verified Kenney CC0 GLB content:

- imported doorway/frame,
- two imported sliding door leaves,
- imported floor and ceiling,
- imported side/back wall pieces,
- imported external call control,
- decorative interior control.

There is only one authoritative set of elevator doors.

Physical collision consists of:

- left/right cab walls,
- back cab wall,
- one threshold/door blocker synchronized to visible door openness.

The threshold blocker remains solid until the visible leaves are essentially fully open, preventing the old ghost-through-door behavior.

### Master Service Key

The Master Service Key no longer opens a separate procedural service shutter. It now operates the **elevator's own service lock**.

After A/B/C are restored:

- if the player lacks the key, the objective becomes **Find the Master Service Key**,
- with the key, the elevator can be unlocked/called,
- using the service lock consumes the key and permanently unlocks that elevator for the chapter.

### Elevator sequence

Required Chapter 1 sequence:

1. restore A/B/C,
2. acquire Master Service Key,
3. interact with the freight elevator,
4. service lock accepts the key,
5. imported door leaves visibly slide open,
6. collision remains closed until the leaves are effectively fully open,
7. doors remain open indefinitely while waiting,
8. player physically walks into the cab,
9. entry is detected only once the player is fully inside,
10. doors close,
11. manual movement is blocked during closing/ride,
12. player is gently centered in the car,
13. car vibration/light movement sells the ride,
14. Chapter 1 transitions only after the ride.

There is **no timer that closes the doors while the player is still outside**.

### Attendant protection around boarding

The elevator sequence now adds multiple safeguards:

- a navigation-only exclusion volume prevents The Attendant from entering the cab,
- opening the powered elevator briefly stuns The Attendant,
- the open/waiting state extends that boarding grace,
- entering the cab extends it again through closing,
- an active-cab safety region prevents a contact-death edge case if geometry/AI positions briefly overlap near the threshold.

The elevator should be tense to reach, but successfully entering it should reliably end the chase rather than allow the player to be attended inside the car.

---

## 9. Chapter/story arc

### Chapter 1 — Closing Time

Restore A/B/C, find the Master Service Key, use the freight elevator, and discover that it descends instead of escaping.

### Chapter 2 — Service Level

Find the security keycard, restore D/E, and reach the north stairwell. The work order is revealed to have been filed in 1997.

### Chapter 3 — The Last Shift

Recover the Last Shift material and end Pinewood's closing/accountability routine from PA control. Do not reduce the ending to simply cutting power.

There are nine numbered Last Shift logs, `LS-01` through `LS-09`. Recovering all nine changes the ending.

---

## 10. Chapter 1 stores

The four authored walkable storefronts are:

- Sunburst Arcade
- Video Planet
- Pinewood Food Court
- Cassette Castle

Preserve their distinct visual identities and keep entrances/navigation clear.

Food Court v3 specifically uses clamped wall imagery (`THREE.ClampToEdgeWrapping`, repeat `(1,1)`) to prevent the old tiled-wallpaper regression.

Named storefront neon is game-specific local art with independent randomized flicker.

---

## 11. Hiding / menus / death

Hiding cabinets are physical CC0 cabinet models with animated doors and camera movement into/out of the cabinet. Do not reduce hiding to teleport-only behavior.

Opening a modal/menu must pause gameplay, pause/silence appropriate audio, release pointer lock, and render above the cabinet peek mask.

Death still displays:

**YOU'VE BEEN ATTENDED TO**

with the existing gore/death presentation and restart/quit flow.

---

## 12. Navigation baseline

Most recently recorded authored reachability baseline:

- Chapter 1: **1852 / 1852** walkable cells reachable
- Chapter 2: **1190 / 1190**
- Chapter 3: **1405 / 1405**

Chapter 1 store entrances, breakers A/B/C, Master Service Key, and elevator approach must remain reachable.

The elevator's AI-only exclusion is deliberately separate from player walkability and should not mutate the authored floorplan.

---

## 13. Asset/licensing policy

Major documented sources include Kenney kits, KayKit Dungeon Remastered, Poly Haven, GGBotNet/OpenGameArt VHS, Reactorcore blood decals, and OpenGameArt audio/music. See `LICENSES.md` and `assets/audio/cc0/README.md` for exact provenance and normalization notes.

Keep provenance pinned/documented when adding assets.

---

## 14. Development workflow

For every future runtime change:

1. inspect current files and latest commits,
2. preserve unrelated working systems,
3. update/add a patch rather than mutating the encoded bundle directly,
4. keep `game.js` patch order explicit,
5. update `scripts/audit-runtime.mjs` when adding or changing guarded behavior,
6. require the runtime audit to pass,
7. verify the GitHub Pages build/deploy,
8. be explicit if interactive visual playtesting could not be performed.

The current runtime audit specifically guards the recorded normalized CC0 audio bank, zero oscillator/random-noise SFX synthesis, breaker lever animation, authoritative elevator model/state/collision, AI-only cab exclusion, key-gated elevator progression, Food Court v3, and warped mall music.

---

## 15. Fresh-session restart prompt

> Continue development of The Attendant: Pinewood Mall. Use `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `DEVELOPMENT_HANDOFF.md` first, inspect the latest commits and relevant current files, preserve the documented no-regression constraints, implement directly in the repo, run the runtime audit, and verify GitHub Pages after game changes.
