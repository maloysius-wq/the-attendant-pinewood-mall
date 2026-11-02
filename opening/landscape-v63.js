/**
 * V63 review-only exterior landscaping. Nothing visible is procedurally
 * modelled: BOTH the planter and its leafy shrub are independently sourced
 * Innerscene CC0 GLBs committed under opening/assets/v63/.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {MALL_PLANTERS_V63} from './landscape-layout-v63.mjs';

const assetBase=new URL('./assets/v63/',import.meta.url);
const loader=new GLTFLoader();
function localModel(filename){
 return new Promise((resolve,reject)=>{
  loader.load(new URL(filename,assetBase).href,loaded=>resolve(loaded.scene),undefined,reject);
 });
}
function boundsOf(model){
 model.updateMatrixWorld(true);
 return new THREE.Box3().setFromObject(model);
}

export async function installMallPlantersV63(world){
 const [planterSource,shrubSource]=await Promise.all([
  localModel('weathering-steel-planter.glb'),
  localModel('rounded-landscape-shrub.glb')
 ]);
 const planterBounds=boundsOf(planterSource),shrubBounds=boundsOf(shrubSource);
 const potSize=planterBounds.getSize(new THREE.Vector3());
 const bushSize=shrubBounds.getSize(new THREE.Vector3());
 if(potSize.x<1.0||potSize.x>1.4||potSize.y<.5||potSize.y>.8||
    bushSize.x<1.2||bushSize.x>1.7||bushSize.y<1.1||bushSize.y>1.7)
  throw Error('Imported CC0 planter/shrub have unexpected world-scale bounds');
 const groups=[];
 for(const [i,spot] of MALL_PLANTERS_V63.entries()){
  const planting=new THREE.Group();
  planting.name='V63 imported CC0 exterior planter '+(i+1);
  planting.position.set(spot.x,0,spot.z);
  planting.rotation.y=spot.yaw;
  const pot=planterSource.clone(true);
  pot.name='Innerscene CC0 weathering-steel-planter.glb';
  pot.position.y=-planterBounds.min.y;
  planting.add(pot);
  const bush=shrubSource.clone(true);
  bush.name='Innerscene CC0 rounded-landscape-shrub.glb';
  bush.scale.setScalar(spot.shrubScale);
  // The GLB's original root sits on the planter's imported soil surface.
  bush.position.y=.55-shrubBounds.min.y*spot.shrubScale;
  bush.rotation.y=i*1.3;
  planting.add(bush);
  world.add(planting);
  groups.push(planting);
 }
 return{
  state:'ready',count:groups.length,source:'Innerscene CC0 imported GLBs',
  modelFiles:['weathering-steel-planter.glb','rounded-landscape-shrub.glb'],
  positions:MALL_PLANTERS_V63.map(({x,z})=>({x,z})),
  bounds:{planter:potSize.toArray().map(x=>+x.toFixed(3)),
    shrub:bushSize.toArray().map(x=>+x.toFixed(3))}
 };
}
