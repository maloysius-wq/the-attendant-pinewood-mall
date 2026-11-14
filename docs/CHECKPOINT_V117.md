# V117: Source-measured after-hours contractor service checkpoint

## Why this architectural change exists

The original `service_vestibule` in `mall/masterplan-v66.mjs` is a **7 × 20.5 m** empty rectangle at **x=9…16, z=−43…−22.5**. The scripted 1997 contractor entry, existing fluorescent fixture, single real metal inner fire door, and final film pose all occupy that coordinate frame. Replacing the entire room or shifting the authored route would break the opening, the closed door and potentially several chapters.

V117 does **not** change the canonical room ID or its measured extents. It installs two non-narrative closed utility/security cells against the *existing* room side walls, creating an authentic narrower after-hours approach with a widening near the inner door.

## Exact ground-floor plan (metres)

| Fixed physical element | Bounds / measurement | Access |
| --- | --- | --- |
| West electrical/maintenance riser | x=9…11.05, z=−36.5…−25.4, 22.755 m² | Permanently sealed; no new story door |
| East security check-in office | x=13.65…16, z=−36.5…−25.4, 26.085 m² | Permanently sealed; no new story door |
| Contractor pedestrian spine | x=11.05…13.65, z=−36.5…−25.4 | 2.6 m clear before wall thickness; two-meter-plus practical passage |
| Real observation window | x=13.65, z=−33.25…−29, sill y=1.03, pane to y=2.36, solid overhead to y=3.45 | Transparent but collision-active |
| Side-room acoustic drop ceilings | y=3.22, thickness=0.16 | Fixed; distinct from original y=3.45 vestibule ceiling |
| Front landing | z=−22.5…−25.4 | Original external door x=12 remains open |
| Widening turn | z=−36.5…−43 | Clear toward original x=10 inner hinged door |

The new solid side partitions terminate in the actual original room edges. **Do not build duplicate x=9 / x=16 walls.** The east office has an actual masonry void at the observation pane rather than a transparent overlay on an opaque wall. Original 3D local materials are retained, and the new metal window trims and enamel notices mount on the actual source-aligned solids.

**Protected film / player eye:** (12.5, 1.7, −32.75), yaw/pitch=(0,0), unchanged. Sightline and walking turn go through x≈12 at z−38 toward x10 at z−40.8, ending at the original V113 authored x10,z−43 licensed fire door. No fake duplicate doors or interaction changes are introduced.

## What this changes and what it deliberately does not

- `mall/vestibule-checkpoint-v117.mjs`: two immutable subordinate service cells, structural wall segments, physically blocking source-glass window, dropped ceiling plan, and source geometry validation
- `mall/physical-shell-v67.mjs`: integrates new walls and lowered ceilings into canonical world shared by **Builder, cinematic and gameplay**, with real physical collision
- `mall/render-vestibule-checkpoint-v117.js`: fixed metal glazing frame, wall-attached notices, and kick trims, not editable player props
- `mall/render-shell-v67.js`: appropriate glass/paint materials plus source-matched trim mounted before first scene frame
- `mall/gameplay-layout-v70.mjs`: filters only overhead masonry from 2D navigation, retains the physical glass as a blocker
- `review/mall-construction-v67/`: deterministic fixed inspection cameras for service office, corridor and inner-door turn
- `scripts/test-vestibule-checkpoint-v117.mjs`, `scripts/smoke-vestibule-checkpoint-v117.mjs`: real desktop source + browser tests, screenshots, and no off-origin requests.

This is the **first contractor-vestibule architectural slice**, not a complete shop dressing pass or finished mall. The east check-in has the already-pinned, repository-local original CC0 desk and chair models, scaled and positioned inside its actual physical enclosure (not newly generated substitutes). Further wiring, wall-mounted instruments, naturally aged fixtures and equipment must be handled in a later focused pass with the same source-licensing and visual-review discipline. No arbitrary duplicate window mesh is placed in front of a full-height opaque original wall.

The original 41 story rooms, nine evidence anchors, six chapters, authored portals, local 638-model catalog, unmodified Builder v1 IndexedDB data/owner-only preview, intentionally unpublished private layout, source assets, gameplay saves, exterior keypad and cinematic timing must remain unchanged.

## Review gate

Do not merge until the V117 source and **real desktop Chromium/WebGL** workflow passes at its final head, all relevant inherited V111 Builder / V113 door / V115 and V116 structural checks pass, actual screenshot artifacts are reviewed, and the public Pages deployment is verified after merge. There is no manual WASD or mobile testing in this slice.
