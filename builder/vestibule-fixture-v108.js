import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {VESTIBULE_LIGHT_POINT_V107} from './vestibule-patina-plan-v107.mjs';

// Already pinned and CC0-licensed in the v1 Builder vendor catalog. This is
// an actual fluorescent panel, housing, metal frame and source emissive lens,
// not a new hand-built placeholder or a third-party runtime fetch.
export const VESTIBULE_FIXTURE_ASSET_V108=
 'assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-ceiling-fluorescent-0299417a.glb';

const boundsSnapshot=b=>({
 min:{x:b.min.x,y:b.min.y,z:b.min.z},
 max:{x:b.max.x,y:b.max.y,z:b.max.z}
});

export async function mountVestibuleCeilingFixtureV108(building){
 const point=VESTIBULE_LIGHT_POINT_V107;
 const slabs=building.shells.flatMap(shell=>shell.ceilings||[]).filter(
  p=>p.room==='service_vestibule'&&
  point.x>p.x1+1.05&&point.x<p.x2-1.05&&
  point.z>p.z1+1.05&&point.z<p.z2-1.05);
 if(slabs.length!==1)throw Error('Vestibule light does not fall inside one real ceiling slab');
 const slab=slabs[0],underside=slab.y-slab.thickness/2;
 if(underside<3.2||underside>3.5)throw Error('Contractor ceiling changed, inspect fixture mount');
 const model=(await new GLTFLoader().loadAsync(
  new URL('../'+VESTIBULE_FIXTURE_ASSET_V108,import.meta.url).href)).scene;
 model.name='V108 original licensed fluorescent ceiling fixture';
 // The source panel's local +Y side has the metal strip and glass. Turn its
 // lit side DOWN, then recess the source ceiling tile just below the true
 // room underside. This keeps the actual 2m x 2m panel visible in the
 // textured ceiling, rather than leaving the old glowing orb in midair.
 model.rotation.x=Math.PI;
 model.position.set(point.x,underside-.025,point.z);
 model.updateMatrixWorld(true);
 const bbox=new THREE.Box3().setFromObject(model),size=bbox.getSize(new THREE.Vector3());
 if(size.x<1.7||size.x>2.5||size.z<1.7||size.z>2.5||
  size.y<.10||size.y>.55||bbox.max.y>underside-.003||
  bbox.min.y>underside-.17)
  throw Error('Pinned fixture no longer mounts flush to the vestibule ceiling');
 const lenses=[],ownedMaterials=new Set(),ownedGeometries=new Set(),ownedTextures=new Set();
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.raycast=()=>{};o.castShadow=false;o.receiveShadow=true;
  if(o.geometry)ownedGeometries.add(o.geometry);
  const originalMaterials=Array.isArray(o.material)?o.material:[o.material];
  const next=originalMaterials.map(mat=>{
   const material=mat.clone();
   ownedMaterials.add(material);
   // The actual source GLB has a named light material with an emissive
   // factor. Animate THAT material, not an invented glowing card.
   if(/^(light|emissive|lamp|fluorescent)$/i.test(material.name)){
    if(!material.emissive||!material.color)throw Error('Source fluorescent lens is not emissive');
    lenses.push({
     material,baseEmissive:material.emissive.clone(),
     baseColor:material.color.clone(),baseIntensity:material.emissiveIntensity||1
    });
   }
   for(const prop of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'])
    if(material[prop])ownedTextures.add(material[prop]);
   return material;
  });
  o.material=Array.isArray(o.material)?next:next[0];
 });
 if(!lenses.length)throw Error('Pinned fluorescent fixture lacks its real lit lens');
 const lensMeshes=[];model.traverse(o=>{
  if(o.isMesh&&lenses.some(l=>l.material===o.material||
   (Array.isArray(o.material)&&o.material.includes(l.material))))lensMeshes.push(o);
 });
 if(!lensMeshes.length)throw Error('Cannot locate physical fluorescent lens');
 const lensBox=new THREE.Box3();
 for(const mesh of lensMeshes)lensBox.expandByObject(mesh);
 const emitter={x:point.x,y:lensBox.getCenter(new THREE.Vector3()).y-.06,z:point.z};
 if(emitter.y<2.95||emitter.y>=underside-.045)
  throw Error('Fixture light source is not below its ceiling mount');
 // This is Builder-only preview geometry, independently hidden by the
 // existing Roof / ceilings toggle, never part of a user's saved draft.
 building.ceilings.add(model);
 let level=1,disposed=false;
 function setLevel(next){
  if(!Number.isFinite(next)||next<0||next>1)throw Error('Invalid fixture lens level');
  level=next;
  for(const l of lenses){
   l.material.emissive.copy(l.baseEmissive).multiplyScalar(next);
   l.material.emissiveIntensity=l.baseIntensity*1.1;
   l.material.color.copy(l.baseColor).multiplyScalar(.21+.79*next);
  }
 }
 const getState=()=>({
  asset:VESTIBULE_FIXTURE_ASSET_V108,
  source:'existing pinned CC0 Backrooms and Liminal Spaces Kit',
  mounted:true,ceilingUnderside:underside,
  modelBounds:boundsSnapshot(bbox),size:{x:size.x,y:size.y,z:size.z},
  emitter:{...emitter},lensCount:lenses.length,lensLevel:level,
  visibleInScene:model.visible&&building.ceilings.visible,underCeilingGroup:model.parent===building.ceilings
 });
 return {
  model,emitter,setLevel,getState,
  dispose(){
   if(disposed)return;disposed=true;
   model.removeFromParent();
   for(const g of ownedGeometries)g.dispose();
   for(const m of ownedMaterials)m.dispose();
   for(const t of ownedTextures)t.dispose();
  }
 };
}
