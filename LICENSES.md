# Third-party asset provenance

All third-party visual and audio assets used by this build were selected because their source licensing could be verified as **Creative Commons Zero (CC0 1.0)** unless otherwise noted below.

## Runtime storage policy — authoritative v15
- **No third-party asset or browser library is loaded from an external host during play.** All runtime models, model dependencies, PBR textures, decals/images, sound effects, ambience, music, Three.js and Pako are served from this repository.
- `assets/vendor/runtime/manifest.json` records original provenance, any verified replacement mirror used during development-time vendoring, the repository-local runtime path, byte count, SHA-256 digest, and dependent GLTF/model files.
- The v15 migration currently contains **59 top-level runtime media assets plus 30 dependent files** discovered from the assembled v14 runtime.
- External links elsewhere in this document are provenance/source references only. They are not browser runtime fetch targets.
- The development-only vendoring pipeline is `scripts/vendor-runtime-assets.mjs`; `patches/local-assets-v15.js.txt` maps the final assembled browser runtime to pinned local copies; `scripts/audit-local-assets-v15.mjs` enforces the no-remote-runtime rule and verifies hashes.
- Historical stale runtime mirrors were repaired with pinned verified equivalents: Kenney Factory Kit via `levinzonr/godot-asset-placer` commit `1dbf9fd782566780d6a6c52bd4197f448622f0aa`; Kenney Prototype Kit via `RetroDECK/RetroQUEST` commit `dfa19a5602a31f64bd890d15279a61f43b127328`; Poly Haven CC0 Book via `mgaralc/portfolio` commit `6a9da7106a598bb3962acea0c1158195c75a1fdb`; and the complete Poly Haven Cassette Player package via `QueenOfSquiggles/squiggle-pt` commit `deabff55b5df0b8989e58400bdf05de1c8e1eae1`.

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
- Cassette Castle full-height browsing-rack runtime file: `assets/kenney_furniture-kit/Models/GLTF format/bookcaseOpen.glb` from the pinned `RetroDECK/RetroQUEST` mirror.
- Cassette Castle v14 low-center-fixture runtime file: `assets/kenney_furniture-kit/Models/GLTF format/bookcaseOpenLow.glb` from the same pinned mirror.
- Used for food-court tables/chairs, the portable-radio decoy, full-height hiding cabinets, Cassette Castle perimeter racks, and Cassette Castle v14's low center fixtures.

## Kenney — Space Kit
- Original source: https://kenney.nl/assets/space-kit
- License: CC0 1.0
- Pinned runtime mirror: `vinhelysia/godot-fps-cogito` commit `1268440e90e370db6c3351ec4cd7429f3ca278b3`
- Runtime file: `addons/cogito/Assets/Models/Kenney/SpaceInterior/GLTF format/KSI_counter.glb`.
- Used by Cassette Castle v14 for the three-module listening bar and the checkout counter. Placement is grounded from measured model bounds; tabletop props are anchored to the measured counter top.

## Quaternius — Ultimate House Interior / Furniture Pack
- Creator/source: https://quaternius.com/packs/furniture.html
- Additional public-domain catalog reference: https://poly.pizza/bundle/Ultimate-House-Interior-Pack-2SXnFbwFzm
- License: CC0 / Public Domain.
- Pinned runtime mirror: `BGS3934/BGS3934.github.io` commit `2efb99e0ba4d22a65489c21d01651447be433ef5`.
- Current Cassette Castle runtime file:
  - `Assets/Furniture/Stool.glb`
- `Assets/Furniture/Table Round Small.glb` remains historical v13 provenance but is no longer used by the authoritative v14 store layout.
- **Permanently retired/banned:** Quaternius `Shelf Large.glb` and `Shelf Small.glb`. Those fixtures produced toy-scale presentation in the prior Cassette Castle implementation. `patches/cassette-castle-rebuild-v13.js.txt` scrubs their runtime keys/URLs, and project rules prohibit reintroducing them under any alias.

## Kenney — Mini Dungeon
- Original source: https://kenney.nl/assets/mini-dungeon
- License: CC0 1.0
- Pinned runtime mirror: `Enthceph/hangman` commit `4e84f92f27d924a46a52ea0cf4d06a5dc90a9c12`
- Used for the Last Shift journal/book and recovered paper/note pickup visuals.
- Runtime files: `book.glb` and `banner.glb` from `assets/kenney_mini-dungeon/Models/GLB format/`.

## KayKit — Dungeon Remastered
- Creator: Kay Lousberg
- Source: https://github.com/KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0
- License: CC0 1.0 Universal
- Pinned runtime commit: `b0ca9bd96a8072ab36a3a5464f00ed1e06a16d07`
- Runtime file: `addons/kaykit_dungeon_remastered/Assets/gltf/key.gltf.glb`.
- Used for the slimmer Chapter 1 service-key pickup model.

