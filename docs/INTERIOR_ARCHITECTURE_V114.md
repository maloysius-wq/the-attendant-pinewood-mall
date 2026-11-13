# The Attendant: Pinewood Mall: V114 architectural repair

## Scope and source of truth

The 41-room V66 masterplan, V67 physical generator, V69 furnishings, V70 walkable
routes and V111 published/private Builder composition remain canonical.
This first structural phase addresses *actual* source geometry, not decorative
filler. The cinematic and the live game still use the identical shared world.

## Interactive plan inspection

The new read-only `review/mall-architecture-v114/` page renders exact room
rectangles, walk-through portal lines, color-coded unallocated floor, original
outer footprints and per-room furnishing counts for G/B1/M1. It reads
`MALL` and the geometry audit, without touching the user's browser Builder.
GitHub Actions captures three complete review PNGs with zero remote assets.

## Confirmed architectural defects and exact corrections

1. **Partial-height door holes were full-height voids.** The door-plan describes
   a 2.5 m staff or 3.6 m retail opening, but the wall generator previously cut
   the full room-height wall. Ordinary doorways now get a solid wall lintel from
   the recorded portal height to the upper adjacent physical wall elevation.
   These overhead wall sections render with the shell and are visible to Builder
   finish planning but are correctly ignored by 2D navigation, physical walking
   colliders and LOS. Fully open gallery connections remain open.
   The exceptional original 1.78 x 2.27 m V113 CC0 hinged vestibule door has
   its *own measured* header and must never receive a duplicate V114 header.
2. **Overlapping mezzanine floor.** `m1_stair` formerly overlapped `eli_chase`
   by 26 square metres in M1, producing duplicate co-planar physical carpet
   slabs. The chase's west wall now begins at x=56 instead of x=54, flush with
   the stair landing, while evidence, mission anchors, doors and chapter starts
   remain in their original rooms.
3. **Open-topped restricted rooms.** Basement and M1 office/control rooms
   lacked actual ceiling undersides; several M1 spaces used roof objects in
   place of reachable office ceilings. Install measured room ceilings that
   respect elevator/fire-stair voids, exclude the open mezzanine overlook and
   have zero overlapping projected faces. Remove the redundant M1 roof slabs.

## Source-measured land-cover audit

| Level | Footprint m² | Assigned m² | Unallocated m² | Confirmed overlap m² |
|---|---:|---:|---:|---:|
| Ground (G) | 12,183 | 9,385.5 | 2,797.5 | 0 |
| Basement (B1) | 4,128 | 2,658 | 1,470 | 60 (intentional corridor crossing) |
| Administrative (M1) | 3,298 | 1,859 | 1,439 | 0 (fixed from 26) |

Values are derived from the union of exact axis-aligned rooms inside each
footprint via `auditArchitecturalCoverageV114`; the audit retains source
rectangles for uncovered regions. “Unallocated” does **not** imply missing
floor or automatically authorize wall and floor removal. Filling these areas
without designing actual tenant/service boundaries could break routes and
destroy existing Builder work.

## Next stages (not silently implemented by V114)

- **V115: real storefronts and public circulation.** Subdivide unused ground
  floor into historically plausible lockable retail bays, service rooms and
  public amenities with front glass, thresholds, frames, grilles, sign bands,
  vestibules and distinct storefronts. Preserve the fountain, atrium skylight
  and owner-approved private Builder data.
- **V116: credible operational zones.** Re-plan the oversized 9 x 71 m employee
  spine, 17 x 14 m security office, 20 x 11 m training room, 91 x 8 m mezzanine
  corridor, and basement mechanical plant with usable maintenance clearances.
- **V117–V118: source-licensed furnishing, lighting, patina, signage.** No
  procedural approximations of required real assets. Stage by room and validate
  visual context, not random prop scattering.
- **V119: full desktop WebGL and six-chapter walkthrough regressions.** Assert
  accessible objective routes, physical door handoffs, no floating or
  overlapping surfaces, evidence, original local asset provenance and no
  off-origin network requests.

## No-regression requirements

- V113 source-pinned hinged inner door and precise Chapter 1 end-of-film pose
  `(12.5, 1.7, -32.75)`, yaw/pitch `(0, 0)` remain unchanged.
- Retain all six chapters, real freight and stair transitions, public boarded
  front facade and Chapter 6 employee exit.
- No edits to the browser's `pinewood-builder-v1` / `pinewood-v69` save format.
  Only owner-reviewed `Export for Publishing` JSON can populate the currently
  empty public furnishing publication.
- Do not merge a structural redesign on code inspection alone: run the
  automated source tests **and** deterministic real desktop Chromium/WebGL
  captures and review the output first.
