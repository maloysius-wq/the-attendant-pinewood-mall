import * as THREE from '../../vendor/three/build/three.module.js';
import {renderPinewoodV69} from '../../mall/render-shell-v69.js';
import {FURNISHINGS_V69} from '../../mall/furnishing-plan-v69.mjs';
import {MALL} from '../../mall/masterplan-v66.mjs';

const holder=document.getElementById('viewport');
const cover=document.getElementById('cover');
const shots={
 entrance:{eye:[24,1.72,-88.5],target:[39,1.65,-88.5],title:'Authentic 4.2m Entrance',
  text:'Original gallery and V115 glass front lead directly into the old food court.'},
 seating:{eye:[34.65,1.75,-88.45],target:[37.7,1.0,-83.6],title:'Original Dining Area',
  text:'All existing V69 tables, seats and abandoned plates/cup, not empty shell proxies.'},
 rear:{eye:[35.0,1.75,-88.5],target:[45,1.65,-88.5],title:'Unused Back Wall',
  text:'Existing dining furniture competes with the only appropriate vendor counter wall.'},
 plan:{eye:[39.5,28,-88.5],target:[37.5,0,-88.5],title:'Measured 17m × 17m Plan',
  text:'Survey-only ceiling cutaway shows physical storefront, tables, side clearances and rear wall.'}
};
let scene,camera,renderer,building,shot='entrance',light;
const state={ready:false,errors:[],room:{},furniture:[],shot,modelsLoaded:0,uniqueModels:0,
 remoteRequests:[],firstFrameFullyLoaded:false,sourceDoor:true,vendors:[]};
const api={
 getState:()=>JSON.parse(JSON.stringify(state)),
 goto(name){if(!shots[name])throw Error('Unknown food court camera '+name);select(name);},
 ready:false
};
window.__PINEWOOD_FOOD_COURT_V119__=api;
function select(name){
 shot=name;state.shot=name;
 const s=shots[name];
 if(camera){
  camera.position.set(...s.eye);camera.lookAt(new THREE.Vector3(...s.target));
 }
 if(building)building.setRoofVisible(false);
 document.getElementById('title').textContent=s.title;
 document.getElementById('description').textContent=s.text;
 document.querySelectorAll('[data-shot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shot===name)));
 renderer?.render(scene,camera);
}
function resize(){
 const w=Math.max(300,holder.clientWidth),h=Math.max(360,holder.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
async function begin(){
 try{
  scene=new THREE.Scene();scene.background=new THREE.Color(0x101a1d);
  // Survey-only diffuse fill reveals room contents in top-down inspection.
  // The playable mall retains its existing 1997 lighting unchanged.
  scene.add(new THREE.HemisphereLight(0xfff0da,0x525856,1.25));
  const surveySun=new THREE.DirectionalLight(0xffe6be,.72);
  surveySun.position.set(25,35,18);scene.add(surveySun);
  scene.fog=new THREE.FogExp2(0x111b1b,.004);
  camera=new THREE.PerspectiveCamera(72,1,.06,570);
  light=new THREE.PointLight(0xf4e3ca,100,32,2);camera.add(light);
  scene.add(camera);
  renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.14;
  holder.prepend(renderer.domElement);
  resize();
  const room=MALL.rooms.find(r=>r.id==='food_court');
  if(!room||room.x1!==29||room.x2!==46||room.z1!==-97||room.z2!==-80)
   throw Error('Source food-court footprint no longer matches measured plan');
  state.room={id:room.id,x1:room.x1,x2:room.x2,z1:room.z1,z2:room.z2};
  building=await renderPinewoodV69({scene,chapter:1});
  state.furniture=building.furnitureManifest.filter(f=>f.room==='food_court');
  const expected=FURNISHINGS_V69.fixtures.filter(f=>f.room==='food_court');
  if(state.furniture.length!==expected.length)
   throw Error('Furnished V69 food-court count mismatch '+state.furniture.length+' / '+expected.length);
  state.vendors=[...(building.foodCourtV119||[])];
  if(state.vendors.length!==3)throw Error('Three physical V119 concession bays must exist in real shell');
  state.modelsLoaded=building.modelsLoaded;
  state.uniqueModels=building.uniqueModels;
  state.firstFrameFullyLoaded=!!building.firstFrameFullyLoaded;
  document.getElementById('status').textContent='Authentic 3D source loaded: '+state.furniture.length+
   ' licensed food-court furnishing pieces plus '+(building.modelsLoaded-state.furniture.length)+' other fixtures.';
  document.getElementById('audit').textContent=JSON.stringify(state.furniture.map(f=>({
   id:f.id,x:f.centerX,z:f.centerZ,height:f.measuredHeight,
   width:f.width,depth:f.depth
  })),null,2);
  select(shot);
  state.ready=true;api.ready=true;
  cover.hidden=true;cover.style.display='none';
 }catch(error){
  state.errors.push(String(error?.stack||error));
  cover.textContent='V119 original source failed: '+String(error?.message||error);
  console.error(error);
 }
}
document.querySelectorAll('[data-shot]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.shot)));
window.addEventListener('resize',()=>{if(renderer){resize();renderer.render(scene,camera)}});
window.addEventListener('pagehide',()=>{building?.dispose();renderer?.dispose()});
begin();