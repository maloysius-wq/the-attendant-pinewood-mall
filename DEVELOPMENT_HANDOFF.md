# Development Handoff — The Attendant: Pinewood Mall

**Purpose:** This is the compact source of truth for continuing development in a fresh ChatGPT/Codex session. Read this file first, then inspect the current repository files relevant to the requested change. **The repository itself and newer explicit user requests always win if anything here becomes stale.**

**Project:** The Attendant: Pinewood Mall — Rebuilt Edition  
**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from `main` / repository root  
**Current runtime architecture:** immutable encoded base runtime + ordered authored patch chain in `game.js`

---

## 1. Creative direction

The Attendant is a first-person browser horror game set in a decaying 1990s shopping mall. Pinewood should feel oppressive, lonely, physically believable, and increasingly impossible: stained tile, dead storefronts, buzzing lights, damaged walls, old signage, service corridors, obsolete retail technology, distant PA audio, and architecture that slowly stops behaving normally.

The player is not an action hero. The core loop is exploration, maintenance-style objectives, environmental/story discovery, sound and stamina management, hiding, distracting The Attendant, and surviving long enough to complete the mall's closing routine.

Visual changes should preserve believable placement and scale. Wall objects must read as wall-mounted. Floor props must sit on the floor. Major furniture should have appropriate collision. Avoid floating objects, clipped signs, toy-scale furniture, or decorative geometry that blocks required routes.

Use verified **CC0 assets** for suitable third-party visual/audio content. Prefer pinned runtime sources and keep gameplay-safe fallbacks where the current implementation intentionally provides them. `LICENSES.md` is the root provenance record.

---

## 2. Architecture — do not regress this

The retired `Game2.html` prototype let maze carving, store geometry, collision, and AI navigation mutate the same grid. The rebuild intentionally separates:

1. **Authored walkable floorplan** — corridors and rooms exist before meshes are generated.
2. **Visual geometry** — walls, floors, storefronts, trim, and décor are built from the authored plan.
3. **Prop collision** — furniture, cabinets, counters, shelves, elevator pieces, etc. use independent collider data.
4. **AI navigation** — A* uses the walkability plan plus appropriate blocking props/doors.
5. **Story/game state** — objectives, save data, audio, progression, inventory, menus, hiding, and ending state are independent of map construction.

Do not return to runtime store carving or make decorative geometry mutate the fundamental floorplan.

### Current deployment loader

`game.js` is the deployment loader. It reconstructs the encoded runtime from `bundle2/`, normalizes Three.js helper imports, then applies patches in this order:

1. `patches/worldprops-v1.js.txt`
2. `patches/industrial-cc0-v1.js.txt`
3. `patches/visual-fixes-v1.js.txt`
4. `patches/store-polish-v2.js.txt`
5. `patches/systems-polish-v3.js.txt`
6. `patches/reliability-v4.js.txt`
7. `patches/status-lights-v5.js.txt`
8. `patches/audio-immersion-v6.js.txt`
9. replace the Food Court builder with `patches/foodcourt-v3.js.txt`

**Patch order is intentional.** Later patches depend on markers produced by earlier patches. Do not casually reorder them.

`foodcourt-v2.js.txt` is retained only as historical source and is not the active Food Court.

`runtime-audit.js` is a decoded audit/reference copy of the old base runtime, not the direct deployed source of truth. Trace `game.js` for actual deployment behavior.

### Automated runtime regression audit

`scripts/audit-runtime.mjs` reconstructs the same patch chain used by the browser, verifies critical markers, and syntax-checks both `game.js` and the final patched runtime. `.github/workflows/runtime-audit.yml` runs this audit on relevant pushes and pull requests.

The audit currently guards, among other things:

- patch order,
- CC0 breaker/elevator model wiring,
- physical elevator entry and collision state,
- breaker/elevator status-light behavior,
- breaker lever OFF→ON animation wiring,
- the complete local normalized CC0 SFX bank,
- absence of Web Audio oscillator/generated-random-noise SFX synthesis,
- Food Court v3 edge-clamped wallpaper,
- current warped mall-music implementation,
- final JavaScript syntax.

Keep this audit current whenever another patch is added or a guarded system is intentionally changed.

---

## 3. Controls

- **WASD** — move
- **Mouse** — look
- **Shift** — sprint
- **C** — hold breath / quieter movement
- **E** — interact
- **F** — flashlight
- **Q** — throw decoy
- **J** — journal
- **Esc** — pause

---

## 4. The Attendant and stealth

The Attendant is an original creature, not an imported or licensed horror character.

Current identity:

