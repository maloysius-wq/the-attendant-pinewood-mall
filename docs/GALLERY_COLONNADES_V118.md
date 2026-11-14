# V118: Original 1979 mall colonnades, not random decorations

V114–V116 repaired physically missing rooms, false ceilings, 7 actual glass retail fronts and 13 authentic shuttered bays. The public retail walks were still immense, flat, mostly empty slabs. This first public-gallery architectural slice puts permanent, collision-active **structural support** in the correct places instead of dropping arbitrary furniture on featureless floor.

## Measured physical column plan

All coordinates are global Pinewood world metres from `mall/masterplan-v66.mjs`. The original three canonical public rooms are **unchanged**.

| Gallery group | Footprint / original source | Actual positions | Structure |
| --- | --- | --- | --- |
| Atrium west colonnade | central_gallery, x−11…11, z−112…−43 | x=−9, z=−53,−66,−79,−92,−105 | Five full-height supports to **12.8 m solid roof** outside the x−8…8 skylight |
| Atrium east colonnade | Same canonical 22 × 69 m atrium | x=9, same 13m row stations | Five paired posts, genuine fountain at (0,−71) remains unobstructed |
| West inner shopping walk | west_gallery, x−29…−11 | x=−13.4, same 13m row stations | Five support piers meet actual **5.19 m gallery soffit underside** |
| East inner shopping walk | east_gallery, x11…29 | x=13.4, same stations | Five gallery piers leave open the shared cross-gallery portals |
| West authentic tenant seams | Fallow's / Cassette Castle / Sunburst Arcade | x=−26.4; z=−48,−73,−90,−107 | Four shop-side original-era structural pier bases at the actual tenant boundaries, never over store entrances |
| East authentic tenant seams | East department / Video Planet / Food Court | x=26.4; z=−45,−61,−80,−97 | Four shop-side piers align with existing source store-front intervals |

**Total 28 physical posts.** Solid grounded stone plinths, source-PBR masonry shafts, attached ceiling capitals and short connected moldings are structural geometry, not imported fabricated GLB models. The 1979 atrium columns stop against original **solid** roof outside the 16m skylight; gallery posts terminate at the existing original 5.19m soffit underside. Every standing shaft has a matching gameplay AABB collider and physical line-of-sight blocking; decorative overhead capitals never become walk-level blockers.

The authentic original shop openings remain **4.2 m**, the central dry fountain's stone rim has a measured >1m buffer around each post, and the long originally authored x=−20 and x=20 shopping spines are untouched. LS−01 (x7,z−66), LS−02 (x7,z−94), all nine evidence anchors, 41 rooms, six chapter spawns, real stairs/lift/exits, V117 locked check-in and original fire door remain unmodified.

## Integration

- `mall/gallery-columns-v118.mjs` holds the immutable grid, physical height and collision dimensions, source geometry / entrance validation.
- `mall/physical-shell-v67.mjs` registers these posts in the shared real 3-floor structure, validates no source overlap and lets narrow sightlines meet actual columns.
- `mall/render-gallery-columns-v118.js` mounts shaft/plinth/cap geometry into the shared original THREE scene, using **existing repository-local textures**.
- `mall/gameplay-layout-v70.mjs` adds true plinth collision with source-measured extents while keeping the nine anchor and shop routes intact.
- Review-only 3D cameras and full desktop screenshot CI expose the western/eastern colonnades, actual fountain sightlines and entire aerial. No synthetic architecture screenshot as proof.

## Release / unfinished work

This is **structural circulation rhythm**, not a claim that mall interior furnishing is finished. Next tasks: source-based wayfinding/directory fixtures, detailed 1997 retail staging and coherent food-court/employee areas. No user-owned Builder saved changes are published, and the local CC0 repository manifest is not modified. Do not merge this stacked draft until V117 [PR #122](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/122) is fully validated and merged, and V118 has fresh all-green final-head checks plus original actual WebGL screenshots reviewed for junctions, floor clearance, evidence and natural scale.

Architecture issue: [#119](https://github.com/maloysius-wq/the-attendant-pinewood-mall/issues/119).
