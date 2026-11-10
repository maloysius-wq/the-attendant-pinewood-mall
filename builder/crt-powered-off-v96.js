import * as THREE from '../vendor/three/build/three.module.js';

/**
 * A deserted 1990s mall has no power to the CRTs.
 *
 * The exact pinned CRT GLB has a separately mapped glass/screen material
 * (Monitor_Glass) and a separate baked reflection mesh
 * (Additional_Reflection / Monitor_Reflection). Source monitor casing,
 * CRT body, PC tower, keyboard, mouse, folds, geometry and source .glb
 * bytes must stay unmodified. This affects Builder instances only.
 */
export const CRT_SOURCE_ID_V96='retro-crt-pc-1990s';

export function makeCrtPoweredOffV96(root,sourceId){
 if(sourceId!==CRT_SOURCE_ID_V96)return {screenFaces:0,reflectionsHidden:0,unchanged:true};
 let screenFaces=0,reflectionsHidden=0;
 root.traverse(mesh=>{
  if(!mesh.isMesh)return;
  const isReflection=mesh.name==='Additional_Reflection'||
   mesh.geometry?.name==='Monitor_Reflection';
  // The asset has a purpose-made composited highlight layer over the tube.
  // It may contain an illuminated green graphic, so leave the geometry
  // untouched but disable ONLY that overlay for a black, powered-off tube.
  if(isReflection){
   mesh.visible=false;
   mesh.userData={...mesh.userData,builderCrtReflectionDisabledV96:true};
   reflectionsHidden++;
  }
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
  const next=materials.map(material=>{
   if(material?.name!=='Monitor_Glass')return material;
   // This replacement has *no* albedo, emissive, light or alpha textures.
   // A near-black glass finish has a tiny neutral physical reflection
   // from existing lighting but no green content or powered-on bloom.
   const dark=new THREE.MeshPhysicalMaterial({
    name:'Monitor_Glass_PoweredOff',
    color:new THREE.Color(0x090f10),
    metalness:0,roughness:.32,
    clearcoat:.20,clearcoatRoughness:.30,
    emissive:new THREE.Color(0x000000),
    side:material.side,
    depthTest:material.depthTest,
    depthWrite:true,
    transparent:false,
    opacity:1
   });
   dark.userData={...material.userData,
    builderCrtPoweredOffV96:true,
    originalScreenMaterialV96:material.name};
   screenFaces++;
   return dark;
  });
  mesh.material=Array.isArray(mesh.material)?next:next[0];
 });
 if(screenFaces!==1||reflectionsHidden!==1)
  throw Error('Pinned 1990s CRT screen anatomy changed; expected one Monitor_Glass and one reflection, got '+screenFaces+' / '+reflectionsHidden);
 return {screenFaces,reflectionsHidden,unchanged:false};
}
