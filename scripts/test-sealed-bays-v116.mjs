import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {SEALED_BAYS_V116,validateSealedBaysV116,sealedBayWallsV116,auditSealedBayCoverageV116} from '../mall/sealed-bay-plan-v116.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {planRoomWallFacesV90} from '../builder/room-wall-layout-v90.mjs';

const near=(a,b)=>Math.abs(a-b)<.001;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const cross=(front,bay,along)=>{
 const v=front.at;return front.axis==='x'?
 [{x:v-.65,z:along},{x:v+.65,z:along}]:
 [{x:along,z:v-.65},{x:along,z:v+.65}];
};

test('13 enclosed bays occupy 2,277.5m² of the formerly unassigned floor',()=>{
 assert.deepEqual(validateSealedBaysV116(),[]);
 const report=auditSealedBayCoverageV116();
 assert.equal(MALL.rooms.length,41,'canonical narrative room count unchanged');
 assert.equal(MALL.rooms.filter(r=>r.level==='G').length,22);
 assert.equal(report.ancillaryBays,13);
 assert.equal(report.sealedSquareMetres,2277.5);
 assert.equal(report.unassignedRemainderSquareMetres,520);
 assert.ok(report.assignedPercent>81&&report.assignedPercent<82);
 assert.equal(report.storefronts,8,'only 8 measured publicly facing shutter fronts');
 for(const bay of SEALED_BAYS_V116){
  assert.ok(!MALL.rooms.some(r=>r.level==='G'&&overlap(r,bay)>.0001),
   'ancillary room crossed a story room: '+bay.id);
 }
});

test('real bay walls do not double existing exterior and story walls',()=>{
 const g=constructPhysicalShell({level:'G',chapter:6});
 assert.equal(g.closedBays.length,13);
 assert.deepEqual(validatePhysicalShell(g),[]);
 const newWalls=g.walls.filter(w=>w.role.startsWith('closed-bay-'));
 assert.ok(newWalls.length>50,'thirteen enclosed floor chambers need actual continuous wall solids');
 assert.equal(newWalls.filter(w=>w.role==='closed-bay-shutter').length,8);
 for(const w of newWalls){
  for(const o of g.walls.filter(x=>x!==w&&x.role!=='closed-bay-header')){
   if(w.axis!==o.axis||!near(w.at,o.at))continue;
   const along=Math.max(0,Math.min(w.end,o.end)-Math.max(w.start,o.start));
   const height=Math.max(0,Math.min(w.top,o.top)-Math.max(w.bottom,o.bottom));
   assert.ok(along<.015||height<.015,'doubled physical wall '+w.id+' and '+o.id);
  }
 }
});

test('all closed tenant shutters block passage without inventing doors',()=>{
 const g=constructPhysicalShell({level:'G',chapter:6});
 for(const bay of g.closedBays.filter(b=>b.front)){
  const f=bay.front,at=f.axis==='x'?(bay.z1+bay.z2)/2:(bay.x1+bay.x2)/2;
  assert.equal(isSegmentBlocked(g,...cross(f,bay,at)),true,'closed roll-down shutter '+bay.id);
  assert.ok(g.walls.some(w=>w.role==='closed-bay-shutter'&&w.id.includes(bay.id)),
   'shutter needs physical non-walkable wall '+bay.id);
  assert.ok(!MALL.links.some(l=>l.from===bay.id||l.to===bay.id),
   'sealed space cannot accidentally become story portal');
 }
});

test('enclosed bays preserve all six chapter access routes, original door and 9 evidence anchors',()=>{
 for(let i=1;i<=6;i++){
  const p=chapterRouteV70(i),walk=buildGameplayLayoutV70({chapter:i});
  assert.ok(walk.canStand(p.spawn.x,p.spawn.z),'blocked original spawn chapter '+i);
 }
 const g=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(g,{x:51,z:-109},{x:87,z:-42}).length>0,'exit path lost');
 const c=buildGameplayLayoutV70({chapter:1});
 assert.ok(shortestRouteV70(c,{x:12.5,z:-32.75},{x:-38,z:-81}).length>0,
  'contractor to Cassette Castle path lost');
 assert.deepEqual(MALL.evidence.map(e=>e.id),Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 const sh=constructPhysicalShell({level:'G',chapter:1});
 assert.ok(sh.portals.some(p=>p.id==='service_vestibule__central_gallery'&&p.width===1.8));
});

test('Builder cannot paint over source-locked closed shutters and ancillary service frontage',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6});
 for(const bay of shell.closedBays.filter(b=>b.front)){
  const room=MALL.rooms.find(r=>r.id===bay.front.adjacent);
  const plans=planRoomWallFacesV90(room,shell);
  const at=bay.front.at;
  assert.ok(!plans.some(p=>p.axis===bay.front.axis&&Math.abs(p.at-at)<.01&&
   p.bottom<=2.94&&p.top>=.4&&
   p.start<(bay.front.axis==='x'?bay.z2:bay.x2)-.2&&
   p.end>(bay.front.axis==='x'?bay.z1:bay.x1)+.2),
   'Builder finish covers sealed shutter on '+bay.id);
 }
});
