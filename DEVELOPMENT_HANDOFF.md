# Development Handoff: The Attendant: Pinewood Mall

**Repository:** `maloysius-wq/the-attendant-pinewood-mall`  
**Default branch:** `main`  
**Deployment:** GitHub Pages from repository root  
**Repository access rule:** Use the connected GitHub connector first for Pinewood repository work.  
**Source-of-truth rule:** Read this file, `AGENTS.md`, `STORY_BIBLE.md`, and `NARRATIVE_IMPLEMENTATION_PLAN.md`, then inspect the actual current `main` HEAD and current workflow runs. The repository and the user's newest explicit request override old chat history.

---

## 0. Current canonical checkpoint: six chapters live, Audio Direction v27 shipped

As of September 6, 2026, all six authored chapters are live on `main`. The production runtime now feeds forward through Chapter 6 v25, Production Readability / Visual Identity v26, and **Audio Direction v27** as the terminal runtime layer.

Important checkpoints:

- `5930515cfb5e17fb04627e6de621471f9b1b2a46` — **Ship production readability and visual identity v26**.
- `aa89d989b88e33f62ef947c69de534607f3b3e2d` — **Ship sparse serialized voices and deep PCAS v27**. This is the current runtime-changing production checkpoint.
- `3b644f263d38b94368288ec101235d5ffca6e2f5` — **Fold Audio Direction v27 into production hardening**. This promotes the permanent cross-game hardening workflow to validate v27 as part of the comprehensive gate while retaining the historical workflow filename `.github/workflows/production-hardening-v26.yml`.

Documentation and workflow-only commits may follow these hashes without changing the playable runtime tree. Always inspect actual `main` before assuming any listed SHA remains terminal.

### Current playable stack

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
   - handoff into Security

3. **Chapter 3 — Eyes in Security v22 family**
   - CCTV/security identity and surveillance systems
   - Luis set-piece material
   - readability/navigation polish through v22b/v22c/v22d
   - v22d remains a protected feed-forward readability foundation

4. **Chapter 4 — The East Wing v23 + v23b**
   - information-distrust / human-history chapter
   - staff lockers, Training, Receiving, route-map readability
   - Tessa/Jo/Luis history and LS-06
   - authored radio-imitation escalation and physical-verification mechanic
   - `PRE-1986-LOG` evidence

5. **Chapter 5 — Accountability v24**
   - Records / Management investigation
   - LS-07 final-shift roster
   - LS-09 Martin Kessler management override / falsified all-clear
   - sealed Eli Mercer route, Eli's remains and contractor badge
   - LS-08 Eli final job recorder
   - contractor sessions 01-14 reconciliation
   - `eliIsAttendant:false` is canonical

6. **Chapter 6 — The Last Shift v25**
   - PA / accountability-control environment
   - present/1997 memory overlays
   - ordered closing ritual consuming Chapters 1-5 evidence and systems knowledge
   - Contractor 14 physical clock-out and east Employee Exit
   - PCAS recalls route the Attendant toward named closing stations through existing `investigate` pathing
   - standard and true endings are implemented and regression-tested

7. **Production Readability / Visual Identity v26**
   - terminal presentation/readability layer before v27 audio
   - chapter-specific surface identity for Chapters 2-6
   - preserves Chapter 1 retail materials and the stronger Security/East Wing authored readability
   - motivated visibility rather than global brightness inflation
   - title kicker is `PINEWOOD MALL • AFTER HOURS`
   - approved target remains **readable darkness**, not a bright mall

8. **Audio Direction v27**
   - terminal live runtime layer after v26
   - sparse serialized PCAS and character voices
   - local-only lazy-loaded voice assets
   - overlap-safe voice reservation so authored voices do not pile on top of each other
   - deeper PCAS coverage while preserving deliberate quiet
   - authored radio-character voices remain separate from uncontrolled synthesis

### Audio Direction v27 production contract

The v27 local manifests are:

- `assets/audio/pa/manifest.json`
- `assets/audio/characters/manifest.json`

The permanent v27 smoke currently protects:

- PCAS manifest revision `27` with 25 authored PCAS entries,
- character manifest version `27` with 47 authored character entries,
- opening quiet window of 45 seconds,
- ambient PCAS spacing of 72-118 seconds,
- local OGG delivery for representative PCAS, Renee, fake-Renee/radio, Jo, and Eli material,
- no browser requests escaping the local Pinewood origin,
- no browser errors during the deterministic v27 smoke,
- runtime telemetry flags for sparse PCAS, serialized voices, radio voices, and deep PCAS.

Do not turn v27 into constant chatter. Silence is part of the horror pacing.

### Current development frontier

The approved story is complete. Continue with **validation and hardening**, not Chapter 7.

Priority areas:

1. keep the comprehensive v27 gate green,
2. verify GitHub Pages serves the current runtime and all local audio assets,
3. improve accessibility, reliability, balance, performance, and ending presentation only when supported by deterministic tests,
4. validate audio behavior around mute/unmute, browser autoplay restrictions, save/reload, chapter transitions, and representative mobile layouts,
5. clean dead assets only when source and runtime audits prove they are unused.

