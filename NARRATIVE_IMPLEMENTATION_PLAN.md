# The Attendant: Pinewood Mall — Narrative Implementation Plan

**Companion source:** `STORY_BIBLE.md`  
**Goal:** Transform the current three-chapter prototype into a 5–7 hour six-chapter narrative horror game without regressing the working runtime, navigation, local-asset rules or established Attendant mechanics.

---

# 1. Product target

The expanded game should deliver:

- six substantial chapters,
- approximately 5–7 hours for a first completion,
- longer completion time for players pursuing the full evidence/true-ending route,
- a distinct visual and gameplay identity for every chapter,
- a persistent cast the player learns rather than a collection of anonymous notes,
- physical environmental storytelling,
- several major set-piece discoveries,
- escalating but fair supernatural rules,
- a normal ending and a materially different true ending,
- no combat solution to The Attendant.

Approximate chapter targets:

| Chapter | Target first-run time | Primary identity |
|---|---:|---|
| 1. Closing Time | 45–60 min | public dead mall / introductory stealth |
| 2. Below Grade | 45–60 min | machinery / acoustic risk |
| 3. Eyes in Security | 50–65 min | CCTV / controlled routes |
| 4. The East Wing | 55–70 min | information distrust / personal history |
| 5. Accountability | 55–75 min | investigation / roster reconstruction |
| 6. The Last Shift | 60–80 min | remembered 1997 state / closing ritual / final pursuit |

These are pacing targets, not reasons to pad maps.

---

# 2. Development strategy

The current deployed game is working and must remain working throughout development.

Do **not** attempt a single replacement of the entire runtime.

Use staged, auditable development:

1. establish narrative data/framework while retaining current chapters,
2. retrofit Chapter 1 into the new story model,
3. expand the current service-level material into Chapter 2,
4. add Chapter 3,
5. add Chapter 4,
6. add Chapter 5,
7. replace the prototype final chapter with Chapter 6,
8. polish pacing, evidence, audio and endings,
9. perform full story-integrity and visual audits.

Every stage must leave `main` bootable.

---

# 3. Narrative source architecture

The current prototype embeds chapter descriptions, dialogue, logs and ending text directly inside the assembled gameplay source. That is appropriate for a prototype but will become difficult to maintain with six chapters and dozens of events.

Create a local narrative data layer.

Recommended repository structure:

```text
story/
  story-data.js
  characters.js
  evidence.js
  dialogue.js
  chapters.js
  timeline.js
```

All files must be repository-local and versioned.

## 3.1 `story-data.js`

Exports stable IDs and shared narrative constants:

- character IDs,
- story flag IDs,
- PCAS terms,
- ending IDs,
- chapter IDs,
- contractor-session identifiers.

## 3.2 `characters.js`

Player-facing character records and journal update states.

Example state progression for Eli:

- `unknown_contractor`
- `eli_identified`
- `eli_missing_1997`
- `eli_body_found`
- `eli_unresolved_session`

The journal should never reveal a state the player has not earned.

## 3.3 `evidence.js`

Defines all evidence objects:

- LS-01 through LS-09,
- optional character documents,
- pre-1997 anomaly evidence,
- Gavin's modern ticket,
- PCAS printouts,
- management records.

Each item should include:

- stable ID,
- title,
- type,
- chapter,
- required/optional status,
- journal text,
- linked characters,
- timeline facts unlocked,
- ending prerequisites if applicable.

## 3.4 `dialogue.js`

Stores authored dialogue/event lines separately from gameplay code.

Dialogue entries should identify:

- speaker,
- delivery medium (`radio`, `intercom`, `recording`, `terminal`, etc.),
- story prerequisites,
- whether interruptible,
- whether it can replay in Journal,
- optional audio asset key when recorded voice becomes available.

## 3.5 `chapters.js`

Chapter definitions should include:

- title,
- intro,
- primary objective stages,
- visual/environment profile,
- story milestones,
- mandatory evidence,
- exit condition.

## 3.6 `timeline.js`

Defines player-facing historical timeline facts and what evidence unlocks each fact.

---

