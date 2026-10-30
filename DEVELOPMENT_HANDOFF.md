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

<!-- SUNBURST_ARCADE_V30_BEGIN -->
## Sunburst Arcade v30 — full-scale rebuild

Current Level 1 Sunburst Arcade direction replaces the Kenney Mini Arcade floor with the free **Token Gesture: Retro Arcade Props** base pack. The pack is CC0 1.0, vendored locally under `assets/vendor/arcade-v30/token_gesture/`, and its own README confirms 1 Blender unit = 1 metre / real-world scale. Runtime must never fetch the itch.io provenance URL.

The rebuilt floor uses 13 full-scale Token Gesture fixtures. Collision verification covers 15 total protected fixtures after adding the existing v16 compound checkout and the preserved gameplay cabinet: three 1.85–1.95 m uprights, claw, prize wall, skee-ball, driving cab, pinball, full-size air hockey, dance stage, cocktail cabinet, ticket eater, token changer, checkout, and the original interactive cabinet. The Noise Maker pickup remains in its original arcade gameplay role. The old `ASSETS.arcadeMachine`, `ASSETS.airHockey`, `ASSETS.basketballGame`, `ASSETS.clawMachine`, and randomized `ASSETS.prize` floor are retired from Sunburst Arcade and must not be reintroduced.

`patches/arcade-rebuild-v30.js.txt` loads the combined local `pack.glb` at native 1.0 scale. It measures actual THREE.Box3 bounds after placement, enforces an 8 cm fixture clearance, protects the south entrance, validates the real-world heights, and throws on any fixture/checkout intersection. Runtime telemetry is `window.__PINEWOOD_ARCADE_V30__`. The three existing arcade marketing posters and the v16 4.18 m shared checkout are preserved.

The v30 patch also carries a narrow Video Planet compatibility repair discovered by the full-mall browser gate: Store Polish v2's rental shelf still called a missing `makeVHSCase` symbol. v30 injects the uniquely named deterministic `makeVHSCaseV30` helper and explicitly rewrites that shelf call to the v30 helper. Do not revert it to symbol-detection logic. The browser gate is the authoritative end-to-end proof that Video Planet and Sunburst both complete boot.

Loader order is: Production Readability v26 -> Freight Elevator Reliability v28 -> Sunburst Arcade v30 -> terminal Audio Direction v27. Keep Audio Direction v27 terminal. Verification lives in `scripts/audit-arcade-v30.mjs` and `scripts/smoke-arcade-v30.mjs`; source/asset diagnostics live in `diagnostics/arcade-current-source.txt` and `diagnostics/arcade-v30-geometry.json`. Asset acquisition/provenance is reproducible through `scripts/vendor-arcade-assets-v30.mjs`.
<!-- SUNBURST_ARCADE_V30_END -->


<!-- MENU_ACCESSIBILITY_V31_BEGIN -->
## Menu accessibility / responsive regression v31 — IMPLEMENTED, CI VALIDATION IN PROGRESS (2026-10-27)

**Reason:** The six Settings sliders/selects currently show visual labels that are not linked to their controls. The production smoke verifies the controls exist, but does not protect accessible names, keyboard focus visibility, or narrow-screen menu layout.

**Planned implementation:**
1. Associate each Settings label explicitly with its slider/select using `for`/`id` while preserving its existing live-value span and behavior.
2. Show a high-contrast `:focus-visible` keyboard outline for menu controls, give screen buttons 44px minimum hit height, and disable menu-only motion when `prefers-reduced-motion: reduce` is active.
3. Add a deterministic Playwright browser smoke for desktop and 390px mobile menus covering accessible names, label click focusing, keyboard focus styling, narrow-screen column layout, touch-target size, reduced motion, and local-only/no-error runtime behavior.
4. Run the new smoke as part of the existing permanent six-chapter production hardening workflow. Do not alter the six-chapter story or v27 terminal audio layer.

**Implementation (committed to main):**
- `88e8194e`: `index.html` now associates all six Settings labels, adds menu-specific keyboard focus outlines, 44px minimum screen button heights, and reduced-motion support.
- `76279b9d`: `scripts/smoke-menu-accessibility-v31.mjs` adds deterministic Chromium checks at 1280x720 and 390x844 for keyboard order, accessible labels, label-click focus, layout, touch targets, reduced motion and local-only assets.
- `8e512bc6`: `.github/workflows/production-hardening-v26.yml` now executes the v31 menu smoke during comprehensive hardening.
- `2bd860fd`: `.github/workflows/menu-accessibility-v31-regression.yml` adds a focused, faster CI gate and preserves a JSON report.

**Verification status at handoff update:** The runtime audit passed after the HTML change, and GitHub Pages deployment for `8e512bc6` passed. The focused v31 run [40534019334](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40534019334) and comprehensive hardening run [40533660015](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40533660015) were in progress. The production-hardening job has already passed the complete authored runtime audit, v27 voice smoke, six-chapter HUD/save smoke, and the new desktop/mobile v31 accessibility smoke. The remaining visuals/endings and dedicated focused workflow were still in progress at this update. Inspect their terminal outcomes before marking the entire validation run fully green. Keep the existing audio, narrative, local-asset and no-manual-WASD invariants.
<!-- MENU_ACCESSIBILITY_V31_END -->


