# The Call v54: Anatomical right forearm and thumb design (2026-10-31)

## Intent
Max approved replacing the rejected 682-triangle sandsound Playerhands hand/forearm after v52 and v53 showed a twisted, seemingly detached thumb. The player is in the driver's seat holding a real work phone in their RIGHT hand. A continuous forearm enters from below/right; a believable thumb moves from the right edge onto CHECK IN. The app and dialogue stay unobscured.

## Source decision
Use the documented CC0 MakeHuman-derived male full-body A-pose 163-bone skinned GLB from Innerscene. Crop the actual source skin mesh offline by its right lower-arm, wrist, metacarpal and finger bone weights; keep one piece and the original bind hierarchy. Never ship a full nude mannequin, disconnected hand-only mesh, procedural pills/fingers, or offsite runtime loads. Do not use any source other than this pinned CC0 original. Retain the old v48 source only as historical rollback, no longer referenced by preview.

## Rendering and motion
Preserve the existing mobile/desktop phone geometry, screen, spoken timing and isolated review URL. Use the source rig with phone-local adult proportions, a wrist anatomically underneath the thumb root, the four fingers curled around the BACK, and the thumb approaching from the right/front. The thumb tap moves toward glass, not sideways across the screen. Source joints may rotate only within moderate realistic limits, and screen text/button must stay readable. No production New Game promotion until Max accepts a phone screenshot.

## Alternatives considered
1. More IK on sandsound: rejected from three failed iterations and 447 source vertices.
2. CC0 PSX FPS arms (1,200–1,760 triangles): includes forearms but again not enough geometric detail for a close-up.
3. **Selected:** MakeHuman-derived continuous arm and finger rig (~14k cropped right-arm triangles), locally vendored and source-pinned.

## Acceptance
- Legal CC0, source SHA pin and local GLB validated.
- A SINGLE weighted mesh carries wrist/forearm/five fingers; no floating thumb.
- Deterministic mobile 390×844, narrow 632×748, desktop 1280×720 captures checked with eyes, not just telemetry.
- Thumb starts at edge/lower than button and touches CHECK IN from right without blocking the app.
- No change to root production game.
