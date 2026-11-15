# V121 | Authentic original 1979 department-store anchor fittings

**Purpose:** The two largest original named retail anchors still looked like cavernous, empty hallways in real V118–V120 screenshots. The source original two rooms have never been revised:

| Source room | Exact canonical bounds | Narrative protections | Existing V69 fittings |
| --- | --- | --- | --- |
| Fallow's Department Store / `west_anchor` | x−46…−29, z−73…−48 (425m²) | Original west gallery 4.2m glass front x−29, all chapter access | Existing pinned display cabinet (−43,−54) and cash register counter (−43,−68) |
| East Original Department Store / `east_original_anchor` | x29…46, z−61…−43 (306m²) | Original east gallery x29 retail entry, worker access and source story IDs | Two source-licensed open racks at (43,−47.5) and (43,−58) |

## Critical mandatory genuine GLB audition

Before choosing placement, `mall/anchor-retail-source-v121.mjs` pinned **six original CC0 models** already in the canonical 482-member licensed Builder catalog. Node tests independently read every GLB's local bytes and compare the SHA256 digest to that catalog. `review/retail-assets-v121/` loads all six actual GLBs in Chromium/Three.js, positions them on a survey-only floor at realistic height and exposes full source-measured 3D widths/depths. Seven genuine WebGL screenshots and JSON were captured in [original candidate preview workflow #43735914542](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/43735914542), which passed before source layouts were added.

| Candidate | Actual measured width × height × depth | Decision |
| --- | --- | --- |
| Nesting display table (large) | 1.520 × 0.950 × 1.013m | Use in Fallow's |
| Nesting display table (medium) | 1.367 × 0.950 × 0.936m | Use in east original anchor |
| Wall retail bay rail/shelf | 1.176 × 2.120 × 0.348m | Use along each original side wall |
| Accessory spinner rack | 0.682 × 1.650 × 0.682m | Use at outer display corners, NOT in center walkway |
| Weathered apparel waterfall | 0.459 × 1.780 × 1.035m | Use along secondary perimeter |
| **Feature display podium** | **7.317 × 1.150 × 4.704m** | **Reject.** Scaling it to believable human height produces a giant arena prop. It was previewed but is explicitly forbidden in finished source placement |

Measurements come from actual rendered GLTF bounds after uniform scaling to human target height, not JSON catalog thumbnails.

## Actual in-world store plan

`mall/anchor-layout-v121.mjs` authors exactly twelve full-size store display fixtures, six in each unchanged source room, all from **already vetted** pinned models. Fallow's has two period wall shelves, two central table displays, one haberdashery spinner and a clothing rail. The east original anchor has two wall bays, two shorter nesting retail display tables, a spinner on the rear-side axis and a weathered apparel stand. In both stores the original centerline from the actual glass entry to the original real V69 store fittings is preserved as a wide unbroken shopping aisle; original cash register and shelves remain in their exact positions.

Every fixture is independent, physically grounded at y=0, and rejects any clone whose *actual rotated and scaled* bounding box would exceed the planned collision radius. All GLBs load from already-pinned repository-local paths, with no new third-party URLs. The new `mall/render-anchor-retail-v121.js` attaches complete models to the **shared original source scene** used by Builder, opening cinematic and game. `mall/physical-shell-v67.mjs` makes every new object physical for sightline checking. `mall/gameplay-layout-v70.mjs` adds twelve true conservative AABB colliders so the player cannot phase through fixtures.

**Not user-owned Builder saved placements.** IndexedDB `pinewood-builder-v1` and its unpublished draft are untouched. No new story room IDs, floor height slabs, gates, evidence, exterior geometry, fake decals, or voice narration.

## Required release gates

- Source audit: SHA256 of all original candidate GLBs, actual preview, reject >7m podium.
- Physical layout: all twelve correct original rooms and unclipped boundaries; 4.2m entries and cashier/source cabinets not obstructed; per-room navigation and original long west/east public shopping spines open.
- Original story: all 41 original rooms, nine LS evidence sites, six chapter spawn positions, real V113 inner door E/anti-trap, V115 seven glazed fronts, V116 13 shut tenant suites, V117 checkpoint, V118 atrium 28 structural columns, V119 three closed food vendors and V120 six real benches/two correct double-sided directories survive.
- **Actual final-head desktop Chromium 3D screenshots from inside Fallow's and east original department store must be visually inspected**, not just the stand-alone asset preview. Show realistic relative scale, clear storefront approaches, no black/white giant slabs and no overlapping/shrunk assets.
- Exact final candidate CI must finish fully green before promoting draft PR #126 or merging. A passing early branch head never establishes final-head validity. No mobile testing or human WASD claims.

This is a deliberate first department-store furnishing pass, not completion of entire 1979 and 1997 mall. Next: narrow bespoke tenant identities and service/back-office detail, then remaining intentional 520m² footprint review, continuing [architecture Issue #119](https://github.com/maloysius-wq/the-attendant-pinewood-mall/issues/119).
