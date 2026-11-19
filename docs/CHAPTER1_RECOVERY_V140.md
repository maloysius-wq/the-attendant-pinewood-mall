# V140: fair original Attendant pursuit and recoverable Chapter 1 death

## Original-game defects documented before editing
The immutable original compressed Game/Attendant class uses current \`playerPos\` as the hunt A* target at every 0.28s repath, **even after the player has broken line of sight**. That is effectively omniscient pursuit through the original store masonry. The original contact kill checks only planar distance below 0.72m, even without physical LOS, and its end-of-search dormant cooldown is randomly only 4–8s.

## Scoped corrections
- Chapter 1 **only**: intercept the original \`setPath\` when original \`state==='hunt'\` tries to follow the exact player vector while the Attendant does **not** actually see that player, and no real decoy is active. Use its actual \`lastHeard\` Vector3, updated by the genuine sight/hearing code. Continue using the original source \`world.astar\`. New footsteps/noise can still update lastHeard. The original AI, original model, real walkable cells and decoy investigation are retained, not replaced or muted.
- Chapter 1 **only**: the existing Attendant-contact death text can only kill if the true physical 0.72m range, same floor, original \`world.hasLOS\`, and not concealed in a cabinet apply. The second half of the real 1.22s cabinet entrance animation is protected, while the approach remains dangerous. The normal original death screen, effect and death reason remain authoritative. All other death reasons and chapters retain their original method.
- Original search-to-dormant transition gets a **minimum 12s respite**, not 4–8s. It does not freeze the Attendant once a new genuine loud event occurs.
- The first genuine hunt/search state transitions add at most two brief original HUD text cues, **only if no E interaction hint is on-screen**. Flashlight flicker uses its already established local runtime feedback and changes no sourced lighting model. Never impersonate or invent Renee Ward audio.
- Existing original \`resetState\` and Chapter 1 full-scene restart clear all V140 counters/cues. Idempotent on chapter transitions. No synthetic room, spawned enemy clone, Builder/IndexedDB publication, remote asset, manual WASD or mobile test.

## Release gate
Exact GitHub feature head must pass original source/unit tests, preserved V137/138/139 contracts and pinned assets audit. Real 1440×900 desktop Chromium must show original A/B/C circuit activation, original source mall-wall LOS obstruction and last-known A* destination, original Attendant search cooldown and correct live gallery contact death, then a real death-screen restart rebuilding original walls/cabinet/decoy inventories. Retain screenshots. Only after all this and visual inspection merge.