## Kenney — Factory Kit 3.0
- Original source: https://kenney.nl/assets/factory-kit
- License: CC0 1.0
- Pinned runtime mirror: `Enthceph/hangman` commit `4e84f92f27d924a46a52ea0cf4d06a5dc90a9c12`
- The mirrored `assets/kenney_factory-kit_3.0/License.txt` identifies Factory Kit 3.0 as Creative Commons Zero (CC0).
- Runtime files: `machine-window.glb`, `door-wide-half.glb`, `structure-wall.glb`, `floor.glb`, and `button-floor-square-small.glb` from `assets/kenney_factory-kit_3.0/Models/GLB format/`.
- Used for the wall-mounted breaker cabinet housing plus the freight elevator doors, cabin walls, floor/ceiling, and call button. The freight elevator no longer uses any visible procedural shell or procedural door fallback; only the breaker retains its generated fallback if its vendored GLB fails.

## Kenney — Prototype Kit
- Original source: https://kenney.nl/assets/prototype-kit
- License: CC0 1.0
- Pinned runtime mirror: `Enthceph/hangman` commit `4e84f92f27d924a46a52ea0cf4d06a5dc90a9c12`
- The mirrored `assets/kenney_prototype-kit/License.txt` identifies Prototype Kit 1.0 as Creative Commons Zero (CC0).
- Runtime file: `wall-doorway-wide.glb` from `assets/kenney_prototype-kit/Models/GLB format/`.
- Used as the recessed architectural surround for the freight elevator. The physical moving-door state machine and walk-in progression remain game-authored, while all visible elevator architecture is now assembled from CC0 modular GLBs.

## Kenney — Starter Kit City Builder
- Source repository: https://github.com/KenneyNL/Starter-Kit-City-Builder
- Asset license: CC0 1.0. The repository README explicitly states that its included sprites, 3D models, and sound effects are CC0 licensed; the starter-kit code itself is MIT.
- Pinned runtime commit: `4535092b740b378b700efd9df9e27a631815b84a`
- Runtime file: `models/pavement-fountain.glb` (source blob `07bdcd359c5e30171bce764979b80e486d375ebd`).
- Used for the imported center sculpture/nozzle form of Pinewood Mall's Chapter 1 central fountain. The surrounding basin is authored to Pinewood's exact existing footprint rather than scaling the entire source model to become the fountain boundary.

## Kenney — Mini Market
- Original source: https://kenney.nl/assets/mini-market
- License: CC0 1.0
- Pinned runtime mirror: `AkiraNim/CLTCrossing` commit `6fe4cd6dcb6fbfa4267d3b9971c0968e0fe375b6`
- Used for stocked retail shelving, endcaps, display counters, return fixture and cash registers elsewhere in Pinewood. Cassette Castle v14 does **not** use the baked-stock Mini Market shelf as a browsing fixture.

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
- Marble Tiles: https://polyhaven.com/a/marble_tiles
  - Used for the worn stone coping, rim, and imported center treatment of the Chapter 1 central fountain.
- Grey Tiles: https://polyhaven.com/a/grey_tiles
  - Used for the recessed dry basin floor and inner basin surfaces of the Chapter 1 central fountain.
- Cassette Player: https://polyhaven.com/a/cassette_player
  - Original Poly Haven GLTF URL (provenance only): `https://dl.polyhaven.org/file/ph-assets/Models/gltf/2k/cassette_player/cassette_player_2k.gltf`
  - Used at Cassette Castle listening stations.
  - Cassette Castle v13 extracts the model's separately named cassette/tape component and clones that **actual model component** as retail stock and loose listening-station media; v14 keeps that grounding/stock system and changes the store layout around it.
  - v13/v14 anchor those cassette clones to measured fixture support surfaces instead of hard-coded world-Y positions.
  - If that tape component cannot be extracted, the affected stock is simply omitted. There is no generated low-poly cassette fallback in Cassette Castle.

The documented Poly Haven 1K JPG diffuse, OpenGL normal and roughness maps used by Pinewood are vendored under `assets/vendor/runtime/` and served locally; the Poly Haven URLs above are provenance only.

## Three.js
- https://threejs.org/
- MIT License
- Runtime version pinned to 0.180.0.
- Served locally from `vendor/three/`; the deployed game does not load Three.js from unpkg or jsDelivr. Runtime files include `vendor/three/build/three.module.js`, its required `vendor/three/build/three.core.js`, and the needed `examples/jsm` addons. The vendored r180 `three.core.js` is pinned to Git blob `7dcd0fbcbc04b8d9a20ecb96c1ce344cb55150d5`.

