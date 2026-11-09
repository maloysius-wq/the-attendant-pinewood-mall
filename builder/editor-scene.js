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
 building.setChapter(6);building.setRoofVisible(true);
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
 const floors=[],walls=[];building.group.traverse(o=>{
  if(o.isMesh&&o.userData.walkableFloor)floors.push(o);
  if(o.isMesh&&o.userData.architecturalCollider&&o.userData.boundary?.role!=='railing')walls.push(o);
 });
 const loader=new GLTFLoader(),cached=new Map();
 const transform=new TransformControls(camera,domElement);
 scene.add(transform.getHelper());
 transform.setMode('translate');
 let selected=null,ghost=null,placing=null,depth=9,blocked=false,orbitBeforePlacement=null,placementGeneration=0;
 let snapSize=.5,allowClipping=false,ghostValid=true,ghostReason='';
 let previewPending=false,pendingPreviewYaw=0;
 // Serialize selected-object wheel edits so rapid wheel events cannot overwrite
 // each other while a layout change and IndexedDB autosave are still running.
 let wheelTransforms=Promise.resolve();
 const grid=new THREE.GridHelper(200,400,0x8ba198,0x455a58);
 grid.position.y=.018;grid.material.transparent=true;grid.material.opacity=.19;
 grid.name='Builder-only placement grid';grid.visible=true;grid.raycast=()=>{};
 scene.add(grid);
 const snap=v=>Math.round(v/snapSize)*snapSize;
 const editable=[...objects.values()];
 const _tmpQuat=new THREE.Quaternion();
 function setPointer(e){
  const r=domElement.getBoundingClientRect();
  if(document.pointerLockElement===domElement)pointer.set(0,0);
  else pointer.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);
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
  // Keep previously saved LCD instance IDs but draw the vetted 1990s CRT.
  // The discontinued flat-screen Kenney model stays in the provenance manifest.
  const sourceId=id==='kenney-furniture-kit-computerscreen'?'retro-crt-pc-1990s':id;
  const item=EDITOR_CATALOG_BY_ID.get(sourceId);if(!item)throw Error('Unknown local asset '+id);
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
  // Furniture tops are real support targets, not merely decorative assets.
  // This makes a 1990s CRT/desktop case placeable ON a desk by default.
  const candidates=raycaster.intersectObjects([...floors,...objects.values()],true);
  const upward=new THREE.Vector3();
  const hit=candidates.find(h=>{
   if(floors.includes(h.object))return true;
   if(!h.face)return false;
   h.object.getWorldQuaternion(_tmpQuat);
   upward.copy(h.face.normal).applyQuaternion(_tmpQuat);
   return upward.y>.65;
  });
  if(hit){
   const p=camera.position.clone().lerp(hit.point,depth/9);
   return p.setY(hit.point.y);
  }
  return raycaster.ray.at(depth,new THREE.Vector3());
 }
 // AABB collision is intentionally strict for walls/floor penetration.
 // Existing saved layouts remain loadable; new edits are blocked by default.
 function checkBounds(box,ignoreId=null){
  if(allowClipping)return {valid:true,reason:''};
  const small=box.clone().expandByScalar(-.012);
  if(small.isEmpty())small.copy(box);
  for(const wall of walls){
   if(!wall.visible)continue;
   const wbox=new THREE.Box3().setFromObject(wall);
   if(small.intersectsBox(wbox))return {valid:false,reason:'Wall intersection. Move the prop or enable Allow overlap.'};
  }
  // A grounded placement must have support under its footprint. Detect
  // falling through floors or spanning a hole, not just its center point.
  const y=box.min.y, inset=Math.min(.04,(box.max.x-box.min.x)/4,(box.max.z-box.min.z)/4);
  const points=[
   [box.min.x+inset,box.min.z+inset],[box.max.x-inset,box.min.z+inset],
   [box.min.x+inset,box.max.z-inset],[box.max.x-inset,box.max.z-inset],
   [(box.min.x+box.max.x)/2,(box.min.z+box.max.z)/2]
  ];
  const support=[
   ...floors.filter(f=>f.visible).map(f=>new THREE.Box3().setFromObject(f)),
   ...[...objects.entries()].filter(([id,o])=>
    id!==ignoreId&&o.visible&&o.parent).map(([,o])=>
    new THREE.Box3().setFromObject(o))
  ];
  const onSupport=(x,z)=>support.some(b=>x>=b.min.x-.015&&x<=b.max.x+.015&&
   z>=b.min.z-.015&&z<=b.max.z+.015&&Math.abs(y-b.max.y)<.085);
  if(!points.every(([x,z])=>onSupport(x,z)))
   return {valid:false,reason:'No continuous floor support. Use Allow overlap for unsupported placements.'};
  return {valid:true,reason:''};
 }
 async function validateNewPlacement(catalogId,position,rotation={x:0,y:0,z:0}){
  if(allowClipping)return {valid:true,reason:''};
  const obj=await template(catalogId);
  applyPose(obj,{position,rotation,scale:1});
  return checkBounds(new THREE.Box3().setFromObject(obj));
 }
 function validatePose(id,p){
  const obj=objects.get(id);if(!obj)return {valid:false,reason:'Unknown selected object'};
  const before=pose(obj);applyPose(obj,p);
  const result=checkBounds(new THREE.Box3().setFromObject(obj),id);
  applyPose(obj,before);
  return result;
 }
 function setGhostAppearance(valid,reason=''){
  ghostValid=valid;ghostReason=reason;
  // Canceling an invalid ghost must also restore the normal reticle.
  document.getElementById('aim-reticle')?.classList.toggle('invalid',!valid);
  if(!ghost)return;
  ghost.traverse(o=>{if(!o.isMesh)return;
   const materials=Array.isArray(o.material)?o.material:[o.material];
   for(const m of materials){
    if(!m.color)continue;
    if(!m.userData.builderOriginalColor)m.userData.builderOriginalColor=m.color.clone();
    m.color.copy(m.userData.builderOriginalColor);
    if(!valid)m.color.lerp(new THREE.Color(0xff514a),.75);
   }
  });
 }
 async function beginPlacement(catalogId){
  const generation=++placementGeneration;
  if(ghost){ghost.removeFromParent();ghost=null}
  placing=null;previewPending=true;pendingPreviewYaw=0;depth=9;
  // The catalog model is loaded asynchronously. Disable orbit immediately:
  // a wheel turn during this interval must not accidentally zoom the camera.
  if(orbit && orbitBeforePlacement===null){
   orbitBeforePlacement={enabled:orbit.enabled,zoom:orbit.enableZoom,rotate:orbit.enableRotate,pan:orbit.enablePan};
   orbit.enabled=false;orbit.enableZoom=false;orbit.enableRotate=false;orbit.enablePan=false;
  }
  try{
   const nextGhost=await template(catalogId);
   if(generation!==placementGeneration)return false; // stale async model load
   ghost=nextGhost;placing=catalogId;previewPending=false;
   ghost.rotation.y=pendingPreviewYaw;
   ghost.name='preview placement';
   ghost.traverse(o=>{if(!o.isMesh)return;
    const ghostMaterial=m=>{
     const clone=m.clone();clone.transparent=true;clone.opacity=.45;clone.depthWrite=false;
     return clone;
    };
    o.material=Array.isArray(o.material)?o.material.map(ghostMaterial):ghostMaterial(o.material);
   });
   building.group.add(ghost);
   refreshPlacement();
   return true;
  }catch(error){
   if(generation===placementGeneration)stopPlacement();
   throw error;
  }
 }
 function stopPlacement(){
  placementGeneration++;
  placing=null;previewPending=false;pendingPreviewYaw=0;
  if(ghost){ghost.removeFromParent();ghost=null}
  if(orbit && orbitBeforePlacement!==null){
   orbit.enabled=orbitBeforePlacement.enabled;orbit.enableZoom=orbitBeforePlacement.zoom;
   orbit.enableRotate=orbitBeforePlacement.rotate;orbit.enablePan=orbitBeforePlacement.pan;
   orbitBeforePlacement=null;
  }
  setGhostAppearance(true);
 }
 function currentPlacement(){
  if(!ghost||!placing)return null;
  const point=pointOnRay(),box=new THREE.Box3().setFromObject(ghost);
  grid.position.set(Math.round(point.x/10)*10,point.y+.016,Math.round(point.z/10)*10);
  ghost.position.set(snapSize?snap(point.x):point.x,
   point.y-(box.min.y-ghost.position.y),snapSize?snap(point.z):point.z);
  const verdict=checkBounds(new THREE.Box3().setFromObject(ghost));
  setGhostAppearance(verdict.valid,verdict.reason);
  return vector(ghost.position);
 }
 async function pointerDown(e){
  if(e.button!==0||transform.dragging||!canEdit())return;
  // Do not allow a click to enter camera look while an asset preview loads.
  if(previewPending){e.stopImmediatePropagation();return;}
  setPointer(e);
  if(placing){
   // Suppress the later navigation left-click pointer-lock handler. It
   // used to swivel the entire camera as a placed prop was confirmed.
   e.stopImmediatePropagation();
   const position=currentPlacement();
   if(!ghostValid){
    document.getElementById('placement-tip').textContent=ghostReason;
    return;
   }
   const rotation=vector(ghost.rotation);
   const id=placing;
   stopPlacement();
   await onPlace(id,position,rotation);
   return;
  }
  const hits=raycaster.intersectObjects([...objects.values()],true);
  for(const h of hits){
   const o=findObject(h.object);
   if(o){e.stopImmediatePropagation();select(o.userData.editorId);return;}
  }
 }
 function pointerMove(e){if(!placing)return;setPointer(e);currentPlacement();}
 function refreshPlacement(){
  if(!ghost||!placing)return;
  if(document.pointerLockElement===domElement)pointer.set(0,0);
  raycaster.setFromCamera(pointer,camera);
  currentPlacement();
 }
 function onWheel(e){
  // New-model preview, including its async loading window: wheel rotates
  // the prop; Shift+wheel changes distance. Neither should zoom the camera.
  if(placing||previewPending){
   e.preventDefault();e.stopImmediatePropagation();
   if(!e.deltaY)return;
   if(e.shiftKey)depth=Math.min(120,Math.max(.75,depth+Math.sign(e.deltaY)));
   else if(ghost)ghost.rotation.y-=Math.sign(e.deltaY)*Math.PI/12;
   else pendingPreviewYaw-=Math.sign(e.deltaY)*Math.PI/12;
   if(ghost)currentPlacement();
   return;
  }
  // Existing/just-placed selected props also rotate with the normal wheel.
  // Shift+wheel deliberately keeps camera zoom available while selected.
  if(!selected||e.shiftKey||!canEdit())return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!e.deltaY||transform.dragging)return;
  const id=selected,turn=-Math.sign(e.deltaY)*Math.PI/12;
  wheelTransforms=wheelTransforms.catch(()=>{}).then(async()=>{
   if(selected!==id||!objects.get(id)?.visible)return;
   const next=pose(objects.get(id));
   next.rotation.y+=turn;
   // Reuse the normal change/validation/save pipeline, including undo/redo,
   // collision protection and the selected item's inspector fields.
   await onTransform(id,next);
  }).catch(error=>console.error('Builder wheel rotation failed',error));
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
 domElement.addEventListener('wheel',onWheel,{passive:false,capture:true});
 return {
  building,objects,select,applyDraft,beginPlacement,stopPlacement,setTransformMode,refreshPlacement,
  get placing(){return !!placing},
  get placementPending(){return previewPending},
  get isGizmoActive(){return !!transform.axis||transform.dragging},
  get placementValidity(){return {valid:ghostValid,reason:ghostReason}},
  get placementPosition(){return ghost?vector(ghost.position):null},
  get placementRotation(){return ghost?vector(ghost.rotation):null},
  validatePose,validateNewPlacement,validateBounds:box=>checkBounds(box),
  setPlacementOptions:({gridSize=snapSize,overlap=allowClipping}={})=>{
   if(![0,.25,.5,1].includes(gridSize))throw Error('Invalid grid size');
   snapSize=gridSize;allowClipping=!!overlap;
   transform.setTranslationSnap(snapSize||null);
   grid.visible=snapSize>0;
   // Grid spacing must match the actual snap distance, not stay at .5m.
   const gridStep=snapSize||.5;
   const divisions=Math.round(200/gridStep);
   const newGrid=new THREE.GridHelper(200,divisions,0x8ba198,0x455a58);
   grid.geometry.dispose();grid.geometry=newGrid.geometry;
   newGrid.material.dispose();
   grid.position.y=0.018;
   if(placing)refreshPlacement();
   return {gridSize:snapSize,allowClipping};
  },
  poseOf:id=>objects.has(id)?pose(objects.get(id)):null,
  addPlacementSurfaces:surfaces=>{
   for(const surface of surfaces){if(surface?.isMesh)floors.push(surface)}
   return floors.length;
  },
  pickAt:(x,y)=>{setPointer({clientX:x,clientY:y});return pointOnRay()},
  get selected(){return selected},
  dispose(){
   domElement.removeEventListener('pointerdown',pointerDown);
   domElement.removeEventListener('pointermove',pointerMove);
   domElement.removeEventListener('wheel',onWheel,true);
   stopPlacement();transform.detach();scene.remove(transform.getHelper());transform.dispose();
   scene.remove(grid);grid.geometry.dispose();grid.material.dispose();building.dispose();
  }
 };
}
