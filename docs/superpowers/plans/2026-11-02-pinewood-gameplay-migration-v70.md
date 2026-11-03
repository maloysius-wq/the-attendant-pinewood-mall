# V70 — Unified Pinewood gameplay migration

> Approved direction: one ground-floor retail mall with a high atrium, a real B1 mechanical floor, and an M1 administrative mezzanine. Source of truth: `docs/superpowers/specs/2026-11-02-pinewood-master-mall-design.md`, `mall/masterplan-v66.mjs`, the v67 physical shell, and the v69 licensed furnishing layout.

## Goal
Replace six unrelated flat chapter maps with one consistent building, using the exact approved shell and vendored assets. Keep the opening work order, Renee/PCAS narrative, all nine Last Shift evidence items, chapter win conditions, desktop controls, and existing save schema. Do not add mobile testing.

## Implementation steps
1. **Navigation contract (test first)** — A pure floor-aware occupancy and physical-collision planner sourced from the room graph, wall segments, chapter gates, and furniture. Test spawn safety, evidence reachability, no walking through walls/boarded entrance, and floor transitions.
2. **Runtime bridge (test first)** — Load v69 shell/furnishings before revealing gameplay; reuse its scene graph between chapters, apply chapter gate states, and expose reliable lifecycle cleanup.
3. **Story relocation** — Move each authored interaction and setpiece to its mapped room and height; isolate old map floors, walls, and obsolete decor. Keep original interaction handlers, identities, prompts, evidence, flags, and six-chapter logic. Re-target hardcoded proximity triggers.
4. **Floor-aware movement and AI** — Clamp player to the current physical floor; route the Attendant only over approved navigable cells, with correct elevation and wall line of sight. Implement explicit freight, stairs, and final-exit transitions.
5. **Desktop verification** — Run pure Node navigation tests, all existing non-mobile unit and story tests, and headless desktop browser cinematic/gameplay checks. Confirm all 6 chapters, LS-01..09, save/reload, no duplicate mall geometry, cinematic entry at the correct service door, no untextured first frame, and chapter completion to credits.
6. **Release** — Stage as an isolated PR. Only merge to main / live Pages after validation; do not silently trade the working campaign for an attractive but broken shell.

## Canonical chapter spaces
| Chapter | Active floor | First playable room | Anchor narrative |
|---|---|---|---|
| 1 — Arrival | G | service_vestibule | Renee, A/B/C, dry fountain, freight descent, LS-01..03 |
| 2 — Below Grade | B1 | freight_b1 | D/E, feeder, pump, Gavin, LS-04 |
| 3 — Eyes in Security | G | security | CCTV, Luis, shutters, LS-05 |
| 4 — East Wing | G | annex_threshold | physical map, Tessa, records, LS-06 |
| 5 — Accountability | M1 | m1_stair | payroll, roster, Eli, Kessler, LS-07..09 |
| 6 — Last Shift | M1 | pa_control | closing-memory comparison, accountability, controlled exit |

## Non-negotiable acceptance
- Never call `carveChapter` or `MallWorld.buildGeometry` for production gameplay after migration.
- All three levels have solid, correctly placed floor and wall collision.
- Only local licensed assets; do not reintroduce Cassette shelf models.
- Saved narrative flags and evidence keys remain compatible with existing saves.
- Desktop-only verification. Never add mobile snapshots, viewport matrix, or manual WASD tests.
