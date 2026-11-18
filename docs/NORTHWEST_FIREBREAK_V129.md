# V129: Source-aligned 1979 Fallow's northwest firebreak

This pass advances original-building [Issue #119](https://github.com/maloysius-wq/the-attendant-pinewood-mall/issues/119) with **one physically supported permanent closure of 85m²** and an explicit audit of **435m² still not physically resolved**. The original 41 rooms, nine story anchors, six chapter levels, real 1979/1992 shopfronts, V113 hinged inner vestibule entry, V127b Annex circulation, V128 Northstar Home and unpublished owner-only Builder draft are unchanged.

## What exists in the canonical mall

The original 1979 floor plan has an otherwise unassigned **17m × 5m** strip at **x−46..−29, z−48..−43**:
- Immediately south (z−48) is the full-height original Fallow's retail shop wall and 5.21m authentic soffit. This original wall remains completely unchanged.
- Immediately north (z−43) is the original V116 **closed Fallow's northern reserve** with an existing 3.45m masonry wall. This original wall is reused, not doubled.
- The only missing partitions are the two **5m-long source masonry end faces**, at **x−46** (back of store) and **x−29** (west gallery side). Both receive genuine 3.45m tall walls with the original V116 source material. There is **no doorway or invented access portal**.
- A **17m × 5m original plaster soffit** is attached at **3.36m underside**, matching the closed 3.45m store-support ceiling level (y=3.45, thickness .18). This is true geometry in the **same shared original game/construction/Builder** source and hides no extra second floor.
- The original same-y=0 floor is **preserved unchanged**, with exactly one ground slab and zero coplanar overlays.
- An originally authored worn 1997 North Stock Transfer plate is physically fixed to the **actual newly built x−29 masonry**, rather than suspended in front of a nonexistent wall. It does not substitute for a licensed furniture model. No new third-party artwork, remote asset, gameplay barrier or fake sample scene was added.

Source: `mall/residual-firebreak-plan-v129.mjs`, integrated into `mall/physical-shell-v67.mjs`, with original 3D printing in `mall/render-residual-firebreak-v129.js` and scene integration in `mall/render-shell-v67.js`.

## What stays untouched

The **520m² V128 baseline survey** (`auditOriginalRemainderV128()`) remains immutable and reproducible. Its effective status after V129 is:

| Original residual | Area |
|---|---:|
| Original V128 unassigned, before this stage | 520m² |
| New physically closed northwest Fallow's firebreak | −85m² |
| **Unresolved after real V129 construction** | **435m²** |

Of the 435m², **51m²** is the rear east service relief (x29..46,z−118..−115); this **intersects 1.5m² of the real x30.5..33.5 fire stair shaft**, so sealing it without subtraction or physical staircase review would be invalid. **41m²** is the original front-entry/contractor approach seam x7..9,z−43..−22.5: untouched due to the V113 hinged-door opening and front lobby. The other **343m²** remains in the exact audited outer perimeter relief strips and smaller service seams. Those original floor strips include structural envelope clearance and are not automatically rentable rooms; do not fill with invented commercial tenants or visual paint.

The new firebreak does NOT touch, reroute or add an exit:
- Original west public gallery x−29..−11 stays connected to Fallow's real **4.2m glazed shopfront** at z≈−60.5.
- All chapter entrances and later east employee exit still use the actual original door graph.
- No 42nd story room, bogus LS marker, surprise staff door, new Builder draft publication or fantasy shaft floor.
- The original 638 publicly licensed models are unmodified. No new vendor asset is required.

## Validation and desktop review

`scripts/test-residual-firebreak-v129.mjs` checks actual source walls rather than unrelated review placeholders: **exactly two** new partition faces, reuse of existing 1979/V116 north and south partitions with zero duplicate wall volumes, a single non-overlapping original ceiling, source y=0 floor coverage, no new canonical room and no doorway obstruction. It tests the **real 1.5m² east-rear/stair conflict**, exact 85/435 accounting, all nine LS anchors and all six original gameplay spawns, plus route to Fallow's through the V113 entrance and final Chapter 6 employee exit.

The focused `scripts/smoke-residual-firebreak-v129.mjs` captures **five real full-source WebGL desktop Chromium views** at 1440×900 (two new north-facade angles, roof-off exact footprint plan, neighboring shutter area, unchanged original service entry). The snapshots and tests must pass on the exact final PR head and **actual screenshot pixels should be personally inspected** before merge. Always distinguish completed Pages build from successful PR CI; no mobile or manual WASD tests.

The large original architecture Issue #119 **remains open** for the remaining 435m² and unfinished tenant detail. Only geometrically defensible sections should be closed in subsequent revisions.
