# The Call: Natural Right-Hand Grip Design

## Intent
Replace the uncanny v51 wrist-only hand pose with a believable adult right hand holding the existing phone during the preview cinematic. Keep the chosen CC0 OpenGameArt Playerhands skinned forearm and its 20-bone rig.

## Constraints
- Preserve phone dimensions, placement, local field-service app, car model, roof, captions, Renee voice, and production root.
- Palm and wrist must sit behind the phone's right edge; four fingers curl behind the chassis. Only the thumb reaches the glass to tap CHECK IN and retract.
- Source forearm stays continuous and enters from below/right; no negative-scale sprite mirroring or extra proxy geometry.
- Keep preview isolated until Amanda approves visually.
- Verify by actual browser screenshots in desktop, narrow, and portrait; compare visual skin obstruction and skinned thumb-to-button distance.

## Approaches
1. **Chosen:** Anchor wrist/palm to the phone first and orient source fingers upright behind its edge; curl joints, then solve thumb IK relative to the fixed palm. Changes only the pose algorithm, retains real textured source geometry.
2. Previous approach: Force source finger direction horizontally right and translate the entire model to align thumb tip. Tests passed but projected the whole palm across the screen.
3. Replacement asset: higher-quality CC0 complete arm could improve aesthetics but would discard the specifically selected source model and require relicensing/asset pipeline work.

## Success criteria
A right-side natural hold with no broad palm polygon over the app; thumb moves from the right edge into button and back; adult-sized forearm stays connected; screens remain readable at three layouts.