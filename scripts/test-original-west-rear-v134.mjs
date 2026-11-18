import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {WEST_REAR_ORIGINAL_V134,surveyOriginalWestRearV134}
 from '../mall/original-west-rear-survey-v134.mjs';

test('original west-rear gap is exactly 42sqm + 3sqm front to real rear exterior',()=>{
 const s=surveyOriginalWestRearV134(),r=WEST_REAR_ORIGINAL_V134;
 assert.deepEqual([r.x1,r.x2,r.z1,r.z2],[-17,-11,-118.5,-111]);
 assert.equal(r.originalInteriorArea,42);
 assert.equal(r.originalFacadeReturn,3);
 assert.equal(r.grossArea,45);
 assert.equal(s.immutableOriginalResidualSqm,520);
 assert.equal(s.afterV131ResidualSqm,372);
 assert.equal(s.afterFutureV133FrontSqm,331);
 assert.equal(s.verifiedOriginalUnassignedSqm,45);
 assert.equal(s.measuredOriginalFloorSqm,45);
 assert.equal(s.measuredOriginalWeatherRoofSqm,45);
 assert.equal(s.measuredOriginalCeilingSqm,0);
 assert.equal(s.constructionApproved,false);
 assert.equal(auditOriginalRemainderV128().area,520);
});
test('survey existing original host masonry and keep actual story doors',()=>{
 const s=surveyOriginalWestRearV134();
 assert.deepEqual(s.sourceFaces.map(f=>[f.axis,f.at]),
  [['x',-17],['x',-11],['z',-118.5],['z',-111]]);
 for(const face of s.sourceFaces)
  assert.equal(face.coverageMetres+face.absentMetres,face.span[1]-face.span[0]);
 assert.equal(s.sourceFaces[2].coverageMetres,6,'authentic exterior z=-118.5 must remain');
 assert.ok(s.sourceFaces.some(f=>f.absentMetres>0),
  'the original west rear cannot be represented as already source-sealed');
 assert.equal(s.adjacentJanitorialBayPresent,true);
 assert.equal(s.adjacentCanonicalNorthServicePresent,true);
 assert.equal(s.adjacentCanonicalWestGalleryPresent,true);
 assert.equal(s.originalRooms,41);
 assert.equal(s.originalEvidence,9);
 assert.ok(!MALL.rooms.some(r=>r.id===WEST_REAR_ORIGINAL_V134.id));
 const shell=constructPhysicalShell({chapter:6,level:'G'});
 assert.deepEqual(validatePhysicalShell(shell),[]);
});
test('read-only source survey does not change any original chapter spawn',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const q=chapterRouteV70(chapter),g=buildGameplayLayoutV70({chapter});
  assert.ok(g.canStand(q.spawn.x,q.spawn.z),'original Chapter '+chapter);
 }
});
