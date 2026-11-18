# V128: Northstar Home, the authentic East Annex anchor

V128 works in the **original canonical** `annex_anchor` room at
`x 65..85, z -75..-48`, exactly **540 m²**. This is the source shared by
gameplay, the construction reviewer, the opening continuum and Builder.
No copy of the mall, arbitrary fill slab, private Builder publish, or new
story room is created.

## Genuine 1997-era homewares store

The 1992 Annex's east anchor reads as **Northstar Home**, a fictional home
and gifts department abandoned after its final 1997 operating shift.
A genuine **540 m² carpet-to-resilient-tile slab replacement** is cut from the original Annex floor at y=0, with the already vendored local floor material. There is no overlapping carpet layer, no new footprint or playable space, and the adjoining V127b 639 m² staff tile is untouched.

Twenty-four independently pinned *existing* CC0 GLB fixtures from the
already audited local V121 retail collection and the pre-vendored Kenney
KSI counter occupy a legible retail plan: 17 real wall bays and rails,
four genuine full-size nesting display tables, two licensed spinner racks
and one original solid cashier. Model positions, measured scale and full
footprints share genuine gameplay colliders; additional original
merchandise is not represented as a procedural substitute for furniture.

**176 small original authored home-merchandise pieces** fill the genuine
source shelf/table/spinner supports as period fictional boxed goods and
clearance accessories, using actual support heights. Uniquely drawn,
weathered 1997 shelf category plates, five original fictional
masonry-mounted sales posters and an original **Northstar Home** east-wall
interior identity sign make the room recognizable without using real
commercial homeware logos or third-party downloaded print artwork.
Materials age cloned source meshes, never the vendored original binaries.

Eight actual SHA-pinned CC0 ceiling fluorescent GLBs are mounted to the
**real 7.61 m Annex retail soffit**, not floating at a guessed eye level.
Two are failed, six dim or partly working. The real source lenses emit
the light. No off-origin runtime assets.

## Original doors and mandatory route

The 4.2 m **west** staff-corridor portal at `x=65,z=-61.5` and
4.2 m **north** former-anchor/east-exit vestibule portal at
`z=-48,x=75` remain physically open in the original chapter state.
A protected elbow route from `(65,-61.5)` to `(75,-61.5)`, then to
`(75,-48)`, remains free of every new fixture, with full collider
margins. The final outside employee exit at `(86,-42)` remains gated
until the original Chapter 6 release. V113 contractor E door, all six
spawns, LS-01..LS-09, 41 rooms, staff locker LS-06, T-04, all original
Annex service doors, v127 cabinets and the unpublished owner Builder
draft are untouched.

## The 520 m² original-floor remainder

`mall/residual-footprint-audit-v128.mjs` performs an exact, read-only
coordinate intersection survey of all G-level source footprints, 41
rooms and V116's 13 closed bays, with independent cuts in both axes.

The original remainder is **still 520 m²** and cannot be declared
"fixed" by furnishing a room already included in the canonical plan.

| Original unassigned pocket | Bounds in metres | Area | Blocking hazard |
|---|---|---:|---|
| NW facade relief | x -46..-29, z -48..-43 | 85 m² | Historic Fallow's northern masonry and facade |
| East rear relief | x 29..46, z -118..-115 | 51 m² | Security, rear service dock and north stair |
| Original front entry seam | x 7..9, z -43..-22.5 | 41 m² | Boarded public lobby, v113 contractor entry |
| Other surveyed relief and seams | precise grid cells in audit | 343 m² | Perimeter geometry / doors need individual review |

No new dividing walls or sealed floor claims were added for this
remainder. Next stage must resolve door elevations, wall support,
original front cladding and detailed occupancy before safe closure.

## Verification and release gates

The source `scripts/test-annex-anchor-v128.mjs` checks SHA256 bytes
of every added CC0 GLB, true GLB room bounds, two original portals,
shop aisle and Chapter 6 egress, evidence and chapter spawns,
ceiling elevation, no coplanar carpet or tile overlay, and independent original
520 m² accounting.

`scripts/smoke-annex-anchor-v128.mjs` runs the **actual** complete
original scene in desktop Chromium at **1440×900**, capturing seven
genuine WebGL views including shop entry, browsing, merchandise,
real exit, cutaway, genuine dark-night ceiling lighting and aerial.
Only validated source renders may be described as visually inspected;
the workflow must pass on its final exact commit and its screenshot
artifacts must be examined before merge. Keep GitHub Pages status
separate from PR status and do not run mobile or manual WASD.

**Architecture Issue #119 remains open**: broader Northstar details,
the rest of the Annex and all remaining original relief/seam
geometry still need future work. This is a substantial original
tenant-dressing stage, not a claim that the entire mall is finished.
