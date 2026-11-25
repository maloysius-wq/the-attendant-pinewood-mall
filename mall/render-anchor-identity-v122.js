/**
 * V122 real 1979 source-slab fluorescent luminaires and department identities.
 * One already pinned CC0 GLB is mounted 15 times against the same original
 * 5.21m soffits in Builder, film and game. There are NO floating glow spheres.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {MALL} from './masterplan-v66.mjs';
import {ANCHOR_LIGHTS_V122,ANCHOR_SIGNS_V122,ANCHOR_FLUORESCENT_ASSET_V122,validateAnchorIdentityV122}
 from './anchor-identity-plan-v122.mjs';

function mountPanel(g,src,f,ceiling,mats){
 const slab=ceiling.find(s=>s.room===f.room&&
  f.x>s.x1+1.1&&f.x<s.x2-1.1&&f.z>s.z1+1.1&&f.z<s.z2-1.1);
 if(!slab)throw Error('V122 CC0 luminaire lost its physical source ceiling '+f.id);
 const underside=slab.y-slab.thickness/2;
 const model=src.scene.clone(true);
 model.rotation.x=Math.PI; // Source licensed lamp's real lens must face down.
 model.position.set(f.x,underside-.025,f.z);
 model.updateMatrixWorld(true);
 const bbox=new THREE.Box3().setFromObject(model),size=bbox.getSize(new THREE.Vector3());
 if(size.x<1.7||size.x>2.5||size.z<1.7||size.z>2.5||
  size.y<.10||size.y>.55||bbox.max.y>underside-.003||bbox.min.y>underside-.20)
  throw Error('V122 original ceiling panel has detached or giant GLB bounds '+f.id);
 const lenses=[],lensMeshes=[];
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.raycast=()=>{};o.castShadow=false;o.receiveShadow=true;
  const original=Array.isArray(o.material)?o.material:[o.material];
  const copies=original.map(mat=>{
   const copy=mat.clone();mats.push(copy);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(copy.name)){
    if(!copy.emissive)throw Error('Original ceiling panel lost its licensed emissive lens '+f.id);
    copy.emissive.multiplyScalar(f.power);
    copy.emissiveIntensity=(copy.emissiveIntensity||1)*1.1;
    copy.color.multiplyScalar(.2+.8*f.power);
    lenses.push(copy);
   }
   return copy;
  });
  o.material=Array.isArray(o.material)?copies:copies[0];
  if(copies.some(m=>lenses.includes(m)))lensMeshes.push(o);
 });
 if(!lenses.length||!lensMeshes.length)throw Error('V122 genuine GLB has no source fluorescent lens '+f.id);
 const lensBox=new THREE.Box3();
 for(const lens of lensMeshes)lensBox.expandByObject(lens);
 const emitterY=lensBox.getCenter(new THREE.Vector3()).y-.06;
 if(emitterY<underside-.45||emitterY>underside-.045)
  throw Error('V122 point light is not tied to its real illuminated fixture '+f.id);
 model.name='v122_real_CC0_ceiling_panel_'+f.id;
 model.userData.originalCeilingLampV122={id:f.id,sha256:ANCHOR_FLUORESCENT_ASSET_V122.sha256,power:f.power};
 g.add(model);
 // Failed lamps remain genuine dark lens assemblies. Only working units
 // produce light; uneven coverage is intentional at 2 AM in an old mall.
 if(f.power>=.3){
  const tint=f.room==='west_anchor'?0xcad8d0:0xd4d2b9;
  const light=new THREE.PointLight(tint,30*f.power,12,2);
  light.position.set(f.x,emitterY,f.z);light.name='v122_emission_from_real_panel_'+f.id;
  g.add(light);
 }
 return {id:f.id,room:f.room,x:f.x,z:f.z,
  ceilingId:slab.id,ceilingUnderside:underside,
  actualWidth:size.x,actualDepth:size.z,actualHeight:size.y,
  emitterY,power:f.power,lensCount:lenses.length,
  model:ANCHOR_FLUORESCENT_ASSET_V122.path,license:'CC0-1.0'};
}

function enamelPrint(s){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=300;
 const c=canvas.getContext('2d');if(!c)throw Error('1979 department sign texture unavailable');
 c.fillStyle='#222725';c.fillRect(0,0,2048,300);
 c.fillStyle='#93785c';c.fillRect(0,0,2048,13);
 c.fillRect(0,282,2048,5);
 c.textAlign='center';c.textBaseline='middle';
 c.fillStyle='#d6cbb5';c.font='bold 126px Georgia,serif';
 c.fillText(s.name,1024,121,1870);
 c.fillStyle='#aaa18c';c.font='bold 45px Arial,sans-serif';
 c.fillText(s.subtitle,1024,237,1900);
 // Print distress is fixed to the wall-mounted original enamel itself.
 for(let i=0;i<90;i++){
  const x=45+(i*331)%1950,y=27+(i*83)%248;
  c.fillStyle=i%4===0?'#ab957532':'#111d1b45';
  c.fillRect(x,y,3+i%7,1+i%3);
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 tex.anisotropy=4;return tex;
}
function mountWallSign(g,s,materials,textures){
 const root=new THREE.Group();root.name='v122_wall_attached_department_sign_'+s.id;
 const x=s.wallX+s.face*.17;
 // A 10cm deep physical backing penetrates the real masonry by 1cm,
 // never a billboard suspended over the entrance or between racks.
 const backing=new THREE.Mesh(new THREE.BoxGeometry(.10,s.height,s.width),
  new THREE.MeshStandardMaterial({color:0x28312f,metalness:.34,roughness:.81}));
 materials.push(backing.material);backing.position.set(x,s.y,s.z);
 backing.name='v122_enamel_sign_masonry_fixed_backing';root.add(backing);
 const tex=enamelPrint(s);textures.push(tex);
 const printed=new THREE.Mesh(new THREE.PlaneGeometry(s.width-.15,s.height-.12),
  new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide}));
 materials.push(printed.material);
 printed.rotation.y=s.face*Math.PI/2;
 printed.position.set(x+s.face*.055,s.y,s.z);
 printed.name='v122_readable_original_department_identity';root.add(printed);
 root.userData.originalAnchorIdentityV122={room:s.room,wallX:s.wallX,face:s.face};
 g.add(root);
 return {id:s.id,room:s.room,wallX:s.wallX,face:s.face,
  mountedX:x,printedX:printed.position.x,z:s.z,y:s.y,
  width:s.width,height:s.height,name:s.name,subtitle:s.subtitle};
}
/** Fallow-specific original departmental wayfinding on canonical masonry,
 * above real 2.12m cubbies. No freestanding sign collision or external art. */
