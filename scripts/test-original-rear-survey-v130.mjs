import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from '../mall/residual-firebreak-plan-v129.mjs';
import {surveyOriginalRearV130,ORIGINAL_REAR_SOURCE_ENVELOPE_V130,
 ORIGINAL_NORTH_STAIR_OPENING_V130} from '../mall/original-rear-survey-v130.mjs';

test('V130 is an exact read-only source survey, not a fabricated 42nd room',()=>{
 const s=surveyOriginalRearV130(),r=ORIGINAL_REAR_SOURCE_ENVELOPE_V130;
 assert.deepEqual([r.x1,r.x2,r.z1,r.z2],[29,47,-118.5,-115]);
 assert.equal(s.grossFootprintSqm,63);
 assert.equal(s.originalUnassignedInsideEnvelopeSqm,63);
 assert.equal(s.prelimPocketSqm,51);
 assert.equal(s.additionalRealEnvelopeReliefSqm,12);
 assert.equal(s.v128PreClosureResidualSqm,520);
 assert.equal(s.v129StillUnassignedSqm,435);
 assert.equal(s.constructionApproved,false);
 assert.equal(s.canonicalRooms,41);
 assert.equal(s.originalEvidence,9);
 assert.equal(MALL.rooms.some(r=>r.id===ORIGINAL_REAR_SOURCE_ENVELOPE_V130.id),false);
 assert.equal(auditOriginalRemainderV128().area,520);
 assert.equal(auditOriginalClosuresV129().remaining,435);
});

test('real original floor is 61.5m²; the 1.5m² fire-stair cutout stays physically open',()=>{
 const s=surveyOriginalRearV130();
 assert.deepEqual(ORIGINAL_NORTH_STAIR_OPENING_V130,
  {x1:30.5,x2:33.5,z1:-115.5,z2:-108});
 assert.equal(s.actualSourceFloorSqm,61.5);
 assert.equal(s.originalStairHoleSqm,1.5);
 assert.equal(s.sourceFloorAbsentSqm,1.5);
 assert.ok(s.physicalStairPresent&&s.originalStairLink);
 assert.deepEqual([s.originalStairLink.x,s.originalStairLink.z],[32,-111]);
 assert.equal(s.originalStairLink.minimumChapter,3);
 assert.equal(s.originalRoofAboveSqm,63);
 assert.equal(s.originalInteriorCeilingSqm,0,
  'a 12.8m weather roof is NOT the missing original 3.45m service underside');
 assert.equal(s.constructionApproved,false);
});

test('inspect the actual original masonry boundary instead of adding blind boxes',()=>{
 const s=surveyOriginalRearV130();
 assert.deepEqual(s.originalBoundaryFaces.map(x=>[x.axis,x.at]),
  [['z',-118.5],['x',47],['z',-115],['x',29]]);
 for(const side of s.originalBoundaryFaces){
  assert.ok(side.coveredMetres>=0&&side.absentMetres>=0);
  assert.equal(Math.round((side.coveredMetres+side.absentMetres)*100)/100,
   Math.round((side.span[1]-side.span[0])*100)/100);
 }
 assert.equal(s.originalBoundaryFaces[0].absentMetres,0,
  'original rear exterior masonry must remain an authoritative source wall');
 assert.equal(s.originalBoundaryFaces[1].absentMetres,0,
  'original east service envelope must remain an authoritative exterior wall');
 assert.ok(s.originalBoundaryFaces.some(x=>x.absentMetres>0),
  'the rear zone is not an already sealed room; source masonry is still missing');
 assert.deepEqual(s.portalConflicts,[]);
});

test('source gameplay and entire story route remain unchanged by audit-only work',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6});
 assert.deepEqual(validatePhysicalShell(shell),[]);
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter),g=buildGameplayLayoutV70({chapter});
  assert.ok(g.canStand(route.spawn.x,route.spawn.z),'chapter '+chapter+' spawn');
 }
 const late=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(late,{x:51,z:-109},{x:87,z:-42}).length>0);
 assert.equal(buildGameplayLayoutV70({chapter:3,level:'G'}).canStand(32,-115),false,
  'north stair cutout must never become an invented walkable floor');
 assert.ok(surveyOriginalRearV130().chapter6ExitStillGatedAtEarlierChapters);
});