Per `AGENTS.md`, do **not** perform manual interactive WASD playtests. Use source inspection, deterministic browser tests, telemetry, captures, and deployment verification instead.

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

All nine are unique and form the complete-evidence requirement for the true ending.

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

Kessler's records establish that management approved an all-clear/reopening path despite an unresolved contractor exception. Human accountability remains part of the story. Do not rewrite the mystery as "the computer did everything by itself."

### Eli Mercer / LS-08

Eli's remains are found in the sealed utility / PA-control approach with contractor-work context. LS-08 establishes that Eli was trying to resolve the unfinished closing/accountability condition and reach PA control.

**Eli is not The Attendant.** Chapter 5 deliberately disproves that interpretation.

### Contractor sessions

- Eli Mercer is Contractor Session 01.
- Gavin Cole is Contractor 13.
- The player is Contractor 14.
- Contractor 14 cannot be resolved before Chapter 6.

Legacy contractor sessions 01-14 are descendants of the same unresolved work-order/accountability pattern.

---

## 2. Chapter 6 canonical sequence and endings

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

Required ordering is enforced:

- Eli cannot be processed before staff/key/service prerequisites and LS-08/LS-09 + Eli-body evidence.
- Contractor 14 cannot clock out before `ACCOUNTABILITY: 1`.
- Employee Exit cannot release before Contractor 14 clock-out.

### Final Attendant behavior

PCAS recall destinations cycle through named closing locations such as:

- PA CONTROL
- KEY CONTROL
- SERVICE STATE
- STAFF ACCOUNTABILITY

The Attendant uses existing `investigate` behavior and A* pathing toward the recalled location. The finale does not use a special speed buff or arbitrary hunt shortcut. Active decoys remain valid counterplay.

### Standard ending

Canonical ending ID: `pinewood_closed`.

Contractor 14 closes, but incomplete historical evidence leaves the recurrence unresolved. A later dispatch request appears as **CONTRACTOR 15**.

### True ending

Canonical ending ID: `everyone_clocked_out`.

Requires LS-01 through LS-09. The resolution reaches **`ACCOUNTABILITY: 0`**, the original Pinewood work order is archived, the Attendant becomes still and its white eyes extinguish, and no Contractor 15 is created.

---

## 3. Voice / imitation rule

There are separate authored concepts:

1. Chapter 4 radio imitation / information distrust is intentional.
2. v27 adds sparse, local, pre-rendered PCAS and character voices.
3. A broad supernatural runtime voice-imitation system using browser/cloud synthesis is **not** implemented and must not be introduced as a shortcut.

Permanent runtime constraints:

- no browser `speechSynthesis`,
- no runtime ElevenLabs/OpenAI/Google TTS calls,
- no remote runtime media,
- authored voice assets remain local and pre-rendered,
- subtitles/text must remain sufficient for story functionality with audio disabled.

Chapter 6's Renee/unknown overlap and PCAS recall material is authored dialogue, not uncontrolled generative behavior.

---

## 4. Runtime loader architecture

`game.js` reconstructs the encoded base runtime from `bundle2/`, normalizes local Three.js imports, then applies authored patches in order.

The narrative/presentation tail currently feeds forward through:

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
13. `patches/audio-direction-v27.js.txt`

The terminal loader shape is conceptually:

```js
const chapter6V25Source = await applyChapter6LastShiftV25Runtime(
  chapter5V24Source,
  chapter6V25Patch
);
const productionReadabilityV26Source = await applyProductionReadabilityV26Runtime(
  chapter6V25Source,
  productionReadabilityV26Patch
);
const audioDirectionV27Source = await applyAudioDirectionV27Runtime(
  productionReadabilityV26Source,
  audioDirectionV27Patch,
  characterVoiceManifest
);
const source = audioDirectionV27Source + '\n//# sourceURL=pinewood-runtime.js\n';
```

### Feed-forward rule

Older audits validate their chapter plus the expected feed-forward relationship. They must not demand that their chapter remain terminal forever.

Any future post-v27 patch must extend downstream audit expectations without deleting older chapter invariants simply to make the new terminal layer pass.

---

## 5. Current validation gates

### Global runtime audit

`.github/workflows/runtime-audit.yml`

Broad reconstruction/static gate for the authored runtime stack and protected systems.

### Store / full visual regression

`.github/workflows/visual-regression.yml`

Deterministic browser capture suite protecting store, service, Security, and East Wing presentation and local-only runtime behavior.

### Chapter regressions

- `.github/workflows/security-v22-regression.yml`
- `.github/workflows/staged-east-wing-v23-regression.yml`
- `.github/workflows/staged-accountability-v24-regression.yml`
- `.github/workflows/chapter6-last-shift-v25-regression.yml`

