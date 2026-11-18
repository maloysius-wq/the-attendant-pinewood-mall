import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {VESTIBULE_HANDOFF_V112,vestibuleInnerPortalV112} from '../mall/vestibule-handoff-v112.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from '../mall/residual-firebreak-plan-v129.mjs';
import {auditRearServiceClosureV131} from '../mall/rear-service-closure-v131.mjs';
import {surveyOriginalFrontSeamV132} from '../mall/original-front-seam-survey-v132.mjs';
import {auditOriginalDoorSweepV133,FRONT_HINGE_WALL_END_V133}
 from './audit-v113-door-sweep-v133.mjs';
import {FRONT_ORIGINAL_CLOSURE_V133,FRONT_SOURCE_WALL_V133,FRONT_SOURCE_CEILING_V133,
 validateFrontClosureV133} from '../mall/front-service-closure-v133.mjs';
const near=(x,y)=>Math.abs(x-y)<1e-6;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
test('real pinned V113 CC0 source swept through 95.4 degrees: uncut slab collides; x8.91 safe',()=>{
 const s=auditOriginalDoorSweepV133();
 assert.equal(s.sourceDoorMeshes,3);
 assert.equal(s.sourceFrameMeshes,2);
 assert.ok(s.originalDepthMetres>.10&&s.originalDepthMetres<.24);
 assert.deepEqual(s.actualPivot,{x:9.11,z:-42.988});
 assert.deepEqual(s.angleRangeDeg,[0,95.4]);
 assert.equal(s.filmEye.x,VESTIBULE_HANDOFF_V112.x);
 assert.equal(s.filmEye.z,VESTIBULE_HANDOFF_V112.z);
 assert.ok(s.nominalUncutWall.collisions>0,'uncut x9 wall MUST collide with true door arc');
 assert.equal(s.proposedRealMasonry.wallEndX,FRONT_HINGE_WALL_END_V133);
 assert.equal(s.proposedRealMasonry.collisions,0,'source door must not collide with new real masonry');
 assert.ok(s.proposedRealMasonry.conservativeHorizontalClearanceMetres>.04,
  'source door arc needs >=4cm spare horizontal clearance beyond inflated V70 collision');
 assert.equal(s.physicallyJoinedToExistingX9Wall,true);
 assert.equal(s.approvedGeometryForFocusedConstruction,true);
});

test('real front seam has exactly one attached concrete return and ONE 41sqm source underside',()=>{
 const historic=surveyOriginalFrontSeamV132();
 assert.equal(historic.actualExistingFloorSqm,41);
 assert.equal(historic.existingInteriorCeilingSqm,0,
  'original read-only V132 survey remains pre-build');
 assert.equal(historic.sourceFaces[3].absentMetres,2);
 for(const chapter of [1,2,3,4,5,6]){
  const shell=constructPhysicalShell({level:'G',chapter});
  assert.deepEqual(validatePhysicalShell(shell),[],'valid full original source chapter '+chapter);
  const walls=shell.walls.filter(w=>w.role==='v133-front-service-partition');
  const c=shell.ceilings.filter(x=>x.id.startsWith('v133_'));
  assert.equal(walls.length,1);
  assert.equal(c.length,1);
  assert.equal(walls[0].id,FRONT_SOURCE_WALL_V133.id);
  assert.ok(near(walls[0].end,8.91));
  assert.equal(c[0].id,FRONT_SOURCE_CEILING_V133.id);
  assert.ok(near(c[0].y-c[0].thickness/2,3.36));
  const neighbors=shell.walls.filter(w=>w.role!=='v133-front-service-partition');
  assert.deepEqual(validateFrontClosureV133({
   walls,existingWalls:neighbors,ceilings:shell.ceilings,
   floorPlates:shell.floorPlates,portals:shell.portals,roofs:shell.roofs
  }),[]);
  assert.ok(walls[0].end>9-.24/2,'actually joins 1979 x9 wall thickness');
  assert.ok(walls[0].end+.025<9.1-.12,'original inner V113 frame remains distinct');
  assert.equal(isSegmentBlocked(shell,{x:8,z:-42.7},{x:8,z:-43.3}),true,
   'actual physical wall is a real gameplay source collider, not a review mask');
  assert.equal(shell.floorPlates.filter(p=>p.id.startsWith('v133_')).length,0);
  assert.equal(shell.floorPlates.reduce((sum,p)=>sum+overlap(p,FRONT_ORIGINAL_CLOSURE_V133),0),41);
  assert.equal(shell.roofs.reduce((sum,p)=>sum+overlap(p,FRONT_ORIGINAL_CLOSURE_V133),0),41);
 }
});

test('source area accounting after real V129, V131 and new V133 is 331sqm, not a new room',()=>{
 assert.equal(auditOriginalRemainderV128().area,520);
 assert.equal(auditOriginalClosuresV129().remaining,435);
 assert.equal(auditRearServiceClosureV131().physicalResidualRemaining,372);
 assert.equal(FRONT_ORIGINAL_CLOSURE_V133.originalArea,41);
 assert.equal(372-FRONT_ORIGINAL_CLOSURE_V133.originalArea,331);
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 assert.equal(MALL.rooms.some(r=>r.id===FRONT_ORIGINAL_CLOSURE_V133.id),false);
 assert.equal(MALL.links.some(r=>r.from===FRONT_ORIGINAL_CLOSURE_V133.id||
  r.to===FRONT_ORIGINAL_CLOSURE_V133.id),false);
});

test('V113 film endpoint, actual E doorway and playable six-chapter routes remain unchanged',()=>{
 const p=vestibuleInnerPortalV112();
 assert.deepEqual([p.z,p.start,p.end,p.width],[-43,9.1,10.9,1.8]);
 assert.deepEqual(VESTIBULE_HANDOFF_V112,
  {room:'service_vestibule',x:12.5,y:1.7,z:-32.75,yaw:0,pitch:0});
 for(let chapter=1;chapter<=6;chapter++){
  const q=chapterRouteV70(chapter),g=buildGameplayLayoutV70({chapter});
  assert.ok(g.canStand(q.spawn.x,q.spawn.z),'original chapter '+chapter+' spawn');
 }
 const first=buildGameplayLayoutV70({chapter:1});
 assert.ok(shortestRouteV70(first,{x:12.5,z:-32.75},{x:-38,z:-81}).length>0,
  'real V113 entrance to Fallow/Cassette Castle story route must remain open');
 const late=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(late,{x:51,z:-109},{x:87,z:-42}).length>0);
 assert.equal(late.canStand(8,-32.75),false,
  'the new inaccessible sealed source strip is not an unlocked 42nd room');
 assert.equal(buildGameplayLayoutV70({chapter:3,level:'G'}).canStand(32,-115),false,
  'B1 north fire stair must remain physically open');
});
