import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from '../mall/anchor-identity-plan-v122.mjs';
import {
 SUNBURST_ROOM_V126,SUNBURST_PACK_V126,SUNBURST_FIXTURES_V126,SUNBURST_LIGHTS_V126,
 SUNBURST_SIGN_V126,SUNBURST_POSTERS_V126,SUNBURST_SOURCE_SIZES_V126,
 validateSunburstArcadeV126
} from '../mall/sunburst-arcade-plan-v126.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,shortestRouteV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const sha=p=>createHash('sha256').update(read(p)).digest('hex');

test('V126 keeps original 17×17m Sunburst suite, V115 glass entry, four V69 legacy arcade pieces and six story chapters',()=>{
 const room=MALL.rooms.find(r=>r.id==='sunburst_arcade');
 assert.deepEqual(Object.fromEntries(Object.keys(SUNBURST_ROOM_V126).map(k=>[k,room[k]])),SUNBURST_ROOM_V126);
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 for(let n=1;n<=6;n++)assert.equal(chapterRouteV70(n).chapter,n);
 const legacy=FURNISHINGS_V69.fixtures.filter(f=>f.room==='sunburst_arcade');
 assert.deepEqual(legacy.map(f=>f.id).sort(),
  ['arcade_claw','arcade_air_hockey','arcade_basketball','arcade_stool']);
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.ok(shell.storefronts.some(s=>s.room==='sunburst_arcade'&&Math.abs(s.entryWidth-4.2)<.01),
  'true original 4.2m glass entry absent');
 assert.deepEqual(shell.fixtures.filter(f=>f.room==='sunburst_arcade').map(f=>f.id),
  ['arcade_one','arcade_two']);
 assert.equal(shell.sunburstArcade.fixtures.length,18);
 assert.equal(shell.sunburstArcade.lights.length,4);
 assert.equal(shell.sunburstArcade.posters.length,5);
 assert.deepEqual(validateSunburstArcadeV126(shell.sunburstArcade,
  {portals:shell.portals,ceilings:shell.ceilings}),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 // Replace the source floor, not lay a floating thin carpet over existing terrazzo.
 const sourceCarpet=shell.floorPlates.filter(p=>p.id==='v126_original_sunburst_arcade_carpet');
 assert.equal(sourceCarpet.length,1);
 assert.deepEqual([sourceCarpet[0].x1,sourceCarpet[0].x2,sourceCarpet[0].z1,sourceCarpet[0].z2],
  [-46,-29,-107,-90]);
 assert.equal(sourceCarpet[0].material,'carpet');assert.equal(sourceCarpet[0].y,0);
 const overlaps=(a,b)=>a.x1<b.x2&&a.x2>b.x1&&a.z1<b.z2&&a.z2>b.z1;
 assert.ok(!shell.floorPlates.some(p=>p.material==='terrazzo'&&overlaps(p,sourceCarpet[0])));
 assert.equal(shell.videoPlanet.fixtures.length,16);
 assert.equal(shell.cassetteCastle.fixtures.length,12);
});

test('18 full human-size arcade meshes are reused from the exact original published and independently measured CC0 GLB',()=>{
 const manifest=JSON.parse(read('assets/vendor/arcade-v30/manifest.json').toString());
 const measured=JSON.parse(read('diagnostics/arcade-v30-geometry.json').toString());
 assert.equal(manifest.license,'CC0 1.0');
 assert.equal(SUNBURST_PACK_V126.license,'CC0-1.0');
 const vendor=manifest.files.find(f=>f.path==='./'+SUNBURST_PACK_V126.path);
 assert.ok(vendor);assert.equal(vendor.bytes,1838968);
 assert.equal(vendor.sha256,SUNBURST_PACK_V126.sha256);
 assert.equal(sha(SUNBURST_PACK_V126.path),SUNBURST_PACK_V126.sha256);
 assert.equal(measured.unit,'metre');
 const sources=new Map(measured.props.map(p=>[p.name,p]));
 assert.equal(SUNBURST_FIXTURES_V126.length,18);
 for(const f of SUNBURST_FIXTURES_V126){
  assert.equal(f.source,SUNBURST_PACK_V126.path);
  assert.equal(f.sha256,vendor.sha256);
  assert.equal(f.license,'CC0-1.0');
  const source=sources.get(f.node);
  assert.ok(source,'not in real glTF scene: '+f.node);
  assert.deepEqual(Object.values(source.size),f.sourceSize);
  assert.deepEqual(SUNBURST_SOURCE_SIZES_V126[f.node],f.sourceSize);
  assert.ok(f.sourceSize[1]>=.75,'miniature arcade asset '+f.id);
  assert.ok(f.collisionRadius>=Math.hypot(f.sourceSize[0],f.sourceSize[2])/2+.09);
 }
 const lightSource=sha(ANCHOR_FLUORESCENT_ASSET_V122.path);
 assert.equal(lightSource,ANCHOR_FLUORESCENT_ASSET_V122.sha256);
 for(const light of SUNBURST_LIGHTS_V126){
  assert.equal(light.model,ANCHOR_FLUORESCENT_ASSET_V122.path);
  assert.equal(light.sha256,lightSource);
 }
 assert.deepEqual(SUNBURST_LIGHTS_V126.map(l=>l.power),[.32,0,.21,0]);
 assert.ok(SUNBURST_POSTERS_V126.every(p=>p.originalArtwork));
 assert.ok(SUNBURST_SIGN_V126.originalArtwork);
});

test('V126 arcade is physically solid, preserving source entrance and a clear interior route',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 assert.equal(layout.colliders.filter(c=>c.kind==='licensed-sunburst-arcade-machine').length,18);
 for(const f of SUNBURST_FIXTURES_V126){
  assert.ok(!layout.canStand(f.x,f.z),'walk-through original CC0 machine '+f.id);
  assert.ok(isSegmentBlocked(layout.shell,{x:f.x-1.8,z:f.z},{x:f.x+1.8,z:f.z}),
   'no physical collision at '+f.id);
 }
 for(const [x,z] of [[-30,-98.5],[-31.5,-98.5],[-33,-98.5],[-34,-98.5]]){
  assert.ok(layout.canStand(x,z),'inaccessible original 4.2m entrance / central aisle '+x+','+z);
 }
 assert.ok(shortestRouteV70(layout,{x:-30,z:-99},{x:-34,z:-99}).length>=4,
  'no connected walking route into original Sunburst shop');
 assert.ok(layout.canStand(12.5,-32.75),'original V113 film-to-Chapter-1 pose broken');
 const shell=layout.shell;
 const portal=shell.portals.find(p=>p.type==='doorway'&&[p.from,p.to].includes('sunburst_arcade'));
 assert.ok(portal);assert.ok(portal.width>=4.19);
});

