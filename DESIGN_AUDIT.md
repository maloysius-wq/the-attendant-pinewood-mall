# Rebuild audit — The Attendant: Pinewood Mall

## Why the old prototype was retired instead of patched again

The previous build had accumulated several generations of fixes in one HTML file. The largest architectural problem was that its maze, store carving, collision, and Attendant pathfinding all depended on the same mutable character grid. A storefront change could therefore alter the maze itself, and later fixes repeatedly had to compensate for side effects elsewhere.

The reboot separates these concerns:

1. **Authored walkable floorplan** — corridors and rooms exist before meshes are built.
2. **Visual geometry** — floors, walls, storefronts and décor are generated from that immutable plan.
3. **Prop collision** — shelves, counters, games, tables and cabinets have independent AABB colliders.
4. **AI navigation** — A* uses the walkability plan plus nav-blocking prop/door colliders.
5. **Story/game state** — objectives, save data, audio, menu state and hiding are independent of map construction.

## Layout audit

A connectivity test was run on all three authored navigation plans.

- Chapter 1: all 1,755 walkable cells connected from player spawn.
- Chapter 2: an initial audit found the security room and north stairwell disconnected. Both throats were corrected; all 1,190 walkable cells are now connected.
- Chapter 3: all 1,405 walkable cells connected from player spawn.

Chapter 1 verifies paths from spawn to:
- Sunburst Arcade
- Video Planet
- Pinewood Food Court
- Cassette Castle
- breakers A/B/C
- Video Planet master key
- east service shutter
- freight elevator

Chapter 2 verifies paths from spawn to:
- relays D/E
- security keycard
- loading room
- maintenance room
- north stairwell

Chapter 3 verifies paths from spawn to:
- all three Last Shift tapes
- records rooms
- PA control

## Gameplay audit and changes

### The Attendant
Old behavior could feel arbitrary because proximity and tracking sometimes used straight-line distance through walls. The reboot uses route distance for hearing, heartbeat, flashlight failure and fear effects. Its states are now distinct: dormant, stalk, investigate, hunt, search and stunned. Decoys have priority over ordinary player sounds for a short period.

### Stealth
Holding breath now also slows movement and dramatically reduces footstep sound. Running is faster and louder. Cabinets are explicit interactable objects with an entry/exit animation and a fixed peek aperture.

### Stores
Stores are authored as rooms instead of carved into the maze. Each has one deliberate throat/doorway and no physical door. Their layouts have different spatial logic:
- Arcade: staggered game clusters, air hockey, basketball, claw machine, prize counter, neon and prize wall.
- VHS: browsing bays, tall VHS racks, return slot, membership counter, release posters.
- Food court: multiple stalls, scattered tables/chairs, menu boards, abandoned food, service counters.
- Cassette store: low cassette bins, listening stations, music counter, genre/promotional wall art.

### Objectives
The old “collect fuses” abstraction has been replaced by wall-mounted breaker/relay interactions. Key items gate meaningful service doors. Chapter 3 changes the objective type entirely by requiring recovery of recordings before operating the PA core.

### Story
The reboot preserves the Dispatcher, Intercom and Last Shift roles but gives them an arc:
- Chapter 1 establishes a routine work order that should not exist.
- Chapter 2 reveals the order was filed in 1997 and creates doubt about the radio voice.
- Chapter 3 reveals Pinewood is trapped in a nightly closing/accountability routine. The player must end the shift rather than simply cut power.
- Recovering all nine numbered Last Shift logs changes the ending.

### Failure/death
Physical contact with The Attendant now always kills outside a hiding state. The death sequence includes a procedural gore burst and the white “YOU’VE BEEN ATTENDED TO” screen.

### UI / pause audit
Opening any modal:
- stops gameplay simulation,
- silences the audio master bus,
- releases pointer lock,
- hides the cabinet peek mask behind the menu.

## Visual audit

- ACES filmic tone mapping.
- Bloom around emissive signage/eyes/lights.
- PBR CC0 flooring and wall maps when online.
- Generated fallbacks if a texture fails.
- Fixed plane signs mounted against physical storefront lintels, never billboard sprites.
- Shadow-casting CC0 store models when available.
- Procedural 90s signage, posters, neon accents and mall trim.
- Attendant rebuilt as an articulated black silhouette with fuzz particles, glitch afterimages and emissive white eyes.

## Remaining production work for a commercial release

This build is a substantially stronger prototype, not a final shipped game. Before commercial release I would still recommend recorded voice acting, authored/recorded SFX, a formal performance pass on low-end GPUs, accessibility review, controller support, playtesting for objective pacing, and bundling third-party CC0 assets locally rather than relying on runtime mirrors.
