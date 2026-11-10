import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three/build/three.module.js';
import {validateDecalManifestV97,registerDecalCatalogV97,wallDecalQuaternionV97} from '../builder/decals-v97.js';
import {isBroadSurfacePropV97} from '../builder/material-scale-v92.mjs';
import {boxProjectFurnitureUVV92,materialRoleV91} from '../builder/prop-materials-v91.js';
import {createEmptyDraft,reduceDraft,validateDraft} from '../mall/editor-schema-v1.mjs';

const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/decals-v97/manifest-v97.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8')).models;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const gltfOf=id=>{
 const m=catalog.find(x=>x.id===id);assert.ok(m,id);
 const b=fs.readFileSync(m.path);
 assert.equal(hash(b),m.sha256,'original GLB unchanged '+id);
 assert.equal(b.toString('ascii',0,4),'glTF');
 return JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
};
test('36 local RGBA grime decals derive from seven individually verified CC0 source archives',()=>{
 const entries=validateDecalManifestV97(manifest);
 assert.equal(entries.length,36);
 assert.equal(manifest.sources.length,7);
 assert.ok(entries.filter(e=>e.surface==='floor').length>=20);
 assert.ok(entries.filter(e=>e.surface==='wall').length>=12);
 for(const src of manifest.sources){
  assert.equal(src.license,'CC0-1.0');
  assert.match(src.archiveMemberSHA256,/^[a-f0-9]{64}$/);
  assert.match(src.downloadSHA256,/^[a-f0-9]{64}$/);
  assert.ok(src.downloadBytes>50000);
 }
 for(const asset of entries){
  const bytes=fs.readFileSync(asset.path);
  assert.equal(bytes.length,asset.bytes);
  assert.equal(hash(bytes),asset.sha256);
  assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a','transparent PNG header');
  assert.equal(bytes[25],6,'RGBA color type includes the alpha mask');
  assert.ok(asset.width>.25&&asset.height>.25);
 }
 const index=new Map(),models=[];
 assert.equal(registerDecalCatalogV97(manifest,models,index),36);
 assert.equal(models.length,36);
 assert.equal(index.size,36);
 assert.throws(()=>registerDecalCatalogV97(manifest,models,index),/Duplicate decal/);
 const altered=JSON.parse(JSON.stringify(manifest));
 altered.decals[0].path='https://external.invalid/grime.png';
 assert.throws(()=>validateDecalManifestV97(altered),/Unverified local decal/);
});
test('floor decals remain horizontal and wall decals orient to the actual hit surface',()=>{
 for(const normal of [new THREE.Vector3(0,0,-1),new THREE.Vector3(-1,0,0),
  new THREE.Vector3(.71,0,-.71).normalize()]){
  const q=wallDecalQuaternionV97(normal,.32);
  const transformed=new THREE.Vector3(0,0,1).applyQuaternion(q);
  assert.ok(transformed.distanceTo(normal)<1e-6,'wall decal faces wall normal');
 }
});
test('grime opacity is a backward-compatible optional field in v1 editor drafts',()=>{
 const choices=validateDecalManifestV97(manifest);
 const old=createEmptyDraft(),decal=choices[0];
 const instance={id:'ci-dust-decal',catalogId:decal.id,
  position:{x:0,y:.018,z:0},rotation:{x:0,y:0,z:0},scale:1,opacity:.52};
 const next=reduceDraft(old,{type:'place',instance});
 assert.deepEqual(validateDraft(next,choices),[]);
 assert.equal(next.version,1);
 const after=reduceDraft(next,{type:'transform',id:'ci-dust-decal',opacity:.34});
 assert.equal(after.added[0].opacity,.34);
 assert.equal(next.added[0].opacity,.52,'reversible snapshots immutable');
 const oldStyle={...instance};delete oldStyle.opacity;
 assert.deepEqual(validateDraft({...old,added:[oldStyle]},choices),[],'older drafts still accepted');
 for(const opacity of [-1,.01,1.1,null]){
  const invalid={...next,added:[{...instance,opacity}]};
  assert.match(validateDraft(invalid,choices).join(' '),/opacity/);
 }
});
test('the exact source garbage can and kitchen coffee machine now use broad UV projection',()=>{
 for(const [id,label] of [
  ['kenney-furniture-kit-trashcan','Trashcan'],
  ['kenney-furniture-kit-kitchencoffeemachine','Kitchencoffeemachine']]){
  assert.equal(isBroadSurfacePropV97(label),true);
  assert.equal(isBroadSurfacePropV97(id),true);
  const g=gltfOf(id);
  const names=g.materials.map(m=>m.name);
  assert.ok(names.length>0,'original real source materials preserved');
  console.log('PINEWOOD_V97_TEXTURE_SOURCE '+JSON.stringify({id,names,
   roles:names.map(name=>materialRoleV91(name,label)),
   meshes:g.meshes.map(m=>({name:m.name,primitives:m.primitives.length}))}));
  assert.ok(names.some(name=>materialRoleV91(name,label)),'model has semantic texture surface');
 }
 const geo=new THREE.BoxGeometry(.8,1.4,.65);
 const broad=boxProjectFurnitureUVV92(geo,{repeatsAcrossLongest:.92});
 assert.equal(broad.userData.builderFurnitureUVV92,true);
 assert.equal(broad.userData.builderPatternRepeatsV92,.92);
 geo.dispose();broad.dispose();
});
