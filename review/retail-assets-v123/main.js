import * as THREE from '../../vendor/three/build/three.module.js';
import {GLTFLoader} from '../../vendor/three/examples/jsm/loaders/GLTFLoader.js';
import {ANCHOR_STOCK_CANDIDATES_V123,validateAnchorStockSourcesV123}
 from '../../mall/anchor-stock-sources-v123.mjs';

const root=document.getElementById('scene'),veil=document.getElementById('veil');
const errors=validateAnchorStockSourcesV123();
const state={ready:false,errors:[...errors],assets:[],shot:'overview',
 localModels:0,firstFrameFullyLoaded:false};
let scene,camera,renderer;
const shots=new Map([['overview',{eye:[16,19,32],target:[0,1,-12]}]]);
function positionAt(name){
 const s=shots.get(name);
 if(!s)throw Error('Unknown pinned CC0 source camera '+name);
 state.shot=name;camera.position.set(...s.eye);camera.lookAt(...s.target);
 document.querySelectorAll('[data-shot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shot===name)));
 renderer.render(scene,camera);
}
const api={
 getState:()=>JSON.parse(JSON.stringify(state)),
 goto:positionAt,
 ready:false
};
window.__PINEWOOD_RETAIL_AUDIT_V123__=api;
function fitToHumanScale(gltf,item,i){
 const model=gltf.scene.clone(true),before=new THREE.Box3().setFromObject(model);
 const size=before.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.x+size.y+size.z)||size.y<.005)
  throw Error('Original GLB is flat/invalid: '+item.key);
 const scale=item.targetHeight/size.y;
 model.scale.multiplyScalar(scale);model.updateMatrixWorld(true);
 const bb=new THREE.Box3().setFromObject(model),bbSize=bb.getSize(new THREE.Vector3()),bbCenter=bb.getCenter(new THREE.Vector3());
 const x=(i%3-1)*8,z=-Math.floor(i/3)*12;
 model.position.set(x-bbCenter.x,-bb.min.y,z-bbCenter.z);
 model.name='original_glb_'+item.key;
 model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 scene.add(model);
 const dim=Object.freeze({x:bbSize.x,y:bbSize.y,z:bbSize.z});
 const manifest={id:item.key,label:item.label,model:item.path,sha256:item.sha256,
  license:item.license,position:{x,z},width:dim.x,height:dim.y,depth:dim.z,
  sourceDimensions:[size.x,size.y,size.z],scale,
  targetHeight:item.targetHeight,
  physicallyPlausible:dim.x<=5&&dim.z<=5&&dim.y<=3.3,
  sourceMeshCount:(()=>{let n=0;model.traverse(o=>{if(o.isMesh)n++});return n})()};
 const floor=new THREE.Mesh(new THREE.BoxGeometry(6,.13,6),
  new THREE.MeshStandardMaterial({color:(i%2)?0x6b6356:0x5b625e,roughness:.93}));
 floor.position.set(x,-.105,z);floor.receiveShadow=true;scene.add(floor);
 const frame=new THREE.Group();frame.position.set(x,0,z);scene.add(frame);
 // This low sample deck is explicitly separate from the real game; the real
 // tenant interiors receive no candidate assets until audited and approved.
 for(const sign of [-1,1]){
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(5.8,.03,.10),
   new THREE.MeshStandardMaterial({color:0xb7a178}));
  stripe.position.set(0,.03,sign*2.9);frame.add(stripe);
 }
 shots.set(item.key,{eye:[x+3.3,2.65,z+5.8],target:[x,1.2,z]});
 const btn=document.createElement('button');
 btn.dataset.shot=item.key;btn.textContent=item.label;
 btn.addEventListener('click',()=>positionAt(item.key));
 document.getElementById('controls').append(btn);
 return manifest;
}
async function begin(){
 try{
  if(errors.length)throw Error('Canonical retail source changed: '+errors.join('; '));
  scene=new THREE.Scene();scene.background=new THREE.Color(0x182b2c);
  camera=new THREE.PerspectiveCamera(60,1,.05,250);
  scene.add(new THREE.HemisphereLight(0xdfe5d9,0x526463,2.5));
  const sun=new THREE.DirectionalLight(0xfff0df,2.8);sun.position.set(12,23,15);scene.add(sun);
  const warm=new THREE.PointLight(0xffedd0,500,34,2);warm.position.set(0,12,0);scene.add(warm);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  root.prepend(renderer.domElement);
  const resize=()=>{
   const w=Math.max(320,root.clientWidth),h=Math.max(420,root.clientHeight);
   camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
   renderer.render(scene,camera);
  };
  window.addEventListener('resize',resize);
  const loader=new GLTFLoader();
  // Each source GLB is local to this repository and loaded before the very
  // first frame. No external runtime fetch, placeholders or image thumbnails.
  const loaded=await Promise.all(ANCHOR_STOCK_CANDIDATES_V123.map(async item=>{
   const uri=new URL('../../'+item.path,import.meta.url).href;
   return loader.loadAsync(uri);
  }));
  state.assets=loaded.map((g,i)=>fitToHumanScale(g,ANCHOR_STOCK_CANDIDATES_V123[i],i));
  state.localModels=loaded.length;
  resize();positionAt('overview');
  state.firstFrameFullyLoaded=true;state.ready=true;api.ready=true;
  veil.style.display='none';
  document.getElementById('status').textContent='Eight original CC0 stock props independently loaded and measured. Preview only; no mall furniture changed.';
  document.getElementById('readout').textContent=state.assets.map(m=>
   m.id+'\n '+m.width.toFixed(2)+'m W × '+m.height.toFixed(2)+'m H × '+m.depth.toFixed(2)+'m D'+
   '\n '+m.sourceMeshCount+' real source meshes · '+(m.physicallyPlausible?'physical scale plausible':'REQUIRES MANUAL DIMENSION REVIEW')
  ).join('\n\n');
 }catch(e){
  state.errors.push(String(e?.stack||e));
  veil.textContent='Retail-source audit error: '+String(e?.message||e);
  console.error(e);
 }
}
document.querySelector('[data-shot="overview"]').addEventListener('click',()=>positionAt('overview'));
window.addEventListener('pagehide',()=>renderer?.dispose());
begin();