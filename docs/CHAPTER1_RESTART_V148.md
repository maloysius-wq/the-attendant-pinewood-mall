# V148: Original Chapter 1 Death → Restart recovery

## Verified fault

The earlier V147 full-game restart test timed out for nine minutes. V148 instrumented the **actual original** `Game.startChapter`, `world.clear`, `resetState` and `world.buildGeometry` using a localhost-only `chapter1QA` witness, not a fabricated scene or new runtime game controller.

Original source order is:
1. `Game.restart()` calls `startChapter(this.levelIndex)`.
2. `startChapter` calls `world.clear()` **before** `resetState()`.
3. It carves the fresh world, builds original geometry, decorates it, then the existing V70 authored bridge invokes `installChapter1DecoyTagsV145(game)` after restoring original E-operated Noise Maker and Pager Decoy.
4. `chapterScreen` shows the original `Begin Shift` button, which uses the same game's `beginPlay()`.

Before this fix, V145's `game.resetState` wrapper called `bind()` immediately, while `world.interactables` was necessarily empty after `world.clear()`. Actual desktop telemetry from [the failing V148 diagnosis](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/45224650309) reproduced `V145 requires exactly one original Noise Maker interactable`, trapping the loading UI at **48%**. This was a real reset-order defect, not mere slow 3D loading.

## Narrow correction

`mall/chapter1-decoy-tags-v145.js` now calls `dispose()` in its reset wrapper, releasing old note geometry/texture/material, and **does not call `bind()` during reset**. Its preexisting idempotent installation branch still calls `bind()` after the original scene has recreated exactly one each of the genuine source decoy pickups. Genuine source first-person E, keyboard Q, thrown mesh/CC0 sound, source AI, all 41 rooms, 13 sealed bays, three original A/B/C wall breakers, V113 exact cinematic/door, original six chapters and private Builder publication remain untouched.

`mall/chapter1-restart-v148.js` is **localhost + chapter1QA only**: it records stages using pass-through original methods and exposes only a local test probe. It does not install an actor, collider, UI controls, network request, save format, alternate start flow or mock world on public Pages.

## Completed exact-head verification

[Focused V148 GitHub Actions #45228301667](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/45228301667) passed **BOTH source and original 1440 × 900 desktop** jobs against gameplay/test code head `cad1e52210f21ec7911d74e98c4f0b1eb4780782`.

- Actual Chapter 1 original live breaker and original Attendant physical contact caused genuine death.
- The **real** Death → Restart button called the same original `Game.startChapter`; original `world.clear` and every `resetState` wrapper completed with no exception.
- The genuine original world rebuilt **416 actual colliders**; both original Noise Maker and Pager Decoy were **attached and uncollected**; the licensed source cabinet was interactive; initial Attendant/reveal/decoy counters were restored.
- The original loading UI reached **100%**, hid the loading screen and displayed the original Chapter 1 `Begin Shift` control.
- The **existing original DOM button** had its live `onclick` handler, and clicking it resumed original gameplay: `running=true`, `dead=false`, `modal=false`, level Chapter 1 and Attendant dormant. No alternative gameplay start or fake restart.
- Original desktop telemetry reported **0 page errors, 0 off-origin runtime requests and 0 failed local asset requests**. Automated restart, sampling and resumption completed in about **65.7 seconds** in the CI environment. Timing is an observed run, not a performance guarantee.
- Exact-order regression `scripts/test-chapter1-decoy-restart-v148.mjs` protects original `world.clear → resetState → original E pickups rebuilt → bind`, together with V139/V140/V145/V147 tests and pinned local asset audit.
- The preceding V148 [diagnostic run](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/45225786250) already confirmed restored world/Chapter 1 at 100%, but its Playwright locator-based second click did not resume. The final run uses the same original DOM click approach established by V140 and confirms real `beginPlay()`. This was a test interaction, not an additional gameplay-source fix.

## Still pending on Issue #146

Continue original sustained hunt/search audiovisual pacing and 45–60 minute Chapter 1 playthrough review. Begin Phase D grounded Jo Alvarez, Tessa Kim and Luis Ortega in-world physical belongings according to `STORY_BIBLE.md`, then Renee/PCAS Chapter 2 continuity, save migration and six-chapter acceptance. This fix solves the confirmed Chapter 1 restart blocker; it is **not** a blanket certification for all chapters' older save migrations or every continue path.
