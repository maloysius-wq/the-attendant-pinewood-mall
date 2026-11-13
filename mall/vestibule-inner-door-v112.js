import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {vestibuleInnerPortalV112} from './vestibule-handoff-v112.mjs';

// This is the actual, already vendored CC0 Backrooms and Liminal Spaces Kit
// DOOR, not a new box posing as one. Its three separately authored "door"
// meshes (painted leaf, inset wood panel and metal handle) are removed from
// the source doorway and fitted as a single hinged assembly. The source's
// frame and hinge remain fixed. Wallpaper backing is deliberately excluded;
// otherwise it would block the real portal and obscure the user's wall finish.
export const VESTIBULE_DOOR_ASSET_V113=
 'assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-doorway-door-fad0eb36.glb';

// Match the contractor EXTERIOR door geometry in opening/scene.js, including
// its clear frame opening and solid header rather than leaving a tall black
// opening up to the room ceiling.
export const INNER_SERVICE_DOOR_SPEC_V113=Object.freeze({
 width:1.78,height:2.27,base:.006,headClearance:.018,sideClearance:.01,
 wallTop:3.55,wallThickness:.24
});
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const boxInfo=box=>({
 min:{x:box.min.x,y:box.min.y,z:box.min.z},
 max:{x:box.max.x,y:box.max.y,z:box.max.z},
 size:{x:box.max.x-box.min.x,y:box.max.y-box.min.y,z:box.max.z-box.min.z}
});
function fitMeshes(meshes,size,{x,y,z},name){
 const group=new THREE.Group();group.name=name;
 for(const mesh of meshes)group.add(mesh);
 group.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(group);
 const dims=bounds.getSize(new THREE.Vector3());
 if(dims.x<.2||dims.y<.5||dims.z<.001)
  throw Error('Original CC0 door mesh has invalid physical dimensions: '+name);
 const sx=size.width/dims.x,sy=size.height/dims.y;
 if(sx<.3||sx>5||sy<.3||sy>5)
  throw Error('Original CC0 door asset no longer fits measured physical portal: '+name);
 // Keep source-depth and metal fittings, rescale only the actual opening.
 group.scale.set(sx,sy,1);
 group.position.set(x-bounds.min.x*sx,y-bounds.min.y*sy,z-bounds.getCenter(new THREE.Vector3()).z);
 group.updateMatrixWorld(true);
 return group;
}
function existingVestibuleWall(building,portal){
 const segment=building.shells.flatMap(shell=>shell.walls||[]).find(w=>
  w.axis==='z'&&Math.abs(w.at-portal.z)<.001&&
  w.id.startsWith('service_vestibule_')&&
  (Math.abs(w.end-portal.start)<.01||Math.abs(w.start-portal.end)<.01));
 const mesh=segment&&building.group.getObjectByName(segment.id,true);
 if(!mesh?.isMesh)throw Error('Missing real shared vestibule wall for solid door header infill');
 if(Math.abs(segment.top-INNER_SERVICE_DOOR_SPEC_V113.wallTop)>.01||
    Math.abs(segment.thickness-INNER_SERVICE_DOOR_SPEC_V113.wallThickness)>.01)
  throw Error('Vestibule wall top/thickness changed; refit the real inner doorway');
 return {segment,material:mesh.material};
}
export async function mountVestibuleInnerDoorV112(building){
 if(!building?.group)throw TypeError('Shared Pinewood physical building is required');
 const portal=vestibuleInnerPortalV112(),spec=INNER_SERVICE_DOOR_SPEC_V113;
 if(Math.abs(portal.width-spec.width-2*spec.sideClearance)>.015||
    portal.height<spec.height+spec.base||portal.height>2.6)
  throw Error('Inner door leaf no longer matches the real exterior-sized service aperture');
 const {segment,material:wallMaterial}=existingVestibuleWall(building,portal);
 const source=(await new GLTFLoader().loadAsync(
  new URL('../'+VESTIBULE_DOOR_ASSET_V113,import.meta.url).href)).scene;
 const meshes=[];source.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const leafMeshes=meshes.filter(o=>o.name==='door');
 const frameMeshes=meshes.filter(o=>o.name==='doorway-door_1'||o.name==='doorway-door_5');
 if(leafMeshes.length!==3||frameMeshes.length!==2)
  throw Error('Pinned CC0 door node names changed; cannot safely rig hinge from a guessed model');
 const root=new THREE.Group();root.name='V113 real source door and full-height interior header';
 const openingTop=spec.base+spec.height+spec.headClearance;
 // The source kit's named wood frame and metal hinge are NOT animated.
 // Fit those separately to the same 1.80 x 2.294 m opening as the film door.
 const frame=fitMeshes(frameMeshes,{width:portal.width,height:openingTop},
  {x:portal.start,y:0,z:portal.z},'V113 original CC0 fixed door frame and hinge');
 root.add(frame);
 const pivot=new THREE.Group();
 pivot.name='V113 hinged source-painted door / wooden inset / real metal handle';
 pivot.position.set(portal.start+spec.sideClearance,0,portal.z+.012);
 const leaf=fitMeshes(leafMeshes,{width:spec.width,height:spec.height},
  {x:0,y:spec.base,z:0},'V113 original CC0 independently pivoting door meshes');
 pivot.add(leaf);root.add(pivot);
 // The physical shell intentionally leaves this entire 3.55 m wall span
 // open. The exterior entrance solves the same problem with a solid infill
 // ABOVE its 2.295 m aperture; match it here using the adjacent real
 // partition's OWN existing material, including the user's wall finish.
 const headerHeight=segment.top-openingTop;
 const header=new THREE.Mesh(
  new THREE.BoxGeometry(portal.width,headerHeight,segment.thickness),wallMaterial);
 header.position.set(portal.x,openingTop+headerHeight/2,portal.z);
 header.name='V113 solid full-width vestibule lintel and overhead infill';
 header.receiveShadow=true;root.add(header);
 root.userData.asset=VESTIBULE_DOOR_ASSET_V113;
 root.userData.fixedInfrastructure=true;
 root.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;o.raycast=()=>{};}});
 root.updateMatrixWorld(true);
 const closedDoorBounds=boxInfo(new THREE.Box3().setFromObject(pivot));
 const headerBounds=boxInfo(new THREE.Box3().setFromObject(header));
 if(Math.abs(closedDoorBounds.size.x-spec.width)>.025||
    Math.abs(closedDoorBounds.size.y-spec.height)>.025||
    Math.abs(headerBounds.max.y-segment.top)>.001||
    Math.abs(headerBounds.min.y-openingTop)>.001)
  throw Error('CC0 source door or solid ceiling header does not fill measured opening');
 building.group.add(root);
 const materials=new Set(),geometries=new Set(),textures=new Set();
 // Keep ALL source GLB resources owned together, even the excluded wallpaper
 // mesh, so disposal never leaks data or destroys the neighbor wall material.
 for(const m of meshes){
  if(m.geometry)geometries.add(m.geometry);
  for(const mat of(Array.isArray(m.material)?m.material:[m.material])){
   if(!mat)continue;materials.add(mat);
   for(const k of ['map','normalMap','metalnessMap','roughnessMap','emissiveMap','alphaMap','aoMap'])
    if(mat[k])textures.add(mat[k]);
  }
 }
 let fraction=0,target=0,disposed=false;
 const info=Object.freeze({
  asset:VESTIBULE_DOOR_ASSET_V113,sourceDoorMeshes:leafMeshes.length,
  sourceFrameMeshes:frameMeshes.length,sourceMaterialNames:[...materials].map(m=>m.name),
  closedDoorBounds,headerBounds,openingTop,wallTop:segment.top
 });
 return {
  portal,group:root,pivot,info,
  get state(){return {portal,angle:pivot.rotation.y,openFraction:fraction,
   closed:fraction<.001,opening:target===1&&fraction<1,
   closing:target===0&&fraction>0,opened:fraction>.999,
   targetOpen:target===1,asset:info.asset,sourceDoorMeshes:info.sourceDoorMeshes,
   closedDoorBounds:info.closedDoorBounds,headerBounds:info.headerBounds,
   openingTop:info.openingTop,wallTop:info.wallTop};},
  open(){if(disposed)return false;target=1;return true;},
  close(){if(disposed)return false;target=0;return true;},
  toggle(){if(disposed)return false;target=target===1?0:1;return true;},
  // Scene re-use on a NEW game must re-close instantly, but player-initiated
  // closing must animate instead of teleporting an open door into their face.
  reset(){if(disposed)return false;target=0;fraction=0;pivot.rotation.y=0;return true;},
  update(dt){
   if(disposed||fraction===target)return;
   const step=clamp(Number(dt)||0,0,.15)*1.65;
   fraction=target===1?Math.min(1,fraction+step):Math.max(0,fraction-step);
   const eased=fraction*fraction*(3-2*fraction);
   // Positive yaw swings into the mall (-Z), just like the exterior swing
   // direction, with a real source leaf rather than rotating its wall frame.
   pivot.rotation.y=Math.PI*.53*eased;
  },
  dispose(){
   if(disposed)return;disposed=true;building.group.remove(root);
   header.geometry.dispose();
   for(const g of geometries)g.dispose();
   for(const m of materials)m.dispose();
   for(const t of textures)t.dispose();
  }
 };
}
