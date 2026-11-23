# V151: Original E-key staff inspection and truthful PEOPLE journal

## Player-facing behavior

Chapter 1's three genuinely existing V150 human belongings now provide an **optional, gaze-based E interaction**. From a physically reachable original room position, aim the original first-person camera at the real printed 3D paper surface within the original **2.45 m E raycast range**. When no original E target is selected, the existing HUD displays **“E  Examine [item]”**. Pressing the **actual original E key** shows a short, visually restrained reading card containing the original object’s 1997 text and name, and records the person in the established **J → PEOPLE** journal. It does not remove the object, alter a gameplay objective, grant an item, or fabricate evidence.

The three Stage 1 journal states are intentionally modest:
- **Jo Alvarez**, Food Court closing-round clipboard: a manager who wanted employees personally checked on
- **Tessa Kim**, Cassette Castle staff chart: a music-store clerk with handwritten Top 40 picks and weekend plans
- **Luis Ortega**, Video Planet VHS copy-request sleeve: a night Security supervisor who requested a routine tape copy

No early entry confirms Jo or Tessa survived 1997, reveals Luis's later fate, explains PCAS, or substitutes for any of the nine original Last Shift anchors. The contents are based on the real V150 paper, rather than a generic collectible narrator.

## Existing original-source integration

This is an additive Chapter 1 wrapper after V150:
- Calls **original `Game.updateInteraction()` first**. If the original game selects a breaker, service key, door, cabinet, physical decoy, journal evidence, freight control or other original E target, V151 does nothing. There are **zero new source `world.interactables` and zero new colliders**.
- Otherwise, checks the original source `mallLayoutV70.roomAt`, actual original camera/THREE raycast to each existing V150 `v150_physical_staff_belonging_*` group, its authentic parent, the `staffBelongingV150` marker and a **2.45 m maximum true raycast distance**. No through-wall or off-room interaction. The target must be recalculated at E time, so old hints do not allow remote inspection.
- Wraps original `Game.interact()` **without any second keyboard listener**. When an original source target exists, it invokes the original method immediately. If no real original target exists, only a presently visible eligible paper may invoke inspection.
- Shows an eight-second transient, accessible HTML card via **plain text nodes** (no markup injection or external fonts). The card does not pause gameplay or deliver radio/Attendant events.
- On the original V148 **world.clear → resetState → scene rebuilt** sequence, only transient card/focus and chapter-local counters reset. No early binding to the absent world and no duplication. Later original V150 post-build rebind remains authoritative.

## Journal and save compatibility

The existing V17 story source already supports a `SAVE.story.people` map, `save()`, `rebuildJournal()` and the published `PEOPLE` section, all stored under the existing local save key. `mall/staff-recognition-source-v151.mjs` makes a uniquely guarded, narrow source amendment to `StoryEventManagerV17` after the existing V17 source expansion.

- `recognizeStaffV151(id)` accepts only **`jo`, `tessa`, `luis`**, writes the non-spoiler **`traces`** state only if that person has **no** previously saved recognition, and calls the original save function. It never downgrades `known`, `survivor`, `pattern` or a later character state.
- The same source amendment makes *original* V17 LS evidence collection and old-save migration promote **`traces → known`** where appropriate. Original evidence still creates `SAVE.story.evidence` and timeline facts only upon genuine evidence collection.
- `story/characters.js` adds three `traces` descriptions, leaving all canonical known/later variants unchanged. No save key, story version number, journal layout or nine LS evidence identity is replaced.
- No new Last Shift collectible is created; inspecting all three remains **optional**, and cannot shortcut the true ending.

## Focused source and original desktop QA

`scripts/audit-original-inspection-v151.mjs` reads and validates the immutable compressed original `Game.updateInteraction`, `Game.interact`, original keydown E and J dispatch, original journal and death/restart.

`scripts/test-chapter1-staff-inspection-v151.mjs` verifies method signature/replacement guards, the three spoiler-free `traces` states, original E-target priority even when paper is in view, physical raycast selection, saved state isolation through original reset, no duplicate E listeners, no colliders/interactables and no off-repository assets. Established V150 paper placement, V148 restart, V149 AI pacing and local asset audits stay in the focused workflow.

`scripts/smoke-chapter1-staff-inspection-v151.mjs` boots original 1440×900 desktop Chromium, uses real camera gaze and **native keyboard E** on all three papers, verifies J/PEOPLE saved states, then operates original source E on the **actual Noise Maker** and **LS-03 security route sketch** to assert E precedence and Luis `traces → known` promotion. Finally triggers the authentic Attendant and physical death, clicks the actual Death → Restart button and confirms original world/UI re-enter, persistent source PEOPLE states, restored original E items and all three untouched V150 props. Records actual first-person screenshot and source JSON telemetry; demands no browser page errors, failed local runtime files or off-origin requests.

## Next milestone

Proceed to the source-canonical **Renee Ward / PCAS** Chapter 1 → Chapter 2 handoff and timing, preserving actual radio/voice precedence. Then address old-save/Continue migration and six-chapter regressions, and undertake the original Chapter 1 45–60-minute pacing/audio review. Follow `AGENTS.md` and `STORY_BIBLE.md`; no original game scene/AI/collider changes, remote runtime assets, mobile QA, manual WASD playtests, or unpublished Builder publication.
