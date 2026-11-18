import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from '../mall/residual-firebreak-plan-v129.mjs';
import {surveyOriginalRearV130} from '../mall/original-rear-survey-v130.mjs';
import {REAR_SERVICE_ENVELOPE_V131,REAR_NORTH_STAIR_OPENING_V131,
 REAR_SOURCE_PARTITIONS_V131,REAR_SERVICE_CEILINGS_V131,
 auditRearServiceClosureV131,validateRearServiceV131} from '../mall/rear-service-closure-v131.mjs';

const eps=.001;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
test('V131 closes only 63m² of exact original residual; no fabricated playable space',()=>{
 const s=auditRearServiceClosureV131();
 assert.equal(auditOriginalRemainderV128().area,520);
 assert.equal(auditOriginalClosuresV129().remaining,435);
 assert.equal(s.immutableV128Baseline,520);
 assert.equal(s.afterV129,435);
 assert.equal(s.originalFootprintResolved,63);
 assert.equal(s.actualFloorResolved,61.5);
 assert.equal(s.stillOpenSourceStairShaft,1.5);
 assert.equal(s.physicalResidualRemaining,372);
 assert.equal(s.originalOverlaps,0);
 assert.equal(s.storyRoomCount,41);assert.equal(s.evidenceCount,9);
 assert.equal(MALL.rooms.length,41);
 assert.ok(!MALL.rooms.some(x=>x.id===REAR_SERVICE_ENVELOPE_V131.id));
 assert.deepEqual([REAR_SERVICE_ENVELOPE_V131.x1,REAR_SERVICE_ENVELOPE_V131.x2,
  REAR_SERVICE_ENVELOPE_V131.z1,REAR_SERVICE_ENVELOPE_V131.z2],
  [29,47,-118.5,-115]);
});
test('original source wall closure is precisely two short endcaps, without overlapping exterior',()=>{
 for(const chapter of [1,3,6]){
  const shell=constructPhysicalShell({level:'G',chapter});
  assert.deepEqual(validatePhysicalShell(shell),[]);
  const added=shell.walls.filter(w=>w.role==='v131-rear-service-partition');
  assert.equal(added.length,2);
  assert.deepEqual(added.map(w=>w.id).sort(),REAR_SOURCE_PARTITIONS_V131.map(w=>w.id).sort());
  const roofWall=shell.walls.find(w=>w.axis==='z'&&w.at===-118.5&&w.start<=29&&w.end>=47);
  const eastWall=shell.walls.find(w=>w.axis==='x'&&w.at===47&&w.start<=-118.5&&w.end>=-115);
  assert.ok(roofWall&&eastWall,'reuse existing original 1979 rear and east exterior walls');
  assert.ok(added.some(w=>w.axis==='z'&&w.at===-115&&w.start===46&&w.end===47));
  assert.ok(added.some(w=>w.axis==='x'&&w.at===29&&w.start===-118.5&&w.end===-118));
  assert.equal(isSegmentBlocked(shell,{x:46.5,z:-116},{x:46.5,z:-114.5}),true);
  assert.equal(isSegmentBlocked(shell,{x:28.6,z:-118.3},{x:29.4,z:-118.3}),true);
  assert.deepEqual(validateRearServiceV131({
   walls:added,existingWalls:shell.walls.filter(w=>!added.includes(w)),
   ceilings:shell.ceilings,floorPlates:shell.floorPlates,portals:shell.portals
  }),[]);
 }
});
test('real shaft-cut original ceiling totals 61.5m²; 1.5m² stair stays uncapped and original floor stays singular',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:3});
 const cap=shell.ceilings.filter(c=>c.id.startsWith('v131_'));
 assert.equal(cap.length,3);
 assert.deepEqual(cap.map(x=>x.id).sort(),REAR_SERVICE_CEILINGS_V131.map(x=>x.id).sort());
 assert.equal(cap.reduce((sum,c)=>sum+(c.x2-c.x1)*(c.z2-c.z1),0),61.5);
 for(const c of cap){
  assert.ok(Math.abs(c.y-c.thickness/2-3.36)<eps,'original 3.36m underside with float tolerance');
  assert.equal(overlap(c,REAR_NORTH_STAIR_OPENING_V131),0);
 }
 const ownFloor=shell.floorPlates.reduce((sum,f)=>sum+overlap(f,REAR_SERVICE_ENVELOPE_V131),0);
 assert.equal(ownFloor,61.5);
 assert.ok(!shell.floorPlates.some(f=>f.id.startsWith('v131_')));
 assert.deepEqual(REAR_NORTH_STAIR_OPENING_V131,
  {x1:30.5,x2:33.5,z1:-115.5,z2:-108});
 assert.equal(overlap(REAR_SERVICE_ENVELOPE_V131,REAR_NORTH_STAIR_OPENING_V131),1.5);
 // The existing v130 audit stays an independently useful baseline; it
 // intentionally excludes newly constructed v131 source elements.
 const original=surveyOriginalRearV130();
 assert.equal(original.originalInteriorCeilingSqm,0);
 assert.deepEqual(original.originalBoundaryFaces.map(s=>s.absentMetres),[0,0,1,.5]);
 assert.equal(original.actualSourceFloorSqm,61.5);
});
test('all six chapter spawns, original V113 entrance, B1 stair and Chapter 6 exit remain guarded',()=>{
 assert.deepEqual(MALL.evidence.map(x=>x.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter);
  const layout=buildGameplayLayoutV70({chapter});
  assert.ok(layout.canStand(route.spawn.x,route.spawn.z), 'Chapter '+chapter+' spawn');
 }
 assert.equal(buildGameplayLayoutV70({chapter:3,level:'G'}).canStand(32,-115),false,
  'real stair shaft cannot become a grounded player floor');
 const late=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(late,{x:51,z:-109},{x:87,z:-42}).length>0);
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.ok(shell.doors.some(x=>x.id==='service_entry'&&x.x===12));
 assert.ok(shell.doors.some(x=>x.id==='east_employee_exit'&&x.locked));
 assert.ok(shell.stairs.some(s=>s.from==='b1_stair'&&s.to==='security'));
});
