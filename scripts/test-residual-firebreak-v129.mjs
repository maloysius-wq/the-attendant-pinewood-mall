import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {SEALED_BAYS_V116,auditSealedBayCoverageV116} from '../mall/sealed-bay-plan-v116.mjs';
import {auditOriginalRemainderV128} from '../mall/residual-footprint-audit-v128.mjs';
import {NW_FIREBREAK_V129,FIREBREAK_CEILING_V129,FIREBREAK_PLATE_V129,
 residualFirebreakWallsV129,auditOriginalClosuresV129,validateFirebreakV129}
 from '../mall/residual-firebreak-plan-v129.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked}
 from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70}
 from '../mall/gameplay-layout-v70.mjs';

const same=(a,b)=>Math.abs(a-b)<.001;
const intersect=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const nearVolume=(w,o)=>w.axis===o.axis&&same(w.at,o.at)&&
 Math.min(w.end,o.end)-Math.max(w.start,o.start)>.015&&
 Math.min(w.top,o.top)-Math.max(w.bottom,o.bottom)>.015;
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('V129 assigns exactly 85m² of genuine original residual, not a fabricated room',()=>{
 const baseline=auditOriginalRemainderV128(),survey=auditOriginalClosuresV129();
 assert.equal(baseline.area,520);
 assert.equal(survey.originalTotal,520);
 assert.equal(survey.newlyEnclosed,85);
 assert.equal(survey.remaining,435);
 assert.equal(survey.originalOverlap,0);
 assert.equal(survey.exactSourceCells,true);
 assert.equal(survey.originalShaftsAvoided,true);
 assert.equal(survey.originalSurveyUnmodified,true);
 assert.equal(survey.noNewStoryRoom,true);
 assert.equal(survey.originalEvidenceUnmodified,true);
 assert.equal(survey.stillProtected.rearEast,51);
 assert.equal(survey.stillProtected.entryContractor,41);
 assert.equal(survey.stillProtected.otherPerimeterAndRelief,343);
 assert.equal(NW_FIREBREAK_V129.x1,-46);
 assert.equal(NW_FIREBREAK_V129.x2,-29);
 assert.equal(NW_FIREBREAK_V129.z1,-48);
 assert.equal(NW_FIREBREAK_V129.z2,-43);
 assert.equal(MALL.rooms.length,41);
 assert.equal(SEALED_BAYS_V116.length,13);
 assert.equal(auditSealedBayCoverageV116().unassignedRemainderSquareMetres,520,
  'v116 baseline stays immutable, 85m² of it is later physically assigned by v129');
});

test('source enclosure is two real new faces using existing 1979/V116 north and south walls',()=>{
 for(const chapter of [1,4,6]){
  const g=constructPhysicalShell({level:'G',chapter});
  assert.deepEqual(validatePhysicalShell(g),[]);
  const newWalls=g.walls.filter(w=>w.role==='v129-firebreak-partition');
  assert.equal(newWalls.length,2);
  assert.deepEqual(newWalls.map(w=>w.at).sort((a,b)=>a-b),[-46,-29]);
  assert.ok(newWalls.every(w=>same(w.start,-48)&&same(w.end,-43)&&
   same(w.bottom,0)&&same(w.top,3.45)&&same(w.thickness,.25)));
  for(const w of newWalls)for(const o of g.walls.filter(x=>x!==w))
   assert.equal(nearVolume(w,o),false,'doubled 1979 wall '+w.id+' / '+o.id);
  const existing=g.walls.filter(w=>w.role!=='v129-firebreak-partition');
  assert.deepEqual(validateFirebreakV129({
   ...g.nwFirebreak,walls:newWalls,existingWalls:existing,portals:g.portals
  }),[]);
  assert.ok(g.walls.some(w=>w.axis==='z'&&same(w.at,-48)&&
   w.start<=-46&&w.end>=-29&&w.top>=5.4),
   'real full-height original Fallow\'s south wall must be reused');
  assert.ok(g.walls.some(w=>w.axis==='z'&&same(w.at,-43)&&
   w.start<=-46&&w.end>=-29&&w.top>=3.45),
   'original 1997 closed northern reserve wall must be reused');
  assert.equal(isSegmentBlocked(g,{x:-28,z:-45.5},{x:-37.5,z:-45.5}),true);
  assert.equal(isSegmentBlocked(g,{x:-45,z:-45.5},{x:-47,z:-45.5}),true);
  assert.equal(isSegmentBlocked(g,{x:-27,z:-48.5},{x:-27,z:-44.5}),false,
   'the exterior of the sealed void must keep original gallery circulation');
  assert.ok(!g.portals.some(p=>p.type==='doorway'&&p.axis==='x'&&same(p.at,-29)&&
   p.start<-43&&p.end>-48),'never block an original shop doorway');
 }
});