# 4. Story event manager

Create a dedicated story-event subsystem instead of adding many one-off `if(levelIndex===...)` checks.

A story event should support:

```js
{
  id,
  chapter,
  once,
  prerequisites,
  trigger,
  actions
}
```

Possible triggers:

- chapter start,
- enter volume,
- leave volume,
- objective stage reached,
- object interacted,
- evidence collected,
- Attendant state change,
- timer after another story event,
- player looks toward a set piece,
- power zone enabled,
- terminal state changed.

Possible actions:

- queue radio dialogue,
- play PA line,
- update objective,
- add Journal fact,
- change lighting state,
- enable/disable interactable,
- open/close a controlled route,
- change signage state,
- begin environmental set piece,
- set save flag.

Events need stable IDs and persistent `completedStoryEvents` save state.

---

# 5. Save migration

Existing players may already have chapter unlock and `LS-01` through `LS-09` journal state.

Do not invalidate their save abruptly.

Introduce a new save schema version and migration routine.

Preserve:

- settings,
- existing chapter progression where meaningful,
- existing LS IDs,
- accessibility/settings state.

For development builds, old three-chapter completion should unlock at least the equivalent early expanded chapters rather than corrupting the save.

New persistent fields should include:

- `saveVersion`,
- `storyFlags`,
- `completedStoryEvents`,
- `evidence`,
- `people`,
- `timelineFacts`,
- `chapterCheckpoint`,
- `endingState`.

---

# 6. Journal redesign

Replace the current flat journal list with three sections.

## PEOPLE

Character cards unlock and evolve.

A card may show:

- name,
- role,
- photograph/visual identifier when available,
- confirmed status,
- concise discovered facts.

Do not show omniscient biography text.

## EVIDENCE

Evidence cards preserve the physical discovery:

- object type,
- transcription,
- linked people,
- date,
- replay button for audio/video evidence when supported.

LS-01 through LS-09 are visually distinguished.

## TIMELINE

Automatically assembles confirmed historical facts in chronological order.

This is critical for a longer mystery. The challenge should be discovering facts, not remembering which of thirty notes contained a name.

---

# 7. Chapter implementation

## Chapter 1 — Closing Time retrofit

### Keep

- current public mall floorplan where practical,
- existing four authored stores,
- fountain,
- breakers A/B/C,
- Master Service Key,
- freight elevator,
- current Attendant stealth fundamentals.

### Change

- replace prototype intro text with Renee Ward dialogue,
- introduce Renee naturally before supernatural events,
- turn each power circuit into a distinct environmental state change,
- stage a distant Attendant reveal before full hunting,
- seed Tessa/Jo/Luis names environmentally,
- convert LS-01–03 to varied evidence objects,
- make the PA's first use of `Contractor Fourteen` a deliberate story beat,
- preserve freight-elevator descent as the chapter climax.

### Circuit identities

Circuit A: public concourse / emergency lighting.  
Circuit B: retail/PA branch, causing more of Pinewood's voice to awaken.  
Circuit C: service/elevator branch, allowing final escape route.

Exact electrical realism can be adjusted to the authored map, but each activation must visibly matter.

### Required automated checks

- A/B/C all reachable,
- key reachable after intended prerequisite,
- elevator sequence cannot start before power/key requirements,
- all mandatory Renee/PA story milestones can fire,
- player can still reach all four stores,
- no Attendant nav regressions.

---

## Chapter 2 — Below Grade

Refactor/expand the prototype Service Level into a larger industrial chapter.

### New mechanics

#### Machinery noise zones

Continuous machinery creates acoustic masking.

Player benefit:

- lower effective footstep detection while inside loud masking volume.

Player cost:

- Attendant footsteps/audio cues are harder to hear,
- machine startup/shutdown may itself create strong investigate events.

This mechanic must be deterministic enough to learn.

#### Relay-routing tasks

D/E should require more than walking to a box and pressing E.

Examples:

- isolate a feeder before relay reset,
- power a pump to drain a route,
- choose which machine receives temporary power,
- cross a noisy room while a timed system cycle is active.

