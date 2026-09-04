# Development Handoff: The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** Use the connected GitHub connector first for Pinewood repository work. Do not claim repository access is unavailable before checking GitHub.  
**Source-of-truth rule:** Read `AGENTS.md`, this file, `STORY_BIBLE.md`, and `NARRATIVE_IMPLEMENTATION_PLAN.md`, then inspect current `main` and recent workflow runs. Current repository state and the user's newest explicit request override old chat history.

---

## 0. Current canonical checkpoint — all six chapters live

As of September 4, 2026, the playable runtime on `main` is live through **Chapter 6: The Last Shift v25**, including both the standard and true endings.

Canonical Chapter 6 promotion commit:

- `9fed05f8df48ea5763fff5b7d154ed6a92f9542d` — **Promote Chapter 6 The Last Shift v25 live**, squash-merged from PR #2 after the global Runtime Audit, Chapter 4 regression, Chapter 5 regression, dedicated Chapter 6 source/reconstruction audit, deterministic two-ending simulation, and seven-view Chapter 6 Chromium regression passed.

The handoff refresh that follows that merge is documentation / CI housekeeping. Future work must always inspect the actual current `main` HEAD rather than assuming the hash above is still terminal.

### Current playable chapter stack

1. **Chapter 1 — Closing Time**
   - Story Foundation v17
   - Chapter 1 Story v18
   - local pre-rendered PCAS voice v19
   - reactive PCAS escalation v20
   - Renee Ward introduction, Contractor Fourteen escalation, LS-01 through LS-03

2. **Chapter 2 — Below Grade v21**
   - industrial/service-level identity
   - relay D/E progression and machinery/acoustic-risk gameplay
   - Gavin Cole / Contractor 13 material
   - Chapter 2 handoff into Security

3. **Chapter 3 — Eyes in Security v22 family**
   - CCTV/security identity and surveillance systems
   - Luis set-piece material
   - readability/navigation polish through v22b/v22c/v22d
   - v22d remains the feed-forward readability foundation for later chapters

4. **Chapter 4 — The East Wing v23 + v23b**
   - information-distrust / human-history chapter
   - staff lockers, Training, Receiving and route-map readability
   - Tessa/Jo/Luis history and LS-06
   - authored radio-imitation escalation and physical-verification mechanic
   - `PRE-1986-LOG` evidence
   - v23b readability pass feeds forward into Chapter 5

5. **Chapter 5 — Accountability v24**
   - Records / Management investigation chapter
   - LS-07 final-shift roster reconstructed from Jo's pages, payroll, and physical time-clock records
   - LS-09 Martin Kessler management override / falsified all-clear
   - sealed Eli Mercer route, Eli's remains and contractor badge
   - LS-08 Eli final job recorder
   - contractor sessions 01–14 reconciliation
   - PA/accountability-control handoff into Chapter 6
   - `eliIsAttendant:false` is canonical

6. **Chapter 6 — The Last Shift v25**
   - PA / accountability-control environment
   - authored location-specific present/1997 memory overlays
   - historical staff silhouettes as environmental closing echoes, not conversational ghosts
   - ordered closing ritual consuming Chapters 1–5 evidence and systems knowledge
   - Contractor 14 physical clock-out and east Employee Exit
   - final PCAS recalls route the Attendant toward named closing stations using existing `investigate` pathing
   - decoy counterplay remains valid
   - no finale speed multiplier / hunt shortcut
   - standard ending and true ending are both implemented and regression-tested

### Current development frontier

**The six-chapter story is implemented. The next frontier is production hardening, playthrough validation, accessibility, balance, presentation polish, and bug fixing.**

Do **not** invent Chapter 7 or a new mystery layer unless the user explicitly asks for additional story content.

---

## 1. Canon that must remain stable

### Last Shift evidence IDs

The canonical Last Shift evidence set is exactly:

