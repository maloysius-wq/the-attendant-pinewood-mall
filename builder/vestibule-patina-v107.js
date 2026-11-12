import * as THREE from '../vendor/three/build/three.module.js';
import {EDITOR_CATALOG_BY_ID} from '../mall/editor-catalog-v1.mjs';
import {createDecalFactoryV97,isDecalV97,wallDecalQuaternionV97} from './decals-v97.js';
import {VESTIBULE_PATINA_PLAN_V107,validateVestibulePatinaPlanV107} from './vestibule-patina-plan-v107.mjs';

// Resolve every vertical stamp to the *real* nearest finished wall face:
// notably the replacement cinematic entry wall may be thicker than the shell.
// Do not guess a z offset and leave an entire row of invisible door scuffs.
export function resolveVestibulePatinaWallV107(mark,faces){
 if(mark.surface!=='wall')return {...mark.position};
 const [nx,,nz]=mark.normal;
 const axis=nx?'x':'z';
 const at=nx>0?9:nx<0?16:nz>0?-43:-22.5;
 const along=axis==='x'?mark.position.z:mark.position.x;
 const matching=faces.filter(face=>face.axis===axis&&Math.abs(face.at-at)<.075&&
  along>=face.start+.005&&along<=face.end-.005&&
  mark.position.y>face.bottom+.02&&mark.position.y<face.top-.02);
 if(matching.length!==1)throw Error('Vestibule mark is not mounted on exactly one physical wall face: '+mark.id);
 const face=matching[0];
 return {x:axis==='x'?face.x+nx*.022:mark.position.x,
  y:mark.position.y,z:axis==='z'?face.z+nz*.022:mark.position.z};
}

export async function createVestibulePatinaV107({building,wallFaces}){
 const errors=validateVestibulePatinaPlanV107();
 if(errors.length)throw Error('Unsafe vestibule patina plan: '+errors.join('; '));
 const factory=createDecalFactoryV97();
 const root=new THREE.Group();root.name='Builder-only authored contractor vestibule patina v107';
 building.group.add(root);
 const objects=[];
 try{
  for(const mark of VESTIBULE_PATINA_PLAN_V107){
   const item=EDITOR_CATALOG_BY_ID.get(mark.asset);
   if(!isDecalV97(item)||item.surface!==mark.surface)
    throw Error('V107 mark needs a real pinned '+mark.surface+' decal: '+mark.id);
   const obj=await factory.make(item);
   obj.name='Vestibule '+mark.id;
   const positioned=resolveVestibulePatinaWallV107(mark,wallFaces);
   obj.position.set(positioned.x,positioned.y,positioned.z);
   obj.scale.setScalar(mark.scale);
   if(mark.surface==='floor')obj.rotation.set(0,mark.turn,0);
   else obj.quaternion.copy(wallDecalQuaternionV97(
    new THREE.Vector3(...mark.normal),mark.turn));
   factory.opacity(obj,mark.opacity);
   obj.userData.builderFixedAtmosphereV107={id:mark.id,asset:mark.asset,surface:mark.surface,
    why:mark.why,review:mark.review};
   // Decorative marks are never selection targets, colliders or draft edits.
   obj.traverse(child=>{if(child.isMesh)child.raycast=()=>{};});
   root.add(obj);objects.push({id:mark.id,asset:mark.asset,surface:mark.surface,
    position:positioned,scale:mark.scale,opacity:mark.opacity,why:mark.why,review:mark.review});
  }
 }catch(err){
  root.removeFromParent();factory.dispose();throw err;
 }
 function getState(){return {enabled:root.visible,count:objects.length,
  floor:objects.filter(p=>p.surface==='floor').length,
  wall:objects.filter(p=>p.surface==='wall').length,
  ceiling:objects.filter(p=>p.surface==='ceiling').length,
  items:objects.map(p=>({...p,position:{...p.position}}))};}
 function setEnabled(value){root.visible=!!value;return getState();}
 function dispose(){
  root.removeFromParent();
  root.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
  factory.dispose();
 }
 return {root,getState,setEnabled,dispose};
}
