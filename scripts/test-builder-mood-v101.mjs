import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three/build/three.module.js';
import {validateMoodV101,registerMoodV101} from '../builder/mood-catalog-v101.mjs';
import {makeCalendarPaperV101,ageRealPlantV101} from '../builder/mood-materials-v101.mjs';
import {isGrimeDecalV101} from '../builder/decal-visibility-v101.mjs';
import {createEmptyDraft,reduceDraft,validateDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';

const root='assets/vendor/builder/mood-v101/';
const manifest=JSON.parse(fs.readFileSync(root+'manifest-v101.json','utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const {plants,calendars}=validateMoodV101(manifest);
test('publisher source GLB mesh and image texture anatomy, local hashes, no new models',()=>{
 assert.equal(plants.length,4);
 assert.equal(plants.filter(p=>p.plantCondition==='browning').length,1);
 for(const p of plants){
  const data=fs.readFileSync(p.path);
  assert.equal(hash(data),p.sha256,p.id);
  assert.equal(data.length,p.bytes);
  assert.equal(data.toString('ascii',0,4),'glTF');
  assert.equal(data.readUInt32LE(4),2);
  assert.equal(data.readUInt32LE(8),data.length);
  const j=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)));
  assert.equal(j.meshes.length,p.sourceMeshCount);
  assert.equal(j.images.length,p.sourceImageCount);
  assert.ok(j.images.length>=1,'source CC0 PBR map not fabricated');
  assert.equal(p.sourceSHA256,p.sha256);
 }
 assert.equal(plants[0].sha256,plants[3].sha256,
  'browning plant is a non-destructive version of the same actual source GLB');
 assert.equal(new Set(plants.map(x=>x.sha256)).size,3);
});
test('four dated 1997 wall calendars based on pinned real public-domain/CC0 photographs',()=>{
 assert.equal(calendars.length,4);
 assert.equal(calendars.filter(c=>c.calendarStyle==='commercial').length,2);
 assert.equal(calendars.filter(c=>c.calendarStyle==='personal').length,2);
 for(const c of calendars){
  const b=fs.readFileSync(c.path);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(hash(b),c.sha256,c.id);
  const g=makeCalendarPaperV101(THREE,c);
  assert.ok(g.attributes.position.count>100);
  assert.ok(g.attributes.position.array.some((z,i)=>i%3===2&&z>.01));
  assert.equal(g.userData.builderCalendarPaperV101,true);
  g.dispose();
 }
 assert.equal(manifest.sources.length,2);
 for(const s of manifest.sources)assert.equal(hash(fs.readFileSync(s.sourcePath)),s.sha256);
});
test('withered physical leaves inherit authentic source texture instead of generated foliage',()=>{
 const g=new THREE.Group();
 const foliage=new THREE.Mesh(new THREE.BoxGeometry(.2,.7,.2),new THREE.MeshStandardMaterial({
  name:'Leaves',color:0xffffff,roughness:.3,map:new THREE.Texture()}));
 foliage.position.y=.5;foliage.name='potted_plant_04_leaves';g.add(foliage);
 const pot=new THREE.Mesh(new THREE.BoxGeometry(.3,.15,.3),new THREE.MeshStandardMaterial({name:'Pot',color:0xffffff}));
 pot.position.y=.02;g.add(pot);
 const originalMap=foliage.material.map;
 ageRealPlantV101(THREE,g,'mood-v101-browning-haworthia');
 assert.equal(foliage.material.map,originalMap);
 assert.equal(foliage.material.userData.sourceVegetationBrowningV101,true);
 assert.equal(pot.material.color.getHex(),0xffffff,'genuine pot preserved');
 assert.equal(g.userData.builderBrowningPlantV101,true);
});
test('source-backed surface stamps retain v1 save and opacity compatibility',()=>{
 const index=new Map(),catalog=[];
 assert.deepEqual(registerMoodV101(manifest,catalog,index),{models:4,wallCalendars:4});
 let d=createEmptyDraft();
 for(const [i,c] of [plants[0],plants[3],calendars[0],calendars[3]].entries())
  d=reduceDraft(d,{type:'place',instance:{id:'ci-mood-'+i,catalogId:c.id,
   position:{x:12+i,y:1,z:8},rotation:{x:0,y:0,z:0},scale:1,...(c.surface==='wall'?{opacity:.82}:{})}});
 assert.deepEqual(validateDraft(d,catalog),[]);
 assert.deepEqual(importDraft(exportDraft(d),catalog),d);
});
test('only real ambientCG image decals need visibility rescue',()=>{
 assert.equal(isGrimeDecalV101({category:'Surface Decals & Grime',
  path:'assets/vendor/builder/decals-v97/dust-floor-soft.png'}),true);
 assert.equal(isGrimeDecalV101(calendars[0]),false);
 assert.equal(isGrimeDecalV101({category:'Peeling Posters & Paper',
  path:'assets/vendor/builder/wall-decay-v100/posters/top-corner-peel.png'}),false);
});
test('tampered original plant source or calendar licensing is rejected',()=>{
 for(const modify of [
  m=>m.plants[0].sha256='0'.repeat(64),
  m=>m.plants[2].path='https://remote.example/plant.glb',
  m=>m.calendars[1].license='unknown',
  m=>m.calendars[2].year=2026,
  m=>m.sources[0].author='Unknown',
  m=>m.plants[3].variationOf='synthetic mesh'
 ]){
  const m=structuredClone(manifest);modify(m);
  assert.throws(()=>validateMoodV101(m));
 }
});
