# V132: Original 1979 contractor-front entry seam, measured before construction

This phase advances original architecture Issue #119 without making any new wall, opening, room, floor, collision, renderer, Builder draft or cinematic changes. The 41m² original front interstice at x7..9,z−43..−22.5 lies exactly **between the boarded public lobby (west) and the contractor service vestibule (east)**. V131 already reduced the original unassigned footprint from 435m² to 372m²; this read-only survey changes none of that accounting.

## Original source and risk

- The source footprint is **2m × 20.5m = 41m²**, and all 41m² are present in the immutable V128 unassigned grid. Only the source survey can authorize further changes.
- The original y=0 floor already exists as one continuous slab. The 1979 weather roof covers the full region at y=12.8m, but there is **no dedicated 3.45m interior plaster ceiling** above this unassigned strip. Do not pass off the exterior roof as a service-room soffit.
- The **west x7** source face borders the boarded lobby, and **east x9** borders the contractor vestibule; they already have original 3.55m interior masonry. The **north/front z−22.5** is already an original 12.8m high masonry exterior, not an unbuilt entrance.
- The **south/atrium junction z−43** has a **2m absent partition interval x7..9**, immediately alongside the true **V113 hinged E fire-door** plane. This is a gap in source wall coverage, NOT authorization to put a wall there.
- The real hinged inner source portal spans approximately **x9.1..10.9 at z−43**, leaving only about **0.1m nominal X gap** from the 41m² interstice's east edge x9. Source masonry thickness, actual V113 GLB hinge sweep and moving-door collision could encroach on the portal if a naive 2m closing wall were built. Maintain the original 1.8m doorway and anti-trap logic.
- The actual contractor external door is at x12,z−22.5. The original film ends at **(12.5,1.7,−32.75)** facing yaw/pitch 0. The V117 check-in/maintenance narrowing is around x11.05..13.65. Keep all 41 named rooms, nine LS anchors and six full-story routes unchanged.
- The public boarded door remains at x−10.5,z−22.5; the real Chapter 6 employee exit remains chapter gated at x86. The B1 fire-stair cutout is unaffected.

## Reproducible executable survey

The new source module in mall/original-front-seam-survey-v132.mjs reads the current canonical constructPhysicalShell G ground, the original V128/V129/V131 residual accounting and the actual licensed inner-door portal; it does not build any geometry. It reports exact original side-wall coverage and absent intervals, old floor, true exterior weather roof, original ceiling presence/absence, source doorway overlaps, contractor door and cinematic eye proximity, Chapter 6 exit gate and protected checkpoint widths. It returns **constructionApproved:false** until a physically justified arrangement is proven.

For reference, the arithmetic would leave **331m² outside the surveyed front strip** if all 41m² could eventually be structurally resolved, but **372m² is still the real outstanding source remainder**. No floor area is counted as completed in this V132 audit.

Use scripts/test-original-front-seam-v132.mjs to validate exact source geometry, real front exterior, absent 2m rear wall span, original hinged doorway hazard and all six gameplay chapter routes. The scoped Actions workflow also runs the existing V112/V117, physical shell, rear closure and local licensed-assets checks. No manual WASD or mobile tests. A later real construction PR requires exact original-source 1440×900 desktop WebGL screenshots independently examined before merge, including the actual hinged door and boarded entrance. Do NOT change V113 just to make this seam easier to close.

Architecture Issue #119 stays OPEN.
