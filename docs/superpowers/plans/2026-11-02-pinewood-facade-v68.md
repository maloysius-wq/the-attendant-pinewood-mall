# 2026-11-02 — Pinewood Mall facade v68

Approved design foundation: v66 masterplan, v67 structural shell, and Max's explicit exterior requests. This is a review-only visual/architectural facade milestone.

## Design commitments
- Preserve the fixed outer original-mall 1979 front wall at Z=-22.5, X=-47..47 and 12.8m tall. The later East Wing stays visibly lower (8.5m) with its own employee doorway.
- One clear, large aged PINEWOOD MALL sign; not several random panels.
- Boarded main lobby centered X=-10.5, width 9.6m, collision-impassable; three intentional plywood bays, real bracing, dark recessed glazing and restrained hardware.
- Contractor service entry X=12 remains physically open, 1.78m wide, 2.27m tall, and fully aligned to the cinematic. Its trim cannot obstruct the hitbox.
- No random windows or floating facade shapes. Subtle coherent water-staining, worn masonry, oxidized trim, and quiet readable darkness.
- Production runtime and original opening are not modified in this milestone. Reuse existing same-origin licensed materials; typography and physically attached plywood/weathering layers are code-native geometry.

## Acceptance / TDD
1. Write failing Node tests for sign placement, boarded/front entrance, open cinematic threshold, and attached weathering.
2. Build pure facade plan and validate physical geometry.
3. Write failing browser camera tests for daytime-disabled, wet-night frontage scene (desktop/mobile) and local asset safety.
4. Build facial architectural material layer and a new review page from the verified v67 renderer. Preload before first visible frame.
5. Verify browser screenshots and chapter exit state. Update handoff, merge only when scoped CI is green.
6. Separate later milestone: full runtime collision/navigation, chapter interactions, evidence, ambient sound, and cinematic/game transitions.
