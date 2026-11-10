import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from '../vendor/three/build/three.module.js';
import {ROOM_FINISHES_V87} from '../builder/room-finishes-options-v87.mjs';
import {PROP_MATERIALS_V91,ROOM_MATERIALS_V91} from '../builder/material-options-v91.mjs';
import {materialRoleV91,boxProjectMissingUVV91} from '../builder/prop-materials-v91.js';

const manifest=JSON.parse(fs.readFileSync('assets/vendor/builder/materials-v91/manifest-v91.json','utf8'));
const original=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8'));
const index=JSON.parse(fs.readFileSync('assets/vendor/builder/material-index-v1.json','utf8'));
const parseGlb=path=>{
 const b=fs.readFileSync(path);
 assert.equal(b.toString('ascii',0,4),'glTF');
 return JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
};
test('50 locally pinned Poly Haven CC0 materials have exact hashes, playable role mapping and no remote runtime fetches',()=>{
 assert.equal(manifest.version,91);
 assert.equal(manifest.materialCount,50);
 assert.equal(manifest.materials.length,50);
 assert.ok(manifest.sourceApi.startsWith('https://api.polyhaven.com/'));
 const allowed=new Map(manifest.materials.map(x=>[x.path,x]));
 assert.equal(allowed.size,manifest.materials.length);
 for(const record of manifest.materials){
  assert.match(record.path,/^assets\/vendor\/builder\/materials-v91\/[a-z0-9_]+_diff_1k\.jpg$/);
  const image=fs.readFileSync(record.path);
  assert.equal(image.length,record.bytes,record.id);
  assert.equal(crypto.createHash('sha256').update(image).digest('hex'),record.sha256,record.id);
  assert.equal(record.license,'CC0-1.0');
  assert.equal(record.source,'https://polyhaven.com/a/'+record.id);
  assert.equal(image[0],0xff);assert.equal(image[1],0xd8);
 }
 const totals={};
 for(const part of ['wall','floor','ceiling']){
  const set=ROOM_MATERIALS_V91[part];
  const ids=new Set(set.map(x=>x.id));
  assert.equal(set.length,ids.size,part+' duplicate ID');
  assert.equal(set.length,{wall:20,floor:13,ceiling:8}[part]);
  for(const option of set){
   assert.ok(allowed.has(option.path),part+'/'+option.id);
   assert.ok(ROOM_FINISHES_V87[part].some(x=>x.id===option.id),part+'/'+option.id+' not in UI/schema');
  }
  totals[part]=set.length;
 }
 assert.equal(Object.keys(PROP_MATERIALS_V91).length,18);
 for(const path of Object.values(PROP_MATERIALS_V91))assert.ok(allowed.has(path),path);
 const oldOptions={wall:['original','concrete','worn-plaster','painted-wall'],
  floor:['original','terrazzo','marble-check','dirty-carpet','worn-tile','beige-tile','dirty-tile','concrete-floor'],
  ceiling:['original','acoustic','stained-plaster','concrete']};
 for(const [part,ids]of Object.entries(oldOptions)){
  assert.deepEqual(ROOM_FINISHES_V87[part].slice(0,ids.length).map(x=>x.id),ids,'saved finish IDs are immutable');
  assert.ok(ROOM_FINISHES_V87[part].length>ids.length);
 }
 console.log('PINEWOOD_V91_50_CC0_TEXTURES_PASS '+JSON.stringify(totals));
});
test('separate material identity: desks have wood grain and metal hardware, preserving glass and screens',()=>{
 const desk=original.models.find(x=>x.id==='kenney-furniture-kit-desk');
 const cabinet=original.models.find(x=>x.id==='kenney-furniture-kit-kitchencabinetdrawer');
 for(const asset of [desk,cabinet]){
  assert.ok(asset);
  const gltf=parseGlb(asset.path),names=gltf.materials.map(m=>m.name);
  assert.ok(names.includes('wood'));assert.ok(names.includes('metal'));
  assert.notEqual(materialRoleV91('wood',asset.label),materialRoleV91('metal',asset.label));
  assert.equal(materialRoleV91('wood',asset.label),'wood');
  assert.equal(materialRoleV91('metal',asset.label),'metal');
 }
 const tab=parseGlb(cabinet.path);
 assert.ok(tab.materials.some(m=>m.name==='woodDark'));
 assert.equal(materialRoleV91('woodDark',cabinet.label),'woodDark');
 for(const name of ['glass','glow','screen','lamp','chrome','snow','grass','leafsGreen','_defaultMat','colorRed'])
  assert.equal(materialRoleV91(name,'desk'),null,'preserve source '+name);
 assert.equal(materialRoleV91('carcass','retail cabinet'),'plywood');
 assert.equal(materialRoleV91('surface','retail cabinet'),'woodTable');
});
test('all 324 source color-only GLBs inspected and semantic parts assigned without blanket overrides',()=>{
 const colorOnly=original.models.filter(x=>!index.imageBearingIds.includes(x.id));
 assert.equal(colorOnly.length,324);
 const stats={models:0,supported:0,sourceMaterials:0,enhancedParts:0,withoutUV:0,roles:{}};
 for(const item of colorOnly){
  const g=parseGlb(item.path);stats.models++;
  let hit=0;
  for(const m of g.materials||[]){
   stats.sourceMaterials++;
   const role=materialRoleV91(m.name,item.label);
   if(!role)continue;
   assert.ok(PROP_MATERIALS_V91[role],'unmapped role '+role+' in '+item.id);
   stats.enhancedParts++;stats.roles[role]=(stats.roles[role]||0)+1;
   hit++;
  }
  if(hit)stats.supported++;
  for(const mesh of g.meshes||[])for(const prim of mesh.primitives||[])
   if(prim.attributes?.TEXCOORD_0===undefined)stats.withoutUV++;
 }
 assert.ok(stats.supported>=180,'expect broad material-aware treatment, not just a desk demo');
 assert.ok(stats.enhancedParts>=250);
 assert.ok(stats.withoutUV>=400,'must test generated UVs for UV-less source meshes');
 console.log('PINEWOOD_V91_COLOR_ONLY_CATALOG_AUDIT '+JSON.stringify(stats));
});
test('box-projected UVs are generated on cloned geometry without moving vertices or losing face materials',()=>{
 const g=new THREE.BoxGeometry(1,1,1);
 g.deleteAttribute('uv');
 const originalPositions=[...g.getAttribute('position').array];
 const originalGroups=JSON.stringify(g.groups);
 const enhanced=boxProjectMissingUVV91(g,{tileMeters:.6});
 assert.notEqual(enhanced,g,'source mesh remains unmodified');
 assert.deepEqual([...g.getAttribute('position').array],originalPositions);
 assert.equal(g.getAttribute('uv'),undefined);
 assert.equal(enhanced.userData.builderGeneratedUVV91,true);
 assert.equal(enhanced.getAttribute('uv').count,enhanced.getAttribute('position').count);
 assert.equal(JSON.stringify(enhanced.groups),originalGroups);
 assert.ok(enhanced.getAttribute('uv').array.some(v=>Math.abs(v)>.1));
 assert.equal(boxProjectMissingUVV91(enhanced),enhanced,'do not expand twice');
 g.dispose();enhanced.dispose();
});
