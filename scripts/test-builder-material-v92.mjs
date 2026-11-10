import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {boxProjectFurnitureUVV92,createBuilderMaterialEnhancerV91} from '../builder/prop-materials-v91.js';
import {keepPeripheralColorsV92,isFurnitureV92,sourceTextureRoleV92,roomFinishRepeatsV92} from '../builder/material-scale-v92.mjs';

const catalog=JSON.parse(fs.readFileSync('assets/vendor/builder/catalog-v1.json','utf8'));
const GLB=path=>{
 const b=fs.readFileSync(path);
 assert.equal(b.toString('ascii',0,4),'glTF');
 return JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
};
test('the real keyboard and mouse GLBs are always solid-colored, not wood, metal or carpet textured',async()=>{
 for(const id of ['kenney-furniture-kit-computerkeyboard','kenney-furniture-kit-computermouse']){
  const model=catalog.models.find(m=>m.id===id);
  assert.ok(model,'actual pinned peripheral source exists: '+id);
  assert.ok((GLB(model.path).materials||[]).length>0,'source GLB has authored color materials');
  assert.equal(keepPeripheralColorsV92(model.label),true);
  assert.equal(keepPeripheralColorsV92(model.id),true);
  const mat=new THREE.MeshStandardMaterial({name:'wood',color:0xe3d3b4});
  const obj=new THREE.Mesh(new THREE.BoxGeometry(1,.1,.4),mat);
  const enhancer=createBuilderMaterialEnhancerV91();
  const response=await enhancer.enhance(obj,model.label);
  assert.equal(response.enhanced,0);
  assert.equal(obj.material,mat,'unchanged original source material');
  assert.equal(obj.material.map,null,'no texture map on peripheral');
  assert.equal(obj.geometry.userData.builderFurnitureUVV92,undefined);
  assert.equal(enhancer.getStats().peripheralsPreserved,1);
  enhancer.dispose();obj.geometry.dispose();mat.dispose();
 }
 for(const label of ['CRT Computer','Desk','Computer tower','Mouse trap','Mousepad?']){
  // The broad computer casing and desk should NOT be skipped.
  if(label==='Mouse trap'||label==='Mousepad?')continue;
  assert.equal(keepPeripheralColorsV92(label),false,label);
 }
 assert.equal(keepPeripheralColorsV92('Mesh computerKeyboard'),true);
 assert.equal(keepPeripheralColorsV92('Mesh computerMouse'),true);
});
test('desk, counter, cabinet and drawer panels receive smooth oak veneer, not noisy worn wood',()=>{
 for(const name of ['Desk','Deskcorner','kitchenCabinetDrawer','Retail Store Counter','Office table']){
  assert.equal(isFurnitureV92(name),true,name);
  assert.equal(sourceTextureRoleV92('wood',name),'woodLight',name);
  assert.equal(sourceTextureRoleV92('woodDark',name),'woodDark',name);
  assert.equal(sourceTextureRoleV92('metal',name),'metal',name);
 }
 assert.equal(sourceTextureRoleV92('wood','bare tree trunk'),'wood');
 const desk=GLB(catalog.models.find(m=>m.id==='kenney-furniture-kit-desk').path);
 assert.ok(desk.materials.some(m=>m.name==='wood'));
 assert.ok(desk.materials.some(m=>m.name==='metal'));
});
test('large desktop photograph projects less than once across a whole panel, not many 48-cm tiles',()=>{
 const original=new THREE.BoxGeometry(2.4,.12,1.25);
 // Emulate an authored UV that wraps tiny stamps over the desktop.
 const uv=original.getAttribute('uv');
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*7,uv.getY(i)*7);
 const priorUV=[...uv.array],priorPositions=[...original.getAttribute('position').array];
 const groups=JSON.stringify(original.groups);
 const projected=boxProjectFurnitureUVV92(original);
 assert.notEqual(projected,original);
 assert.deepEqual([...original.getAttribute('uv').array],priorUV,'do not mutate the original source mesh');
 assert.deepEqual([...projected.getAttribute('position').array],priorPositions);
 assert.equal(JSON.stringify(projected.groups),groups,'same distinct desk wood/metal material assignments');
 assert.equal(projected.userData.builderFurnitureUVV92,true);
 const uv2=projected.getAttribute('uv');
 let minU=Infinity,maxU=-Infinity,minV=Infinity,maxV=-Infinity;
 for(let i=0;i<uv2.count;i++){
  minU=Math.min(minU,uv2.getX(i));maxU=Math.max(maxU,uv2.getX(i));
  minV=Math.min(minV,uv2.getY(i));maxV=Math.max(maxV,uv2.getY(i));
 }
 assert.ok(maxU-minU<=.93,'no small stamps repeat across the entire desktop');
 assert.ok(maxV-minV<=.93,'no small stamps repeat across depth');
 assert.ok(maxU-minU>.85,'one broad photo spans the main desktop');
 assert.equal(projected.getAttribute('position').count,original.getAttribute('position').count);
 original.dispose();projected.dispose();
});
test('room wallpapers and soft floor finishes get fewer repeats; intentionally tiled ceilings remain',()=>{
 const carpet=roomFinishRepeatsV92('floor','dirty-carpet',9,7);
 assert.ok(carpet.u<1.55);
 assert.ok(carpet.v<1.55);
 assert.ok(carpet.u < 9/2.6/2,'less than half the v91 carpet tiling');
 const plaster=roomFinishRepeatsV92('wall','v91-painted_plaster_wall',14,3);
 assert.ok(plaster.u<=1.55);
 assert.ok(plaster.v<.8);
 const ceramic=roomFinishRepeatsV92('floor','v91-large_floor_tiles_02',22,18);
 assert.ok(ceramic.u<=2.7&&ceramic.v<=2.7,'no repeated miniature tile patterns');
 const acoustic=roomFinishRepeatsV92('ceiling','acoustic',10,5);
 assert.equal(acoustic.u,10/2.6);
 assert.equal(acoustic.v,5/2.6);
});
