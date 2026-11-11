import * as THREE from '../vendor/three/build/three.module.js';
import {makePeelingPosterGeometryV100} from './peeling-poster-v100.mjs';
import {isGrimeDecalV101,prepareGrimeTextureV101} from './decal-visibility-v101.mjs';
import {makeCalendarPaperV101} from './mood-materials-v101.mjs';

const ROOT='assets/vendor/builder/decals-v97/';
export const SURFACE_DECAL_CATEGORY_V97='Surface Decals & Grime';
export const isDecalV97=item=>item?.kind==='surface-decal'&&
 (['floor','wall','ceiling'].includes(item.surface));
export function validateDecalManifestV97(manifest){
 if(manifest?.version!==97||manifest.license!=='CC0-1.0'||
  !Array.isArray(manifest.decals)||manifest.decals.length!==36||
  !Array.isArray(manifest.sources)||manifest.sources.length!==7)throw Error('Incomplete pinned CC0 decal library v97');
 const ids=new Set(),sources=new Map(manifest.sources.map(s=>[s.id,s]));
 if(sources.size!==7)throw Error('Duplicate ambientCG source');
 for(const s of manifest.sources){
  if(!/^(SurfaceImperfections00[456]|Smear005|Fingerprints00[12]|Scratches005)$/.test(s.id)||
    s.license!=='CC0-1.0'||s.sourceUrl!=='https://ambientcg.com/view?id='+s.id||
    s.downloadUrl!=='https://ambientcg.com/get?file='+s.id+'_1K-JPG.zip'||
    !/^[a-f0-9]{64}$/.test(s.downloadSHA256))throw Error('Unverified CC0 image source');
 }
 for(const d of manifest.decals){
  if(!isDecalV97(d)||!['floor','wall'].includes(d.surface)||!/^[a-z0-9-]+$/.test(d.id)||
   ids.has(d.id)||d.category!==SURFACE_DECAL_CATEGORY_V97||
   d.materialStyle!=='image-mapped'||d.license!=='CC0-1.0'||
   !sources.has(d.sourceId)||!Number.isFinite(d.width)||d.width<=0||d.width>4||
   !Number.isFinite(d.height)||d.height<=0||d.height>4||
   !Number.isFinite(d.opacity)||d.opacity<=0||d.opacity>1||
   !/^[a-f0-9]{64}$/.test(d.sha256)||
   d.path!==ROOT+d.id.replace(/^grime-/,'')+'.png'||d.thumb!==d.path)
   throw Error('Unverified local decal '+d?.id);
  ids.add(d.id);
 }
 return manifest.decals;
}

export function registerDecalCatalogV97(manifest,catalog,index){
 const entries=validateDecalManifestV97(manifest);
 for(const item of entries){
  if(index.has(item.id))throw Error('Duplicate decal ID '+item.id);
  const p=Object.freeze({...item});
  index.set(p.id,p);catalog.push(p);
 }
 return entries.length;
}

export function createDecalFactoryV97(){
 const loader=new THREE.TextureLoader(),cache=new Map();
 async function make(item){
  if(!isDecalV97(item)||!/^assets\/vendor\/builder\/(?:decals-v97\/|vestibule-v98\/images\/|wall-decay-v100\/posters\/|mood-v101\/calendars\/)[a-z0-9-]+\.png$/.test(item.path))
   throw Error('Unsafe local decal source');
  if(!cache.has(item.id))cache.set(item.id,loader.loadAsync(
   new URL('../'+item.path,import.meta.url).href).then(t=>{
    t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
    t.anisotropy=4;t.minFilter=THREE.LinearMipmapLinearFilter;
    if(isGrimeDecalV101(item)){
     const enhanced=prepareGrimeTextureV101(THREE,t,item);
     t.dispose();return enhanced;
    }
    return t;
   }));
  const tex=await cache.get(item.id);
  const geometry=item.peelStyle?makePeelingPosterGeometryV100(THREE,item):
   item.calendarStyle?makeCalendarPaperV101(THREE,item):
   new THREE.PlaneGeometry(item.width,item.height);
  // Posters/notices obey real light. Grime is deliberately dark ink (not
  // emitted light) laid over the room finish, so it remains discernible in
  // the shadowed contractor vestibule at the user's chosen opacity.
  const material=new (isGrimeDecalV101(item)?THREE.MeshBasicMaterial:THREE.MeshStandardMaterial)({
   name:'GrimeDecal_'+item.id,map:tex,
   transparent:true,opacity:item.opacity,depthWrite:false,depthTest:true,
   polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,
   side:THREE.DoubleSide,toneMapped:true,
   ...(isGrimeDecalV101(item)?{color:0xffffff}:{color:0xffffff,metalness:0,roughness:1,emissive:0x000000,emissiveIntensity:0})
  });
  material.userData.builderMaterialLightingV101=isGrimeDecalV101(item)?'darken-only-photo':'fully-lit-paper';
  material.userData={builderSurfaceDecalV97:true,originalOpacity:item.opacity};
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='Surface decal '+item.label;
  mesh.userData.builderSurfaceDecalV97=true;
  // Floor stamps lie directly on the horizontal surface. Wall stamps stay
  // vertical and will be oriented toward the struck architectural wall.
  if(item.surface==='floor')mesh.rotation.x=-Math.PI/2;
  mesh.receiveShadow=false;mesh.castShadow=false;
  const root=new THREE.Group();root.name='surface-decal-'+item.id;
  root.add(mesh);root.userData.builderSurfaceDecalV97=true;
  return root;
 }
 function opacity(root,value){
  root.traverse(o=>{
   if(!o.isMesh||!o.userData.builderSurfaceDecalV97)return;
   o.material.opacity=value;
   o.material.needsUpdate=true;
  });
 }
 function dispose(){
  for(const p of cache.values())p.then(t=>t.dispose()).catch(()=>{});
  cache.clear();
 }
 return {make,opacity,dispose};
}

// Plane geometry +Z normal is rotated to match the struck wall's exterior
// normal, then spun around that normal. Decal itself remains an XY plane.
export function wallDecalQuaternionV97(normal,spin=0){
 const n=normal.clone().normalize();
 if(!Number.isFinite(n.x+n.y+n.z)||n.lengthSq()<.1)throw Error('Invalid wall surface normal');
 return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n)
   .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),spin));
}
