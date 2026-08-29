# Development Handoff — The Attendant: Pinewood Mall

**Purpose:** This file is the compact source of truth for continuing development in a fresh ChatGPT/Codex session without loading the large historical conversation exports. Read this file first, then inspect the current repository files relevant to the requested change. The repository itself wins over stale chat history whenever they differ.

**Project:** The Attendant: Pinewood Mall — Rebuilt Edition  
**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from `main` / repository root  
**Current loader architecture baseline:** commit `a66937a2db724070f674929e8fca0e4564432c2c` and later descendants

---

## 1. Core creative direction

The Attendant is a first-person browser horror game set in a decaying 1990s shopping mall. The tone should be oppressive, uncanny, lonely, and increasingly supernatural while still feeling physically grounded. Pinewood Mall should look like a place that once had bright commercial optimism and has since curdled into stained tile, dead storefronts, buzzing lights, damaged wallpaper, old signage, service corridors, and things that do not quite obey ordinary space or time.

The player is not meant to feel like an action hero. The intended loop is exploration, completing maintenance-style objectives, reading environmental/story clues, managing sound and stamina, hiding, distracting The Attendant, and surviving long enough to reach the next stage of the closing routine.

Visual changes should favor believable physical placement. Wall-mounted objects must read as mounted to walls. Floor-standing objects must sit on the floor. Counters, shelves, arcade cabinets, chairs, hiding cabinets, and other major props need appropriate collision. Avoid floating props, clipped signs, toy-scale furniture, or decorative geometry that blocks required routes.

Use verified **CC0 assets** whenever suitable third-party art is introduced. Keep a procedural/generated fallback when a remotely loaded model or texture is required for gameplay or visual comprehension.

---

## 2. Architecture — do not regress this

The old `Game2.html` prototype was retired because too many systems shared the same mutable maze grid. Store carving, visual geometry, collision, and Attendant navigation could break each other.

The rebuild deliberately separates:

1. **Authored walkable floorplan** — corridors and rooms exist before meshes are generated.
2. **Visual geometry** — walls, floors, storefronts, trim, and decor are built from the authored plan.
3. **Prop collision** — shelves, counters, games, chairs, cabinets, etc. use independent collision/AABB data.
4. **AI navigation** — A* uses the walkability plan plus appropriate blocking props/doors.
5. **Story/game state** — objectives, save data, audio, menu state, hiding, progression, and inventory are independent of map construction.

Do not return to runtime store carving or make visual decoration directly mutate the fundamental floorplan.

### Current deployment loader

`game.js` is the deployment loader. It:

- concatenates the encoded runtime segments in `bundle2/`,
- base64-decodes and gunzips the runtime source,
- normalizes old Three.js helper imports to `three/addons/...`,
- loads and applies `patches/worldprops-v1.js.txt`,
- then replaces the Food Court builder with `patches/foodcourt-v3.js.txt`,
- imports the resulting runtime from a Blob URL.

The patch order is intentional: **world props first, Food Court v3 second**. Do not casually reverse it.

The active authored patches are:

- `patches/worldprops-v1.js.txt`
- `patches/foodcourt-v3.js.txt`

`foodcourt-v2.js.txt` remains in the repository but is not the desired active Food Court implementation.

`runtime-audit.js` is an audit/reconstructed runtime helper, not necessarily the direct deployment source of truth. Always trace what `game.js` actually loads.

---

## 3. Current controls

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

## 4. The Attendant

The Attendant is an original creature, not Michael Myers and not an imported licensed horror character.

Current identity:

- all-black humanoid silhouette,
- articulated body with animated arms/legs and a natural-ish gait,
- fuzzy/blurry edge treatment,
- glitch particles / afterimages,
- white emissive eyes,
- threatening but not just a static black capsule or cardboard cutout.

Core AI states include:

- dormant,
- stalk,
- investigate,
- hunt,
- search,
- stunned.

Important behavior:

- Contact kills the player unless the player is safely in a hiding state.
- Decoys can divert/investigate and temporarily stun/distract The Attendant.
- Sound matters. Running is louder; breath-holding makes movement quieter.
- Danger effects use **route/path distance**, not simple straight-line distance through walls. This principle applies to hearing/danger presentation such as heartbeat and flashlight instability.
- The Attendant cannot simply “sense through walls” because Euclidean distance happens to be small.

