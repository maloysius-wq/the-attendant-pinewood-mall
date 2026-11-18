# V133: Original 1979 front seam, truly closed without changing the V113 door

Continues Issue #119 following V132's independent measured source survey. The original x7..9, z−43..−22.5 boarded-lobby/contractor interstice is **41m² of existing old ground floor**, bordered by genuine existing masonry at x7, x9 and original z−22.5 exterior. It was missing a short atrium-facing south face at z−43 and a genuine original interior underside. **No extra story room, player corridor, floor, remote model, scripted teleport, private Builder placement or facade mask was added.**

## Licensed original V113 hinge and physical source wall

The existing source V113 door is the **pinned original local CC0 liminal doorway asset**, with three separately moving leaf/wood/handle meshes and two fixed frame/hinge meshes. The exact first playable film eye is (12.5,1.7,−32.75); real inner portal is z−43, x9.1..10.9, 1.8m wide; source leaf is 1.78m with pivot x9.11,z−42.988 and animated positive Y yaw 0..0.53π (95.4°). The original game inflates wall collider thickness by 0.06m and adds 0.025m to line endpoints.

V133 adds a *single actual source concrete rear wall* z−43 from x7 to **x8.91**, 3.55m tall and .24m thick. It stops **0.19m before the genuine portal edge**, preserves door-frame and metal-handle clearance, and physically overlaps 0.03m of the authentic existing x9 vestibule wall thickness (which extends to x8.88). This joins the real old masonry instead of leaving a visible gap or moving the authentic hinge. A blind x7..9 wall would intersect the actual door's conservative full-sweep gameplay-inflated footprint.

A new single source-built 41m² interior plaster underside (y3.45, underside3.36, thickness0.18) spans the already-existing **one** original y=0 floor. The original 12.8m weather roof is untouched. The east-west 2m width is structurally spanned by original x7 and x9 walls; front is attached to authentic z−22.5 exterior, rear to new source masonry. The unoccupied strip is not open to player traversal.

## Source gates

- scripts/audit-v113-door-sweep-v133.mjs reads the **actual local GLB JSON** and normalized quantized accessor bounds of its three moving meshes. It reproduces the exact V113 source fit, world hinge pivot, full 0..95.4° arc and physical/gameplay-inflated wall rectangle. Conservative collision checks use 2D polygon SAT and Z-clipped source mesh bounds. Test must prove the naive x9 endcap collides but the x8.91 endcap has zero source collisions and a real clearance margin.
- mall/front-service-closure-v133.mjs defines the one source concrete wall, one authentic plaster panel, old wall/roof/floor host constraints and a validation guard for all six chapters. mall/physical-shell-v67.mjs installs it in the one shared gameplay/Builder/review source. Existing original V132 measurements remain reproducible with the new geometry excluded from historical audit.
- scripts/test-front-service-closure-v133.mjs verifies original 41 rooms, nine LS anchors, actual Chapter 1 cinematic handoff, E portal, V117 route, six chapters, original stair and final exit, old floors and source material. Older release gates and pinned CC0 asset provenance remain mandatory.
- The dedicated six-shot 1440×900 desktop Chromium source WebGL test scripts/smoke-front-service-v133.mjs captures actual original front closure, roof-off, door approach and untouched check-in, boarded lobby and pre-existing contractor turnaround. **Inspect the final PR head's actual PNG pixels before merge.** Preserve original V113 real-door E open/close and anti-trap automation.

## Issue #119 residual bookkeeping

Immutable V128 original unassigned 520m² minus V129's northwest 85m², V131 east rear 63m² and **V133 physically closed original front 41m²** gives **331m²**, but this only becomes final once source and desktop release tests pass and this PR is merged. Do not silently count the new wall before then.

The 331m² comprises a concentrated original west-rear service gap and several narrow exterior perimeter setbacks. Survey the west-rear gap and separately verify the genuine physical enclosure of each intentional non-playable facade/roof relief. Do not treat decorative zero-area masks as construction and do not create rooms solely to drive an audit number to zero. #119 stays open until the residual ledger and visual architecture definition of done are met.

No mobile/manual WASD, no publishing the private Builder draft.
