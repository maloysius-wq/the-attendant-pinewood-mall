/**
 * V123: render actual, previously audited CC0 goods and returns INSIDE
 * the full shared mall. No prop gets a fabricated procedural replacement.
 * Stock on tables is seated to the top of existing original V121 GLB.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ORIGINAL_ANCHOR_STOCK_V123,validateAnchorStockLayoutV123} from './anchor-stock-layout-v123.mjs';

function mountSourceStock(ground,parent,gltf,f){
 const item=gltf.scene.clone(true);
 item.rotation.y=f.yaw;item.updateMatrixWorld(true);
 let box=new THREE.Box3().setFromObject(item),size=box.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.x+size.y+size.z)||size.y<.005)
  throw Error('V123 genuine CC0 merchandise source has invalid GLB geometry '+f.id);
 item.scale.multiplyScalar(f.targetHeight/size.y);item.updateMatrixWorld(true);
 box=new THREE.Box3().setFromObject(item);size=box.getSize(new THREE.Vector3());
 if(Math.abs(size.y-f.targetHeight)>.001)
  throw Error('V123 model physical height is not human-scaled '+f.id);
 const footprint=Math.hypot(size.x/2,size.z/2);
 let baseY=0,supportBounds=null;
 if(f.support){
  // The actual V121 source GLB is already attached by render-shell before
  // any stock is placed, and is the ONLY permitted tabletop support.
  const supporting=ground.getObjectByName('v121_original_store_fixture_'+f.support,true);
  if(!supporting)throw Error('V123 merchandise lacks actual V121 source table '+f.id);
  supportBounds=new THREE.Box3().setFromObject(supporting);
  const surface=supportBounds.getSize(new THREE.Vector3());
  if(Math.abs(supportBounds.getCenter(new THREE.Vector3()).x-f.x)>.03||
   Math.abs(supportBounds.getCenter(new THREE.Vector3()).z-f.z)>.03||
   size.x>surface.x*.90||size.z>surface.z*.90||
   surface.y<.8||surface.y>1.10)
   throw Error('V123 actual merchandise is unsupported or too large for true retail tabletop '+f.id);
  baseY=supportBounds.max.y;
 }else if(footprint>f.collisionRadius+.005){
  throw Error('V123 actual stock model exceeds its gameplay-collision radius '+f.id);
 }
 const center=box.getCenter(new THREE.Vector3());
 item.position.set(f.x-center.x,baseY-box.min.y,f.z-center.z);
 item.updateMatrixWorld(true);
 box=new THREE.Box3().setFromObject(item);size=box.getSize(new THREE.Vector3());
 if(Math.abs(box.min.y-baseY)>.01||box.max.y>2.35)
  throw Error('V123 merchandise floats off original display or exceeds period size '+f.id);
 if(supportBounds&&(
  box.min.x<supportBounds.min.x+.045||box.max.x>supportBounds.max.x-.045||
  box.min.z<supportBounds.min.z+.045||box.max.z>supportBounds.max.z-.045))
  throw Error('V123 stock overhangs real original display table '+f.id);
 item.name='v123_real_late_close_stock_'+f.id;
 item.userData.authenticOriginalStockV123={id:f.id,sha256:f.sha256,support:f.support};
 item.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 parent.add(item);
 return {
  id:f.id,room:f.room,source:f.source,license:f.license,model:f.model,sha256:f.sha256,
  x:f.x,z:f.z,support:f.support,actualWidth:size.x,actualDepth:size.z,
  actualHeight:size.y,groundY:box.min.y,collisionRadius:f.collisionRadius
 };
}
export async function renderAnchorStockV123(ground,plan=ORIGINAL_ANCHOR_STOCK_V123){
 if(!ground?.isObject3D)throw Error('V123 requires original G-level mall property');
 const errors=validateAnchorStockLayoutV123(plan);
 if(errors.length)throw Error('V123 authoritative physical retail stock invalid: '+errors.join(' | '));
 const paths=[...new Set(plan.map(f=>f.model))],loader=new GLTFLoader();
 const loaded=new Map(await Promise.all(paths.map(async path=>{
  if(!path.startsWith('assets/vendor/builder/models/')||!path.endsWith('.glb'))
   throw Error('V123 refused non-source local real retail object '+path);
  return [path,await loader.loadAsync(new URL('../'+path,import.meta.url).href)];
 })));
 const root=new THREE.Group();root.name='V123 actual 1979 merchandise and late-close counter returns';
 const manifest=plan.map(f=>mountSourceStock(ground,root,loaded.get(f.model),f));
 // Stage all 13 models BEFORE the first full scene frame can render.
 ground.add(root);
 return {root,manifest,uniqueLicensedModels:paths.length,dispose(){ground.remove(root)}};
}
