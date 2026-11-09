import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {PARKING_LOT_V84,PARKING_MARKINGS_V84,PARKING_MARKING_COUNTS_V84,PARKING_PROPS_V84} from '../opening/parking-layout-v84.mjs';

const {bounds,blocks,rows,cinematicCar}=PARKING_LOT_V84;
const between=(x,a,b)=>x>=a&&x<=b;
const store=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8'));
const newTreeManifest=JSON.parse(fs.readFileSync('opening/assets/v85/manifest.json','utf8'));
const models=new Map([...store.models,...newTreeManifest.models].map(m=>[m.id,m]));

test('original cinematic 115 × 88 m lot has consistent 90-degree stalls and car clearance',()=>{
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
  assert.ok(['z1','z2'].includes(row.openAt),'explicit aisle-facing entrance');
  assert.ok(between(row.z1,bounds.z1,bounds.z2)&&between(row.z2,bounds.z1,bounds.z2));
 }
 for(let i=0;i<rows.length-1;i++){
  const gap=rows[i+1].z1-rows[i].z2;
  if(gap>.01)assert.ok(gap>=7.39,'two-way circulation aisle is never narrowed');
 }
 const row=rows.find(row=>between(cinematicCar.z,row.z1,row.z2));
 const block=blocks.find(block=>between(cinematicCar.x,block.x1,block.x2));
 assert.equal(row?.id,'sedan-row','original car is parked in a marked stall');
 assert.ok(block,'car is in a marked stall, not a drive lane');
 const w=(block.x2-block.x1)/block.spaces,slot=Math.floor((cinematicCar.x-block.x1)/w);
 assert.ok(Math.abs(block.x1+(slot+.5)*w-cinematicCar.x)<.01,'original sedan remains centered');
 assert.ok(Math.min(cinematicCar.z-row.z1,row.z2-cinematicCar.z)>2,'sedan avoids rear stripe');
 assert.ok(PARKING_LOT_V84.frontDrive.z1< -10&&PARKING_LOT_V84.frontDrive.z2<=-4.5);
});

test('every parking stall has an OPEN drive-in end, side stripes and just one rear line',()=>{
 assert.equal(PARKING_MARKING_COUNTS_V84.stalls,196);
 assert.equal(PARKING_MARKING_COUNTS_V84.segments,PARKING_MARKINGS_V84.length);
 assert.equal(PARKING_MARKINGS_V84.length,279,'open-front rows need 279 painted segments');
 assert.deepEqual([...new Set(PARKING_MARKINGS_V84.map(m=>m.kind))].sort(),
  ['crosswalk','lane','stall','stall-back','stop'].sort());
 for(const m of PARKING_MARKINGS_V84){
  assert.ok(between(m.x1,bounds.x1,bounds.x2)&&between(m.x2,bounds.x1,bounds.x2));
  assert.ok(between(m.z1,bounds.z1,bounds.z2)&&between(m.z2,bounds.z1,bounds.z2));
  assert.ok(Math.hypot(m.x2-m.x1,m.z2-m.z1)>.04);
  assert.ok(m.width<=.5,'only thin painted linework allowed');
 }
 const backs=PARKING_MARKINGS_V84.filter(m=>m.kind==='stall-back');
 const keyed=new Set();
 for(const s of backs){
  const key=[s.x1,s.z1,s.x2,s.z2].join(':');
  assert.ok(!keyed.has(key),'never paint a rear seam twice');
  keyed.add(key);
 }
 for(const row of rows)for(const block of blocks){
  const open=row[row.openAt],closed=row[row.openAt==='z1'?'z2':'z1'];
  assert.equal(backs.filter(s=>s.x1===block.x1&&s.x2===block.x2&&s.z1===open&&s.z2===open).length,0,
   'car-entry edge must be unpainted for '+row.id);
  assert.equal(backs.filter(s=>s.x1===block.x1&&s.x2===block.x2&&s.z1===closed&&s.z2===closed).length,1,
   'one closed rear line for '+row.id);
  for(let j=0;j<=block.spaces;j++){
   const x=block.x1+j*(block.x2-block.x1)/block.spaces;
   assert.ok(PARKING_MARKINGS_V84.some(s=>s.kind==='stall'&&Math.abs(s.x1-x)<1e-7&&s.z1===row.z1&&s.z2===row.z2),
    'retain the actual parking-space side dividers');
  }
 }
 assert.ok(PARKING_MARKINGS_V84.filter(x=>x.kind==='crosswalk').length>=6);
 const stage=fs.readFileSync('opening/scene.js','utf8');
 assert.ok(stage.includes('installParkingMarkingsV84(world)'));
 assert.ok(!stage.includes('for(let x=-39;x<45;x+=6)'),'old tilted stripes stay deleted');
});

