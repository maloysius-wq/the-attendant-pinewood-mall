# Third-party asset provenance

All third-party visual and audio assets used by this build were selected because their source licensing could be verified as **Creative Commons Zero (CC0 1.0)** unless otherwise noted below.

## Original v81 storm-night panorama and decayed landscaping (2026-11-04)

- `opening/assets/v81/storm-night-sky.jpg` — original, locally generated and reviewed 1536×768 equirectangular dark midnight thundercloud panorama. Its SHA-256 is `4d755d1d4def3ead403a0eeb1bf634483115cec03dcc3be6d42ccc433a9aecc6`. Runtime loads only this same-origin JPEG and waits for it before showing the cinematic.
- The v81 front planters and dying shrubs still use the exact two original locally vendored Innerscene CC0 GLB models under `opening/assets/v63/`. Foliage is weathered with native-geometry deformations and vertex colors; pots match the old sign's `#21332f` backdrop. No third-party media, remote runtime requests, or substitute model geometry were added.

## Original v80 architectural surface albedo (2026-11-04)

These three texture images are original, project-generated raster assets, not third-party downloads. They depict era-appropriate 1980s mall ceiling finishes and an abandoned sidewalk; no external runtime requests are used. Images were generated for Pinewood, inspected, and compressed to 1024×1024 JPEG (quality 88) for fast same-origin loading.

- `opening/assets/v80/aged-acoustic-ceiling-albedo.jpg` — worn, yellowed retail mineral-fiber 2×4 suspended ceiling and water stains. SHA-256 `5a3220b6a74319bf77498ec9593dfe2b5a2b4919f1d23684982ab7d5676fe6f7`.
- `opening/assets/v80/stained-plaster-ceiling-albedo.jpg` — aging off-white painted gypsum, service/back-of-house ceilings. SHA-256 `4541c84a9df0a623db11015744bfca2ab5b591824da9750af9f19699ca65ade3`.
- `opening/assets/v80/worn-sidewalk-albedo.jpg` — dilapidated, cracked sidewalk panels, grime and sporadic moss. SHA-256 `872a984cee5c4e9e90377366bcd9a8901e8fa0739362c0acb83219fc8c78eb22`.

The two ceiling finishes are preloaded by the v67 shell renderer in the same map set as other physical building textures; the separate exterior sidewalk is awaited by the v65 opening first-frame cover. Each map repeats at an explicitly defined physical scale instead of stretching over full geometry.

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
