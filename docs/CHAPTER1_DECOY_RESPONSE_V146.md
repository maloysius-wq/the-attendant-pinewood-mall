# V146: Real Attendant response to a thrown Noise Maker

**Scope:** Active Issue #146 Phase C on the original six-chapter game. The original source bundle itself is immutable; source-level changes are assembled only through the established `game.js` runtime source patch just like existing work-order/decoy restoration.

## Original-code findings

The original `Game.throwDecoy()` spends a genuine V139/V145 collected Noise Maker, launches its own glowing THREE mesh with ballistic velocity, and only emits a full-strength `'decoy'` noise when that object physically lands on a walkable cell. It continues to beep and emit additional sound events while active. The original `Attendant.hear()` always accepts a decoy if awake, from **any** position, then immediately changes its investigation state, rewrites its last-heard point and orders an A* path. The original loop beeps every **0.45 seconds** and retriggers that investigation on every pulse. The original `Attendant.update()` could continue following the decoy position even after newly seeing the player.

## Changed

- Sound is bound to the *actual* thrown mesh position and true source `world.navDistance` within **27m**. A remote noise behind a long physical route does not command the Attendant; a hidden/dormant Attendant cannot be summoned at an arbitrary map location.
- A decoy is a reliable diversion **only if the Attendant is not looking directly at the unhidden human** through real `canSee` and the actual source `world.hasLOS`. Seeing the player later clears decoy priority and invokes the original hunting path.
- The original local CC0 beep and original `emitSound` still run, but Chapter 1 decoy beeps now pulse every **1.2s**, and repeated sound events from the *same genuine object* are coalesced within **2.45s**, rather than restaging the investigation every fraction of a second. New distinct throws are independently audible.
- Original V140 anti-clairvoyance of search/hunt, V139 15s protected first reveal, source nav A*, V145 paper tags, original cabinet hide, the original source collision map and all E/Q interactions remain authoritative. No AI clones, fabricated items, fake Renee voice, HUD tutorial spam or remote media.
- Original source patch uses `this.levelIndex===0 ? 1.2 : .45` expressly to leave Chapters 2–6 original beacon timing unchanged. The controller also restores its Chapter 1 counters on original reset.

## Verification

Scoped Node checks exercise range, LOS priority, repeated same-object pulses, unique source patch identity, and unchanged Chapter 2 behavior, together with V139/V140/V144/V145 and pinned local asset regressions. Source-authenticity gates passed on the exact behavior code head.

A dedicated original **1440×900 desktop Chromium** test must verify genuine original Chapter 1 first-person E collection, browser keyboard Q, original ballistic decoy landing, true AI source-world A* pursuit to the *actual landing spot*, pulse pacing, real distant-source rejection and original sight-over-decoy priority. No manual WASD or mobile tests. Merge only when original browser and source jobs pass.

## Remaining

This is a focused Phase C AI/decoy fairness increment, **not** a full 45–60 minute gameplay pacing pass or the end of Issue #146. Human balance/audio review, Phase D Jo/Tessa/Luis physical breadcrumbs, Chapter 2 PCAS/Renee timing, restart/continue/save migration and six-chapter regression remain open. Maintain all 41 canonical rooms, nine Last Shift anchors, six chapters, 13 sealed bays, original V113 door/cinematic and V141 panels, locally pinned licensed assets, and the unpublished private Builder.
