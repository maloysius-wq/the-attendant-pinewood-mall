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
 const status={version:42,state:'loading',car:'pending',phone:'removed',maps:[],lamp:'pending',errors:[],wet:null,source:'1990s-hatchback.glb'};
 stage.v37=status;
 try{
  const response=await fetch(asURL('manifest.json'),{cache:'no-store',mode:'same-origin'});
  if(!response.ok)throw Error('Local v37 manifest HTTP '+response.status);
  const manifest=await response.json();
  if(manifest.license!=='CC0-1.0'||manifest.version!==37)throw Error('Unexpected v37 manifest');
  const files=manifest.assets.map(x=>x.file);
  const metaResp=await fetch(new URL('./assets/v42/manifest.json',import.meta.url),{cache:'no-store'});
  if(!metaResp.ok)throw Error('Enclosed car manifest missing');
  const carMeta=await metaResp.json();
  if(carMeta.version!==42||carMeta.license!=='CC0-1.0'||carMeta.model!=='1990s-hatchback.glb'
    ||!carMeta.meshList?.some(x=>/body/.test(x.name))
    ||!carMeta.meshList?.some(x=>/windows/.test(x.name))
    ||!carMeta.materials?.some(x=>/window_glass/.test(x.name)&&x.alphaMode==='BLEND'))
    throw Error('Missing complete body, real window glass, or CC0 license');
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
  // FULL enclosed 1990s hatchback. Its GLB supplies the roof, windshield,
  // cabin, seats, wheels and dashboard, not a second hand-built shell.
  const model=await promiseGLB(new URL('./assets/v42/1990s-hatchback.glb',import.meta.url).href);
  model.name='Complete Grab3D CC0 1990s Hatchback';
  // Source front wheels +Z; nose toward Pinewood Mall must be -Z.
  model.rotation.y=Math.PI;model.updateMatrixWorld(true);
  const size=placeRealSize(model,1.86,0,0,0);
  status.measuredCarBounds=size;
  let meshes=0,glass=0;
  model.traverse(o=>{
    if(!o.isMesh)return;
    meshes++;
    for(const m of Array.isArray(o.material)?o.material:[o.material]){
      if(!m)continue;
      if(/window_glass/i.test(m.name||'')){
        glass++;m.transparent=true;m.opacity=.17;
        m.depthWrite=false;m.side=THREE.DoubleSide;m.roughness=.08;m.needsUpdate=true;
      }else if(m.color){
        m.color.multiplyScalar(.63);
        // The original GLB labels all body faces double-sided. From INSIDE,
        // backfaces of exterior shell then render as giant black blockers.
        // Keep the exact original geometry and real roof, but render only
        // forward-facing original body surfaces (no handmade car shell).
        if(/body_pbr/i.test(m.name||'')){
          m.side=THREE.FrontSide;
          m.needsUpdate=true;
        }
      }
    }
  });
  if(glass<1)throw Error('GLB missing transparent windshield');
  car.add(model);car.updateWorldMatrix(true,true);
  if(car.children.length!==1||meshes<5)throw Error('A second car or empty car found');
  const eye=car.localToWorld(new THREE.Vector3(-.41,1.10,-.35));
  const roof=new THREE.Raycaster(eye,new THREE.Vector3(0,1,0),.04,.85)
    .intersectObject(model,true).filter(x=>!/windows/i.test(x.object.name||''))[0];
  // Test the roof from OUTSIDE, where source-facing surface normals exist.
  // A separate, controlled roof-height test avoids false negatives caused
  // by the deliberate one-sided interior view material.
  const topHit=new THREE.Raycaster(
     car.localToWorld(new THREE.Vector3(-.41,2.1,-.35)),
     new THREE.Vector3(0,-1,0),.30,1.3)
    .intersectObject(model,true).find(h=>!/windows/i.test(h.object.name||''));
  const roofHeight=topHit?+(2.1-topHit.distance).toFixed(3):null;
  status.roofHeight=roofHeight;
  const roofDistance=roofHeight===null?null:roofHeight-1.10;
  // Diagnostic grid: assess the actual GLB top surface before accepting the
  // first-person eye; do not mistake the published model description for proof.
  status.roofSamples=[];
  for(const lx of [-.64,-.41,0,.41,.64])for(const lz of [-1.15,-.75,-.35,.1,.55]){
    const start=car.localToWorld(new THREE.Vector3(lx,.72,lz));
    const hits=new THREE.Raycaster(start,new THREE.Vector3(0,1,0),.04,1.2)
      .intersectObject(model,true);
    status.roofSamples.push({x:lx,z:lz,hits:hits.slice(0,2).map(h=>+h.distance.toFixed(3))});
  }
  const forwardHits=new THREE.Raycaster(eye,new THREE.Vector3(0,0,-1),.04,4)
    .intersectObject(model,true).slice(0,6).map(h=>({mesh:h.object.name,d:+h.distance.toFixed(3)}));
  status.car='loaded';status.carBounds=size;status.modelMeshes=meshes;
  status.carYawDeg=180;status.forwardAxis='-Z';
  status.roofRayDistance=roofDistance===null?null:+roofDistance.toFixed(3);status.windows=glass;status.forwardHits=forwardHits;
  status.cockpit={construction:'complete-GRAB3D-enclosed-hatchback',
    vendorOnly:true,originalRoof:true,transparentWindows:true,
    authoredCarMeshes:0,authoredWindshields:0,phoneMounts:0,phoneScreens:0,
    source:'1990s-hatchback.glb',sourceSha256:carMeta.sha256};
  status.cockpitViewRays=[-.15,0,.15].map(x=>{
    const hit=new THREE.Raycaster(eye,new THREE.Vector3(x,0,-1).normalize(),.03,.38)
      .intersectObject(model,true)[0];
    return hit?+hit.distance.toFixed(3):null;
  });
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
