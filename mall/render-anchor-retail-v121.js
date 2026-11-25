/**
 * V121: only 12 individually source-pinned *actual* 1979 retail fittings.
 * All underlying GLBs were independently loaded, SHA verified, and seen in
 * real desktop Three.js screenshots before these locations were authorized.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ORIGINAL_ANCHOR_FIXTURES_V121,validateAnchorLayoutV121} from './anchor-layout-v121.mjs';
import {stockFallowDisplaysV160} from './fallow-cartons-v160.js';
import {FALLOWS_SOURCE_DIMENSIONS_V160} from './fallows-sources-v160.mjs';

function cubbyFront(model){
 model.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(model),d=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3()),ray=new THREE.Raycaster();
 const scores=[1,-1].map(sign=>{
  let total=0;
  for(const u of [-.32,-.16,0,.16,.32])for(const h of [.22,.35,.48,.61,.74,.87]){
   ray.set(new THREE.Vector3(c.x+d.x*u,b.min.y+d.y*h,c.z+sign*(d.z/2+.04)),new THREE.Vector3(0,0,-sign));
   const hit=ray.intersectObject(model,true)[0];total+=hit?Math.max(0,Math.min(1,(hit.distance-.04)/d.z)):1;
  }
  return {sign,score:total};
 });
 return scores[1].score>scores[0].score+.001?-1:1;
}
function placeOriginalModel(gltf,f,parent,owned){
 const model=gltf.scene.clone(true);
 const front=f.source==='wall_cubbies'?cubbyFront(model):1;
 model.rotation.y=f.yaw+(front<0?Math.PI:0);
 model.updateMatrixWorld(true);
 const original=new THREE.Box3().setFromObject(model),size=original.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.x+size.y+size.z)||size.y<.005)
  throw Error('CC0 original retail fixture has invalid dimension '+f.id);
 const scale=f.targetHeight/size.y;
 model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(model),dim=bounds.getSize(new THREE.Vector3());
 if(Math.abs(dim.y-f.targetHeight)>.001||Math.hypot(dim.x/2,dim.z/2)>f.collisionRadius+.005)
  throw Error('Pinned authentic retail model protrudes beyond source collision / target: '+f.id+
   ' size='+JSON.stringify(dim.toArray()));
 if(f.room==='west_anchor'){
  const known=FALLOWS_SOURCE_DIMENSIONS_V160[f.source],turn=Math.abs(Math.sin(f.yaw))>.5;
  if(known&&Math.max(Math.abs(dim.x-known[turn?2:0]),Math.abs(dim.z-known[turn?0:2]))>.012)
   throw Error('V160 real GLB footprint no longer matches authoritative collider '+f.id);
 }
 const center=bounds.getCenter(new THREE.Vector3());
 model.position.set(f.x-center.x,f.baseY-bounds.min.y,f.z-center.z);
 model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);dim=bounds.getSize(new THREE.Vector3());
 if(Math.abs(bounds.min.y-f.baseY)>.015)
  throw Error('Original retail store GLB is not actually ground seated '+f.id);
 model.name='v121_original_store_fixture_'+f.id;
 model.userData.originalRetailV121={id:f.id,source:f.source,sha256:f.sha256};
 model.traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=false;
  if(f.room==='west_anchor'){
   const copy=m=>{const n=m.clone();owned.push(n);if(n.color){
    if(/carcass/i.test(n.name))n.color.multiply(new THREE.Color(0xb29d79));
    else if(/surface/i.test(n.name))n.color.multiply(new THREE.Color(0xd0b18a));
    else n.color.multiplyScalar(.72);
   }return n;};
   o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);
  }
 }});
 parent.add(model);
 return {id:f.id,room:f.room,source:f.source,license:f.license,model:f.model,
  sha256:f.sha256,x:f.x,z:f.z,yaw:f.yaw,measuredHeight:dim.y,
  width:dim.x,depth:dim.z,colliderRadius:f.collisionRadius,
  groundY:bounds.min.y,...(f.source==='wall_cubbies'?{sourceFrontV160:front}: {})};
}

export async function renderAnchorRetailV121(ground,plan=ORIGINAL_ANCHOR_FIXTURES_V121){
 if(!ground?.isObject3D)throw Error('Original CC0 tenant fittings need source ground-floor scene');
 const problems=validateAnchorLayoutV121(plan);
 if(problems.length)throw Error('Original retail 1979 source geometry invalid: '+problems.join(' | '));
 const originals=[...new Set(plan.map(f=>f.model))];
 const loader=new GLTFLoader();
 const loaded=new Map(await Promise.all(originals.map(async path=>{
  if(!path.startsWith('assets/vendor/builder/models/')||!path.endsWith('.glb'))
   throw Error('V121 tried to remotely load a non-source 3D retail model '+path);
  const gltf=await loader.loadAsync(new URL('../'+path,import.meta.url).href);
  return [path,gltf];
 })));
 const group=new THREE.Group();group.name='V121 verified 1979 original retail anchor floor fittings';
 const owned=[];
 const manifest=plan.map(f=>placeOriginalModel(loaded.get(f.model),f,group,owned));
 // By attaching only after all local loads, scaled bounds, grounding, and
 // source collision checks pass, the first visible game/cinematic frame
 // never exposes half-loaded fixtures or missing 3D models.
 const cartons=stockFallowDisplaysV160(group,plan,manifest);
 ground.add(group);
 return {
  group,manifest,uniquePinnedModels:originals.length,
  dispose(){cartons.dispose();owned.forEach(m=>m.dispose());ground.remove(group);}
 };
}
