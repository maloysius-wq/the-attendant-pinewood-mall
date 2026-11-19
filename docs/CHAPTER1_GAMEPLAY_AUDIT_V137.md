# V137 · Closing Time gameplay audit and work-order repair

This starts Issue #146 after Issue #119 (original mall architecture) was completed. It is a focused Chapter 1 gameplay and horror-readability change, NOT a rewrite of the six-chapter game.

## Findings from the actual original compressed Game source and patches

- Chapter 1 already has physical breaker objects A/B/C, Renee Ward's opening work order, the first distant Attendant reveal, a persistent Contractor Fourteen flag, and reactive PCAS announcements after circuit, key and elevator events. These are existing systems, not V137 inventions.
- The original HUD only reported a relay count before asking the player to reach the freight elevator. It omitted the Master Service Key even though the real level has a physical named pickup.
- The original real freight start handler checked emergency-power count but did not check the Master Service Key.
- **Real root cause found by compressed-source audit and desktop gameplay:** the original Master Service Key was constructed inside `buildArcade(world)`. V70 correctly retired that entire obsolete arcade scene when it installed the licensed 1979 mall architecture, but this accidentally removed the *only actual physical key pickup*. V137 now restores exactly the source-authored `makePickup('key', ... ,'Master Service Key')`, adds it back to the real interactables, and uses an exact canonical source position in `central_gallery` (6,-83) through existing relocation. This is not a second fake pickup, duplicate, or key-count workaround. The player could therefore depart with power alone.
- The original generic inventory key count is consumed by locked doors. A recovered service-key credential must therefore be recorded by the authentic named pickup event, not guessed from current key count.
- Save/restart is chapter-based in the existing game; the new per-attempt credential is reset with the original Game.resetState. No new persistent save schema or narrative flags are needed.

## First V137 implementation

mall/chapter1-workorder-v137.js is a deterministic stage controller installed through the existing authored V70 gameplay bridge after Chapter 1's real story objects and original V113 door are placed.

1. Restore emergency circuits A through C. The HUD shows the real counter without imposing a fictitious circuit order.
2. Recover the actual Master Service Key from the authored world. The controller registers that real pickup exactly once.
3. Call the east freight elevator. Power plus the recovered named key are required. An unrelated key cannot satisfy the requirement. A service key used on another real door remains registered as a recovered service credential, preventing a softlock.
4. Wait for the real freight doors, board the cab and remain inside during the already-implemented descent.

The controller wraps existing Game.updateHUD, interact, updateInteraction, startElevator and resetState without overwriting real AI, save systems, story, chapter routes, physics or later-chapter objectives. No new HUD panel is created. Only a localhost-only, opt-in automated QA bridge can operate actual authored breaker/key/exit interactables programmatically for desktop regression; it cannot be used as a public runtime cheat endpoint.

## Mandatory tests

- scripts/inspect-chapter1-runtime-v137.mjs: decompress and inspect authentic canonical original source hooks instead of guessing.
- scripts/test-chapter1-objectives-v137.mjs: pure stage transitions, genuine label identity, gate before key, real key recorded, state after cab opens, restart reset and Chapter 2–6 unchanged.
- scripts/smoke-chapter1-workorder-v137.mjs: actual 1440×900 desktop game through real Begin Shift, three real authored breaker objects, real exit rejection before physical key pickup, physical Master Service Key collection through original Game.interact, accepted actual freight transition, and in-game HUD. No manual WASD/mobile testing or off-origin runtime requests.
- Existing Chapter 1 narrative/PCAS source audits, canonical V113 original door, six-chapter gameplay and pinned local-asset audits must stay green.

## Next Chapter 1 tasks after this first PR

This stage does **not** claim a complete 45–60 minute Chapter 1. Continue Issue #146 with measured evidence and regression tests for: separate A/B/C lighting/PA/service-zone consequences, fair first Attendant sighting and hiding/decoy teaching, all power/key/evidence reachability, save/restart and death recovery, real ferry/freight Chapter 2 handoff, authored audio and PA pacing, and full Chapter 1 play-duration/atmosphere audit. Preserve the story bible: no early Renee voice imitation, no Attendant origin explanation or invented monster identity.