## v33 production release handoff (2026-10-27)

**Status: MERGED INTO MAIN, v33 production release delivered via PR #6.** User explicitly authorized updating live main after v32 narrative/physical and v33 instanced-wall audits. Release branch: `release/pinewood-v33-verified-mounts`, based on main commit `e2564bb0d7ca73b59d4654d40089b2c470cb9f99`.

Scope: promote only the 9 revised production patch files and 2 existing source-audit corrections from `audit/self-hosted-game-review-v32`. This includes Ch2 canonical LS-04 chronology and LS-05/LS-06 ownership, Gavin keycard spacing and Buzzer reachability; Ch3 CCTV support and Luis VCR/patch-chain anchor; Ch4 wall-grounded route map and wayfinding, cassette bench, physical locker keepsakes, named staff photo; Ch5 actual wall-secured directory signs; Ch6 PA sign and physical staff desk signage; v10 food posters. Preserve six-chapter canon, original local vendored assets, Cassette Castle shelf ban, and no-WASD test policy.

**Absolute release exclusion:** The audit branch's `game.js` is instrumented with nonshipping `geometryAuditV32` and `wallAuditV33` query hooks. Do not merge or copy this file; main's untouched `game.js` is the production loader. Exclude all `.github/workflows/*v32`, `*v33` and new `scripts/smoke-*v32/v33` audit-only files unless deliberately installing a production-safe test harness. Do not merge the entire audit branch. Run authored source audits + six-chapter browser compatibility smoke on staging release branch, then promote via PR, verify main HEAD, checks and Pages. No paid large runners or artifact uploads.

Relevant audit-only evidence: [wall mount v33 PASS](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40575163496) (audited mounted objects <=6cm wall gap, correct normals), [story/static PASS](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40575171523), [navigation PASS](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40578108018) (56/56 targets reachable). These runs used the audit instrumented loader; the **production-loader** release branch must be retested separately.

Release state tracking: PLANNED -> IN PROGRESS -> VERIFIED -> MERGED / DEPLOYED (or BLOCKED).

**Release staging validation:** 25/25 authored static audits passed on the unchanged production loader in standard hosted workflow [40579976341](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40579976341). Browser regression for the same staging release was still executing when this note was recorded. The temporary verification workflow is removed from the final PR diff before merge. All nonproduction diagnostic hooks and v32/v33 temporary test utilities remain excluded from main.

