/** V128 licensed 540m² real East Annex anchor: floor-grounded CC0 fixtures,
 * genuine 7.61m source-soffit fluorescents, hand-authored fictional goods.
 * No procedural furniture, remote models, or Builder draft publication. */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ANNEX_ANCHOR_FIXTURES_V128,ANNEX_ANCHOR_LIGHTS_V128,
 ANNEX_ANCHOR_IDENTITY_V128,ANNEX_ANCHOR_POSTERS_V128,validateAnnexAnchorV128}
 from './annex-anchor-plan-v128.mjs';
import {NORTHSTAR_REGISTER_V162,northstarBoundsV162} from './annex-anchor-plan-v128.mjs';
import {stockNorthstarV162} from './northstar-stock-v162.js';
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


function mat(assets,options){
 const m=new THREE.MeshStandardMaterial(options);assets.materials.push(m);return m;
}
function box(root,name,x,y,z,w,h,d,material){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 m.position.set(x,y,z);m.name=name;m.receiveShadow=true;root.add(m);return m;
}
function textTexture(assets,title,subtitle,{background='#273e3c',ink='#e0d9bd',width=1024,height=320}={}){
 const cv=document.createElement('canvas');cv.width=width;cv.height=height;
 const ctx=cv.getContext('2d');if(!ctx)throw Error('V128 original mall print unavailable');
 ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
 ctx.fillStyle='#ad936f';ctx.fillRect(14,12,width-28,7);
 ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold '+Math.floor(height*.285)+'px Georgia,serif';
 ctx.fillText(title,width/2,height*.40,width*.89);
 ctx.font='bold '+Math.floor(height*.122)+'px Arial,sans-serif';
 ctx.fillText(subtitle,width/2,height*.76,width*.87);
 for(let i=0;i<50;i++){
  const x=(i*107+27)%(width-20),y=(i*79+17)%(height-10);
  ctx.fillStyle=i%3?'#0000001a':'#e3d1b018';ctx.fillRect(x,y,2+i%4,1+i%3);
 }
 const tex=new THREE.CanvasTexture(cv);
 tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 assets.textures.push(tex);return tex;
}
function fitOriginalLicensedSource(src,f,assets){
 const model=src.scene.clone(true);
 const front=f.kind==='wall_cubbies'?cubbyFront(model):1;
 model.rotation.y=f.yaw+(front<0?Math.PI:0);model.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(model);
 const original=bounds.getSize(new THREE.Vector3());
 if(original.y<.01||original.x<.01||original.z<.01)
  throw Error('V128 licensed CC0 fixture lost source dimensions '+f.id);
 // Existing V121 source target heights are physically measured, not
 // arbitrary model thumbnails. The historical CC0 checkout has its
 // existing V69 scale and a bounded 3D footprint.
 const scale=f.targetHeight/original.y;
 model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);
 let size=bounds.getSize(new THREE.Vector3());
 if(Math.hypot(size.x/2,size.z/2)>f.collisionRadius+.012||
  Math.abs(size.y-f.targetHeight)>.06)
  throw Error('V128 source furniture/checkout exceeds verified nav collider '+f.id);
 const exact=northstarBoundsV162(f,0);
 if(Math.abs(size.x-(exact.maxX-exact.minX))>.025||Math.abs(size.z-(exact.maxZ-exact.minZ))>.025)
  throw Error('V162 source collider differs from actual furniture '+f.id);
 const center=bounds.getCenter(new THREE.Vector3());
 model.position.set(f.x-center.x,-bounds.min.y,f.z-center.z);
 model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);size=bounds.getSize(new THREE.Vector3());
 if(Math.abs(bounds.min.y)>.008)throw Error('un-grounded original Annex display '+f.id);
 model.name='v128_actual_SHA_pinned_licensed_CC0_retail_'+f.id;
 model.userData.originalAnnexV128={sha256:f.sha256,license:f.license,source:f.source,sourceFront:front};
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.receiveShadow=true;o.castShadow=false;
  const materials=Array.isArray(o.material)?o.material:[o.material];
  const originals=materials.map(old=>{
   const m=old.clone();assets.materials.push(m);
   if(m.color)m.color.multiply(new THREE.Color(f.kind==='counter'?0xa9a18c:/carcass/i.test(m.name)?0x879ba5:/surface/i.test(m.name)?0xc1b9a0:0x919c9c));
   if(typeof m.roughness==='number')m.roughness=Math.max(.83,m.roughness);
   return m;
  });
  o.material=Array.isArray(o.material)?originals:originals[0];
 });
 assets.root.add(model);
 return {id:f.id,kind:f.kind,section:f.section,room:f.room,
  x:f.x,z:f.z,actualWidth:size.x,actualDepth:size.z,actualHeight:size.y,
  groundY:bounds.min.y,collisionRadius:f.collisionRadius,
  sha256:f.sha256,license:f.license,source:f.source};
}
function mountRegisterV162(src,fixture,assets){
 const support=assets.root.getObjectByName('v128_actual_SHA_pinned_licensed_CC0_retail_'+fixture.id);
 const m=src.scene.clone(true);m.rotation.y=fixture.yaw;
 m.updateMatrixWorld(true);let b=new THREE.Box3().setFromObject(m);
 m.scale.multiplyScalar(NORTHSTAR_REGISTER_V162.targetHeight/b.getSize(new THREE.Vector3()).y);
 m.updateMatrixWorld(true);b=new THREE.Box3().setFromObject(m);
 const d=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());
 const x=fixture.x,z=fixture.z+.25,sb=new THREE.Box3().setFromObject(support),ray=new THREE.Raycaster(),n=new THREE.Vector3(),matrix=new THREE.Matrix3(),samples=[];
 for(const [dx,dz] of [[0,0],[-.47,-.47],[-.47,.47],[.47,-.47],[.47,.47]]){
  ray.set(new THREE.Vector3(x+dx*d.x,sb.max.y+.05,z+dz*d.z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObject(support,true).find(h=>h.face&&n.copy(h.face.normal).applyMatrix3(matrix.getNormalMatrix(h.object.matrixWorld)).normalize().y>.85);
  if(!hit)throw Error('V162 actual register corner unsupported');samples.push(hit.point.y);
 }
 if(Math.max(...samples)-Math.min(...samples)>.008||Math.min(...samples)<.75||Math.max(...samples)>1)throw Error('V162 register not on human-scale level desk');
 m.position.set(x-center.x,Math.max(...samples)-b.min.y+.006,z-center.z);
 m.name='v162_actual_supported_northstar_register';
 m.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;const orig=Array.isArray(o.material)?o.material:[o.material];const copies=orig.map(old=>{const next=old.clone();assets.materials.push(next);if(next.color)next.color.multiply(new THREE.Color(0xaaa89d));return next});o.material=Array.isArray(o.material)?copies:copies[0]}});
 assets.root.add(m);m.updateMatrixWorld(true);
 return {id:'northstar_register',support:fixture.id,source:NORTHSTAR_REGISTER_V162.path,sha256:NORTHSTAR_REGISTER_V162.sha256,samples,width:d.x,depth:d.z,height:d.y,bottom:new THREE.Box3().setFromObject(m).min.y};
}
function departmentSignsV162(assets){
 const defs=[
 {title:'BEDDING & LINENS',subtitle:'SLEEP SETS  ·  PILLOW CASES',x:70,z:-75,y:3.05,rot:0},
 {title:'KITCHEN & TABLE',subtitle:'COOKWARE  ·  TABLE LINEN',x:79.8,z:-75,y:3.05,rot:0},
 {title:'HOUSEHOLD & CLEARANCE',subtitle:'HOME ACCESSORIES  ·  FINAL SALE',x:65,z:-54,y:3.05,rot:Math.PI/2},
 {title:'BATH & CUSTOMER SERVICE',subtitle:'TOWELS  ·  RETURNS  ·  COLLECTION',x:81,z:-48,y:3.05,rot:Math.PI}
 ];
 return defs.map((d,i)=>{
  const g=new THREE.Group();g.name='v162_masonry_fixed_department_'+i;
  g.rotation.y=d.rot;g.position.set(d.x+Math.sin(d.rot)*.165,d.y,d.z+Math.cos(d.rot)*.165);
  const w=5.3,h=.85;
  box(g,'v162_department_enamel_backing',0,0,0,w,h,.10,assets.wood);
  const t=textTexture(assets,d.title,d.subtitle,{width:Math.round((w-.10)/(h-.08)*300),height:300,background:'#263f52'});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w-.10,h-.08),new THREE.MeshBasicMaterial({map:t}));
  assets.materials.push(p.material);p.position.z=.053;g.add(p);assets.root.add(g);
  return {...d,width:w,height:h,actualWallMounted:true,printAspectError:Math.abs((t.image.width/t.image.height)/((w-.10)/(h-.08))-1)};
 });
}
function mountOriginalFluorescent(src,f,ceilings,assets){
 const support=ceilings.find(c=>c.room==='annex_anchor'&&f.x>c.x1+1.1&&
  f.x<c.x2-1.1&&f.z>c.z1+1.1&&f.z<c.z2-1.1);
 if(!support)throw Error('V128 licensed lamp missing actual east Annex ceiling '+f.id);
 const underside=support.y-support.thickness/2;
 const model=src.scene.clone(true);
 model.rotation.x=Math.PI;model.position.set(f.x,underside-.025,f.z);
 model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 if(size.x<1.7||size.x>2.5||size.z<1.7||size.z>2.5||
  size.y<.10||size.y>.55||bounds.max.y>underside-.003||bounds.min.y>underside-.20)
  throw Error('V128 original CC0 lamp is floating or not full-size '+f.id);
 const lenses=[],litMeshes=[];
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.receiveShadow=true;o.castShadow=false;o.raycast=()=>{};
  const original=Array.isArray(o.material)?o.material:[o.material];
  const cloned=original.map(m=>{
   const next=m.clone();assets.materials.push(next);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(next.name)){
    if(!next.emissive)throw Error('Original fluorescent source has no lens '+f.id);
    next.emissive.multiplyScalar(f.power);
    next.emissiveIntensity=(next.emissiveIntensity||1)*1.1;
    next.color.multiplyScalar(.16+.84*f.power);lenses.push(next);
   }
   return next;
  });
  o.material=Array.isArray(o.material)?cloned:cloned[0];
  if(cloned.some(m=>lenses.includes(m)))litMeshes.push(o);
 });
 if(!lenses.length||!litMeshes.length)throw Error('V128 missing real licensed fluorescent lens '+f.id);
 const lensBounds=new THREE.Box3();
 litMeshes.forEach(mesh=>lensBounds.expandByObject(mesh));
 const emitterY=lensBounds.getCenter(new THREE.Vector3()).y-.06;
 if(f.power>=.25){
  const light=new THREE.PointLight(0xcddbc8,195*f.power,22,2);
  light.position.set(f.x,emitterY,f.z);
  light.name='v128_emission_from_source_CC0_lens_'+f.id;
  assets.ceilingRoot.add(light);
 }
 model.name='v128_real_licensed_annex_ceiling_'+f.id;assets.ceilingRoot.add(model);
 return {id:f.id,room:f.room,x:f.x,z:f.z,power:f.power,ceilingId:support.id,
  ceilingUnderside:underside,emitterY,actualWidth:size.x,actualDepth:size.z,
  source:f.model,license:f.license,sha256:f.sha256};
}
function mountSign(s,assets){
 const group=new THREE.Group();group.name='v128_fixed_Northstar_1997_identity';
 group.position.set(s.wallX-.165,s.y,s.z);group.rotation.y=-Math.PI/2;
 box(group,'v128_original_backing_on_source_east_masonry',0,0,0,
  s.width,s.height,.10,assets.wood);
 const paper=textTexture(assets,s.name,s.subtitle,{width:2048,height:360});
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(s.width-.12,s.height-.12),
  mat(assets,{map:paper,side:THREE.FrontSide,roughness:.87}));
 sign.position.z=.053;sign.name='v128_original_Northstar_home_store_print';
 group.add(sign);assets.root.add(group);
 return {id:s.id,wallX:s.wallX,mountX:group.position.x,
  z:s.z,y:s.y,width:s.width,height:s.height,originalArtwork:true};
}
function mountPosters(posters,assets){
 return posters.map(p=>{
  const g=new THREE.Group();g.name='v128_original_wall_fixed_home_poster_'+p.id;
  g.position.set(p.x,4.15,p.z);
  g.rotation.y=p.wall==='east'?-Math.PI/2:0;
  box(g,'v128_original_masonry_mounted_poster_support',0,0,0,1.25,1.55,.024,assets.wood);
  const tex=textTexture(assets,p.title,p.subtitle,
   {width:640,height:768,background:p.bg});
  const print=new THREE.Mesh(new THREE.PlaneGeometry(1.21,1.51),
   mat(assets,{map:tex,side:THREE.FrontSide,roughness:.94}));
  print.position.z=.015;print.name='v128_original_fictional_1997_wall_print';
  g.add(print);assets.root.add(g);
  return {id:p.id,wall:p.wall,x:p.x,z:p.z,y:g.position.y,
   license:'original',masonryAttached:true,originalArtwork:true};
 });
}
export async function renderAnnexAnchorV128(ground,ceilings,plan={
 fixtures:ANNEX_ANCHOR_FIXTURES_V128,lights:ANNEX_ANCHOR_LIGHTS_V128,
 identity:ANNEX_ANCHOR_IDENTITY_V128,posters:ANNEX_ANCHOR_POSTERS_V128
}){
 if(!ground?.isObject3D)throw Error('V128 actual G-level game source missing');
 const invalid=validateAnnexAnchorV128(plan,{ceilings});
 if(invalid.length)throw Error('V128 actual original Annex architecture invalid: '+invalid.join(' | '));
 const paths=[...new Set([...plan.fixtures.map(f=>f.source),
  ...plan.lights.map(l=>l.model),NORTHSTAR_REGISTER_V162.path])];
 const loader=new GLTFLoader();
 const sources=new Map(await Promise.all(paths.map(async path=>{
  if(!path.startsWith('assets/vendor/builder/models/')&&
    !path.startsWith('assets/vendor/runtime/'))
   throw Error('V128 refused unlicensed remote model '+path);
  if(!path.endsWith('.glb'))throw Error('V128 expected local original CC0 GLB');
  return [path,await loader.loadAsync(new URL('../'+path,import.meta.url).href)];
 })));
 const assets={root:new THREE.Group(),ceilingRoot:new THREE.Group(),textures:[],materials:[],
  stockItems:{boxes:[],labels:[]}};
 assets.root.name='V128 original 540sqm Annex Northstar Home genuine CC0 shop';
 assets.ceilingRoot.name='V128 actual attached high Annex retail fluorescent ceiling';
 assets.wood=mat(assets,{color:0x544d40,roughness:.91});
 assets.goodsColors=[0x807a65,0x607e83,0xa2987e,0x8a7566,0x53695e,0x826a71];
 try{
  const fixtures=plan.fixtures.map(f=>fitOriginalLicensedSource(sources.get(f.source),f,assets));
  const stock=stockNorthstarV162(assets.root,plan.fixtures,fixtures);
  const supportedStock=stock.report.reduce((n,f)=>n+f.cartons,0);
  const stockBatches=stock.root.children.map(m=>({kind:'original SKU',count:m.count}));
  const register=mountRegisterV162(sources.get(NORTHSTAR_REGISTER_V162.path),plan.fixtures.find(f=>f.kind==='counter'),assets);
  const departments=departmentSignsV162(assets);
  const lights=plan.lights.map(l=>mountOriginalFluorescent(
   sources.get(l.model),l,ceilings,assets));
  const identity=mountSign(plan.identity,assets);
  const posters=mountPosters(plan.posters,assets);
  // Fully assembled source GLBs and prints join the canonical G-floor once.
  ground.add(assets.root);ground.add(assets.ceilingRoot);
  return {root:assets.root,ceilingRoot:assets.ceilingRoot,
   manifest:{fixtures,lights,identity,posters,register,departments,
    authoredOriginalStock:supportedStock,stockBatches,originalArea:540},
   dispose(){
    stock.dispose();assets.root.removeFromParent();assets.ceilingRoot.removeFromParent();
    assets.textures.forEach(t=>t.dispose());
    assets.materials.forEach(m=>m.dispose());
   }};
 }catch(e){
  assets.textures.forEach(t=>t.dispose());
  assets.materials.forEach(m=>m.dispose());throw e;
 }
}
