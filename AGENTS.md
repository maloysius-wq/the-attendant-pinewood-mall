# Pinewood Mall Agent Rules

## Non-negotiable repository access rule

For **The Attendant: Pinewood Mall**, always use the connected **GitHub plugin/connector** for repository work.

- Use the GitHub plugin first for reading repository files, inspecting commits, searching code, writing files, committing changes, checking Actions, and verifying GitHub Pages.
- Do **not** assume repository access is unavailable before explicitly checking the GitHub plugin.
- Do **not** substitute container `git clone`, raw web access, web search, or a browser mirror for repository operations when the GitHub plugin is available.
- If a GitHub operation appears unavailable, explicitly check/discover the GitHub plugin again before claiming access is missing.
- The canonical repository is `maloysius-wq/the-attendant-pinewood-mall` on branch `main`.

This rule exists because the repository is connected with write access and must be treated as the primary development interface in every Pinewood development session.

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
3. Inspect the latest `main` commit and relevant current files.
4. Treat the current repository plus the user's newest explicit request as source of truth.
5. Implement directly in the repository when the request is actionable.
6. Preserve the permanent local-runtime-asset rule.
7. Run/inspect runtime audits and verify GitHub Pages after runtime changes.
