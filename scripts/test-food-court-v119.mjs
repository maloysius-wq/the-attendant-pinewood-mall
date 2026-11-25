import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FOOD_COURT_V119,foodCourtWallsV119,validateFoodCourtV119} from '../mall/food-court-plan-v119.mjs';
import {FURNISHINGS_V69,validateFurnishingPlan,isFurnishingRouteClear} from '../mall/furnishing-plan-v69.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

const near=(a,b)=>Math.abs(a-b)<.001;
const food=()=>FURNISHINGS_V69.fixtures.filter(f=>f.room==='food_court');

test('real 17m food court has three source-fixed concessions, a separate dining area and no invented narrative room',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validateFoodCourtV119(FOOD_COURT_V119,MALL,shell.portals),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.foodCourt.booths.length,3);
 assert.equal(shell.foodCourt.dining.length,8);
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.rooms.filter(r=>r.id==='food_court').length,1);
 assert.equal(shell.storefronts.length,7);
 assert.equal(shell.closedBays.length,13);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.checkpoint.cells.length,2);
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
});

test('original food-court has one genuine tile floor slab, with no overlapping fake finish',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const tile=shell.floorPlates.filter(p=>p.id==='v119_food_court_tile');
 assert.equal(tile.length,1,'one authored food-court floor piece replaces the original terrazzo');
 assert.deepEqual(tile.map(p=>[p.x1,p.x2,p.z1,p.z2,p.y,p.material]),
  [[29,46,-97,-80,0,'tile']]);
 const overlap=(a,b)=>
  Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
  Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
 for(const r of shell.floorPlates.filter(p=>p.id!==tile[0].id))
  assert.ok(overlap(r,tile[0])<.00001,'food tile must not overlap an older floor slab '+r.id);
 const area=p=>(p.x2-p.x1)*(p.z2-p.z1);
 const total=shell.floorPlates.reduce((n,p)=>n+area(p),0);
 const areaOriginal=94*96,areaAnnex=39*81,holes=4*5.3+3*7.5;
 assert.ok(near(total,areaOriginal+areaAnnex-holes),
  'genuine floor coverage changed; check walkable elevator/stair holes');
});

test('all three concession shutters have real collision-active masonry, steel and support-return walls',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const w=shell.walls.filter(w=>w.id.startsWith('v119_'));
 assert.equal(w.length,20,'three real service counters and the original shutter/return shell');
 assert.deepEqual(w,foodCourtWallsV119());
 assert.equal(w.filter(x=>x.role==='food-court-shutter').length,3);
 assert.equal(w.filter(x=>x.role==='food-court-kick').length,3);
 assert.equal(w.filter(x=>x.role==='food-court-header').length,3);
 assert.equal(w.filter(x=>x.role==='food-court-counter').length,3);
 assert.equal(w.filter(x=>x.role==='food-court-return').length,4);
 for(const b of FOOD_COURT_V119.booths){
  const z=(b.start+b.end)/2;
  assert.equal(isSegmentBlocked(shell,{x:41.7,z},{x:44.25,z}),true,
   'shuttered counter must be solid and genuinely block unauthorized backend '+b.id);
  const rail=w.filter(x=>x.id.includes('_'+b.id+'_')&&x.role!=='food-court-counter').sort((a,b)=>a.bottom-b.bottom);
  assert.equal(rail.length,3,'one continuous closed shutter surface, not an opaque fake wall');
  assert.deepEqual(rail.map(x=>[x.bottom,x.top]),[[0,1.05],[1.05,3.22],[3.22,5.3]]);
 }
});