**Live main promotion confirmed (2026-10-27):** [PR #6](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/6) successfully squash-merged commit `31413b97839f671b800f064489f643df39895f6b`; GitHub branch `main` was verified at that exact SHA after merge. The production `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` was confirmed to contain no v32/v33 debug hooks. The final PR changed precisely 12 files (9 production patches, 2 existing test sources and this handoff). PR-targeted Runtime, Chapter 4, Chapter 5, Chapter 6, source audit and main-triggered initial diagnosis checks passed. Post-merge GitHub Actions and longer hosted screenshot sweeps were still processing at the last check; report final run outcomes, and address any later regressions as subsequent work. The repository advertises GitHub Pages (`has_pages=true`), but the published Pages URL could not be fetched from the current tool environment, so direct public URL deployment verification remains unconfirmed. Existing workflow jobs can upload ordinary screenshot artifacts (independent of the temporary release workflow, which uploaded none). No premium runner minutes were used.

## v34b Browser-only hosted preview (2026-10-28)

**DEPLOYED AND VERIFIED, OWNER REVIEW ONLY.** Cinematic remains draft PR #7, *not integrated into live New Game*. Browser preview is available at https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/ . A new isolated PR #9 squash-merged commit `f24965953372e42cd7448462fa3df7a45c63a459`, updating only the `opening/` preview scripts and local audio, `review/the-call-v34/index.html`, and `LICENSES.md`; root `index.html`, `game.js`, Chapter 1 and saves are byte-for-byte unchanged. Car-camera floor/geometry clipping fixed with hollow cockpit and correctly seated camera; work phone scaled to normal handheld proportions. Owner supplied `car-rain.wav` and `outside-rain.wav`; both are normalized and seam-crossfaded into local `opening/audio/*rain.ogg` loops, with voice ducking, car-to-outdoor crossfade and indoor fade-out, pause/skip cleanup. All 11 Renee recordings receive matching existing extreme production v29 handheld walkie (650–2150 Hz band, 12:1 compression, grit, hiss, squelch), with SHA-versioned audio URLs to bypass stale browser caches. Voice master [40737860775](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40737860775) PASSED, branch cinematic [40738636433](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40738636433) PASSED, Pages deployment [40739026613](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40739026613) PASSED, and public hosted browser [40739063234](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40739063234) PASSED after deployment, verifying both live rain loops, Renee audio and normal New Game/Skip. Await user visual/audio approval before integrating full cinematic and before broader ambience/music work.

## v35 Human-eye staging, dashboard phone and gapless rain review (2026-10-28)

**VERIFIED, awaiting isolated online-preview promotion** on `feature/the-call-v35-human-camera-gapless-rain`. User directly requested a more human first-person cinematic camera (natural glances/turns/steps rather than continuous zoom), a dashboard-mounted phone in a real holder instead of floating on the seat, and no dead air or abrupt seam at either user's car/outside rain loops. Use shot-keyed head/body choreography with deliberate pauses and walking gait, preserve existing spoken performances, remove redundant floating phone overlay. Create a single sample-accurate Web Audio playback engine with both ambient cues and scene crossfades; regenerate loop-ready OGG with edge-silence removal and tail-to-head overlap blend, verify seam/duration/no clipping. Test on the real hosted Pages preview; only promote isolated preview assets to `main` after green camera/audio browser test, never change main root `index.html` or `game.js` or merge draft PR #7. Update this entry when verified.

**v35 verification:** [GitHub Actions 40769492434](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40769492434) PASS with seven captured first-person shots, continuous human gaze shifts, physically seated driver's camera then exterior walking, scaled dashboard holder (mount in real car geometry), no onscreen floating phone card, car/outdoor rain weighting during physical exit and indoor cutoff, two looping AudioContext-decoded rain buffers playing concurrently, Renee local radio lines, and existing normal New Game handoff after Skip. Rain mastered with adaptive edge cleanup, real tail-to-head PCM crossfade, -26 LUFS target and decoded-sample edge repair; [audio master 40768699629](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/40768699629) PASS. User can review on original distinct Pages path /review/the-call-v34/ after staging only these assets; main root game must remain byte-identical.


## v36 Preview accessibility lifecycle hardening (2026-10-29)

**PLANNED -> IN PROGRESS.** The current `main` is `28d50669f57e44ed4adbe2d5cd2d0f28886f0ac6`, which has already promoted v35's isolated preview assets, and its production hardening and Pages deployment passed. v35's hosted verification run `40770250764` passed. The v35 entry above predates its promotion; this entry supersedes its staging-only status. **The cinematic remains review-only** at `/review/the-call-v34/`; do not import the opening into live root `index.html` or `game.js` before owner approval.

**v36 work plan:** Make preview playback keyboard accessible and safer for screen readers without changing camera, story, dialogue, rain audio, or six-chapter runtime. Explicitly manage overlay focus and background inert state, restore focus after skip, prevent repeated identical live-caption DOM mutations, document toggle states, and give touchscreen transport controls a 44px minimum target. Add a deterministic desktop/390px mobile Playwright regression for focus, pause/skip, caption stability, mobile controls, browser errors and origin-local asset delivery. Keep this isolated preview-only and track CI before promotion.

**Implementation:** Commit `1676523f` adds isolated overlay focus/inert lifecycle, an accessible Tab loop, nonrepeating live-caption updates and toggle states. Commit `88f6997c` gives mobile transport controls 44px hit height. Commit `663588cc` marks the preview as a modal dialog. Commits `1f6e6d31` and `61748667` add the two-layout deterministic Playwright check and a dedicated PR/main CI workflow. Production `index.html`, `game.js`, narrative, authored audio and camera are untouched. **Status:** MERGED on main through PR #11 at commit db3611d9. All seven v36 feature and six-chapter CI checks on the PR passed, including focused v36 accessibility and production hardening. The 11 pinned Playwright workflows now use Ubuntu 24.04.

**CI blocker found on 2026-10-29:** GitHub's `ubuntu-latest` resolved to Ubuntu 26.04; pinned Playwright 1.55.0 refuses to install Chromium on that OS, failing both v36 and permanent production hardening before browser tests begin. The authored static audit and JS parsing did pass. Pin all 11 Playwright browser-regression workflows to supported `ubuntu-24.04` (including full-game hardening and focused v36). Revalidate on PR; do not mislabel the pre-browser infrastructure failure as a game regression.


## v37 CC0 cinematic environment development (2026-10-29)

Owner requested a dingy 1990s car interior, genuine mounted cellphone, wet foreboding parking asphalt, a neglected mall, fog and streetlights. Isolated preview only: do not connect to production New Game or change original six chapters without owner's review. Branch: feature/the-call-v37-cc0-atmosphere based on main 28d50669. Asset license sources are official Grab3D CC0-1.0 model API and Poly Haven CC0 materials (Asphalt 02, Cracked Concrete Wall, Rusty Metal, optional Street Lamp 01 glTF). Development-only script scripts/vendor-opening-assets-v37.mjs must commit bytes, checksums and URLs under opening/assets/v37/ before runtime references may ship. Asset pipeline status: VERIFIED. GitHub Actions run 40954456266 downloaded and committed 11 CC0 local files (two GLBs and nine PBR maps) at vendor commit 9d6f866. First full browser gate run 40954910799 passed desktop/mobile with full-scale car, mounted phone, three materials, 22 wet patches, four fog lamps, local-only origin requests, zero browser errors and safe skip. v37 head also reconciles fully green v36 accessibility PR #11, using merge commit 88f81552. New exact-head accessibility, v37 browser and six-chapter comprehensive checks are in progress. **Status: MERGED / PAGES DEPLOYED for owner review only.** PR #12 squash-merged to main at commit 3486a613abcf30d88fa495676c16ef9dd059eee1. Main branch verified at this SHA, and GitHub Pages deployment run 40956765892 succeeded. The current preview remains at https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/ (legacy URL, v37 visuals); direct public HTTP retrieval from this tool environment was unavailable, so public browser playback is not independently confirmed. Focused exact-head 40955691148 (v37 desktop/mobile, visual captures, local-only requests and safe skip) and 40955691189 (v36 accessibility) PASSED. Existing production index.html and game.js blobs are identical across the v37 promotion, so the cinematic is NOT enabled in New Game. Comprehensive six-chapter hardening on the PR and newly merged main is still in progress at this documentation update, not claimed green. The 3.9m Poly Haven street lamp was not vendored; authored full-size lamp posts with v37 fog halos remain.


## v38 Opening cinematic car-interior orientation regression (2026-10-30)

Owner supplied a paused v37 screenshot where the imported car's front-seat headrests are directly ahead of the first-person driver and the interior appears backwards. This is a real staging bug introduced with the Grab3D v37 GLB: the imported cabin and Pinewood's existing forward-looking (-Z) shell/camera were not aligned. Fix on `fix/the-call-v38-forward-facing-cockpit`: yaw the imported GLB 180 degrees **before** applying real-world centering/scale; keep the outer shell, cockpit camera, phone mount and entire authored shot choreography unchanged. The existing preview-only New Game isolation, Renee audio/rain, v36 accessible transport, fog and CC0 licensing must remain unchanged. Add a geometry-based driver's view clearance regression and save seated/phone-glance screenshots for desktop and mobile. Bust import cache queries to v38 to prevent the published preview from serving stale v37 modules. Before merging, verify focused v37 visual regression (now guarding v38), accessible intro, local assets and production hardening. On promotion, report exact Pages deployment and keep full-game index.html/game.js byte-identical. Status: **MERGED / PREVIEW-ONLY**. PR #13 squash merged into main at `5900f043cde7ecdf6ea3a09a50652a4fdcd5d4e9` on 2026-10-30. v38 first geometry smoke correctly detected an occlusion 8.7 cm from the first-person eye; the imported cabin was subsequently moved 34 cm rearward within the original shell while preserving the original camera path and dashboard phone. Latest desktop/mobile smoke run [41070687025](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41070687025) PASSED, with three nearest forward rays at 1.138 m, 0.984 m and 0.997 m, local-only GLB/PBR loads, saved seated/phone-glance screenshots, zero browser errors, and safe Skip. Focused v36 accessibility run [41070687208](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41070687208) PASSED. Production root index.html blob `022b99b3...` and game.js blob `5107c82b...` remain unchanged. Pages [41071125607](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41071125607) deployed preview commit 5900f043; verify live published URL is the unchanged `/review/the-call-v34/`. Comprehensive six-chapter CI running at time of this handoff and must not be represented as complete until its terminal state is checked. Owner visual review still required; cinematic remains isolated from live New Game.


## v39 The Call service entry framing and canopy scale (2026-10-30)

**User screenshot / direct instruction:** v38 service-side access door sits in a roughly 3.5m-wide × 4.6m-tall portal; the door is only 1.95m × 2.27m. The oversized 7.2m x 3.15m canopy makes the entry resemble a loading dock. Correct the *preview-only* geometry rather than changing the approved six-chapter game or the original pivot, phone/rain, pacing, camera, keypad and CC0 textures.

**Branch:** `fix/the-call-v39-service-doorway-scale` from main b68e097a. New aperture is 2.13m × 2.39m, with façade infill at the left, right and above the door, real frame jambs and lintel, and a 3.10m × 1.80m compact canopy. The original door slab/swing mechanism remains in place. `opening/intro.js` exposes actual world-space mesh bounds through `serviceEntryGeometry` so the dedicated desktop/mobile Playwright regression can verify the aperture-to-door clearance, three wall infills, frame edges and canopy dimensions, and save close-up animated doorway/threshold screenshots. Cache-bust preview modules to v39. **Status: implemented on review branch; verify CI and Pages before promotion.**


**v39 preview promotion verification:** [PR #14](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/14) squash-merged `ddd08cffed225d876b84977c2ea595694b177140` to main. Preview-focused [Chromium 41074602988](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41074602988) PASS for desktop and 390px mobile including measured real-world frame/door opening dimensions, wall infills, smaller canopy, close-up doorway and moving door screenshots, local asset requests, and safe skip. [Accessibility 41074603132](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41074603132) PASS. [Pages 41075160579](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41075160579) SUCCESS for merged code. Production root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e`, `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` are preserved; normal New Game remains unaffected. Comprehensive six-chapter regression [41074603126](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41074603126) is `in_progress/pending` at this update; it is not being represented as green until completed. Public review entry remains `/review/the-call-v34/` (legacy path now showing v39). Owner visual approval still outstanding.

## v40 Unified first-person car cabin and legible phone (2026-10-30)

**Owner correction:** v39 opening preview screenshots show the CC0 1990s interior and the old authored car still superimposed. A glaring multi-bar windshield/roof structure obstructs the view, and the mounted cell phone is far from the driver with a blank, effectively unusable screen. Prior response that said only "assessed" was not implementation. This branch MUST ship a cohesive driver-facing vehicle, one windshield, roof, and near-driver readable phone, not another diagnosis.

**Scope:** Branch `fix/the-call-v40-unified-car-cockpit` from main `cf1f468`. Remove the entire old procedural shell/body/dash/seats/duplicate glass from `opening/scene.js`; keep the locally vendored CC0 cabin as sole cockpit. Construct only a matching thin enclosing roof, A/B pillars and **one** transparent windshield in `opening/environment-v37.js` after the cabin loads. Anchor the existing CC0 phone holder immediately adjacent to the left-hand driver, add a **large camera-facing LCD** with the real CanvasTexture work-order, and keep it fully bright and double-sided. Revise camera's phone-glance target. Cache-bust the preview import chain through v40 and extend desktop/mobile Chromium regression to assert one roof/one windshield/no legacy objects, screen texture identity and size, facing and driver-eye distance, plus new windshield/phone screenshots. Do not alter production root `index.html`, `game.js`, approved voice, rain, scene pacing, six chapters, fog, or the newly sized service doorway. **Status: MERGED PREVIEW-ONLY.** PR #15 squash-merged to main as `2d71bef564e99545a76ebed13d60d1a9db7c9203`. Initially failed automated phone placement because a world-space mount box was incorrectly applied as a car-local LCD position; this was fixed by measuring the CC0 mount BEFORE parenting it under the translated car. Exact-head v40 Chromium run [41078599877](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41078599877) PASSED both desktop and mobile: no old shell meshes, one authored windshield and roof, real CanvasTexture 560×1000, screen normal dot eye 1.000, screen distance to driver 0.896m, uninterrupted local asset delivery, safe skip and saved first-person/phone captures. Accessibility [41078600233](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41078600233) PASSED. Production `index.html` SHA 022b99b3b3b613b326a34a92e900134aa370e60e and `game.js` SHA 5107c82b23cc8bce00dab099b2ac585229a1f1a8 preserved. Pages deployment workflow [41079009266](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41079009266) initiated; **verify successful publication before claiming it live**. Broad six-chapter production hardening still running at handoff update; user review of rendered cockpit remains necessary.


## v41 Owner-directed car replacement (2026-10-30)

**LATEST OWNER INSTRUCTION, overrides v35-v40 art plans:** Replace rejected 1990s car model with Grab3D Truck Cabin Interior (https://grab3d.com/models/vehicles/truck-cabin-interior/), CC0 1.0. ABSOLUTELY NO manually authored or procedural/vector car body, roof, pillars, windshield, wheel or dashboard. NO PHONE MOUNT, including the CC0 phone-holder mesh or floating LCD. Only the vendor utility/sleeper truck cabin. Keep narration/rain/night mall materials/service entry and six-chapter game unchanged. Do not reintroduce a shell or mounted phone without explicit new owner request.

Branch fix/the-call-v41-truck-cabin-only. Vendor script acquires and locally commits the ACTUAL CC0 truck-cabin-interior.glb under opening/assets/v41/ with license and SHA-256. Other PBR surfaces are retained but previous car/phone models are not requested at runtime. Reframe first-person driver eye to the truck layout; no extra car geometry or phone shots. Extend desktop/mobile browser smoke to enforce vendor-only car, no phone, and local-only requests. Isolated cinematic preview. STATUS: **MERGED & PAGES DEPLOYED for isolated owner review**. PR #16 squash-merged to main at `a2b2be04bff19cd9d91472effa9c5a8751b0d507`. Source-only Grab3D Truck Cabin Interior (light GLB, CC0 1.0, 1,104,372 bytes) vendored in asset workflow [41081634847](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41081634847), with SHA-256 in opening/assets/v41/manifest.json. First branch pass failed because removing the phone left a stale unconditional cleanup; corrected and exact-head checks succeeded: [Chromium 41082332238](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41082332238) PASSED desktop and mobile, showing a single 10-mesh vendor truck cabin, no added car geometry, zero phone mounts/screens, no third-party runtime requests, unchanged v39 service entrance and safe skip. [Accessibility 41082331979](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41082331979) PASSED. [GitHub Pages 41082818273](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41082818273) SUCCESS for merge commit. Current public review URL remains https://maloysius-wq.github.io/the-attendant-pinewood-mall/review/the-call-v34/ (legacy pathname; add ?v=41 to bypass caches). Production root index.html blob `022b99b3b3b613b326a34a92e900134aa370e60e` and game.js blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` unchanged. Comprehensive six-chapter hardening `41082331944` in_progress/pending at handoff update. **OWNER VISUAL REVIEW NOT YET PROVIDED; do not pretend successful automated checks prove correct appearance.** The chosen source is an open/cutaway truck cab, not a closed vehicle; do not manufacture additional frame or canopy without owner consent.


**v41 implementation:** Actual Grab3D Truck Cabin Interior GLB downloaded via CC0 metadata validated vendor job 41081634847 to opening/assets/v41. In the isolated preview the old authored roof/pillars/windshield and work-order phone object/code are entirely removed. Only one locally vendored utility cabin GLB is loaded, with truck-specific first-person driver position and radio/dashboard glance. No runtime use of the prior 1990s car or car-phone-holder GLBs. Browser smoke now rejects procedural car/phone meshes and checks only one imported model, no outside network, previous service door and night effects. CI PENDING.

## v42 ENCLOSED car, owner instruction (2026-10-30)

**OWNER REJECTED v41 open truck cab and every handmade car frame.** The cinematic must feature one roofed, weatherproof vehicle WITH an authentic interior/driver's seat. Select the Grab3D CC0 1990s Hatchback FULL vehicle (https://grab3d.com/models/vehicles/1990s-hatchback/), which is documented with actual long roof, windows, front seats, steering wheel and rear bench. Not the earlier Grab3D **1990s Car Interior** cutaway! No mix of 2 cars, no hand-made car roof or windshield and no phone mount. The prior v41 owner direction is superseded only for the new enclosed model. Keep preview-only and retain night lot/mall visuals, voice, and all six playable chapters.

Branch feature/the-call-v42-enclosed-hatchback. Developer-side source script scripts/vendor-enclosed-hatchback-v42.mjs obtains the exact CC0 full GLB into opening/assets/v42/ with material/node census, license proof and SHA. Browser scene must use this SINGLE model only, and camera must sit inside its driver seat under a **mesh roof** with actual see-through windshield toward mall. No blind faith in mesh counts: add a real roof raycast/visible-cabin camera and screenshots regression, alongside v41 accessible skip and no remote requests. If model proves solid/opaque and cannot be seen through, do NOT deploy it; look for alternative complete car. **Status: preview-only MERGED and published.** PR #17 squash-merged v42 to `main` at `f791185bbe2d09b7a5ca715ce50f2d05d28d59ef`. Cinematic run [41089221058](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41089221058) PASSED both desktop/mobile with real vendor roof distance 0.393m, full enclosed car, genuine source glass, local-only requests, fog/doorway unchanged and safe skip; accessibility run [41089221155](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41089221155) PASSED. The rendered driver-seat and exterior screenshots were inspected in-chat: they show the steering wheel behind the windshield and a continuous enclosed hatchback body. [Pages deploy 41091249362](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41091249362) SUCCESS. User visual review of the published cinematic still required; do not enable cinematic in production New Game without user approval.


**v42 implementation:** Selected full 1990s hatchback CC0 GLB has a complete body, four wheels and dedicated transparent BLEND window mesh. Model dimensions 1.86m wide × 4.06m long × 1.53m tall. Camera is lowered to a true seated height under the imported roof, with automatic roof raycast. Preview-only browser QA saves driver and exterior off-angle screenshots and outputs JPEG data for actual visual inspection. No custom car body or phone. CI pending, owner visual review required.


**v42 visual QA validated:** GH Actions actual GLB exterior screenshots show complete roof/windows. Early in-seat screenshots were black because vendor body material was double-sided; corrected to render original exterior faces from their proper side, retaining all original geometry and glass. Camera probes established proper cockpit positioning **world (-10.25,1.13,17.82)** behind the original steering wheel, showing windshield, gauges/dashboard and passenger-side glass. Reduced the temporary 1.7-intensity cabin fill to subtle 0.62. The earliest camera placed too far forward showed hood instead of wheel and was rejected. The revised eye also gets a roof-height/raycast check. Exact-head cinematic and accessibility CI passed and PR #17 was preview-only merged; public GitHub Pages build success confirmed. Production index.html and game.js remain byte-identical.


**Release safeguard:** Owner has repeatedly rejected open/cutaway cars, handmade roofs/windscreens, duplicate car bodies, and detached phone mounts. The *only* acceptable active v42 vehicle is `opening/assets/v42/1990s-hatchback.glb`; retired v37/v41 vehicle and phone GLBs and their old vendor workflows were removed. For future changes, inspect actual desktop driver-view AND exterior roof/browser screenshots before declaring success, not solely component counts. The complete six-chapter production regression of this PR (run 41089220974) was still in progress at the release decision; focused preview and accessibility are confirmed successful, and production game entry files were unchanged. Keep the cinematic review-only pending owner approval.


## v43 Owner screenshot: driver view still obstructed (2026-10-30)

Owner posted a paused first-person screenshot after v42 release. The steering wheel fills the center of the windshield, a red shape appears inside the wheel, and the dashboard/hood obscures most of the outside view. Owner asks whether the entire car is backwards again. DO NOT ASSUME orientation based on wheel object names, a roof raycast, or previous green CI: must visually prove forward/up and seat coordinates. Branch `fix/the-call-v43-driver-eye-orientation`. First step instrument real browser image probes from several LEFT and RIGHT cockpit points and also facing reverse (+Z), compare rendered frames against the actual enclosed hatchback model. Keep prior v42 asset, roof, transparent glass and service entrance; never rebuild the hybrid car or add a phone mount. Do not merge before actual visual review. State: diagnosing via recorded browser snapshots, not yet fixed.


**v43 camera root cause and correction (2026-10-30):** The hatchback is **not rotated backwards**: source front wheel nodes (+Z before 180° yaw) and exterior side visual show nose toward mall (-Z). However, the v42 world eye (-10.25,1.13,17.82) sat behind front steering wheel with the front-seat upholstery and steering hub dominating the view, aggravated by many old `G.phone` camera-glance cues at a near-field point despite phone removal. Browser screenshots of 20+ front/rear/side camera probes identified a clear windshield/dashboard/steering balance at world eye **(-10.20,1.24,17.60)**. v43 moves camera into front seat, changes residual old `phoneLean`/`G.phone` shot targeting to `dashLean`/`G.dash` at 4.3m forward so 'Got it' no longer zooms into the wheel; does not modify the GLB, orientation, roof, geometry or production game. Cinematic regression asserts exported exact eye and dashboard look-at and captures actual clock-line screenshot, not only initial arrival; owner review remains required. Status: **FIXED / MERGED PREVIEW-ONLY** through PR #18, commit dd465eba21a92c027a1bc4b6220c1c455cb66c41. Owner image was not a backwards vehicle (front wheels/nose point toward the mall), but a camera misplaced behind the vendor steering-wheel/front-seat area. Browser front/back/side camera probes and rendered screenshots identified the correct front-seat view at (-10.20,1.24,17.60), with wheel at lower left and clear windshield toward Pinewood Mall. The obsolete too-close phone-era camera target was removed; clock/Got it uses a farther dashboard glance. Verified actual arrival and clock screenshots from [cinematic Actions 41095225168](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41095225168), which PASSED desktop/mobile, local-only assets and safe skip, plus [accessibility 41095225164](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41095225164) SUCCESS. [Pages 41096186261](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41096186261) success for merged commit. Production index.html blob 022b99b3b3b613b326a34a92e900134aa370e60e and game.js blob 5107c82b23cc8bce00dab099b2ac585229a1f1a8 unchanged. Full six-chapter PR run 41095225621 in_progress/pending at handoff update, so do not represent it as green unless completed. Keep cinematic isolated until owner visual approval.

## v44 Retired-phone preview hardening (2026-10-30)

**Status: MERGED / PREVIEW-ONLY; GitHub Pages deployment SUCCESS.** [PR #19](https://github.com/maloysius-wq/the-attendant-pinewood-mall/pull/19) was squash-merged into `main` at `db2901303b85a235dabbe0509d6bbc09a08a3d9e`.

The previously rejected work-phone UI was still present as a hidden HTML aside, responsive CSS, obsolete cleanup code and an unused phone shot; the original narrative metadata also still labelled three dashboard glances `shot: "phone"`. v44 removes the HTML/CSS, dormant `phoneUi` cleanup, dead phone texture telemetry and unused phone shot, while relabeling the three narration cues to `dash`. No changes to the spoken lines, narration files, v43 camera rig, hatchback model, mall/service entrance, weather, six chapters, or chapter endings.

`scripts/smoke-opening-v37.mjs` now rejects any retired phone-card HTML/CSS, rejects the old phone shot tags, checks the dashboard tag while the work-order beat is active, and verifies no phone overlay exists before or during desktop/mobile playback. The historical workflow file `.github/workflows/opening-v37-regression.yml` now watches `opening/script.json` and `opening/opening.css`, closing a path-filter blind spot; its displayed name is v44.

**Exact-head validation**: [v44 cinematic/geometry Chromium 41098080014](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098080014) SUCCESS; [accessible cinematic 41098080111](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098080111) SUCCESS; [Pages deployment 41098610720](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098610720) SUCCESS for merge commit. Full six-chapter v27 hardening [41098080009](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41098080009) remained in progress at this checkpoint; do NOT describe it as green without checking its final result.

The production root `index.html` blob `022b99b3b3b613b326a34a92e900134aa370e60e` and `game.js` blob `5107c82b23cc8bce00dab099b2ac585229a1f1a8` are byte-identical to pre-v44. Public review path remains `/review/the-call-v34/` (historical pathname), append `?v=44` to bypass cached HTML; the preview now fetches v44 CSS/JS URLs. **Owner visual approval is still required. Do not connect the opening cinematic to normal New Game until the owner approves the actual rendered experience.**

## v45 User-directed handheld check-in and voice-aligned subtitles (2026-10-30)

**Newest owner instruction overrides the v44 no-phone rule ONLY for a first-person phone actually held and used by the player.** The v42 enclosed, vendor-only hatchback remains the sole car. The phone must never be reintroduced as a dashboard mount, floating UI card, or second vehicle object. User explicitly wants the player checking in on the field-service app during Renee's opening lines, plus tighter subtitle/dialogue sync.

**Implementation in progress on PR #20** (`feature/the-call-v45-handheld-checkin-sync`), preview-only. `opening/phone-v45.js` builds an original camera-held smartphone, local CanvasTexture field-service app, rising and lowering animation, articulated gloved thumb tapping CHECK IN, and visibly CONFIRMED state during Renee's clock acknowledgement. Later work-order beat shows the three circuits on that same device. No new GLBs, car shells, remote assets, or changed voice clips. `opening/caption-sync-v45.js` creates sentence cues weighted by actual transcript lengths against the local voice manifest's precise per-clip OGG durations. `opening/intro.js` uses actual `Audio.currentTime` for caption and camera/phone timing, with pause and autoplay/decode fallback. This removes the old equal-sentence / estimated-reading-time source of drift.

**Testing status:** source audit verified exact matches for all 11 scripts and voice transcripts and deterministic clip-end caption cues. Initial Chromium run 41100249516 failed because the browser media clock had not yet moved when a test sampled it 650ms after starting a fresh clip. The branch was revised to use a bounded audio-start watchdog, a test that waits for real media playback, and local headless autoplay control. Accessibility's initial run 41100249615 logged both desktop/mobile PASS; do not interpret this as complete exact-head signoff. The current focused workflow is configured to capture desktop/mobile check-in pending, actual thumb tap, confirmation, stowed phone, and work-order screens, plus desktop JPEG frames for human visual inspection. PR remains **UNMERGED pending exact-head browser regression green**; do not state v45 is published until merge + Pages deployment are confirmed. The six-chapter production root `index.html` and `game.js` and the v42 hatchback manifest blob are unchanged on this branch. Public review still shows v44 until promotion.

**Owner approval is still required** before wiring this cinematic into the normal New Game path.

### v45 preview-only merge checkpoint

**PR #20 was squash-merged into `main` at `2246507158452eb8790e9c786427e2393870ac94`.** The owner-directed handheld phone and recording-synced caption implementation is committed. The production root `index.html`, `game.js` and v42 hatchback asset manifest remain unchanged. Do not reinterpret the previous v44 no-phone restriction as a ban on the explicitly approved first-person handheld check-in phone. No dashboard phone mounts or HTML cards.

**Exact-head post-merge statuses were still pending at documentation time**: GitHub Pages workflow [41102191308](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102191308) was queued, and v45 cinematic [41102192049](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102192049), accessible preview [41102192044](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102192044) and six-chapter [41102192018](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41102192018) had also queued. GitHub's workflow state reporting was unusually delayed, with earlier jobs' logs showing finished work while their run metadata still claimed `in_progress`; do not invent PASS or Pages deployment. The earlier initial v45 cinematic [41100249516](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41100249516) failed specifically because a headless test sought nonzero audio time just 650ms after resetting playback. The revised branch handles delayed audio initialization and waits for actual audio before judging the subtitle clock. The earlier v45 accessibility run logged both desktop and mobile PASS; that does not replace exact-head verification. The new browser test also saves screenshots of pending/tap/confirmed check-in and the circuit work-order phone screen.

**Follow-up validation**: Verify Pages actually published the v45 HTML/module cache-bust and inspect desktop and mobile rendered phone screenshots. Check post-merge workflows to completion; fix genuine failures. Keep the cinematic isolated until owner visual approval, never connect it to production New Game based on an automated pass alone.


## v45 final reviewed preview release (2026-10-30)

**STATUS: MERGED, DEPLOYED, DESKTOP/MOBILE CINEMATIC AND ACCESSIBILITY PASSED. OWNER VISUAL APPROVAL STILL REQUIRED.** PR #20 merged as `2246507158452eb8790e9c786427e2393870ac94`. Follow-up audio-event subtitle timing, focus-release ordering, and foreground phone rendering/composition fixes are on `main` through `2f623e489f94ee411e3a8859e4d25be9845e5aff`. [v45 exact-head cinematic regression 41105647451](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41105647451) passed desktop and mobile; its screenshots were visually inspected and show the handheld phone's complete CHECK IN, CHECKED IN, DISPATCH NOTIFIED states, with nonoverlapping Renee captions. [v45 Pages 41105646566](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41105646566) success. [Accessibility 41103872924](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/41103872924) passed desktop/mobile; v45 final phone-foreground iteration accessibility 41104648610 was also successful. Normal root `index.html` and `game.js` are unchanged; cinematic remains preview-only pending owner approval. Do not restore a dashboard phone mount or abstract HTML overlay.

## v46 door / frame correction (owner screenshot 2026-10-30)

Owner's paused screenshot at the contractor/service entrance shows substantial black gaps between the wooden slab and the fixed jambs, plus frame/head much larger than door. **Priority: FRAME MUST FIT THE DOOR, and door should be slightly thinner.** Former service slab was 1.95m wide, 2.27m high, .14m thick while the physical opening was 2.13m wide (90mm unfilled side clearance EACH side), exactly explaining the screenshot. In preview-only v46, scene door specs now drive ALL of slab width/height/thickness, steel jamb coordinates, header, wall infills and sill. New slab: width 1.78m, height 2.27m, thickness .095m; clearance 18mm each side and at head. Hinge moves to slab's actual left edge to preserve original swing. Door remains a full hinged slab and the surrounding facade stays closed, with no new car/phone assets. Regression in `scripts/smoke-opening-v37.mjs` now measures actual world-space frame and door bounds to millimeter tolerances and emits `V46_TIGHT_DOOR_JPEG` from a real paused closed-door browser view. Preview import cache bumped to v46. **Do not claim v46 successful until actual screenshot shows the close fit and CI/Pages succeed.**
