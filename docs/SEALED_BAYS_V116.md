# V116: Turn previously empty ground-floor space into actual enclosed mall areas

## Design intent

This is a physical architecture pass, not an extra set of floating decorative
surfaces. The canonical original mall footprint remains **12,183 m²**.
The original 41 story rooms, nine evidence locations, seven major V115 glazed
shops and six chapters remain unchanged.

Thirteen separately bounded, permanently inaccessible retail/storage/service
spaces now occupy **2,277.5 m²** of the V114-audited **2,797.5 m²** previously
unallocated *ground-floor* plan (81.4%). The remaining **520 m²** contains
intentionally unresolved narrow facade reliefs and circulation/service
buffer areas. No invented player access, basements, stair doors, story evidence
or owner-authored Builder placement is introduced.

## New secondary spaces

| Area | Purpose | Floor allocation m² |
|---|---|---:|
| Fallow's closed north wing | Original-era sealed department overflow | 348.5 |
| Needle & Thread | Shuttered public tenant | 246 |
| Photo Finish | Shuttered public tenant | 266.5 |
| East Department back stock | Original-era sealed shop stockroom | 348.5 |
| West Loading Dock | Closed receiving store | 187 |
| Old Janitorial Supplies | Sealed behind West Gallery | 84 |
| Records Overflow | East Annex staff storage | 90 |
| Parkway Tailors | Abandoned 1992 annex shop | 108 |
| Terra Ceramics | Abandoned 1992 annex shop | 126 |
| Lantern Supply | Abandoned 1992 annex shop | 117 |
| Personnel Files | East Annex restricted office archive | 126 |
| Annex Boiler & Vent Plant | Mechanical bay behind staff spine | 90 |
| East Wing Bulk Storage | Enclosed rear annex store | 140 |

Eight of these have visible **source-aligned shutter frontages** facing actual
canonical circulation rooms. They include period shop fascia, enamel sign,
structural roller tracks and steel slats. The other five are permanently
closed, physically walled storage/back-of-house areas. Ceiling undersides
physically bound every new interior.

## Safety and implementation

- `mall/sealed-bay-plan-v116.mjs` validates every ancillary rectangle
  against both original physical footprints and all canonical story rooms.
  The source-fixed 41 narrative room IDs and existing route graph remain.
- The wall builder intersects source walls and shared seams, subtracting
  existing structural coverage before building new walls. This avoids
  doubled coplanar geometry and random freestanding panels.
- Metal shutters are actual impassable wall solids, not graphical filler,
  and there are **no newly unlocked player paths** into ancillary spaces.
- Original ceiling, GLB source manifest, V113 fire door and player spawn,
  V114 lintels and V115 real glass/frontages remain unchanged.
- The seven original V115 retail shops still keep open doorways.
- The Builder's canonical 41 room wall paint intentionally does not paint
  non-story closed shutter faces or change private saved draft records.
- Actual desktop Chromium/WebGL render captures and floorplan source
  overlays audit north shops, Annex frontages, west supply and all 13 bays.
- The new floorplan includes a dedicated sealed-area overlay and separate
  counts for **newly enclosed** versus **still unallocated** floor, without
  rewriting the source-measured V114 audit.

## Follow-on work

Newly enclosed bays resolve structural voids. Full playable retail interiors
still need coherent fixtures, approved 1997-era shop dressing, distinct
retail tenant geometry, believable food court and security layouts, aged
lighting and visual inspection. Do **not** describe these bays as 13 new
story rooms or as a finished indoor mall.