## Pako
- Source: https://github.com/nodeca/pako
- MIT License.
- Runtime version pinned to 2.1.0 and served locally from `vendor/pako/pako.esm.mjs`; jsDelivr is not a runtime dependency.

## CC0 sound effects and ambience

All non-music gameplay SFX in the current build are real recorded samples. They are vendored under `assets/audio/cc0/` rather than fetched from third-party sites during play.

### Kenney — RPG Audio and Interface Sounds
- Original sources: https://kenney.nl/assets/rpg-audio and https://kenney.nl/assets/interface-sounds
- License: CC0 1.0
- Pinned provenance/audit mirror: `Sonofg0tham/tailgate` commit `99de980908146410f5bb3b0efcd6711e22b253b9`; its `CREDITS.md` maps the mirrored filenames to the original Kenney packs and records the CC0 license.
- Used for footsteps, breaker switch, door/shutter/latch sounds, metal impacts, pickups, error/toggle/confirmation cues, thrown-object handling, and paper handling.

### OpenGameArt — recorded CC0 sources
- Heartbeat sounds — bart — https://opengameart.org/content/heartbeat-sounds — CC0 1.0
- Ghost breath — qubodup — https://opengameart.org/content/ghost-breath — CC0 1.0
- Static — xhunterko — https://opengameart.org/content/static — CC0 1.0
- Electronic device loop — qubodup — https://opengameart.org/content/electronic-device-loop — CC0 1.0
- Ambient horror — techiew — https://opengameart.org/content/ambient-horror — CC0 1.0
- Electric Buzz — themightyglider — https://opengameart.org/content/electric-buzz — CC0 1.0
- Bell dings/chimes — PWL — https://opengameart.org/content/bell-dingschimes — CC0/public domain
- Squish Sounds Effects — EZduzziteh — https://opengameart.org/content/squish-sounds-effects — CC0 1.0
- Horror scream1 — Vinrax — https://opengameart.org/content/horror-scream1 — CC0 1.0
- Used for heartbeat layers, breath/whisper cues, radio static, electrical room tone, danger ambience, electrical buzz, intercom bell, and death/gore layers.

### Loudness normalization
The source recordings are normalized during vendoring with FFmpeg EBU R128 processing and transcoded to stereo 44.1 kHz Vorbis OGG:
- integrated loudness target: **-20 LUFS**
- true-peak ceiling: **-2 dBTP**
- loudness-range target: **7 LU**

Runtime per-event gains still make footsteps quieter than doors, impacts, and death sounds. Those are intentional mix choices rather than compensation for inconsistent source-file loudness. The final runtime contains no Web Audio oscillator or generated-random-noise fallback for non-music SFX; if an individual local sample cannot be decoded, that cue is skipped instead of synthesized.

## Original/game-specific work
The Attendant model and animation rig, story, levels, interaction systems, UI, generated signage/posters, gore visuals, particle effects and fallback geometry/textures are original to this project build. The current non-music sound effects are third-party CC0 recordings documented above rather than project-generated procedural audio.

## Additional CC0 assets / references for the storefront polish pass

### VHS cassette 3D — GGBotNet / OpenGameArt
- Original source: https://opengameart.org/content/vhs-cassette-3d
- License: CC0 1.0
- Pinned runtime mirror: `zodiepupper/snow` commit `b9dc9c35bec885aacf31cfca729adcd3e304ef90`
- Runtime file: `assets/vhs_cassette_3d/VHS_cassette.glb`
- Used for physical VHS tapes throughout Video Planet. The game's old generated VHS geometry remains only as a fallback if the vendored GLB cannot load.

### Neon / dirty-light visual references
- Neon Sign 2 — OpenGameArt: https://opengameart.org/content/neon-sign-2 — CC0
- Grungy Lights Texture Pack — OpenGameArt: https://opengameart.org/content/grungy-lights-texture-pack — CC0/public-domain relicensing

Pinewood's named storefront signs are generated locally because their lettering is game-specific. The generated material now incorporates the distressed/dead-tube treatment of those CC0 references, plus emissive mapping, point-light spill, bloom response, and independent randomized flicker bursts. No runtime dependency on the OpenGameArt image files is required.

### Video Planet shelf reference
- User-provided visual reference: https://sketchfab.com/3d-models/vhs-shelf-4ac998896ed044deb1038d89f7841012
- The referenced Sketchfab model is licensed **CC BY**, so it is not embedded in Pinewood under the project's CC0-only third-party asset policy.
- The new Video Planet rental fixtures are original game geometry following its tall, shallow, multi-tier 1990s rental-store proportions.
- Quaternius Furniture Pack was additionally verified as a CC0 furniture-proportion reference: https://quaternius.com/packs/furniture.html

