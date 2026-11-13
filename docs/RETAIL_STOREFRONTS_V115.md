# V115 retail shopfronts: architectural implementation (first slice)

The real physical six-chapter mall now has **seven source-measured shopfront
envelopes**, not mere signs painted on opaque masonry. Original elevations,
door positions and story-linked rooms remain unchanged.

| Tenant / setting | Bound source room | Facing existing corridor |
|---|---|---|
| Fallow's Department Store | `west_anchor` | West Gallery |
| Cassette Castle | `cassette_castle` | West Gallery |
| Sunburst Arcade | `sunburst_arcade` | West Gallery |
| East Department Store | `east_original_anchor` | East Gallery |
| Video Planet | `video_planet` | East Gallery |
| Old Food Court | `food_court` | East Gallery |
| East Wing Anchor | `annex_anchor` | East employee spine |

## Implementation

- `mall/storefront-plan-v115.mjs` resolves the original doorway portal to
  the storefront side of its specific named room, validating width, axis,
  ordering, access and physical wall height. No hard-coded fake opening may
  be positioned away from a playable doorway.
- The original solid opaque store-wall face is physically replaced with clear
  glass in TWO flanking window assemblies, supported on actual opaque kick
  bases, structural end piers and upper spandrels. Its original **4.2m entry**
  stays walkable at ground level. Source V114 lintels remain intact.
- `mall/render-storefronts-v115.js` adds precisely attached, original
  modeled storefront frames, entry jambs, mullions, sash lines, fascia, period
  tenant signage and worn enamel details. No external assets or network fonts.
- Glazing and low bases are real walk-level collision. Upper spandrels,
  V114 doorway headers and purely visual sign frames are not. Builder room
  paint respects the true window surfaces rather than making them opaque.
- Scene rendered once in physical shell and automatically shared by Builder,
  cinematic and six-chapter game; private owner-authored Builder decorations
  remain unpublished and untouched.

## QA

Gate the PR on the existing physical shell, V114 masterplan, V70 story paths,
V112 exact cinematic door, Builder finish overlays and **actual** Chromium
WebGL eye-level storefront screenshots; validate zero off-origin resources.

## Still deliberately outstanding in V115

This is the first **real** shopping frontage slice, not a finished mall. The
unallocated footprint still requires a phase of explicitly authored secondary
tenants and believable closed bays; public circulation needs architectural
columns, storefront frontage along dead space, room subdivision, and shop
furnishing with verified local licensed assets. Do not falsely claim empty
areas or interior set dressing are finished after this facade pass.
