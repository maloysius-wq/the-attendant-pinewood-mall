# Pinewood Mall Agent Rules

## Non-negotiable repository access rule

For **The Attendant: Pinewood Mall**, always use the connected **GitHub plugin/connector** for repository work.

- Use the GitHub plugin first for reading repository files, inspecting commits, searching code, writing files, committing changes, checking Actions, and verifying GitHub Pages.
- Do **not** assume repository access is unavailable before explicitly checking the GitHub plugin.
- Do **not** substitute container `git clone`, raw web access, web search, or a browser mirror for repository operations when the GitHub plugin is available.
- If a GitHub operation appears unavailable, explicitly check/discover the GitHub plugin again before claiming access is missing.
- The canonical repository is `maloysius-wq/the-attendant-pinewood-mall` on branch `main`.

This rule exists because the repository is connected with write access and must be treated as the primary development interface in every Pinewood development session.

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
6. Run/inspect runtime audits and verify GitHub Pages after runtime changes.
