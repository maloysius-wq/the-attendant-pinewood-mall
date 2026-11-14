import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {GALLERY_COLUMNS_V118,validateGalleryColumnsV118} from '../mall/gallery-columns-v118.mjs';
import {constructPhysicalShell,validatePhysicalShell,isSegmentBlocked} from '../mall/physical-shell-v67.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';

test('source-anchored 1979 colonnades frame all three galleries without invented rooms',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 assert.equal(MALL.rooms.length,41);
 assert.deepEqual(validatePhysicalShell(shell),[]);
 assert.deepEqual(validateGalleryColumnsV118(shell.galleryColumns,shell.portals),[]);
 assert.equal(shell.galleryColumns.length,28);
 assert.equal(new Set(shell.galleryColumns.map(c=>c.id)).size,28);
 assert.equal(shell.galleryColumns.filter(c=>c.room==='central_gallery').length,10);
 assert.equal(shell.galleryColumns.filter(c=>c.room==='west_gallery').length,9);
 assert.equal(shell.galleryColumns.filter(c=>c.room==='east_gallery').length,9);
 assert.equal(shell.storefronts.length,7);
 assert.equal(shell.closedBays.length,13);
 assert.equal(shell.checkpoint.cells.length,2);
 for(const c of GALLERY_COLUMNS_V118){
  const r=MALL.rooms.find(r=>r.id===c.room);
  assert.ok(c.x>r.x1&&c.x<r.x2&&c.z>r.z1&&c.z<r.z2,
   'support must be inside its canonical circulation region '+c.id);
  assert.ok(c.topY===12.8||c.topY===5.19,'post does not meet authored ceiling/roof');
 }
});

test('structural posts have actual blocking physical footprint, without a fake traversable surface',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const navigation=buildGameplayLayoutV70({chapter:1});
 assert.equal(shell.galleryColumns.length,navigation.shell.galleryColumns.length);
 for(const c of GALLERY_COLUMNS_V118){
  assert.equal(navigation.canStand(c.x,c.z),false,'player could phase through column '+c.id);
  assert.ok(navigation.colliders.some(x=>x.id===c.id&&x.kind==='structural-column'),
   'post needs exact original gameplay collider '+c.id);
  assert.ok(isSegmentBlocked(shell,{x:c.x-1.4,z:c.z},{x:c.x+1.4,z:c.z}),
   'post cannot be transparent to movement/line of sight '+c.id);
 }
 assert.ok(shell.floorPlates.every(p=>!p.id.startsWith('v118_')),
  'columns cannot create suspended or imaginary new floors');
});

test('principal shop entrance/atrium and both long shopping spines remain usable',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const spawn=chapterRouteV70(chapter).spawn,nav=buildGameplayLayoutV70({chapter});
  assert.ok(nav.canStand(spawn.x,spawn.z),'lost chapter '+chapter+' canonical spawn');
 }
 const walk=buildGameplayLayoutV70({chapter:1});
 for(const tour of FURNISHINGS_V69.tourRoutes.filter(r=>
  ['west_gallery_spine','east_gallery_spine'].includes(r.id))){
  const r=shortestRouteV70(walk,tour.from,tour.to);
  assert.ok(r.length>40,'blocked long retail shopping promenade: '+tour.id);
 }
 assert.ok(shortestRouteV70(walk,{x:12.5,z:-32.75},{x:-38,z:-81}).length>0,
  'original contractor to Cassette Castle route was blocked');
 assert.ok(shortestRouteV70(walk,{x:12.5,z:-32.75},{x:40,z:-70}).length>0,
  'original contractor to Video Planet route was blocked');
 assert.ok(shortestRouteV70(walk,{x:0,z:-52},{x:0,z:-108}).length>0,
  'central gallery must remain walkable around the dry fountain');
});

test('fountain, LS evidence anchors, and authentic glazed store thresholds retain clearance',()=>{
 const shell=constructPhysicalShell({level:'G',chapter:6});
 for(const a of FURNISHINGS_V69.storyAnchors.filter(x=>x.room==='central_gallery')){
  for(const c of shell.galleryColumns){
   assert.ok(Math.hypot(a.x-c.x,a.z-c.z)>c.collisionRadius+1.2,
    'atrium structural support obstructs evidence '+a.id+'/'+c.id);
  }
 }
 const fountain={x:0,z:-71};
 for(const c of shell.galleryColumns){
  if(c.room==='central_gallery'){
   assert.ok(Math.hypot(c.x-fountain.x,c.z-fountain.z)>5.1+c.collisionRadius+1,
    'column must not intersect dry basin or implied waiting circle');
  }
 }
 for(const p of shell.portals.filter(p=>p.type==='doorway'&&p.level==='G'&&
  (p.from==='west_gallery'||p.from==='east_gallery'||p.to==='west_gallery'||p.to==='east_gallery'))){
  const mid=(p.start+p.end)/2;
  const across=p.axis==='x'?[{x:p.at-.3,z:mid},{x:p.at+.3,z:mid}]:
   [{x:mid,z:p.at-.3},{x:mid,z:p.at+.3}];
  assert.ok(!isSegmentBlocked(shell,...across),'original tenant doorway closed: '+p.id);
 }
 assert.deepEqual(MALL.evidence.map(e=>e.id),
  Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
});
