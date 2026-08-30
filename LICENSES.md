# Third-party asset provenance

All third-party visual assets used by this build were selected because their source licensing could be verified as **Creative Commons Zero (CC0 1.0)**.

## Kenney — Mini Arcade
- Original source: https://kenney.nl/assets/mini-arcade
- License: CC0 1.0
- Pinned runtime mirror: `RetroDECK/RetroQUEST` commit `dfa19a5602a31f64bd890d15279a61f43b127328`
- The mirrored package contains the original `License.txt` stating CC0.
- Used for arcade machines, air hockey, basketball, claw machine and cash register.

## Kenney — Furniture Kit
- Original source: https://kenney.nl/assets/furniture-kit
- License: CC0 1.0
- Primary pinned runtime mirror: `RetroDECK/RetroQUEST` commit `dfa19a5602a31f64bd890d15279a61f43b127328`
- Additional pinned runtime mirror for the hiding cabinet: `vinhelysia/godot-fps-cogito` commit `1268440e90e370db6c3351ec4cd7429f3ca278b3`
- The mirrored package contains the original `License.txt` stating CC0.
- Hiding-cabinet runtime file: `addons/cogito/Assets/Models/Kenney/Furniture/GLTF format/bookcaseClosedDoors.glb`. The GLB contains separate `doorLeft` and `doorRight` nodes used by Pinewood's existing physical hide animation.
- Used for food-court tables/chairs, Cassette Castle listening tables, the portable-radio decoy, and full-height hiding cabinets, normalized to human-scale dimensions at runtime.

## Kenney — Mini Dungeon
- Original source: https://kenney.nl/assets/mini-dungeon
- License: CC0 1.0
- Pinned runtime mirror: `Enthceph/hangman` commit `4e84f92f27d924a46a52ea0cf4d06a5dc90a9c12`
- Used for the service key, Last Shift journal/book, and recovered paper/note pickup visuals.
- Runtime files: `key.glb`, `book.glb`, and `banner.glb` from `assets/kenney_mini-dungeon/Models/GLB format/`.

## Kenney — Factory Kit 3.0
- Original source: https://kenney.nl/assets/factory-kit
- License: CC0 1.0
- Pinned runtime mirror: `Enthceph/hangman` commit `4e84f92f27d924a46a52ea0cf4d06a5dc90a9c12`
- The mirrored `assets/kenney_factory-kit_3.0/License.txt` identifies Factory Kit 3.0 as Creative Commons Zero (CC0).
- Runtime files: `machine-window.glb`, `door-wide-half.glb`, `structure-wall.glb`, `floor.glb`, and `button-floor-square-small.glb` from `assets/kenney_factory-kit_3.0/Models/GLB format/`.
- Used for the wall-mounted breaker cabinet housing plus the freight elevator doors, cabin walls, floor/ceiling, and call button. The freight elevator no longer uses any visible procedural shell or procedural door fallback; only the breaker retains its generated fallback if a remote GLB fails.

## Kenney — Prototype Kit
- Original source: https://kenney.nl/assets/prototype-kit
- License: CC0 1.0
- Pinned runtime mirror: `Enthceph/hangman` commit `4e84f92f27d924a46a52ea0cf4d06a5dc90a9c12`
- The mirrored `assets/kenney_prototype-kit/License.txt` identifies Prototype Kit 1.0 as Creative Commons Zero (CC0).
- Runtime file: `wall-doorway-wide.glb` from `assets/kenney_prototype-kit/Models/GLB format/`.
- Used as the recessed architectural surround for the freight elevator. The physical moving-door state machine and walk-in progression remain game-authored, while all visible elevator architecture is now assembled from CC0 modular GLBs.

## Kenney — Mini Market
- Original source: https://kenney.nl/assets/mini-market
- License: CC0 1.0
- Pinned runtime mirror: `AkiraNim/CLTCrossing` commit `6fe4cd6dcb6fbfa4267d3b9971c0968e0fe375b6`
- Used for stocked retail shelving, endcaps, display counters, return fixture and cash registers.

## Kenney — Food Kit
- Original source: https://kenney.nl/assets/food-kit
- License: CC0 1.0
- Pinned runtime mirror: `AkiraNim/CLTCrossing` commit `6fe4cd6dcb6fbfa4267d3b9971c0968e0fe375b6`
- Used for food-court dressing such as pizza, pizza box and cups.

## Poly Haven
Poly Haven assets are released under CC0.