Avoid becoming an electrician simulator. The player should understand the logic visually.

### Gavin Cole set piece

Requires:

- authored body/remains presentation,
- modern inspection equipment,
- Contractor 13 ticket artifact,
- Renee reaction event,
- Journal person/evidence entries.

### Chapter-end transition

Below Grade should lead naturally into Security rather than directly climbing toward the final area.

---

## Chapter 3 — Eyes in Security

Build a surveillance-centered map.

### CCTV system

Required capabilities:

- multiple named camera feeds,
- simple map relationship to camera locations,
- Attendant rendered/represented on valid feeds,
- controlled false-image story moments,
- camera-group power states,
- no omniscient always-on tracking.

### Security shutter console

Player can change route topology by opening one controlled shutter/door while another closes.

Must modify:

- player collision,
- Attendant navigation blockers,
- visual state,
- CCTV route information.

### Luis set piece

Build secondary Security as a narrative room:

- barricade,
- disconnected PA chain,
- VHS player/monitor,
- route notes,
- Luis remains.

The player should understand much of the scene before collecting any text.

---

## Chapter 4 — The East Wing

Build a human-history chapter rather than another service maze.

### Spaces

- staff lockers,
- break room,
- training/management room,
- old anchor-store floor,
- shuttered tenant backs,
- receiving path.

### Radio-imitation system

Do not implement imitation as random fake subtitle spam.

Use authored story events.

Each false Renee message needs:

- a reason Pinewood knows the words,
- a verification inconsistency available in the environment,
- a controlled consequence that creates tension without unavoidable death.

After Pinewood learns Renee's authentication phrase, the game should communicate that clearly.

### Environmental personalization

Add evidence for:

- Tessa,
- Jo,
- ordinary staff life,
- 1997 closing practices.

Chapter 4 is where players should begin emotionally caring what happened rather than merely solving it.

---

## Chapter 5 — Accountability

Investigation-heavy chapter.

### Roster reconstruction system

The player assembles confirmed staff status using evidence.

The interface should avoid a free-form text puzzle.

Possible interaction:

- roster terminal displays known names,
- evidence unlocks status choices,
- uncertain names remain marked `UNRESOLVED`,
- correct facts populate automatically when sufficiently proven.

The player is solving the mystery by exploring, not by guessing spellings.

### Kessler records

Management-office evidence must establish:

- PCAS accountability feature,
- override behavior,
- falsified all-clear,
- reopening pressure.

### Eli set piece

Requires deliberate staging and should not be placed casually in a corridor.

The room/passage should contain:

- contractor tool case,
- old temporary badge,
- final work recorder,
- physical attempt to reach/bypass PA control,
- remains.

The Attendant should be audibly or visually active elsewhere after the discovery to disprove Eli-monster identity.

### Contractor 01–14 reveal

Use legacy session printouts/terminal data.

Not every previous session needs a complete victim biography. The point is recurrence.

---

## Chapter 6 — The Last Shift

### Memory overlay system

Create authored, location-specific alternate visual states rather than globally swapping arbitrary materials.

Each supported area can have:

- present-state group,
- 1997-memory group,
- transition lighting/audio parameters,
- historical staff silhouette events.

Transitions should be brief and controlled until the climax.

### Staff silhouettes

These are environmental echoes, not NPC ghosts.

They:

- perform a short closing action,
- never directly converse with the player,
- correspond to known 1997 events,
- disappear when the remembered state collapses.

### Final closing sequence

The player must use the reconstructed roster and systems knowledge.

Stages:

1. acknowledge staff departures,
2. clear service/key discrepancies,
3. process Eli Mercer,
4. observe `ACCOUNTABILITY: 1`,
5. realize Contractor 14 is the player,
6. clear contractor session at physical time/attendance control,
7. reach employee exit while PCAS recalls Contractor 14.

### The Attendant final behavior

Do not simply multiply movement speed.

Use learned rules:

- active staff-location calls create destination bias,
- player can predict/search-route movement,
- environmental noise and controlled calls remain usable,
- closing zones alter route choices.

The final chase should feel like mastery under pressure.

