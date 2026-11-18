import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {auditSealedBayCoverageV116} from '../mall/sealed-bay-plan-v116.mjs';
import {ANNEX_SPINE_V127B,ANNEX_LIGHTS_V127B,ANNEX_SIGNS_V127B,
 ANNEX_BULKHEADS_V127B,ANNEX_LAMP_SOURCE_V127B,validateAnnexCirculationV127b}
 from '../mall/annex-circulation-plan-v127b.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked}
 from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70}
 from '../mall/gameplay-layout-v70.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('V127b is actual source architecture, not a replacement story or invented floor area',()=>{
 const shell=constructPhysicalShell({chapter:4});
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.deepEqual(validateAnnexCirculationV127b(shell.annexCirculation,
  {walls:shell.walls,portals:shell.portals,ceilings:shell.ceilings}),[]);
 assert.equal(MALL.rooms.length,41);
 assert.equal(MALL.evidence.length,9);
 assert.equal(auditSealedBayCoverageV116().unassignedRemainderSquareMetres,520);
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 assert.ok(MALL.doors.some(d=>d.id==='east_employee_exit'&&d.x===86&&d.z===-42));
 assert.deepEqual(ANNEX_SPINE_V127B,{room:'east_wing_spine',x1:56,x2:65,z1:-105,z2:-34,
  floor:'tile',ceilingUnderside:3.36,clearCentralX1:59,clearCentralX2:63});
});
test('replace the Annex corridor carpet slab with exactly one source tile slab at the same elevation',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 const tile=shell.floorPlates.filter(f=>f.id==='v127b_east_employee_hall_tile');
 assert.equal(tile.length,1);
 const t=tile[0];assert.equal(t.material,'tile');assert.equal(t.y,0);
 assert.equal((t.x2-t.x1)*(t.z2-t.z1),639);
 for(const f of shell.floorPlates.filter(f=>f.id.startsWith('annex_carpet_')))
  assert.ok(f.x2<=t.x1||f.x1>=t.x2||f.z2<=t.z1||f.z1>=t.z2,
   'no carpet underneath real passage tile');
 assert.equal(shell.floorPlates.filter(f=>f.id==='annex').length,0);
});
test('1992 light and sign geometry is attached to real existing source ceilings and solid walls',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 assert.equal(ANNEX_LIGHTS_V127B.length,10);
 assert.equal(ANNEX_SIGNS_V127B.length,5);
 assert.equal(ANNEX_BULKHEADS_V127B.length,3);
 assert.equal(shell.annexCirculation.lights,ANNEX_LIGHTS_V127B);
 assert.ok(ANNEX_LIGHTS_V127B.some(l=>l.power===0));
 assert.ok(ANNEX_LIGHTS_V127B.some(l=>l.power>.6));
 const portals=shell.portals.filter(p=>p.from==='east_wing_spine'&&p.type==='doorway');
 assert.equal(portals.length,5);
 for(const p of portals){
  const middle=(p.start+p.end)/2;
  assert.ok(!isSegmentBlocked(shell,{x:p.at-.45,z:middle},{x:p.at+.45,z:middle}),
   'canonical east Annex portal must remain a real aperture: '+p.id);
 }
 for(const s of ANNEX_SIGNS_V127B){
  assert.ok(!portals.some(p=>s.z+s.width/2>p.start&&s.z-s.width/2<p.end));
 }
});
test('whole 71m corridor remains clear with genuine staff endpoints and all chapter spawns',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 assert.equal(isSegmentBlocked(shell,{x:60.5,z:-103},{x:60.5,z:-36}),false);
 const layout=buildGameplayLayoutV70({chapter:4});
 for(let z=-103;z<=-36;z++)assert.ok(layout.canStand(60,z),
  'blocked central Annex travel at z='+z);
 const path=shortestRouteV70(layout,{x:60,z:-102},{x:60,z:-38});
 assert.ok(path.length>=60,'Annex route fails to span entire spine');
 assert.ok(shortestRouteV70(layout,{x:60,z:-100},{x:72,z:-102}).length>0,
  'reachable training from original spine');
 assert.ok(shortestRouteV70(layout,{x:60,z:-85},{x:74,z:-80}).length>0,
  'reachable lockers and protected evidence from original spine');
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter),c=buildGameplayLayoutV70({chapter});
  assert.ok(c.canStand(route.spawn.x,route.spawn.z),'blocked chapter '+chapter);
 }
});
test('V127a staff cabinet collision parity is repaired without altering physical door',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 assert.equal(isSegmentBlocked(shell,{x:82.0,z:-93.5},{x:84,z:-93.5}),true,
  'source collision must include physical kitchen cabinet');
 assert.equal(isSegmentBlocked(shell,{x:79,z:-92},{x:82,z:-92}),false,
  'open 2.4m kitchen portal cannot become a phantom wall');
});
test('CC0 lamp is genuinely pinned and local; owner Builder draft and V113 are unchanged',()=>{
 assert.equal(ANNEX_LAMP_SOURCE_V127B.license,'CC0-1.0');
 assert.match(ANNEX_LAMP_SOURCE_V127B.sha256,/^[a-f\d]{64}$/);
 assert.ok(statSync(new URL('../'+ANNEX_LAMP_SOURCE_V127B.path,import.meta.url)).size>2000);
 assert.ok(read('mall/anchor-identity-plan-v122.mjs').includes(ANNEX_LAMP_SOURCE_V127B.sha256));
 assert.match(read('mall/render-shell-v67.js'),/renderAnnexCirculationV127b/);
 assert.match(read('mall/render-annex-circulation-v127b.js'),/GLTFLoader/);
 assert.match(read('mall/render-shell-v67.js'),/annexVisuals\.ceilingRoot\.visible/);
 assert.ok(JSON.parse(read('assets/world/published-layout-v111.json')));
 assert.ok(read('mall/gameplay-layout-v70.mjs').includes('VESTIBULE_HANDOFF_V112'));
});
