/**
 * V38 cinematic-only cockpit orientation fix atop the local v37 CC0 atmosphere. All model and PBR texture requests resolve
 * to manifest-verified, committed files in opening/assets/v37/ (NEVER remote).
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {GLTFLoader} from '../vendor/three/examples/jsm/loaders/GLTFLoader.js';
const base=new URL('./assets/v37/',import.meta.url);
const loader=new GLTFLoader();
const textureLoader=new THREE.TextureLoader();
const asURL=name=>new URL(name,base).href;
const finite=(x,min,max)=>Math.max(min,Math.min(max,x));
function placeRealSize(model,width,ground,cx,cz){
 model.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(model),sz=bounds.getSize(new THREE.Vector3());
 if(sz.x<.05||sz.y<.05||sz.z<.05)throw Error('Invalid imported object bounding box');
 const factor=width/sz.x;
 if(factor<.4||factor>2.1)throw Error('Imported CC0 model appears to use wrong units');
 model.scale.multiplyScalar(factor);model.updateMatrixWorld(true);
 bounds.setFromObject(model);
 const center=bounds.getCenter(new THREE.Vector3());
 model.position.x+=cx-center.x;
 model.position.y+=ground-bounds.min.y;
 model.position.z+=cz-center.z;
 model.updateMatrixWorld(true);
 return bounds.getSize(new THREE.Vector3()).toArray().map(n=>Number(n.toFixed(3)));
}
const promiseGLB=url=>new Promise((resolve,reject)=>loader.load(url,x=>resolve(x.scene),undefined,reject));
const promiseTexture=url=>new Promise((resolve,reject)=>textureLoader.load(url,resolve,undefined,reject));
function hazeTexture(){
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const context=canvas.getContext('2d'),g=context.createRadialGradient(64,64,2,64,64,63);
 g.addColorStop(0,'rgba(255,241,196,0.82)');
 g.addColorStop(.20,'rgba(250,214,150,0.40)');
 g.addColorStop(.63,'rgba(205,194,159,0.08)');
 g.addColorStop(1,'rgba(180,180,150,0)');
 context.fillStyle=g;context.fillRect(0,0,128,128);
 return new THREE.CanvasTexture(canvas);
}
function mistAndLights(scene,world){
 // Realistic night fog is localized around the lamps and distant storefronts,
 // not an opaque global white veil. No volumetric shader or remote asset.
 scene.background=new THREE.Color(0x0d171c);
 scene.fog=new THREE.FogExp2(0x15232a,.019);
 scene.traverse(o=>{
  if(o.isHemisphereLight)o.intensity=.80;
  if(o.isAmbientLight)o.intensity=.25;
 });
 const halo=hazeTexture();
 const lamps=[[-21,7.60,9],[28,7.60,5],[0,7.60,28],[12.2,4.5,-19.8]];
 for(const [x,y,z]of lamps){
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({
   map:halo,color:0xffdfa7,transparent:true,opacity:.68,
   blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true
  }));
  sprite.position.set(x,y,z);sprite.scale.set(8,11,1);world.add(sprite);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(3.6,7.4,24,1,true),
   new THREE.MeshBasicMaterial({color:0xc8b690,transparent:true,opacity:.033,side:THREE.DoubleSide,depthWrite:false}));
  cone.position.set(x,3.7,z);world.add(cone);
  const pool=new THREE.Mesh(new THREE.CircleGeometry(4.8,40),
   new THREE.MeshBasicMaterial({map:halo,color:0xd9b480,transparent:true,opacity:.17,
     blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  pool.rotation.x=-Math.PI/2;pool.scale.set(1.35,.80,1);
  pool.position.set(x,.025,z);world.add(pool);
 }
 // Distinct thin rain-slick films in cracks rather than a uniformly mirrorlike road.
 const puddleMaterial=new THREE.MeshPhysicalMaterial({
   color:0x253c44,roughness:.13,metalness:.16,clearcoat:1,clearcoatRoughness:.08,
   transparent:true,opacity:.48,depthWrite:false,side:THREE.DoubleSide
 });
 let puddles=0;
 for(let i=0;i<22;i++){
  const x=((i*17.23)%64)-31,z=((i*23.17)%40)-3;
  if(z<-11&&x>2&&x<25)continue; // Don't cover the service entrance.
  const patch=new THREE.Mesh(new THREE.CircleGeometry(1,22),puddleMaterial);
  patch.rotation.x=-Math.PI/2;
  patch.scale.set(.62+(i%4)*.66,.22+(i%3)*.21,1);
  patch.position.set(x,.022,z);world.add(patch);puddles++;
 }
 return{puddles,lamps:lamps.length};
}
async function loadMaterial(prefix,files,repeat){
 const maps={};
 for(const type of ['diff','nor_gl','rough']){
  const name=files.find(f=>new RegExp('^'+prefix+'_'+type+'\\.(?:jpg|png)$').test(f));
  if(!name)throw Error('Missing committed CC0 '+prefix+' '+type);
  const texture=await promiseTexture(asURL(name));
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(repeat[0],repeat[1]);
  texture.anisotropy=4;
  if(type==='diff')texture.colorSpace=THREE.SRGBColorSpace;
  maps[type]=texture;
 }
 return maps;
}
export async function upgradeOpeningSceneV37({scene,world,car,materials,lotMaterial,stage}){
 const status={version:41,state:'loading',car:'pending',phone:'removed',maps:[],lamp:'pending',errors:[],wet:null,source:'truck-cabin-interior.glb'};
 stage.v37=status;
 try{
  const response=await fetch(asURL('manifest.json'),{cache:'no-store',mode:'same-origin'});
  if(!response.ok)throw Error('Local v37 manifest HTTP '+response.status);
  const manifest=await response.json();
  if(manifest.license!=='CC0-1.0'||manifest.version!==37)throw Error('Unexpected v37 manifest');
  const files=manifest.assets.map(x=>x.file);
  const truckReply=await fetch(new URL('./assets/v41/manifest.json',import.meta.url),{cache:'no-store'});
  if(!truckReply.ok)throw Error('Missing local v41 utility cabin manifest');
  const truckMeta=await truckReply.json();
  if(truckMeta.version!==41||truckMeta.license!=='CC0-1.0'||truckMeta.asset!=='truck-cabin-interior.glb')
    throw Error('Unexpected truck model license / filename');
  // Update materials in place; all existing doorway and chapter boundaries stay.
  const [asphalt,wall,rust]=await Promise.all([
   loadMaterial('asphalt',files,[21,19]),
   loadMaterial('wall',files,[7,3]),
   loadMaterial('rust',files,[5,2])
  ]);
  lotMaterial.color.setHex(0xa8a8a6);
  lotMaterial.map=asphalt.diff;lotMaterial.normalMap=asphalt.nor_gl;
  lotMaterial.roughnessMap=asphalt.rough;lotMaterial.roughness=.43;lotMaterial.metalness=.08;
  materials.facade.color.setHex(0xbbb7b2);
  materials.facade.map=wall.diff;materials.facade.normalMap=wall.nor_gl;
  materials.facade.roughnessMap=wall.rough;materials.facade.roughness=.86;
  materials.steel.color.setHex(0xb4b3b0);
  materials.steel.map=rust.diff;materials.steel.normalMap=rust.nor_gl;
  materials.steel.roughnessMap=rust.rough;materials.steel.roughness=.70;
  for(const m of [lotMaterial,materials.facade,materials.steel])m.needsUpdate=true;
  status.maps=['asphalt_02','cracked_concrete_wall','rusty_metal'];
  status.wet=mistAndLights(scene,world);
  // Exactly ONE model; no authored car roof, windshield, seats, phone,
  // floating LCD or kitbashed frame. The vendor GLB supplies every surface.
  const cabinURL=new URL('./assets/v41/truck-cabin-interior.glb',import.meta.url);
  const model=await promiseGLB(cabinURL.href);
  model.name='Grab3D CC0 Truck Cabin Interior (only car mesh)';
  // Grab3D cabin convention faces +Z; cinematic driver looks toward -Z.
  model.rotation.y=Math.PI;model.updateMatrixWorld(true);
  const size=placeRealSize(model,2.28,0,0,.20);
  let meshes=0;
  model.traverse(o=>{
   if(o.isMesh){
    meshes++;
    const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms)if(m?.color)m.color.multiplyScalar(.55);
   }
  });
  car.add(model);
  car.updateWorldMatrix(true,true);
  if(car.children.length!==1||meshes<2)throw Error('Cabin is not a single self-contained vendor model');
  status.car='loaded';
  status.carBounds=size;
  status.modelMeshes=meshes;
  status.cockpit={construction:'single-GRAB3D-truck-cabin',vendorOnly:true,
    authoredCarMeshes:0,authoredRoofPanels:0,authoredWindshields:0,
    phoneMounts:0,phoneScreens:0,source:'truck-cabin-interior.glb',
    sourceSha256:truckMeta.sha256};
  // Detect geometry directly in front of the first-person eye, rather than
  // claiming that mesh counts alone guarantee a convincing camera angle.
  const eye=car.localToWorld(new THREE.Vector3(-.53,1.42,.45));
  status.cockpitViewRays=[-.15,0,.15].map(x=>{
   const ray=new THREE.Raycaster(eye,new THREE.Vector3(x,0,-1).normalize(),.08,.85);
   const result=ray.intersectObject(model,true)[0];
   return result?Number(result.distance.toFixed(3)):null;
  });
  status.carYawDeg=180;status.forwardAxis='-Z';
  if(manifest.streetLamp){
   try{
    const lamp=await new Promise((resolve,reject)=>loader.load(asURL(manifest.streetLamp),x=>resolve(x.scene),undefined,reject));
    for(const [x,z]of [[-21,9],[28,5],[0,28]]){
     const copy=lamp.clone(true);
     const size=placeRealSize(copy,.85,0,x,z);
     world.add(copy);status.lamp='loaded';
     status.lampBounds=size;
    }
   }catch(e){status.errors.push('Street fixture: '+String(e));status.lamp='fallback';}
  }else status.lamp='authored fixture';
  status.state='ready';
 }catch(error){
  status.state='failed';status.errors.push(String(error?.stack||error));
  console.error('[Pinewood v37] local CC0 scene failed:',error);
 }
 return status;
}