- LS-01
- LS-02
- LS-03
- LS-04
- LS-05
- LS-06
- LS-07
- LS-08
- LS-09

All nine remain unique and are the intended complete-evidence requirement for the true ending.

### LS-07 — Final Shift Roster

LS-07 is reconstructed from three independent physical sources:

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

The point is that Pinewood/PCAS's official clearance state does not match the physical record.

### LS-09 — Martin Kessler override

Kessler's records establish that management approved an all-clear/reopening path despite an unresolved contractor exception. Kessler remains a human accountability / cover-up element. Do not rewrite the mystery as “the computer did everything by itself.”

### Eli Mercer / LS-08

Eli's remains are found in the sealed utility / PA-control approach with contractor-work context. LS-08 establishes that Eli was trying to resolve the unfinished closing/accountability condition and reach PA control.

**Eli is not The Attendant.** Chapter 5 deliberately disproves that interpretation.

### Contractor sessions

Legacy contractor sessions 01–14 are descendants of the same unresolved work-order/accountability pattern.

- Eli Mercer is Contractor Session 01.
- Gavin Cole is Contractor 13.
- The player is Contractor 14.
- Contractor 14 cannot be resolved before Chapter 6.

---

## 2. Chapter 6 canonical sequence

The final closing sequence is now implemented in this order:

1. acknowledge seven confirmed staff departures at Staff Accountability,
2. clear Key Control and Service State discrepancies,
3. process Eli Mercer / Contractor 01 using required evidence,
4. observe `ACCOUNTABILITY: 1`,
5. identify Contractor 14 as the remaining active account,
6. physically clock out Contractor 14 at Time / Attendance,
7. cross Pinewood toward the east Employee Exit while PCAS issues location-specific recalls,
8. release the Employee Exit,
9. cross the exit threshold and resolve the ending.

Required state ordering is enforced. In particular:

- Eli cannot be processed before staff/key/service prerequisites and LS-08/LS-09 + Eli-body evidence.
- Contractor 14 cannot clock out before `ACCOUNTABILITY: 1`.
- Employee Exit cannot release before Contractor 14 clock-out.

### Final Attendant behavior

The finale deliberately builds on learned rules rather than replacing them with raw difficulty inflation.

PCAS recall destinations cycle through named closing locations such as:

- PA CONTROL
- KEY CONTROL
- SERVICE STATE
- STAFF ACCOUNTABILITY

The Attendant is routed through its existing `investigate` behavior and A* pathing toward the recalled location. The finale does not switch to a special speed buff or arbitrary `hunt` shortcut. Active decoys remain a valid counterplay.

### Standard ending

Canonical ending ID: `pinewood_closed`.

The active Contractor 14 ticket closes and Pinewood announces the mall is closed, but incomplete historical evidence leaves the underlying recurrence unresolved. A later dispatch request appears as **CONTRACTOR 15**.

### True ending

Canonical ending ID: `everyone_clocked_out`.

Requires the complete LS-01 through LS-09 evidence state. The final resolution reaches **`ACCOUNTABILITY: 0`**, the original Pinewood work order is archived, the Attendant becomes still / its white eyes extinguish, and no Contractor 15 is created.

---

## 3. Supernatural voice / imitation rule

There are two separate concepts:

1. **Chapter 4 authored radio imitation / information distrust** is implemented and intentional.
2. A broad supernatural runtime voice-imitation system using browser/cloud synthesis is **not** implemented and must not be added as a shortcut.

Permanent runtime constraints:

- no browser `speechSynthesis`,
- no runtime ElevenLabs/OpenAI/Google TTS calls,
- no remote runtime media,
- authored PCAS voice assets remain local and pre-rendered,
- subtitles/text remain sufficient for story functionality with audio disabled.

Chapter 6's Renee/unknown overlap and PCAS recall material is authored dialogue, not uncontrolled generative voice behavior.

---

## 4. Runtime loader architecture

