import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {constructPhysicalShell,validatePhysicalShell} from './physical-shell-v67.mjs';
import {renderStorefrontsV115} from './render-storefronts-v115.js';

function mappedBox(w,h,d,tileMetres=3){
 const g=new THREE.BoxGeometry(w,h,d),uv=g.getAttribute('uv');
 const sizes=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
 for(let side=0;side<6;side++){
  for(let j=0;j<4;j++){
   const i=side*4+j;
   uv.setXY(i,uv.getX(i)*Math.max(.12,sizes[side][0]/tileMetres),uv.getY(i)*Math.max(.12,sizes[side][1]/tileMetres));
  }
 }
 uv.needsUpdate=true;return g;
}
function addBox(group,name,x,y,z,w,h,d,material,tileMetres=3){
 const mesh=new THREE.Mesh(mappedBox(w,h,d,tileMetres),material);
 mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true;
 group.add(mesh);return mesh;
}
const material=(color,map,rough=null,opt={})=>new THREE.MeshStandardMaterial({
 color,roughness:opt.roughness??.93,metalness:opt.metalness??0,
 map,roughnessMap:rough||null,side:THREE.DoubleSide,transparent:!!opt.transparent,
 opacity:opt.opacity??1,depthWrite:!opt.transparent
});
function wallMesh(group,w,mats){
 const h=w.top-w.bottom,len=w.end-w.start;
 const x=w.axis==='x'?w.at:(w.start+w.end)/2,z=w.axis==='z'?w.at:(w.start+w.end)/2;
 const sx=w.axis==='x'?w.thickness:len,sz=w.axis==='z'?w.thickness:len;
 const m=w.role==='storefront-glass'?mats.shopGlass:
    w.role==='storefront-kick'?mats.shopKick:
    w.role==='storefront-pier'||w.role==='storefront-spandrel'?mats.shopMasonry:
    w.role==='gate'?mats.gate:w.role==='exterior'?mats.outer:w.role==='railing'?mats.rail:
    (w.at>=47&&w.bottom>=-.01)?mats.annexWall:mats.wall;
 const mesh=addBox(group,w.id,x,w.bottom+h/2,z,sx,h,sz,m);
 mesh.userData.architecturalCollider=true;mesh.userData.boundary=w;
 return mesh;
}
async function preloadTextures(paths){
 const loader=new THREE.TextureLoader(),entries=Object.entries(paths);
 const loaded=await Promise.all(entries.map(async([name,path])=>{
  if(!/^(assets|opening)\//.test(path))throw Error('nonlocal texture path '+path);
  const url=new URL('../'+path,import.meta.url);
  const texture=await loader.loadAsync(url.href);
  texture.colorSpace=name.toLowerCase().includes('rough')?THREE.NoColorSpace:THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;texture.wrapT=THREE.RepeatWrapping;
  texture.anisotropy=4;
  return [name,texture];
 }));
 return Object.fromEntries(loaded);
}
function renderFloor(group,p,mats){
 const w=p.x2-p.x1,d=p.z2-p.z1;
 const material=p.material==='terrazzo'?mats.terrazzo:p.material==='carpet'?mats.carpet:mats.tiles;
 const mesh=addBox(group,'floor_'+p.id,(p.x1+p.x2)/2,p.y-.095,(p.z1+p.z2)/2,w,.19,d,material);
 mesh.userData.walkableFloor=true;return mesh;
}
function buildStairs(group,s,mats){
 const g=new THREE.Group();g.name='physical_stair_'+s.id;group.add(g);
 for(let i=0;i<s.steps.length;i++){
  const t=s.steps[i];
  const bottom=s.bottomY,top=t.y;
  // Each tread's volume descends to basement/ground, forming a
  // true continuous climb. No overlapping fantasy ramp or teleporter.
  addBox(g,'stair_tread_'+i,t.x,(bottom+top)/2,t.z,t.w,top-bottom,t.depth,mats.stair);
 }
 // Railings follow the real 4.3 m or 5.4 m rise, not unrelated
 // full-height boxes obstructing the stair.
 const first=s.steps[0],last=s.steps.at(-1);
 for(const offset of[-s.width/2-.12,s.width/2+.12]){
  const length=last.z-first.z;
  const line=new THREE.Vector3(0,s.rise,length).normalize();
  const rail=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,Math.hypot(s.rise,length),8),mats.rail);
  rail.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),line);
  rail.position.set(s.at.x+offset,(s.bottomY+s.topY)/2+.86,(first.z+last.z)/2);
  rail.name='stair_hand_rail';g.add(rail);
 }
 return g;
}
function placeModel(group,loaded,f){
 const source=loaded.get(f.model);
 if(!source)throw Error('CC0 model was not preloaded: '+f.model);
 const model=source.scene.clone(true),b=new THREE.Box3().setFromObject(model),size=b.getSize(new THREE.Vector3());
 const largest=Math.max(size.x,size.y,size.z);
 if(!Number.isFinite(largest)||largest<.001)throw Error('Model has invalid dimensions: '+f.model);
 const maxWidth=f.id==='dry_fountain_art'?4.2:f.id.startsWith('arcade')?1.5:2.4;
 // Some genuine floor fixtures are single-plane GLBs with zero vertical
 // extent; ground them by footprint instead of dividing by height zero.
 const flat=size.y<.001;
 const s=flat?maxWidth/Math.max(size.x,size.z,.01):
  Math.min(f.targetHeight/size.y,maxWidth/Math.max(size.x,size.z,.01));
 model.scale.setScalar(s);
 const scaled=new THREE.Box3().setFromObject(model),middle=scaled.getCenter(new THREE.Vector3());
 model.position.set(f.x-middle.x,f.y-scaled.min.y,f.z-middle.z);
 model.name='cc0_'+f.id;model.userData.cc0ProvenancePath=f.model;
 model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 group.add(model);
 return {id:f.id,model:f.model,scale:s,measuredHeight:size.y*s,groundY:f.y};
}
function installLights(group){
 const hemi=new THREE.HemisphereLight(0x9fbbb8,0x283033,.98);group.add(hemi);
 const moon=new THREE.DirectionalLight(0xc7ced0,.8);moon.position.set(-35,35,20);group.add(moon);
 const warm=(x,y,z,color=0xe9d9b5,strength=18,range=23)=>{
  const light=new THREE.PointLight(color,strength,range,2);light.position.set(x,y,z);group.add(light);
  const s=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color}));
  s.position.copy(light.position);group.add(s);
 };
 for(const z of[-46,-66,-86,-106])warm(0,7.6,z,0x9cc6bc,25,29);
 warm(12,2.9,-30,0xd5e7d9,10,14);
 warm(-28,3.4,-80,0xc89a72,10,19);
 warm(32,3.1,-105,0xd9d3b5,13,20);
 warm(61,3.0,-55,0xa9c8ca,22,31);
 warm(61,3.0,-92,0xcabf9b,16,25);
 warm(-12,-1.1,-95,0x7dada8,24,33);
 warm(7,7.8,-98,0xd3caab,12,25);
 warm(74,7.9,-102,0xd6ccb6,14,24);
}
function addFountainArchitecture(group,mats){
 // Masonry basin is part of the physical building footprint; only the
 // nozzle/sculpture is the imported CC0 model (see fixture manifest).
 const stone=new THREE.Mesh(new THREE.TorusGeometry(5.1,.47,10,72),mats.fountain);
 stone.rotation.x=-Math.PI/2;stone.position.set(0,.36,-71);
 stone.name='dry_fountain_stone_rim';group.add(stone);
 const bed=new THREE.Mesh(new THREE.CylinderGeometry(4.75,4.75,.09,72),mats.tiles);
 bed.position.set(0,.03,-71);bed.name='dry_fountain_basin_floor';group.add(bed);
}
function makeMaterials(t){
 const terrazzo=material(0x9c9581,t.terrazzo,t.terrazzoRough);
 const carpet=material(0x6b6a65,t.carpet,t.carpetRough);
 const concrete=material(0x8d9490,t.concrete,t.concreteRough);
 return {
  terrazzo,carpet,tiles:material(0x777d7a,t.tile,t.tileRough),
  outer:material(0x666f6e,t.concrete,t.concreteRough),
  wall:material(0xa49b89,t.concrete,t.concreteRough),
  annexWall:material(0x657a7e,t.concrete,t.concreteRough),
  gate:material(0x4f5d5d,t.concrete,t.concreteRough,{metalness:.35}),
  rail:material(0x545c5d,null,null,{metalness:.62,roughness:.55}),
  stair:material(0x878b86,t.tile,t.tileRough),
  fountain:material(0x8e8574,t.terrazzo,t.terrazzoRough),
  glass:material(0x1b4342,null,null,{transparent:true,opacity:.3,metalness:.1,roughness:.12}),
  shopGlass:material(0x879c97,null,null,{transparent:true,opacity:.31,roughness:.27,metalness:.16}),
  shopKick:material(0x585d57,null,null,{roughness:.68,metalness:.23}),
  shopMasonry:material(0x827d6f,t.concrete,t.concreteRough),
  header:material(0x475859,t.concrete,t.concreteRough),
  shopCeiling:material(0xded7c6,t.shopCeiling,null,{roughness:.97}),
  plasterCeiling:material(0xd3cfc6,t.plasterCeiling,null,{roughness:.96})
 };
}
function renderCeiling(group,p,mats){
  const mat=p.material==='shop-ceiling'?mats.shopCeiling:mats.plasterCeiling;
  const mesh=addBox(group,'ceiling_'+p.id,(p.x1+p.x2)/2,p.y,
   (p.z1+p.z2)/2,p.x2-p.x1,p.thickness,p.z2-p.z1,mat,
   p.material==='shop-ceiling'?2.44:3);
  mesh.userData.roomCeiling=p.room;
  mesh.userData.ceilingFinish=p.material;
  return mesh;
 }
 function buildRoof(group,r,mats){
 const m=r.material==='glass'?mats.glass:mats.outer;
 addBox(group,r.type,(r.x1+r.x2)/2,r.y+.09,(r.z1+r.z2)/2,r.x2-r.x1,.18,r.z2-r.z1,m);
}
export async function renderConstructionScene({scene,chapter=1}={}){
 if(!scene)throw TypeError('Three.js scene required');
 // All loads finish before a single visible geometry frame is attached.
 const shells=['B1','G','M1'].map(level=>constructPhysicalShell({level,chapter}));
 const defects=shells.flatMap(s=>validatePhysicalShell(s).map(e=>s.level+': '+e));
 if(defects.length)throw Error('Physical geometry invalid: '+defects.join(' | '));
 const t=await preloadTextures(shells[0].texturePaths);
 const mats=makeMaterials(t);
 const fixtureList=shells.flatMap(s=>s.fixtures);
 const paths=[...new Set(fixtureList.map(f=>f.model))];
 const modelLoader=new GLTFLoader(),loaded=new Map();
 await Promise.all(paths.map(async path=>{
  if(!path.startsWith('assets/vendor/runtime/'))throw Error('Non-vendored model: '+path);
  const gltf=await modelLoader.loadAsync(new URL('../'+path,import.meta.url).href);
  loaded.set(path,gltf);
 }));
 const group=new THREE.Group();group.name='Pinewood Mall v67 physical property';
 const roofs=new THREE.Group();roofs.name='optional roof cutaway';group.add(roofs);
  const ceilings=new THREE.Group();ceilings.name='ground-floor room ceilings';group.add(ceilings);
 const gates=new THREE.Group();gates.name='chapter-controlled gates';group.add(gates);
 const geometryGroups={};
 for(const shell of shells){
  const layer=new THREE.Group();layer.name='floor_'+shell.level;group.add(layer);geometryGroups[shell.level]=layer;
  for(const p of shell.floorPlates)renderFloor(layer,p,mats);
   for(const c of shell.ceilings)renderCeiling(ceilings,c,mats);
  for(const w of shell.walls)wallMesh(layer,w,mats);
  for(const rail of shell.railings)wallMesh(layer,rail,mats);
  for(const stair of shell.stairs)if(stair.bottomLevel===shell.level)buildStairs(layer,stair,mats);
  for(const roof of shell.roofs)buildRoof(roofs,roof,mats);
 }
 // Use the complete Chapter 1 gate set once; the chapter selector toggles
 // their door leaves. Topology is immutable, preventing runtime popping.
 for(const shell of shells){
  const origin=constructPhysicalShell({level:shell.level,chapter:1});
  for(const w of origin.gates){
   const gate=wallMesh(gates,w,mats);
   gate.userData.minChapter=origin.portals.find(p=>'gate_'+p.id===w.id)?.minChapter||
     (w.id==='gate_east_exit'?6:2);
  }
 }
 const storefrontVisuals=renderStorefrontsV115(geometryGroups.G,shells.find(s=>s.level==='G').storefronts);
 addFountainArchitecture(geometryGroups.G,mats);
 const measured=fixtureList.map(f=>placeModel(geometryGroups[roomLevel(f.room)],loaded,f));
 installLights(group);
 scene.add(group);
 return {
  group,roofs,ceilings,gates,geometryGroups,shells,
  texturesLoaded:Object.keys(t).length,modelsLoaded:measured.length,modelManifest:measured,
  storefrontsV115:storefrontVisuals.manifest,
  geometryErrors:[],firstFrameFullyLoaded:true,
  setChapter(next){
   for(const g of gates.children)g.visible=next<g.userData.minChapter;
  },
  setRoofVisible(value){roofs.visible=!!value;ceilings.visible=!!value},
  dispose(){
   scene.remove(group);
   storefrontVisuals.dispose();
   group.traverse(o=>{if(o.geometry)o.geometry.dispose()});
   for(const texture of Object.values(t))texture.dispose();
   for(const material of Object.values(mats))material.dispose();
  }
 };
}
function roomLevel(id){
 const r=MALL_ROOM_INDEX.get(id);if(!r)throw Error('Unknown fixture room '+id);return r.level;
}
import {MALL} from './masterplan-v66.mjs';
const MALL_ROOM_INDEX=new Map(MALL.rooms.map(r=>[r.id,r]));
