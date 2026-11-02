# V63 imported mall-front landscaping

Both visible props are **existing third-party models**, not Pinewood-authored geometry.
They are locally vendored GLBs. Innerscene Corp states CC0 1.0 on the source
pages AND embeds the copyright/CC0 dedication in the files' glTF asset metadata.

- Weathering steel planter (1.2 × 0.6 × 0.65 m), original model:
  https://www.innerscene.com/tools/library/3d-parts/weathering-steel-planter-1a0662ed
  SHA-256: `10e21b1334a3277ac6d0df1a14045370c68ce487a46ddd921c0dff316261415f` (81,204 bytes)
- Rounded landscape shrub (approximately 1.44 × 1.42 × 1.41 m), original model:
  https://www.innerscene.com/tools/library/3d-parts/rounded-landscape-shrub-71bcc316
  SHA-256: `bb5605f4367e53f4a11c007c5a46ae92e08c6a6f7a277d23d33e840f354ecef2` (487,084 bytes)

Direct downloads and exact hashes are recorded in `manifest.json`.
The v63 scene clones these source models to 8 positions; it does not create
BoxGeometry, CylinderGeometry, or any other stand-in planter/foliage mesh.
The v63 service route is kept clear. Older v62/production scenes retain
their previous behavior, pending Max's visual approval.
