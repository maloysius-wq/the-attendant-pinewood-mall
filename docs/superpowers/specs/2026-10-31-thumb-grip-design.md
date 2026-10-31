# The Call v53 anatomical right-thumb grip — design

**Owner:** Max. **Date:** 2026-10-31. **Status:** Working design based on owner-rejected v52 preview; original CC0 asset retained.

## Intent
Repair the physically implausible preview hand visible in Max's Android portrait screenshot: the four fingers are hidden, the thumb appears inverted and detached from a blocky mitten, and the nail points outward. A believable adult right hand should visibly connect to the phone at its lower-right edge, keep the four fingers curled behind the case, and move its thumb naturally onto the CHECK IN button.

## Constraints and anti-goals
- Keep sandsound's original local CC0 OpenGameArt Playerhands forearm, source skinned mesh and 20-bone armature. No new hand, vector fingers or procedural proxy. No remote runtime assets.
- Leave approved phone size, wheel, car, captions, audio and six-chapter production runtime untouched. Opening remains isolated review only until Max approves.
- Do not claim that a fingertip coordinate proves a good visual; inspect actual desktop/narrow/390px portrait captures of HOLD, TAP and paused CHECKED IN.
- Preserve deterministic Playwright testing; no manual WASD playtesting.
- The source mesh is only 447 vertices and 682 triangles. Pose repair comes first. Surface smoothing may be assessed separately, with original source provenance preserved.

## Approaches
1. **Continue unconstrained CCD to the original moving X/Y target** — rejected: this has already forced the thumb through an anatomically implausible path while tests passed.
2. **Anchor the original thumb knuckle at the lower-right phone edge, with a bounded authored hover-to-tap joint movement** — selected. Source bone hierarchy and skinning stay intact. Thumb rises from below the button, bends inward, and presses a short distance toward glass. Optimize/validate the complete joint chain.
3. **Replace the hand asset** — excluded by Max's prior explicit choice of the original Playerhands forearm. A different model is not being introduced.

## Chosen visual contract
- Knuckle `ThumbA` lies just outside the right physical case, below the button, in front of the case depth; it must not originate from the middle of the LCD.
- `ThumbB` and `ThumbTip` travel inward from the right and rise from the knuckle: the joint chain must be ordered and connected, with bounded rotation relative to the native rig.
- The hover point is directly above CHECK IN on the Z axis, not an across-screen swipe. The tap presses toward the glass and retracts using interpolated bounded source joint poses.
- All four source finger tips remain behind the chassis. A visible portion of the original hand stays alongside the right edge; the LCD remains readable.
- The automated check must fail on v52's inverted/thumb-base-above-tip geometry and succeed on v53's full-chain pose, then rendered captures must be inspected before any merge.

## Review boundary
v53 may be merged to the isolated review page only after original CC0 provenance, real-pixel and source-bone regressions and human inspection of test captures. Promotion into New Game requires a later explicit approval by Max.