- Terrazzo Tiles: https://polyhaven.com/a/terrazzo_tiles
- Dirty Carpet: https://polyhaven.com/a/dirty_carpet
- Floor Tiles 06: https://polyhaven.com/a/floor_tiles_06
- Concrete Wall 001: https://polyhaven.com/a/concrete_wall_001
- Cassette Player: https://polyhaven.com/a/cassette_player
  - Runtime GLTF: `https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/cassette_player/cassette_player_2k.gltf`
  - Used at Cassette Castle listening stations. The runtime also attempts to extract the model's separately named tape/cassette component for shelf stock; if unavailable, game-authored low-poly cassette geometry is used as a fallback.

The game requests the 1K JPG diffuse, OpenGL normal and roughness maps directly from Poly Haven's asset CDN.

## Three.js
- https://threejs.org/
- MIT License
- Runtime version pinned to 0.180.0.

## Original/game-specific work
The Attendant model and animation rig, story, levels, interaction systems, non-music procedural sound effects, UI, generated signage/posters, gore effects and fallback geometry/textures are original to this project build.


## Additional CC0 assets / references for the storefront polish pass

### VHS cassette 3D — GGBotNet / OpenGameArt
- Original source: https://opengameart.org/content/vhs-cassette-3d
- License: CC0 1.0
- Pinned runtime mirror: `zodiepupper/snow` commit `b9dc9c35bec885aacf31cfca729adcd3e304ef90`
- Runtime file: `assets/vhs_cassette_3d/VHS_cassette.glb`
- Used for physical VHS tapes throughout Video Planet. The game's old generated VHS geometry remains only as a fallback if the remote GLB cannot load.

### Neon / dirty-light visual references
- Neon Sign 2 — OpenGameArt: https://opengameart.org/content/neon-sign-2 — CC0
- Grungy Lights Texture Pack — OpenGameArt: https://opengameart.org/content/grungy-lights-texture-pack — CC0/public-domain relicensing

Pinewood's named storefront signs are generated locally because their lettering is game-specific. The generated material now incorporates the distressed/dead-tube treatment of those CC0 references, plus emissive mapping, point-light spill, bloom response, and independent randomized flicker bursts. No runtime dependency on the OpenGameArt image files is required.


### Video Planet shelf reference
- User-provided visual reference: https://sketchfab.com/3d-models/vhs-shelf-4ac998896ed044deb1038d89f7841012
- The referenced Sketchfab model is licensed **CC BY**, so it is not embedded in Pinewood under the project's CC0-only third-party asset policy.
- The new Video Planet rental fixtures are original game geometry following its tall, shallow, multi-tier 1990s rental-store proportions.
- Quaternius Furniture Pack was additionally verified as a CC0 furniture-proportion reference: https://quaternius.com/packs/furniture.html

### Cassette Castle retail stock
- Empty retail fixture: Kenney Mini Market `shelf-end.glb` — CC0, from the pinned Mini Market mirror documented above.
- Cassette stock uses the Poly Haven Cassette Player's separate tape/cassette component when that node is available at runtime, with game-authored low-poly cassette geometry as fallback.

### Blood decals
- Gore Blood Gibs Meat Chunks — Reactorcore — https://opengameart.org/content/gore-blood-gibs-meat-chunks — CC0 / public domain.
- Runtime mirror: `goshanskiy/last-light` pinned commit `b40e1a2e7f28182681e2d9622f36592165b5d0ef`.
- Runtime decal files: `src/assets/world/decal_blood_01.png` and `src/assets/world/decal_blood_02.png`. The mirror's `src/assets/CREDITS.md` identifies both as derived from Reactorcore's CC0 pack.
- Used as authored wall/floor stains around the Chapter 1 storefront concourse. Each plane is now explicitly mounted to a known storefront-pillar face or to the Chapter 1 floor plane with only a millimetre-scale anti-z-fighting offset.
- There is **no procedural blood-decal fallback**. If either authored PNG cannot load, that decal is skipped rather than replaced with generated circles/splats.

## CC0 music

### Abandoned mall music — Furniture Shop
- Author: SkyleTheFrench
- Original source: https://opengameart.org/content/furniture-shop
- License: CC0 1.0
- Runtime loop: `https://opengameart.org/sites/default/files/furniture_shop_loop.ogg`
- Used as the looping retail/mall music bed. It is faded down as The Attendant approaches.

### Attendant proximity music — Insistent: background loop
- Author: yd
- Original source: https://opengameart.org/content/insistent-background-loop
- License: CC0 1.0
- Runtime loop: `https://lpc.opengameart.org/sites/default/files/Insistent.ogg`
- Used as the darker threat layer. It fades in progressively with The Attendant's navigation-distance proximity while the mall loop recedes.