### Cassette Castle v13 foundation + v14 authoritative retail/listening rebuild
- v13 grounding/foundation patch: `patches/cassette-castle-rebuild-v13.js.txt`.
- **Authoritative final store-layout patch:** `patches/cassette-castle-rebuild-v14.js.txt`.
- Full-height perimeter browsing racks: Kenney Furniture Kit `bookcaseOpen.glb`, CC0, pinned to the `RetroDECK/RetroQUEST` commit documented above, scaled from measured bounds to **2.00 m** in v14.
- Low center fixtures: Kenney Furniture Kit `bookcaseOpenLow.glb`, CC0, from the same pinned mirror, scaled from measured bounds to **1.08 m** in v14.
- Listening bar and checkout: Kenney Space Kit `KSI_counter.glb`, CC0, from the pinned `vinhelysia/godot-fps-cogito` mirror. Three imported modules form the listening bar; one imported module forms checkout.
- Listening stools: Quaternius `Stool.glb`, CC0/Public Domain.
- Listening hardware and cassette stock: Poly Haven Cassette Player and its extracted tape component, CC0.
- Furniture is grounded to the floor from measured `THREE.Box3` bounds. Players/registers/loose cassette media are anchored to measured counter/shelf support surfaces rather than guessed absolute Y coordinates.
- v14 adds only visual floor/wall/accent finishes and localized warm point lights; these finishes do not modify authored floor walkability, physical collision, or AI navigation.
- v14 reduces the roomtone/static mix only while the listener is inside Cassette Castle.
- Quaternius `Shelf Large.glb` and `Shelf Small.glb` are **permanently banned**. Their resource keys, URLs and historical aliases are scrubbed from the assembled runtime and must never be reintroduced.
- The old Kenney Mini Market baked-stock `shelf-end.glb` remains retired from Cassette Castle.
- v13's generated `fallbackCassette` geometry, generated cassette reels, procedural glowing listening rings, primitive furniture fallbacks, v9 `placeCassetteCc0`, `stockRealCassetteFixture`, `addCassetteDisplayFixture`, and `dressCassetteListeningTable` helpers remain retired.
- v14 additionally retires the v13 center double-rack maze and three isolated round listening-table islands from the final store layout.
- If a required remote CC0 model/component cannot load, the affected prop/stock is omitted rather than replaced with a visible procedural stand-in or left floating.
- Vinyl-record props remain omitted because prior candidate record/turntable assets were not all CC0. Pinewood's CC0-only third-party asset rule takes precedence over filling every merchandising category.

### Blood decals
- Gore Blood Gibs Meat Chunks — Reactorcore — https://opengameart.org/content/gore-blood-gibs-meat-chunks — CC0 / public domain.
- Audit/download mirror: `goshanskiy/last-light` pinned commit `b40e1a2e7f28182681e2d9622f36592165b5d0ef`; its `src/assets/CREDITS.md` identifies both decals below as derived from Reactorcore's CC0 pack.
- Vendored byte-for-byte into this repository:
  - `assets/decals/blood/decal_blood_01.png` — Git blob SHA `6cfc25f7f05363ef64a9a6acf280d595a7a7dee9` (exactly matches the audited source blob).
  - `assets/decals/blood/decal_blood_02.png` — Git blob SHA `dfa02a4790e53f11145a2475c92cafbde80d5b81` (exactly matches the audited source blob).
- Used as authored wall/floor stains around the Chapter 1 storefront concourse. Each plane is explicitly mounted to a known storefront-pillar face or to the Chapter 1 floor plane with only a millimetre-scale anti-z-fighting offset.
- There is **no procedural blood-decal fallback**. If either vendored PNG cannot load, that decal is skipped rather than replaced with generated circles/splats.

## CC0 music

### Abandoned mall music — Furniture Shop
- Author: SkyleTheFrench
- Original source: https://opengameart.org/content/furniture-shop
- License: CC0 1.0
- Original source-file URL (provenance only; runtime copy is vendored locally): `https://opengameart.org/sites/default/files/furniture_shop_loop.ogg`
- Used as the looping retail/mall music bed. It is faded down as The Attendant approaches and intentionally warped at runtime with half-speed playback, delayed echo copies, and intermittent detune drift.

### Attendant proximity music — Insistent: background loop
- Author: yd
- Original source: https://opengameart.org/content/insistent-background-loop
- License: CC0 1.0
- Original source-file URL (provenance only; runtime copy is vendored locally): `https://lpc.opengameart.org/sites/default/files/Insistent.ogg`
- Used as the darker threat layer. It fades in progressively with The Attendant's navigation-distance proximity while the mall loop recedes.
