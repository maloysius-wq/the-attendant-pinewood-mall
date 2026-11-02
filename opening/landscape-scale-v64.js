/**
 * V64 review-only enlargement of the existing third-party Innerscene CC0
 * planter and shrub GLB clones. Transforms imported meshes ONLY.
 * No BoxGeometry/CylinderGeometry or generated plant/planter substitutes.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {MALL_PLANTER_SCALE_V64,MALL_PLANTERS_V64} from './landscape-layout-v64.mjs';

export function enlargeImportedLandscapeV64(stage,environment){
 if(environment?.state!=='ready'||environment?.landscape?.state!=='ready')return environment;
 const groups=stage.world.children.filter(o=>o.name?.startsWith('V63 imported CC0 exterior planter '));
 if(groups.length!==MALL_PLANTERS_V64.length)
  throw Error('V64 expected eight genuine GLB planter + shrub groups');
 const placements=[];
 for(const [i,group] of groups.entries()){
  if(group.children.length!==2||!group.children.some(o=>o.name.includes('weathering-steel-planter.glb'))||
    !group.children.some(o=>o.name.includes('rounded-landscape-shrub.glb')))
   throw Error('V64 can enlarge only authentic imported planter and shrub GLBs');
  const p=MALL_PLANTERS_V64[i];
  group.position.set(p.x,0,p.z);
  group.rotation.y=p.yaw;
  group.scale.setScalar(MALL_PLANTER_SCALE_V64);
  group.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(group);
  const size=box.getSize(new THREE.Vector3());
  if(size.x<2.25||size.y<2.35||size.x>3||size.y>3.3)
   throw Error('V64 enlarged planter has unexpected scale: '+size.toArray());
  placements.push({x:p.x,z:p.z,width:+size.x.toFixed(3),height:+size.y.toFixed(3)});
 }
 environment.landscape={
  ...environment.landscape,version:64,scaleFactor:MALL_PLANTER_SCALE_V64,
  positions:placements
 };
 return environment;
}
