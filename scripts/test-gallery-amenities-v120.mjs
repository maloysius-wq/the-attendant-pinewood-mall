import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {GALLERY_AMENITIES_V120,BENCH_ASSET_V120,validateGalleryAmenitiesV120}
 from '../mall/gallery-amenities-v120.mjs';
import {GALLERY_COLUMNS_V118} from '../mall/gallery-columns-v118.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

const asset=JSON.parse(readFileSync(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)));
test('six real benches are source-pinned CC0 and two directories actually belong to the 1979 galleries',()=>{
 const item=asset.models.find(i=>i.id===BENCH_ASSET_V120.catalogId);
 assert.ok(item,'original CC0 gallery bench missing from existing 482-member Builder catalog');
 assert.equal(item.path,BENCH_ASSET_V120.path);
 assert.equal(item.sha256,BENCH_ASSET_V120.sha256);
 assert.equal(item.license,'CC0-1.0');
 assert.equal(asset.models.length,482,'never shrink or rename original 482 vendor models');
 assert.equal(GALLERY_AMENITIES_V120.benches.length,6);
 assert.equal(GALLERY_AMENITIES_V120.directories.length,2);
 assert.equal(GALLERY_AMENITIES_V120.wayfinding.length,2);
 assert.equal(MALL.rooms.length,41);
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 assert.deepEqual(FURNISHINGS_V69.storyAnchors.filter(x=>x.room==='central_gallery')
  .map(({id,x,z})=>({id,x,z})),
  [{id:'LS-01',x:7,z:-66},{id:'LS-02',x:7,z:-94}],
  'source evidence has drifted from collision protection coordinates');
});

test('all public amenity bases are really built into original ground floor and remain out of shop doors',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.deepEqual(validateGalleryAmenitiesV120(shell.galleryAmenities,{
  portals:shell.portals,galleryColumns:shell.galleryColumns}),[]);
 assert.equal(shell.galleryAmenities.benches.length,6);
 assert.equal(shell.galleryAmenities.directories.length,2);
 assert.equal(shell.galleryAmenities.wayfinding.length,2);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(shell.storefronts.length,7);
 assert.equal(shell.closedBays.length,13);
 assert.equal(shell.checkpoint.cells.length,2);
 assert.equal(shell.foodCourt.booths.length,3);
 const all=[...shell.galleryAmenities.benches,...shell.galleryAmenities.directories];
 for(const a of all){
  assert.equal(isSegmentBlocked(shell,{x:a.x-2.3,z:a.z},{x:a.x+2.3,z:a.z}),true,
   'real permanent amenity cannot be walked through '+a.id);
  assert.equal(a.baseY,0,'no hovering fixtures '+a.id);
 }
 for(const col of shell.galleryColumns){
  if(col.room==='central_gallery'){
   assert.ok(Math.hypot(col.x,col.z+71)>5.1+col.collisionRadius+1.1,
    'original 1979 fountain is still protected');
  }
 }
 for(const portal of shell.portals.filter(p=>p.type==='doorway'&&
  ['central_gallery','west_gallery','east_gallery'].some(x=>[p.from,p.to].includes(x)))){
  const mid=(portal.start+portal.end)/2;
  const from=portal.axis==='x'?{x:portal.at-.3,z:mid}:{x:mid,z:portal.at-.3};
  const to=portal.axis==='x'?{x:portal.at+.3,z:mid}:{x:mid,z:portal.at+.3};
  if(portal.minChapter<=1)
   assert.equal(isSegmentBlocked(shell,from,to),false,'original public portal blocked '+portal.id);
 }
});

test('real gameplay AABBs block source bench feet and directory plinths, not the open long shop paths',()=>{
 const nav=buildGameplayLayoutV70({chapter:1});
 const source=[...GALLERY_AMENITIES_V120.benches,...GALLERY_AMENITIES_V120.directories];
 const blockers=nav.colliders.filter(c=>c.kind==='public-mall-amenity');
 assert.equal(blockers.length,source.length,'each immovable amenity needs one actual gameplay AABB');
 for(const a of source){
  assert.ok(blockers.find(c=>c.id===a.id),'missing exact collision on source object '+a.id);
  assert.equal(nav.canStand(a.x,a.z),false,'player phases through grounded original mall fixture '+a.id);
 }
 for(const [x,z1,z2] of [[-20,-48,-107],[20,-48,-106]]){
  assert.ok(nav.canStand(x,-57)&&nav.canStand(x,-100),
   'original central shopping spine closed by benches');
  assert.ok(shortestRouteV70(nav,{x,z:z1},{x,z:z2}).length>35,
   'north/south public shopping route no longer continuous '+x);
 }
 assert.ok(nav.canStand(0,-64)&&nav.canStand(0,-76),
  'dry fountain orientation approach blocked by lounge seating');
 assert.ok(shortestRouteV70(nav,{x:0,z:-52},{x:0,z:-57}).length>0,
  'directory blocks path north of main doorway');
 assert.ok(shortestRouteV70(nav,{x:0,z:-52},{x:0,z:-108}).length>40,
  'original atrium center walkway must remain continuous past fountain and north directory');
 assert.ok(nav.canStand(0,-52)&&nav.canStand(0,-101),
  'the public mall center line must never be occupied by a directory');
});

test('all six chapter routes, original cinema-to-door, and actual LS evidence positions remain playable',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const nav=buildGameplayLayoutV70({chapter});
  const spawn=chapterRouteV70(chapter).spawn;
  assert.ok(nav.canStand(spawn.x,spawn.z),'canonical chapter entry lost '+chapter);
  assert.deepEqual(validatePhysicalShell(nav.shell),[]);
 }
 const chapter1=buildGameplayLayoutV70({chapter:1});
 assert.ok(chapter1.canStand(12.5,-32.75),'cinematic->Chapter 1 exact eye blocked');
 for(const a of FURNISHINGS_V69.storyAnchors.filter(x=>x.room==='central_gallery')){
  assert.ok(chapter1.canStand(a.x,a.z),'original evidence LS site is physically inaccessible '+a.id);
 }
 assert.equal(MALL.rooms.length,41);
});
