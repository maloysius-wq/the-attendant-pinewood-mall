# V122 | 1979 original anchor ceilings and tenant identity

**Scope:** First lighting and original-tenant identity pass on [architecture issue #119](https://github.com/maloysius-wq/the-attendant-pinewood-mall/issues/119), continuing V121's genuinely carpeted 425m² Fallow's and 306m² east original department store. This is not a claim that either shop is fully furnished or that the issue is complete.

## Physical source plan

- Fifteen actual source-panel GLBs are attached to the original, existing **5.21 m ceiling underside** (9 Fallow's, 6 East Department). The original `mall/physical-shell-v67.mjs` surfaces are unchanged; there are no duplicate ceiling slabs, floating panels, or new room IDs.
- The source is the already-vendored, pinned, CC0 `liminal-spaces-kit-ceiling-fluorescent-0299417a.glb` model used in the V108 vestibule. It has a real housing, lens and emissive source material. Its SHA256 is `51cad3ec6b43627251cd5cdce6b1a367fe83e6906334edf096f8dc725dca772d`. No new binary or remote runtime dependency.
- Seven deliberately broken dark panels remain physically mounted. Eight panels have working/dim lenses, but only sufficiently lit units add low-strength point sources attached to their measured true lens positions. Distinct department tints suggest surviving closeout-night wiring without blanket illumination.
- Fallow's and East Department retain their original V115 storefront identities. Each gains one restrained, **masonry-attached** 1979-era enamel department sign high on its actual back wall, above and separate from all V121 shelves and source fixtures. No shop entry is narrowed and no aisle collider is changed.
- Whole property renderer loads all genuine fixtures and signage before attaching the mall to the active scene, using the same shared source property in the Builder, opening cinematic and playable six-chapter world. The roof-free survey camera also hides the original ceiling fixtures with the source roof.

## Verification / release rules

The dedicated `anchor-identity-v122.yml` workflow checks the exact canonical source model bytes against the existing Builder catalog, physically confirms all placements are under real 5.21m source ceiling plates, and reruns original V121 V115 V113/Chapter tests. Desktop Chromium captures **actual full-mall WebGL** views inside both stores with both the survey light **on** and **off**, plus west/east gallery storefront and roof-free plans, preserving measured renderer manifests and screening external requests.

**Do not promote a red or unreviewed PR.** Review the real screenshots and original six-chapter tests before merging. Manual WASD/mobile verification is not included; do not imply it happened.

**Next:** review actual shop light/dark balance and add visibly believable scaled, license-verified stock/returns fixtures (never random empty-floor clutter), then continue Cassette Castle, Video Planet, Sunburst Arcade, staff suites, annex and the remaining deliberately counted 520m². Private unpublished Builder placements, all 41 story room IDs, nine LS evidence anchors, six chapters and the V113 hinged fire door/film endpoint remain protected.
