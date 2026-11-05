/**
 * V75: exact user-selected scailman "Low-Poly Sedan Car" GLB.
 * Preserve the original roof, seats, controls, doors, and window geometry.
 * Original Sketchfab author: https://sketchfab.com/3d-models/low-poly-sedan-car-aeb2699532b4402e8b75ec8888b800b9
 * Licensed CC BY 4.0. Only transforms/material tuning/door articulation here.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {CAR_DOOR_OPEN_PHASE,CAR_DOOR_CLOSE_DELAY_SECONDS} from './cinematic-sfx-cues-v82.mjs?v=84';

const assetBase=new URL('./assets/v75/',import.meta.url);
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=t=>{const u=clamp(t);return u*u*(3-2*u)};
const toWorld=(car,p)=>car.localToWorld(new THREE.Vector3(...p));
const round=n=>+n.toFixed(3);

export async function installSedanV75({car,stage,status,loader}){
 const response=await fetch(new URL('manifest.json',assetBase),{cache:'no-store',mode:'same-origin'});
 if(!response.ok)throw Error('User-selected sedan manifest unavailable: HTTP '+response.status);
 const meta=await response.json();
 if(meta.version!==75||meta.model!=='low-poly_sedan_car.glb'
   ||meta.license!=='CC-BY-4.0'||meta.creator!=='scailman'
   ||meta.meshes!==44||meta.frontLeftDoor!=='FL_Door'
   ||meta.sha256!=='224db7dfd80b36dccf868f8bc71e221a284df6b8e7dca9986843c382c7722b7e')
   throw Error('Unexpected or altered licensed sedan manifest');
 const model=await loader.loadAsync(new URL(meta.model,assetBase).href);
 const original=model.scene;
 original.name='Complete scailman CC-BY-4.0 Low-Poly Sedan';
 // The source points +Z and uses +X for the driver's left-hand side.
 // Turn the complete vendor assembly toward the mall (-Z) without mirroring it.
 original.rotation.y=Math.PI;
 original.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(original);
 const sourceSize=bounds.getSize(new THREE.Vector3());
 if(Math.abs(sourceSize.x-meta.untransformedWidth)>.06)
  throw Error('Sedan source dimensions differ from inspected GLB');
 original.scale.multiplyScalar(meta.targetWidthM/sourceSize.x);
 original.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(original);
 const center=bounds.getCenter(new THREE.Vector3());
 original.position.set(-center.x,-bounds.min.y,-center.z);
 original.updateMatrixWorld(true);
 const dimensions=new THREE.Box3().setFromObject(original).getSize(new THREE.Vector3());
 const door=original.getObjectByName('FL_Door');
 if(!door)throw Error('Sedan original front-left door hierarchy is missing');
 let meshCount=0,glassCount=0;
 original.traverse(node=>{
  if(!node.isMesh)return;
  meshCount++;
  const glass=/Windows/i.test(node.name||'');
  for(const material of Array.isArray(node.material)?node.material:[node.material]){
   if(!material)continue;
   // Model GLB's unified window surface is too opaque for a playable
   // first-person shot. Tune material only, not its mesh or position.
   if(glass||/Windows/i.test(material.name||'')){
    glassCount++;
    material.transparent=true;material.opacity=.09;
    material.side=THREE.DoubleSide;material.depthWrite=false;
    if('roughness' in material)material.roughness=.12;
    material.needsUpdate=true;
   }else if(material.color){
    if(/Chassis/i.test(material.name||''))material.color.setHex(0x303e48);
    else if(/InteriorPanel/i.test(material.name||''))material.color.multiplyScalar(.72);
    material.side=THREE.FrontSide;material.needsUpdate=true;
   }
  }
 });
 if(meshCount!==meta.meshes||glassCount<1)throw Error('Sedan meshes or windows missing: '+meshCount+'/'+glassCount);
 car.add(original);car.updateWorldMatrix(true,true);
 const eye=toWorld(car,meta.driverEyeLocal);
 // Roof measurement is a downward ray from outside the source shell. This
 // avoids relying on inside-facing normals of intentionally one-sided panels.
 const roofHits=new THREE.Raycaster(
  toWorld(car,[meta.driverEyeLocal[0],2.4,meta.driverEyeLocal[2]]),
  new THREE.Vector3(0,-1,0),.1,1.75)
  .intersectObject(original,true).filter(h=>h.point.y>eye.y+.08);
 const roof=roofHits[0];
 const roofDistance=roof?roof.point.y-eye.y:null;
 status.roofRayDistance=roofDistance===null?null:round(roofDistance);
 status.roofHeight=roof?round(roof.point.y):null;
 status.overheadSurfaces=roofHits.slice(0,6).map(h=>({
   mesh:h.object.name,height:round(h.point.y),glass:/window/i.test(h.object.name)
 }));
 // A real front-left driver's door on its original Blender/GLB hinge.
 const closedAngle=door.rotation.y;
 const movement={
  status:{side:'FL_Door',angle:closedAngle,openFraction:0},
  update(cue,phase,elapsedSeconds=0,waitSeconds=0){
   // Door starts opening at .06; it remains fully open for the physical exit,
   // and the real mesh closes five seconds after the matching opening sound.
   const startClose=waitSeconds*CAR_DOOR_OPEN_PHASE+CAR_DOOR_CLOSE_DELAY_SECONDS;
   const fraction=cue==='owner'
    ?smooth((phase-CAR_DOOR_OPEN_PHASE)/.14)*(1-smooth((elapsedSeconds-startClose)/.65))
    :0;
   door.rotation.y=closedAngle-1.45*fraction;
   this.status={side:'FL_Door',angle:door.rotation.y,openFraction:fraction};
  }
 };
 stage.sedanDoor=movement;
 stage.sedanV75={model:original,door,manifest:meta};
 const dashGlow=new THREE.PointLight(0xc2d3dc,.48,2.3,2);
 dashGlow.position.set(-.24,1.13,-.55);car.add(dashGlow);
 status.car='loaded';
 status.carBounds=dimensions.toArray().map(round);
 status.measuredCarBounds=status.carBounds;
 status.carYawDeg=180;status.forwardAxis='-Z';
 status.modelMeshes=meshCount;status.windows=glassCount;
 status.cockpit={
  construction:'complete-original-scailman-low-poly-sedan',
  source:meta.model,sourceSha256:meta.sha256,license:meta.license,
  creator:meta.creator,vendorOnly:true,meshes:meshCount,
  hasOriginalRoof:true,originalRoof:true,transparentWindows:true,
  authorCreatedBodyMeshes:0,authoredCarMeshes:0,authoredWindshields:0,
  phoneMounts:0,phoneScreens:0
 };
 status.forwardHits=new THREE.Raycaster(eye,new THREE.Vector3(0,0,-1),.18,4)
  .intersectObject(original,true).slice(0,6).map(h=>({mesh:h.object.name,d:round(h.distance)}));
 status.cockpitViewRays=[-.15,0,.15].map(x=>{
  const hit=new THREE.Raycaster(eye,new THREE.Vector3(x,0,-1).normalize(),.18,.50)
   .intersectObject(original,true)[0];
  return hit?round(hit.distance):null;
 });
 return original;
}
