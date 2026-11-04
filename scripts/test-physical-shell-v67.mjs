import test from 'node:test';
import assert from 'node:assert/strict';
import {constructPhysicalShell,isSegmentBlocked,validatePhysicalShell} from '../mall/physical-shell-v67.mjs';
import {MALL} from '../mall/masterplan-v66.mjs';

const g1=()=>constructPhysicalShell({level:'G',chapter:1});
const near=(a,b,eps=.015)=>Math.abs(a-b)<=eps;
const contains=(b,x,z)=>b.x1<=x&&b.x2>=x&&b.z1<=z&&b.z2>=z;
const collide=(shell,from,to)=>isSegmentBlocked(shell,from,to);

test('constructs one physical retail floor and restricted mechanical and admin decks',()=>{
 const ground=g1(),below=constructPhysicalShell({level:'B1',chapter:2}),admin=constructPhysicalShell({level:'M1',chapter:5});
 assert.equal(ground.y,0);assert.equal(below.y,-4.3);assert.equal(admin.y,5.4);
 assert.ok(ground.walls.length>30,'actual vertical partitions expected');
 assert.ok(below.walls.length>15,'actual basement walls expected');
 assert.ok(admin.walls.length>12,'actual office walls expected');
 assert.ok(ground.floorPlates.length>=4,'continuous slab with voids expected');
 assert.ok(admin.railings.length>=1,'elevated public-facing overlook rail expected');
 assert.equal(ground.roofs.some(r=>r.type==='original-atrium-roof'),true);
});


test('all enclosed ground-floor rooms have real underside ceilings without covering vertical shafts',()=>{
 const ground=g1();
 const ceilings=ground.ceilings;
 assert.ok(Array.isArray(ceilings)&&ceilings.length>=20,'each ground room must receive ceiling geometry');
 for(const room of MALL.rooms.filter(r=>r.level==='G'&&r.id!=='central_gallery')){
  const slabs=ceilings.filter(p=>p.room===room.id);
  assert.ok(slabs.length>0,'missing overhead ceiling in '+room.id);
  for(const p of slabs){
   assert.ok(p.x1>=room.x1&&p.x2<=room.x2&&p.z1>=room.z1&&p.z2<=room.z2,
    'ceiling must remain inside '+room.id);
   assert.ok(p.y>=3.25&&p.y<=8.5,'ceiling has realistic height in '+room.id);
  }
 }
 assert.ok(ground.roofs.some(r=>r.type==='atrium-skylight'&&r.y>12),
  'central atrium must retain its tall glazed overhead rather than a low false ceiling');
 const at=(x,z)=>ceilings.some(p=>contains(p,x,z));
 assert.equal(at(20,-113),false,'no ceiling plate across the freight lift shaft');
 assert.equal(at(32,-112),false,'no ceiling plate across ground-level fire stair');
 assert.equal(at(51,-109),false,'no ceiling plate across the mezzanine stair');
});

test('preserves the real cinematic service opening and the impassable main lobby',()=>{
 const shell=g1(),service=shell.doors.find(x=>x.id==='service_entry'),boarded=shell.doors.find(x=>x.id==='main_entry');
 assert.ok(service);assert.ok(boarded);
 assert.equal(service.x,12);assert.equal(service.z,-22.5);assert.equal(service.width,1.78);assert.equal(service.height,2.27);
 assert.equal(boarded.x,-10.5);assert.equal(boarded.status,'boarded');
 assert.equal(collide(shell,{x:12,z:-19},{x:12,z:-25}),false,'service aperture must be open');
 assert.equal(collide(shell,{x:-10.5,z:-19},{x:-10.5,z:-25}),true,'boarded lobby cannot be entered from parking lot');
 assert.equal(collide(shell,{x:8,z:-19},{x:8,z:-25}),true,'wall beside door blocks');
});

test('the east employee exit has a real threshold gated until the finale',()=>{
 const before=constructPhysicalShell({level:'G',chapter:5}),after=constructPhysicalShell({level:'G',chapter:6});
 assert.ok(before.doors.some(d=>d.id==='east_employee_exit'&&d.status==='gated'));
 assert.equal(collide(before,{x:84,z:-42},{x:88,z:-42}),true);
 assert.equal(collide(after,{x:84,z:-42},{x:88,z:-42}),false);
});

