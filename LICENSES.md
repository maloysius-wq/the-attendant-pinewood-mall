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
- Pinned runtime mirror: `RetroDECK/RetroQUEST` commit `dfa19a5602a31f64bd890d15279a61f43b127328`
- The mirrored package contains the original `License.txt` stating CC0.
- Used for food-court tables/chairs and Cassette Castle listening tables, normalized to human-scale dimensions at runtime.

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

The game requests the 1K JPG diffuse, OpenGL normal and roughness maps directly from Poly Haven's asset CDN.

## Three.js
- https://threejs.org/
- MIT License
- Runtime version pinned to 0.180.0.

## Original/game-specific work
The Attendant model and animation rig, story, levels, interaction systems, procedural audio, UI, generated signage/posters, gore effects and fallback geometry/textures are original to this project build.


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
