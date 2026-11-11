import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {validateWallDecayV100,registerWallDecayV100} from '../builder/wall-decay-v100.mjs';
import {makePeelingPosterGeometryV100,weatherSourceBoardV100} from '../builder/peeling-poster-v100.mjs';
import {createEmptyDraft,reduceDraft,validateDraft,importDraft,exportDraft} from '../mall/editor-schema-v1.mjs';
const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/wall-decay-v100/manifest-v100.json'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
test('exact two published independently sourced boards retain original GLB meshes and maps',()=>{
 const {models,posters}=validateWallDecayV100(manifest);
 assert.equal(models.length,2);assert.equal(posters.length,6);
 for(const m of models){
  const b=fs.readFileSync(m.path);
  assert.equal(b.length,m.bytes,m.id);
  assert.equal(hash(b),m.sha256,m.id);
  assert.equal(b.toString('ascii',0,4),'glTF');
  assert.equal(b.readUInt32LE(8),b.length);
  const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());
  assert.equal(j.meshes.length,m.sourceMeshCount);
  assert.equal(j.images.length,m.sourceImageCount);
  assert.ok(j.images.length>0);
  assert.equal(j.materials.length,m.sourceMaterialCount);
  assert.equal(m.sourceSHA256,m.sha256,'source GLB bytes are unchanged');
  assert.match(m.originalSource,/^https:\/\/grab3d\.com\/models\/furniture\//);
 }
 assert.equal(models.map(x=>x.id).join(','),'v100-vintage-office-whiteboard,v100-aged-cork-bulletin-board');
});
test('six distinct weathered CC0 poster sources are alpha-masked and truly curl outward',()=>{
 const {posters}=validateWallDecayV100(manifest);
 const hashes=new Set(),curls=new Set();
 for(const p of posters){
  const b=fs.readFileSync(p.path);
  assert.equal(b.length,p.bytes);
  assert.equal(hash(b),p.sha256);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(b[25],6,'RGBA poster with torn transparent edges');
  const g=makePeelingPosterGeometryV100(THREE,p);
  assert.ok(g.attributes.position.count>100);
  assert.ok(g.userData.maxCurlMeters>.008);
  hashes.add(p.sha256);curls.add(p.peelStyle);
  g.dispose();
 }
 assert.equal(hashes.size,6);assert.equal(curls.size,6);
 const src=manifest.sources[0];
 assert.equal(hash(fs.readFileSync(src.sourcePath)),src.sha256);
 assert.equal(fs.statSync(src.sourcePath).size,src.bytes);
});
test('original model source PBR maps are aged, not erased or replaced',()=>{
 const root=new THREE.Group();
 const old=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({
  color:0xffffff,roughness:.1,map:new THREE.Texture()
 }));
 root.add(old);const map=old.material.map;
 weatherSourceBoardV100(root,'v100-vintage-office-whiteboard');
 assert.equal(old.material.map,map);
 assert.equal(old.material.userData.weatheredSourceV100,true);
 assert.ok(old.material.roughness>=.65);
 assert.ok(root.userData.weatheredSourceV100);
 root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
});
test('existing save schema stores/remembers new GLB props and wall peeling states',()=>{
 const {models,posters}=validateWallDecayV100(manifest);
 const index=new Map(),catalog=[];
 assert.deepEqual(registerWallDecayV100(manifest,catalog,index),{models:2,posters:6});
 const empty=createEmptyDraft();
 let draft=reduceDraft(empty,{type:'place',instance:{id:'demo-board',catalogId:models[0].id,
  position:{x:12,y:0,z:11},rotation:{x:0,y:0,z:0},scale:1}});
 draft=reduceDraft(draft,{type:'place',instance:{id:'demo-poster',catalogId:posters[2].id,
  position:{x:12,y:1.7,z:11},rotation:{x:0,y:0,z:0},scale:1,opacity:.6}});
 assert.deepEqual(validateDraft(draft,catalog),[]);
 assert.deepEqual(importDraft(exportDraft(draft),catalog),draft);
 assert.equal(draft.added[1].opacity,.6);
});
test('tampered license/URL/external path/peel source are blocked',()=>{
 const clone=()=>structuredClone(manifest);
 for(const edit of [
  m=>m.models[0].path='https://example.net/whiteboard.glb',
  m=>m.models[1].license='unknown',
  m=>m.models[0].sourceSHA256='0'.repeat(64),
  m=>m.posters[0].path='https://bad-domain/poster.png',
  m=>m.posters[1].peelStyle='fake-prop',
  m=>m.sources[0].license='license unknown'
 ]){
  const m=clone();edit(m);
  assert.throws(()=>validateWallDecayV100(m));
 }
});
