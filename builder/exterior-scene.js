import * as THREE from '../vendor/three/build/three.module.js';
import {makeOpeningScene} from '../opening/scene.js';
import {installAbandonedFacadeV65} from '../opening/facade-v65.js';
import {enlargeImportedLandscapeV64} from '../opening/landscape-scale-v64.js';
import {getCinematicFrontWallV90} from './room-wall-layout-v90.mjs';

// Mount the SAME locally licensed exterior staging as the opening cinematic.
// Only the Builder sees these extra meshes; its original campaign is untouched.
export async function mountCinematicParkingLot({scene,building}){
 const stage=makeOpeningScene({useImportedLandscape:true,useAbandonedFacade:true});
 const [environment,facade]=await Promise.all([
  stage.assetReady,installAbandonedFacadeV65(stage)
 ]);
 if(environment?.state!=='ready'||environment.car!=='loaded'||facade?.state!=='ready')
  throw Error('Opening cinematic exterior assets did not finish loading');
 enlargeImportedLandscapeV64(stage,environment);
 // The cinematic replaces the canonical front wall with thicker real meshes.
 // Measure their room-facing surface AND the opening/header, not the hidden wall.
 const frontWall=getCinematicFrontWallV90(stage);
 const asphalt=stage.world.children.find(o=>
  o.isMesh&&o.geometry?.parameters?.width===115&&
  o.geometry.parameters.height===.43&&o.geometry.parameters.depth===88);
 if(!asphalt)throw Error('Cinematic 115 x 88 m parking slab was not found');
 const planters=stage.world.children.filter(o=>o.name?.startsWith('V63 imported CC0 exterior planter '));
 if(planters.length!==8)throw Error('Expected eight opening cinematic planters');
 const parkingPaint=stage.world.getObjectByName('V84 coherent mall parking-space and street PAINT',true);
 const parkingProps=stage.world.getObjectByName('V84 sourced CC0 parking-lot bins and struggling trees',true);
 if(!parkingPaint?.userData.paintedOnly||parkingPaint.userData.markingCounts.stalls<150)
  throw Error('Opening cinematic coherent parking lines are missing');
 if(!parkingProps||parkingProps.children.length!==8)
  throw Error('Expected all eight licensed CC0 lot trees and trash receptacles');
 const deadTrees=parkingProps.children.filter(o=>o.userData.assetId?.startsWith('cc0-dead-tree-'));
 if(deadTrees.length!==4||deadTrees.some(o=>!o.userData.sourcePath?.startsWith('opening/assets/v85/')))
  throw Error('Expected four genuinely leafless source-licensed exterior trees');
 const rooted=deadTrees.filter(o=>Number.isInteger(o.userData.planterIndex));
 if(rooted.length!==3||rooted.some(o=>Math.abs(o.position.y-1.1)>.01))
  throw Error('The cinematic must show three leafless trees rooted in real front planters');

 // This matches the canonical cinematic's one-world handoff: retire only the
 // duplicate front elevation of the canonical mall, never its architecture.
 building.facade.group.visible=false;
 let hiddenFrontWalls=0;
 building.group.traverse(o=>{
  if(o.userData?.boundary?.id?.startsWith('front_original_')){
   o.visible=false;hiddenFrontWalls++;
  }
 });
 if(hiddenFrontWalls<2)throw Error('Cannot retire duplicate canonical mall frontage');
 stage.pivot.visible=false; // Builder's own operable service door is authoritative.
 stage.world.name='Opening cinematic exterior (Builder preview)';
 scene.add(stage.world);
 // Reuse the real parking lamp light rig without brightening the indoor mall.
 const lamps=stage.scene.children.filter(o=>o.isPointLight&&o.position.z>0);
 for(const lamp of lamps)scene.add(lamp);
 if(stage.scene.background?.isTexture)scene.background=stage.scene.background;

 // Transparent raycast-only walk surfaces: props land directly on parking
 // asphalt and the raised cracked pedestrian sidewalk instead of floating.
 function placementPlane(width,depth,y,z,label){
  const plane=new THREE.Mesh(
   new THREE.PlaneGeometry(width,depth),
   new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})
  );
  plane.name=label;plane.rotation.x=-Math.PI/2;plane.position.set(0,y,z);
  scene.add(plane);return plane;
 }
 const surfaces=[
  placementPlane(115,88,-.005,24.5,'Builder parking asphalt placement'),
  placementPlane(103,9.6,.04,-17.55,'Builder front sidewalk placement')
 ];
 const state={
  ready:true,sedanLoaded:stage.car.children.length>0,
  facadeLoaded:facade.state==='ready',planterCount:planters.length,
  placementSurfaces:surfaces.length,hiddenFrontWalls,
  markedStalls:parkingPaint.userData.markingCounts.stalls,
  paintedSegments:parkingPaint.userData.markingCounts.segments,
  licensedParkingProps:parkingProps.children.length,
  leaflessDeadTrees:deadTrees.length,
  frontageDeadTrees:rooted.length,
  frontWallSegments:frontWall.segments.length,
  frontWallInteriorZ:frontWall.interiorFaceZ
 };
 return {
  state,placementSurfaces:surfaces,frontWall,
  dispose(){
   for(const surface of surfaces){scene.remove(surface);surface.geometry.dispose();surface.material.dispose()}
   for(const lamp of lamps)scene.remove(lamp);
   scene.remove(stage.world);
  }
 };
}
