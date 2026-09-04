# Development Handoff: The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** Use the connected GitHub connector first for Pinewood repository work. Do not claim repository access is unavailable before checking GitHub.  
**Source-of-truth rule:** Read `AGENTS.md`, this file, `STORY_BIBLE.md`, and `NARRATIVE_IMPLEMENTATION_PLAN.md`, then inspect current `main` and recent workflow runs. Current repository state and the user's newest explicit request override old chat history.

---

## 0. Current canonical checkpoint - six chapters live, production hardening v26 shipped

As of September 4, 2026, the playable runtime on `main` is live through **Chapter 6: The Last Shift v25**, with the cross-game **Production Readability / Visual Identity v26** pass applied after Chapter 6 as the terminal runtime patch.

Canonical v26 promotion commit:

- `5930515cfb5e17fb04627e6de621471f9b1b2a46` - **Ship production readability and visual identity v26**, squash-merged from PR #4 after the exact cleaned PR SHA passed the Runtime Audit, Chapter 4 regression, Chapter 5 regression, Chapter 6 regression, both Chapter 6 ending simulations, and the full six-chapter production-hardening browser suite.

PR #4 promoted only the permanent eight-file shipping diff. Temporary preview/tuning workflows and one-shot mutation helpers used during visual iteration were removed before merge.

Future work must always inspect the actual current `main` HEAD rather than assuming the hash above remains terminal. Documentation-only commits may follow this checkpoint without changing the runtime tree.

### Current playable chapter stack

1. **Chapter 1 - Closing Time**
   - Story Foundation v17
   - Chapter 1 Story v18
   - local pre-rendered PCAS voice v19
   - reactive PCAS escalation v20
   - Renee Ward introduction, Contractor Fourteen escalation, LS-01 through LS-03
   - retains the authored retail material language that v26 intentionally does not replace

2. **Chapter 2 - Below Grade v21 + v26 presentation hardening**
   - industrial/service-level identity
   - relay D/E progression and machinery/acoustic-risk gameplay
   - Gavin Cole / Contractor 13 material
   - Chapter 2 handoff into Security
   - v26 preserves the intentionally dark horror grade while making service architecture, navigation, and industrial fixtures readable instead of crushed into black

3. **Chapter 3 - Eyes in Security v22 family + v26 compatibility**
   - CCTV/security identity and surveillance systems
   - Luis set-piece material
   - readability/navigation polish through v22b/v22c/v22d
   - v22d remains a protected feed-forward readability foundation
   - v26 preserves the stronger authored Security read rather than flattening it into the newer surface treatment

4. **Chapter 4 - The East Wing v23 + v23b + v26 compatibility**
   - information-distrust / human-history chapter
   - staff lockers, Training, Receiving and route-map readability
   - Tessa/Jo/Luis history and LS-06
   - authored radio-imitation escalation and physical-verification mechanic
   - `PRE-1986-LOG` evidence
   - v23b remains the chapter's protected readability foundation and feeds forward correctly through v26

5. **Chapter 5 - Accountability v24 + v26 presentation hardening**
   - Records / Management investigation chapter
   - LS-07 final-shift roster reconstructed from Jo's pages, payroll, and physical time-clock records
   - LS-09 Martin Kessler management override / falsified all-clear
   - sealed Eli Mercer route, Eli's remains and contractor badge
   - LS-08 Eli final job recorder
   - contractor sessions 01-14 reconciliation
   - PA/accountability-control handoff into Chapter 6
   - `eliIsAttendant:false` is canonical
   - v26 adds a clearer Records identity and motivated visibility without making the chapter bright

6. **Chapter 6 - The Last Shift v25 + v26 presentation hardening**
   - PA / accountability-control environment
   - authored location-specific present/1997 memory overlays
   - historical staff silhouettes as environmental closing echoes, not conversational ghosts
   - ordered closing ritual consuming Chapters 1-5 evidence and systems knowledge
   - Contractor 14 physical clock-out and east Employee Exit
   - final PCAS recalls route the Attendant toward named closing stations using existing `investigate` pathing
   - decoy counterplay remains valid
   - no finale speed multiplier / hunt shortcut
   - standard ending and true ending are both implemented and regression-tested
   - v26 strengthens PA Control's authored surface identity and task readability while preserving finale contrast

### What v26 shipped

`patches/production-readability-v26.js.txt` is now the final feed-forward runtime patch after Chapter 6. The pass includes:

