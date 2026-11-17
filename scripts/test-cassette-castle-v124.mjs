import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from '../mall/anchor-retail-source-v121.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from '../mall/anchor-identity-plan-v122.mjs';
import {CASSETTE_ROOM_V124,CASSETTE_FIXTURES_V124,CASSETTE_LIGHTS_V124,CASSETTE_SIGN_V124,validateCassetteCastleV124} from '../mall/cassette-castle-plan-v124.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

const licensed=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
const shaOf=path=>createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex');
test('V124 17x17m original 1979 Cassette Castle and source glass frontage remain physically intact',()=>{
 const room=MALL.rooms.find(r=>r.id==='cassette_castle');
 assert.deepEqual(Object.fromEntries(Object.keys(CASSETTE_ROOM_V124).map(k=>[k,room[k]])),CASSETTE_ROOM_V124);
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.equal(shell.storefronts.length,7);
 const front=shell.storefronts.find(f=>f.room==='cassette_castle');
 assert.ok(front);assert.ok(Math.abs(front.entryWidth-4.2)<.01);
 assert.equal(front.at,-29);
 assert.equal(shell.cassetteCastle.fixtures.length,12);
 assert.equal(shell.cassetteCastle.lights.length,4);
 assert.deepEqual(validateCassetteCastleV124(shell.cassetteCastle,{portals:shell.portals,ceilings:shell.ceilings}),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.anchorRetail.length,30);
 assert.equal(shell.anchorStock.length,13);
 assert.equal(shell.anchorIdentity.lights.length,15);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.closedBays.length,13);
 assert.equal(shell.galleryAmenities.benches.length,6);
 assert.equal(shell.galleryAmenities.directories.length,2);
});
test('Every V124 real licensed object SHA256 byte matches original catalog and was already source-auditioned',()=>{
 assert.equal(licensed.models.length,482);
 const candidates=new Map(ORIGINAL_RETAIL_CANDIDATES_V121.map(a=>[a.shortName,a]));
 assert.deepEqual([...new Set(CASSETTE_FIXTURES_V124.map(f=>f.kind))].sort(),
  ['spinner','table_medium','wall_bay']);
 assert.equal(CASSETTE_FIXTURES_V124.filter(f=>f.kind==='wall_bay').length,7);
 assert.equal(CASSETTE_FIXTURES_V124.filter(f=>f.kind==='table_medium').length,3);
 assert.equal(CASSETTE_FIXTURES_V124.filter(f=>f.kind==='spinner').length,2);
 for(const f of CASSETTE_FIXTURES_V124){
  const c=candidates.get(f.kind),v=licensed.models.find(m=>m.path===f.source);
  assert.ok(c&&v,'original licensed rack absent '+f.id);
  assert.equal(f.sha256,c.sha256);assert.equal(f.sha256,v.sha256);
  assert.equal(f.source,c.path);assert.equal(v.license,'CC0-1.0');
  assert.equal(shaOf(f.source),f.sha256,'actual GLB bytes do not match source manifest '+f.id);
  assert.ok(f.targetHeight>=.9&&f.targetHeight<=2.2);
 }
 const lamp=licensed.models.find(x=>x.path===ANCHOR_FLUORESCENT_ASSET_V122.path);
 assert.ok(lamp);assert.equal(lamp.sha256,ANCHOR_FLUORESCENT_ASSET_V122.sha256);
 assert.equal(shaOf(lamp.path),lamp.sha256);
 for(const light of CASSETTE_LIGHTS_V124){
  assert.equal(light.model,lamp.path);
  assert.equal(light.sha256,lamp.sha256);
 }
 assert.deepEqual(CASSETTE_LIGHTS_V124.map(l=>l.power),[.62,0,.32,0]);
});
test('Original 1997 store keeps direct entry-to-cashier circulation and all real legacy furniture',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 const original=FURNISHINGS_V69.fixtures.filter(f=>f.room==='cassette_castle');
 assert.equal(original.length,6);
 const newColliders=layout.colliders.filter(c=>c.kind==='licensed-cassette-shop-fixture');
 assert.equal(newColliders.length,12);
 assert.equal(new Set(newColliders.map(c=>c.id)).size,12);
 for(const f of CASSETTE_FIXTURES_V124){
  assert.ok(!layout.canStand(f.x,f.z),'player passes through genuine CC0 music fixture '+f.id);
  assert.ok(isSegmentBlocked(layout.shell,{x:f.x-2,z:f.z},{x:f.x+2,z:f.z}),
   'source geometry must report physical blockage '+f.id);
 }
 // This crossing starts inside the actual 4.2m gallery threshold, then
 // follows the public retail aisle past the counter without teleporting.
 assert.ok(layout.canStand(-30.5,-81.5));
 assert.ok(layout.canStand(-40,-79.2));
 const route=shortestRouteV70(layout,{x:-30.5,z:-81.5},{x:-40,z:-79.2});
 assert.ok(route.length>=8,'real customer route from front door to original register must exist');
 assert.ok(layout.canStand(12.5,-32.75),'V113 original film endpoint changed');
});
test('V124 refuses substituted supports, wall collisions, overlapping racks and filled 4.2m shop entrance',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1}),valid=shell.cassetteCastle;
 const verify=f=>validateCassetteCastleV124({...valid,fixtures:f},{portals:shell.portals,ceilings:shell.ceilings});
 let corrupted=valid.fixtures.map((f,i)=>i===0?{...f,x:-29.7,z:-81.5}:f);
 assert.ok(verify(corrupted).some(e=>/entrance|door|wall/.test(e)));
 corrupted=valid.fixtures.map((f,i)=>i===0?{...f,source:'https://example.com/fake.glb'}:f);
 assert.ok(verify(corrupted).some(e=>e.includes('substituted')));
 corrupted=valid.fixtures.map((f,i)=>i===0?{...f,x:valid.fixtures[1].x,z:valid.fixtures[1].z}:f);
 assert.ok(verify(corrupted).some(e=>e.includes('aisle')));
 const badLights={...valid,lights:valid.lights.map((l,i)=>i===0?{...l,x:0,z:0}:l)};
 assert.ok(validateCassetteCastleV124(badLights,{ceilings:shell.ceilings}).length>0);
});
test('All original six playable chapters, evidence locations and staff exit remain reachable',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const layout=buildGameplayLayoutV70({chapter});
  assert.deepEqual(validatePhysicalShell(layout.shell),[]);
  const pose=chapterRouteV70(chapter).spawn;
  assert.ok(layout.canStand(pose.x,pose.z),'old chapter spawn unavailable '+chapter);
 }
 const entry=buildGameplayLayoutV70({chapter:1});
 for(const e of FURNISHINGS_V69.storyAnchors.filter(a=>MALL.rooms.find(r=>r.id===a.room)?.level==='G'))
  assert.ok(entry.canStand(e.x,e.z),'LS evidence blocked by music merchandise '+e.id);
});