`game.js` reconstructs the encoded base runtime from `bundle2/`, normalizes local Three.js imports, then applies authored patches in order.

The narrative tail now feeds forward through:

1. `patches/retail-geometry-v16.js.txt`
2. `patches/story-foundation-v17.js.txt`
3. `patches/chapter1-story-v18.js.txt`
4. `patches/pcas-voice-v19.js.txt`
5. `patches/chapter1-pcas-escalation-v20.js.txt`
6. Chapter 2 Below Grade v21
7. Chapter 3 Security v22 family through v22d
8. `patches/chapter4-east-wing-v23.js.txt`
9. `patches/chapter4-east-wing-readability-v23b.js.txt`
10. `patches/chapter5-accountability-v24.js.txt`
11. `patches/chapter6-last-shift-v25.js.txt`

The terminal live runtime source is the v25 result, conceptually:

```js
const chapter6V25Source = await applyChapter6LastShiftV25Runtime(
  chapter5V24Source,
  chapter6V25Patch
);
const source = chapter6V25Source + '\n//# sourceURL=pinewood-runtime.js\n';
```

### Feed-forward rule

Older audits must validate their own chapter plus the expected feed-forward relationship. They must not demand that their chapter remain the terminal runtime forever.

If a future post-v25 patch is added, Chapter 6's audit should be extended in the same manner rather than requiring v25 to remain terminal.

---

## 5. Current validation gates

### Global runtime audit

`.github/workflows/runtime-audit.yml`

Broad reconstruction/static gate for the authored runtime stack and protected systems.

### Chapter 4 live regression

`.github/workflows/staged-east-wing-v23-regression.yml`

Historical filename, live behavior. Chromium regression against the current loader for:

- `east-wing-map`
- `east-wing-lockers`
- `east-wing-training`
- `east-wing-receiving`

### Chapter 5 live regression

`.github/workflows/staged-accountability-v24-regression.yml`

Historical filename, live behavior. Chromium regression for:

- `accountability-roster`
- `accountability-kessler`
- `accountability-eli`
- `accountability-sessions`

### Chapter 6 live regression

`.github/workflows/chapter6-last-shift-v25-regression.yml`

This is a permanent live gate for pushes to `main`, pull requests targeting `main`, and manual dispatch. It runs:

1. `scripts/audit-chapter6-finale-source-v25.mjs`
2. `scripts/audit-chapter6-last-shift-v25.mjs`
3. Playwright Chromium setup
4. local Pinewood HTTP server
5. `scripts/simulate-chapter6-finale-v25.mjs`
6. `scripts/capture-last-shift-v25.mjs`
7. artifact upload

Seven deterministic visual views:

- `last-shift-control`
- `last-shift-memory`
- `last-shift-echo`
- `last-shift-roster`
- `last-shift-eli-control`
- `last-shift-clockout`
- `last-shift-exit`

The finale simulation proves both standard and true endings plus prerequisite lockouts.

The patch-source audit specifically protects against nested template literals / generated-runtime string escaping errors in the `.js.txt` patch architecture.

### Useful direct audit commands

```bash
node scripts/audit-chapter3-security-readability-v22d.mjs
node scripts/audit-chapter5-accountability-v24.mjs
node scripts/audit-chapter6-finale-source-v25.mjs
node scripts/audit-chapter6-last-shift-v25.mjs
```

Browser scripts require Playwright and a local server, as configured in the workflows.

---

## 6. Permanent local-runtime-asset rule

**Never use remote assets or remote browser libraries at runtime. Download/vendor verified dependencies into this repository and serve them locally.**

- models, GLTF/GLB buffers and textures must be repository-local,
- PBR/material textures, images and decals must be local,
- sound effects, ambience, music and voice assets must be local,
- Three.js, Pako and future browser/runtime libraries must be pinned and served locally,
- external URLs are allowed only for provenance/documentation or development-time acquisition,
- new third-party assets require verified licensing, a vendored local copy, provenance and local-assets audit coverage,
- if licensing/provenance cannot be verified, omit the asset or choose another,
- do not restore remote GitHub Raw / Poly Haven / OpenGameArt / CDN runtime fallbacks.

