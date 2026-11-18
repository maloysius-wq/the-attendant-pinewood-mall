# V130: Measured original east-rear service envelope (survey only)

Continues original [architecture Issue #119](https://github.com/maloysius-wq/the-attendant-pinewood-mall/issues/119) after V129 source-sealed the genuine 85m² northwest Fallow's firebreak. **This is an executable original-source survey, not a new room or a rendering pass.**

## Why the earlier 51m² rectangle is not a buildable enclosure

The preliminary V128 residual pocket is x29..46, z−118..−115 (**51m²**). That rectangle does **not** reach the actual 1979 exterior walls:

- The original rear source wall stands at **z−118.5**, rather than z−118.
- The original east source wall stands at **x47**, rather than x46.
- Extending only to those actual original elevations gives an **18m × 3.5m = 63m²** rear envelope, not 51m². The extra **12m²** is part of the previously listed other perimeter relief; it must not disappear from the accounting.
- The actual **north fire stair opening** x30.5..33.5,z−115.5..−108 intersects this 63m² region by **1.5m²**. It is a real missing floor panel through which the B1→Security stairs ascend (chapter 3), NOT a patchable drafting oversight.
- Therefore only **61.5m² of real original y=0 floor** lies in the scoped 63m² footprint. A footprint-area audit and a real floor-surface audit measure different things.

## What source code measures

The new read-only \`mall/original-rear-survey-v130.mjs\` interrogates the **current canonical physical shell**, not a conceptual diagram:

1. Recomputes the immutable V128 footprint survey (520m²), V129 effective unassigned footprint (435m²), the 51m² preliminary pocket and additional real exterior-relief 12m².
2. Intersects the true source ground-floor floor plates and measured north-stair hole. It records source roof coverage separately from room-interior ceiling coverage: **the 12.8m original weather roof cannot be represented as a 3.45m enclosed-service soffit.**
3. Reports whether source masonry is already present on each of the four true enclosure boundaries, showing *specific unbuilt spans* instead of blindly adding a continuous partition.
4. Confirms the B1-to-Security physical staircase, original portals, six chapter spawn routes, Chapter 6 employee exit and original 41 rooms/nine evidence placements.
5. Explicitly returns \`constructionApproved:false\`. It **does not** change the gameplay collider grid, physical shell, renderer, Builder draft, local models, scene cameras, walls or roof.

## Gate for actual construction in a later revision

Before changing the physical building, design wall details from the measured absent source intervals, preserve the 1.5m² open shaft and full 3D stairwell clearance, build a real attached service ceiling that cannot cap the stair, and verify exact floor ownership, dock access and original freight route. The only permissible visual proof for that subsequent built change is actual desktop 1440×900 original-shared-source Chromium WebGL screenshots, personally inspected alongside source/collision and asset tests. No mobile or manual WASD.

Do not subtract the 63m² survey envelope from V129's **435m²**. No new floor has been assigned by V130, so the physical remainder and open Issue #119 are unchanged.

Run the focused verification with \`node --test scripts/test-original-rear-survey-v130.mjs\` or inspect the exact-head GitHub Actions workflow \`.github/workflows/original-rear-survey-v130.yml\`.
