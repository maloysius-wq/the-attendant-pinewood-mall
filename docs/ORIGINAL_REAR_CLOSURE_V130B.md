# V130b: Original east rear service-source closure and intact fire stair

Continues open architecture Issue #119. V130 measured the REAL original east rear boundary x29..47, z−118.5..−115, a 63m² envelope. The earlier 51m² x29..46,z−118..−115 rectangle was just a preliminary cut, short of the genuine 1979 exterior. This stage adds physically supported source architecture to the canonical game/Builder/review shell, not a presentation stand-in.

## Exactly what changed

The existing G-level 1979 exterior at z=−118.5 and x=47 is reused in place; the original freight lobby x=29,z−118..−110 wall and Security/CCTV z=−115,x29..46 wall are also untouched. The only truly absent ground-height spans receive common-source concrete wall geometry:

1. Freight west return at x29, z−118.5..−118, y0..3.55 (0.5m long).
2. Security south return at z−115, x46..47, y0..3.55 (1m long).

The entire 63m² envelope keeps its existing original y=0 slab, including the REAL B1 north-fire-stair x30.5..33.5,z−115.5..−108 opening. That hole cuts 1.5m² from the service envelope: actual floor/ceiling coverage is 61.5m², not a fictional 63m² solid plate. Three source-authored 3.45m nominal plaster soffit segments (3.36m bottom, 0.18m thick) follow the original slab cut exactly, with zero ceiling panel over the 1.5m² shaft aperture. The original 12.8m weather roof and original staircase remain as before.

The enclosure is permanently closed service relief, not a 42nd named room, a fictional tenant, an entrance, or a relocated stair. It introduces no new models or runtime assets and no duplicated wall or floor. All six chapters, nine evidence anchors, real V113 hinged inner E door and precise Chapter 1 film endpoint, Chapter 3 B1→Security stair, 13 V116 closed bays, V127 staff fittings, V128 Northstar routes and Chapter 6 east employee exit remain unchanged. Owner's private unpublished Builder draft stays private.

## Honest residual accounting

| Measurement | Area |
|---|---:|
| Original V128 pre-V129 unassigned footprint | 520m² |
| V129 physically sealed Fallow's northwest | 85m² |
| V129 effective residual footprint | **435m²** |
| V130b rear source envelope | 63m² |
| New real enclosed floor / plaster soffit | **61.5m²** |
| Pre-existing B1 fire-stair opening deliberately still open | **1.5m²** |
| Other unassigned original/perimeter ground outside rear envelope | **372m²** |
| Old residual minus actual newly enclosed floor (includes the protected shaft) | **373.5m²** |

The 1.5m² is physically a deliberate stair void, not walkable floor or something to fill. Report 372m² of other unassigned ground plus 1.5m² protected fire-stair cutout, rather than claiming another 63m² of finished rooms. Original V128 and V129 accounting remains reproducible. V130 original pre-build survey diagnostics explicitly exclude V130b's later walls/ceiling so prior measurements stay consistent.

## Source implementation and release gates

The new real construction plan is mall/rear-firebreak-plan-v130b.mjs, integrated into mall/physical-shell-v67.mjs with automatic real source rendering in mall/render-shell-v67.js. Three new source-only survey cameras are in review/mall-construction-v67/. The dedicated tests scripts/test-rear-firebreak-v130b.mjs check all six chapter spawns, Chapter 6 exit, actual shaft, hinged-entry route, original masonry, exactly two short wall returns, three nonoverlapping soffits and no new floor. The focused scripts/smoke-rear-firebreak-v130b.mjs captures six genuine desktop 1440×900 original WebGL views with no remote requests. The .github/workflows/rear-firebreak-v130b.yml workflow runs source geometry, asset and rendered checks. **Inspect exact final-head screenshots before merging**; verify merged GitHub Pages deployment separately.

Continue Issue #119 with the original contractor front entrance 41m² seam and measured other perimeter relief. Do not block the V113 film pose, invent a second floor, or close a source opening based on a rectangle alone. No mobile tests or manual WASD.
