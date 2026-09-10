# Token Gesture: Retro Arcade Props

17 stylized props. Flat-shaded, one shared 1024x1024 atlas.
Per-prop triangle counts are in the table below.

## Scale
1 Blender unit = 1 metre. Built to real-world scale.

## Contents
| Prop | Tris | Pivot |
|---|---|---|
| arcade_upright_alpha | 1232 | base_center |
| arcade_upright_beta | 1628 | base_center |
| arcade_upright_gamma | 1276 | base_center |
| arcade_cocktail | 968 | base_center |
| driving_cab | 1256 | base_center |
| dance_stage | 1496 | base_center |
| claw_machine | 2810 | base_center |
| air_hockey_table | 1392 | base_center |
| air_hockey_gear | 736 | base_center |
| skee_ball | 2272 | base_center |
| pinball | 2756 | base_center |
| prize_wall | 1936 | base_center |
| ticket_eater | 660 | base_center |
| token_changer | 748 | base_center |
| token_gear | 1384 | base_center |
| play_sign | 1100 | world_origin |
| arcade_bin | 724 | base_center |

## Formats
- `pack.glb`: Godot, Three.js, web (Y-up, metres). Recommended.
- `pack.fbx`: Unity/Unreal. In Unity set "Convert Units" on import. In Unreal,
  **disable Generate Lightmap UVs** (this pack uses a single packed UV channel).


## Texturing
One 1024x1024 gradient-ramp atlas, one opaque material + one emissive material.
If props look untextured, ensure `atlas.png` is in the same folder and the material
samples it as Base Color.

## Licence
Base pack: CC0 1.0 (public domain). Use commercially, no attribution required.
