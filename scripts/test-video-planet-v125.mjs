import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {MEDIA_SHELF_V158} from '../mall/media-shelf-source-v158.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from '../mall/anchor-retail-source-v121.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from '../mall/anchor-identity-plan-v122.mjs';
import {VIDEO_PLANET_ROOM_V125,VIDEO_PLANET_FIXTURES_V125,VIDEO_PLANET_LIGHTS_V125,VIDEO_PLANET_SIGN_V125,VIDEO_PLANET_POSTERS_V125,validateVideoPlanetV125} from '../mall/video-planet-plan-v125.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

const catalog=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
const shaOf=path=>createHash('sha256').update(readFileSync(new URL('../'+path,import.meta.url))).digest('hex');
test('V125 retains exact 17x19m original Video Planet, glass entry, Luis LS-03 and five legacy furnishings',()=>{
 const room=MALL.rooms.find(r=>r.id==='video_planet');
 assert.deepEqual(Object.fromEntries(Object.keys(VIDEO_PLANET_ROOM_V125).map(k=>[k,room[k]])),VIDEO_PLANET_ROOM_V125);
 assert.equal(MALL.rooms.length,41);assert.equal(MALL.evidence.length,9);
 const evidence=FURNISHINGS_V69.storyAnchors.find(a=>a.id==='LS-03');
 assert.deepEqual({room:evidence.room,x:evidence.x,z:evidence.z},
  {room:'video_planet',x:40,z:-70});
 assert.equal(FURNISHINGS_V69.fixtures.filter(x=>x.room==='video_planet').length,5);
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const facade=shell.storefronts.find(f=>f.room==='video_planet');
 assert.ok(facade,'real Video Planet exterior glass is missing');
 assert.ok(Math.abs(facade.entryWidth-4.2)<.01);
 assert.equal(shell.videoPlanet.fixtures.length,16);
 assert.equal(shell.videoPlanet.lights.length,4);
 assert.equal(shell.videoPlanet.posters.length,6);
 assert.deepEqual(validateVideoPlanetV125(shell.videoPlanet,
  {portals:shell.portals,ceilings:shell.ceilings}),[]);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.equal(shell.cassetteCastle.fixtures.length,12);
 assert.equal(shell.anchorStock.length,13);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.closedBays.length,13);
});
test('All V125 CC0 source GLB bytes match original vendor catalog and independent prior source audition',()=>{
 assert.equal(catalog.models.length,482);
 const candidates=new Map([...ORIGINAL_RETAIL_CANDIDATES_V121,MEDIA_SHELF_V158].map(x=>[x.shortName,x]));
 assert.equal(VIDEO_PLANET_FIXTURES_V125.filter(f=>f.kind==='wall_bay').length,13);
 assert.equal(VIDEO_PLANET_FIXTURES_V125.filter(f=>f.kind==='spinner').length,2);
 assert.equal(VIDEO_PLANET_FIXTURES_V125.filter(f=>f.kind==='table_medium').length,1);
 for(const f of VIDEO_PLANET_FIXTURES_V125){
  const source=candidates.get(f.kind),original=catalog.models.find(m=>m.path===f.source);
  assert.ok(source&&original,f.id);
  assert.equal(f.sha256,source.sha256);assert.equal(f.sha256,original.sha256);
  assert.equal(original.license,'CC0-1.0');
  assert.equal(shaOf(f.source),f.sha256);
 }
 const light=catalog.models.find(m=>m.path===ANCHOR_FLUORESCENT_ASSET_V122.path);
 assert.ok(light);assert.equal(light.sha256,ANCHOR_FLUORESCENT_ASSET_V122.sha256);
 assert.equal(shaOf(light.path),light.sha256);
 for(const lamp of VIDEO_PLANET_LIGHTS_V125){
  assert.equal(lamp.model,light.path);assert.equal(lamp.sha256,light.sha256);
 }
 assert.deepEqual(VIDEO_PLANET_LIGHTS_V125.map(l=>l.power),[.57,0,.29,0]);
});
test('V125 rental cases are human-sized, source-supported and do not seal route to LS-03',()=>{
 const layout=buildGameplayLayoutV70({chapter:1});
 assert.equal(layout.colliders.filter(c=>c.kind==='licensed-video-rental-fixture').length,16);
 for(const f of VIDEO_PLANET_FIXTURES_V125){
  assert.ok(!layout.canStand(f.x,f.z),'walk-through rental fixture '+f.id);
  assert.ok(isSegmentBlocked(layout.shell,{x:f.x-2,z:f.z},{x:f.x+2,z:f.z}),f.id);
 }
 for(const x of [30,32,34,36,38,40])assert.ok(layout.canStand(x,-70),
  'LS-03 main aisle blocked at x '+x);
 assert.ok(layout.canStand(40,-70),'Luis original evidence covered');
 assert.ok(layout.canStand(35,-66.5),'original counter access blocked');
 assert.ok(shortestRouteV70(layout,{x:30,z:-70},{x:40,z:-70}).length>=8,
  'cannot follow original source-glazed entrance to LS-03');
 assert.ok(layout.canStand(12.5,-32.75),'V113 cinematic Chapter 1 start changed');
});
test('V125 plan rejects substituted source, overlapping support, blocked portal and invented film art',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1}),plan=shell.videoPlanet;
 const verify=f=>validateVideoPlanetV125({...plan,fixtures:f},
  {portals:shell.portals,ceilings:shell.ceilings});
 assert.ok(verify(plan.fixtures.map((f,i)=>i===0?{...f,source:'https://unsafe.invalid/prop.glb'}:f))
  .some(e=>e.includes('unlicensed')));
 assert.ok(verify(plan.fixtures.map((f,i)=>i===0?{...f,x:29.7,z:-70.5}:f))
  .some(e=>/entrance|route|masonry/.test(e)));
 assert.ok(verify(plan.fixtures.map((f,i)=>i===0?{...f,x:plan.fixtures[1].x,z:plan.fixtures[1].z}:f))
  .some(e=>e.includes('aisle')));
 assert.ok(validateVideoPlanetV125({...plan,posters:[{...VIDEO_PLANET_POSTERS_V125[0],originalArtwork:false},...VIDEO_PLANET_POSTERS_V125.slice(1)]})
  .some(e=>e.includes('unmounted')));
 assert.ok(validateVideoPlanetV125({...plan,lights:plan.lights.map((l,i)=>i===0?{...l,x:1}:l)},
  {ceilings:shell.ceilings}).length>0);
});
test('All six chapters and all original ground-floor evidence anchors remain standable',()=>{
 for(let ch=1;ch<=6;ch++){
  const layout=buildGameplayLayoutV70({chapter:ch});
  assert.deepEqual(validatePhysicalShell(layout.shell),[]);
  const spawn=chapterRouteV70(ch).spawn;
  assert.ok(layout.canStand(spawn.x,spawn.z),'chapter spawn blocked '+ch);
 }
 const layout=buildGameplayLayoutV70({chapter:1});
 for(const e of FURNISHINGS_V69.storyAnchors.filter(a=>MALL.rooms.find(r=>r.id===a.room)?.level==='G'))
  assert.ok(layout.canStand(e.x,e.z),'source story evidence blocked '+e.id);
});

test('V158 actual open media shelf replaces the clothing rail; licensed source bytes and physical facing are explicit',()=>{
 const shelves=VIDEO_PLANET_FIXTURES_V125.filter(f=>f.kind==='wall_bay');
 assert.ok(shelves.length>0&&shelves.every(f=>f.source===MEDIA_SHELF_V158.path&&f.sha256===MEDIA_SHELF_V158.sha256));
 assert.equal(shaOf(MEDIA_SHELF_V158.path),MEDIA_SHELF_V158.sha256);
 for(const f of shelves)assert.ok(Number.isFinite(f.yaw));
});
