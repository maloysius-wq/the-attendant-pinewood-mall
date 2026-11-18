import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {auditSealedBayCoverageV116} from '../mall/sealed-bay-plan-v116.mjs';
import {auditOriginalRemainderV128,ORIGINAL_REMAINDER_POCKETS_V128}
 from '../mall/residual-footprint-audit-v128.mjs';
import {ANNEX_ANCHOR_ROOM_V128,ANNEX_ANCHOR_FIXTURES_V128,ANNEX_ANCHOR_LIGHTS_V128,
 ANNEX_ANCHOR_IDENTITY_V128,ANNEX_ANCHOR_POSTERS_V128,validateAnnexAnchorV128}
 from '../mall/annex-anchor-plan-v128.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked}
 from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70}
 from '../mall/gameplay-layout-v70.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('V128 source-licensed retail fits unchanged exact 540 m² original Annex floor',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.deepEqual(validateAnnexAnchorV128(shell.annexAnchor,
  {portals:shell.portals,ceilings:shell.ceilings}),[]);
 const r=MALL.rooms.find(r=>r.id==='annex_anchor');
 assert.equal((r.x2-r.x1)*(r.z2-r.z1),540);
 assert.deepEqual({id:r.id,x1:r.x1,x2:r.x2,z1:r.z1,z2:r.z2,area:540,ceilingUnderside:7.61},ANNEX_ANCHOR_ROOM_V128);
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 assert.equal(shell.annexAnchor.fixtures.length,24);
 assert.equal(ANNEX_ANCHOR_FIXTURES_V128.filter(f=>f.kind==='wall_bay').length,17);
 assert.equal(ANNEX_ANCHOR_FIXTURES_V128.filter(f=>f.kind.startsWith('table_')).length,4);
 assert.equal(ANNEX_ANCHOR_FIXTURES_V128.filter(f=>f.kind==='spinner').length,2);
 assert.equal(ANNEX_ANCHOR_FIXTURES_V128.filter(f=>f.kind==='counter').length,1);
 assert.equal(ANNEX_ANCHOR_POSTERS_V128.length,5);
 assert.equal(ANNEX_ANCHOR_IDENTITY_V128.name,'NORTHSTAR HOME');
 assert.equal(ANNEX_ANCHOR_LIGHTS_V128.length,8);
});
test('source real CC0 fixtures have exact SHA-pinned local bytes and no unlicensed placeholder',()=>{
 const sources=[...new Map([...ANNEX_ANCHOR_FIXTURES_V128.map(f=>[f.source,f.sha256]),
  ...ANNEX_ANCHOR_LIGHTS_V128.map(l=>[l.model,l.sha256])]).entries()];
 assert.equal(sources.length,6,'five retail source types + one local ceiling GLB');
 for(const [path,sha] of sources){
  assert.ok(/^(assets\/vendor\/runtime\/|assets\/vendor\/builder\/models\/)/.test(path));
  const file=new URL('../'+path,import.meta.url);
  assert.ok(statSync(file).size>1000,'empty original source '+path);
  const hash=createHash('sha256').update(readFileSync(file)).digest('hex');
  assert.equal(hash,sha,'GLB content no longer matches pinned authored provenance '+path);
 }
 assert.ok(read('LICENSES.md').includes('KSI_counter.glb'));
 assert.ok(read('mall/render-annex-anchor-v128.js').includes('GLTFLoader'));
 assert.ok(read('mall/render-shell-v67.js').includes('renderAnnexAnchorV128'));
});
test('true two-door 4.2m west-to-north through-lane and all six canonical spawns remain open',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 const doorways=shell.portals.filter(p=>p.type==='doorway'&&
  [p.from,p.to].includes('annex_anchor'));
 assert.equal(doorways.length,2);
 assert.ok(doorways.some(p=>p.at===65&&Math.abs(p.width-4.2)<.01));
 assert.ok(doorways.some(p=>p.at===-48&&Math.abs(p.width-4.2)<.01));
 assert.equal(isSegmentBlocked(shell,{x:65.5,z:-61.5},{x:75,z:-61.5}),false);
 assert.equal(isSegmentBlocked(shell,{x:75,z:-61.5},{x:75,z:-47}),false);
 for(const p of doorways){
  const mid=(p.start+p.end)/2;
  const a=p.axis==='x'?{x:p.at-.5,z:mid}:{x:mid,z:p.at-.5};
  const b=p.axis==='x'?{x:p.at+.5,z:mid}:{x:mid,z:p.at+.5};
  assert.equal(isSegmentBlocked(shell,a,b),false,'source portal physically blocked '+p.id);
 }
 for(const chapter of [1,2,3,4,5,6]){
  const route=chapterRouteV70(chapter);
  const layout=buildGameplayLayoutV70({chapter});
  assert.ok(layout.canStand(route.spawn.x,route.spawn.z),'chapter spawn blocked '+chapter);
 }
 const layout=buildGameplayLayoutV70({chapter:4});
 for(const [x,z] of [[67,-61.5],[72,-61.5],[75,-58],[75,-54],[75,-51],[75,-48.8]])
  assert.equal(layout.canStand(x,z),true,'unsafe Annex exit corridor '+x+','+z);
 assert.ok(shortestRouteV70(layout,{x:60,z:-61},{x:75,z:-44}).length>0,
  'staff hall to employee exit vestibule path must exist');
 assert.ok(shortestRouteV70(layout,{x:67,z:-61},{x:81,z:-65}).length>0,
  'customer shopping loop is not reachable');
 assert.equal(buildGameplayLayoutV70({chapter:4}).canStand(71,-69.2),false,
  'authentic main display table must be a physical gameplay obstacle');
});
test('source-mounted 7.61m ceiling GLB fixtures and one real original Annex carpet slab',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:4});
 const panels=ANNEX_ANCHOR_LIGHTS_V128.map(f=>{
  const s=shell.ceilings.filter(c=>c.room===f.room&&f.x>c.x1+1.1&&
   f.x<c.x2-1.1&&f.z>c.z1+1.1&&f.z<c.z2-1.1);
  assert.equal(s.length,1);
  const underside=s[0].y-s[0].thickness/2;
  assert.equal(Math.round(underside*100)/100,7.61);
  return underside;
 });
 assert.equal(panels.length,8);
 const floor=shell.floorPlates.filter(f=>f.x1<=65&&f.x2>=85&&f.z1<=-75&&f.z2>=-48);
 assert.equal(floor.length,1,'true 540sqm Northstar source slab required');
 assert.equal(floor[0].material,'tile');
 assert.equal(floor[0].id,'v128_northstar_original_retail_tile');
 assert.equal(floor[0].y,0);
 for(const other of shell.floorPlates.filter(f=>f!==floor[0])){
  const x=Math.max(0,Math.min(other.x2,floor[0].x2)-Math.max(other.x1,floor[0].x1));
  const z=Math.max(0,Math.min(other.z2,floor[0].z2)-Math.max(other.z1,floor[0].z1));
  assert.equal(x*z,0,'no hidden carpet slab below real retail tile '+other.id);
 }
 assert.ok(ANNEX_ANCHOR_LIGHTS_V128.some(l=>l.power===0));
 assert.ok(ANNEX_ANCHOR_LIGHTS_V128.some(l=>l.power>.6));
});
test('true 520 m² residual has no invented rooms or hidden double allocations',()=>{
 const audit=auditOriginalRemainderV128();
 assert.equal(audit.area,520);
 assert.equal(audit.overlaps,0);
 assert.equal(audit.knownPocketsArea,177);
 assert.equal(audit.otherUnassignedArea,343);
 assert.ok(audit.knownPockets.every(p=>p.fitsExactly),
  'NW/front-entry/rear relief must match measured remaining source area');
 assert.equal(ORIGINAL_REMAINDER_POCKETS_V128.length,3);
 assert.equal(auditSealedBayCoverageV116().unassignedRemainderSquareMetres,520);
 assert.equal(audit.status,'survey-only; no new geometry or fictional sealed bays allocated');
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 const world=JSON.parse(read('assets/world/published-layout-v111.json'));
 assert.ok(world&&typeof world==='object','private Builder remains intentionally unpublished');
});
