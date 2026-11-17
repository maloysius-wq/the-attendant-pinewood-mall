# V123 | Genuine abandoned department-stock and late-close returns

**Scope:** original 1979 Fallow's and East Department only, building on merged V122 physical lighting and the canonical V121 30 pinned real fixtures. The private owner Builder draft, published layout JSON and all 41 story rooms are unchanged. This is a deliberately modest pass toward Issue #119, not a claim that the historic tenants are complete.

## Actual, source-verified 3D audition

Before any physical placement, we inspected eight already licensed **original CC0** GLBs using a separate real Chromium/Three.js preview at `review/retail-assets-v123/`. `scripts/test-anchor-stock-sources-v123.mjs` checks their actual bytes against the original SHA256-pinned 482-item Builder model manifest; `scripts/smoke-anchor-stock-v123.mjs` captures genuine individual model WebGL renders and their exact human-scaled bounds.

| Genuine local-source candidate | Measured width × height × depth (metres) | Usage |
| --- | --- | --- |
| Folded-stock cube unit | 1.076 × 1.180 × 0.434 | 1979 floor-facing folded knitwear |
| Shoe-riser set | 2.215 × 0.720 × 0.874 | **Rejected** on tabletops: wider than source tables |
| Stepped-display riser | 1.409 × 0.720 × 1.042 | **Rejected** on tabletops: overhangs the actual source depth |
| Promotional dump bin | 0.798 × 1.020 × 0.792 | Two deliberate old clearance endpoints |
| Kenney open carton | 0.688 × 0.520 × 0.393 | Fallow receiving pile and source-supported returns |
| Kenney sealed carton | 0.363 × 0.480 × 0.363 | Fallow/East original small receiving corners |
| Kenney gift books | 0.478 × 0.330 × 0.300 | Source-supported catalog/gift displays |
| Cube display block | 0.802 × 0.770 × 0.802 | Deliberate on-table small display plinth |

**These are actual imported source-model dimensions, not conceptual stock props.** The local canonical source paths and hashes live in `mall/anchor-stock-sources-v123.mjs`; no CDN is introduced.

## Canonical, supported placement

`mall/anchor-stock-layout-v123.mjs` authors exactly **13** original scene additions, all using existing pinned original CC0 GLBs. Eight are within Fallow's and five in the original East Department. Six tabletop pieces use the actual V121 full-size nesting display tables as their physical support (real table GLB bounds for horizontal coverage and vertical seating, not just `y=.95` guessed placement). Seven true floor-level stock units are physically grounded at y=0 and have real gameplay collision AABBs. Supported stock does not add duplicate colliders over the existing table bases.

Fallow's receives an actual folded-stock cube near the back aisle, a separate original clearance endpoint, two deliberately arranged small receiving cartons beside the original checkout, and four supported bits of display/return stock. East Department receives a separate clearance bin, real folded-stock cube, a small original receiving carton away from the display racks and two original-table displays. The large empty risers are not placed.

All positions are audited against **the exact original 17×25m and 17×18m store boundaries, thirty V121 source fixture footprints, the two V69 original registers/racks, real 4.2m V115 transparent entrances and original entry-to-register aisles**. No floor slab, wall, architectural room, chapter gate, evidence site, original support or lighting changes. The shared original mall renderer installs all V123 assets before the first visible frame across game, cinematic and Builder, not inside a user save.

## Mandatory release QA

- Source file exact SHA256 and CC0 license from 482 canonical source models.
- Node layout tests rejecting unsupported tables, outside-room stock, portal blockage, new collisions with original racks, and inaccessible six-chapter story starts.
- Real desktop Chromium first-frame preloading, actual 13 real licensed model bounds, real original tabletop mounting and ground seating, untouched 30 source displays / 15 V122 fixtures, real Fallow's/east store and gallery/plan screenshots, and no JS errors or third-party runtime fetches.
- Preserve original v113 inner hinged door, keypad, exact opening endpoint `(12.5,1.7,-32.75)` heading `(0,0)`, all original nine LS evidence locations, 41 rooms, 6 chapters, private `pinewood-builder-v1` draft and empty published user layout.
- **Do not merge until final exact commit's dedicated and inherited desktop tests are green and true full-mall V123 screenshots have been inspected**. No manual WASD/mobile testing claimed.

After this pass, the priority is improving real stock detail density only when real source geometry supports it, then Cassette Castle, Video Planet, Sunburst Arcade, staff/service suites, the annex, and the still unassigned 520m². Do not randomize unused floor.
