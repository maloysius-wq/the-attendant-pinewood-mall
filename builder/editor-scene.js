import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {TransformControls} from '../vendor/three/examples/jsm/controls/TransformControls.js';
import {renderPinewoodV69} from '../mall/render-shell-v69.js';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {EDITOR_EXTRA_FIXTURES_V1} from '../mall/editor-baseline-v1.mjs';
import {EDITOR_CATALOG_BY_ID} from '../mall/editor-catalog-v1.mjs';

const vector=v=>({x:v.x,y:v.y,z:v.z});
const pose=o=>({position:vector(o.position),rotation:vector(o.rotation),scale:o.scale.x});
const applyPose=(obj,p)=>{
 obj.position.set(p.position.x,p.position.y,p.position.z);
 obj.rotation.set(p.rotation.x,p.rotation.y,p.rotation.z);
 obj.scale.setScalar(p.scale);
 obj.updateMatrixWorld(true);
};
export async function createBuilderScene({scene,camera,domElement,onSelect=()=>{},onTransform=()=>{},onPlace=()=>{},canEdit=()=>true,orbit=null}){
 const building=await renderPinewoodV69({scene,chapter:6});
 building.setChapter(6);building.setRoofVisible(false);
 const objects=new Map(),originals=new Map();
 for(const f of FURNISHINGS_V69.fixtures){
  const o=building.group.getObjectByName('furnished_'+f.id);
  if(!o)throw Error('Missing baseline licensed fixture '+f.id);
  objects.set(f.id,o);originals.set(f.id,pose(o));
  o.userData.editorId=f.id;
 }
 for(const f of EDITOR_EXTRA_FIXTURES_V1){
  const o=building.group.getObjectByName('cc0_'+f.id,true);
  if(!o)throw Error('Missing original licensed mall prop '+f.id);
  objects.set(f.id,o);originals.set(f.id,pose(o));o.userData.editorId=f.id;
 }
 const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
 const loader=new GLTFLoader(),cached=new Map();
 const transform=new TransformControls(camera,domElement);
 scene.add(transform.getHelper());
 transform.setMode('translate');
 let selected=null,ghost=null,placing=null,depth=9,blocked=false;
 const editable=[...objects.values()];
 function setPointer(e){
  const r=domElement.getBoundingClientRect();
  pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
  raycaster.setFromCamera(pointer,camera);
 }
 const findObject=(hit)=>{
  let p=hit;
  while(p){if(p.userData.editorId&&objects.get(p.userData.editorId)===p)return p;p=p.parent}
  return null;
 };
 function select(id){
  if(id===null){selected=null;transform.detach();onSelect(null);return true;}
  if(!objects.has(id)||objects.get(id).visible===false)return false;
  selected=id;transform.attach(objects.get(id));onSelect(id,pose(objects.get(id)));return true;
 }
 async function template(id){
  const item=EDITOR_CATALOG_BY_ID.get(id);if(!item)throw Error('Unknown local asset '+id);
  if(!/^assets\/vendor\/(?:runtime|builder\/models)\//.test(item.path)||!/\.glb$/i.test(item.path))throw Error('Nonlocal asset forbidden');
  if(!cached.has(id))cached.set(id,loader.loadAsync(new URL('../'+item.path,import.meta.url).href));
  const gltf=await cached.get(id),o=gltf.scene.clone(true);
  const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3());
  if(!Number.isFinite(s.x+s.y+s.z)||s.y<.001)throw Error('Model has no physical dimensions: '+id);
  const cap=Math.max(.2,1.32*item.radius);
  const factor=Math.min(item.targetHeight/s.y,cap/Math.max(s.x,.001),cap/Math.max(s.z,.001));
  if(!Number.isFinite(factor)||factor<=0)throw Error('Unfit model '+id);
  o.scale.setScalar(factor);o.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(o),c=bounds.getCenter(new THREE.Vector3());
  o.position.set(-c.x,-bounds.min.y,-c.z);
  o.traverse(x=>{if(x.isMesh){x.receiveShadow=true;x.castShadow=false;}});
  // Author transforms apply to the wrapper. The measured physical fit of
  // the vendor mesh must never be erased by an editable scale of 1.
  const anchor=new THREE.Group();anchor.add(o);
  return anchor;
 }

 // Preserve the canonical architectural basin and all evidence geometry while
 // replacing only the old centre sculpture in this standalone authoring world.
 const oldSculpture=building.group.getObjectByName('cc0_dry_fountain_art',true);
 if(oldSculpture)oldSculpture.visible=false;
 const fountain=await template('silted-octagonal-atrium-fountain');
 fountain.name='builder_atrium_dry_fountain';
 fountain.userData.editorId='atrium_dry_fountain';
 fountain.position.set(0,.07,-71);
 fountain.scale.setScalar(2);
 building.group.add(fountain);
 objects.set('atrium_dry_fountain',fountain);
 originals.set('atrium_dry_fountain',pose(fountain));
 async function applyDraft(draft){
  for(const [id,defaultPose] of originals){
   const o=objects.get(id);
   applyPose(o,defaultPose);
   const overrides=draft.overrides[id];
   if(overrides){
    const p=pose(o);
    applyPose(o,{position:overrides.position??p.position,
     rotation:overrides.rotation??p.rotation,scale:overrides.scale??p.scale});
   }
   o.visible=!draft.deleted.includes(id);
  }
  const incoming=new Set(draft.added.map(a=>a.id));
  for(const [id,o] of [...objects]){
   if(originals.has(id)||incoming.has(id))continue;
   if(selected===id){selected=null;transform.detach();}
   o.removeFromParent();objects.delete(id);
  }
  for(const inst of draft.added){
   let o=objects.get(inst.id);
   if(!o){
    o=await template(inst.catalogId);
    o.name='builder_'+inst.id;
    o.userData.editorId=inst.id;
    building.group.add(o);objects.set(inst.id,o);
   }
   applyPose(o,{position:inst.position,rotation:inst.rotation,scale:inst.scale});
   o.visible=true;
  }
  if(selected&&!objects.get(selected)?.visible)select(null);
  return objects.size;
 }
 function setTransformMode(mode){
  if(!['translate','rotate','scale'].includes(mode))throw Error('Unknown transform mode');
  transform.setMode(mode);
 }
 function pointOnRay(){
  const floors=[];
  building.group.traverse(o=>{if(o.isMesh&&o.userData.walkableFloor)floors.push(o)});
  const hit=raycaster.intersectObjects(floors,false)[0];
  if(hit){
   // Wheel changes the ray distance along the actual walkable plane; keep
   // furniture grounded even when the camera is aimed at a floor.
   const p=camera.position.clone().lerp(hit.point,depth/9);
   return p.setY(hit.point.y);
  }
  return raycaster.ray.at(depth,new THREE.Vector3());
 }
 async function beginPlacement(catalogId){
  if(ghost){ghost.removeFromParent();ghost=null}
  placing=catalogId;depth=9;
  ghost=await template(catalogId);
  ghost.name='preview placement';
  ghost.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.45;o.material.depthWrite=false;}});
  building.group.add(ghost);
 }
 function stopPlacement(){
  placing=null;
  if(ghost){ghost.removeFromParent();ghost=null}
 }
 function currentPlacement(){
  if(!ghost||!placing)return null;
  const point=pointOnRay(),box=new THREE.Box3().setFromObject(ghost);
  ghost.position.set(point.x,point.y-(box.min.y-ghost.position.y),point.z);
  return vector(ghost.position);
 }
 async function pointerDown(e){
  if(e.button!==0||transform.dragging||!canEdit())return;
  setPointer(e);
  if(placing){
   const position=currentPlacement();
   const id=placing;
   stopPlacement();
   await onPlace(id,position);
   return;
  }
  const hits=raycaster.intersectObjects([...objects.values()],true);
  for(const h of hits){
   const o=findObject(h.object);
   if(o){select(o.userData.editorId);return;}
  }
 }
 function pointerMove(e){if(!placing)return;setPointer(e);currentPlacement();}
 function onWheel(e){
  if(!placing)return;
  e.preventDefault();depth=Math.min(120,Math.max(.75,depth+Math.sign(e.deltaY)*(e.shiftKey?.25:1)));
  currentPlacement();
 }
 transform.addEventListener('dragging-changed',e=>{blocked=e.value;if(orbit)orbit.enabled=!blocked;});
 transform.addEventListener('objectChange',()=>{
  if(selected&&!blocked)return;
  if(selected)onSelect(selected,pose(objects.get(selected)));
 });
 transform.addEventListener('mouseUp',()=>{
  if(selected)onTransform(selected,pose(objects.get(selected)));
 });
 domElement.addEventListener('pointerdown',pointerDown);
 domElement.addEventListener('pointermove',pointerMove);
 domElement.addEventListener('wheel',onWheel,{passive:false});
 return {
  building,objects,select,applyDraft,beginPlacement,stopPlacement,setTransformMode,
  poseOf:id=>objects.has(id)?pose(objects.get(id)):null,
  pickAt:(x,y)=>{setPointer({clientX:x,clientY:y});return pointOnRay()},
  get selected(){return selected},
  dispose(){
   domElement.removeEventListener('pointerdown',pointerDown);
   domElement.removeEventListener('pointermove',pointerMove);
   domElement.removeEventListener('wheel',onWheel);
   stopPlacement();transform.detach();scene.remove(transform.getHelper());transform.dispose();building.dispose();
  }
 };
}