- all-black articulated humanoid silhouette,
- animated arms/legs and gait,
- fuzzy/blurry edge treatment,
- glitch particles/afterimages,
- white emissive eyes.

Core AI states include dormant, stalk, investigate, hunt, search, and stunned.

Important no-regression behavior:

- physical contact kills the player unless safely hidden,
- decoys can divert/investigate and temporarily stun/distract,
- sprinting is faster and louder and drains stamina,
- holding **C** makes movement quieter/slower and consumes breath,
- danger/hearing presentation uses **route/path distance**, not straight-line distance through walls,
- walls must genuinely protect the player from impossible through-wall proximity sensing.

Atmosphere currently includes recorded heartbeat escalation, flashlight instability near danger, recorded directional breath/whisper cues, recorded electrical room tone/static/horror ambience, PA/radio elements, threat music, and degraded mall music.

### Current mall music treatment

The CC0 mall loop is intentionally played at roughly half speed with pitch preservation disabled. Two delayed copies create a hollow slapback/echo impression, and occasional playback-rate drift simulates damaged cassette/mall playback equipment. The threat layer still fades in with The Attendant's route-distance proximity while the mall loop recedes.

### Current non-music audio treatment

The old synthesized Web Audio SFX engine has been retired. The current build uses locally vendored CC0 recordings for footsteps, breaker operation, doors/latches/shutters, impacts, pickups, error/toggle cues, heartbeat, gasping/whispers, radio static, electrical ambience, danger ambience, intercom bell, and death/gore layers.

All files under `assets/audio/cc0/` are normalized during vendoring with FFmpeg EBU R128 processing to **-20 LUFS integrated**, **-2 dBTP true peak**, and **7 LU target LRA**, then stored as stereo 44.1 kHz Vorbis OGG. Runtime event gains still preserve intentional hierarchy, such as quiet footsteps versus a heavy shutter or death impact.

The final runtime intentionally contains **no `createOscillator()` procedural SFX path and no generated random-noise buffer fallback**. If a local recording cannot decode, that individual cue is skipped rather than synthesized.

---

## 5. Hiding, menus, and death

### Cabinets

Hiding cabinets are physical interactable objects using a CC0 Kenney Furniture Kit cabinet with separate animated door nodes. Desired sequence:

1. interact,
2. doors open,
3. camera/player moves inside,
4. doors close,
5. narrow peek aperture remains,
6. player can emerge later.

Do not replace this with teleport-only or menu-only hiding.

### Menus

Opening a modal/menu must:

- pause gameplay simulation,
- silence/pause audio as appropriate,
- release pointer lock,
- render above the cabinet peek mask.

### Death

Contact with The Attendant kills outside a valid hiding state. The sequence includes a gore burst and the white message:

**YOU’VE BEEN ATTENDED TO**

The player can restart the chapter or quit.

---

## 6. Story and chapter arc

The rebuilt story preserves three voices/concepts:

- **Dispatcher**
- **Intercom**
- **Previous Contractor / Last Shift**

### Chapter 1 — Closing Time

A routine maintenance/work order should not exist. The player restores three circuits/breakers (**A / B / C**), deals with the Master Service Key/gated service access, encounters the four major storefronts and The Attendant, then reaches the freight elevator.

### Chapter 2 — Service Level

The elevator goes deeper instead of up. The player finds a security keycard, restores relays **D / E**, and reaches the north stairwell. The work order is revealed to have been filed in **1997**, undermining confidence in the Dispatcher voice.

### Chapter 3 — The Last Shift

The archive/east-wing endgame reveals Pinewood is trapped in a nightly closing/accountability routine. The objective is to **end the shift**, not merely cut power. The player recovers Last Shift material and operates the PA/attendance system.

### Ending logic

There are nine numbered Last Shift logs in the larger story set: `LS-01` through `LS-09`.

Recovering all nine changes the ending. The stronger ending clocks everyone out, extinguishes The Attendant's white eyes, lets the player leave at dawn, and causes the impossible work order to vanish. Without all nine, remnants remain and the routine is not fully laid to rest.

Do not flatten the mythology into “turn off generator and escape.” The work-order/closing-routine story is central.

---

## 7. Chapter 1 stores and visual identity

The four authored storefronts are:

- **Sunburst Arcade**
- **Video Planet**
- **Pinewood Food Court**
- **Cassette Castle**

Stores are walkable rooms, not portals or facades. Keep entrances clear and preserve navigation.

### Sunburst Arcade

Preserve staggered arcade clusters, human-scale CC0 cabinets, air hockey, basketball, claw machine, prize counter/wall, neon, and colored accents.

### Video Planet

Preserve these hard-earned requirements:

- real shelving rather than giant VHS-shaped shelf blocks,
- separately placed VHS cases/tapes,
- varied case colors/designs,
- conventional checkout counter,
- correctly oriented registers,
- human-scale furniture,
- verified CC0 GGBotNet/OpenGameArt VHS GLB with procedural fallback.

### Pinewood Food Court

The active implementation is **Food Court v3**. Preserve:

- round table/chair appearance,
- seating roughly two rows deep by three islands across,
- long plain dark service counters,
- correctly oriented registers,
- black/white checker-style floor pairing,
- faded blue-green/gray diner wallpaper,
- grime, streaking, peeling, mold speckling, faded geometric print, darker lower-wall staining,
- finish coverage across back wall, sides, front sections, corners, jambs, and trim.

A prior bug tiled/repeated the wall image. Food Court v3 intentionally uses per-wall aspect sizing with **`THREE.ClampToEdgeWrapping` and repeat `(1,1)`**. Do not restore `RepeatWrapping` there.

### Cassette Castle

Preserve low cassette bins, listening stations/tables, music counter, genre/promotional wall art, and a visual language distinct from Video Planet.

### Storefront neon

Named storefront signs are locally generated because their wording is game-specific. They are physical/fixed, emissive, distressed, bloom-reactive, and use **independent randomized flicker**, not synchronized blinking.

---

## 8. Current pickups and objective props

Current notable pickup mappings:

- service key → **KayKit Dungeon Remastered** key, CC0,
- Last Shift journal → Kenney Mini Dungeon book, CC0,
- recovered note → Kenney Mini Dungeon banner/paper-like model, CC0,
- tape → GGBotNet/OpenGameArt VHS cassette, CC0,
- decoy → Kenney Furniture Kit portable radio, CC0.

Collectible key/decoy/journal/note/tape items intentionally hover, bob, and spin so they still read clearly as pickups even when using realistic models.

Last Shift logs in Chapters 1 and 2 are represented as bound journals. Chapter 3 PA/archive memos may remain paper notes where appropriate.

---

## 9. Breakers and freight elevator — current completed state

The old “collect a fuse” abstraction is gone. Breakers/relays are wall-mounted interactable equipment.

- Chapter 1 breaker IDs: **A / B / C**
- Chapter 2 relay IDs: **D / E**
- visible breaker cabinet housing uses a verified Kenney Factory Kit CC0 model with gameplay-safe fallback,
- breakers remain physically mounted to authored wall faces.

### Breaker status LEDs and lever animation

The breaker boxes include a small **red status LED**:

- off/unrestored: very dim dark red,
- on/restored: bright red emissive LED plus a restrained local red glow.

The physical breaker lever also has distinct states. It rests at a clear OFF angle and smoothly travels to the opposite ON angle when the breaker is restored. The animation is driven continuously from breaker state in the main update loop, so it visually settles rather than teleporting between positions.

Do not revert activated breakers to the older green indicator unless explicitly requested, and do not remove the visible lever state change.

### Freight elevator

Visible elevator architecture is assembled from verified Kenney CC0 modular GLB content, including Factory Kit and Prototype Kit pieces. The car remains recessed into the wall and physically enterable.

Chapter 1 progression must remain:

1. activate all three Chapter 1 breakers,
2. call/interact with the freight elevator,
3. doors open,
4. doors remain open while waiting,
5. player physically walks fully inside,
6. doors close only after entry,
7. player movement is held during the ride,
8. chapter transitions after the ride.

Do not regress this to “press E and instantly complete the chapter.”

The collision audit adds physical-only side/back/call-door bounds without corrupting The Attendant's authored A* walkability grid.

### Elevator ready indicator

The imported call button now has a small amber/orange status glow layered onto it:

- no emergency power: dark,
- all required Chapter 1 circuits restored and elevator idle: soft pulsing amber glow,
- once called/opening/ride sequence begins: glow extinguishes.

The glow is deliberately subtle rather than a large arcade-style beacon.

---

## 10. Licensing / asset policy

Commercial safety matters. Third-party visual/audio assets should have verified provenance, preferably from original creators plus pinned runtime mirrors where necessary.

Current documented sources include, among others:

- Kenney Mini Arcade — CC0
- Kenney Furniture Kit — CC0
- Kenney Mini Market — CC0
- Kenney Food Kit — CC0
- Kenney Mini Dungeon — CC0
- Kenney Factory Kit 3.0 — CC0
- Kenney Prototype Kit — CC0
- Kenney RPG Audio / Interface Sounds — CC0
- KayKit Dungeon Remastered — CC0
- Poly Haven materials/models — CC0
- GGBotNet/OpenGameArt VHS Cassette 3D — CC0
- Reactorcore/OpenGameArt blood decals — CC0/public domain
- OpenGameArt recorded SFX/ambience bank — CC0/public domain as documented
- OpenGameArt mall/threat music — CC0
- Three.js — MIT

