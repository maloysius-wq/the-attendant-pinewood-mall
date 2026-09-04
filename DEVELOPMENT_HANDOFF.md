# Development Handoff: The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** Always use the connected GitHub plugin/connector first for Pinewood repository work. Do not claim repository access is unavailable before checking GitHub.  
**Source-of-truth rule:** Read `AGENTS.md`, this file, `STORY_BIBLE.md`, and `NARRATIVE_IMPLEMENTATION_PLAN.md`, then inspect current `main` and recent workflow runs. Current repository state and the user's newest explicit request override old chat history.

---

## 0. Current canonical checkpoint — Chapters 1–5 live

As of September 4, 2026, the playable runtime on `main` is live through **Chapter 5: Accountability v24**.

Important commits immediately before this handoff refresh:

- `ee603433b3911b153e8aeaf60dd845e0572e8e06` — **Promote Chapter 5 Accountability v24 live**. This was squash-merged from PR #1 after both the global Runtime Audit and dedicated Chapter 5 Chromium regression passed.
- `f17c80e5593e0511130236a2453e78b9ec535a81` — **Make East Wing regression validate the live loader**. This converted an obsolete Chapter 4 staging workflow into a live regression gate after v24 became terminal.

The handoff refresh itself is documentation-only; when resuming development, inspect the actual current `main` HEAD rather than assuming the hashes above are still terminal.

### Current playable chapter stack

1. **Chapter 1 — Closing Time**
   - Story Foundation v17
   - Chapter 1 Story v18
   - local pre-rendered PCAS voice v19
   - reactive PCAS escalation v20
   - Renee Ward introduction, Contractor Fourteen escalation, LS-01 through LS-03

2. **Chapter 2 — Below Grade v21**
   - expanded industrial/service-level chapter
   - machinery/acoustic-risk identity
   - relay D/E progression
   - Gavin Cole / Contractor 13 material
   - Chapter 2 handoff into Security

3. **Chapter 3 — Eyes in Security v22 family**
   - CCTV/security identity
   - security route control and surveillance story systems
   - Luis set-piece material
   - readability/navigation polish through v22b/v22c/v22d
   - v22d is the current readability/feed-forward foundation for later chapters

4. **Chapter 4 — The East Wing v23 + v23b**
   - information-distrust / human-history chapter
   - staff lockers, Training, Receiving and route-map readability
   - Tessa/Jo/Luis history and LS-06
   - authored radio-imitation escalation and physical-verification mechanic
   - `PRE-1986-LOG` evidence
   - v23b is the final readability pass and now feeds forward cleanly into Chapter 5

5. **Chapter 5 — Accountability v24**
   - Records / Management investigation chapter
   - roster reconstruction from Jo's pages, payroll and physical time-clock records
   - LS-07 reconstructed final-shift roster
   - LS-09 Martin Kessler management override / falsified all-clear
   - sealed Eli Mercer utility passage
   - Eli's remains and contractor badge
   - LS-08 Eli final job recorder
   - contractor sessions 01–14 reconciliation
   - PA/accountability-control exit handoff toward Chapter 6
   - evidence/readability polish keeps Kessler's packet and Eli's reveal legible without flattening the dark Records atmosphere

### Current frontier

**Chapter 6 — The Last Shift is the next feature-development frontier.**

Do not begin by inventing a new Chapter 6 direction. Use the existing Chapter 6 section of `NARRATIVE_IMPLEMENTATION_PLAN.md` and the canon in `STORY_BIBLE.md`.

The intended Chapter 6 identity is:

- remembered 1997-state overlays,
- location-specific present/memory visual groups,
- historical staff silhouettes as environmental echoes rather than conversational ghosts,
- final closing/accountability ritual using knowledge earned in Chapters 1–5,
- final pursuit built from learned systems rather than merely increasing Attendant speed,
- standard and true-ending logic based on evidence/accountability state.

---

## 1. Critical Chapter 5 canon and implementation facts

These facts are now live and must not be casually rewritten:

### LS-07 — Final Shift Roster

LS-07 is reconstructed from **three independent sources**:

1. Jo Alvarez's handwritten closing pages,
2. Pinewood payroll archive,
3. physical punch/time-clock records.

The reconstructed physical exit count is **7 / 9**.

Confirmed physical exits:

- Jo Alvarez
- Tessa Kim
- Andre Bell
- Denise Park
- Marcus Reed
- Nina Flores
- Caleb Moss

