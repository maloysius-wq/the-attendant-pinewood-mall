/** Authored furniture and evidence anchors for the licensed, review-only v69 interior.
 * X/Z are physical world metres and never replace the six-chapter game map.
 * All model paths are pinned CC0 assets from the committed runtime manifest.
 */
import {MALL} from './masterplan-v66.mjs';
import {constructPhysicalShell} from './physical-shell-v67.mjs';

export const FURNISHINGS_V69=Object.freeze({
  "version": 69,
  "fixtures": [
    {
      "id": "cassette_counter",
      "room": "cassette_castle",
      "model": "assets/vendor/runtime/ae14ac85cb3b895b/KSI_counter.glb",
      "x": -42,
      "z": -77.4,
      "targetHeight": 0.88,
      "radius": 1.4,
      "role": "counter",
      "yaw": 1.5707963267948966
    },
    {
      "id": "cassette_rack_w1",
      "room": "cassette_castle",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": -44,
      "z": -81.8,
      "targetHeight": 2.12,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "cassette_rack_w2",
      "room": "cassette_castle",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": -44,
      "z": -86,
      "targetHeight": 2.12,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "cassette_rack_e1",
      "room": "cassette_castle",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": -33,
      "z": -87,
      "targetHeight": 2.12,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "cassette_browse_low",
      "room": "cassette_castle",
      "model": "assets/vendor/runtime/5868465fc2ab24c1/bookcaseOpenLow.glb",
      "x": -37,
      "z": -84.8,
      "targetHeight": 1.15,
      "radius": 0.9,
      "role": "low_empty_rack"
    },
    {
      "id": "cassette_stool",
      "room": "cassette_castle",
      "model": "assets/vendor/runtime/7f3df4bac178c342/Stool.glb",
      "x": -39,
      "z": -77.3,
      "targetHeight": 0.72,
      "radius": 0.47,
      "role": "seat"
    },
    {
      "id": "arcade_claw",
      "room": "sunburst_arcade",
      "model": "assets/vendor/runtime/8023a1e257e42500/claw-machine.glb",
      "x": -43,
      "z": -94,
      "targetHeight": 2,
      "radius": 1.12,
      "role": "arcade"
    },
    {
      "id": "arcade_air_hockey",
      "room": "sunburst_arcade",
      "model": "assets/vendor/runtime/8fcc6eb8e8f17912/air-hockey.glb",
      "x": -39,
      "z": -104.5,
      "targetHeight": 0.9,
      "radius": 1.5,
      "role": "arcade"
    },
    {
      "id": "arcade_basketball",
      "room": "sunburst_arcade",
      "model": "assets/vendor/runtime/27d4b43c5e16d9ea/basketball-game.glb",
      "x": -33.5,
      "z": -104.5,
      "targetHeight": 2.35,
      "radius": 2.28,
      "role": "arcade"
    },
    {
      "id": "arcade_stool",
      "room": "sunburst_arcade",
      "model": "assets/vendor/runtime/7f3df4bac178c342/Stool.glb",
      "x": -43,
      "z": -105,
      "targetHeight": 0.72,
      "radius": 0.46,
      "role": "seat"
    },
    {
      "id": "video_counter",
      "room": "video_planet",
      "model": "assets/vendor/runtime/ae14ac85cb3b895b/KSI_counter.glb",
      "x": 35,
      "z": -65,
      "targetHeight": 0.9,
      "radius": 1.35,
      "role": "counter"
    },
    {
      "id": "video_rack_north",
      "room": "video_planet",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 44,
      "z": -64.5,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "video_rack_south",
      "room": "video_planet",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 44,
      "z": -77,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "video_rack_rear",
      "room": "video_planet",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 37,
      "z": -77,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "video_demo_vhs",
      "room": "video_planet",
      "model": "assets/vendor/runtime/856bdfdf2197a32e/VHS_cassette.glb",
      "x": 35,
      "z": -65,
      "targetHeight": 0.025,
      "radius": 0,
      "role": "loose_prop",
      "support": "video_counter",
      "maxWidth": 0.21,
      "maxDepth": 0.115
    },
    {
      "id": "food_table_1",
      "room": "food_court",
      "model": "assets/vendor/runtime/85f4a59fc2e8a75e/Table_Round_Small.glb",
      "x": 35,
      "z": -84.1,
      "targetHeight": 0.78,
      "radius": 0.83,
      "role": "table"
    },
    {
      "id": "food_table_2",
      "room": "food_court",
      "model": "assets/vendor/runtime/85f4a59fc2e8a75e/Table_Round_Small.glb",
      "x": 42,
      "z": -84.1,
      "targetHeight": 0.78,
      "radius": 0.83,
      "role": "table"
    },
    {
      "id": "food_table_3",
      "room": "food_court",
      "model": "assets/vendor/runtime/85f4a59fc2e8a75e/Table_Round_Small.glb",
      "x": 35,
      "z": -93.1,
      "targetHeight": 0.78,
      "radius": 0.83,
      "role": "table"
    },
    {
      "id": "food_table_4",
      "room": "food_court",
      "model": "assets/vendor/runtime/85f4a59fc2e8a75e/Table_Round_Small.glb",
      "x": 42,
      "z": -93.1,
      "targetHeight": 0.78,
      "radius": 0.83,
      "role": "table"
    },
    {
      "id": "food_chair_1",
      "room": "food_court",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 33.1,
      "z": -84.1,
      "targetHeight": 0.87,
      "radius": 0.48,
      "role": "seat"
    },
    {
      "id": "food_chair_2",
      "room": "food_court",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 36.9,
      "z": -84.1,
      "targetHeight": 0.87,
      "radius": 0.48,
      "role": "seat"
    },
    {
      "id": "food_chair_3",
      "room": "food_court",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 40.1,
      "z": -84.1,
      "targetHeight": 0.87,
      "radius": 0.48,
      "role": "seat"
    },
    {
      "id": "food_chair_4",
      "room": "food_court",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 43.9,
      "z": -84.1,
      "targetHeight": 0.87,
      "radius": 0.48,
      "role": "seat"
    },
    {
      "id": "food_chair_5",
      "room": "food_court",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 33.1,
      "z": -93.1,
      "targetHeight": 0.87,
      "radius": 0.48,
      "role": "seat"
    },
    {
      "id": "food_chair_6",
      "room": "food_court",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 40.1,
      "z": -93.1,
      "targetHeight": 0.87,
      "radius": 0.48,
      "role": "seat"
    },
    {
      "id": "food_pizza_box",
      "room": "food_court",
      "model": "assets/vendor/runtime/6a62ba711ba90736/pizza-box.glb",
      "x": 35,
      "z": -84.1,
      "targetHeight": 0.3,
      "radius": 0,
      "role": "loose_prop",
      "support": "food_table_1",
      "maxWidth": 0.34,
      "maxDepth": 0.34
    },
    {
      "id": "food_cup",
      "room": "food_court",
      "model": "assets/vendor/runtime/f576c2b30a9defad/cup.glb",
      "x": 42,
      "z": -84.1,
      "targetHeight": 0.12,
      "radius": 0,
      "role": "loose_prop",
      "support": "food_table_2",
      "maxWidth": 0.11,
      "maxDepth": 0.11,
      "pitch": -1.5707963267948966
    },
    {
      "id": "fallow_display",
      "room": "west_anchor",
      "model": "assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb",
      "x": -43,
      "z": -54,
      "targetHeight": 2.05,
      "radius": 1,
      "role": "cabinet"
    },
    {
      "id": "fallow_counter",
      "room": "west_anchor",
      "model": "assets/vendor/runtime/ae14ac85cb3b895b/KSI_counter.glb",
      "x": -43,
      "z": -68,
      "targetHeight": 0.9,
      "radius": 1.35,
      "role": "counter"
    },
    {
      "id": "east_anchor_rack_n",
      "room": "east_original_anchor",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 43,
      "z": -47.5,
      "targetHeight": 2.08,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "east_anchor_rack_s",
      "room": "east_original_anchor",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 43,
      "z": -58,
      "targetHeight": 2.08,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "security_chair",
      "room": "security",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 41,
      "z": -111,
      "targetHeight": 0.88,
      "radius": 0.55,
      "role": "seat"
    },
    {
      "id": "security_radio",
      "room": "security",
      "model": "assets/vendor/runtime/e3c9feb9172f2e3b/radio.glb",
      "x": 37,
      "z": -109,
      "targetHeight": 0.19,
      "radius": 0,
      "role": "loose_prop",
      "support": "cc0_security_desk",
      "maxWidth": 0.29,
      "maxDepth": 0.14
    },
    {
      "id": "training_desk",
      "room": "training_t04",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 74,
      "z": -102,
      "targetHeight": 0.82,
      "radius": 1.18,
      "role": "desk"
    },
    {
      "id": "training_chair_1",
      "room": "training_t04",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 72,
      "z": -105,
      "targetHeight": 0.88,
      "radius": 0.52,
      "role": "seat"
    },
    {
      "id": "training_chair_2",
      "room": "training_t04",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 76,
      "z": -105,
      "targetHeight": 0.88,
      "radius": 0.52,
      "role": "seat"
    },
    {
      "id": "break_chair_1",
      "room": "break_room",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 71,
      "z": -93,
      "targetHeight": 0.88,
      "radius": 0.52,
      "role": "seat"
    },
    {
      "id": "break_chair_2",
      "room": "break_room",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 77,
      "z": -93,
      "targetHeight": 0.88,
      "radius": 0.52,
      "role": "seat"
    },
    {
      "id": "break_cup",
      "room": "break_room",
      "model": "assets/vendor/runtime/f576c2b30a9defad/cup.glb",
      "x": 74,
      "z": -93,
      "targetHeight": 0.12,
      "radius": 0,
      "role": "loose_prop",
      "support": "cc0_breakroom_table",
      "maxWidth": 0.11,
      "maxDepth": 0.11,
      "pitch": -1.5707963267948966
    },
    {
      "id": "staff_storage_1",
      "room": "staff_lockers",
      "model": "assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb",
      "x": 80,
      "z": -78,
      "targetHeight": 2.1,
      "radius": 1,
      "role": "cabinet"
    },
    {
      "id": "staff_storage_2",
      "room": "staff_lockers",
      "model": "assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb",
      "x": 80,
      "z": -84,
      "targetHeight": 2.1,
      "radius": 1,
      "role": "cabinet"
    },
    {
      "id": "receiving_desk",
      "room": "receiving_r12",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 49,
      "z": -105,
      "targetHeight": 0.85,
      "radius": 1.3,
      "role": "desk"
    },
    {
      "id": "relay_d_equipment",
      "room": "relay_d",
      "model": "assets/vendor/runtime/67fae2655401a093/machine-window.glb",
      "x": -32,
      "z": -97,
      "targetHeight": 2.2,
      "radius": 2,
      "role": "equipment"
    },
    {
      "id": "relay_e_equipment",
      "room": "relay_e",
      "model": "assets/vendor/runtime/67fae2655401a093/machine-window.glb",
      "x": -15,
      "z": -97,
      "targetHeight": 2.2,
      "radius": 2,
      "role": "equipment"
    },
    {
      "id": "feeder_equipment",
      "room": "feeder_room",
      "model": "assets/vendor/runtime/67fae2655401a093/machine-window.glb",
      "x": 2,
      "z": -97,
      "targetHeight": 2.2,
      "radius": 2,
      "role": "equipment"
    },
    {
      "id": "gavin_workbench",
      "room": "gavin_niche",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 26,
      "z": -73,
      "targetHeight": 0.85,
      "radius": 1.05,
      "role": "desk"
    },
    {
      "id": "payroll_desk",
      "room": "payroll_office",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 36,
      "z": -86,
      "targetHeight": 0.85,
      "radius": 1.1,
      "role": "desk"
    },
    {
      "id": "payroll_chair",
      "room": "payroll_office",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 35,
      "z": -90,
      "targetHeight": 0.9,
      "radius": 0.52,
      "role": "seat"
    },
    {
      "id": "roster_rack_west",
      "room": "roster_records",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 44.5,
      "z": -84.5,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "roster_rack_east",
      "room": "roster_records",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 51,
      "z": -84.5,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "roster_desk",
      "room": "roster_records",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 48,
      "z": -89.7,
      "targetHeight": 0.85,
      "radius": 1.1,
      "role": "desk"
    },
    {
      "id": "roster_book",
      "room": "roster_records",
      "model": "assets/vendor/runtime/aaa4f3872b3cc4b9/book.glb",
      "x": 48,
      "z": -89.7,
      "targetHeight": 0.033,
      "radius": 0,
      "role": "loose_prop",
      "support": "roster_desk",
      "maxWidth": 0.22,
      "maxDepth": 0.17
    },
    {
      "id": "kessler_chair",
      "room": "kessler_office",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 61,
      "z": -91,
      "targetHeight": 0.9,
      "radius": 0.55,
      "role": "seat"
    },
    {
      "id": "kessler_rack",
      "room": "kessler_office",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 65,
      "z": -84.5,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "ledger_desk",
      "room": "contractor_ledger",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 74,
      "z": -88.5,
      "targetHeight": 0.85,
      "radius": 1.1,
      "role": "desk"
    },
    {
      "id": "ledger_rack",
      "room": "contractor_ledger",
      "model": "assets/vendor/runtime/14aeb77ecb6cacff/bookcaseOpen.glb",
      "x": 77,
      "z": -84.5,
      "targetHeight": 2.1,
      "radius": 1.1,
      "role": "empty_rack"
    },
    {
      "id": "pa_console",
      "room": "pa_control",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 74,
      "z": -108,
      "targetHeight": 0.86,
      "radius": 1.1,
      "role": "desk"
    },
    {
      "id": "pa_chair",
      "room": "pa_control",
      "model": "assets/vendor/runtime/4f24ab1a44c14f48/chair.glb",
      "x": 71,
      "z": -112,
      "targetHeight": 0.88,
      "radius": 0.52,
      "role": "seat"
    },
    {
      "id": "pa_radio",
      "room": "pa_control",
      "model": "assets/vendor/runtime/e3c9feb9172f2e3b/radio.glb",
      "x": 74,
      "z": -108,
      "targetHeight": 0.19,
      "radius": 0,
      "role": "loose_prop",
      "support": "pa_console",
      "maxWidth": 0.29,
      "maxDepth": 0.14
    },
    {
      "id": "pcas_desk",
      "room": "pcas_control",
      "model": "assets/vendor/runtime/47206cda3d12810c/desk.glb",
      "x": 82.6,
      "z": -101,
      "targetHeight": 0.85,
      "radius": 1.35,
      "role": "desk"
    }
  ],
  "rehomeLegacy": [
    {
      "id": "cc0_cassette_register",
      "support": "cassette_counter"
    }
  ],
  "storyAnchors": [
    {
      "id": "LS-01",
      "room": "central_gallery",
      "x": 7,
      "z": -66
    },
    {
      "id": "LS-02",
      "room": "central_gallery",
      "x": 7,
      "z": -94
    },
    {
      "id": "LS-03",
      "room": "video_planet",
      "x": 40,
      "z": -70
    },
    {
      "id": "LS-04",
      "room": "gavin_niche",
      "x": 23,
      "z": -76
    },
    {
      "id": "LS-05",
      "room": "security",
      "x": 43,
      "z": -107
    },
    {
      "id": "LS-06",
      "room": "staff_lockers",
      "x": 72,
      "z": -81
    },
    {
      "id": "LS-07",
      "room": "roster_records",
      "x": 46,
      "z": -92
    },
    {
      "id": "LS-08",
      "room": "eli_chase",
      "x": 60,
      "z": -110
    },
    {
      "id": "LS-09",
      "room": "kessler_office",
      "x": 63,
      "z": -86
    }
  ],
  "tourRoutes": [
    {
      "id": "service_approach",
      "level": "G",
      "from": {
        "x": 12,
        "z": -26
      },
      "to": {
        "x": 12,
        "z": -40
      },
      "radius": 0.65
    },
    {
      "id": "west_gallery_spine",
      "level": "G",
      "from": {
        "x": -20,
        "z": -48
      },
      "to": {
        "x": -20,
        "z": -107
      },
      "radius": 0.8
    },
    {
      "id": "east_gallery_spine",
      "level": "G",
      "from": {
        "x": 20,
        "z": -48
      },
      "to": {
        "x": 20,
        "z": -106
      },
      "radius": 0.8
    },
    {
      "id": "annex_corridor",
      "level": "G",
      "from": {
        "x": 60,
        "z": -40
      },
      "to": {
        "x": 60,
        "z": -102
      },
      "radius": 0.8
    },
    {
      "id": "b1_service",
      "level": "B1",
      "from": {
        "x": 11,
        "z": -110
      },
      "to": {
        "x": 11,
        "z": -78
      },
      "radius": 0.8
    },
    {
      "id": "mezz_lookout",
      "level": "M1",
      "from": {
        "x": 0,
        "z": -98
      },
      "to": {
        "x": 76,
        "z": -98
      },
      "radius": 0.8
    }
  ]
});

