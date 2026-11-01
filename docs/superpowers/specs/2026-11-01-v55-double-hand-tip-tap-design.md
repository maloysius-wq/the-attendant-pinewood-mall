# The Call v55: Double-Size Connected Right Hand and Tip-Only Tap

## Intent
Max approved the v54 continuous CC0 right hand but says its rendered size is too small. The hand and attached forearm should appear about twice as large in the same first-person phone shot. The thumb should float unmistakably above the screen at rest, then only its distal tip should dip onto CHECK IN and lift again. No portion of thumb skin may visibly enter the phone.

## Boundaries
- Reuse the source-authentic MakeHuman/Innerscene CC0 v54 GLB, original 163-bone hierarchy and skin weights. Do not generate proxy fingers or detach any geometry.
- Scale the hand+forearm to 2.4× phone-local (twice the v54 1.2× scale), then re-anchor around the phone's right edge. Leave phone dimensions, car, audio, captions and production New Game unchanged.
- Measure the distal *skinned surface*, not the terminal bone joint. At hover, a real distal thumb-pad skin point must sit comfortably away from the face (at least ~35 mm above screen z=+.024). At contact, its skin must stop at or just above z=+.024, within the actual CHECK IN rectangle, then return exactly to hover after tap.
- Keep the wrist/palm and the first two thumb joints effectively fixed during the tap. The distal joint carries the motion; avoid screen text occlusion before/after. Collision protection must examine the animated thumb surface across the full press path (not just end frames).
- Mobile Android 390×844 is decisive; also 632×748 narrow and 1280×720 desktop. Verify the full cinematic, accessibility, local assets and production isolation before publishing an isolated review v55.

## Approaches
1. Scale the whole existing rig and rotate proximal thumb joints harder. Simple but repeats the full-thumb swipe and can drive flesh through the display; rejected.
2. Replace with a picture/hand overlay. Visually controllable but breaks original skinned 3D anatomy and dynamic shot; rejected.
3. **Chosen:** double the existing authentic rig, calibrate a source-skinned distal pad, solve a constrained distal bone bend, and clamp animation at the first surface contact. Screenshot and depth-test the actual rendered mesh.

## Implementation calls
- Make a versioned opening/makehuman-forearm-v55.js so v54 remains reproducible. Reuse local v54 asset with pinned manifest.
- Add a thumb-surface probe that transforms source vertices with original skin weights. Identify distal thumb vertices by the original finger1-3.R joint influence and select the forward contact patch.
- Solve an anatomically plausible local distal-bone flexion and its lift animation; bound any other movement to a negligible amount. Treat phone face as z=+.024, x approximately [-.109,+.109] and y approximately [-.198,+.188]; the CHECK IN button occupies approximately x=[-.097,+.097], y=[-.158,-.113].
- Automated tests must fail on v54-sized/whole-thumb motion or any skin vertex penetrating the phone during sampled press phases; capture hover, down, release and an unobstructed hand screenshot. Do not relax the collision threshold to hide a bad pose.
- Keep root index.html/game.js and all six chapters byte-identical. Publish only after review-only CI passes. Max makes the final visual decision.