test('V129 closed transfer owns one actual low original-1997 plaster ceiling, never another floor',()=>{
 const g=constructPhysicalShell({level:'G',chapter:1});
 const c=g.ceilings.filter(x=>x.id===FIREBREAK_CEILING_V129.id);
 assert.equal(c.length,1);
 assert.equal(c[0].room,NW_FIREBREAK_V129.id);
 assert.equal(c[0].material,'plaster-ceiling');
 assert.ok(same(c[0].y-c[0].thickness/2,3.36));
 assert.equal((c[0].x2-c[0].x1)*(c[0].z2-c[0].z1),85);
 for(const other of g.ceilings.filter(x=>x!==c[0])){
  assert.equal(intersect(other,c[0]),0,'hidden duplicate source ceiling '+other.id);
 }
 const plates=g.floorPlates;
 const areaUnder=plates.reduce((sum,f)=>sum+intersect(f,NW_FIREBREAK_V129),0);
 assert.equal(areaUnder,85,'real original single y=0 source floor is preserved');
 assert.ok(plates.filter(p=>intersect(p,NW_FIREBREAK_V129)>0).every(p=>p.y===0),
  'new non-source floating ground would violate original slab');
 assert.equal(plates.some(p=>String(p.id).startsWith('v129_')),false,
  'must not add a second coplanar floor to hide unfinished architecture');
 const sign=FIREBREAK_PLATE_V129;
 assert.equal(sign.face,1);
 assert.equal(sign.wallX,-29);
 assert.ok(sign.originalArtwork);
 assert.equal(sign.y+sign.height/2<3.36,true);
 assert.match(read('mall/render-residual-firebreak-v129.js'),/sourceWalls.find/);
 assert.match(read('mall/render-shell-v67.js'),/renderFirebreakPlateV129/);
});

test('remaining 51m² rear dock is NOT sealed over its actual stairwell cutout',()=>{
 const rear={x1:29,x2:46,z1:-118,z2:-115};
 const stair={x1:30.5,x2:33.5,z1:-115.5,z2:-108};
 assert.equal(intersect(rear,stair),1.5);
 assert.equal(intersect(rear,NW_FIREBREAK_V129),0);
 const entry={x1:7,x2:9,z1:-43,z2:-22.5};
 assert.equal(intersect(entry,NW_FIREBREAK_V129),0);
 assert.equal(FIREBREAK_PLATE_V129.id,'v129_fallows_north_stock_plate');
 assert.equal(MALL.doors.find(d=>d.id==='service_entry').x,12);
 assert.equal(MALL.doors.find(d=>d.id==='east_employee_exit').x,86);
});

test('all six original chapter routes, LS evidence, storefronts and exit still exist',()=>{
 assert.deepEqual(MALL.evidence.map(x=>x.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter);
  const layout=buildGameplayLayoutV70({chapter});
  assert.ok(layout.canStand(route.spawn.x,route.spawn.z),'chapter spawn '+chapter);
 }
 const early=buildGameplayLayoutV70({chapter:1});
 assert.ok(shortestRouteV70(early,{x:12.5,z:-32.75},{x:-38,z:-81}).length>0,
  'original contractor route to western storefront lost');
 const late=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(late,{x:51,z:-109},{x:87,z:-42}).length>0,
  'real final employee gate route lost');
 assert.equal(late.canStand(-37,-45.5),false,'new firebreak is not an accessible room');
 const original=constructPhysicalShell({chapter:1});
 assert.ok(original.portals.some(p=>p.id==='west_gallery__west_anchor'&&p.width===4.2));
 assert.ok(original.portals.some(p=>p.id==='service_vestibule__central_gallery'&&p.width===1.8));
 assert.ok(original.doors.find(d=>d.id==='east_employee_exit').locked);
});
