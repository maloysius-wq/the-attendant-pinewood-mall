# Pinewood Mall: Architectural Masterplan v66 (approved)

**Decision:** One publicly accessible retail level with a 12 m central atrium, one limited administrative mezzanine above the rear and east service spine, and one true below-grade service level. This is a replacement **physical world**, not six disconnected chapter maps.

## Immutable geographic coordinates
World units are metres. X increases east; Z becomes more negative toward the rear/north; Y is vertical. The production cinematic's parking-lot facade is at **Z = -22.5**, original mall extends **X = -47..47**, **Z = -22.5..-118.5**. The original front wall and v65 signage remain authoritative during migration. Service entry: **(12, -22.5)**, 1.78 m x 2.27 m, authorized. Boarded public entry: **(-10.5, -22.5)**, permanently impassable. Both are a single-world shared coordinate contract with `opening/scene.js` and `opening/facade-v65.js`.

Later annex: **X = 47..86, Z = -34..-115**. East exit at **(86, -42)** outside-facing, mechanically unavailable until the Chapter 6 final clock-out. Don't confuse this east exit with the front service door.

## Blueprint (proposed architectural zoning)
Ground (G): front service vestibule (southeast of boarded lobby) → long gallery and dry central fountain → west retail (original department anchor, Cassette Castle, Sunburst Arcade), east retail (Video Planet, food court) → rear freight lift and security. A secondary staff threshold behind security opens into the 1988–94 East Wing, which contains an anchor, lockers, break room, Training T-04, Receiving R-12, hidden staff routes and an employee-only eastern exit.

Basement (B1, floor Y = -4.3 m): freight lift → industrial cross-corridor → relays D/E → feeder, sump and flooded passage/Gavin site → north stair to Ground Security. All corridors must have continuous walking geometry, not scene transitions.

Mezzanine (M1, deck Y = +5.4 m): stairs from Receiving R-12 → records gallery → payroll/roster/contractor ledger → Kessler office → PCAS and PA control with Eli's sealed utility chase. This is **not a second shopping level**; it is visible across/above portions of the tall original concourse.

## Narrative geography and chronology
- 1979 opening: central dry fountain and main retail.
- 1988–94: annex/second anchor built behind front facade; T-04 and R-12 existed as ordinary staff rooms.
- 1996–97: PCAS retrofit, hidden PA/utility chase, false egress E-17; concealment, falsified all-clear, Eli's final job.
- 1998–2020: incremental tenant closures, partitioning, boarded entrances, persistent staff-only access.
- 2020 public closure to present: utility call with dispatcher Renee Ward for Contractor Fourteen. The Attendant's nature stays ambiguous. Eli Mercer is a victim, not the creature.

**Chapter geography:** Ch1 G/fountain and retail, LS-01..03. Ch2 B1/relays and Gavin, LS-04. Ch3 G/Security and Luis evidence, LS-05. Ch4 east annex, LS-06, Tessa/Jo/R-12/T-04/E-17. Ch5 M1/Records, PCAS, sealed Eli route, LS-07..09. Ch6 M1/PA, public-mall return, east Employee Exit and standard/true endings. The closing ritual uses formerly visited spaces; memory overlays change presentation, not floor topology.

## Visual and atmospheric direction
One taller exterior; no wall of windows; art-deco/late-modern period sign; front doors visibly boarded and non-traversable. Original mall: aged cream terrazzo, weathered wood and failing brass. Annex: lower ceilings, institutional carpet, post-1980s security doors. B1: wet pipes, corroded plant rooms, audible water. M1: vinyl acoustic walls, file storage, PCAS refit and visual overlook of atrium. Every prop must have an architectural reason, no mystery polygons or collisionless decorative shapes.

## Shipping strategy and acceptance
1. **v66 contract + review-only graybox**: precise coordinates, physical portal graph, data-driven SVG blueprint and local Three.js massing, desktop/mobile screenshots, no changes to production six-chapter runtime.
2. Model and furnish public shell (licensed, vendored art) with believable night sightlines.
3. Replace existing disconnected chapter floor carving with one persistent shared topology. Portals and vertical travel preserve position and state. Add level streaming and saves with schema migration.
4. Chapter-by-chapter narrative placement, audio occlusion, pathing/navigation and objective validation.
5. Deterministic end-to-end runs, endings, accessibility/mobile FPS and local asset audits, then promote the rebuilt runtime.

Do not promote the graybox into the game as final art. Production deployment remains untouched until each chapter path is validated. Treat `STORY_BIBLE.md` as canonical on names, evidence and ending criteria.