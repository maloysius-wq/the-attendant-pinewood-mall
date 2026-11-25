# V152: Original Chapter 1 to Below Grade radio/PA handoff

## Scope

V151 proved authentic E inspection and the existing V17 PEOPLE save state. V152
continues Issue #146 Phase D by hardening the *already-recorded* Renee Ward and
PCAS speech crossing the actual freight / Chapter 2 boundary. It does not add
narrative, rewrite source dialogue, or change chapter objective timing.

## Actual defect and narrow repair

V27 serializes Renee/PCAS voices while a chapter is active, but it loads OGGs
asynchronously and can defer busy-channel playback with `setTimeout`. An old
chapter may finish before an old deferred or in-flight clip loads. On the real
V70 `Game.startChapter` route the old world is cleared and game state reset,
but neither the active Web Audio voices nor delayed loaders were invalidated.
Consequently an old line could start or continue after a new chapter loaded,
making the Chapter 2 introduction late or confused.

`mall/chapter-handoff-voice-v152.mjs` patches the **fully assembled original
source** after V27, V70 and V151, with one-instance/one-marker guards:

- On original `world.clear() → resetState()` (both next chapter and original
  Death → Restart), advance the speech epoch and stop only old **character/PCAS
  speaking sources**. All six chapters use the same original transition.
- Bind V27 async Renee recording loads and both original busy-channel retry
  paths to the epoch they began in. They cannot wake up and deliver obsolete
  speech/subtitles after the source scene has changed.
- Bind V27 PCAS async loading to the same epoch and retain only its playing
  PCAS sources to stop on transition. Preserve existing PCAS voice serialization.
- Clear the old V27 voice busy lock and game subtitle lock so the authentic
  Chapter 2 `beginPlay` can play `ch2_start`, without waiting for an obsolete
  Chapter 1 announcement.

## Canon timing and boundaries

The original V20 Phase C dialogue still reveals CONTRACTOR FOURTEEN only
as actual first power comes online. The existing original V21 Below Grade
sequence opens with Renee's `ch2_start` about the unexpected downward freight
ride; **the original November 14, 1997 creation-date revelation is still
triggered only after real Relay D restoration**. No Chapter 1 text mentions
1997, Eli Mercer or earlier contractor sessions. Chapter 4 voice imitation
and Chapter 5 Contractor 01–14 historical reveal remain untouched.

No alternate audio file, request, voice generator, radio event, save key,
journal unlock, E-key handler, collider, geometry, NPC, cinematic,
Builder publishing or mobile test is added.

## Tests

- `scripts/test-chapter-handoff-voice-v152.mjs`: exact emitted V27/V70
  markers, fail-closed patching, two delayed retry guards, correct original
  source boot order, untouched story and 1997 reveal timing.
- `scripts/smoke-chapter-handoff-voice-v152.mjs`: 1440×900 Chromium
  boots **the original full source**, uses actual first-person E original
  Master Service Key, all three genuine wall breakers, actual freight E,
  physical `Game.tryMove` steps into the real elevator and native source
  Chapter 2 start. It checks epoch reset, true below-grade B1 Y, the genuine
  recorded `ch2_start` playing and no page errors, failed local runtime assets
  or off-origin requests. There is no manual WASD or fake game scene.
- Dedicated `.github/workflows/chapter-handoff-voice-v152.yml` retains V151
  source protections, Chapter 2 narrative source checks and licensed asset
  SHA audit, and archives original desktop screenshots/telemetry.

## Safeguards

All original six chapters, 41 rooms, nine Last Shift evidence anchors, 13
sealed bays, V113 cinematic/vestibule E door, V141 physical A/B/C panels,
V148 real restart, V149 navigable Attendant, V150 paper belongings and V151
PEOPLE progression remain in their established runtime. Keep the actual
source system and local license provenance authoritative. Never publish
the private Builder or restore third-party runtime asset URLs.

## Next

After V152's focused desktop validation, test old-save / Continue migrations
and genuine later chapter restarts, then the Chapter 1 45–60-minute perceptual
horror/audio pacing without padding.
