# V127a: original back-of-house staff and service suites

This is the first physically implemented V127 pass on the **actual canonical
mall source**, shared between Builder, film and playable chapters. It does not
publish the private owner Builder draft or replace a room with a fake mockup.

Five real rooms gain new physically blocking, source-wall-attached partitions,
1997-era internal signs, closed steel shutters or a passable 2.4-metre kitchen
door, and actual already-vendored CC0 full-size closed-door cabinets.

| Original room | Service subcell coordinates (metres) | Area | Access |
|---|---|---:|---|
| north_service | x 7.5 to 11; z -118 to -112 | 21 m² | Locked maintenance supplies |
| security | x 44 to 46; z -115 to -101 | 28 m² | Locked CCTV tape storage |
| training_t04 | x 79.5 to 85; z -108 to -97 | 60.5 m² | Closed training AV storage |
| break_room | x 80.5 to 85; z -97 to -87 | 45 m² | Open staff kitchen doorway |
| staff_lockers | x 82 to 85; z -87 to -75 | 36 m² | Locked issued-uniform stock |

The new suites represent **190.5 m² of already-assigned staff space**.
They do not reduce V116's independently audited **520 m² unassigned ground
footprint**. The latter mainly occupies perimeter relief and seam strips, plus
notable pockets of 85 m² at x -46..-29, z -48..-43; 51 m² at
x 29..46, z -118..-115; and 41 m² at x 7..9, z -43..-22.5.
Do not build across those without resolving the front closure and east freight
routes with the source model.

Each partition uses the original room's existing three outside walls. Only
one true new interior dividing wall is created, to the measured existing
3.45-metre service soffit. The partition's 2.64-metre door head is real
overhead geometry and does not turn into a floor-level collider. The four
locked doorways have real full-height collision walls. Every original CC0
cabinet is included in the shared 3D asset preload, and the open kitchen
cabinet additionally blocks the same physical game navigation.

Safeguards: original 41 room IDs, all nine LS evidence anchors, six chapter
spawns, security CCTV consoles, breaker C, training notes, staff locker
evidence, V113 original real E fire door and Chapter 1 exact cinematic
pose, real stair/freight routes, seven public glass entrances, and private
owner-only Builder draft are untouched.

The V127 source and real-desktop verification live in
scripts/test-staff-service-v127.mjs and
scripts/smoke-staff-service-v127.mjs, with a focused GitHub Actions workflow
at .github/workflows/staff-service-v127.yml. Six new source-measured
inspection cameras plus an aerial view are available in the original
review/mall-construction-v67 inspection page. No mobile or manual WASD tests
are permitted by AGENTS.md.

This is **not the complete V127 stage**. Next: original Annex staff-spine
proportion and circulation pass, additional source-licensed employee fittings,
source-level lighting/finishes, remaining frontage quality and accurate
unassigned-floor disposition. Do not call the whole east Annex complete.
