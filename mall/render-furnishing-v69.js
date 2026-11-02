/** Deterministic, local-only 3D model furniture adapter for v69 review.
 * Never touches the live six-chapter game or models owned by its old scene.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {MALL} from './masterplan-v66.mjs';
import {FURNISHINGS_V69,validateFurnishingPlan} from './furnishing-plan-v69.mjs';

const ROOM_BY_ID=new Map(MALL.rooms.map(r=>[r.id,r]));
const FLOOR_Y=new Map(MALL.levels.map(l=>[l.id,l.y]));
const boxOf=object=>new THREE.Box3().setFromObject(object);
const dim=box=>box.getSize(new THREE.Vector3());
const center=box=>box.getCenter(new THREE.Vector3());
function fitModel(scene,f){
 const object=scene.clone(true);
 object.rotation.y=f.yaw||0;
 object.updateMatrixWorld(true);
 const initial=boxOf(object),size=dim(initial);
 if(!Number.isFinite(size.x+size.y+size.z)||Math.max(size.x,size.y,size.z)<.00001)
  throw Error('Invalid source geometry for '+f.id+': '+f.model);
 // The circular walking collider encloses the entire visible asset,
 // including bulky cabinets and protruding machine feet.
 const axisCap=f.support ? 0.7 : 1.32*f.radius;
 const byHeight=size.y>.00001?f.targetHeight/size.y:Number.POSITIVE_INFINITY;
 const scale=Math.min(byHeight,axisCap/Math.max(size.x,.00001),axisCap/Math.max(size.z,.00001));
 if(!Number.isFinite(scale)||scale<=0)throw Error('Cannot fit '+f.id);
 object.scale.multiplyScalar(scale);
 object.updateMatrixWorld(true);
 object.name='furnished_'+f.id;
 object.userData={...object.userData,fixtureId:f.id,roomId:f.room,
  modelSource:f.model,walkRadius:f.radius,role:f.role,
  copyright:'CC0 pinned runtime vendor asset'};
 object.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});
 return object;
}
function ground(object,x,z,bottom){
 const b=boxOf(object),c=center(b);
 object.position.x+=x-c.x;
 object.position.y+=bottom-b.min.y;
 object.position.z+=z-c.z;
 object.updateMatrixWorld(true);
 return boxOf(object);
}
function measureSupport(id,object,room){
 if(!object)throw Error('Missing measured counter or tabletop '+id);
 const box=boxOf(object),size=dim(box);
 if(!Number.isFinite(box.max.y)||size.x<.01||size.z<.01)
  throw Error('Unmeasurable furniture support '+id);
 return {id,object,box,top:box.max.y,room};
}
function measurePlaced(f,object){
 const b=boxOf(object),s=dim(b),c=center(b);
 return {id:f.id,room:f.room,model:f.model,
  yBottom:b.min.y,measuredHeight:s.y,width:s.x,depth:s.z,
  centerX:c.x,centerZ:c.z,
  colliderRadius:f.radius};
}
export async function attachLicensedInteriorsV69(building){
 const defects=validateFurnishingPlan(FURNISHINGS_V69);
 if(defects.length)throw Error('Interior layout invalid: '+defects.join(' | '));
 const gltfLoader=new GLTFLoader();
 const paths=[...new Set(FURNISHINGS_V69.fixtures.map(f=>f.model))];
 const loaded=new Map();
 await Promise.all(paths.map(async path=>{
  if(!path.startsWith('assets/vendor/runtime/'))throw Error('External model forbidden: '+path);
  loaded.set(path,await gltfLoader.loadAsync(new URL('../'+path,import.meta.url).href));
 }));
 const group=new THREE.Group();group.name='Pinewood v69 licensed deserted interiors';
 const modelManifest=[],supportChecks=[],clearanceWarnings=[];
 const supports=new Map();
 // The v67 desk and table are real imported CC0 models; their surface
 // heights must be read from the rendered GLB rather than guessed.
 const legacy=[
  ['cc0_security_desk','security'],
  ['cc0_breakroom_table','break_room']
 ];
 for(const [id,room]of legacy){
  supports.set(id,measureSupport(id,building.group.getObjectByName(id),room));
 }
 // Furniture first, floor level, then props. This means a loose VHS/cup
 // can never be rendered until its physical counter/table is measured.
 for(const f of FURNISHINGS_V69.fixtures.filter(f=>!f.support)){
  const room=ROOM_BY_ID.get(f.room),level=FLOOR_Y.get(room.level);
  const object=fitModel(loaded.get(f.model).scene,f);
  const b=ground(object,f.x,f.z,level);
  group.add(object);
  const m=measurePlaced(f,object);
  modelManifest.push(m);
  const radial=Math.hypot(m.width/2,m.depth/2);
  if(radial>f.radius+.015)clearanceWarnings.push('fitted model outside walk collider '+f.id);
  if(m.yBottom<level-.02||m.yBottom>level+.035)clearanceWarnings.push('grounding error '+f.id);
  if(['counter','table','desk'].includes(f.role))supports.set(f.id,measureSupport(f.id,object,f.room));
 }
 // Re-home the v67 Cassette Castle register on the *new*, correctly
 // sized counter; do not duplicate the object or move a fictional proxy.
 for(const move of FURNISHINGS_V69.rehomeLegacy){
  const support=supports.get(move.support);
  const object=building.group.getObjectByName(move.id);
  if(!support||!object)throw Error('Legacy tabletop re-home invalid: '+move.id);
  const c=center(support.box);
  const b=ground(object,c.x,c.z,support.top+.012);
  const supported=Math.abs(b.min.y-support.top-.012)<.025&&
    Math.abs(center(b).x-c.x)<.03&&Math.abs(center(b).z-c.z)<.03;
  supportChecks.push({id:move.id,support:move.support,
   bottom:b.min.y,surface:support.top,supported});
 }
 for(const f of FURNISHINGS_V69.fixtures.filter(f=>!!f.support)){
  const support=supports.get(f.support);
  if(!support||support.room!==f.room)throw Error('Invalid model support for '+f.id);
  const object=fitModel(loaded.get(f.model).scene,f);
  const b=ground(object,f.x,f.z,support.top+.012);
  group.add(object);
  modelManifest.push(measurePlaced(f,object));
  const c=center(b),s=support.box;
  const supported=Math.abs(b.min.y-support.top-.012)<.025&&
   c.x>=s.min.x-.08&&c.x<=s.max.x+.08&&
   c.z>=s.min.z-.08&&c.z<=s.max.z+.08;
  supportChecks.push({id:f.id,support:f.support,bottom:b.min.y,surface:support.top,supported});
  if(!supported)clearanceWarnings.push('unsupported tabletop model '+f.id);
 }
 building.group.add(group);
 return {
  furnishingGroup:group,
  furnishingsLoaded:FURNISHINGS_V69.fixtures.length,
  uniqueModels:paths.length,
  furnitureManifest:modelManifest,
  supportChecks,clearanceWarnings,
  storyAnchors:FURNISHINGS_V69.storyAnchors.map(a=>({...a})),
  tourRoutes:FURNISHINGS_V69.tourRoutes.map(r=>({...r})),
  firstFrameFullyLoaded:true,
  dispose(){
   building.group.remove(group);
   // GLB geometries/materials belong to a shared vendored model cache; do
   // not dispose originals. All newly owned cloned groups are detached.
  }
 };
}
