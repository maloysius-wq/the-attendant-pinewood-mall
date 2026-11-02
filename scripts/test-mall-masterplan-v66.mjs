import test from 'node:test';
import assert from 'node:assert/strict';
import {MALL, findRoute, canUseDoor, validateMasterplan} from '../mall/masterplan-v66.mjs';

const byId=id=>MALL.rooms.find(room=>room.id===id);
const door=id=>MALL.doors.find(d=>d.id===id);
const within=(point,room)=>point.x>=room.x1&&point.x<=room.x2&&point.z>=room.z1&&point.z<=room.z2;
const overlap=(a1,a2,b1,b2)=>Math.min(a2,b2)>=Math.max(a1,b1);
const touch=(a,b)=>overlap(a.x1,a.x2,b.x1,b.x2)&&overlap(a.z1,a.z2,b.z1,b.z2);

test('only the original public level is retail; mezzanine and B1 are restricted',()=>{
 assert.deepEqual(MALL.levels.map(l=>[l.id,l.publicRetail]),[['G',true],['B1',false],['M1',false]]);
 assert.equal(MALL.levels.find(l=>l.id==='G').atriumHeight,12);
 assert.equal(MALL.levels.find(l=>l.id==='B1').y,-4.3);
 assert.equal(MALL.levels.find(l=>l.id==='M1').y,5.4);
});

test('preserves exact opening facade entrance geometry without opening boarded doors',()=>{
 assert.deepEqual(MALL.footprints.original,{x1:-47,x2:47,z1:-118.5,z2:-22.5});
 assert.deepEqual(MALL.footprints.annex,{x1:47,x2:86,z1:-115,z2:-34});
 assert.deepEqual(door('service_entry'),{id:'service_entry',label:'Contractor service entry',level:'G',room:'service_vestibule',x:12,z:-22.5,status:'active',minChapter:1});
 assert.equal(door('main_entry').x,-10.5);
 assert.equal(door('main_entry').z,-22.5);
 assert.equal(door('main_entry').status,'boarded');
 assert.equal(canUseDoor('main_entry',6),false);
 assert.equal(door('east_employee_exit').x,86);
 assert.equal(door('east_employee_exit').z,-42);
 assert.equal(canUseDoor('east_employee_exit',5),false);
 assert.equal(canUseDoor('east_employee_exit',6),true);
});

test('every named room is unique, inside a physical footprint and on a real floor',()=>{
 const ids=MALL.rooms.map(r=>r.id);
 assert.equal(new Set(ids).size,ids.length);
 for(const room of MALL.rooms){
  assert.ok(MALL.levels.some(level=>level.id===room.level),'unknown level '+room.id);
  assert.ok(room.x1<room.x2&&room.z1<room.z2,'negative room geometry '+room.id);
  const footprints=room.level==='G'?[MALL.footprints.original,MALL.footprints.annex]:[MALL.footprints[room.level]];
  assert.ok(footprints.some(f=>room.x1>=f.x1&&room.x2<=f.x2&&room.z1>=f.z1&&room.z2<=f.z2)
    ||(room.id==='annex_threshold'&&room.x1===29&&room.x2===56),'uncontained room '+room.id);
 }
 for(const d of MALL.doors)assert.ok(byId(d.room),'orphaned door '+d.id);
});

test('doors and level transitions connect physical neighbors, not teleporting rooms',()=>{
 const seen=new Set();
 for(const link of MALL.links){
  const a=byId(link.from),b=byId(link.to);
  assert.ok(a&&b,'missing linked room');
  const key=[link.from,link.to].sort().join(':');
  assert.ok(!seen.has(key),'duplicate link '+key); seen.add(key);
  if(a.level===b.level){
   assert.ok(touch(a,b),'separated planar rooms '+key);
   assert.equal(link.type,'passage');
  }else{
   assert.ok(['stairs','elevator'].includes(link.type),'unexplained vertical move '+key);
   assert.ok(link.at&&within(link.at,a)&&within(link.at,b),'vertical portal misaligned '+key);
  }
 }
});

test('all six chapters follow a walkable, ordered geography including backtracking',()=>{
 assert.deepEqual(MALL.routes.map(r=>r.chapter),[1,2,3,4,5,6]);
 const requiredStops={
  1:['service_vestibule','central_gallery','cassette_castle','freight_lobby'],
  2:['freight_b1','relay_d','relay_e','b1_stair'],
  3:['security','annex_threshold'],
  4:['east_wing_spine','training_t04','receiving_r12'],
  5:['m1_stair','roster_records','eli_chase','pa_control'],
  6:['pa_control','central_gallery','east_exit_vestibule']
 };
 for(const r of MALL.routes){
  for(const room of requiredStops[r.chapter])assert.ok(r.sequence.includes(room),r.title+' missing '+room);
  for(let i=1;i<r.sequence.length;i++){
   const a=r.sequence[i-1],b=r.sequence[i];
   assert.ok(MALL.links.some(l=>(l.from===a&&l.to===b)||(l.from===b&&l.to===a)),r.title+' non-contiguous '+a+' to '+b);
   assert.ok(findRoute(a,b,{chapter:r.chapter}),r.title+' impassable '+a+' to '+b);
  }
 }
 assert.ok(findRoute('service_vestibule','east_exit_vestibule',{chapter:6}),'finale cross-map passage');
});

test('nine evidence items remain in canonical chapter sequence and physical rooms',()=>{
 const evidence=MALL.evidence;
 assert.deepEqual(evidence.map(e=>e.id),Array.from({length:9},(_,i)=>'LS-'+String(i+1).padStart(2,'0')));
 assert.deepEqual(evidence.map(e=>e.chapter),[1,1,1,2,3,4,5,5,5]);
 for(const e of evidence){const r=byId(e.room);assert.ok(r,'orphaned evidence '+e.id);assert.equal(typeof e.label,'string');}
 assert.equal(evidence.find(e=>e.id==='LS-08').room,'eli_chase');
 assert.equal(evidence.find(e=>e.id==='LS-09').room,'kessler_office');
});

test('landmark coordinates sit in intended rooms; E17 stays blocked',()=>{
 for(const point of MALL.landmarks){
  const room=byId(point.room);assert.ok(room,'orphaned landmark '+point.id);
  assert.equal(point.level,room.level,'wrong landmark level '+point.id);
  assert.ok(within(point,room),'landmark outside room '+point.id);
 }
 const e17=MALL.landmarks.find(x=>x.id==='e17_false_route');
 assert.equal(e17.status,'sealed');
 assert.equal(MALL.doors.some(d=>d.id==='e17_false_route'&&d.status==='active'),false);
});

test('integrity validator returns no map defects',()=>assert.deepEqual(validateMasterplan(),[]));
test('administrative mezzanine physically overlooks the real atrium rather than a separate building',()=>{
 const atrium=byId('central_gallery'),gallery=byId('mezz_hall');
 assert.equal(atrium.level,'G');
 assert.equal(gallery.level,'M1');
 assert.ok(overlap(atrium.x1,atrium.x2,gallery.x1,gallery.x2),'no mezzanine edge beside atrium');
 assert.ok(overlap(atrium.z1,atrium.z2,gallery.z1,gallery.z2),'no common atrium span');
 assert.equal(MALL.levels.find(l=>l.id==='M1').publicRetail,false);
});
