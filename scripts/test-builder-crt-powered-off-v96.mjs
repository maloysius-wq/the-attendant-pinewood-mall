import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three/build/three.module.js';
import {CRT_SOURCE_ID_V96,makeCrtPoweredOffV96} from '../builder/crt-powered-off-v96.js';

const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/era-catalog-v87.json','utf8'));
const crt=manifest.models.find(m=>m.id===CRT_SOURCE_ID_V96);
assert.ok(crt,'the v87 CRT model must remain in source catalog');
const bytes=fs.readFileSync(crt.path);
const source=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));

test('only an existing licensed, SHA-pinned original CRT gets a powered-off glass finish',()=>{
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),crt.sha256);
 assert.equal(bytes.length,crt.bytes);
 assert.equal(source.images.length,20,'all source texture images remain preserved');
 assert.equal(source.meshes.length,12);
 const names=source.materials.map(m=>m.name);
 for(const name of ['Monitor_Cream','Monitor_Glass','Ucupaint_Keyboard_Creme',
  'Mouse_Cream','PC_Front_Cream','PC_Cream'])assert.ok(names.includes(name),name);
 assert.equal(names.filter(m=>m==='Monitor_Glass').length,1);
 assert.ok(source.meshes.some(m=>m.name==='Monitor_Reflection'));
 for(const name of ['Ucupaint_Keyboard_Creme','Mouse_Cream','Monitor_Cream','PC_Front_Cream','PC_Cream']){
  const m=source.materials.find(x=>x.name===name);
  assert.ok(m.pbrMetallicRoughness.baseColorTexture,'original '+name+' texture map retained in source GLB');
 }
});
test('separate display and baked reflection are dark/off while all other model materials remain unchanged',()=>{
 const root=new THREE.Group();
 const greenTexture=new THREE.Texture(),caseTexture=new THREE.Texture(),keyTexture=new THREE.Texture();
 const sourceGlass=new THREE.MeshStandardMaterial({
  name:'Monitor_Glass',map:greenTexture,color:0x39ff77,
  emissive:0x00ff00,emissiveIntensity:2,emissiveMap:greenTexture
 });
 const glass=new THREE.Mesh(new THREE.PlaneGeometry(1,.8),sourceGlass);
 glass.name='Object_2';
 const reflection=new THREE.Mesh(new THREE.PlaneGeometry(1,.8),
  new THREE.MeshStandardMaterial({name:'DefaultMaterial',color:0x99ff99}));
 reflection.name='Additional_Reflection';
 reflection.geometry.name='Monitor_Reflection';
 const caseMaterial=new THREE.MeshStandardMaterial({name:'Monitor_Cream',map:caseTexture});
 const keyboardMaterial=new THREE.MeshStandardMaterial({name:'Ucupaint_Keyboard_Creme',map:keyTexture});
 const mouseMaterial=new THREE.MeshStandardMaterial({name:'Mouse_Cream',map:keyTexture});
 const casing=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),caseMaterial);
 const keyboard=new THREE.Mesh(new THREE.BoxGeometry(.4,.1,.2),keyboardMaterial);
 const mouse=new THREE.Mesh(new THREE.BoxGeometry(.15,.1,.1),mouseMaterial);
 root.add(glass,reflection,casing,keyboard,mouse);
 const response=makeCrtPoweredOffV96(root,CRT_SOURCE_ID_V96);
 assert.deepEqual(response,{screenFaces:1,reflectionsHidden:1,unchanged:false});
 assert.equal(reflection.visible,false);
 assert.equal(reflection.userData.builderCrtReflectionDisabledV96,true);
 const off=glass.material;
 assert.notEqual(off,sourceGlass,'do not mutate shared source glTF material');
 assert.equal(off.name,'Monitor_Glass_PoweredOff');
 assert.equal(off.userData.builderCrtPoweredOffV96,true);
 assert.equal(off.map,null);
 assert.equal(off.emissiveMap,null);
 assert.equal(off.alphaMap,null);
 assert.equal(off.transparent,false);
 assert.equal(off.opacity,1);
 assert.equal(off.metalness,0);
 assert.equal(off.emissive.getHex(),0x000000);
 assert.ok(off.color.getHex()<0x303030,'a real near-black glass surface with no green pixels');
 assert.equal(sourceGlass.map,greenTexture,'original green source asset remains unmodified');
 assert.equal(sourceGlass.emissiveMap,greenTexture);
 assert.equal(sourceGlass.emissive.getHex(),0x00ff00);
 assert.equal(casing.material,caseMaterial,'casing intact');
 assert.equal(keyboard.material,keyboardMaterial,'original keyboard intact');
 assert.equal(mouse.material,mouseMaterial,'original mouse intact');
 assert.equal(keyboard.material.map,keyTexture);
 assert.equal(mouse.material.map,keyTexture);
 assert.deepEqual(makeCrtPoweredOffV96(casing,'old-pc-compact-tower'),
  {screenFaces:0,reflectionsHidden:0,unchanged:true});
 for(const m of [sourceGlass,caseMaterial,keyboardMaterial,mouseMaterial,off,reflection.material])m.dispose();
 for(const mesh of [glass,reflection,casing,keyboard,mouse])mesh.geometry.dispose();
 greenTexture.dispose();caseTexture.dispose();keyTexture.dispose();
});
test('fail closed if a future third-party CRT alters its screen or reflection anatomy',()=>{
 const missing=new THREE.Group(),screen=new THREE.Mesh(new THREE.PlaneGeometry(1,1),
  new THREE.MeshStandardMaterial({name:'Monitor_Glass'}));
 missing.add(screen);
 assert.throws(()=>makeCrtPoweredOffV96(missing,CRT_SOURCE_ID_V96),
  /expected one Monitor_Glass and one reflection/);
 screen.geometry.dispose();screen.material.dispose();
});
