# V138 · Chapter 1 real architectural power consequences

**Parent:** V137 Chapter 1 work-order and genuine Master Service Key repair (PR #147, merged and Pages deployed at `978aebc4`).  
**Source of truth:** `STORY_BIBLE.md`, `NARRATIVE_IMPLEMENTATION_PLAN.md`, canonical 1979 physical shell.  
**Status:** standalone PR #148, rebased directly onto verified V137 main; exact V138 source and desktop release checks are required before shipping.

## Exact physical sources

The real 1979 original `mall/render-shell-v67.js` installs its lights into the common `building.group`, reused by the cinematic, game and Builder. V138 gives existing architectural lights metadata only, with no new bulb positions, materials, GLBs, collision surfaces or network dependencies. During **playable Chapter 1 only**, the actual emergency circuit interactions independently raise the existing source point lights from **16% safe/off illumination to 450% of their original intensity**; each original bulb diffuser changes only from 16% to its original 100% visible opacity:

- A: four central-gallery original emergency luminaires at z −46, −66, −86 and −106, x0. Visibly restores the long public concourse
- B: original west-retail source light at x−28,z−80. Gives the retail/PA branch its own physical consequence
- C: original east freight/service lamp x32,z−105. Signals the route leading to the service elevator

The source bulbs are also dimmed/energized so the physical emitter matches the actual light. Only an original breaker with the correct A/B/C `userData.id` and real successful Game.interact turns on its group; an unrelated key, decoy or completed breaker cannot. All original light intensities/appearances are restored in Chapters 2–6. Restart clears the runtime A/B/C state; no extra save schema or duplicated story flags.

## Newly discovered genuine physical route repair

The V137 physical source audit found that the canonical `east_gallery__freight_lobby` doorway was originally centered over the real **open vertical freight shaft** at x18.5..22.5, z−115.8..−110.5. Its source walk cells in the freight lobby were individually valid but not reachable from the public promenade, a real Chapter 1 progression lock. V137 moved **only the source masonry opening** to x14.25..16.75, z−110, west of the shaft on unchanged solid floor. V138's exact test asserts an actual connected key-to-freight walking route. The shaft remains open, with no invented floor or secret teleport.

The original Master Service Key was also missing because V70 retired the old `buildArcade` that constructed it. V137 reinstates the original key model, exact pickup behavior and a stable central-gallery location x6,z−81, moved two metres from an actual physical lounge collider discovered by strict accessibility audit. The key, all three breakers, and the real freight lobby are tested for solid-floor reachability.

## Release gates

- `scripts/test-chapter1-circuits-v138.mjs`: real source wall/route validation and genuine circuit-only lighting state, independent order, duplicate press handling, restart, preserved Chapter 2–6 brightness
- `scripts/test-chapter1-objectives-v137.mjs`: real service key, blocked freight before key and physical post-shaft repair route
- `scripts/smoke-chapter1-circuits-v138.mjs`: real desktop Chromium scene; actual Chapter 1 Begin Shift, original three breaker objects, inspect the actual tagged light objects and real original 1440×900 before/after lighting frames
- `scripts/audit-chapter1-pcas-v20.mjs`: preserve Renee/PCAS canon with no false early voice imitation
- `scripts/test-original-perimeter-v136.mjs`: protect completed original exterior, real 286m² inaccessible structural relief and original passage/shafts

No manual WASD, mobile tests, new licensed assets or public debug cheats. Use the original local-only deterministic QA bridge; video and live opening remain unchanged. Follow-up Issue #146 still needs fair first Attendant reveal and stealth teaching, evidence reachability, save/death handling, and Chapter 2 transition pacing.

## Scene reload and media-regression safety

The chapter system normally reuses the loaded physical mall group across chapters and may rebuild it on a fresh scene load. V138 rebinds all actually tagged PointLight and bulb nodes when that group changes; reset always clears prior-run breaker states, even when the group is reused. Focused tests also cover reactivation after a fresh scene load. It restores the original source light intensity, opacity **and material transparency** outside Chapter 1. No previously unloaded light remains referenced by new gameplay.

The real desktop 1440×900 smoke intentionally views the actual A-circuit luminaires from the central public concourse for a perceptible before/after inspection. Original local ambient media sometimes receive a browser-generated `net::ERR_ABORTED` on the pinned `furniture_shop_loop.ogg` when Chrome reroutes audio; only that exact on-origin OGG cancellation is allowed. Any other failed asset request, off-origin request, page error, missing original breaker, or source-light-state mismatch remains a hard CI failure.

## V138 visible power-state tuning

Desktop comparison found the first 34% → 100% source intensity change visually indistinguishable from unpowered G-floor public lighting at the actual authored central-gallery camera. The follow-up intentionally uses the **same original source luminaires** with 16% safe/off and 450% of the original source intensity when an emergency branch energizes. The original physical spherical diffuser moves only from 16% visible opacity to its original 100% opaque appearance (never 450% invalid alpha). This is a localized original-fixture illumination change, not a blanket exposure change: no fake room lights, topology, lighting sprites, textures, cue spam or network assets. Chapters 2–6 restore the original source intensities, transparency and bulb appearance exactly. Real desktop before/after shots must be visually reviewed before merging.

The desktop smoke preserves the full original scene and 1440×900 render. Since loading all locally pinned models under software Chromium can vary significantly between CI runners, it allows up to nine minutes for the established Chapter 1 handoff, then only 15 seconds for the new V138 hook. A timeout records exact in-game loading progress and JavaScript/request diagnostics as an artifact rather than silently weakening any source, interaction, or screenshot assertion.
