/** V127b real ceiling-mounted CC0 fluorescents and genuine masonry-attached
 * corridor detail. Not a separate scene, procedural furniture or a remote asset. */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ANNEX_SPINE_V127B,ANNEX_LAMP_SOURCE_V127B,ANNEX_LIGHTS_V127B,
 ANNEX_SIGNS_V127B,ANNEX_BULKHEADS_V127B,validateAnnexCirculationV127b}
 from './annex-circulation-plan-v127b.mjs';

function box(root,name,x,y,z,w,h,d,material){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 m.name=name;m.position.set(x,y,z);m.receiveShadow=true;root.add(m);return m;
}
function plateTexture(s){
 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=300;
 const c=canvas.getContext('2d');
 if(!c)throw Error('Annex sign print texture unavailable');
 c.fillStyle='#283e3d';c.fillRect(0,0,1024,300);
 c.fillStyle='#b9a477';c.fillRect(24,20,976,8);
 c.fillStyle='#d5dbd0';c.textAlign='center';c.textBaseline='middle';
 c.font='bold 106px Arial,sans-serif';c.fillText(s.text,512,124,930);
 c.fillStyle='#adbbad';c.font='bold 44px Arial,sans-serif';
 c.fillText(s.detail,512,236,920);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 return tex;
}
function panel(root,src,f,ceiling,materials){
 const slab=ceiling.find(c=>c.room===f.room&&f.x>c.x1+1.1&&
  f.x<c.x2-1.1&&f.z>c.z1+1.1&&f.z<c.z2-1.1);
 if(!slab)throw Error('missing true Annex service soffit '+f.id);
 const underside=slab.y-slab.thickness/2;
 const model=src.scene.clone(true);model.rotation.x=Math.PI;
 model.position.set(f.x,underside-.025,f.z);model.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),sz=bb.getSize(new THREE.Vector3());
 if(sz.x<1.7||sz.x>2.5||sz.z<1.7||sz.z>2.5||sz.y<.10||sz.y>.55||
  bb.max.y>underside-.003||bb.min.y>underside-.2)
  throw Error('Annex source fluorescent does not attach to its ceiling '+f.id);
 let lenses=0;
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=false;o.receiveShadow=true;o.raycast=()=>{};
  const map=mat=>{
   const m=mat.clone();materials.push(m);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(m.name)){
    if(!m.emissive)throw Error('missing CC0 lamp lens '+f.id);
    m.emissive.multiplyScalar(f.power);m.emissiveIntensity=(m.emissiveIntensity||1)*1.1;
    m.color.multiplyScalar(.2+.8*f.power);lenses++;
   }
   return m;
  };
  o.material=Array.isArray(o.material)?o.material.map(map):map(o.material);
 });
 if(!lenses)throw Error('licensed Annex fixture has no emissive mesh '+f.id);
 model.name='v127b_original_CC0_annex_fluorescent_'+f.id;
 model.userData.sourceSha256=ANNEX_LAMP_SOURCE_V127B.sha256;
 root.add(model);
 if(f.power>=.3){
  const light=new THREE.PointLight(0xb7c8bf,25*f.power,10,2);
  light.position.set(f.x,underside-.18,f.z);light.name='v127b_real_lamp_emitter_'+f.id;
  root.add(light);
 }
 return {id:f.id,x:f.x,z:f.z,ceilingId:slab.id,
  underside,model:ANNEX_LAMP_SOURCE_V127B.path,power:f.power,lenses};
}
export async function renderAnnexCirculationV127b(rootParent,{plan,ceilings,walls,portals}){
 if(!rootParent?.isObject3D)throw Error('Annex canonical property missing');
 const errors=validateAnnexCirculationV127b(plan,{ceilings,walls,portals});
 if(errors.length)throw Error('Invalid source Annex circulation: '+errors.join(' | '));
 if(ANNEX_LAMP_SOURCE_V127B.license!=='CC0-1.0'||
  !ANNEX_LAMP_SOURCE_V127B.path.startsWith('assets/vendor/builder/models/')||
  !/^[0-9a-f]{64}$/.test(ANNEX_LAMP_SOURCE_V127B.sha256))
  throw Error('Annex must use independently pinned local CC0 lamp');
 const src=await new GLTFLoader().loadAsync(
  new URL('../'+ANNEX_LAMP_SOURCE_V127B.path,import.meta.url).href);
 const root=new THREE.Group();root.name='V127b actual 1990s East Annex service circulation';
 const materials=[],textures=[];
 const trim=new THREE.MeshStandardMaterial({color:0x465b58,roughness:.84,metalness:.17});
 const scuff=new THREE.MeshStandardMaterial({color:0x8b9787,roughness:.94});
 const bulk=new THREE.MeshStandardMaterial({color:0x535e57,roughness:.88});
 materials.push(trim,scuff,bulk);
 try{
  // All dado/hand-protection strips are clipped to TRUE existing solid
  // masonry segments. The five west shutter fronts and east portals remain visible.
  let finishedWalls=0;
  for(const w of walls){
   if(w.axis!=='x'||(w.at!==56&&w.at!==65)||
    !['partition','closed-bay-partition'].includes(w.role)||
    w.bottom!==0||w.top<3.3||
    w.end<=ANNEX_SPINE_V127B.z1||w.start>=ANNEX_SPINE_V127B.z2)continue;
   const start=Math.max(w.start,ANNEX_SPINE_V127B.z1);
   const end=Math.min(w.end,ANNEX_SPINE_V127B.z2);
   if(end-start<.22)continue;
   const x=w.at===65?64.84:56.16;
   box(root,'v127b_real_masonry_dado_'+finishedWalls,x,.53,(start+end)/2,
    .07,1.06,end-start,scuff);
   box(root,'v127b_staff_corridor_guard_'+finishedWalls,x,1.08,(start+end)/2,
    .09,.065,end-start,trim);
   finishedWalls++;
  }
  for(const b of ANNEX_BULKHEADS_V127B)
   box(root,'v127b_attached_1990s_bulkhead_'+b.id,b.x,(b.bottom+b.top)/2,b.z,
    b.width,b.top-b.bottom,b.depth,bulk);
  const signs=ANNEX_SIGNS_V127B.map(s=>{
   const backing=box(root,'v127b_source_masonry_plate_'+s.id,64.824,s.y,s.z,
    .105,s.height,s.width,trim);
   const texture=plateTexture(s);textures.push(texture);
   const print=new THREE.Mesh(new THREE.PlaneGeometry(s.width-.1,s.height-.1),
    new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
   materials.push(print.material);
   print.name='v127b_readable_staff_sign_'+s.id;
   print.rotation.y=-Math.PI/2;print.position.set(64.76,s.y,s.z);root.add(print);
   return {id:s.id,room:s.room,z:s.z,wallX:s.wallX,sourceAttached:true};
  });
  const lights=ANNEX_LIGHTS_V127B.map(f=>panel(root,src,f,ceilings,materials));
  rootParent.add(root);
  return {root,manifest:{lights,signs,bulkheads:ANNEX_BULKHEADS_V127B.length,
   finishedWalls,centralClearWidth:ANNEX_SPINE_V127B.clearCentralX2-ANNEX_SPINE_V127B.clearCentralX1},
   dispose(){
    root.removeFromParent();textures.forEach(t=>t.dispose());
    materials.forEach(m=>m.dispose());
   }};
 }catch(e){
  textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());throw e;
 }
}
