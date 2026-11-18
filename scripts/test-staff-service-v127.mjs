import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {auditSealedBayCoverageV116} from '../mall/sealed-bay-plan-v116.mjs';
import {STAFF_SERVICE_CELLS_V127,STAFF_SERVICE_FIXTURES_V127,
 STAFF_SERVICE_AREA_V127,staffServiceWallsV127,validateStaffServiceV127}
 from '../mall/staff-service-plan-v127.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked}
 from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70}
 from '../mall/gameplay-layout-v70.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('subdivide genuine original service rooms without claiming new story rooms or false land coverage',()=>{
 assert.deepEqual(validateStaffServiceV127(),[]);
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 assert.equal(STAFF_SERVICE_CELLS_V127.length,5);
 assert.equal(STAFF_SERVICE_AREA_V127,190.5);
 assert.deepEqual(STAFF_SERVICE_CELLS_V127.map(c=>c.room),
 ['north_service','security','training_t04','break_room','staff_lockers']);
 assert.equal(STAFF_SERVICE_CELLS_V127.filter(c=>c.kind==='open').length,1);
 assert.ok(!MALL.rooms.some(r=>r.id.startsWith('v127_')));
 assert.ok(!MALL.links.some(l=>l.from.startsWith('v127_')||l.to.startsWith('v127_')));
 assert.equal(auditSealedBayCoverageV116().unassignedRemainderSquareMetres,520);
});

test('solid source walls and metal shutters, real 2.4m kitchen aperture',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.staffService.length,5);
 assert.equal(shell.staffFixtures.length,5);
 const walls=staffServiceWallsV127();
 assert.equal(walls.length,19);
 for(const w of walls){
  assert.ok(shell.walls.some(x=>x.id===w.id),'missing shell wall '+w.id);
  assert.ok(w.start<w.end&&w.bottom>=0&&w.top<=3.36);
  assert.ok(!shell.walls.filter(x=>!x.id.startsWith('v127_')).some(x=>
   x.axis===w.axis&&Math.abs(x.at-w.at)<.001&&
   Math.min(x.end,w.end)-Math.max(x.start,w.start)>.04),
   'duplicate original source wall '+w.id);
 }
 assert.equal(walls.filter(w=>w.role==='staff-shutter').length,4);
 assert.equal(walls.filter(w=>w.role==='staff-header').length,5);
 assert.equal(isSegmentBlocked(shell,{x:79,z:-92},{x:82,z:-92}),false,
  'break room kitchen must have an open, real passable doorway');
 assert.equal(isSegmentBlocked(shell,{x:78,z:-102.5},{x:81,z:-102.5}),true,
  'training equipment room must have a solid lockable closure');
 for(const f of STAFF_SERVICE_FIXTURES_V127)
  assert.ok(shell.fixtures.some(x=>x.id===f.id),'missing original CC0 '+f.id);
});

test('the original six spawns, breaker, CCTV, training notes and locker evidence remain walkable',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const spawn=chapterRouteV70(chapter).spawn;
  const layout=buildGameplayLayoutV70({chapter});
  assert.ok(layout.canStand(spawn.x,spawn.z),'blocked chapter spawn '+chapter);
 }
 const g1=buildGameplayLayoutV70({chapter:1});
 const g3=buildGameplayLayoutV70({chapter:3});
 const g4=buildGameplayLayoutV70({chapter:4});
 for(const [layout,x,z] of [[g1,3,-115],[g3,36,-111],[g3,41,-110],
 [g3,43,-107],[g4,72,-102],[g4,74,-80],[g4,72,-81]]){
  assert.ok(layout.canStand(x,z),'blocked protected interaction '+[x,z]);
 }
 assert.ok(shortestRouteV70(g1,{x:0,z:-70},{x:3,z:-115}).length>0);
 assert.ok(shortestRouteV70(g3,{x:35,z:-110},{x:43,z:-107}).length>0);
 assert.ok(shortestRouteV70(g4,{x:70,z:-102},{x:74,z:-80}).length>0);
});

test('every added prop is a real pre-vendored CC0 file, no private Builder publishing',()=>{
 assert.equal(STAFF_SERVICE_FIXTURES_V127.length,5);
 const unique=new Set(STAFF_SERVICE_FIXTURES_V127.map(f=>f.model));
 assert.equal(unique.size,1);
 for(const path of unique){
  assert.ok(statSync(new URL('../'+path,import.meta.url)).size>1000);
  assert.ok(read('mall/furnishing-plan-v69.mjs').includes(path),
   'must reuse an already licensed original model');
 }
 assert.match(read('mall/render-shell-v67.js'),/renderStaffServiceV127/);
 assert.match(read('mall/gameplay-layout-v70.mjs'),/shell\.staffFixtures/);
 const published=JSON.parse(read('assets/world/published-layout-v111.json'));
 assert.ok(published&&typeof published==='object');
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
});


test('physical segment queries collide with the same actual V127 cabinets as playable movement',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 const playable=buildGameplayLayoutV70({chapter:4});
 // Both endpoints are INSIDE an already-open physical service cell; no
 // room wall or shutter may conceal a missing cabinet collision.
 for(const [a,b,fx] of [
  [{x:82.1,z:-93.5},{x:84,z:-93.5},'v127_break_kitchen_cabinet'],
  [{x:44.4,z:-111.7},{x:45.7,z:-111.7},'v127_security_tape_cabinet']
 ]){
  assert.ok(shell.staffFixtures.some(f=>f.id===fx));
  assert.equal(playable.canStand(shell.staffFixtures.find(f=>f.id===fx).x,
   shell.staffFixtures.find(f=>f.id===fx).z),false,'playable cabinet '+fx);
  assert.equal(isSegmentBlocked(shell,a,b),true,'missing real cabinet on source walk '+fx);
 }
 assert.equal(isSegmentBlocked(shell,{x:79,z:-92},{x:82,z:-92}),false,
  'still preserve open staff kitchen portal');
});
