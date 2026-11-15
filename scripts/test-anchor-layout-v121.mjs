import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {ORIGINAL_ANCHOR_FIXTURES_V121,validateAnchorLayoutV121} from '../mall/anchor-layout-v121.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from '../mall/anchor-retail-source-v121.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
test('both original large anchor stores gain only 12 actual visually auditioned and pinned fixtures',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validateAnchorLayoutV121(shell.anchorRetail,{portals:shell.portals}),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.anchorRetail.length,12);
 assert.equal(new Set(shell.anchorRetail.map(f=>f.id)).size,12);
 assert.equal(shell.anchorRetail.filter(f=>f.room==='west_anchor').length,6);
 assert.equal(shell.anchorRetail.filter(f=>f.room==='east_original_anchor').length,6);
 assert.ok(!shell.anchorRetail.some(f=>f.source==='podium'),
  'real preview proved the giant >7m wide podium is inappropriate for a department store display');
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
 assert.equal(shell.storefronts.length,7);
 assert.equal(shell.closedBays.length,13);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.foodCourt.booths.length,3);
 assert.equal(shell.galleryAmenities.benches.length,6);
 assert.equal(shell.galleryAmenities.directories.length,2);
 assert.equal(shell.checkpoint.cells.length,2);
 const known=new Set(ORIGINAL_RETAIL_CANDIDATES_V121.map(a=>a.path));
 assert.ok(shell.anchorRetail.every(f=>known.has(f.model)&&f.license==='CC0-1.0'));
});

test('new store source surfaces never overlap existing licensed registers, shelving, other displays or exact tenant entrances',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const ancient=FURNISHINGS_V69.fixtures.filter(f=>['west_anchor','east_original_anchor'].includes(f.room)&&f.radius>0);
 for(const f of ORIGINAL_ANCHOR_FIXTURES_V121){
  for(const original of ancient.filter(x=>x.room===f.room))
   assert.ok(dist(f,original)>f.collisionRadius+original.radius+.4,
    'new GLB clips preserved legacy source fixture '+f.id+'/'+original.id);
  assert.ok(isSegmentBlocked(shell,{x:f.x-2,z:f.z},{x:f.x+2,z:f.z}),
   'player could walk through new full-size original merchandise fixture '+f.id);
 }
 for(const p of shell.portals.filter(p=>p.type==='doorway'&&
  ['west_anchor','east_original_anchor'].some(id=>[p.from,p.to].includes(id)))){
  const at=(p.start+p.end)/2;
  const a=p.axis==='x'?{x:p.at-.4,z:at}:{x:at,z:p.at-.4};
  const b=p.axis==='x'?{x:p.at+.4,z:at}:{x:at,z:p.at+.4};
  assert.ok(!isSegmentBlocked(shell,a,b),'real 4.2m storefront entry blocked '+p.id);
 }
});

test('real gameplay blocks full-size source displays but permits both 1979 customer aisles',()=>{
 const nav=buildGameplayLayoutV70({chapter:1});
 const blockers=nav.colliders.filter(x=>x.kind==='original-retail-fixture');
 assert.equal(blockers.length,12);
 for(const f of ORIGINAL_ANCHOR_FIXTURES_V121){
  assert.ok(blockers.some(c=>c.id===f.id),'source image has no corresponding gameplay blocker '+f.id);
  assert.ok(!nav.canStand(f.x,f.z),'player can phase through source GLB '+f.id);
 }
 assert.ok(shortestRouteV70(nav,{x:-30,z:-60.5},{x:-40,z:-60.5}).length>8,
  'Fallow central aisle to physical cashier is unreachable');
 assert.ok(shortestRouteV70(nav,{x:30,z:-52},{x:38,z:-52}).length>7,
  'original east department store shopping entrance blocked');
});

test('V121 real fixture placement preserves six story spawns, door and nine LS sites',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const nav=buildGameplayLayoutV70({chapter}),spawn=chapterRouteV70(chapter).spawn;
  assert.ok(nav.canStand(spawn.x,spawn.z),'chapter '+chapter+' canonical spawn blocked by V121');
  assert.deepEqual(validatePhysicalShell(nav.shell),[]);
 }
 const nav=buildGameplayLayoutV70({chapter:1});
 assert.ok(nav.canStand(12.5,-32.75),'exact original cinematic eye changed');
 for(const a of FURNISHINGS_V69.storyAnchors)
  if(MALL.rooms.find(r=>r.id===a.room)?.level==='G')
   assert.ok(nav.canStand(a.x,a.z),'story evidence became unreachable '+a.id);
});