test('ground freight shaft contains no false floor and stair positions remain physically aligned',()=>{
 const ground=g1();
 const groundLift=ground.verticals.find(v=>v.type==='elevator');
 assert.ok(groundLift);assert.deepEqual(groundLift.at,{x:20,z:-113});
 assert.equal(ground.floorPlates.some(p=>contains(p,20,-113)),false,'solid floor across lift shaft');
 const b1=ground.stairs.find(s=>s.from==='b1_stair'),admin=ground.stairs.find(s=>s.from==='receiving_r12');
 assert.equal(b1.steps.length,24);assert.ok(near(b1.rise,4.3));assert.equal(b1.topY,0);
 assert.equal(admin.steps.length,30);assert.ok(near(admin.rise,5.4));assert.equal(admin.topY,5.4);
 assert.ok(b1.steps.every(s=>s.w>=1.8&&s.depth>=.21),'stair usable tread and width');
});

test('basement relay corridor and security access are open at their authored portals',()=>{
 const basement=constructPhysicalShell({level:'B1',chapter:2});
 assert.equal(collide(basement,{x:-27,z:-92},{x:-10,z:-92}),false,'relay D to E open at shared doorway');
 const ground=constructPhysicalShell({level:'G',chapter:4});
 assert.equal(collide(ground,{x:28,z:-105},{x:32,z:-105}),false,'east gallery security door');
 assert.equal(collide(ground,{x:54,z:-99},{x:59,z:-99}),false,'East Wing seam');
});

test('locked chapter thresholds form actual door barriers until the chapter unlocks',()=>{
 const early=constructPhysicalShell({level:'G',chapter:3});
 const later=constructPhysicalShell({level:'G',chapter:4});
 assert.equal(collide(early,{x:54,z:-99},{x:59,z:-99}),true,'East Wing restricted until Chapter 4');
 assert.equal(collide(later,{x:54,z:-99},{x:59,z:-99}),false);
});

test('real fixture models and textures are pinned to same-origin, licensed repository paths',()=>{
 for(const level of ['G','B1','M1']){
  const shell=constructPhysicalShell({level,chapter:6});
  for(const f of shell.fixtures){
   assert.match(f.model,/^assets\/vendor\/runtime\/[a-f0-9]{16}\/[^?#]+\.glb$/);
   assert.doesNotMatch(f.model,/ShelfLarge|ShelfSmall|Shelf%20Large|Shelf%20Small/i);
   assert.ok(f.targetHeight>0&&f.targetHeight<5);
   assert.ok(MALL.rooms.some(r=>r.id===f.room&&r.level===level),'unanchored fixture '+f.id);
  }
  for(const path of Object.values(shell.texturePaths)){
   assert.match(path,/^assets\/vendor\/runtime\/[a-f0-9]{16}\/[^?#]+\.(jpg|png)$/);
  }
 }
 assert.ok(g1().fixtures.some(f=>f.id==='dry_fountain_art'&&f.room==='central_gallery'));
});

test('every room portal is physically open unless its gate is locked',()=>{
 for(const level of ['G','B1','M1']){
  const shell=constructPhysicalShell({level,chapter:6});
  for(const p of shell.portals){
   if(p.type==='overlap')continue;
   const from=p.axis==='x'?{x:p.at-.6,z:(p.start+p.end)/2}:{x:(p.start+p.end)/2,z:p.at-.6};
   const to=p.axis==='x'?{x:p.at+.6,z:(p.start+p.end)/2}:{x:(p.start+p.end)/2,z:p.at+.6};
   assert.equal(collide(shell,from,to),false,'portal cannot traverse '+p.from+' -> '+p.to);
  }
 }
});

test('all physical shells validate with no impossible dimensions or hidden blocking walls',()=>{
 for(const level of ['G','B1','M1']){
  const shell=constructPhysicalShell({level,chapter:6});
  assert.deepEqual(validatePhysicalShell(shell),[],level+' geometry errors');
 }
});