See `LICENSES.md` for the exact provenance, pinned commits, files, normalization policy, and usage. Keep both `LICENSES.md` and in-game attribution current when introducing new assets.

The Attendant model/animation rig, story, authored levels, game-specific signs/posters, UI, visual procedural effects, and fallback geometry are project-original unless specifically documented otherwise. Non-music SFX are now CC0 recordings rather than generated audio.

---

## 11. Navigation / regression baseline

Most recent recorded navigation baseline:

- Chapter 1: **1852 / 1852** walkable cells reachable
- Sunburst Arcade reachable
- Video Planet reachable
- Pinewood Food Court reachable
- Cassette Castle reachable
- breakers A/B/C reachable
- Master Service Key reachable
- freight elevator reachable
- each Chapter 1 store entrance remains one contiguous **5-cell-wide** segment
- Chapter 2: **1190 / 1190** walkable cells reachable
- Chapter 3: **1405 / 1405** walkable cells reachable

Other established polish checks include human-scale CC0 furniture, corrected Food Court chair facing, corrected store register orientation, Video Planet CC0 VHS with fallback, and independent storefront-neon flicker.

Any geometry pass should preserve these paths. A prettier mall that blocks an objective is a regression.

---

## 12. Development workflow expectations

When continuing this project:

1. Read this handoff.
2. Inspect the **current** GitHub files and latest commits relevant to the requested change.
3. Treat repository state as more authoritative than old conversations.
4. Newer explicit user requests override this document.
5. Make changes directly in the repository when access is available.
6. Preserve unrelated good work; avoid rebuilding whole systems for narrow fixes.
7. Use coherent commits with descriptive messages.
8. Run/verify `scripts/audit-runtime.mjs` through the GitHub Action after runtime changes.
9. Verify the actual GitHub Pages build/deploy after game changes rather than assuming a push is live.
10. Be explicit about anything that could not be visually/runtime verified.

For code requests, implement the work rather than asking the user to make surgical edits manually.

---

## 13. Files worth reading before common tasks

### Deployment/runtime

- `game.js`
- `index.html`
- `scripts/audit-runtime.mjs`
- relevant patch files
- `runtime-audit.js` only as decoded base/audit reference

### World props / pickups

- `patches/worldprops-v1.js.txt`
- `patches/industrial-cc0-v1.js.txt`
- `patches/visual-fixes-v1.js.txt`

### Stores / visuals / systems

- `patches/store-polish-v2.js.txt`
- `patches/systems-polish-v3.js.txt`
- `patches/reliability-v4.js.txt`
- `patches/status-lights-v5.js.txt`
- `patches/audio-immersion-v6.js.txt`

### Audio

- `assets/audio/cc0/`
- `assets/audio/cc0/README.md`
- `.github/workflows/vendor-cc0-audio.yml` for the normalization/vendoring recipe
- `LICENSES.md` for source provenance

### Food Court

- `patches/foodcourt-v3.js.txt`
- do not accidentally reactivate v2

### Design/story/navigation

- `DESIGN_AUDIT.md`
- `AUDIT_RESULTS.txt`
- `README.md`

### Licensing

- `LICENSES.md`
- in-game credit/license string produced by the patch chain

---

## 14. Current continuation point

The CC0 breaker/elevator replacement, elevator physical-entry/collision audit, service-key replacement, warped mall-music pass, breaker red status LEDs, elevator-ready call-button glow, normalized CC0 recorded SFX replacement, and breaker lever OFF→ON animation are implemented.

There is no older handoff task that should automatically be repeated. For the next development session, inspect the latest commits and the user's newest request before choosing work.

Longer-term production items still worth considering when explicitly prioritized include:

- recorded voice acting,
- formal low-end GPU/performance testing,
- accessibility review,
- controller support,
- objective/hunt pacing playtests,
- locally bundling remaining remote CC0 visual/music dependencies.

---

## 15. Fresh-session restart prompt

A future session can restart with:

> Continue development of The Attendant: Pinewood Mall. Use `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `DEVELOPMENT_HANDOFF.md` first, inspect the latest commits and relevant current files, preserve the documented no-regression constraints, implement directly in the repo, run the runtime audit, and verify GitHub Pages after game changes.

Keep this file current after major architectural, asset, story, or workflow changes so another giant conversational fossil does not grow around the project.
