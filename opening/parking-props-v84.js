import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {PARKING_PROPS_V84} from './parking-layout-v84.mjs';

/** These are 100% original, locally vendored, source-verified CC0 GLBs.
 * Never make a replacement tree, receptacle, or other procedural model.
 */
export async function installParkingPropsV84(world){
 const [response,treeResponse]=await Promise.all([
  fetch(new URL('../assets/vendor/builder/catalog-v1.json',import.meta.url)),
  fetch(new URL('./assets/v85/manifest.json',import.meta.url))
 ]);
 if(!response.ok||!treeResponse.ok)
  throw Error('Local CC0 exterior-prop provenance unavailable');
 const catalog=await response.json(),treeManifest=await treeResponse.json();
 if(treeManifest.version!==85||treeManifest.license!=='CC0-1.0'||treeManifest.models?.length!==2)
  throw Error('Unrecognized pinned leafless-tree manifest');
 const expected=new Map([
  ['cc0-dead-tree-gothic','41d6b432268e7bc44a1c2ebfcf06de1340a1f20577ca1ac258c0f7c7179ac618'],
  ['cc0-dead-tree-survival','26c0b53ba23f740e1e6d2a40582783767ea9e1fb638f3801f8d9d935cee54e8b']
 ]);
 const lookup=new Map(catalog.models.map(m=>[m.id,m]));
 for(const model of treeManifest.models){
  if(!expected.has(model.id)||expected.get(model.id)!==model.sha256||
   model.original!==true||model.leafless!==true||
   !['opening/assets/v85/dead-tree-gothic.glb','opening/assets/v85/dead-tree-survival.glb'].includes(model.path))
   throw Error('Unexpected unverified source-authored dead tree '+model.id);
  lookup.set(model.id,model);
 }
 const wanted=[...new Set(PARKING_PROPS_V84.map(p=>p.assetId))];
 const loader=new GLTFLoader();
 const sources=await Promise.all(wanted.map(async id=>{
  const item=lookup.get(id);
  if(!item||item.license!=='CC0-1.0'||
    !/^(?:assets\/vendor\/builder\/models\/[a-z0-9/_-]+|opening\/assets\/v85\/dead-tree-[a-z]+)\.glb$/.test(item.path)||
    !/^[a-f0-9]{64}$/.test(item.sha256))
    throw Error('Unverified or nonlocal exterior asset: '+id);
  const gltf=await loader.loadAsync(new URL('../'+item.path,import.meta.url).href);
  return [id,{item,scene:gltf.scene}];
 }));
 const byId=new Map(sources),group=new THREE.Group();
 group.name='V84 sourced CC0 parking-lot bins and struggling trees';
 for(const prop of PARKING_PROPS_V84){
  const source=byId.get(prop.assetId),copy=source.scene.clone(true);
  copy.updateMatrixWorld(true);
  const measured=new THREE.Box3().setFromObject(copy),size=measured.getSize(new THREE.Vector3());
  const longest=Math.max(size.x,size.y,size.z);
  const factor=prop.targetMaxSpan?prop.targetMaxSpan/longest:prop.targetHeight/size.y;
  if(!Number.isFinite(factor)||factor<=0||factor>100)throw Error('Invalid real CC0 prop size: '+prop.id);
  copy.scale.multiplyScalar(factor);copy.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(copy),center=bounds.getCenter(new THREE.Vector3());
  copy.position.set(-center.x,-bounds.min.y,-center.z);
  const instance=new THREE.Group();
  instance.name='V84 licensed CC0 parking prop '+prop.id;
  instance.userData.parkingPropId=prop.id;
  instance.userData.assetId=prop.assetId;
  instance.userData.sourcePath=source.item.path;
  instance.userData.license='CC0-1.0';
  // Raised only for trees rooted in an existing enlarged licensed planter.
  // Their feet meet the planter's source-authored soil surface, not asphalt.
  instance.position.set(prop.x,prop.y??0,prop.z);instance.rotation.y=prop.yaw;
  copy.traverse(node=>{if(node.isMesh){node.castShadow=false;node.receiveShadow=true;}});
  instance.add(copy);group.add(instance);
 }
 world.add(group);
 return {state:'ready',group,count:group.children.length,
  sourceIds:wanted,assets:group.children.map(x=>x.name)};
}