Historical filenames are intentional. These gates validate the current feed-forward runtime, not frozen old builds.

### Audio Direction v27 regression

`.github/workflows/audio-direction-v27-regression.yml`

Permanent focused v27 gate. It runs:

1. `scripts/audit-audio-direction-v27.mjs`,
2. `scripts/audit-production-readability-v26.mjs`,
3. Playwright Chromium setup,
4. a local Pinewood server,
5. `scripts/smoke-audio-direction-v27.mjs`,
6. `scripts/simulate-chapter6-finale-v25.mjs`.

The original v27 production commit `aa89d989...` passed this focused gate as well as the existing chapter, visual, and production-hardening regressions.

### Six-chapter production hardening v27

**Historical filename retained:** `.github/workflows/production-hardening-v26.yml`  
**Current displayed workflow name:** `Six-chapter production hardening v27`

As of commit `3b644f263d38b94368288ec101235d5ffca6e2f5`, this is the comprehensive cross-game gate through v27. It now:

1. runs the complete authored source-audit chain through `scripts/audit-audio-direction-v27.mjs`,
2. installs Playwright Chromium,
3. starts the local Pinewood server with vendored dependencies,
4. runs `scripts/smoke-audio-direction-v27.mjs`,
5. runs `scripts/smoke-production-v26.mjs` for menus, saves/migrations, and six-chapter HUD/runtime state,
6. captures Chapters 1-4 deterministic views,
7. captures Chapter 5 Accountability,
8. simulates both Chapter 6 endings,
9. captures Chapter 6 Last Shift,
10. uploads the production hardening artifacts.

It also triggers when character voice assets under `assets/audio/characters/**` change, closing the v27 coverage gap that existed when the workflow still represented v26 only.

The integration commit automatically triggered production-hardening run **#28**. Inspect its current status before any further runtime change and treat a failure as a blocker.

### Useful direct audit commands

```bash
node scripts/audit-chapter3-security-readability-v22d.mjs
node scripts/audit-chapter5-accountability-v24.mjs
node scripts/audit-chapter6-finale-source-v25.mjs
node scripts/audit-chapter6-last-shift-v25.mjs
node scripts/audit-production-readability-v26.mjs
node scripts/audit-audio-direction-v27.mjs
node scripts/audit-runtime.mjs
```

Browser scripts require Playwright and a local server as configured in the workflows.

---

## 6. Permanent repository constraints

### Local runtime assets only

Never load runtime assets or browser libraries from third-party network URLs.

- models and model textures must be repository-local,
- PBR/material textures, images and decals must be local,
- sound, ambience, music and voices must be local,
- Three.js, Pako and future browser/runtime libraries must be pinned and served locally,
- external URLs are allowed only for provenance/documentation or development-time acquisition,
- new third-party assets require verified licensing, a vendored copy, provenance, and local-asset audit coverage,
- if licensing cannot be verified, omit the asset or choose another,
- do not restore GitHub Raw / Poly Haven / OpenGameArt / CDN runtime fallbacks.

### No manual WASD playtests

This is permanent unless the user explicitly reverses it. Use deterministic automation and deployment verification instead.

### Cassette Castle shelf ban

Never reintroduce:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- aliases/URLs corresponding to those retired resources

Use full-size empty CC0 fixtures, ground furniture from measured bounding boxes, and place shelf/tabletop objects from measured support surfaces. Omit unreliable components rather than creating visible procedural stand-ins.

---

## 7. Key files

Start with these before changing systems:

- `AGENTS.md`
- `DEVELOPMENT_HANDOFF.md`
- `STORY_BIBLE.md`
- `NARRATIVE_IMPLEMENTATION_PLAN.md`
- `game.js`
- `patches/production-readability-v26.js.txt`
- `patches/audio-direction-v27.js.txt`
- `story/dialogue.js`
- `story/pa-lines-v27.json`
- `assets/audio/pa/manifest.json`
- `assets/audio/characters/manifest.json`
- `scripts/audit-audio-direction-v27.mjs`
- `scripts/smoke-audio-direction-v27.mjs`
- `.github/workflows/audio-direction-v27-regression.yml`
- `.github/workflows/production-hardening-v26.yml`

For chapter-specific work, inspect that chapter's patch, audit, smoke/capture script, and dedicated workflow before editing.

---

## 8. Recommended continuation order

Unless the user supplies a more specific request:

1. inspect current `main` and all workflows attached to the latest commit,
2. resolve any red v27 hardening or chapter regression before feature work,
3. verify GitHub Pages is serving the current loader, v27 patch, both voice manifests, and representative local voice files,
4. continue automated full-game hardening around accessibility, audio lifecycle, save/reload, chapter boundaries, mobile layouts, performance, and ending presentation,
5. add permanent regression coverage with each meaningful behavior change,
6. keep this handoff synchronized whenever the shipping baseline or development frontier changes.

Do not create Chapter 7, new lore, or a new mystery layer unless the user explicitly asks for more story.
