import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync,readFileSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {ANNEX_SPINE_V127B,ANNEX_LAMP_SOURCE_V127B,ANNEX_CABINET_SOURCE_V127B,
 ANNEX_LAMPS_V127B,ANNEX_CABINETS_V127B,ANNEX_SIGNS_V127B,validateAnnexSpineV127B}
 from '../mall/annex-corridor-plan-v127b.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked}
 from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70}
 from '../mall/gameplay-layout-v70.mjs';
import {auditSealedBayCoverageV116} from '../mall/sealed-bay-plan-v116.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const area=p=>(p.x2-p.x1)*(p.z2-p.z1);

test('1992 staff route remains the exact source 9 x 71 m, not added fantasy land',()=>{
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 const r=MALL.rooms.find(x=>x.id==='east_wing_spine');
 assert.deepEqual([r.x1,r.x2,r.z1,r.z2],[56,65,-105,-34]);
 assert.deepEqual(ANNEX_SPINE_V127B.floor,{x1:56,x2:65,z1:-105,z2:-34});
 assert.equal(area(ANNEX_SPINE_V127B.floor),639);
 assert.equal(auditSealedBayCoverageV116().unassignedRemainderSquareMetres,520);
 assert.equal(ANNEX_LAMPS_V127B.length,8);
 assert.equal(ANNEX_CABINETS_V127B.length,3);
 assert.equal(ANNEX_SIGNS_V127B.length,5);
 assert.ok(!MALL.rooms.some(x=>x.id.startsWith('v127b_')));
});

test('carpet was actually carved away and a single same-height real tile plate replaced it',()=>{
 const g=constructPhysicalShell({level:'G',chapter:4});
 assert.deepEqual(validatePhysicalShell(g),[]);
 const p=g.floorPlates.find(f=>f.id==='v127b_original_annex_staff_tile');
 assert.ok(p,'source employee hallway tile slab missing');
 assert.equal(p.material,'tile');assert.equal(p.y,0);
 assert.deepEqual([p.x1,p.x2,p.z1,p.z2],[56,65,-105,-34]);
 assert.equal(g.floorPlates.reduce((sum,b)=>sum+overlap(b,p),0),639,
  'replaced corridor must have exactly one plate, no coplanar carpet overlap');
 assert.ok(g.floorPlates.filter(b=>b.id!=='v127b_original_annex_staff_tile')
  .every(b=>overlap(b,p)===0),'no hidden original carpet under new tile');
 const f=MALL.footprints.annex;
 const northstar=g.floorPlates.find(b=>b.id==='v128_northstar_original_retail_tile');
 assert.ok(northstar&&northstar.material==='tile'&&area(northstar)===540,
  'V128 real original retail tile must be installed next to service passage');
 assert.equal(overlap(p,northstar),0,'two original tiled floors cannot overlap');
 assert.equal(g.floorPlates.filter(b=>b.id.startsWith('annex_carpet_remaining_')||
   b.id==='v127b_original_annex_staff_tile'||
   b.id==='v128_northstar_original_retail_tile').reduce((n,b)=>n+area(b),0),area(f),
  'full source Annex floor remains covered with no gap or double slab');
});

test('every licensed real ceiling mesh is fixed to the source soffit, not hovering',()=>{
 const g=constructPhysicalShell({level:'G',chapter:4});
 assert.deepEqual(validateAnnexSpineV127B(g.annexCorridor.plan,{
  lamps:g.annexCorridor.lamps,cabinets:g.annexCorridor.cabinets,
  signs:g.annexCorridor.signs,portals:g.portals,ceilings:g.ceilings}),[]);
 for(const l of ANNEX_LAMPS_V127B){
  const slabs=g.ceilings.filter(c=>c.room===l.room&&l.x>c.x1+1.15&&
   l.x<c.x2-1.15&&l.z>c.z1+1.15&&l.z<c.z2-1.15);
  assert.equal(slabs.length,1,'exactly one real ceiling for '+l.id);
  assert.ok(Math.abs(slabs[0].y-slabs[0].thickness/2-3.36)<.0001);
 }
 assert.equal(ANNEX_LAMPS_V127B.filter(l=>l.power===0).length,3);
 assert.equal(ANNEX_SIGNS_V127B.filter(s=>s.wallX===65).length,5);
 const g1=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validatePhysicalShell(g1),[]);
});

test('source original employee doors, all six chapters, clearance and exit remain intact',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const lay=buildGameplayLayoutV70({chapter});
  const pose=chapterRouteV70(chapter).spawn;
  assert.ok(lay.canStand(pose.x,pose.z),'canonical chapter spawn '+chapter);
 }
 const g=buildGameplayLayoutV70({chapter:4}),s=g.shell;
 const real=s.portals.filter(p=>p.type==='doorway'&&
  [p.from,p.to].includes('east_wing_spine'));
 assert.equal(real.length,7,'original Annex door graph must remain intact');
 for(const p of real){
  const a=p.axis==='x'?{x:p.at-.32,z:(p.start+p.end)/2}:
   {x:(p.start+p.end)/2,z:p.at-.32};
  const b=p.axis==='x'?{x:p.at+.32,z:(p.start+p.end)/2}:
   {x:(p.start+p.end)/2,z:p.at+.32};
  assert.equal(isSegmentBlocked(s,a,b),false,'existing open portal blocked '+p.id);
 }
 assert.ok(g.canStand(60,-103),'original south Annex entrance');
 assert.ok(g.canStand(60,-40),'original north Annex end');
 assert.ok(shortestRouteV70(g,{x:60,z:-103},{x:60,z:-40}).length>63,
  'hallway must remain fully continuous for Chapter 4');
 assert.ok(g.canStand(61,-57),'Chapter 4 fire-closure objective');
 for(const f of ANNEX_CABINETS_V127B){
  assert.equal(f.yaw,-Math.PI/2,'cabinet doors must face staff corridor');
  assert.equal(g.canStand(f.x,f.z),false,'cabinet cannot be ghost geometry '+f.id);
  assert.ok(s.fixtures.some(x=>x.id===f.id),'cabinet model missing '+f.id);
 }
 assert.ok(g.canStand(60,-96.8)&&g.canStand(60,-87.6)&&g.canStand(60,-71.8),
  'middle employee lane is a real, clear walkable route');
});

test('only previously source-pinned and locally licensed original GLBs may be used',()=>{
 for(const path of [ANNEX_LAMP_SOURCE_V127B.path,ANNEX_CABINET_SOURCE_V127B.path])
  assert.ok(statSync(new URL('../'+path,import.meta.url)).size>1000,
   'the real GLB must be inside source repository');
 assert.match(read('mall/anchor-identity-plan-v122.mjs'),
  /51cad3ec6b43627251cd5cdce6b1a367fe83e6906334edf096f8dc725dca772d/);
 assert.ok(read('mall/staff-service-plan-v127.mjs').includes(ANNEX_CABINET_SOURCE_V127B.path));
 const render=read('mall/render-shell-v67.js');
 assert.match(render,/renderAnnexCorridorV127B/);
 assert.match(render,/f\.id\.startsWith\('v127b_'\)/);
 assert.doesNotMatch(render,/warm\(61,3\.0,-(?:55|92),/,
  'old floating Annex orb lamps cannot coexist with genuine source panels');
 assert.match(read('mall/gameplay-layout-v70.mjs'),/shell\.annexCorridor\?\.cabinets/);
 assert.ok(JSON.parse(read('assets/world/published-layout-v111.json')));
});
