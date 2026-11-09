import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PARKING_LOT_V84,PARKING_MARKINGS_V84,PARKING_MARKING_COUNTS_V84,PARKING_PROPS_V84} from '../opening/parking-layout-v84.mjs';

const {bounds,blocks,rows,cinematicCar}=PARKING_LOT_V84;
const between=(x,a,b)=>x>=a&&x<=b;
const store=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8'));
const models=new Map(store.models.map(m=>[m.id,m]));
test('original cinematic 115 × 88 m lot has consistent 90-degree stall rows and car clearance',()=>{
 assert.deepEqual(bounds,{x1:-57.5,x2:57.5,z1:-19.5,z2:68.5});
 assert.equal(PARKING_LOT_V84.stallDepth,5.6);
 assert.equal(PARKING_LOT_V84.driveAisle,7.4);
 assert.equal(blocks.length,4);
 assert.equal(rows.length,7);
 for(const block of blocks){
  const width=(block.x2-block.x1)/block.spaces;
  assert.ok(width>=2.74&&width<=3.01,'credible full-width parking stalls');
  assert.ok(block.x1>=bounds.x1&&block.x2<=bounds.x2);
 }
 for(const row of rows){
  assert.equal(Math.round((row.z2-row.z1)*10)/10,5.6,'consistent stall depth');
  assert.ok(between(row.z1,bounds.z1,bounds.z2)&&between(row.z2,bounds.z1,bounds.z2));
 }
 for(let i=0;i<rows.length-1;i++){
  const gap=rows[i+1].z1-rows[i].z2;
  if(gap>.01)assert.ok(gap>=7.39,'two-way circulation aisle is never narrowed');
 }
 const row=rows.find(row=>between(cinematicCar.z,row.z1,row.z2));
 const block=blocks.find(block=>between(cinematicCar.x,block.x1,block.x2));
 assert.equal(row?.id,'sedan-row','actual opening car is parked in a marked stall');
 assert.ok(block,'sedan is in a real marked stall, not a drive lane');
 const w=(block.x2-block.x1)/block.spaces,slot=Math.floor((cinematicCar.x-block.x1)/w);
 const center=block.x1+(slot+.5)*w;
 assert.ok(Math.abs(center-cinematicCar.x)<.01,'original sedan is exactly centered between stall stripes');
 assert.ok(Math.min(cinematicCar.z-row.z1,row.z2-cinematicCar.z)>2,'sedan is not on a horizontal stripe');
 assert.ok(PARKING_LOT_V84.frontDrive.z1< -10 && PARKING_LOT_V84.frontDrive.z2<=-4.5,
  'the contractor-front two-way access road remains empty of marked stalls');
});

test('paint markings are repeated coherent space/street lines, inside actual asphalt',()=>{
 assert.equal(PARKING_MARKING_COUNTS_V84.stalls,196);
 assert.equal(PARKING_MARKING_COUNTS_V84.segments,PARKING_MARKINGS_V84.length);
 assert.ok(PARKING_MARKINGS_V84.length>=280,'full rows plus circulation markers');
 const kinds=new Set(PARKING_MARKINGS_V84.map(m=>m.kind));
 assert.deepEqual([...kinds].sort(),['crosswalk','lane','stall','stall-back','stop'].sort());
 for(const m of PARKING_MARKINGS_V84){
  assert.ok(between(m.x1,bounds.x1,bounds.x2)&&between(m.x2,bounds.x1,bounds.x2));
  assert.ok(between(m.z1,bounds.z1,bounds.z2)&&between(m.z2,bounds.z1,bounds.z2));
  assert.ok(Math.hypot(m.x2-m.x1,m.z2-m.z1)>.04);
  assert.ok(m.width<=.5,'these are painted markings, not authored 3D objects');
 }
 assert.equal(PARKING_MARKINGS_V84.filter(x=>x.kind==='crosswalk').length>=6,true,
  'service-entry crossing uses a repeated, coherent pattern');
 const stage=fs.readFileSync('opening/scene.js','utf8');
 assert.ok(stage.includes('installParkingMarkingsV84(world)'));
 assert.ok(!stage.includes('for(let x=-39;x<45;x+=6)'),'old random tilted stripe row is deleted');
});

test('outdoor decoration reuses verified existing CC0 GLBs, with no fabricated props',()=>{
 assert.equal(PARKING_PROPS_V84.length,8);
 const groupIds=new Set();
 for(const p of PARKING_PROPS_V84){
  assert.ok(!groupIds.has(p.id));groupIds.add(p.id);
  const item=models.get(p.assetId);
  assert.ok(item,'must be existing CC0 catalog asset '+p.assetId);
  assert.equal(item.license,'CC0-1.0');
  assert.match(item.sha256,/^[a-f0-9]{64}$/);
  assert.match(item.path,/^assets\/vendor\/builder\/models\/[\w/-]+\.glb$/);
  assert.ok(fs.statSync(item.path).size>128,'locally vendored source mesh '+p.assetId);
  assert.ok(between(p.x,bounds.x1,bounds.x2)&&between(p.z,bounds.z1,bounds.z2));
  assert.ok(Math.hypot(p.x-cinematicCar.x,p.z-cinematicCar.z)>11,
   'new parking dressing must not intrude into opening car shot');
  assert.ok(Math.hypot(p.x-12,p.z+19.5)>11,
   'new parking dressing must not block contractor door');
  assert.ok(p.targetHeight>0||p.targetMaxSpan>0);
 }
 assert.ok(PARKING_PROPS_V84.some(p=>p.assetId.includes('trashcan')));
 assert.ok(PARKING_PROPS_V84.some(p=>p.assetId.includes('pine-crooked')));
 assert.ok(PARKING_PROPS_V84.some(p=>p.assetId.includes('pine-fall')));
 const src=fs.readFileSync('opening/parking-props-v84.js','utf8');
 assert.ok(src.includes('GLTFLoader'),'source original third-party meshes');
 assert.ok(!/new THREE\.(BoxGeometry|CylinderGeometry|ConeGeometry|SphereGeometry)/.test(src),
  'parking props must never be invented with procedural geometry');
 const markings=fs.readFileSync('opening/parking-markings-v84.js','utf8');
 assert.ok(markings.includes('InstancedMesh'),'draw linework with low overhead');
 const exterior=fs.readFileSync('builder/exterior-scene.js','utf8');
 assert.ok(exterior.includes('V84 coherent mall parking-space and street PAINT'));
});
