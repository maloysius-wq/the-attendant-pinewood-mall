import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,isSegmentBlocked,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {auditArchitecturalCoverageV114} from '../mall/architecture-audit-v114.mjs';

const CIRCULATION=new Set(['central_gallery','west_gallery','east_gallery',
 'annex_threshold','east_wing_spine','b1_spine','b1_cross','flooded_walk','mezz_hall']);
const contains=(r,x,z)=>x>r.x1&&x<r.x2&&z>r.z1&&z<r.z2;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));

test('v114 documents exact remaining unallocated footprint instead of silently inventing rooms',()=>{
 const floors=auditArchitecturalCoverageV114();
 assert.deepEqual(floors.map(x=>x.level),['G','B1','M1']);
 const [ground,basement,admin]=floors;
 assert.equal(ground.footprintArea,12183);
 assert.equal(ground.unassignedArea,2797.5);
 assert.equal(ground.overlapArea,0);
 assert.equal(basement.unassignedArea,1470);
 assert.equal(basement.overlapArea,60,'B1 utility spine deliberately crosses the transverse passage');
 assert.deepEqual(basement.intersections[0]?.rooms,['b1_spine','b1_cross']);
 assert.equal(admin.unassignedArea,1439);
 assert.equal(admin.assignedArea,1859,'union of mezzanine room rectangles after overlap repair');
 assert.equal(admin.overlapArea,0,'M1 stair must not collide with Eli utility room');
 assert.ok(floors.every(r=>Math.abs(r.assignedArea+r.unassignedArea-r.footprintArea)<.001));
});

test('mezzanine stair and the sealed Eli utility chase no longer occupy coincident floor',()=>{
 const stair=MALL.rooms.find(r=>r.id==='m1_stair'),eli=MALL.rooms.find(r=>r.id==='eli_chase');
 assert.equal(stair.x2,eli.x1);
 assert.equal(overlap(stair,eli),0);
 const slabs=constructPhysicalShell({level:'M1',chapter:5}).floorPlates;
 for(let i=0;i<slabs.length;i++)for(let j=i+1;j<slabs.length;j++)
  assert.ok(overlap(slabs[i],slabs[j])<.000001,
   'M1 overlapping physical floor surfaces: '+slabs[i].id+' / '+slabs[j].id);
});

test('ordinary retail, security, basement and office openings have solid measured headers',()=>{
 let examined=0;
 for(const level of ['G','B1','M1']){
  const shell=constructPhysicalShell({level,chapter:6});
  const headers=shell.walls.filter(w=>w.role==='lintel');
  for(const p of shell.portals.filter(p=>p.type==='doorway')){
   const reserved=p.id==='service_vestibule__central_gallery';
   const fullOpen=CIRCULATION.has(p.from)&&CIRCULATION.has(p.to);
   const matches=headers.filter(w=>w.id==='portal_lintel_'+p.id);
   if(reserved||fullOpen){assert.equal(matches.length,0,'source-owned or open portal '+p.id);continue;}
   assert.equal(matches.length,1,'missing or duplicate physical door header '+p.id);
   const h=matches[0];
   assert.equal(h.axis,p.axis);assert.equal(h.at,p.at);
   assert.equal(h.start,p.start);assert.equal(h.end,p.end);
   assert.ok(Math.abs(h.bottom-(shell.y+p.height))<.000001,'incorrect doorway head '+p.id);
   assert.ok(h.top>h.bottom+.1,'zero-height wall above '+p.id);
   assert.ok(h.thickness>=.2,'fake flat lintel '+p.id);
   const from=p.axis==='x'?{x:p.at-.4,z:(p.start+p.end)/2}:{x:(p.start+p.end)/2,z:p.at-.4};
   const to=p.axis==='x'?{x:p.at+.4,z:(p.start+p.end)/2}:{x:(p.start+p.end)/2,z:p.at+.4};
   assert.equal(isSegmentBlocked(shell,from,to),false,'head blocked the walkable doorway '+p.id);
   examined++;
  }
  assert.deepEqual(validatePhysicalShell(shell),[]);
 }
 assert.ok(examined>=30,'the audit must cover every relevant doorway, not only the new vestibule');
});

test('basement and admin enclosed rooms have non-overlapping ceiling undersides',()=>{
 for(const level of ['B1','M1']){
  const shell=constructPhysicalShell({level,chapter:5});
  const excluded=level==='B1'?new Set(['freight_b1','b1_stair']):
   new Set(['m1_stair','mezz_hall']);
  for(const r of MALL.rooms.filter(r=>r.level===level)){
   const roomSlabs=shell.ceilings.filter(c=>c.room===r.id);
   assert.equal(roomSlabs.length>0,!excluded.has(r.id),'missing/misplaced '+r.id+' ceiling');
   for(const c of roomSlabs){
    assert.ok(c.y>shell.y&&c.y<shell.y+4,'impossible overhead '+r.id);
    assert.ok(c.x1>=r.x1&&c.x2<=r.x2&&c.z1>=r.z1&&c.z2<=r.z2);
   }
  }
  for(let i=0;i<shell.ceilings.length;i++)for(let j=i+1;j<shell.ceilings.length;j++)
   assert.ok(overlap(shell.ceilings[i],shell.ceilings[j])<.000001,
    'coincident '+level+' ceiling '+shell.ceilings[i].id+' and '+shell.ceilings[j].id);
 }
 assert.equal(constructPhysicalShell({level:'M1',chapter:5}).roofs.length,0,
  'former duplicate office roof slabs must not cover the new ceilings');
});

test('all six source chapter starts and locked-door navigation survive new headers',()=>{
 const poses=[['G',12.5,-32.75],['B1',23,-110],['G',35,-110],
  ['G',52,-99],['M1',51,-103],['M1',75,-110]];
 for(let chapter=1;chapter<=6;chapter++){
  const r=chapterRouteV70(chapter),layout=buildGameplayLayoutV70({chapter});
  assert.deepEqual([r.level,r.spawn.x,r.spawn.z],poses[chapter-1]);
  assert.ok(layout.canStand(r.spawn.x,r.spawn.z),'spawn obstructed: Chapter '+chapter);
  assert.ok(layout.colliders.every(c=>!c.id?.startsWith('portal_lintel_')),
   'head-only stone cannot become a foot-level collision');
 }
 const g=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(g,{x:51,z:-109},{x:87,z:-42}).length>0,
  'final exit must remain reachable through all physical doors');
 const m=buildGameplayLayoutV70({chapter:6});
 assert.ok(shortestRouteV70(m,{x:75,z:-110},{x:51,z:-103}).length>0,
  'admin corridor must remain traversable');
});