const ROOMS=new Map(MALL.rooms.map(room=>[room.id,room]));
const LENGTH_EPS=1e-6;
const pointToSegmentSquared=(p,a,b)=>{
 const dx=b.x-a.x,dz=b.z-a.z,denom=dx*dx+dz*dz;
 const t=denom>LENGTH_EPS?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/denom)):0;
 const x=a.x+t*dx,z=a.z+t*dz;
 return (p.x-x)**2+(p.z-z)**2;
};
const floorFixtures=(plan,level)=>plan.fixtures.filter(f=>!f.support&&ROOMS.get(f.room)?.level===level);

export function isFurnishingRouteClear(plan,level,a,b,walkerRadius=.65){
 return floorFixtures(plan,level).every(f=>
  pointToSegmentSquared(f,a,b)>(f.radius+walkerRadius)**2-LENGTH_EPS
 );
}

export function validateFurnishingPlan(plan){
 const errors=[],ids=new Set(),fixtures=new Map();
 const shells=new Map(MALL.levels.map(l=>[l.id,constructPhysicalShell({level:l.id,chapter:6})]));
 for(const f of plan.fixtures){
  const room=ROOMS.get(f.room);
  if(ids.has(f.id))errors.push('duplicate fixture '+f.id);
  ids.add(f.id);fixtures.set(f.id,f);
  if(!room){errors.push('unknown room '+f.id);continue;}
  if(!/^assets\/vendor\/runtime\/[a-f0-9]{16}\/.*\.glb$/.test(f.model))errors.push('invalid model '+f.id);
  if(/ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small|shelf-bags|shelf-boxes/i.test(f.model))errors.push('banned or stocked shelf '+f.id);
  if(!Number.isFinite(f.targetHeight)||f.targetHeight<=(f.support ? .012 : .06)||f.targetHeight>3.6)errors.push('unmeasured height '+f.id);
  if(!Number.isFinite(f.radius)||f.radius<0||(!f.support&&f.radius<.15))errors.push('invalid footprint '+f.id);
  if(f.support&&(!Number.isFinite(f.maxWidth)||!Number.isFinite(f.maxDepth)||
   f.maxWidth<=0||f.maxDepth<=0||f.maxWidth>.45||f.maxDepth>.45))
   errors.push('unbounded tabletop prop '+f.id);
  if(!Number.isFinite(f.x)||!Number.isFinite(f.z)) {errors.push('invalid position '+f.id);continue;}
  const padding=f.support?.0:f.radius+.16;
  if(f.x<room.x1+padding||f.x>room.x2-padding||f.z<room.z1+padding||f.z>room.z2-padding)
   errors.push('outside room / touching wall '+f.id);
 }
 // A loose prop is not a phantom floor obstacle; its measured parent determines Y.
 const legacySupports=new Map([
  ['cc0_security_desk',{room:'security',x:37,z:-109}],
  ['cc0_breakroom_table',{room:'break_room',x:74,z:-93}],
 ]);
 for(const f of plan.fixtures.filter(f=>!!f.support)){
  const support=fixtures.get(f.support)||legacySupports.get(f.support);
  if(!support)errors.push('missing support '+f.id);
  else if(support.room!==f.room||Math.hypot(f.x-support.x,f.z-support.z)>1.15)
   errors.push('support does not reach prop '+f.id);
  if(f.radius!==0)errors.push('loose prop collides with floor '+f.id);
 }
 for(const relocation of plan.rehomeLegacy){
  if(!fixtures.has(relocation.support))errors.push('missing relocation support '+relocation.id);
 }
 for(const f of plan.fixtures.filter(f=>!f.support)){
  const shell=shells.get(ROOMS.get(f.room)?.level);
  if(!shell)continue;
  for(const p of shell.portals){
   if(p.type!=='doorway'||![p.from,p.to].includes(f.room))continue;
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   const clearance=.65+f.radius;
   if(pointToSegmentSquared(f,a,b)<clearance*clearance)
    errors.push('doorway occluded '+f.id+' / '+p.id);
  }
 }
 for(const a of plan.storyAnchors){
  const room=ROOMS.get(a.room),canon=MALL.evidence.find(e=>e.id===a.id);
  if(!canon||canon.room!==a.room||!room||a.x<=room.x1+.4||a.x>=room.x2-.4||a.z<=room.z1+.4||a.z>=room.z2-.4)
   errors.push('invalid evidence '+a.id);
 }
 if(new Set(plan.storyAnchors.map(a=>a.id)).size!==9)errors.push('nine unique story locations required');
 for(const tour of plan.tourRoutes){
  if(!isFurnishingRouteClear(plan,tour.level,tour.from,tour.to,tour.radius))errors.push('blocked circulation '+tour.id);
 }
 return errors;
}