### Cassette Castle permanent shelf ban

Do not reintroduce:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- aliases/URLs containing the corresponding Shelf Large / Shelf Small paths

Cassette Castle v14 remains authoritative for the final store layout, with v13 grounding/safety rules retained as protected foundations.

---

## 7. Architecture constraints

Keep these systems conceptually separate:

1. authored walkable floorplan,
2. rendered geometry,
3. physical prop collision,
4. Attendant AI navigation,
5. story/save state.

Do not return to decorative geometry mutating fundamental walkability.

Navigation-only blockers using `physicalBlock:false` remain valid where the player can enter a space that should be excluded from Attendant pathfinding.

Do not break route-distance sensing, wall protection, hiding rules, decoy behavior, or the learned sound/stamina model to manufacture difficulty.

---

## 8. Player / Attendant fundamentals

Controls:

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

Behavior to preserve:

- valid physical contact kills outside hiding/safe states,
- decoys divert/distract,
- sprint is faster/louder,
- quiet movement is slower and consumes breath,
- danger/hearing respects navigable route/path distance rather than impossible through-wall Euclidean sensing,
- authored safe / AI-excluded spaces remain reliable.

---

## 9. Recommended work from here

The story implementation phase is complete. Prioritize in roughly this order unless the user requests something specific:

1. full six-chapter manual playthrough / blocker audit from a clean save,
2. save migration / continue-game validation across older save shapes,
3. keyboard/mouse interaction and objective clarity pass,
4. accessibility pass: subtitles, contrast, motion/flicker, audio-independent story comprehension,
5. difficulty / stamina / decoy / Attendant-route balance,
6. checkpoint and death/retry reliability,
7. standard and true-ending presentation polish,
8. performance testing on lower-end integrated graphics,
9. local-asset/provenance audit and dead-asset cleanup,
10. production/deployment smoke test from the actual GitHub Pages build.

Do not add new story chapters merely because Chapter 6 is complete.

---

## 10. Known hygiene / lessons

- PR #1 promoted Chapter 5 v24.
- PR #2 promoted Chapter 6 v25.
- Temporary Chapter 5/6 promotion and repair workflows used during diagnosis were removed after use.
- Prefer direct repository edits plus read-only validation. Avoid self-editing CI workflows unless there is no safer practical option.
- `.js.txt` patch files are JavaScript source despite their extension. `node --check` needs a temporary `.mjs` copy when directly syntax-checking those bytes.
- `node --check game.js` is not a valid standalone repository gate because `game.js` uses top-level `await` while the repository is not configured as a Node ESM package. Existing audits reconstruct and syntax-check through `.mjs` where appropriate.
- Some older workflow filenames still contain `staged` for historical continuity even though their behavior is live. Trust workflow content, not the old filename.
- Do not revive obsolete handoff claims that Chapter 1 v20, Chapter 5 v24, or Chapter 6 planning is the current frontier.

---

## 11. Before editing in a future chat

1. Read `AGENTS.md`.
2. Read this `DEVELOPMENT_HANDOFF.md`.
3. Read `STORY_BIBLE.md` and `NARRATIVE_IMPLEMENTATION_PLAN.md` for relevant canon/constraints.
4. Fetch current `main` HEAD and recent commits.
5. Inspect recent GitHub Actions results, especially Runtime Audit and Chapters 4–6 browser regressions.
6. Read the current files being modified. Do not rely on snippets from an older conversation.
7. Keep all runtime assets local and licensed/provenanced.
8. Preserve feed-forward compatibility for older chapter audits.
9. Do not create Chapter 7 unless explicitly requested.

**Current feature frontier: six-chapter production hardening and polish.**
