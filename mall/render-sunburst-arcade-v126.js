/** Real V126 1997 Sunburst Arcade. Source GLB mesh parts, never fake cabinets.
 * Original fictional machine marquees and wall art use repository-local canvas
 * textures; the V30 source pack and V122 ceiling fittings are already CC0.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {
 SUNBURST_PACK_V126,SUNBURST_FIXTURES_V126,SUNBURST_LIGHTS_V126,
 SUNBURST_SIGN_V126,SUNBURST_POSTERS_V126,validateSunburstArcadeV126
} from './sunburst-arcade-plan-v126.mjs';

const createMaterial=(assets,o)=>{
 const mat=new THREE.MeshStandardMaterial(o);assets.materials.push(mat);return mat;
};
function print(assets,title,subtitle,{ink='#e8bc77',background='#202a39',
 width=1024,height=340}={}){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const c=canvas.getContext('2d');
 if(!c)throw Error('V126 original fictional arcade print canvas unavailable');
 c.fillStyle=background;c.fillRect(0,0,width,height);
 c.strokeStyle=ink;c.globalAlpha=.24;
 for(let i=0;i<5;i++){c.lineWidth=2+i%2;c.strokeRect(20+i*15,18+i*9,width-40-i*30,height-36-i*18)}
 c.globalAlpha=1;c.fillStyle=ink;c.textAlign='center';
 const scale=width/height>2?Math.min(height*.36,width*.093):Math.min(height*.14,width*.125);
 c.font='bold '+Math.round(scale)+'px Georgia,serif';
 c.fillText(title,width/2,height*.54,width*.90);
 c.font='bold '+Math.round(Math.min(height*.16,width*.037))+'px Arial,sans-serif';
 c.fillText(subtitle,width/2,height*.78,width*.88);
 c.fillStyle='#c29c68';c.fillRect(25,height*.92,width-50,5);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=4;assets.textures.push(texture);return texture;
}
function box(root,name,x,y,z,w,h,d,mat){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 mesh.name=name;mesh.position.set(x,y,z);mesh.receiveShadow=true;root.add(mesh);return mesh;
}
function fitOriginalSource(pack,f,assets){
 const original=pack.scene.getObjectByName(f.node);
 if(!original||!original.isObject3D)throw Error('V126 authentic GLB node missing '+f.node);
 // A glTF node can be a named Group containing one or more Mesh children.
 // Preserve the original real source hierarchy and require actual geometry.
 let sourceMeshes=0;original.traverse(o=>{if(o.isMesh)sourceMeshes++});
 if(!sourceMeshes)throw Error('V126 original named arcade node contains no mesh '+f.node);
 const model=original.clone(true);
 // The pack is a showroom: source node translations lay out all 17 models
 // together. Reset only the showroom translation, not the actual mesh shape.
 model.position.set(0,0,0);model.rotation.set(0,0,0);model.scale.set(1,1,1);
 model.updateMatrixWorld(true);
 let b=new THREE.Box3().setFromObject(model),size=b.getSize(new THREE.Vector3());
 if(Math.abs(size.x-f.sourceSize[0])>.012||
  Math.abs(size.y-f.sourceSize[1])>.012||
  Math.abs(size.z-f.sourceSize[2])>.012)
  throw Error('V126 real model geometry differs from audited V30 metres '+f.id);
 model.rotation.y=f.yaw;model.updateMatrixWorld(true);
 b=new THREE.Box3().setFromObject(model);size=b.getSize(new THREE.Vector3());
 if(Math.hypot(size.x/2,size.z/2)>f.collisionRadius+.005)
  throw Error('V126 real imported coin-op extends outside physical walk collider '+f.id);
 const center=b.getCenter(new THREE.Vector3());
 model.position.set(f.x-center.x,-b.min.y,f.z-center.z);
 model.updateMatrixWorld(true);
 b=new THREE.Box3().setFromObject(model);
 if(Math.abs(b.min.y)>.01)throw Error('V126 authentic arcade cabinet floats '+f.id);
 model.name='v126_actual_original_CC0_arcade_'+f.id;
 model.userData.realSource={path:f.source,mesh:f.node,sha256:f.sha256,license:f.license};
 model.traverse(o=>{
  if(!o.isMesh)return;o.castShadow=false;o.receiveShadow=true;
  const current=Array.isArray(o.material)?o.material:[o.material];
  const aged=current.map(m=>{
   const mat=m.clone();assets.materials.push(mat);
   if(mat.color)mat.color.multiply(new THREE.Color(0xa19c93));
   if(typeof mat.roughness==='number')mat.roughness=Math.max(.64,mat.roughness);
   return mat;
  });
  o.material=Array.isArray(o.material)?aged:aged[0];
 });
 assets.root.add(model);
 // These are genuine machine-attached original printed marquees, not
 // procedural stand-ins for, or rescalings of, the licensed cabinet geometry.
 if(!['ticket_eater','token_changer','prize_wall','skee_ball'].includes(f.node)){
  const local=new THREE.Group();local.name='v126_original_fictional_marquee_on_real_'+f.id;
  local.position.set(f.x,0,f.z);local.rotation.y=f.yaw;
  const width=Math.min(f.sourceSize[0]*.82,.76);
  const z=f.sourceSize[2]/2+.011,top=Math.min(f.sourceSize[1]-.13,1.78);
  const artwork=print(assets,f.title,'SUNBURST  ·  25¢',{width:768,height:240,
   ink:['#e9ab75','#96cad4','#d2bb8d'][f.id.length%3]});
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,.22),
   createMaterial(assets,{map:artwork,side:THREE.DoubleSide,roughness:.82}));
  panel.position.set(0,top,z);panel.name='1997_licensed_cabinet_attached_fictional_marquee';local.add(panel);
  assets.root.add(local);
 }
 return {id:f.id,node:f.node,title:f.title,x:f.x,z:f.z,
  source:f.source,sha256:f.sha256,license:f.license,
  actualWidth:size.x,actualDepth:size.z,actualHeight:size.y,
  groundY:b.min.y,collisionRadius:f.collisionRadius,realMesh:true};
}
function ceilingLamp(gltf,f,ceilings,assets){
 const slab=ceilings.find(c=>c.room==='sunburst_arcade'&&
  f.x>c.x1+1.1&&f.x<c.x2-1.1&&f.z>c.z1+1.1&&f.z<c.z2-1.1);
 if(!slab)throw Error('V126 original ceiling unavailable '+f.id);
 const underside=slab.y-slab.thickness/2;
 const model=gltf.scene.clone(true);
 model.rotation.x=Math.PI;model.position.set(f.x,underside-.025,f.z);
 model.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(model),s=b.getSize(new THREE.Vector3());
 if(s.x<1.7||s.x>2.5||s.z<1.7||s.z>2.5||s.y<.10||s.y>.55||
  b.max.y>underside-.003||b.min.y>underside-.20)
  throw Error('V126 real fluorescent not attached to actual soffit '+f.id);
 let lensCount=0;
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.castShadow=false;o.receiveShadow=true;o.raycast=()=>{};
  const original=Array.isArray(o.material)?o.material:[o.material];
  const cloned=original.map(m=>{
   const mat=m.clone();assets.materials.push(mat);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(mat.name)){
    lensCount++;mat.emissive.multiplyScalar(f.power);
    mat.emissiveIntensity=(mat.emissiveIntensity||1)*.85;
    mat.color.multiplyScalar(.17+.83*f.power);
   }
   return mat;
  });
  o.material=Array.isArray(o.material)?cloned:cloned[0];
 });
 if(!lensCount)throw Error('V126 actual source lamp has no visible lens '+f.id);
 if(f.power){
  const light=new THREE.PointLight(0xb5bfd4,34*f.power,10,2);
  light.name='v126_real_mounted_dim_fluorescent_emission_'+f.id;
  light.position.set(f.x,underside-.19,f.z);assets.ceilingRoot.add(light);
 }
 model.name='v126_real_local_CC0_ceiling_lamp_'+f.id;assets.ceilingRoot.add(model);
 return {id:f.id,power:f.power,source:f.model,sha256:f.sha256,
  license:f.license,ceilingUnderside:underside,actualWidth:s.x,
  actualDepth:s.z,actualHeight:s.y};
}
function wallArt(assets,p,identity=false){
 const frame=new THREE.Group();frame.name='v126_masonry_fixed_original_arcade_'+p.id;
 if(identity){
  // west wall x=-46, face into the shop (+X)
  frame.position.set(p.wallX+.16,p.y,p.z);frame.rotation.y=Math.PI/2;
 }else{
  frame.position.set(p.x,3.38,p.z);
  frame.rotation.y=p.wall==='north'?Math.PI:p.wall==='west'?Math.PI/2:0;
 }
 const width=identity?p.width:1.13,height=identity?p.height:1.47;
 const backing=createMaterial(assets,{color:0x39363c,roughness:.91});
 box(frame,'real_masonry_fixed_print_backing',0,0,0,width,height,.045,backing);
 const tex=print(assets,identity?p.title:p.title,
  identity?p.subtitle:p.subtitle,{width:identity?2048:640,
  height:identity?360:768,ink:identity?'#f1c778':p.ink,
  background:identity?'#332b3c':'#252d3b'});
 const panel=new THREE.Mesh(new THREE.PlaneGeometry(width-.06,height-.065),
  createMaterial(assets,{map:tex,roughness:.96,side:THREE.DoubleSide}));
 panel.position.z=.025;panel.name='original_1997_arcade_poster_print';frame.add(panel);
 assets.root.add(frame);
 return {id:p.id,originalArtwork:true,masonryAttached:true,
  wall:identity?'west':p.wall,title:identity?p.title:p.title};
}
export async function renderSunburstArcadeV126(ground,ceilings,plan={
 fixtures:SUNBURST_FIXTURES_V126,lights:SUNBURST_LIGHTS_V126,
 sign:SUNBURST_SIGN_V126,posters:SUNBURST_POSTERS_V126
}){
 if(!ground?.isObject3D)throw Error('V126 original physical G-level source group missing');
 const problems=validateSunburstArcadeV126(plan,{ceilings});
 if(problems.length)throw Error('Sunburst physical source invalid: '+problems.join(' | '));
 const loader=new GLTFLoader();
 const [pack,lightPack]=await Promise.all([
  loader.loadAsync(new URL('../'+SUNBURST_PACK_V126.path,import.meta.url).href),
  loader.loadAsync(new URL('../'+plan.lights[0].model,import.meta.url).href)
 ]);
 const assets={root:new THREE.Group(),ceilingRoot:new THREE.Group(),textures:[],materials:[]};
 assets.root.name='V126 genuinely licensed 1997 Sunburst Arcade cabinet interiors';
 assets.ceilingRoot.name='V126 four genuine ceiling-mounted CC0 arcade fluorescents';
 // Load and measure every real GLB machine before committing ANY arcade scene
 // content. The actual physical-shell scene, gameplay and Builder share it.
 const fixtures=plan.fixtures.map(f=>fitOriginalSource(pack,f,assets));
 const fluorescents=plan.lights.map(l=>ceilingLamp(lightPack,l,ceilings,assets));
 const identity=wallArt(assets,plan.sign,true);
 const posters=plan.posters.map(p=>wallArt(assets,p));
 ground.add(assets.root);ground.add(assets.ceilingRoot);
 return {root:assets.root,ceilingRoot:assets.ceilingRoot,
  manifest:{fixtures,fluorescents,identity,posters,
   sourcePack:SUNBURST_PACK_V126.path,actualFullSizeMachines:fixtures.length},
  dispose(){
   assets.root.removeFromParent();assets.ceilingRoot.removeFromParent();
   assets.textures.forEach(t=>t.dispose());assets.materials.forEach(m=>m.dispose());
  }};
}