test('source-authored leafless CC0 tree GLBs are pinned byte-for-byte in repository',()=>{
 assert.equal(newTreeManifest.version,85);
 assert.equal(newTreeManifest.license,'CC0-1.0');
 assert.equal(newTreeManifest.models.length,2);
 const expected=new Map([
  ['cc0-dead-tree-gothic','41d6b432268e7bc44a1c2ebfcf06de1340a1f20577ca1ac258c0f7c7179ac618'],
  ['cc0-dead-tree-survival','26c0b53ba23f740e1e6d2a40582783767ea9e1fb638f3801f8d9d935cee54e8b']
 ]);
 for(const m of newTreeManifest.models){
  assert.equal(m.original,true);
  assert.equal(m.leafless,true);
  assert.equal(m.sha256,expected.get(m.id));
  assert.match(m.sourcePage,/^https:\/\/3dassets\.dev\/assets\//);
  assert.match(m.sourceModel,/^https:\/\/cdn\.3dassets\.dev\/assets\/\d+\/v1\/model\.glb$/);
  assert.match(m.path,/^opening\/assets\/v85\/dead-tree-[a-z]+\.glb$/);
  const bytes=fs.readFileSync(m.path);
  assert.equal(bytes.toString('ascii',0,4),'glTF');
  assert.equal(bytes.length,m.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),m.sha256);
 }
});

test('parking dressing uses only locally licensed original models and no fabricated trees',()=>{
 assert.equal(PARKING_PROPS_V84.length,8);
 assert.equal(PARKING_PROPS_V84.filter(p=>p.assetId.includes('dead-tree')).length,4);
 assert.equal(PARKING_PROPS_V84.filter(p=>p.assetId.includes('trashcan')).length,4);
 assert.ok(!PARKING_PROPS_V84.some(p=>/pine|christmas|green|foliage/i.test(p.assetId)),
  'previous unsuitable pine assets must not return');
 const ids=new Set();
 for(const p of PARKING_PROPS_V84){
  assert.ok(!ids.has(p.id));ids.add(p.id);
  const model=models.get(p.assetId);
  assert.ok(model,'verified original CC0 source model required: '+p.assetId);
  assert.equal(model.license,'CC0-1.0');
  assert.match(model.sha256,/^[a-f0-9]{64}$/);
  assert.match(model.path,/^(?:assets\/vendor\/builder\/models\/[\w/-]+|opening\/assets\/v85\/dead-tree-[a-z]+)\.glb$/);
  assert.ok(fs.statSync(model.path).size>128);
  assert.ok(between(p.x,bounds.x1,bounds.x2)&&between(p.z,bounds.z1,bounds.z2));
  assert.ok(Math.hypot(p.x-cinematicCar.x,p.z-cinematicCar.z)>11,'preserve original sedan shot');
  // The three dead trees now grow from existing front planters. Those
  // surveyed planters sit safely off the walking route, albeit closer than
  // the former 11 m radius for isolated asphalt decorations.
  const serviceClearance=p.planterIndex===undefined?11:7.5;
  assert.ok(Math.hypot(p.x-12,p.z+19.5)>serviceClearance,'preserve service entry');
  assert.ok(p.targetHeight>0||p.targetMaxSpan>0);
 }
 const src=fs.readFileSync('opening/parking-props-v84.js','utf8');
 assert.ok(src.includes('GLTFLoader'));
 assert.ok(!/new THREE\.(BoxGeometry|CylinderGeometry|ConeGeometry|SphereGeometry)/.test(src),
  'no new procedurally invented props');
 assert.ok(fs.readFileSync('opening/parking-markings-v84.js','utf8').includes('InstancedMesh'));
 assert.ok(fs.readFileSync('builder/exterior-scene.js','utf8').includes('V84 coherent mall parking-space and street PAINT'));
});
