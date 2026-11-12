/** Single source-model/decal visual factory for Builder and runtime v111.
 * Preserve physical fit, CRT-off texture, original peripheral parts,
 * photo-mapped material handling, source PBR, surface decals, and grime.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {EDITOR_CATALOG_BY_ID} from '../mall/editor-catalog-v1.mjs';
import {isDecalV97} from './decals-v97.js';
import {isSourcePeripheralV93,isolateSourcePeripheralV93} from './source-peripherals-v93.mjs';
import {makeCrtPoweredOffV96} from './crt-powered-off-v96.js';
import {weatherSourceBoardV100,attachBoardGrimeV100} from './peeling-poster-v100.mjs';
import {ageRealPlantV101} from './mood-materials-v101.mjs';

export function createSceneTemplatesV111({decalFactory,materialEnhancer}){
 if(!decalFactory?.make||!materialEnhancer?.enhance)
  throw Error('Scene templates require original decal and texture enhancer');
 const loader=new GLTFLoader(),cached=new Map();
 async function template(id){
  // Keep previously saved LCD instance IDs but draw the vetted 1990s CRT.
  // The discontinued flat-screen Kenney model stays in the provenance manifest.
  const sourceId=id==='kenney-furniture-kit-computerscreen'?'retro-crt-pc-1990s':id;
  const item=EDITOR_CATALOG_BY_ID.get(sourceId);if(!item)throw Error('Unknown local asset '+id);
  if(isDecalV97(item))return decalFactory.make(item);
  if(!/^assets\/vendor\/(?:runtime|builder\/models|builder\/vestibule-v98\/models|builder\/wall-decay-v100\/models|builder\/mood-v101\/models|builder\/decay-v105\/models)\//.test(item.path)||!/\.glb$/i.test(item.path))throw Error('Nonlocal asset forbidden');
  if(!cached.has(id))cached.set(id,loader.loadAsync(new URL('../'+item.path,import.meta.url).href));
  const gltf=await cached.get(id),o=gltf.scene.clone(true);
  // Target only the source CRT screen. All instances, including pre-existing
  // saved placements and the retired LCD's CRT alias, use this same template.
  makeCrtPoweredOffV96(o,sourceId);
  // Restore the literal original Kenney source materials + mesh copies for
  // standalone keyboards/mice. Do not conflate them with the image-mapped
  // keyboard and mouse already included in the licensed 1990s CRT GLB.
  if(isSourcePeripheralV93(sourceId))isolateSourcePeripheralV93(o,sourceId);
  if(item.materialStyle!=='image-mapped'&&!item.skipMaterialEnhancement)await materialEnhancer.enhance(o,item.label||id);
  weatherSourceBoardV100(o,sourceId);
  ageRealPlantV101(THREE,o,sourceId);
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
  await attachBoardGrimeV100(THREE,anchor,sourceId);
  return anchor;
 }
 return {template};
}
