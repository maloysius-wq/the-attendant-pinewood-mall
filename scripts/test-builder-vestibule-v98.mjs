import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three/build/three.module.js';
import {validateVestibuleManifestV98,registerVestibuleCatalogV98} from '../builder/vestibule-catalog-v98.mjs';
import {isDecalV97,wallDecalQuaternionV97} from '../builder/decals-v97.js';
import {validateDecalManifestV97} from '../builder/decals-v97.js';
import {createEmptyDraft,reduceDraft,validateDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';

const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/vestibule-v98/manifest-v98.json','utf8'));
const v97=JSON.parse(fs.readFileSync('assets/vendor/builder/decals-v97/manifest-v97.json','utf8'));
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');

test('19 actual local GLB models and 36 transparent ceiling/web/poster textures have source hashes',()=>{
 const {models,decals}=validateVestibuleManifestV98(manifest);
 assert.equal(models.length,19);
 assert.equal(decals.length,36);
 assert.equal(models.filter(m=>m.license==='CC0-1.0').length,19);
 assert.equal(models.filter(m=>m.license==='Original-Pinewood').length,0,'all original primitive-made contractor GLBs replaced');
 assert.equal(decals.filter(d=>d.category==='Wall Notices & Advertising').length,28);
 assert.equal(decals.filter(d=>d.category==='Cobwebs & Ceiling Dust').length,8);
 assert.equal(decals.filter(d=>d.surface==='ceiling').length,5);
 assert.ok(models.some(m=>/forklift/.test(m.id)));
 assert.ok(models.some(m=>/manual-pallet-jack/.test(m.id)));
 assert.equal(models.filter(m=>m.sourceProvider==='Innerscene').length,6);
 assert.equal(models.filter(m=>m.sourceProvider==='Poly Haven').length,4);
 assert.ok(models.filter(m=>m.sourceProvider).every(m=>m.sourceFiles?.length>0&&m.skipMaterialEnhancement===true),'ten new external source files are pinned and source materials preserved');
 assert.ok(models.some(m=>/wood-pallet/.test(m.id)));
 assert.ok(decals.some(d=>/calendar/.test(d.id)));
 assert.ok(decals.some(d=>/whiteboard/.test(d.id)));
 assert.ok(decals.some(d=>/bulletin/.test(d.id)));
 assert.ok(decals.some(d=>/advert/.test(d.id)));
 const paths=new Set();
 for(const m of models){
  const buffer=fs.readFileSync(m.path);
  assert.equal(buffer.length,m.bytes,m.id);
  assert.equal(digest(buffer),m.sha256,m.id);
  assert.equal(buffer.toString('ascii',0,4),'glTF',m.id);
  assert.ok(m.targetHeight>.1);
  paths.add(m.path);
 }
 for(const d of decals){
  const buffer=fs.readFileSync(d.path);
  assert.equal(buffer.length,d.bytes,d.id);
  assert.equal(digest(buffer),d.sha256,d.id);
  assert.equal(buffer.toString('hex',0,8),'89504e470d0a1a0a',d.id);
  assert.equal(buffer[25],6,'RGBA transparency for '+d.id);
  assert.equal(isDecalV97(d),true,'ceiling and wall images use exact surface system');
  paths.add(d.path);
 }
 assert.equal(paths.size,55,'each art or model file is unique');
 assert.equal(validateDecalManifestV97(v97).length,36,'old licensed CC0 decal entries unchanged');
 const index=new Map(),catalog=[];
 assert.deepEqual(registerVestibuleCatalogV98(manifest,catalog,index),{models:19,decals:36});
 assert.equal(index.size,55);
 assert.throws(()=>registerVestibuleCatalogV98(manifest,catalog,index),/Duplicate pinned vestibule asset/);
});
test('invalid external links, licenses, alpha, and paths rejected before appearing in Builder',()=>{
 const copy=()=>JSON.parse(JSON.stringify(manifest));
 for(const f of [
  m=>{m.models[0].path='https://example.com/pallet.glb'},
  m=>{m.models[0].license='unknown'},
  m=>{m.models[9].originalAuthor='Outside source'},
  m=>{m.models[9].sourceProvider='Unknown vendor'},
  m=>{m.models[9].sourceFiles[0].sha256='0'.repeat(64)},
  m=>{m.models[9].skipMaterialEnhancement=false},
  m=>{m.decals[0].surface='roof-not-a-real-surface'},
  m=>{m.decals[0].path='https://example.com/poster.png'},
  m=>{m.decals[29].sha256='oops'}
 ]){
  const m=copy();f(m);
  assert.throws(()=>validateVestibuleManifestV98(m),/Unsafe|Unpinned/);
 }
});
test('actual ceiling-down and wall normals maintain correct surface decal orientation',()=>{
 for(const n of [new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,-1),new THREE.Vector3(1,0,0)]){
  const q=wallDecalQuaternionV97(n,.37);
  const actual=new THREE.Vector3(0,0,1).applyQuaternion(q);
  assert.ok(actual.distanceTo(n)<.000001);
 }
});
test('new and old saved layouts and optional opacity remain reversible v1-compatible',()=>{
 const {models,decals}=validateVestibuleManifestV98(manifest);
 const original=createEmptyDraft();
 assert.deepEqual(validateDraft(original,[...models,...decals]),[]);
 const floor=decals.find(d=>d.surface==='ceiling');
 const c={id:'ceiling-cobweb-ci',catalogId:floor.id,
  position:{x:2,y:2.9,z:10},rotation:{x:-Math.PI/2,y:0,z:0},scale:1,opacity:.46};
 let draft=reduceDraft(original,{type:'place',instance:c});
 draft=reduceDraft(draft,{type:'place',instance:{id:'pallet-ci',catalogId:models[0].id,
  position:{x:2,y:0,z:9},rotation:{x:0,y:0,z:0},scale:1}});
 assert.deepEqual(validateDraft(draft,[...models,...decals]),[]);
 assert.deepEqual(importDraft(exportDraft(draft),[...models,...decals]),draft);
 const next=reduceDraft(draft,{type:'transform',id:c.id,opacity:.34});
 assert.equal(next.added[0].opacity,.34);
 assert.equal(draft.added[0].opacity,.46);
});