No valid physical exit event:

- Luis Ortega
- Eli Mercer

The point of LS-07 is that Pinewood/PCAS's official clearance state does not match the physical record.

### LS-09 — Martin Kessler management override

Kessler's records establish that management approved an all-clear/reopening path despite an unresolved contractor exception. LS-09 is the management override evidence that opens the sealed route toward Eli's final location.

Kessler should remain a human accountability/cover-up element. Do not simplify the mystery into “the computer did everything by itself.”

### Eli Mercer and LS-08

Eli's remains are found in the sealed utility/PA-control approach with contractor-work context, including his temporary badge/tool-case staging.

LS-08 is Eli's final job recorder. It establishes that Eli was trying to resolve the unfinished closing/accountability condition and reach PA/records control.

**Eli is not The Attendant.** Chapter 5 deliberately disproves that interpretation. Current telemetry expresses this as `eliIsAttendant:false`.

### Contractor sessions 01–14

Chapter 5 reveals the recurrence structure through legacy contractor-session data. Sessions 01–14 are part of the same accountability pattern; Contractor Fourteen is the current player/session and is reserved for the final resolution in Chapter 6.

### Chapter 5 completion state

Chapter 5 ends at the PA/accountability-control route with the narrative checkpoint moving toward **`last_shift`**.

Chapter 6 must consume the reconstructed roster/systems knowledge rather than discard it and introduce an unrelated final puzzle.

---

## 2. Supernatural voice / imitation rule

There are two distinct concepts that must not be conflated:

1. **Chapter 4 authored radio imitation / information distrust** is implemented and intentional.
2. A broader supernatural runtime voice-imitation system using browser/cloud synthesis is **not** implemented and should not be smuggled in as a shortcut.

Permanent audio/runtime constraints remain:

- no browser `speechSynthesis`,
- no runtime ElevenLabs/OpenAI/Google TTS calls,
- no remote runtime media,
- authored PCAS voice assets remain local and pre-rendered,
- subtitles/text must remain sufficient for story functionality with audio disabled.

If Chapter 6 needs remembered or imitated human lines, author them deliberately within the established local-media pipeline and narrative rules. Do not create uncontrolled generative voice behavior.

---

## 3. Runtime loader architecture

`game.js` reconstructs the encoded base runtime from `bundle2/`, normalizes local Three.js imports, then applies authored patches in order.

The historical visual/system layers remain intentional and protected. The narrative tail currently feeds forward through:

1. `patches/retail-geometry-v16.js.txt`
2. `patches/story-foundation-v17.js.txt`
3. `patches/chapter1-story-v18.js.txt`
4. `patches/pcas-voice-v19.js.txt`
5. `patches/chapter1-pcas-escalation-v20.js.txt`
6. Chapter 2 Below Grade v21 patch layer
7. Chapter 3 Security v22 and readability layers through v22d
8. `patches/chapter4-east-wing-v23.js.txt`
9. `patches/chapter4-east-wing-readability-v23b.js.txt`
10. `patches/chapter5-accountability-v24.js.txt`

The terminal live source is now the v24 result, conceptually:

```js
const chapter5V24Source = await applyChapter5AccountabilityV24Runtime(
  chapter4V23BSource,
  chapter5V24Patch
);
const source = chapter5V24Source + '\n//# sourceURL=pinewood-runtime.js\n';
```

### Feed-forward audit lesson

Older audits/workflows must **not** assume their chapter remains terminal forever.

This caused two promotion problems:

- the old v22d audit assumed v23b had to remain the terminal source,
- the old Chapter 4 staging browser workflow tried to re-install v23/v23b after v24 was already live.

Both were corrected.

When adding Chapter 6, preserve this rule:

- an older chapter audit should validate its own source and the expected feed-forward relationship,
- if a newer chapter exists, require that newer chapter to consume the prior chapter's output,
- do not require an obsolete older source to remain the final `source=` assignment.

---

## 4. Current validation gates

### Global runtime audit

`.github/workflows/runtime-audit.yml` remains the broad static/reconstruction gate for the authored runtime stack and protected systems.

The Chapter 5 merge commit `ee603433...` passed the post-merge Runtime Audit on `main`.

### Chapter 5 live regression

`.github/workflows/staged-accountability-v24-regression.yml` is retained by filename for history, but its behavior is now a **live Chapter 5 Accountability regression**, not a staging installer.