- chapter-specific wall/floor/surface identity treatment for Chapters 2-6,
- preservation of Chapter 1's authored retail materials,
- preservation of the stronger existing Security and East Wing readability passes,
- motivated readability lighting rather than global brightness inflation,
- Cassette Castle fixture/merchandise visibility improvements,
- Below Grade industrial/service readability improvements,
- Records and PA Control task/readability improvements,
- a corrected title-screen kicker: **`PINEWOOD MALL • AFTER HOURS`** instead of a misleading fixed year,
- source/audit markers used by the permanent v26 gate.

Do not undo the final dark-scene correction by globally lifting exposure or ambient light. The approved target is **readable darkness**, not a bright mall.

### Current development frontier

**The six-chapter story and the first full-game production-readability pass are complete. The next frontier is real playthrough validation, accessibility, balance, reliability, performance, ending presentation polish, dead-asset cleanup, and deployment validation.**

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

### LS-07 - Final Shift Roster

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

### LS-09 - Martin Kessler override

Kessler's records establish that management approved an all-clear/reopening path despite an unresolved contractor exception. Kessler remains a human accountability / cover-up element. Do not rewrite the mystery as "the computer did everything by itself."

### Eli Mercer / LS-08

Eli's remains are found in the sealed utility / PA-control approach with contractor-work context. LS-08 establishes that Eli was trying to resolve the unfinished closing/accountability condition and reach PA control.

**Eli is not The Attendant.** Chapter 5 deliberately disproves that interpretation.

### Contractor sessions

Legacy contractor sessions 01-14 are descendants of the same unresolved work-order/accountability pattern.

- Eli Mercer is Contractor Session 01.
- Gavin Cole is Contractor 13.
- The player is Contractor 14.
- Contractor 14 cannot be resolved before Chapter 6.

---

## 2. Chapter 6 canonical sequence

The final closing sequence is implemented in this order:

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

The Attendant is routed through its existing `investigate` behavior and A* pathing toward the recalled location. The finale does not switch to a special speed buff or arbitrary `hunt` shortcut. Active decoys remain valid counterplay.

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

The current narrative/presentation tail feeds forward through:

1. `patches/retail-geometry-v16.js.txt`
2. `patches/story-foundation-v17.js.txt`
3. `patches/chapter1-story-v18.js.txt`
4. `patches/pcas-voice-v19.js.txt`
5. `patches/chapter1-pcas-escalation-v20.js.txt`
6. `patches/chapter2-below-grade-v21.js.txt`
7. Chapter 3 Security v22 family through v22d
8. `patches/chapter4-east-wing-v23.js.txt`
9. `patches/chapter4-east-wing-readability-v23b.js.txt`
10. `patches/chapter5-accountability-v24.js.txt`
11. `patches/chapter6-last-shift-v25.js.txt`
12. `patches/production-readability-v26.js.txt`

The terminal live runtime source is now the v26 result, conceptually:

```js
const chapter6V25Source = await applyChapter6LastShiftV25Runtime(
  chapter5V24Source,
  chapter6V25Patch
);
const productionReadabilityV26Source = await applyProductionReadabilityV26Runtime(
  chapter6V25Source,
  productionReadabilityV26Patch
);
const source = productionReadabilityV26Source + '\n//# sourceURL=pinewood-runtime.js\n';
```

### Feed-forward rule

Older audits must validate their own chapter plus the expected feed-forward relationship. They must not demand that their chapter remain the terminal runtime forever.

If a future post-v26 patch is added, extend the v26 and downstream audit expectations in the same pattern. Do not remove older chapter invariants simply to make a new terminal patch pass.

---

## 5. Current validation gates

### Global runtime audit

`.github/workflows/runtime-audit.yml`

Broad reconstruction/static gate for the authored runtime stack and protected systems.

### Store / full visual regression

`.github/workflows/visual-regression.yml`

Historical full visual capture suite used to protect store, service, Security, and East Wing presentation. `scripts/capture-store-visuals.mjs` currently exercises 16 deterministic browser views and validates local-only media/runtime invariants while capturing screenshots.

### Chapter 3 Security regression

`.github/workflows/security-v22-regression.yml`

Live Security regression and browser capture protection for the v22 family.

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

Permanent live gate for pushes to `main`, pull requests targeting `main`, and manual dispatch. It runs:

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

### Six-chapter production hardening v26

`.github/workflows/production-hardening-v26.yml`

This is the permanent cross-game gate added by PR #4. It runs on relevant pushes to `main`, pull requests targeting `main`, and manual dispatch.

It performs:

1. the complete authored runtime audit chain through v26,
2. Playwright Chromium installation,
3. a local Pinewood server using only vendored runtime dependencies,
4. `scripts/smoke-production-v26.mjs` for title/menu state, saves/migrations, and representative HUD/runtime state for all six chapters,
5. `scripts/capture-store-visuals.mjs` for Chapters 1-4 deterministic browser views,
6. `scripts/capture-accountability-v24.mjs` for Chapter 5,
7. `scripts/simulate-chapter6-finale-v25.mjs` for both endings,
8. `scripts/capture-last-shift-v25.mjs` for Chapter 6,
9. production artifact upload.

The exact cleaned PR #4 head passed this complete gate before merge. The merge commit contains the same runtime tree and triggers the same gate on `main`.

### v26 source audit and smoke scripts

- `scripts/audit-production-readability-v26.mjs`
- `scripts/smoke-production-v26.mjs`

These are permanent. Do not replace them with one-shot tuning scripts.

### Useful direct audit commands

```bash
node scripts/audit-chapter3-security-readability-v22d.mjs
node scripts/audit-chapter5-accountability-v24.mjs
node scripts/audit-chapter6-finale-source-v25.mjs
node scripts/audit-chapter6-last-shift-v25.mjs
node scripts/audit-production-readability-v26.mjs
node scripts/audit-runtime.mjs
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

Cassette Castle v14 remains authoritative for the final store layout, with v13 grounding/safety rules retained as protected foundations. v26 only improves readability around the approved authored layout; it does not revoke this ban.

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

Presentation/readability work should prefer authored materials, localized task lights, fixture visibility, signage, and surface identity over global exposure changes.

---

## 8. Player / Attendant fundamentals

Controls:

- WASD - move
- Mouse - look
- Shift - sprint
- C - hold breath / move quietly
- E - interact
- F - flashlight
- Q - throw decoy
- J - journal
- Esc - pause

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

The story implementation phase and first cross-game visual-readability pass are complete. Prioritize in roughly this order unless the user requests something specific:

1. full six-chapter manual playthrough / blocker audit from a clean save,
2. save migration / Continue validation across older save shapes,
3. keyboard/mouse interaction and objective-clarity pass,
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
- PR #4 promoted the full-game production readability / visual identity v26 pass.
- PR #4's shipping diff was reduced to eight permanent files before merge.
- Temporary v26 identity-preview, surface-tuning, and dark-scene-tuning workflows were removed before promotion.
- Temporary one-shot v26 Python tuning helpers were removed before promotion.
- `scripts/audit-production-readability-v26.mjs`, `scripts/smoke-production-v26.mjs`, and `.github/workflows/production-hardening-v26.yml` are permanent.
- Prefer direct repository edits plus read-only validation. Avoid self-editing CI workflows unless there is no safer practical option.
- `.js.txt` patch files are JavaScript source despite their extension. `node --check` needs a temporary `.mjs` copy when directly syntax-checking those bytes.
- `node --check game.js` is not a valid standalone repository gate because `game.js` uses top-level `await` while the repository is not configured as a Node ESM package. Existing audits reconstruct and syntax-check through `.mjs` where appropriate.
- Some older workflow filenames still contain `staged` for historical continuity even though their behavior is live. Trust workflow content, not the old filename.
- The final v26 visual review explicitly corrected crushed blacks in Below Grade and weak retail/fixture readability in Cassette Castle. Do not regress those scenes to near-black silhouettes.
- Do not revive obsolete handoff claims that Chapter 1 v20, Chapter 5 v24, Chapter 6 planning, or v26 production readability are still the current frontier.

---

## 11. Before editing in a future chat

1. Read `AGENTS.md`.
2. Read this `DEVELOPMENT_HANDOFF.md`.
3. Read `STORY_BIBLE.md` and `NARRATIVE_IMPLEMENTATION_PLAN.md` for canon before changing narrative content.
4. Inspect the current `main` HEAD. Do not assume the checkpoint hash in this file is still terminal.
5. Inspect recent GitHub Actions runs on `main` before changing protected runtime systems.
6. Treat `game.js` as a patch loader, not the authored game source itself.
7. Preserve the full feed-forward chain through Production Readability v26 unless a newer intentional patch supersedes it.
8. Preserve all local-runtime-only asset rules.
9. Preserve both Chapter 6 endings and the LS-01 through LS-09 true-ending evidence contract.
10. Do not create Chapter 7 unless explicitly requested.

**Current feature frontier: post-v26 production validation, accessibility, balance, reliability, performance, deployment verification, and polish.**