---

# 8. Corpse/remains production plan

Bodies require thoughtful assets and staging.

Permanent runtime rules still apply:

- all visible runtime assets local,
- verified license/provenance for third-party models,
- no remote fetches,
- no unverified ripped assets.

Options in preference order:

1. verified CC0 human/remains models suitable for modification,
2. original authored low-poly body/remains art created specifically for Pinewood,
3. composition of verified CC0 clothing/body-related meshes and original authored geometry.

Do not use generic standing character models merely rotated onto the floor.

Each remains scene gets a deterministic screenshot gate.

---

# 9. Character visual language

The game does not need living 3D NPC conversations to make the cast real.

Use:

- staff photos,
- ID badges,
- locker labels,
- handwriting,
- personal objects,
- voice recordings,
- security images,
- files,
- silhouettes in Chapter 6.

This keeps production achievable while creating a populated history.

If portrait art is created, use original assets designed for Pinewood and store them locally.

---

# 10. Audio and eventual voice acting

The narrative must remain functional with subtitles/text during development.

Voice acting can be layered later without changing story logic.

Plan separate speaker asset groups:

- Renee,
- Jo,
- Luis,
- Eli,
- Tessa,
- PCAS/intercom.

PCAS lines should use a consistent delivery profile distinct from human recordings.

When voice assets are added:

- local files only,
- normalize with the established audio pipeline,
- retain text subtitle equivalents,
- ensure all story events still work with audio disabled.

---

# 11. Story-integrity audit

Add `scripts/audit-story-integrity.mjs` before the six-chapter conversion is considered production-ready.

The audit should validate at minimum:

- exactly six chapter definitions,
- stable chapter IDs,
- LS-01 through LS-09 all defined exactly once,
- all mandatory evidence assigned to reachable chapters,
- all story-event prerequisite IDs exist,
- no circular prerequisite chains,
- every chapter has a valid completion event,
- standard ending can be reached without all optional evidence,
- true ending requires complete LS set,
- Eli cannot be cleared before required evidence,
- Contractor 14 final state cannot be resolved before the final chapter,
- old save migration produces valid story state,
- all player-facing character IDs resolve to Journal records.

---

# 12. Deterministic narrative simulation

Add a headless story-state simulator independent of manual WASD play.

It should be able to simulate sequences such as:

```text
start ch1
complete A/B/C
acquire key
complete elevator
start ch2
...
```

Verify:

- objectives progress,
- events do not double-fire,
- chapter transitions unlock correctly,
- evidence flags persist,
- endings choose correctly.

Create both paths:

### Critical-path simulation

Collect only mandatory evidence and reach standard ending.

### Completionist simulation

Collect all LS evidence and reach true ending.

This is essential because the project permanently forbids manual WASD playtesting as a development verification requirement.

---

# 13. Visual regression expansion

Current deterministic captures focus on Chapter 1 store/elevator geometry.

Expand capture presets as chapters are added.

Suggested minimum canonical views:

### Chapter 1

- central concourse/fountain,
- each authored store,
- freight elevator.

### Chapter 2

- primary electrical room,
- flooded/machinery zone,
- Gavin set piece.

### Chapter 3

- CCTV room,
- loading/shutter route,
- Luis set piece.

### Chapter 4

- employee locker room,
- anchor store,
- East Wing memory anomaly.

### Chapter 5

- management archive,
- roster terminal,
- Eli set piece.

### Chapter 6

- present/1997 comparison view,
- PA/accountability control,
- final employee exit.

No screenshot should require manual player navigation. Use deterministic camera/state hooks.

---

# 14. Asset acquisition plan

Before building a chapter, prepare an asset manifest for its distinctive environment.

Possible categories:

## Below Grade

- industrial pipe/valve systems,
- pumps,
- electrical cabinets,
- loading equipment,
- maintenance carts,
- pallets/crates.

## Security

- CRT monitors,
- desks,
- camera housings,
- tape/VHS equipment,
- key boards,
- filing/storage.

## East Wing

- lockers,
- break-room furniture,
- staff notice boards,
- old retail fixtures,
- office/training furniture.

