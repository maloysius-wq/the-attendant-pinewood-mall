import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell,isSegmentBlocked,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {STOREFRONT_SPECS_V115,planStorefrontsV115,storefrontPhysicalWallsV115,validateStorefrontsV115} from '../mall/storefront-plan-v115.mjs';
import {buildGameplayLayoutV70,chapterRouteV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
import {planRoomWallFacesV90} from '../builder/room-wall-layout-v90.mjs';

const shell=()=>constructPhysicalShell({level:'G',chapter:6});
const within=(n,a,b)=>n>=a-1e-6&&n<=b+1e-6;
const cross=(f,z)=>{
 const x=f.at;
 return [{x:x-f.facing*.8,z},{x:x+f.facing*.8,z}];
};
test('seven authentic storefronts derive from actual source room and portal geometry',()=>{
 const s=shell(),fronts=planStorefrontsV115(s.portals);
 assert.equal(fronts.length,7);
 assert.deepEqual(fronts.map(x=>x.room),STOREFRONT_SPECS_V115.map(x=>x.room));
 assert.deepEqual(validateStorefrontsV115(fronts,s.portals),[]);
 assert.deepEqual(s.storefronts,fronts);
 for(const f of fronts){
  const r=MALL.rooms.find(r=>r.id===f.room);
  assert.equal(f.at,f.facing>0?r.x2:r.x1);
  assert.equal(f.start,r.z1);assert.equal(f.end,r.z2);
  assert.ok(f.doorStart>r.z1&&f.doorEnd<r.z2,'entrance within storefront');
  assert.ok(f.entryWidth>=4.1,'retail door is at least 4.1 m');
  assert.ok(f.wallTop>f.windowTop,'complete shop glazing and fascia');
  assert.ok(/^[\w'· .-]+$/.test(f.name),'legible tenant identity');
 }
});

test('real glass and masonry replace blank walls without obstructing original shop doors',()=>{
 const s=shell();
 assert.deepEqual(validatePhysicalShell(s),[]);
 const storeWalls=storefrontPhysicalWallsV115(s.storefronts);
 assert.equal(storeWalls.length,7*8,'two piers + two glass/kick/spandrel bays per store');
 for(const f of s.storefronts){
  const segments=storeWalls.filter(w=>w.id.startsWith('v115_')&&w.id.includes('_'+f.room+'_'));
  assert.equal(segments.filter(x=>x.role==='storefront-glass').length,2);
  const mid=(f.doorStart+f.doorEnd)/2;
  assert.equal(isSegmentBlocked(s,...cross(f,mid)),false,'clear real store access '+f.room);
  const paneMid=(f.start+.44+f.doorStart)/2;
  assert.equal(isSegmentBlocked(s,...cross(f,paneMid)),true,'actual glass encloses store '+f.room);
  assert.ok(!s.walls.some(w=>w.role==='partition'&&w.axis==='x'&&w.at===f.at&&
   w.start<f.end-.2&&w.end>f.start+.2),'opaque masonry retained behind glass '+f.room);
  for(const w of segments){
   assert.ok(within(w.start,f.start,f.end)&&within(w.end,f.start,f.end));
   assert.ok(w.end<=f.doorStart+.001||w.start>=f.doorEnd-.001,
     'real physical storefront blocks retail entrance '+w.id);
  }
 }
});

test('retail custom wall paint respects transparent source window assemblies',()=>{
 const s=shell(),g=MALL.rooms.filter(r=>s.storefronts.some(f=>f.room===r.id));
 for(const r of g){
  const f=s.storefronts.find(f=>f.room===r.id);
  const plan=planRoomWallFacesV90(r,s);
  assert.ok(!plan.some(p=>p.axis==='x'&&Math.abs(p.at-f.at)<.05&&
   p.start<f.end-.3&&p.end>f.start+.3&&p.bottom<3.5&&p.top>.43),
   'Builder wall finishes cannot hide glass '+r.id);
 }
});

test('seven storefront windows remain collision-active, yet existing story routes are safe',()=>{
 for(let chapter=1;chapter<=6;chapter++){
  const route=chapterRouteV70(chapter),level=buildGameplayLayoutV70({chapter});
  assert.ok(level.canStand(route.spawn.x,route.spawn.z),'spawn blocked Chapter '+chapter);
 }
 const chapter1=buildGameplayLayoutV70({chapter:1});
 for(const f of shell().storefronts.filter(f=>f.room!=='annex_anchor')){
  const glass=(f.start+.44+f.doorStart)/2;
  assert.equal(chapter1.canStand(f.at,glass),false,'glass cannot be walked through '+f.room);
  const entry=(f.doorStart+f.doorEnd)/2;
  assert.equal(chapter1.canStand(f.at,entry),true,'shop access remains walkable '+f.room);
 }
 assert.ok(shortestRouteV70(chapter1,{x:12.5,z:-32.75},{x:40,z:-70}).length>0,
  'Video Planet still reachable during Chapter 1');
 const last=buildGameplayLayoutV70({chapter:6,level:'G'});
 assert.ok(shortestRouteV70(last,{x:51,z:-109},{x:87,z:-42}).length>0,
  'East employee exit still reachable in finale');
});

test('storefront geometry leaves cinematic threshold and physical stair voids unchanged',()=>{
 const s=shell();
 const reserved=s.portals.find(p=>p.id==='service_vestibule__central_gallery');
 assert.equal(reserved.width,1.8);
 assert.ok(!s.storefronts.some(f=>f.portalId===reserved.id));
 for(const wall of s.walls.filter(w=>w.role?.startsWith('storefront-')))
  assert.equal(wall.axis,'x','no retail overlay may cover the cinematic front or service vestibule');
 assert.ok(s.floorPlates.every(p=>!(p.x1<20&&p.x2>20&&p.z1<-113&&p.z2>-113)),
  'freight shaft remains open');
});
