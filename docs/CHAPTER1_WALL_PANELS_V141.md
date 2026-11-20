# V141: three reachable wall-mounted Chapter 1 breaker panels

## Source geometry and original placement

The original `makeBreaker()` creates a 0.42 × 0.50 × 0.14 m control box with a functioning LED, facing local +Z. The previous Chapter 1 relocation placed A at (-16,-62), B at (20,-62) and C at (3,-115), all detached from any solid wall. V141 mounts **the same actual game source meshes** on real original masonry with correct normal and height. No stand-in prop, new wall, independent circuit logic or Builder change.

## Actual original masonry selected

| Original circuit | Real structural wall | Mounted source center (x,z) | Clear player standing site (x,z) |
| --- | --- | --- | --- |
| A, concourse emergency ring | `north_service_z_-112_1.85` concrete, public-concourse side of service wall | (7,-111.802) | (7,-110.4) |
| B, west retail circuit | `v116_west_rear_receiving_closed-bay-partition_x_-29_-118.00` receiving-bay partition, shopping-walk side | (-28.797,-109) | (-27.45,-109) |
| C, freight branch | `freight_lobby_z_-110_11` freight entrance partition, inside freight lobby and west of real shaft | (12.5,-110.198) | (12.5,-111.55) |

The box's original rear steel face sits **8 mm from the original physical wall face**, derived from each actual 0.24/0.25 m source wall thickness, not a guessed invisible wall. The box bottom is 1.18 m and the lit switch is 1.55 m above real ground floor. Faces are outward toward their actual accessible side. The sources are full-height 1979 concrete partitions, not a shop window, tiny decorative storefront pier, sealed-bay inaccessible side, portal opening or lift shaft.

Source-tested walkable approaches connect to the genuine V113 fire-door spawn, the original service key and the actual freight lobby. The V70 placement map holds *safe approach sites* for these real source controls; the V141 controller then moves each actual source breaker into its final physical mounting, after the genuine story objects are created. Chapters 2–6 retain their original unmodified locations and behavior.

## Released and verified

Merged [PR #151](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/151) to main as `c4ccb7f59a46ea45c69c33010a66ae2f0d6363e3`, exact focused 1440×900 original WebGL and structural-source SUCCESS [#44762727649](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/44762727649). All three actual E raycasts at ~1.24–1.31m, three genuine A/B/C circuit interactions, real service key and real freight gate all PASS. Each of the three first-person images independently inspected. Original main Pages [#44765189287](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/44765189287) SUCCESS. The old legacy V70 story-placement test needed its pre-V141 hardcoded room names updated to the new true-wall locations, and the navigation CI path filter is now protected from this drift.

## Release gates (fulfilled)

Exact feature branch passed source wall identity, back-face geometry, facing, walkability and reachability tests, plus V137–V140 regression and pinned local-asset audit. The real original 1440×900 desktop WebGL game verified genuine first-person E targeting and switch A/B/C success at the correct wall, with **three original scene screenshots** independently inspected. The actual key and freight elevator must remain usable. No manual WASD, mobile/emulated tests, remote runtime loading or private Builder draft publication.

The only new QA helper is restricted to local desktop Chromium with `?chapter1QA`; it is not a public gameplay cheat.
