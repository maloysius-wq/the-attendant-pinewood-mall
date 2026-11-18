/** V127b: real fixed Annex service ceiling and wall signage.
 * The original 1992 property shell supplies every actual ceiling and wall.
 * Licensed CC0 fluorescent meshes are locally loaded and physically mounted.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ANNEX_SPINE_V127B,ANNEX_LAMPS_V127B,ANNEX_SIGNS_V127B,
 ANNEX_LAMP_SOURCE_V127B,validateAnnexSpineV127B}
 from './annex-corridor-plan-v127b.mjs';

function signTexture(s){
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=240;
 const c=canvas.getContext('2d');if(!c)throw Error('original east Annex stencil texture unavailable');
 c.fillStyle='#233437';c.fillRect(0,0,1600,240);
 c.fillStyle='#a5a49b';c.fillRect(16,16,1568,5);
 c.fillStyle='#b0aba0';c.fillRect(16,220,1568,3);
 c.textBaseline='middle';c.textAlign='center';
 c.font='bold 93px Arial,sans-serif';c.fillStyle='#e0e0d2';
 c.fillText(s.label,800,123,1510);
 // Subtle 1997 institutional print aging on the actual enamel face.
 for(let i=0;i<175;i++){
  const x=29+(i*283)%1545,y=27+(i*67)%187;
  c.fillStyle=i%3===0?'#6c746b55':'#09141955';c.fillRect(x,y,2+(i%4),1+(i%3));
 }
 const t=new THREE.CanvasTexture(canvas);
 t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
function box(group,name,pos,size,material){
 const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);
 m.name=name;m.position.set(...pos);m.receiveShadow=true;group.add(m);return m;
}
function mountSign(group,s,materials,textures){
 const m=new THREE.MeshStandardMaterial({color:0x364346,roughness:.83,metalness:.25});
 materials.push(m);
 // 10cm original metal backing penetrates the existing source masonry
 // just enough to be fixed to it, not a free-standing or floating board.
 box(group,'v127b_source_masonry_backed_'+s.id,
  [s.wallX-.13,s.y,s.z],[.10,s.height+.07,s.width+.10],m);
 const tex=signTexture(s);textures.push(tex);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(s.width-.09,s.height-.045),
  new THREE.MeshBasicMaterial({map:tex,side:THREE.FrontSide}));
 materials.push(face.material);
 face.rotation.y=-Math.PI/2;
 face.name='v127b_printed_existing_wall_plate_'+s.id;
 face.position.set(s.wallX-.19,s.y,s.z);group.add(face);
 return {id:s.id,room:s.room,label:s.label,wallX:s.wallX,face:-1,
  z:s.z,y:s.y,width:s.width,mountedX:face.position.x};
}
function mountRealFluorescent(group,gltf,p,ceilings,materials){
 const slab=ceilings.find(c=>c.room===p.room&&
  p.x>c.x1+1.15&&p.x<c.x2-1.15&&p.z>c.z1+1.15&&p.z<c.z2-1.15);
 if(!slab)throw Error('real Annex ceiling not found for original lamp '+p.id);
 const underside=slab.y-slab.thickness/2;
 const model=gltf.scene.clone(true);
 model.rotation.x=Math.PI; // Correct downward orientation of genuine lens.
 model.position.set(p.x,underside-.025,p.z);
 model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model);
 const sz=bounds.getSize(new THREE.Vector3());
 if(sz.x<1.7||sz.x>2.5||sz.z<1.7||sz.z>2.5||
   sz.y<.10||sz.y>.55||bounds.max.y>underside-.003||
   bounds.min.y>underside-.22)
  throw Error('real source fluorescent has incorrect Annex ceiling fit '+p.id);
 let lenses=0;
 model.traverse(o=>{
  if(!o.isMesh)return;
  o.raycast=()=>{};o.receiveShadow=true;o.castShadow=false;
  const original=Array.isArray(o.material)?o.material:[o.material];
  const copy=original.map(m=>{
   const n=m.clone();materials.push(n);
   if(/^(light|emissive|lamp|fluorescent)$/i.test(n.name)){
    if(!n.emissive)throw Error('source GLB no longer has physical light lens '+p.id);
    n.emissive.multiplyScalar(p.power);
    n.emissiveIntensity=(n.emissiveIntensity||1)*1.04;
    n.color.multiplyScalar(.21+.79*p.power);lenses++;
   }
   return n;
  });
  o.material=Array.isArray(o.material)?copy:copy[0];
 });
 if(!lenses)throw Error('authentic Annex fluorescent has no source lens '+p.id);
 model.name='v127b_source_verified_ceiling_fluorescent_'+p.id;
 model.userData.sourceLamp={license:'CC0-1.0',
  originalSHA256:ANNEX_LAMP_SOURCE_V127B.sha256,id:p.id};
 group.add(model);
 if(p.power>.1){
  // Independent, tired maintenance lighting. Actual emitter beneath real lens.
  const light=new THREE.PointLight(0xc6d5c6,13*p.power,10.6,2);
  light.position.set(p.x,underside-.22,p.z);
  light.name='v127b_light_issued_by_original_fluorescent_'+p.id;
  group.add(light);
 }
 return {id:p.id,x:p.x,z:p.z,room:p.room,actualWidth:sz.x,actualDepth:sz.z,
  actualHeight:sz.y,ceilingId:slab.id,underside,groundingError:bounds.max.y-underside,
  power:p.power,source:ANNEX_LAMP_SOURCE_V127B.path,
  sha256:ANNEX_LAMP_SOURCE_V127B.sha256,license:'CC0-1.0',lenses};
}
export async function renderAnnexCorridorV127B(parent,ceilings,{plan=ANNEX_SPINE_V127B,
 lamps=ANNEX_LAMPS_V127B,signs=ANNEX_SIGNS_V127B}={}){
 if(!parent?.isObject3D)throw Error('original Pinewood property group is missing');
 const errors=validateAnnexSpineV127B(plan,{lamps,signs,ceilings});
 if(errors.length)throw Error('invalid source-attached east Annex '+errors.join(' | '));
 const asset=ANNEX_LAMP_SOURCE_V127B.path;
 if(!asset.startsWith('assets/vendor/builder/models/')||!asset.endsWith('.glb'))
  throw Error('non-local Annex light model denied');
 const gltf=await new GLTFLoader().loadAsync(new URL('../'+asset,import.meta.url).href);
 const root=new THREE.Group();root.name='V127b original real 1992 East Annex staff corridor';
 const ceilingRoot=new THREE.Group();ceilingRoot.name='V127b attached operational ceiling';
 root.add(ceilingRoot);
 const materials=[],textures=[];
 try{
  const panels=lamps.map(p=>mountRealFluorescent(ceilingRoot,gltf,p,ceilings,materials));
  const plates=signs.map(s=>mountSign(root,s,materials,textures));
  parent.add(root);
  return {root,ceilingRoot,panels,plates,groundTileSquareMetres:
   (plan.floor.x2-plan.floor.x1)*(plan.floor.z2-plan.floor.z1),
   dispose(){for(const tex of textures)tex.dispose();
    for(const mat of materials)mat.dispose();}
  };
 }catch(err){
  for(const tex of textures)tex.dispose();
  for(const mat of materials)mat.dispose();
  throw err;
 }
}
