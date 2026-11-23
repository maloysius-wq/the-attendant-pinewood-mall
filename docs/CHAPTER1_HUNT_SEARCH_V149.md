# V149: Reachable original Attendant hunt-to-search pacing

## Problem and exact source

The original source `Attendant.update(dt,t,playerPos,fear)` indefinitely resets hunt memory to 8 seconds while it actually sees the human, which is correct. After genuine LOS breaks, it otherwise continues chasing the remembered point for a full eight seconds. Its subsequent five-second search chooses a **random passable cell** within approximately five metres of `lastHeard`, but *passable* alone does not guarantee an original **A*** path from the actor. In the 1979 original mall, wall-separated rooms and gallery partitions mean a random passable destination can be physically disconnected.

V139 preserves a 15-second safe first sighting. V140 keeps the original actor from following an occluded player in hunt and prevents through-wall deaths; it also preserves a minimum 12-second respite when a real search ends. V146 handles original Q-thrown decoy hearing and genuine player LOS priority. V147 makes the protected initial silhouette react to actual audible decoy sounds. V148 fixed genuine chapter restart. V149 is a **focused original Chapter 1** refinement, not a new AI, new voice or new scene.

## Source-world implementation

The installed V149 wrapper only modifies Chapter 1 original Attendant method calls, after the V139–V148 gameplay bridge has finished. Its original update and source path operations remain authoritative.

- **Fair chase tail:** If the original Attendant is visibly spawned, in `hunt`, no longer detects the player via its actual `canSee` (which includes real original wall LOS), and no genuine decoy is active, the remaining eight-second sight-memory tail is capped at **6.25 seconds**. It still follows the last real observation using V140. When the player remains visible or has an active decoy, original hunt/hearing/priority stays unchanged. This cap is not a forced despawn or safety bubble.
- **Last observation first:** At the original `hunt` or `investigate` → `search` transition, clears the old hunt path (which might lead toward an unseen person) and asks the original `world.astar` to route to `Attendant.lastHeard` on the real existing source map.
- **Reachable inspection sweep:** Subsequent original search path requests select the centre and nearby cells within **two original grid metres** of that genuine last-heard position. Candidates must pass original `world.navPassable` and their actual original `world.astar` must reach the chosen cell. If none is reachable, it refuses a phantom route and allows the original search timer to conclude. There are no new meshes, teleportation, fabricated cells, colliders or navigability overrides.
- **Real safety and recovery:** V140 nonlethal masonry cover, full first-sighting grace, original contact death, V146 physical E/Q decoy, V147 introduction, actor/detection logic and **12-second after-search recovery** remain intact. Original source reset calls continue and V149 counters reset on chapter restart. Chapters 2–6 pass through to their original source AI unchanged.

## Exact-run original desktop proof

[GitHub Actions original source + 1440×900 browser #45236820373](https://github.com/maloysius-wq/the-attendant-pinewood-mall/actions/runs/45236820373) passed **BOTH JOBS** on gameplay source commit `14450db022c9d4dfb6ea21bcec4a4e6a3ed8a819` (2026-11-23). Source tests include V140/V146/V147 plus original compressed-AI witness and CC0 local-assets audit.

Original desktop Chromium loads authentic V113/V70 Chapter 1. The source breaker and real V139 first reveal activate the original actor. Its real Fallow wall blocks LOS. The actor correctly shortens **unseen** hunt memory to **6.25s**, enters search on the actual last-known physical source point **(-27,-62)** with a **9-cell true A*** route, then sweeps to a second reachable source point **(-26,-62)**. V140 ends real search and preserves a full **12s** respite. The original V146 source-world check proves a truly visible player through a genuine original gallery sightline supersedes the search/decoy (human priority remains real). **0 browser errors, 0 third-party runtime requests, and 0 failed local runtime asset requests**. Genuine 1440×900 screenshot and JSON gameplay telemetry archived as `v149-original-hunt-search-pacing` (artifact ID `14850652736`); screenshot not separately visually reviewed.

## Next

Issue #146 remains open. Continue careful sustained threat/audio and player-facing first-person pacing validation, then source-authentic **physical character belongings and breadcrumbs for Jo Alvarez, Tessa Kim and Luis Ortega**. Keep them separate from the nine original 1997 Last Shift evidence anchors and follow `STORY_BIBLE.md`. Subsequent tasks: Renee/PCAS Chapter 2 handoff/timing, save/continue migration, cross-chapter regressions and Chapter 1 45–60-minute pacing/visual/audio review. Maintain original 41 rooms, six chapters, 13 sealed bays, V113 original cinematic and E door, real wall breakers, and local SHA-pinned licensed CC0 assets. Never publish the private unpublished Builder, run mobile QA, or do manual WASD playtesting.
