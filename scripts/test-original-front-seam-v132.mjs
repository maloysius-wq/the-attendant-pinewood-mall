import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {VESTIBULE_HANDOFF_V112,vestibuleInnerPortalV112} from '../mall/vestibule-handoff-v112.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from '../mall/residual-firebreak-plan-v129.mjs';
import {auditRearServiceClosureV131} from '../mall/rear-service-closure-v131.mjs';
import {ORIGINAL_FRONT_SEAM_V132,surveyOriginalFrontSeamV132}
 from '../mall/original-front-seam-survey-v132.mjs';

test('source V132 is a measured 41m2 residual, not a 42nd story room',()=>{
 const a=surveyOriginalFrontSeamV132(),seam=ORIGINAL_FRONT_SEAM_V132;
 assert.deepEqual([seam.x1,seam.x2,seam.z1,seam.z2],[7,9,-43,-22.5]);
 assert.equal(seam.area,41);
 assert.equal(a.preliminarySourceAreaSqm,41);
 assert.equal(a.verifiedV128ResidualInSeamSqm,41);
 assert.equal(a.immutableV128ResidualSqm,520);
 assert.equal(a.afterV129ResidualSqm,435);
 assert.equal(a.afterV131ResidualSqm,372);
 assert.equal(a.projectedOutsideFrontIfFutureFullClosureSqm,331);
 assert.equal(a.constructionApproved,false);
 assert.equal(a.originalRoomCount,41);
 assert.equal(a.originalEvidenceCount,9);
 assert.equal(a.noNewNarrativeRoom,true);
 assert.equal(auditOriginalRemainderV128().area,520);
 assert.equal(auditOriginalClosuresV129().remaining,435);
 assert.equal(auditRearServiceClosureV131().physicalResidualRemaining,372);
 assert.ok(!MALL.rooms.some(r=>r.id===seam.id));
});

test('real y=0 old floor and weather roof exist but no new source soffit exists',()=>{
 const a=surveyOriginalFrontSeamV132();
 assert.equal(a.actualExistingFloorSqm,41);
 assert.equal(a.existingInteriorCeilingSqm,0);
 assert.equal(a.originalWeatherRoofAboveSqm,41);
 assert.equal(a.sourceFaces.length,4);
 assert.deepEqual(a.sourceFaces.map(s=>[s.axis,s.at]),
  [['x',7],['x',9],['z',-22.5],['z',-43]]);
 for(const face of a.sourceFaces){
  assert.equal(face.coveredMetres+face.absentMetres,face.span[1]-face.span[0]);
 }
 assert.equal(a.sourceFaces[0].coveredMetres,20.5,'boarded lobby x7 existing wall');
 assert.equal(a.sourceFaces[1].coveredMetres,20.5,'contractor vestibule x9 real wall');
 assert.equal(a.sourceFaces[2].coveredMetres,2,'original front exterior z=-22.5 already exists');
 assert.equal(a.sourceFaces[3].absentMetres,2,'central atrium junction has measured absence');
 assert.deepEqual(a.sourceFaces[3].absentIntervals,[[7,9]]);
 assert.deepEqual(a.touchingRealDoorways,[],'never guess a new wall across original portal');
});

test('sensitive V113 hinged doorway/film pose remain a measured hold, not a guessed wall',()=>{
 const a=surveyOriginalFrontSeamV132(),d=a.criticalDoorProximity;
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validatePhysicalShell(shell),[]);
 const p=vestibuleInnerPortalV112(shell);
 assert.equal(d.hingedSourceId,'service_vestibule__central_gallery');
 assert.equal(p.z,-43);
 assert.ok(p.width>=1.6&&p.width<=2.1);
 assert.ok(d.clearNominalXBetweenSeamAndHinge>0);
 assert.ok(d.clearNominalXBetweenSeamAndHinge<.2,
  'east seam lies dangerously close to real inner portal: require thickness/hinge audit');
 assert.equal(d.innerPortalStartX,p.start);
 assert.equal(d.contractorExteriorDoorX,12);
 assert.equal(d.contractorExteriorDoorZ,-22.5);
 assert.equal(d.separationFromExteriorDoorX,3);
 assert.deepEqual(d.filmEndpoint,VESTIBULE_HANDOFF_V112);
 assert.equal(d.separationFromOriginalFilmEyeX,3.5);
 assert.equal(d.checkpointApproachWestX,11.05);
 assert.equal(d.checkpointApproachEastX,13.65);
 assert.equal(d.boardedMainDoorX,-10.5);
 assert.equal(d.originalChapter6ExitLocked,true);
 assert.equal(d.finalExitMinChapter,6);
 assert.equal(a.constructionApproved,false);
});

test('all six playable chapter routes retain original doors, stair void and east exit',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const c=chapterRouteV70(chapter),g=buildGameplayLayoutV70({chapter});
  assert.ok(g.canStand(c.spawn.x,c.spawn.z),'chapter '+chapter+' canonical spawn');
 }
 const early=buildGameplayLayoutV70({chapter:1});
 assert.ok(shortestRouteV70(early,{x:12.5,z:-32.75},{x:-38,z:-81}).length>0,
  'contractor-to-original-west-gallery route unchanged');
 assert.equal(early.canStand(8,-32.75),false,
  'unassigned 41m2 interstice does not become a fictional traversable story room');
 const middle=buildGameplayLayoutV70({chapter:3,level:'G'});
 assert.equal(middle.canStand(32,-115),false,'real source stair shaft remains open');
 const late=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(late,{x:51,z:-109},{x:87,z:-42}).length>0);
 assert.ok(MALL.evidence.length===9);
});
