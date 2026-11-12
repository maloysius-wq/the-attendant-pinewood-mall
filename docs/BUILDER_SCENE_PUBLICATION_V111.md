# Pinewood Builder → cinematic and game: v111 scene publication

The standalone 3D Builder now determines the **authored environment** layered
over the v69 physical mall shared by the opening cinematic and the playable
six-chapter runtime. A published layout is a *reviewed, tracked artifact*, not
a silent mirror of someone else's browser.

## Try your own room in the cinematic immediately

1. Open [Pinewood Builder](../builder/), and keep the same browser/profile.
2. Decorate, rearrange, paint and save. Press **Preview in Cinematic / Game**.
   The button saves the current `pinewood-v69` IndexedDB v1 draft first.
3. On the game title screen, press **New Game**. The original voiced, camera-
   directed opening runs, now rendering your *private* authored 3D mall after
   the contractor service door. The game chapters use that same private draft.
4. **Back** to the Builder to continue decorating; nothing is published yet.

The preview is explicitly opt-in using `?builderPreview=1` on the game URL.
Both pages are served from the same origin so they share the existing browser
draft. It is *read-only* in the cinematic/game and never overwrites a save.
Normal game URLs **ignore browser storage** and use the published repository
layout instead. Someone on another browser cannot see your private draft.

If no Builder layout was saved in that browser/profile, preview fails visibly
rather than pretending a blank published scene is your own. Import an exported
v1 layout back into the Builder if moving browsers.

## Publish the selected world for all visitors

1. In Builder, choose **Export for Publishing**. This downloads the existing,
   unchanged `pinewood-world-layout-v1.json` v1 schema.
2. Review and provide that JSON for source-controlled publication. The
   destination is `assets/world/published-layout-v111.json`; don't edit its
   shape or link to external assets.
3. Apply validation and scene/cinematic/game regression checks on a focused
   pull request, then merge/deploy. The newest committed snapshot becomes the
   default public game and cinematic environment.

The initial v111 publication file intentionally contains a valid **empty
layout**, because existing browser drafts cannot be retrieved from GitHub
and no private authored layout has been submitted for approval. Do not
invent the user's scene or upload one unrequested.

## What transfers, and what stays scripted

Shared authored visuals: all compatible pinned catalog **3D models** (including
original fitted materials and CRT-off treatment), positions, rotations,
scales, decals and opacity; baseline furnishing reposition/remove state;
room-specific wall/floor/ceiling finishes; shared gallery finish inheritance;
the physically sourced dry fountain; the 26 fixed vestibule dust/scuff/web
marks; and the real v110 half-strength faulty fluorescent fixture with fast
flicker and full blackouts. Film and game render them from the **same model
factory**, not duplicate guessed primitives. Added physical solids contribute
measured collision shapes in gameplay, except when doing so would obstruct
an approved chapter spawn. Thin surface decals do not block walking.

Cinematic and campaign logic remain authoritative for the car, keypad, camera
motion, door animation, chapter gates, story interactables, dialogue, save
states and ending triggers. The Builder's **temporary open/close door
display state is not replayed** in the cinematic or game. The Builder's
navigation, Work lights, optional area labels, grid, selection gizmos and
roof-cutaway display controls are editing tools, not authored gameplay.

The v107 fixed vestibule patina and v110 fixture are promoted as stable
shared environment defaults by this approved v111 integration. Their
temporary Builder toolbar toggles are visual editing aids and are not yet
persisted as publication data. Fast flicker respects reduced-motion and
pauses with the cinematic. The game has its own automatic fixture clock.

## Permanently retained safeguards

- Commit only source-licensed, repository-local models and textures, never
  external runtime CDN downloads.
- Keep architectural openings, key story objects and protected chapter spawns
  navigable; don't import a private door override as scripted state.
- No changes to the v1 `pinewood-builder-v1` / `pinewood-v69` save key or
  JSON schema, and no automatic upload of personal drafts.
- No mobile tests, no manual WASD tests. Regression proof is deterministic
  desktop Chromium with real WebGL, plus Node layout/asset validations.
- To revert a bad public environment, restore the last good reviewed
  `assets/world/published-layout-v111.json` commit. Your browser drafts are
  unaffected by that rollback.