## Accountability

- filing cabinets,
- archive shelving,
- old computer terminals,
- printers,
- time clock,
- paper/storage props.

All candidates must be license-verified and vendored before runtime use.

---

# 15. Map-design rule

Every chapter floorplan begins with gameplay routes and story spaces, not decorative geometry.

For each map define:

1. player spawn,
2. critical path,
3. optional exploration loops,
4. hiding locations,
5. Attendant routes,
6. distraction opportunities,
7. quiet story-processing rooms,
8. major evidence locations,
9. chapter climax route,
10. locked/controlled topology changes.

Run connectivity/navigation audits before dressing the environment.

---

# 16. Horror pacing rule

Do not keep The Attendant in constant pursuit.

Each chapter should alternate:

- exploration,
- uncertainty,
- evidence discovery,
- distant threat,
- hunt/search,
- decompression,
- set piece,
- escalation.

The player must sometimes desperately want something to happen because the quiet has lasted too long.

Chapter 5 in particular should contain long investigative silences.

---

# 17. Development phases and definitions of done

## Phase A — Narrative foundation

Deliver:

- `STORY_BIBLE.md`,
- this implementation plan,
- story data modules,
- save migration,
- story event manager,
- Journal data model,
- initial story integrity audit.

Definition of done:

- current game still boots,
- current three chapters still complete through automated simulation/audit,
- new framework can represent Chapter 1 dialogue/evidence without changing gameplay yet.

## Phase B — Chapter 1 narrative retrofit

Deliver expanded Closing Time story while preserving current geometry strengths.

Definition of done:

- Renee is established,
- LS-01–03 converted,
- circuit story states visible,
- Attendant reveal staged,
- elevator descent preserved,
- automated story path passes.

## Phase C — Chapter 2 Below Grade

Deliver full industrial/noise chapter and Gavin reveal.

Definition of done:

- chapter has distinct mechanics and map,
- D/E are meaningful tasks,
- Gavin set piece implemented,
- 1997 ticket reveal occurs reliably,
- chapter transition passes.

## Phase D — Chapter 3 Eyes in Security

Deliver CCTV/shutter chapter and Luis reveal.

Definition of done:

- CCTV useful and fair,
- Luis set piece implemented,
- voice/Attendant separation understood on critical path,
- route topology changes audited.

## Phase E — Chapter 4 East Wing

Deliver radio-imitation and staff-history chapter.

Definition of done:

- fake Renee sequence fair and authored,
- Tessa/Jo become established characters,
- East Wing has distinct visual identity,
- no unavoidable false-instruction deaths.

## Phase F — Chapter 5 Accountability

Deliver investigation/roster chapter and Eli reveal.

Definition of done:

- PCAS history understandable,
- Kessler cover-up established,
- Eli remains/recorder implemented,
- Contractor 01–14 reveal implemented,
- roster state ready for final chapter.

## Phase G — Chapter 6 Last Shift

Deliver memory-overlay closing ritual and both endings.

Definition of done:

- 1997 overlays authored and coherent,
- closing sequence uses prior knowledge,
- ACCOUNTABILITY 1 twist implemented,
- player self-clear/final pursuit works,
- standard and true endings both simulation-tested.

## Phase H — Production narrative polish

Deliver:

- pacing pass,
- optional evidence pass,
- voice/audio integration when available,
- accessibility/subtitle review,
- full six-chapter visual regression,
- full story-integrity regression,
- updated handoff/readme documentation.

---

# 18. Immediate next implementation step

After this plan is committed, begin **Phase A**.

Do not start constructing Chapter 4 assets first.

The first code work should be:

1. inspect the current save/story/dialogue architecture,
2. add a versioned story data layer,
3. add story flag/evidence persistence,
4. create the story event manager,
5. build the new Journal data model behind the existing UI,
6. write the first story-integrity audit,
7. migrate current Chapter 1 narrative into the framework without changing the public gameplay path,
8. verify runtime and Pages.

That gives every later chapter a stable narrative chassis instead of another generation of hard-coded story conditions.