Atmospheric danger systems include heartbeat escalation, flashlight flicker/failure near danger, directional whispers, mall hum, radio/PA elements, and detuned mall muzak.

---

## 5. Player stealth, hiding, death, and menus

### Sprint / stamina

Sprint is faster and louder and drains stamina. Movement should preserve the tradeoff between speed and noise.

### Hold breath

Holding **C** reduces footstep/noise output and slows movement. Breath is limited. Running out can cause an involuntary cough/noise event.

### Cabinet hiding

Hiding cabinets are real physical interactable objects. Desired sequence:

1. player interacts,
2. cabinet doors open,
3. player/camera moves inside,
4. doors close,
5. a narrow peek aperture/mask remains,
6. player can emerge later when safe.

Do not replace this with teleport-only hiding or an abstract menu action.

### Menus

Opening a modal/menu must:

- pause gameplay simulation,
- silence/pause the audio master bus as appropriate,
- release pointer lock,
- render above the cabinet peek mask.

A prior bug placed menus underneath the peek mask. Do not reintroduce it.

### Death

Physical contact with The Attendant kills the player outside a valid hiding state. The sequence includes a procedural gore burst and a white death message:

**YOU’VE BEEN ATTENDED TO**

The player can restart the chapter or quit.

---

## 6. Story / chapter arc

The rebuilt story preserves three voices/concepts from the prototype:

- **Dispatcher**
- **Intercom**
- **Previous Contractor / Last Shift**

### Chapter 1

The player receives what initially appears to be a routine maintenance/work order at Pinewood Mall, except the order should not exist. The chapter establishes the mall, the maintenance language, the service-key/breaker objectives, the four major storefronts, The Attendant, and the freight elevator.

Core progression currently includes three wall-mounted breakers, the Master Service Key / gated service access, then the freight elevator.

### Chapter 2

The freight elevator takes the player deeper. The chapter involves a security keycard and service relays D/E plus access toward the north stairwell. The story reveals that the work order was filed in **1997**, creating doubt over who or what the Dispatcher radio voice really is.

### Chapter 3

The player reaches the archive/east-wing endgame. Pinewood is revealed to be trapped in a nightly closing/accountability routine. The goal is not merely to cut power, but to **end the shift**. The player recovers Last Shift recordings and ultimately interacts with the PA/closing system.

### Ending logic

There are nine numbered Last Shift logs in the larger story set: `LS-01` through `LS-09`.

Recovering all nine changes the ending. In the stronger/alternate ending, all staff are finally clocked out, The Attendant's white eyes go dark, the player leaves at dawn, and the impossible work order vanishes. Without all nine, remnants of Last Shift remain and the closing routine is not fully laid to rest.

Do not flatten the story into “turn off generator and escape.” The work-order/closing-routine mythology is central.

---

## 7. Stores and visual identity

The Chapter 1 mall contains four named authored storefronts:

- **Sunburst Arcade**
- **Video Planet**
- **Pinewood Food Court**
- **Cassette Castle**

Stores are physically walkable rooms, not portals or fake facades. Their storefront openings must stay wide enough that signs and geometry do not choke navigation.

### Sunburst Arcade

Desired spatial feel:

- staggered arcade clusters,
- arcade cabinets at believable human scale,
- air hockey,
- basketball,
- claw machine,
- prize counter / prize wall,
- neon and colored light accents.

### Video Planet

Hard-earned requirements that should be preserved:

- shelves begin as real shelving, not giant black VHS-shaped boxes,
- VHS tapes/cases are placed separately on shelves,
- cases vary in color/design,
- checkout is a plain conventional counter, not a bakery/bread display,
- registers face the customer side correctly,
- furniture is normalized to human scale,
- physical VHS tapes use the verified CC0 GGBotNet/OpenGameArt GLB with procedural fallback.

### Pinewood Food Court

The current desired implementation is **Food Court v3**.

Preserve:

