# Pinewood Mall Agent Rules

## Non-negotiable repository access rule

For **The Attendant: Pinewood Mall**, always use the connected **GitHub plugin/connector** for repository work.

- Use the GitHub plugin first for reading repository files, inspecting commits, searching code, writing files, committing changes, checking Actions, and verifying GitHub Pages.
- Do **not** assume repository access is unavailable before explicitly checking the GitHub plugin.
- Do **not** substitute container `git clone`, raw web access, web search, or a browser mirror for repository operations when the GitHub plugin is available.
- If a GitHub operation appears unavailable, explicitly check/discover the GitHub plugin again before claiming access is missing.
- The canonical repository is `maloysius-wq/the-attendant-pinewood-mall` on branch `main`.

This rule exists because the repository is connected with write access and must be treated as the primary development interface in every Pinewood development session.

## Canonical narrative source rule

**`STORY_BIBLE.md` is Pinewood's canonical narrative source of truth.**

- Read `STORY_BIBLE.md` before making story, character, lore, ending, chapter-arc, historical-timeline, PCAS, Renee Ward, Eli Mercer, or Attendant-mythology changes.
- `NARRATIVE_IMPLEMENTATION_PLAN.md` is the implementation roadmap for the approved six-chapter expansion. It describes how to build the canon but does not override the story bible.
- Structured runtime narrative data under `story/` must remain consistent with `STORY_BIBLE.md`.
- The current playable three-chapter prototype is transitional. Do not treat old embedded prototype story strings as higher authority than the expanded canon.
- The user's newest explicit narrative direction always overrides repository documentation. If that happens, update the story bible and affected structured data so the repository does not drift into competing versions of canon.
- Preserve intentional ambiguity. In particular, do not explain The Attendant's cosmic origin or turn Eli Mercer into The Attendant unless the user explicitly changes that canon.

## Permanent local-runtime-asset rule

**Pinewood must never load runtime assets or browser libraries from third-party network URLs. Always download/vendor them into this repository and serve them locally.**

This is a permanent no-regression rule, not a preference.

- Models (`.glb`, `.gltf`, buffers and model textures) must be stored in the repository before runtime use.
- PBR/material textures, images and decals must be stored in the repository before runtime use.
- Sound effects, ambience and music must be stored in the repository before runtime use.
- Browser/runtime libraries such as Three.js and Pako must be pinned and served from the repository rather than a CDN.
- A third-party URL may appear in provenance documentation such as `LICENSES.md`, or in a development-time vendoring script whose purpose is to download and pin the source. It must **never** be a shipped browser fetch/load target.
- When adding a new third-party asset, verify its license, download it, retain source/pin/hash provenance, update `LICENSES.md`, reference only its repository-local path at runtime, and extend the local-asset audit when necessary.
- If a candidate cannot be legally verified and vendored, omit it or choose another verified asset. Do not create a remote-runtime exception.
- Do not restore the old strategy of remote URLs plus procedural fallbacks. Runtime reliability must not depend on GitHub Raw, Poly Haven, OpenGameArt, unpkg, jsDelivr, or any other external host being reachable.

The final assembled runtime must pass the local-assets audit before a Pinewood runtime change is considered complete.

## Permanent playtesting rule

**Do not perform manual interactive WASD playtests for Pinewood.** This is a permanent project rule.

- Use automated runtime audits, deterministic visual-regression captures, source inspection, telemetry, and GitHub Pages verification instead.
- Do not describe the absence of a manual WASD playtest as incomplete verification or a remaining task.
- Do not launch a manual keyboard/mouse gameplay session unless the user explicitly reverses this rule in a future request.

## Permanent Cassette Castle shelf ban

The following retired shelf resources are **permanently banned from Pinewood and must never be reintroduced, reused, re-added under another key, or suggested as a future fixture**:

- `cassetteShelfLarge`
- `cassetteShelfSmall`
- Quaternius `Shelf Large.glb`
- Quaternius `Shelf Small.glb`
- any URL/alias containing `Shelf%20Large.glb`, `Shelf%20Small.glb`, `/ShelfLarge/`, or `/ShelfSmall/`

They produced toy-scale fixtures in Cassette Castle and are intentionally scrubbed from the final runtime by `patches/cassette-castle-rebuild-v13.js.txt`.

Cassette Castle fixture/merchandise placement rules:

- Use full-size empty CC0 fixtures only.
- Do not place shelf stock, listening hardware, loose media, registers, or tabletop props at guessed absolute world-Y values.
- Ground floor furniture from its measured bounding box.
- Place tabletop/shelf objects from measured support surfaces or fixture geometry.
- If a required CC0 model/component cannot be loaded or reliably supported, omit it rather than leave it floating or create a visible procedural stand-in.

## Session startup

1. Use the GitHub plugin.
2. Read `DEVELOPMENT_HANDOFF.md`.
3. Read `STORY_BIBLE.md` for narrative work.
4. Inspect the latest `main` commit and relevant current files.
5. Treat the current repository plus the user's newest explicit request as source of truth.
6. Implement directly in the repository when the request is actionable.
7. Preserve the permanent local-runtime-asset and no-manual-WASD rules.
8. Run/inspect runtime audits and verify GitHub Pages after runtime changes.