const FALLOW_DEPARTMENTS_V160=[
 {id:'fallow_apparel',room:'west_anchor',name:'APPAREL & LINENS',subtitle:'KNITWEAR  ·  HOSIERY  ·  BED & BATH',x:-38.9,z:-48,y:2.92,face:-1,axis:'z',width:4.9,height:.78},
 {id:'fallow_gifts',room:'west_anchor',name:'GIFTS & HOUSEWARES',subtitle:'FINE GOODS  ·  ACCESSORIES  ·  BEAUTY',x:-35.5,z:-73,y:2.92,face:1,axis:'z',width:4.9,height:.78},
 {id:'fallow_service',room:'west_anchor',name:'CUSTOMER SERVICE',subtitle:'RETURNS  ·  EXCHANGES  ·  LAYAWAY',x:-43,z:-73,y:2.92,face:1,axis:'z',width:4.2,height:.68}
];
function mountFallowDepartment(g,s,mats,textures){
 const room=MALL.rooms.find(r=>r.id===s.room&&r.level==='G');
 const edge=s.axis==='x'?(s.face===1?room?.x1:room?.x2):(s.face===1?room?.z1:room?.z2);
 const along=s.axis==='x'?s.z:s.x,lo=s.axis==='x'?room?.z1:room?.x1,hi=s.axis==='x'?room?.z2:room?.x2;
 if(!room||Math.abs((s.axis==='x'?s.x:s.z)-edge)>.001||along-s.width/2<lo+.12||along+s.width/2>hi-.12||s.y-s.height/2<2.35)
  throw Error('V160 departmental wayfinding detached from canonical masonry '+s.id);
 const aspect=(s.width-.10)/(s.height-.08);
 if(Math.abs(aspect/(2048/300)-1)>.01)throw Error('V160 printed department sign aspect drift '+s.id);
 const x=s.x+(s.axis==='x'?s.face*.17:0),z=s.z+(s.axis==='z'?s.face*.17:0);
 const rot=s.axis==='x'?s.face*Math.PI/2:s.face===1?0:Math.PI;
 const root=new THREE.Group();root.name='v160_fixed_department_'+s.id;
 root.position.set(x,s.y,z);root.rotation.y=rot;
 const mat=new THREE.MeshStandardMaterial({color:0x352d27,roughness:.84,metalness:.15});mats.push(mat);
 const back=new THREE.Mesh(new THREE.BoxGeometry(s.width,s.height,.10),mat);root.add(back);
 const tex=enamelPrint(s);textures.push(tex);
 const printMat=new THREE.MeshBasicMaterial({map:tex});mats.push(printMat);
 const print=new THREE.Mesh(new THREE.PlaneGeometry(s.width-.10,s.height-.08),printMat);
 print.position.z=.051;root.add(print);g.add(root);
 return {...s,mountedX:x,mountedZ:z,actualWallMounted:true,printAspectError:Math.abs(aspect/(2048/300)-1)};
}
export async function renderAnchorIdentityV122(
 property,{lights=ANCHOR_LIGHTS_V122,signs=ANCHOR_SIGNS_V122}={},
 ceilings=[]
){
 if(!property?.isObject3D)throw Error('V122 source property is unavailable');
 const errors=validateAnchorIdentityV122({lights,signs},{ceilings});
 if(errors.length)throw Error('V122 physical original retail identity invalid: '+errors.join(' | '));
 const asset=ANCHOR_FLUORESCENT_ASSET_V122.path;
 if(!asset.startsWith('assets/vendor/builder/models/')||!asset.endsWith('.glb'))
  throw Error('V122 lamp must use a local SHA-pinned licensed source');
 const src=await new GLTFLoader().loadAsync(new URL('../'+asset,import.meta.url).href);
 const root=new THREE.Group();root.name='V122 real original department ceilings and attached identity';
 const mats=[],textures=[];
 try{
  const panels=lights.map(f=>mountPanel(root,src,f,ceilings,mats));
  const mountedSigns=signs.map(s=>mountWallSign(root,s,mats,textures));
  const fallowDepartments=FALLOW_DEPARTMENTS_V160.map(s=>mountFallowDepartment(root,s,mats,textures));
  property.add(root);
  return {root,manifest:{panels,signs:mountedSigns,fallowDepartments},dispose(){
   root.removeFromParent();
   textures.forEach(t=>t.dispose());mats.forEach(m=>m.dispose());
   // The shared source render owns panel source geometry, like V108.
  }};
 }catch(e){
  textures.forEach(t=>t.dispose());mats.forEach(m=>m.dispose());
  throw e;
 }
}
