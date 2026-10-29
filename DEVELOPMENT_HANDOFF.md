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
