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
// The original sign face gradients across these deep weathered green values.
const PINEWOOD_SIGN_GREEN='#21332f';
function weatherPlanter(pot){
 pot.traverse(o=>{
  if(!o.isMesh)return;
  o.material=(Array.isArray(o.material)?o.material:[o.material]).map(original=>{
   const aged=original.clone();
   aged.color.set(PINEWOOD_SIGN_GREEN);
   aged.roughness=.94;aged.metalness=.13;aged.needsUpdate=true;
   return aged;
  });
  if(o.material.length===1)o.material=o.material[0];
 });
}
function witherShrub(shrub,index){
 // Keep the actual imported shrub geometry: transform its foliage in place.
 // Uneven droop and three earthy leaf shades replace the healthy, topiary
 // silhouette without adding procedural primitive-model substitutes.
 const dried=new THREE.Color('#977a54'),olive=new THREE.Color('#62634a'),
  dead=new THREE.Color('#504536');
 shrub.rotation.x=((index*7)%5-2)*.018;
 shrub.rotation.z=((index*11)%7-3)*.019;
 shrub.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.geometry?.getAttribute('position'))return;
  const geometry=mesh.geometry.clone(),position=geometry.getAttribute('position');
  geometry.computeBoundingBox();
  const bounds=geometry.boundingBox,
   height=Math.max(.01,bounds.max.y-bounds.min.y),
   shades=new Float32Array(position.count*3);
  for(let i=0;i<position.count;i++){
   const x=position.getX(i),y=position.getY(i),z=position.getZ(i),
    t=Math.max(0,Math.min(1,(y-bounds.min.y)/height)),
    noise=Math.sin(x*3.71+z*5.63+index*2.1),
    angle=Math.sin(x*2.07-z*3.47+index*.93);
   // Higher leaf clusters sag and lean in irregular directions; roots stay.
   position.setXYZ(i,
    x+(noise*.055+Math.sin(index*2.1)*.036)*t*t,
    y-(.018+.033*(.5+.5*angle))*t*t,
    z+(angle*.061+Math.cos(index*1.7)*.028)*t*t);
   const patch=Math.sin(x*7.2+z*2.9+index*.78)*Math.cos(y*4.7-z*3.2);
   const color=dead.clone().lerp(dried,.35+.28*(patch+1))
     .lerp(olive,.08+.33*Math.max(0,noise));
   shades[i*3]=color.r;shades[i*3+1]=color.g;shades[i*3+2]=color.b;
  }
  position.needsUpdate=true;geometry.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));
  geometry.computeVertexNormals();geometry.computeBoundingSphere();
  mesh.geometry=geometry;
  const weather=original=>{
   const m=original.clone();m.vertexColors=true;m.color.set('#d8cbb8');
   // The imported greens must not color the dead leaves back to healthy.
   m.map=null;m.roughness=.98;m.metalness=0;m.needsUpdate=true;return m;
  };
  mesh.material=Array.isArray(mesh.material)?mesh.material.map(weather):weather(mesh.material);
 });
}
function boundsOf(model){
 model.updateMatrixWorld(true);
 return new THREE.Box3().setFromObject(model);
}

export async function installMallPlantersV63(world,{decayed=false}={}){
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
  if(decayed)weatherPlanter(pot);
  planting.add(pot);
  const bush=shrubSource.clone(true);
  bush.name='Innerscene CC0 rounded-landscape-shrub.glb';
  bush.scale.setScalar(spot.shrubScale);
  // The GLB's original root sits on the planter's imported soil surface.
  bush.position.y=.55-shrubBounds.min.y*spot.shrubScale;
  bush.rotation.y=i*1.3;
  if(decayed)witherShrub(bush,i);
  planting.add(bush);
  world.add(planting);
  groups.push(planting);
 }
 return{
  state:'ready',count:groups.length,source:'Innerscene CC0 imported GLBs',
  decayed,planterColor:decayed?PINEWOOD_SIGN_GREEN:null,
  modelFiles:['weathering-steel-planter.glb','rounded-landscape-shrub.glb'],
  positions:MALL_PLANTERS_V63.map(({x,z})=>({x,z})),
  bounds:{planter:potSize.toArray().map(x=>+x.toFixed(3)),
    shrub:bushSize.toArray().map(x=>+x.toFixed(3))}
 };
}