test('actual existing licensed V69 tables, chairs and props are intentionally reflowed, not deleted',()=>{
 const f=food();
 assert.equal(f.length,30);
 assert.deepEqual(validateFurnishingPlan(FURNISHINGS_V69),[]);
 const tables=f.filter(x=>x.role==='table');
 const seats=f.filter(x=>x.role==='seat');
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.equal(tables.length,8);assert.equal(seats.length,20);
 assert.equal(f.filter(x=>x.role==='counter').length,0,'no miniature wedge GLBs used for fixed food counterwork');
 for(const table of FOOD_COURT_V119.dining){
  const f=food().find(x=>x.id===table.table);
  assert.ok(near(f.x,table.x)&&near(f.z,table.z),
   'canonical dining station moved without matching attached actual V69 GLB '+table.table);
  for(const chairId of table.chairs){
   const chair=seats.find(x=>x.id===chairId);assert.ok(chair);
   assert.ok(Array.isArray(chair.face)&&Math.hypot(...chair.face)===1);
   const dx=table.x-chair.x,dz=table.z-chair.z;
   assert.ok((dx*chair.face[0]+dz*chair.face[1])/Math.hypot(dx,dz)>.999,'chair faces its table '+chairId);
  }
 }
 for(const b of FOOD_COURT_V119.booths){
  const physical=shell.walls.find(w=>w.id==='v119_stall_'+b.id+'_counter');
  assert.ok(physical,'missing physically joined service counter '+b.id);
  assert.ok(near(physical.at,b.counter.x)&&physical.role==='food-court-counter');
  assert.ok(physical.top>=.9&&physical.thickness>=.8);
  assert.ok(physical.at+physical.thickness/2<FOOD_COURT_V119.vendorFrontX,
   'real counter joins physical shut kiosk without crossing its shutter');
  assert.ok(isSegmentBlocked(shell,{x:40.8,z:b.counter.z},{x:42.6,z:b.counter.z}),
   'counter is a real walk collider, not a cosmetic slab');
 }
 for(const support of ['food_pizza_box','food_cup']){
  const item=f.find(x=>x.id===support);
  const table=tables.find(t=>t.id===item.support);
  assert.deepEqual([item.x,item.z],[table.x,table.z],
   'source tabletop prop must remain on its real relocated parent '+support);
 }
});

test('unchanged food-court 4.2m V115 glass entrance and first-class walk to all three food counters',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const p=shell.portals.find(p=>p.id==='east_gallery__food_court');
 assert.ok(p);
 assert.ok(near(p.at,29)&&near(p.width,4.2));
 const z=(p.start+p.end)/2;
 assert.equal(isSegmentBlocked(shell,{x:27.9,z},{x:30.1,z}),false,
  'original public storefront must stay open');
 const navigation=buildGameplayLayoutV70({chapter:1});
 for(const point of FOOD_COURT_V119.waypoints)
  assert.ok(navigation.canStand(point.x,point.z),'center food-court aisle blocked '+JSON.stringify(point));
 assert.ok(shortestRouteV70(navigation,{x:30.2,z:-88.5},{x:40.15,z:-88.5}).length>8,
  'entrance-to-staffed-counter public approach lost');
 for(const b of FOOD_COURT_V119.booths){
  // Navigation searches integer-metre cells, so use a real clear node
  // (x40) rather than x40.6 which snaps to x41 inside the true CC0
  // counter's player-radius collision expansion.
  const approach={x:40,z:b.counter.z};
  assert.ok(navigation.canStand(approach.x,approach.z),
   'no physically accessible counter frontage for player '+b.id);
  assert.ok(shortestRouteV70(navigation,{x:30.2,z:-88.5},approach).length>5,
   'vendor reachable only through closed shutter '+b.id);
 }
});

test('existing six chapter entry and all retail circuit routes survive V119 spatial reflow',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter);
  const nav=buildGameplayLayoutV70({chapter});
  assert.ok(nav.canStand(route.spawn.x,route.spawn.z),'story spawn blocked chapter '+chapter);
  assert.deepEqual(validatePhysicalShell(nav.shell),[]);
 }
 assert.ok(isFurnishingRouteClear(FURNISHINGS_V69,'G',{x:20,z:-48},{x:20,z:-106},.8));
 assert.ok(shortestRouteV70(buildGameplayLayoutV70({chapter:1}),
  {x:12.5,z:-32.75},{x:40,z:-70}).length>0,
  'original contractor → Video Planet evidence route lost');
});
