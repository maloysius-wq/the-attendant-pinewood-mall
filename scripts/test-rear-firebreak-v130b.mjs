import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {surveyOriginalRearV130} from '../mall/original-rear-survey-v130.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from '../mall/residual-firebreak-plan-v129.mjs';
import {REAR_ENVELOPE_V130B,REAR_STAIR_HOLE_V130B,REAR_SOURCE_WALLS_V130B,
 REAR_SERVICE_CEILINGS_V130B,auditRearClosureV130B,validateRearSourceV130B}
 from '../mall/rear-firebreak-plan-v130b.mjs';

const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const close=(a,b)=>Math.abs(a-b)<.00001;
test('V130b changes only 61.5m2 of real old service floor; 1.5m2 fire stair stays void',()=>{
 const a=auditRearClosureV130B();
 assert.deepEqual([REAR_ENVELOPE_V130B.x1,REAR_ENVELOPE_V130B.x2,
  REAR_ENVELOPE_V130B.z1,REAR_ENVELOPE_V130B.z2],[29,47,-118.5,-115]);
 assert.deepEqual(REAR_STAIR_HOLE_V130B,{x1:30.5,x2:33.5,z1:-115.5,z2:-108});
 assert.equal(a.grossOriginalEnvelopeSqm,63);
 assert.equal(a.actualEnclosedFloorSqm,61.5);
 assert.equal(a.actualOpenStairApertureSqm,1.5);
 assert.equal(a.baselineV129ResidualSqm,435);
 assert.equal(a.residualOutsideRearSqm,372);
 assert.equal(a.physicalUnresolvedIncludingProtectedShaftSqm,373.5);
 assert.equal(a.noNewGroundSlab,true);
 assert.equal(a.noNewStoryRoom,true);
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
 assert.equal(auditOriginalRemainderV128().area,520);
 assert.equal(auditOriginalClosuresV129().remaining,435);
 // Historical V130 original masonry/ceiling survey still measures BEFORE this build.
 const historical=surveyOriginalRearV130();
 assert.equal(historical.originalInteriorCeilingSqm,0);
 assert.ok(historical.originalBoundaryFaces.some(x=>x.absentMetres>0));
});

test('G source for every chapter contains exactly two attached physical wall returns',()=>{
 for(const chapter of [1,2,3,4,5,6]){
  const shell=constructPhysicalShell({level:'G',chapter});
  assert.deepEqual(validatePhysicalShell(shell),[],'source validation chapter '+chapter);
  assert.deepEqual(validateRearSourceV130B(shell),[]);
  const walls=shell.walls.filter(w=>w.role==='v130b-original-rear-return');
  assert.equal(walls.length,2);
  assert.deepEqual(walls.map(w=>w.id).sort(),REAR_SOURCE_WALLS_V130B.map(w=>w.id).sort());
  const existing=shell.walls.filter(w=>w.role!=='v130b-original-rear-return');
  assert.ok(existing.some(w=>w.axis==='z'&&close(w.at,-118.5)&&w.start<=29&&w.end>=47),
   'real rear exterior required');
  assert.ok(existing.some(w=>w.axis==='x'&&close(w.at,47)&&w.start<=-118.5&&w.end>=-115),
   'real east exterior required');
  assert.ok(existing.some(w=>w.axis==='x'&&close(w.at,29)&&w.start<=-118&&w.end>=-115),
   'original freight wall required');
  assert.ok(existing.some(w=>w.axis==='z'&&close(w.at,-115)&&w.start<=29&&w.end>=46),
   'original CCTV/security wall required');
  assert.equal(isSegmentBlocked(shell,{x:28.7,z:-118.25},{x:29.3,z:-118.25}),true);
  assert.equal(isSegmentBlocked(shell,{x:46.5,z:-115.4},{x:46.5,z:-114.6}),true);
  assert.ok(shell.portals.every(p=>p.type!=='doorway'||walls.every(w=>
   p.axis!==w.axis||!close(p.at,w.at)||p.end<=w.start||p.start>=w.end)));
 }
});

test('original low underside is three actual pieces around stair with no second slab',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:3});
 const c=shell.ceilings.filter(x=>x.id.startsWith('v130b_'));
 assert.equal(c.length,3);
 assert.equal(c.reduce((n,p)=>n+area(p),0),61.5);
 for(const part of c){
  assert.equal(overlap(part,REAR_STAIR_HOLE_V130B),0,
   'an original fire stair cannot be capped by a fake ceiling');
  assert.ok(close(part.y-part.thickness/2,3.36));
  assert.equal(part.material,'plaster-ceiling');
  assert.ok(part.room===REAR_ENVELOPE_V130B.id);
  for(const other of shell.ceilings.filter(x=>x.id!==part.id))
   assert.equal(overlap(part,other),0,'original ceiling volumes overlap');
 }
 assert.deepEqual(c.map(x=>x.id).sort(),REAR_SERVICE_CEILINGS_V130B.map(x=>x.id).sort());
 assert.equal(shell.floorPlates.filter(p=>p.id.startsWith('v130b_')).length,0);
 assert.equal(shell.floorPlates.reduce((n,p)=>n+overlap(p,REAR_ENVELOPE_V130B),0),61.5);
 assert.ok(shell.stairs.some(s=>s.from==='b1_stair'&&s.to==='security'));
 assert.ok(shell.portals.some(p=>p.id==='service_vestibule__central_gallery'));
});

test('chapter routes, hinge approach, stair and employee exit remain playable',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter),layout=buildGameplayLayoutV70({chapter});
  assert.ok(layout.canStand(route.spawn.x,route.spawn.z),'chapter '+chapter+' spawn');
 }
 const early=buildGameplayLayoutV70({chapter:1});
 assert.ok(shortestRouteV70(early,{x:12.5,z:-32.75},{x:-38,z:-81}).length);
 const ground=buildGameplayLayoutV70({chapter:3,level:'G'});
 assert.equal(ground.canStand(32,-115),false,'true B1 fire stair must remain a hole');
 const late=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(late,{x:51,z:-109},{x:87,z:-42}).length);
 assert.equal(constructPhysicalShell({level:'G',chapter:5}).doors
  .find(d=>d.id==='east_employee_exit').locked,true);
 assert.equal(constructPhysicalShell({level:'G',chapter:6}).doors
  .find(d=>d.id==='east_employee_exit').locked,false);
 assert.ok(!MALL.rooms.some(r=>r.id===REAR_ENVELOPE_V130B.id));
});
