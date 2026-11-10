import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three/build/three.module.js';
import {CARDBOARD_MAPS_V93,cardboardMaterialRoleV93,isCardboardBoxV93} from '../builder/cardboard-materials-v93.mjs';
import {materialRoleV91,boxProjectFurnitureUVV92} from '../builder/prop-materials-v91.js';
import {isSourcePeripheralV93,isolateSourcePeripheralV93} from '../builder/source-peripherals-v93.mjs';
const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/materials-v93/manifest-v93.json','utf8'));
const catalog=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8')).models;
const era=JSON.parse(fs.readFileSync('assets/vendor/builder/era-catalog-v87.json','utf8')).models;
const source=id=>{
 const model=[...catalog,...era].find(m=>m.id===id);
 assert.ok(model,'pinned source model '+id);
 const bytes=fs.readFileSync(model.path);
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 assert.equal(bytes.length,model.bytes);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),model.sha256);
 return JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
};
test('two real 1K cardboard images are CC0 and exact SHA-256 pinned from official ambientCG source archives',()=>{
 assert.equal(manifest.version,93);
 assert.equal(manifest.materials.length,2);
 assert.equal(manifest.license,'CC0-1.0');
 assert.deepEqual(new Set(manifest.materials.map(x=>x.kind)),new Set(['worn','clean']));
 for(const entry of manifest.materials){
  const bytes=fs.readFileSync(entry.path);
  assert.equal(bytes.length,entry.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);
  assert.equal(bytes[0],255);assert.equal(bytes[1],216);
  assert.equal(bytes.at(-2),255);assert.equal(bytes.at(-1),217);
  assert.equal(entry.license,'CC0-1.0');
  assert.match(entry.sourcePage,/^https:\/\/ambientcg\.com\/view\?id=Cardboard00[12]$/);
  assert.match(entry.downloadSource,/^https:\/\/ambientcg\.com\/get\?file=Cardboard00[12]_1K-JPG\.zip$/);
  assert.match(entry.sourceZipSha256,/^[a-f0-9]{64}$/);
  assert.ok(entry.sourceZipBytes>200000);
 }
 for(const path of Object.values(CARDBOARD_MAPS_V93)){
  assert.match(path,/^assets\/vendor\/builder\/materials-v93\/cardboard_(?:worn|clean)_color_1k\.jpg$/);
  assert.ok(manifest.materials.some(x=>x.path===path));
 }
});
test('real open and closed cardboard source models must NEVER receive wood grain',()=>{
 for(const [kind,id,expected] of [
  ['open','kenney-furniture-kit-cardboardboxopen','cardboardWorn'],
  ['closed','kenney-furniture-kit-cardboardboxclosed','cardboardClean']
 ]){
  const gltf=source(id);
  assert.equal(isCardboardBoxV93('Mesh cardboardBox'+kind),true);
  assert.equal(gltf.images?.length??0,0);
  assert.equal((gltf.meshes||[]).length,1);
  assert.deepEqual(gltf.materials.map(m=>m.name),['wood','woodDark']);
  for(const material of gltf.materials){
   assert.equal(cardboardMaterialRoleV93(material.name,id),expected);
   assert.equal(materialRoleV91(material.name,id+' Mesh cardboardBox'+kind),expected);
   assert.ok(CARDBOARD_MAPS_V93[expected]);
  }
  assert.equal(gltf.meshes[0].primitives.length,2);
  assert.equal(gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION].count,88);
 }
 assert.equal(cardboardMaterialRoleV93('wood','Desk'),null,'real wooden desks stay wood');
 assert.equal(cardboardMaterialRoleV93('metal','cardboardBoxOpen'),null,'never restyle unrelated materials');
});
test('wide-panel box mapping is <=.82 tile per face and never modifies source vertices',()=>{
 const g=new THREE.BoxGeometry(.58,.50,.58);
 const orig=[...g.getAttribute('position').array];
 const projected=boxProjectFurnitureUVV92(g,{repeatsAcrossLongest:.82});
 assert.deepEqual([...g.getAttribute('position').array],orig);
 assert.equal(projected.userData.builderFurnitureUVV92,true);
 assert.equal(projected.userData.builderPatternRepeatsV92,.82);
 let lo=Infinity,hi=-Infinity;
 const uv=projected.getAttribute('uv');
 for(let i=0;i<uv.count;i++){lo=Math.min(lo,uv.getX(i));hi=Math.max(hi,uv.getX(i))}
 assert.ok(hi-lo<=.821,'full cardboard panel uses about one photo, no tiny stamps');
 g.dispose();projected.dispose();
});
test('keyboard and mouse use isolated exact original Kenney materials and geometry',()=>{
 for(const [id,materials,verts] of [
  ['kenney-furniture-kit-computerkeyboard',['metalDark','metalMedium'],38],
  ['kenney-furniture-kit-computermouse',['metalDark'],113]
 ]){
  const gltf=source(id);
  assert.equal(gltf.images?.length??0,0);
  assert.deepEqual(gltf.materials.map(m=>m.name),materials);
  assert.equal(gltf.accessors[gltf.meshes[0].primitives[0].attributes.POSITION].count,verts);
  assert.equal(isSourcePeripheralV93(id),true);
  const positions=[...new THREE.BoxGeometry(.2,.06,.12).getAttribute('position').array];
  const original=new THREE.Mesh(new THREE.BoxGeometry(.2,.06,.12),
   gltf.materials.map(m=>new THREE.MeshStandardMaterial({
    name:m.name,color:new THREE.Color().setRGB(...m.pbrMetallicRoughness.baseColorFactor.slice(0,3)),
    roughness:m.pbrMetallicRoughness.roughnessFactor??1,
    metalness:m.pbrMetallicRoughness.metallicFactor??0
   })));
  const root=new THREE.Group();root.add(original);
  const mats=original.material,geo=original.geometry;
  assert.equal(isolateSourcePeripheralV93(root,id),1);
  assert.notEqual(original.geometry,geo,'original mesh geometry is isolated');
  assert.ok(original.material.every((m,i)=>m!==mats[i]),'original mats cloned, never shared');
  assert.deepEqual([...original.geometry.getAttribute('position').array],positions);
  assert.deepEqual(original.material.map(x=>x.color.toArray()),
   mats.map(x=>x.color.toArray()),'exact original RGB values');
  assert.ok(original.material.every(x=>!x.map));
  assert.equal(original.userData.builderOriginalPeripheralV93,true);
  geo.dispose();original.geometry.dispose();
  for(const m of [...mats,...original.material])m.dispose();
 }
 assert.equal(isSourcePeripheralV93('retro-crt-pc-1990s'),false,
  'do not strip real painted original keyboard/mouse textures from CRT bundle');
 const crt=source('retro-crt-pc-1990s');
 for(const n of ['Ucupaint_Keyboard_Creme','Mouse_Cream']){
  const m=crt.materials.find(x=>x.name===n);
  assert.ok(m?.pbrMetallicRoughness?.baseColorTexture,'preserve detailed CRT source accessory map '+n);
 }
 assert.equal(crt.images.length,20,'all 20 source CRT images retained');
});