test('V126 validation rejects source swaps, unsafe overlaps, doorway blockers and fake artwork',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1}),plan=shell.sunburstArcade;
 const check=changes=>validateSunburstArcadeV126({...plan,...changes},
  {portals:shell.portals,ceilings:shell.ceilings});
 assert.ok(check({fixtures:plan.fixtures.map((f,i)=>i?f:{...f,source:'https://example.invalid/arcade.glb'})})
  .some(e=>e.includes('Unverified')));
 assert.ok(check({fixtures:plan.fixtures.map((f,i)=>i?f:{...f,x:-29.8,z:-98.5})})
  .some(e=>e.includes('entrance')));
 assert.ok(check({fixtures:plan.fixtures.map((f,i)=>i?f:{...f,x:-43,z:-94})})
  .some(e=>e.includes('intersects original')));
 assert.ok(check({fixtures:plan.fixtures.map((f,i)=>i===1?{...f,x:plan.fixtures[0].x+.1,z:plan.fixtures[0].z}:f)})
  .some(e=>e.includes('aisle')));
 assert.ok(check({lights:plan.lights.map((l,i)=>i?l:{...l,model:'remote.glb'})})
  .some(e=>e.includes('Unlicensed')));
 assert.ok(check({posters:plan.posters.map((p,i)=>i?p:{...p,originalArtwork:false})})
  .some(e=>e.includes('non-original')));
});
