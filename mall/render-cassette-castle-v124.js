/**
 * V124: actual licensed original retail GLBs, correctly physically fitted
 * with original hand-authored, human-scale cassette cases and 12-inch
 * record sleeves. Fictional cover art is NOT a claimed licensed source.
 * Four original CC0 fluorescent ceiling panels share the exact soffit.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {createMediaShelfResourcesV158,makeMeasuredMediaRackV158} from './media-shelf-geometry-v158.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {CASSETTE_FIXTURES_V124,CASSETTE_LIGHTS_V124,CASSETTE_SIGN_V124,validateCassetteCastleV124}
 from './cassette-castle-plan-v124.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';

const covers=[
 ['MIDNIGHT SIGNAL','#1a303f','#d5ab7a','SLEEPLESS RADIO'],
 ['NORTH END TAPES','#344235','#ead4a7','LOCAL SESSIONS'],
 ['NEON QUIET','#452b3d','#f5b8b5','AFTER DARK'],
 ['LAST TRAIN HOME','#493c33','#e6c491','VOL. III'],
 ['THE BLUE HOUR','#243a50','#c9d3d9','SIDE A / SIDE B'],
 ['MAGNETIC SUMMER','#574b32','#e7a988','1979–1997'],
 ['MOTOR CITY ECHO','#344754','#b5c4a9','1996 DEMOS'],
 ['PAPER STARS','#4c394a','#d7c5ae','THE LAST SIDE'],
 ['COASTLINE STATIC','#433b29','#e0bd91','TAPE 07']
];
function originalSleeveTexture(design,assets){
 const [title,bg,ink,subtitle]=design;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Original record sleeve printing unavailable');
 ctx.fillStyle=bg;ctx.fillRect(0,0,512,512);
 ctx.fillStyle=ink;ctx.globalAlpha=.26;ctx.fillRect(45,45,422,275);
 for(let i=0;i<16;i++){
  ctx.lineWidth=1+i%3;ctx.globalAlpha=.13+(i%4)*.08;
  ctx.strokeStyle=ink;ctx.strokeRect(48+i*8,49+i*6,415-i*16,275-i*11);
 }
 ctx.globalAlpha=1;ctx.fillStyle=ink;
 ctx.font='bold 44px Georgia,serif';ctx.textAlign='center';
 ctx.fillText(title,256,380,465);
 ctx.font='bold 25px Arial,sans-serif';ctx.fillText(subtitle,256,435,446);
 ctx.fillStyle='#d9c8ad';ctx.fillRect(35,476,442,4);
 // Art is original: deliberately worn, not copied album covers.
 for(let i=0;i<36;i++){
  const x=20+(i*73)%465,y=10+(i*109)%466;
  ctx.fillStyle=i%3?'#d5c2a416':'#100e0c28';ctx.fillRect(x,y,2+i%6,2+i%4);
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 assets.textures.push(tex);return tex;
}
function material(assets,opt){
 const m=new THREE.MeshStandardMaterial(opt);assets.materials.push(m);return m;
}
function addBox(parent,name,x,y,z,sx,sy,sz,mat){
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat);
 m.name=name;m.position.set(x,y,z);m.castShadow=false;m.receiveShadow=true;parent.add(m);return m;
}
const C_W=.109,C_H=.069,C_D=.017; // Full-scale standard compact-cassette jewel cases.
function populateCassetteTable(f,index,assets){
 // The actual source medium nesting GLB measures 1.367 × .95 × .936m.
 // All added original merchandise rests on its real y=0.95 top and remains
 // inside the measured licensed table footprint, not a guessed support.
 const g=new THREE.Group();g.name='v124_original_table_supported_record_stock_'+f.id;
 g.position.set(f.x,0,f.z);g.rotation.y=f.yaw;
 const y=.95,stage=assets;
 addBox(g,'record_shop_supported_crate_bottom',0,y+.025,0,1.09,.05,.73,stage.wood);
 for(const side of [-1,1])
  addBox(g,'record_shop_crate_end',side*.535,y+.10,0,.026,.18,.73,stage.wood);
 for(let col=0;col<3;col++){
  const x=(col-1)*.347,design=covers[index*3+col];
  const tex=originalSleeveTexture(design,assets);
  const frame=addBox(g,'real_original_12inch_vinyl_record_sleeve',x,y+.20,-.20,
   .308,.31,.018,material(assets,{color:0xd1c7ac,roughness:.88}));
  const art=new THREE.Mesh(new THREE.PlaneGeometry(.301,.301),
   material(assets,{map:tex,roughness:.9,side:THREE.FrontSide}));
  art.position.set(x,y+.20,-.189);art.name='fictional_original_album_cover_'+col;g.add(art);
  frame.userData.realSleeve={metres:[.308,.31,.018],originalArt:design[0]};
 }
 addBox(g,'record_shop_album_front_retainer',0,y+.065,-.009,1.04,.06,.045,assets.brass);
 for(let col=0;col<7;col++){
  const x=(col-3)*.144;
  addBox(g,'compact_cassette_front_counter_stock',x,y+.085,.245,C_W,C_H,C_D,
   assets.caseMaterials[(col+index)%assets.caseMaterials.length]);
  addBox(g,'cassette_original_price_label',x,y+.086,.258,.08,.025,.002,
   assets.caseLabelMaterial[col%assets.caseLabelMaterial.length]);
 }
 assets.root.add(g);
 return {vinyl:3,cassette:7,supportId:f.id};
}
function populateSpinner(f,assets){
 const g=new THREE.Group();g.name='v124_original_promo_on_CC0_spinner_'+f.id;
 g.position.set(f.x,0,f.z);g.rotation.y=f.yaw;
 for(let i=0;i<4;i++){
  const yaw=i*Math.PI/2;
  const m=addBox(g,'full_scale_cassette_accessory_card',
   Math.sin(yaw)*.245,1.24,Math.cos(yaw)*.245,.16,.23,.015,
   assets.caseMaterials[i%assets.caseMaterials.length]);
  m.rotation.y=yaw;m.userData.originalMerchandise='1997 headphone cassette accessory blister';
 }
 assets.root.add(g);return 4;
}
function fitRealLicensedFixture(gltf,f,parent,assets){
 const media=f.kind==='wall_bay';
 const model=media?makeMeasuredMediaRackV158(gltf.scene,{id:f.id,targetHeight:f.targetHeight,yaw:f.yaw,radius:f.collisionRadius,resources:assets.media}):gltf.scene.clone(true);
 if(!media)model.rotation.y=f.yaw;
 model.updateMatrixWorld(true);
 let bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
 if(size.y<.05)throw Error('V124 authentic licensed fixture has zero-height geometry '+f.id);
 const scale=media?1:f.targetHeight/size.y;model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);size=bounds.getSize(new THREE.Vector3());
 if(Math.abs(size.y-f.targetHeight)>.001||
  Math.hypot(size.x/2,size.z/2)>f.collisionRadius+.005)
  throw Error('V124 authentic music-shop furniture overhangs grounded collider '+f.id);
 const center=bounds.getCenter(new THREE.Vector3());
 model.position.set(f.x-center.x,-bounds.min.y,f.z-center.z);model.updateMatrixWorld(true);
 bounds=new THREE.Box3().setFromObject(model);size=bounds.getSize(new THREE.Vector3());
 if(Math.abs(bounds.min.y)>.01)throw Error('V124 original fixture is not grounded '+f.id);
 model.name='v124_original_verified_CC0_shop_fixture_'+f.id;
 model.userData.licensedMusicRetailV124={sha256:f.sha256,source:f.source,license:f.license};
 // The source GLB geometry and attribution stay unchanged, but nearly
 // white shelving is visually incompatible with a neglected 1997 shop:
 // physically age only cloned material instances, never mutate vendor GLBs.
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=false;o.receiveShadow=true;
  if(media&&!o.isInstancedMesh){
   const sourceMats=Array.isArray(o.material)?o.material:[o.material];
   const weathered=sourceMats.map(src=>{
    const m=src.clone();assets.materials.push(m);
    if(m.color)m.color.multiply(new THREE.Color(0x77786d));
    if(typeof m.roughness==='number')m.roughness=Math.max(.87,m.roughness);
    return m;
   });
   o.material=Array.isArray(o.material)?weathered:weathered[0];
  }
 });
 parent.add(model);
 return {id:f.id,kind:f.kind,section:f.section,room:f.room,source:f.source,
  sha256:f.sha256,license:f.license,x:f.x,z:f.z,
  actualHeight:size.y,actualWidth:size.x,actualDepth:size.z,
  groundY:bounds.min.y,collisionRadius:f.collisionRadius,mediaShelf:model.userData.mediaShelfV158||null};
}
function installRealFluorescent(src,f,ceilings,assets){
 const slab=ceilings.find(s=>s.room==='cassette_castle'&&
  f.x>s.x1+1.1&&f.x<s.x2-1.1&&f.z>s.z1+1.1&&f.z<s.z2-1.1);
 if(!slab)throw Error('1997 shop ceiling absent for original lamp '+f.id);
 const underside=slab.y-slab.thickness/2;
 const model=src.scene.clone(true);
 model.rotation.x=Math.PI;model.position.set(f.x,underside-.025,f.z);model.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3());
 if(size.x<1.7||size.x>2.5||size.z<1.7||size.z>2.5||
  size.y<.10||size.y>.55||box.max.y>underside-.003||box.min.y>underside-.20)
  throw Error('1997 ceiling panel detached from actual 5.21m soffit '+f.id);
 const lenses=[],lensObjects=[];
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.raycast=()=>{};o.castShadow=false;o.receiveShadow=true;
  const src=Array.isArray(o.material)?o.material:[o.material];
  const cloned=src.map(m=>{
   const copy=m.clone();assets.materials.push(copy);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(copy.name)){
    if(!copy.emissive)throw Error('Source CC0 lamp lens missing '+f.id);
    copy.emissive.multiplyScalar(f.power);copy.emissiveIntensity=(copy.emissiveIntensity||1)*1.1;
    copy.color.multiplyScalar(.2+.8*f.power);lenses.push(copy);
   }
   return copy;
  });
  o.material=Array.isArray(o.material)?cloned:cloned[0];
  if(cloned.some(m=>lenses.includes(m)))lensObjects.push(o);
 });
 if(!lenses.length||!lensObjects.length)
  throw Error('Source CC0 1979 fluorescent has no actual lens '+f.id);
 const lensBox=new THREE.Box3();
 for(const lens of lensObjects)lensBox.expandByObject(lens);
 const emitterY=lensBox.getCenter(new THREE.Vector3()).y-.06;
 if(f.power>0){
  const light=new THREE.PointLight(0xc5d8c8,39*f.power,12,2);
  light.position.set(f.x,emitterY,f.z);
  light.name='v124_emission_tied_to_real_1979_lens_'+f.id;assets.ceilingRoot.add(light);
 }
 model.name='v124_real_original_ceiling_fluorescent_'+f.id;
 assets.ceilingRoot.add(model);
 return {id:f.id,x:f.x,z:f.z,power:f.power,ceilingUnderside:underside,
  emitterY,actualWidth:size.x,actualDepth:size.z,model:f.model,license:'CC0-1.0'};
}
function installAttachedIdentity(sign,assets){
 const backing=addBox(assets.root,'1979_masonry_fixed_cassette_shop_identity',
  sign.wallX+.17,sign.y,sign.z,.10,sign.height,sign.width,assets.wood);
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=360;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#1f2c2c';ctx.fillRect(0,0,2048,360);
 ctx.fillStyle='#947650';ctx.fillRect(0,0,2048,15);ctx.fillRect(0,347,2048,8);
 ctx.fillStyle='#dccbb3';ctx.textAlign='center';
 ctx.font='bold 146px Georgia,serif';ctx.fillText(sign.name,1024,177,1860);
 ctx.font='bold 52px Arial,sans-serif';ctx.fillText(sign.subtitle,1024,276,1760);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 assets.textures.push(tex);
 const print=new THREE.Mesh(new THREE.PlaneGeometry(sign.width-.12,sign.height-.08),
  material(assets,{map:tex,side:THREE.FrontSide,roughness:.87}));
 print.rotation.y=Math.PI/2;print.position.set(sign.wallX+.23,sign.y,sign.z);
 print.name='source_rear_wall_authored_period_music_identity';assets.root.add(print);
 return {id:sign.id,wallX:sign.wallX,mountedX:backing.position.x,
  printedX:print.position.x,y:sign.y,z:sign.z,width:sign.width};
}

/** Eight real wall-attached original-era posters, not floating billboards.
 * Every fictional group / title is created for Pinewood; no copyrighted
 * band logo, performance photograph or borrowed album sleeve is used.
 */