- newer round table/chair appearance,
- seating arranged as roughly two rows deep by three islands across,
- long plain black service counters,
- registers oriented correctly,
- black/white checker-style floor pairing,
- faded blue-green/gray diner-style wallpaper,
- water streaking, grime, peeling, mold speckling, faded geometric print, and darker lower-wall staining,
- wallpaper/finish coverage across back wall, sides, front sections, corners, doorway jambs, and trim.

A previous bug visibly repeated/tilled the wall image halfway across a wall. Food Court v3 intentionally uses per-wall aspect sizing and **`THREE.ClampToEdgeWrapping` with repeat `(1,1)`**, not `THREE.RepeatWrapping`. Do not reintroduce the repeated-wall seam.

### Cassette Castle

Desired elements:

- low cassette bins,
- listening stations/tables,
- music counter,
- genre/promotional wall art,
- distinct visual logic from the VHS store.

### Storefront signage

Named storefront signage is generated locally because the lettering is game-specific. Desired signs:

- physical/fixed, not billboards floating through walls,
- emissive/neon treatment,
- distressed/dead-tube look,
- bloom/light spill,
- **independent randomized flicker**, not every sign blinking in sync.

---

## 8. Current pickups / objective props

The world-props patch introduced distinct CC0 models for common pickups while preserving procedural fallback geometry.

Current pickup mappings include:

- service key → Kenney Mini Dungeon key model,
- Last Shift journal → Kenney Mini Dungeon book model,
- recovered note → Kenney Mini Dungeon banner/paper-like model,
- tape → GGBotNet/OpenGameArt VHS cassette,
- decoy → Kenney Furniture Kit portable radio.

Important presentation rule: collectible key, decoy, journal, note, and tape items continue to **hover/bob/spin** so they remain readable as pickups even when represented by realistic CC0 models.

Last Shift logs in Chapters 1 and 2 are represented as bound journals; Chapter 3 PA/archive memos may remain paper notes where appropriate.

---

## 9. Breakers and elevator — current state and next open task

### Breakers

The old “collect a fuse item” abstraction was replaced with wall-mounted breaker/relay interactions.

Current Chapter 1 breaker IDs: **A / B / C**.  
Current Chapter 2 relay/breaker IDs: **D / E**.

The current `worldprops-v1` implementation fixes their placement so they are surface-mounted on actual walls rather than floating in corridors. However, their visible breaker cabinet is still **custom procedural Three.js geometry**, not an imported CC0 breaker-box model.

### Freight elevator

The current freight elevator is recessed into the wall and behaves as architecture rather than a floating freestanding box. It currently uses custom Three.js geometry for the surround, cabin, rails, ribbing, indicator, call panel, and sliding doors.

The desired Chapter 1 progression is already implemented and must be preserved exactly in spirit:

1. activate all **three** Chapter 1 breakers,
2. call/interact with the freight elevator,
3. elevator doors open,
4. doors remain open while waiting,
5. the player must **physically walk inside** the elevator cabin,
6. only then do the doors close,
7. movement freezes for the ride,
8. chapter completes / transitions after the ride.

Do not regress this to “press E and instantly finish chapter.”

### Immediate next development task

**Replace the remaining procedural breaker-box visual and freight-elevator visual with suitable verified CC0 models while preserving all current interaction logic, collisions, mounting/recess placement, door animation/progression, and procedural fallbacks.**

Requirements for this task:

- verify CC0 provenance, do not accept merely “free” or royalty-free licensing,
- prefer GLB/GLTF suitable for browser loading,
- normalize dimensions to believable human scale,
- breakers must remain visibly mounted to the wall,
- elevator must remain visually recessed/architectural and physically enterable,
- if an elevator source model does not provide useful independent doors, it is acceptable to use the CC0 model as the architectural/cabin visual while retaining separate runtime door meshes for animation,
- keep procedural geometry as fallback if remote assets fail,
- update `LICENSES.md` and in-game credits/provenance when introducing the assets.

---

## 10. Asset/licensing policy

Commercial safety matters. Third-party visual assets should have licensing verified from the original creator/source whenever possible.

Current major sources include:

- Kenney Mini Arcade — CC0
- Kenney Furniture Kit — CC0
- Kenney Mini Market — CC0
- Kenney Food Kit — CC0
- Kenney Mini Dungeon — CC0, currently injected into in-game attribution by `worldprops-v1`
- Poly Haven materials — CC0
- GGBotNet/OpenGameArt VHS Cassette 3D — CC0
- selected CC0/public-domain neon/grungy-light references
- Three.js — MIT

The Attendant model/rig, story, levels, procedural audio, generated game-specific signage/posters, UI, gore effects, and fallback geometry are original project work.

### Known documentation cleanup

`LICENSES.md` currently predates some additions made by `worldprops-v1`. The runtime patch adds in-game attribution for Kenney Mini Dungeon and expands Furniture Kit usage to cover the radio decoy, but the root license document should also be brought up to date during the next asset pass.

---

## 11. Navigation / regression baseline

The most recent repository audit records:

- Chapter 1: **1852 / 1852** walkable cells reachable
- Sunburst Arcade reachable
- Video Planet reachable
- Pinewood Food Court reachable
- Cassette Castle reachable
- breakers A/B/C reachable
- Master Service Key reachable
- freight elevator reachable
- each Chapter 1 store entrance is one contiguous **5-cell-wide** segment
- Chapter 2: **1190 / 1190** walkable cells reachable
- Chapter 3: **1405 / 1405** walkable cells reachable

Polish audit also records:

- CC0 furniture normalized to human-scale dimensions,
- Food Court chair facing corrected,
- store cash registers corrected by 180° from the older backwards orientation,
- Video Planet CC0 VHS model with fallback,
- independent randomized storefront-neon flicker.

Any geometry or asset pass that touches Chapter 1 should preserve this navigability. A prettier mall that blocks an objective is a regression.

---

## 12. Development workflow expectations

When continuing this project:

1. Read this handoff.
2. Inspect the **current** GitHub files relevant to the requested change before editing.
3. Treat repository state as more authoritative than an old conversation export.
4. Make the requested changes directly in the repository when access is available.
5. Avoid telling the user to make surgical edits manually when the repo can be edited directly.
6. Preserve unrelated good work. Do not rebuild entire rooms/systems unnecessarily for a narrow visual fix.
7. Use coherent commits with descriptive messages.
8. After code changes, verify syntax/build/runtime as far as the available environment permits.
9. Confirm the actual GitHub Pages deployment/workflow rather than assuming a commit is live.
10. Be explicit about anything not successfully verified.

The user values seeing actual implementation rather than repeated narration that work is “about to happen.” For code requests, perform the work, commit it, and verify it.

---

## 13. Files worth reading before common tasks

### Deployment/runtime changes

- `game.js`
- `index.html`
- relevant `bundle2/` segments only if necessary
- `runtime-audit.js` for reconstruction/audit reference

### World props, pickups, breakers, elevator

- `patches/worldprops-v1.js.txt`

### Food Court

- `patches/foodcourt-v3.js.txt`
- do not accidentally reactivate v2

### Design/story/navigation

- `DESIGN_AUDIT.md`
- `AUDIT_RESULTS.txt`
- `README.md`

### Licensing

- `LICENSES.md`
- in-game credit/license string in runtime / patches

---

## 14. Production-quality improvements still recommended later

The rebuild is a strong prototype, not a finished commercial game. Longer-term work still worth considering:

- recorded voice acting,
- authored/recorded SFX,
- formal performance testing on low-end GPUs,
- accessibility review,
- controller support,
- pacing/playtest passes across objectives and hunt frequency,
- local bundling of third-party CC0 assets instead of depending indefinitely on remote runtime mirrors.

---

## 15. Fresh-session restart prompt

A future development session should not need the historical multi-megabyte chat exports. A compact restart instruction is enough:

> Continue development of The Attendant: Pinewood Mall. Use the GitHub repository `maloysius-wq/the-attendant-pinewood-mall` as the source of truth. Read `DEVELOPMENT_HANDOFF.md` first, then inspect the current files relevant to my requested change. Preserve the documented no-regression constraints, implement directly in the repo, and verify the deployment after changes.

If a future request contradicts this document, the user's newer explicit request wins. After major architectural/story decisions, update this handoff so it remains useful instead of letting another giant conversational fossil form around the project.