It validates the committed live loader and runs Chromium capture for:

- `accountability-roster`
- `accountability-kessler`
- `accountability-eli`
- `accountability-sessions`

Expected invariants include:

- Chapter 5 version 24,
- `sceneBuilt: true`,
- LS-07 / LS-08 / LS-09 structure,
- 14 contractor sessions,
- `eliIsAttendant:false`,
- no page errors,
- no remote runtime media requests.

### Chapter 4 live regression

`.github/workflows/staged-east-wing-v23-regression.yml` is likewise retained by filename but is now a **live Chapter 4 East Wing regression**.

It no longer mutates `game.js` in the runner. It audits the committed v23b feed-forward state, launches Chromium against the current live loader, and captures:

- `east-wing-map`
- `east-wing-lockers`
- `east-wing-training`
- `east-wing-receiving`

The corrected live gate passed on `main` at `f17c80e5593e0511130236a2453e78b9ec535a81`.

### Chapter-specific audits relevant to the frontier

At minimum preserve and run:

- `scripts/audit-chapter3-security-readability-v22d.mjs`
- `scripts/audit-chapter4-east-wing-v23.mjs`
- `scripts/audit-chapter4-east-wing-readability-v23b.mjs`
- `scripts/audit-chapter5-accountability-v24.mjs`
- `scripts/capture-east-wing-v23.mjs`
- `scripts/capture-accountability-v24.mjs`

When Chapter 6 is introduced, add a dedicated Chapter 6 audit and deterministic browser capture gate rather than relying only on the global runtime audit.

---

## 5. Permanent local-runtime-asset rule

**Never use remote assets or remote browser libraries at runtime. Download/vendor verified dependencies into this repository and serve them locally.**

- Models, GLTF/GLB buffers and textures must be repository-local before runtime use.
- PBR/material textures, images and decals must be local.
- Sound effects, ambience, music and voice assets must be local.
- Three.js, Pako and future browser/runtime libraries must be pinned and served locally rather than from a CDN.
- External URLs are allowed only for provenance/documentation or development-time acquisition.
- New third-party assets require verified licensing, a vendored local copy, provenance and local-assets audit coverage.
- If licensing/provenance cannot be verified, omit the asset or choose another.
- Do not restore remote GitHub Raw / Poly Haven / OpenGameArt / CDN runtime fallbacks.

### Cassette Castle permanent shelf ban

Do not reintroduce the historically broken tiny shelf resources:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- aliases/URLs containing the corresponding Shelf Large / Shelf Small paths

Cassette Castle v14 remains authoritative for the final store layout, while v13's grounding/safety rules remain protected foundations.

---

## 6. Architecture constraints that must survive Chapter 6

Keep these systems conceptually separate:

1. authored walkable floorplan,
2. rendered geometry,
3. physical prop collision,
4. Attendant AI navigation,
5. story/save state.

Do not return to decorative geometry mutating the fundamental walkability grid.

Navigation-only blockers using `physicalBlock:false` remain valid where the player can enter a space that should be excluded from Attendant pathfinding.

Do not solve final-chapter difficulty by breaking route-distance sensing, wall protection, hiding rules, decoy behavior, or the learned sound/stamina model.

---

## 7. Player / Attendant fundamentals

Controls remain:

- WASD — move
- Mouse — look
- Shift — sprint
- C — hold breath / move quietly
- E — interact
- F — flashlight
- Q — throw decoy
- J — journal
- Esc — pause

The Attendant remains an original articulated black humanoid silhouette with emissive eyes, fuzzy/glitched edge treatment, gait animation, particles and afterimages.

Important behavior to preserve:

- valid physical contact kills outside hiding/safe states,
- decoys divert/distract,
- sprint is faster/louder,
- quiet movement is slower and consumes breath,
- danger/hearing respects navigable route/path distance rather than impossible through-wall Euclidean sensing,
- authored safe/AI-excluded spaces must remain reliable.

Chapter 6's final pursuit should build on these learned rules instead of replacing them with arbitrary speed multiplication.

---

## 8. Chapter 6 implementation target — The Last Shift

Follow the existing plan rather than improvising a seventh mystery layer.

### 8.1 Memory overlay system

Create authored, location-specific alternate states.

Supported areas should be able to define:

- present-state group,
- 1997-memory group,
- transition lighting parameters,
- transition audio parameters,
- historical silhouette events.

Do not globally swap arbitrary materials across the whole mall. The remembered state needs controlled, deterministic composition suitable for regression screenshots.

### 8.2 Staff silhouettes

They are environmental echoes, not friendly NPC ghosts.

They should:

- perform a short closing action,
- correspond to known 1997 events,
- never directly converse with the player,
- vanish when the remembered state collapses.

### 8.3 Final closing sequence

The implementation plan's required sequence is:

1. acknowledge staff departures,
2. clear service/key discrepancies,
3. process Eli Mercer,
4. observe `ACCOUNTABILITY: 1`,
5. realize Contractor 14 is the remaining account,
6. clear the contractor session at physical time/attendance control,
7. reach the employee exit while PCAS recalls Contractor 14.

This sequence should consume the evidence/history earned earlier, especially LS-07/08/09.

### 8.4 Final Attendant behavior

Use learned rules and destination bias rather than simply multiplying speed:

- active staff-location calls can bias search destination,
- player can predict and exploit route behavior,
- environmental noise and controlled calls remain useful,
- closing zones can alter route choices.

The intended feeling is mastery under pressure.

### 8.5 Ending integrity

Before treating the six-chapter story as production-ready, implement/finish the story-integrity and deterministic narrative simulation work described in `NARRATIVE_IMPLEMENTATION_PLAN.md`.

Key ending constraints:

- exactly six chapter definitions,
- LS-01 through LS-09 stable and unique,
- standard ending reachable without every optional item,
- true-ending path requires the intended complete evidence state,
- Eli cannot be cleared before required evidence,
- Contractor Fourteen cannot be resolved before Chapter 6,
- save migration remains valid.

---

## 9. Recommended development sequence from here

1. Re-read the Chapter 6 sections of `STORY_BIBLE.md` and `NARRATIVE_IMPLEMENTATION_PLAN.md`.
2. Inspect current `game.js`, `story/*`, v24 state contracts and current workflow gates.
3. Design Chapter 6 as a new feed-forward patch after v24, preserving the live Chapters 1–5 chain.
4. Implement the smallest complete Chapter 6 vertical slice first: chapter definition + map/entry + memory-overlay framework + first deterministic silhouette event.
5. Add a Chapter 6 static/reconstruction audit immediately.
6. Add deterministic Chapter 6 visual-test views immediately, not after all feature work.
7. Build the final closing sequence in ordered, testable stages.
8. Add final-pursuit route behavior without regressing existing Attendant systems.
9. Implement standard/true-ending state resolution and story-integrity checks.
10. Run global runtime audit plus Chapters 4–6 browser gates before promoting any final-chapter milestone.

Every intermediate `main` commit must remain bootable.

---

## 10. Known hygiene / historical notes

- PR #1 was the Chapter 5 promotion PR and was squash-merged successfully.
- Temporary Chapter 5 promotion/repair workflows created during diagnosis were removed after they served their purpose.
- Do not recreate self-editing CI workflows unless there is no safer option. Direct repository edits plus read-only validation are preferred.
- `node --check game.js` is not a valid standalone gate here because `game.js` uses top-level `await` while the repository is not configured as a Node ESM package. Existing audits syntax-check the assembled runtime through `.mjs` where appropriate.
- Some workflow filenames still contain the word `staged` for historical continuity even though the gates now validate the live runtime. Trust workflow content/current behavior, not the old filename.
- The old handoff's “current checkpoint v20” statement is obsolete and should never be used as a development baseline again.

---

## 11. Before editing anything in a future chat

A future developer/chat should perform these checks in order:

1. Read `AGENTS.md`.
2. Read this `DEVELOPMENT_HANDOFF.md`.
3. Read `STORY_BIBLE.md` and `NARRATIVE_IMPLEMENTATION_PLAN.md` for the chapter being changed.
4. Fetch current `main` HEAD and recent commits.
5. Inspect recent GitHub Actions results, especially Runtime Audit and chapter-specific browser regressions.
6. Read the current files being modified. Do not rely on snippets from an older conversation.
7. Keep all runtime assets local and licensed/provenanced.
8. Preserve feed-forward compatibility so adding Chapter 6 does not make Chapter 3/4/5 audits falsely demand that they remain terminal.

**Current feature frontier: Chapter 6 — The Last Shift.**