function installOriginalMusicPosters(assets){
 const posters=[
  ['north_helios','north',-43.0,-73.15,'HELIOS DRIVE','LIVE 1996','#374750','#d8c29d'],
  ['north_glass','north',-37.5,-73.15,'GLASS ENGINE','CASSETTE TOUR','#4d3c42','#e4bd9c'],
  ['north_night','north',-31.8,-73.15,'NIGHT BUS','NEW SINGLES','#384433','#c8d7ac'],
  ['south_signal','south',-43.1,-89.85,'SIGNAL','IMPORT TAPES','#323f53','#c1c8d7'],
  ['south_static','south',-38.4,-89.85,'RIVER STATIC','SIDE B','#4d4036','#d8c5a9'],
  ['south_paper','south',-32.0,-89.85,'PAPER STARS','FINAL PRESS','#503d50','#d1a8b8'],
  ['west_north','west',-45.84,-76.5,'LOCAL LIVE','MIXTAPES','#405147','#d3c7a9'],
  ['west_south','west',-45.84,-88.1,'DEEP CUTS','SALE / 99¢','#584632','#d4baa0']
 ];
 const manifests=[];
 for(const [id,wall,x,z,title,subtitle,bg,ink] of posters){
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=768;
  const c=canvas.getContext('2d');if(!c)throw Error('Original vintage poster texture unavailable');
  c.fillStyle=bg;c.fillRect(0,0,640,768);
  c.fillStyle=ink;c.globalAlpha=.20;
  c.fillRect(47,60,545,475);
  for(let i=0;i<13;i++){
   c.strokeStyle=ink;c.lineWidth=i%3+1;c.globalAlpha=.18+i*.02;
   c.beginPath();c.arc(320,270,34+i*23,0,Math.PI*2);c.stroke();
  }
  c.globalAlpha=1;c.textAlign='center';c.fillStyle=ink;
  c.font='bold 59px Georgia,serif';c.fillText(title,320,633,590);
  c.font='bold 33px Arial,sans-serif';c.fillText(subtitle,320,703,585);
  for(let i=0;i<68;i++){
   const xx=13+(i*89)%610,yy=7+(i*113)%737;
   c.fillStyle=i%4===0?'#eee4c326':'#16140b31';
   c.fillRect(xx,yy,2+i%6,1+i%3);
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;assets.textures.push(texture);
  const poster=new THREE.Group();poster.name='v124_genuinely_wall_fixed_music_poster_'+id;
  poster.position.set(wall==='west'?x:x,3.58,wall==='west'?z:z);
  poster.rotation.y=wall==='north'?Math.PI:wall==='west'?Math.PI/2:0;
  addBox(poster,'poster_original_masonry_backing',0,0,0,1.22,1.49,.024,assets.wood);
  const print=new THREE.Mesh(new THREE.PlaneGeometry(1.18,1.45),
   material(assets,{map:texture,side:THREE.FrontSide,roughness:.95}));
  print.position.set(0,0,.014);print.name='fictional_original_period_print';poster.add(print);
  assets.root.add(poster);
  manifests.push({id,wall,x,z,y:3.58,width:1.22,height:1.49,
   originalArtwork:true,masonryAttached:true});
 }
 return manifests;
}

export async function renderCassetteCastleV124(
 ground,ceilings,plan={fixtures:CASSETTE_FIXTURES_V124,lights:CASSETTE_LIGHTS_V124,sign:CASSETTE_SIGN_V124}
){
 if(!ground?.isObject3D)throw Error('Cassette Castle real source G level missing');
 const problems=validateCassetteCastleV124(plan,{ceilings});
 if(problems.length)throw Error('V124 music shop physical source plan invalid: '+problems.join(' | '));
 const paths=[...new Set([...plan.fixtures.map(f=>f.source),
  ANCHOR_FLUORESCENT_ASSET_V122.path])];
 const loader=new GLTFLoader(),models=new Map(await Promise.all(paths.map(async path=>{
  if(!path.startsWith('assets/vendor/builder/models/')||!path.endsWith('.glb'))
   throw Error('V124 refused off-origin or unlicensed original GLB '+path);
  return [path,await loader.loadAsync(new URL('../'+path,import.meta.url).href)];
 })));
 const assets={root:new THREE.Group(),ceilingRoot:new THREE.Group(),textures:[],materials:[],media:createMediaShelfResourcesV158('cassette')};
 assets.root.name='V124 original full size Cassette Castle licensed source fittings and merchandise';
 assets.ceilingRoot.name='V124 true original cassette shop fluorescent roof';
 assets.wood=material(assets,{color:0x4b4037,roughness:.91});
 assets.brass=material(assets,{color:0x7c735b,roughness:.77,metalness:.27});
 assets.edgeMaterial=material(assets,{color:0x151b1b,roughness:.8});
 assets.caseMaterials=[0x72877a,0x8a6163,0x627f8b,0xa69774,0x716776,0x6b754c]
  .map(color=>material(assets,{color,roughness:.86,metalness:.03}));
 assets.caseLabelMaterial=[0xb9a78b,0xd1cbad,0x837e67,0xbaa098]
  .map(color=>material(assets,{color,roughness:1}));
 const fixtures=plan.fixtures.map(f=>fitRealLicensedFixture(models.get(f.source),f,assets.root,assets));
 let wallCases=0,tableCases=0,vinylSleeves=0,spinnerCases=0,tableSupports=[];
 for(const f of plan.fixtures){
  if(f.kind==='wall_bay')wallCases+=fixtures.find(x=>x.id===f.id).mediaShelf.products;
  else if(f.kind==='table_medium'){
   const data=populateCassetteTable(f,tableSupports.length,assets);
   tableCases+=data.cassette;vinylSleeves+=data.vinyl;tableSupports.push(data.supportId);
  }else if(f.kind==='spinner')spinnerCases+=populateSpinner(f,assets);
 }
 const fluorescents=plan.lights.map(f=>installRealFluorescent(
  models.get(f.model),f,ceilings,assets));
 const interiorSign=installAttachedIdentity(plan.sign,assets);
 const posters=installOriginalMusicPosters(assets);
 // No partial GLB first frame: both original fixture / ceiling groups mount
 // after all source model loading and every physical bound check succeeds.
 ground.add(assets.root);ground.add(assets.ceilingRoot);
 return {root:assets.root,ceilingRoot:assets.ceilingRoot,
  manifest:{fixtures,fluorescents,interiorSign,posters,
   authoredPeriodStock:{wallCassetteCases:wallCases,tableCassetteCases:tableCases,
    spinnerCards:spinnerCases,vinylSleeves,tableSupports,
    totalCassetteCases:wallCases+tableCases+spinnerCases}},
  dispose(){
   assets.root.removeFromParent();assets.ceilingRoot.removeFromParent();
   assets.textures.forEach(t=>t.dispose());assets.materials.forEach(m=>m.dispose());assets.media.dispose();
  }};
}
