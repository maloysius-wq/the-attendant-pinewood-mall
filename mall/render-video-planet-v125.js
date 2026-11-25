/** V125: actual source-pinned GLB fixtures and original 1997 video rental art.
 * The store is attached to the SAME original shell used by film, game and Builder.
 * Movie titles, poster art, rental cases and labels are entirely Pinewood fiction.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {createMediaShelfResourcesV158,makeMeasuredMediaRackV158} from './media-shelf-geometry-v158.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {
 VIDEO_PLANET_FIXTURES_V125,VIDEO_PLANET_LIGHTS_V125,VIDEO_PLANET_SIGN_V125,
 VIDEO_PLANET_POSTERS_V125,validateVideoPlanetV125
} from './video-planet-plan-v125.mjs';

const titles=[
 ['SILENT FREQUENCY','THRILLER','#324958','#d0cfbe'],
 ['WILLOW STREET','FAMILY','#566044','#e7c89c'],
 ['THE LAST LIGHTHOUSE','DRAMA','#5b3941','#edd9b8'],
 ['TOMORROW STATION','SCI-FI','#283c56','#c2d4d9'],
 ['NIGHT SHIFT','SUSPENSE','#463c36','#e5b98e'],
 ['BLUE HORIZON','ADVENTURE','#3b6265','#d4dbc2'],
 ['STATIC CITY','ACTION','#4b3b57','#d9c5cf'],
 ['SNOWBOUND','FAMILY','#3e5264','#d6dfe0'],
 ['HOLLOW CROSSING','HORROR','#3b4239','#d8c89d'],
 ['ROADSIDE STARS','COMEDY','#5e4d35','#ecdbb4'],
 ['LAST SIGNAL','MYSTERY','#453d58','#c9c0dd'],
 ['GLASS HARBOR','DRAMA','#42545e','#b4d6d2']
];
const VHS_WIDTH=.135,VHS_HEIGHT=.205,VHS_DEPTH=.032;
const makeMaterial=(assets,options)=>{
 const mat=new THREE.MeshStandardMaterial(options);assets.materials.push(mat);return mat;
};
const box=(g,name,x,y,z,w,h,d,material)=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);mesh.name=name;mesh.receiveShadow=true;g.add(mesh);
 return mesh;
};
function labelTexture(assets,label,{heading='',background='#303a49',ink='#e5d5bd',
 width=512,height=768}={}){
 const c=document.createElement('canvas');c.width=width;c.height=height;
 const ctx=c.getContext('2d');
 if(!ctx)throw Error('V125 local original 1997 artwork could not render');
 ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
 ctx.fillStyle=ink;ctx.globalAlpha=.18;ctx.fillRect(36,48,width-72,height*.47);
 for(let i=0;i<12;i++){
  ctx.globalAlpha=.17+(i%3)*.09;ctx.strokeStyle=ink;ctx.lineWidth=2+i%3;
  ctx.strokeRect(35+i*11,45+i*15,width-70-i*22,height*.45-i*27);
 }
 ctx.globalAlpha=1;ctx.fillStyle=ink;ctx.textAlign='center';
 ctx.font='bold '+Math.floor(width*.11)+'px Georgia,serif';
 if(width/height>1.5){
  // A long retail fascia requires ONE horizontal title. The former portrait
  // formatter placed a 225px-tall typeface on two 29px-spaced baselines:
  // real desktop screenshots caught overlapping words on the identity sign.
  ctx.font='bold '+Math.floor(Math.min(height*.44,width*.1))+'px Georgia,serif';
  ctx.fillText(label,width/2,height*.53,width*.9);
  ctx.font='bold '+Math.floor(Math.min(height*.15,width*.027))+'px Arial,sans-serif';
  ctx.fillText(heading,width/2,height*.82,width*.9);
 }else{
  const lines=label.split(' '),mid=Math.ceil(lines.length/2);
  ctx.fillText(lines.slice(0,mid).join(' '),width/2,height*.65,width*.88);
  ctx.fillText(lines.slice(mid).join(' '),width/2,height*.76,width*.88);
  ctx.font='bold '+Math.floor(width*.051)+'px Arial,sans-serif';
  ctx.fillText(heading,width/2,height*.87,width*.88);
 }
 ctx.fillStyle='#f5e8c4';ctx.fillRect(18,height*.93,width-36,5);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 tex.anisotropy=4;assets.textures.push(tex);return tex;
}
function addVhsCase(g,assets,id,x,y,z,design){
 const [name,genre,bg,ink]=design;
 const plastic=box(g,'original_full_size_VHS_rental_clamshell_'+id,x,y,z,
  VHS_WIDTH,VHS_HEIGHT,VHS_DEPTH,assets.shell);
 // 104 original cases use 12 unique fictional covers, not 104 duplicate
 // 512x768 textures. This matters on the older desktop GPUs we support.
 const key=design.join('|');
 let cover=assets.coverMaterials.get(key);
 if(!cover){
  const artwork=labelTexture(assets,name,{heading:genre,background:bg,ink});
  cover=makeMaterial(assets,{map:artwork,roughness:.88});
  assets.coverMaterials.set(key,cover);
 }
 const front=new THREE.Mesh(new THREE.PlaneGeometry(VHS_WIDTH-.013,VHS_HEIGHT-.018),cover);
 front.position.set(x,y,z+VHS_DEPTH/2+.001);
 front.name='original_fictional_VHS_cover_'+id;g.add(front);
 plastic.userData.originalRentalV125={metres:[VHS_WIDTH,VHS_HEIGHT,VHS_DEPTH],
  title:name,originalArt:true};return plastic;
}
function stockTable(f,assets){
 const g=new THREE.Group();g.name='v125_VHS_returns_on_real_CC0_table';
 g.position.set(f.x,0,f.z);g.rotation.y=f.yaw;
 // Measured source medium retail table: physical top y=0.95m.
 box(g,'original_shop_returns_tray_bottom',0,.970,0,1.09,.04,.72,assets.wood);
 for(const sign of [-1,1])
  box(g,'returns_tray_end',sign*.526,1.050,0,.025,.16,.72,assets.wood);
 for(let col=0;col<8;col++){
  const x=(col-3.5)*.132;
  addVhsCase(g,assets,'staff_pick_'+col,x,1.115,.02,titles[(col+3)%titles.length]);
 }
 assets.root.add(g);return 8;
}
function stockSpinner(f,assets){
 const g=new THREE.Group();g.name='v125_original_return_tags_on_CC0_spinner_'+f.id;
 g.position.set(f.x,0,f.z);
 for(let i=0;i<4;i++){
  const yaw=i*Math.PI/2;
  const mesh=box(g,'original_plastic_rewind_card_'+i,
   Math.sin(yaw)*.235,1.25,Math.cos(yaw)*.235,.16,.22,.014,assets.card);
  mesh.rotation.y=yaw;mesh.userData.originalArtwork='Be kind rewind 1997 rental insert';
 }
 assets.root.add(g);return 4;
}
function fitLicensedSource(gltf,f,assets){
 const media=f.kind==='wall_bay';
 const model=media?makeMeasuredMediaRackV158(gltf.scene,{id:f.id,targetHeight:f.targetHeight,yaw:f.yaw,radius:f.collisionRadius,resources:assets.media}):gltf.scene.clone(true);
 if(!media)model.rotation.y=f.yaw;
 model.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 if(size.y<.05)throw Error('V125 CC0 model has no geometry '+f.id);
 model.scale.multiplyScalar(media?1:f.targetHeight/size.y);model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);size=bounds.getSize(new THREE.Vector3());
 if(Math.abs(size.y-f.targetHeight)>.001||
  Math.hypot(size.x/2,size.z/2)>f.collisionRadius+.005)
  throw Error('V125 imported source overhangs original gameplay collider '+f.id);
 const center=bounds.getCenter(new THREE.Vector3());
 model.position.set(f.x-center.x,-bounds.min.y,f.z-center.z);model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);
 if(Math.abs(bounds.min.y)>.01)throw Error('V125 licensed real source is floating '+f.id);
 model.name='v125_actual_CC0_video_store_fixture_'+f.id;
 model.userData.license={path:f.source,sha256:f.sha256,license:f.license};
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=false;o.receiveShadow=true;if(o.isInstancedMesh)return;
  const old=Array.isArray(o.material)?o.material:[o.material];
  const aged=old.map(m=>{
   const clone=m.clone();assets.materials.push(clone);
   if(clone.color)clone.color.multiply(new THREE.Color(0x8a8980));
   if(typeof clone.roughness==='number')clone.roughness=Math.max(.85,clone.roughness);
   return clone;
  });o.material=Array.isArray(o.material)?aged:aged[0];
 });
 assets.root.add(model);
 return {id:f.id,section:f.section,kind:f.kind,source:f.source,sha256:f.sha256,
  license:f.license,x:f.x,z:f.z,actualWidth:size.x,actualDepth:size.z,
  actualHeight:size.y,groundY:bounds.min.y,collisionRadius:f.collisionRadius,mediaShelf:model.userData.mediaShelfV158||null};
}
function installFluorescent(gltf,f,ceilings,assets){
 const slab=ceilings.find(c=>c.room==='video_planet'&&
  f.x>c.x1+1.1&&f.x<c.x2-1.1&&f.z>c.z1+1.1&&f.z<c.z2-1.1);
 if(!slab)throw Error('V125 missing physical source soffit '+f.id);
 const underside=slab.y-slab.thickness/2,model=gltf.scene.clone(true);
 model.rotation.x=Math.PI;model.position.set(f.x,underside-.025,f.z);
 model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 if(size.x<1.7||size.x>2.5||size.z<1.7||size.z>2.5||
  size.y<.10||size.y>.55||bounds.max.y>underside-.003||
  bounds.min.y>underside-.20)
  throw Error('V125 licensed light does not attach to actual 5.21m ceiling '+f.id);
 const lenses=[],lensMeshes=[];
 model.traverse(o=>{
  if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;o.raycast=()=>{};
  const original=Array.isArray(o.material)?o.material:[o.material];
  const clones=original.map(m=>{
   const clone=m.clone();assets.materials.push(clone);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(clone.name)){
    if(!clone.emissive)throw Error('V125 licensed source lamp missing emissive lens');
    clone.emissive.multiplyScalar(f.power);
    clone.emissiveIntensity=(clone.emissiveIntensity||1)*1.1;
    clone.color.multiplyScalar(.2+.8*f.power);lenses.push(clone);
   }return clone;
  });
  o.material=Array.isArray(o.material)?clones:clones[0];
  if(clones.some(m=>lenses.includes(m)))lensMeshes.push(o);
 });
 if(!lenses.length||!lensMeshes.length)throw Error('V125 no actual source fluorescent lens '+f.id);
 const lensBox=new THREE.Box3();
 lensMeshes.forEach(o=>lensBox.expandByObject(o));
 const y=lensBox.getCenter(new THREE.Vector3()).y-.06;
 if(f.power>0){
  const light=new THREE.PointLight(0xc6d8ca,37*f.power,12,2);
  light.position.set(f.x,y,f.z);light.name='v125_light_emitted_from_real_CC0_lens_'+f.id;
  assets.ceilingRoot.add(light);
 }
 model.name='v125_real_CC0_ceiling_fluorescent_'+f.id;assets.ceilingRoot.add(model);
 return {id:f.id,x:f.x,z:f.z,power:f.power,source:f.model,license:f.license,
  ceilingUnderside:underside,actualWidth:size.x,actualDepth:size.z,emitterY:y};
}
function installInteriorIdentity(sign,assets){
 const g=new THREE.Group();g.position.set(sign.wallX-.18,sign.y,sign.z);
 g.rotation.y=-Math.PI/2;g.name='v125_rear_wall_masonry_fixed_video_planet_sign';
 box(g,'original_physical_video_sign_backer',0,0,0,sign.width,sign.height,.09,assets.wood);
 const tex=labelTexture(assets,sign.name,{heading:sign.subtitle,
  background:'#203543',ink:'#decaa6',width:2048,height:360});
 const panel=new THREE.Mesh(new THREE.PlaneGeometry(sign.width-.12,sign.height-.08),
  makeMaterial(assets,{map:tex,roughness:.88}));
 panel.position.z=.051;panel.name='original_1997_rental_brand';g.add(panel);
 assets.root.add(g);
 return {id:sign.id,wallX:sign.wallX,mountX:g.position.x,
  width:sign.width,height:sign.height,originalArtwork:true};
}
function installPosters(posters,assets){
 return posters.map(p=>{
  const g=new THREE.Group();g.name='v125_masonry_fixed_fictional_video_poster_'+p.id;
  g.position.set(p.x,3.43,p.z);
  g.rotation.y=p.wall==='north'?Math.PI:p.wall==='east'?-Math.PI/2:0;
  box(g,'old_video_poster_real_wall_backing',0,0,0,1.18,1.48,.025,assets.wood);
  const tex=labelTexture(assets,p.title,{heading:p.subtitle,background:p.bg,
   width:640,height:768});
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.45),
   makeMaterial(assets,{map:tex,roughness:.96}));
  paper.position.z=.014;paper.name='original_fictional_1997_film_poster';g.add(paper);
  assets.root.add(g);
  return {id:p.id,wall:p.wall,x:p.x,z:p.z,originalArtwork:true,masonryAttached:true};
 });
}
export async function renderVideoPlanetV125(ground,ceilings,plan={
 fixtures:VIDEO_PLANET_FIXTURES_V125,lights:VIDEO_PLANET_LIGHTS_V125,
 sign:VIDEO_PLANET_SIGN_V125,posters:VIDEO_PLANET_POSTERS_V125
}){
 if(!ground?.isObject3D)throw Error('V125 real G-level mall group missing');
 const problems=validateVideoPlanetV125(plan,{ceilings});
 if(problems.length)throw Error('Video Planet canonical source invalid: '+problems.join(' | '));
 const paths=[...new Set([...plan.fixtures.map(f=>f.source),...plan.lights.map(l=>l.model)])];
 const loader=new GLTFLoader();
 const models=new Map(await Promise.all(paths.map(async path=>{
  if(!path.startsWith('assets/vendor/builder/models/')||!path.endsWith('.glb'))
   throw Error('V125 refuses off-origin / unpinned rental source '+path);
  return [path,await loader.loadAsync(new URL('../'+path,import.meta.url).href)];
 })));
 const assets={root:new THREE.Group(),ceilingRoot:new THREE.Group(),textures:[],materials:[],coverMaterials:new Map(),media:createMediaShelfResourcesV158('video')};
 assets.root.name='V125 real source-pinned Video Planet original rental shelves and films';
 assets.ceilingRoot.name='V125 real ceiling-mounted 1979 video rental fluorescent panels';
 assets.wood=makeMaterial(assets,{color:0x51463d,roughness:.92});
 assets.brass=makeMaterial(assets,{color:0x746a51,metalness:.20,roughness:.82});
 assets.shell=makeMaterial(assets,{color:0x888a8a,roughness:.85});
 assets.card=makeMaterial(assets,{color:0xc4bba4,roughness:.96});
 const fixtures=plan.fixtures.map(f=>fitLicensedSource(models.get(f.source),f,assets));
 let wallCases=0,tableCases=0,spinnerCards=0;
 for(const f of plan.fixtures){
  if(f.kind==='wall_bay')wallCases+=fixtures.find(x=>x.id===f.id).mediaShelf.products;
  else if(f.kind==='table_medium')tableCases+=stockTable(f,assets);
  else if(f.kind==='spinner')spinnerCards+=stockSpinner(f,assets);
 }
 const fluorescents=plan.lights.map(f=>installFluorescent(
  models.get(f.model),f,ceilings,assets));
 const identity=installInteriorIdentity(plan.sign,assets);
 const posters=installPosters(plan.posters,assets);
 // All authentic GLBs have loaded and their physical bounds passed before
 // mounting ANY part of the source room. No mid-scene flash or remote fallbacks.
 ground.add(assets.root);ground.add(assets.ceilingRoot);
 return {root:assets.root,ceilingRoot:assets.ceilingRoot,
  manifest:{fixtures,fluorescents,identity,posters,
   stock:{wallCases,tableCases,spinnerCards,totalVhsCases:wallCases+tableCases,
    allOriginalCards:wallCases+tableCases+spinnerCards}},
  dispose(){
   assets.root.removeFromParent();assets.ceilingRoot.removeFromParent();
   assets.textures.forEach(t=>t.dispose());assets.materials.forEach(m=>m.dispose());assets.media.dispose();
  }};
}
