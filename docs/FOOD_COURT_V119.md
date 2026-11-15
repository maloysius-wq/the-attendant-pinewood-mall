# V119 | Old Food Court: measured reconstruction

**Scope:** The original 1979 ground-floor food-court room, fictional 1997 close-down condition. This is a coherent source-locked physical zone, **not** a global mall overhaul and not an imported user-owned Builder draft.

## Why this pass is necessary

The canonical `food_court` occupies **x29–46, z−97 to −80** (17 × 17 metres). The original real V115 glazed frontage lies at **x=29**, with a **4.2m** public entry centered near z−88.5. The previous V69 room had four small round tables at x35/x42, z−84.1/−93.1, six loose chairs and two small supported props, but **no physically built concessions**. Worse, the old construction-review screenshot did not load V69 furnished models. Actual initial V119 Chromium/WebGL review photographs revealed a blank interior/rear wall and four tables/chairs without planned vendor circulation. The baseline is saved as [V119 source photograph artifact](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/43680632451); this first baseline workflow was red solely because Playwright reported a same-origin `blob:http://127.0.0.1` decoder URL as an external request, a QA predicate corrected in follow-up, **not** an off-origin source asset. Original initial photograph artifact still faithfully represents the before state.

## Built 1997 food-court design

| Element | Source location / size | How built |
| --- | --- | --- |
| Existing 4.2m mall entry | Original V115 x29, centered z−88.5 | Absolutely unchanged. It remains open in Chapter 1 |
| Central public promenade | z≈−88.5, x29…40.15 | Protected as a navigable route, never a decorated fake doorway |
| Food-court floor finish | One replacement slab x29…46, z−97…−80, y=0 | Exact **289m² real tile floor** substituted for the same area of original terrazzo, never a coplanar extra layer; staircase/elevator floor holes unchanged |
| Dining row A | Tables x33.25 / 37.75, z−83.8 | Two original licensed CC0 round GLBs, four chairs, original pizza box and cup rehomed on original supports |
| Dining row B | Tables x33.25 / 37.75, z−93.2 | Two original round GLBs and four chairs, preserving existing six IDs and adding two correctly pinned same-model seats |
| Closed pizza concession | z−85.70…−81.20, shutter at x43.65 | Physically sealed shutter, low kick, real tall header, real fixed concession counter at (42.2,−83.45) |
| Closed coffee concession | z−91…−86.10, shutter at x43.65 | Same structural composition, built-in fixed counter at (42.2,−88.55) |
| Closed grill concession | z−95.80…−91.40, shutter at x43.65 | Same composition, built-in fixed counter at (42.2,−93.60) |
| Back-of-house service | x43.65…46 | Actual bounded kiosk return partitions connect the original room wall; no free path behind closed shutter |
| Signage and shut-down lighting | Fixed kiosk fascia y≈4.12 and old fixtures y≈3.4 | Source-aligned attachments to real structural walls, faded signs and weak fluorescent housings; never user-editable props |

The shutter is divided into **floor kick 0…1.05m**, **closed rolling panel 1.05…3.22m** and **actual upper infill to the 5.3m original shop ceiling**. Structural masonry piers and return walls close the gaps and sides. Actual post-build WebGL screenshots exposed the three KSI GLB counters as miniature white wedges. Those unsuitable standalone props were removed, replaced with **real physically fixed 0.94m-high, 0.86m-deep counters** attached to the concession structure, with worktops, steel trims and real floor collision.

There are **14 source-pinned V69 movable fixtures** in the redesigned food court: 4 real tables, 8 matching chairs and 2 small supported props. All three serving counters are instead real attached building architecture, not miniaturized GLB props. Six original chair IDs and both supported table props remain intact. The 638-model Builder catalog and CC0 manifest are untouched; no new remote models.

## Why this is not a cosmetic overlay

`mall/food-court-plan-v119.mjs` contains canonical world coordinates and measured physical wall plan; `mall/physical-shell-v67.mjs` mounts **20 real wall/counter solids** into shared Builder → opening film → game architecture. Their floor-level steel/kick/returns participate in line-segment collision and the actual Chapter 1 navigation grid; only the header above the player is excluded from 2D floor collision. `mall/render-shell-v67.js` assigns existing stone, roller metal and kick materials; `mall/render-food-court-v119.js` attaches small ribbing, faded canvas menu boards and low-power fixed fixtures to their **true** walls. `mall/furnishing-plan-v69.mjs` coordinates the original tables, chairs and tabletop props; built-in counter geometry instead shares the physical V119 source plan and gameplay collider grid.

`review/food-court-v119/` loads the full actual V69 furnished mall (unlike the historic shell-only construction page) and provides source-grounded entrance, dining, rear wall and aerial cameras. Its survey light is **review-only** and never affects gameplay. `scripts/test-food-court-v119.mjs` and dedicated Chromium workflow audit genuine portal clearance, three source-shutter colliders, four dining pairs, six chapter spawns, original evidence routes, original GLB sizes, same-origin assets and screenshots.

## Explicit release gate

Do not merge until **every exact final-head relevant CI check passes**, new genuine food-court source+full-V69 screenshot artifacts are visually inspected to confirm counters, rear wall, seating and signs are all visible and proportionate, and no inherited Chapter 1 real-fire-door check regresses. A passing source test alone is insufficient for visual release.

Keep exact 41 story rooms, nine evidence anchors, six chapters, V113 real hinged door and anti-trap, V115 seven physical transparent store fronts, V116 13 closed suites, V117 checkpoint, V118 28 structural posts, original lift/stairs and final exit, and 638-model catalog. Never import or publish the private Builder IndexedDB draft. No mobile / manual WASD check was performed.

This **does not finish** the entire mall. Tenant-specific original shop dressing, store corridors, staff desks/rooms and intentional 520m² residual footprint remain Issue #119 priorities.

**Visual QA after source redesign:** The [original new layout capture](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/43682054638) passed source/browser tests and revealed that the three CC0 KSI counters looked like white miniature wedges. They were rejected in favor of built-in counterwork. The overhead plan was obscured by genuine upper administration floor geometry; the *survey-only* plan camera now hides M1 floor/fixtures, leaving the production world unchanged. Rerender and inspect latest exact-head shots before merge.
