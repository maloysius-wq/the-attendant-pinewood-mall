import * as THREE from '../../vendor/three/build/three.module.js';
import {OrbitControls} from '../../vendor/three/examples/jsm/controls/OrbitControls.js';
import {renderConstructionScene} from '../../mall/render-shell-v67.js';

const world=document.getElementById('world');
const cover=document.getElementById('loading');
const chapterSelect=document.getElementById('chapter');
const viewSelect=document.getElementById('view-select');
const roofToggle=document.getElementById('roof');
const surveyToggle=document.getElementById('survey-light');
const state={
 ready:false,errors:[],firstFrameFullyLoaded:false,
 texturesLoaded:0,modelsLoaded:0,walls:0,floor:'G',
 chapter:1,eastExitLocked:true,shot:'service',ceilingMeshes:0,ceilingRooms:[],
 storefrontCount:0,storefrontNames:[],storefrontEntries:[],
 closedBayCount:0,closedBayNames:[],checkpointV117:null,
 ceilingFinishes:[],allCeilingsTextured:false,surveyLightOn:true
};
const shots={
 service:{floor:'G',eye:[12,1.72,-27],target:[11,1.8,-49],label:'GROUND · CONTRACTOR SERVICE ENTRY',title:'Contractor Service Vestibule',
  note:'The opening cinematic leads to this exact side door, with an unobstructed pedestrian route into the mall.'},
 checkin:{floor:'G',eye:[12.2,1.70,-31.2],target:[13.65,1.78,-31.2],
  label:'GROUND · AFTER-HOURS CHECK-IN',title:'Closed Security Check-In',
  note:'The former oversized vestibule now contains an enclosed observation office with a physical, collision-blocking glass pane and a central contractor route.'},
 serviceTurn:{floor:'G',eye:[12,1.70,-38],target:[10,1.78,-42.9],
  label:'GROUND · HINGED-DOOR APPROACH',title:'Turn toward the Mall',
  note:'The narrow contractor entry widens before the original real hinged inner door. The cinematic eye and scripted door remain in their original locations.'},
 boarded:{floor:'G',eye:[-10.5,1.75,-41],target:[-10.5,2.3,-22.5],label:'GROUND · MAIN ENTRANCE',title:'Boarded Public Entry',
  note:'The once-prominent public doors are shuttered and fully blocked. The contractor must use the authorized service access.'},
 atrium:{floor:'G',eye:[0,1.78,-52],target:[0,1.5,-71],label:'GROUND · CENTRAL ATRIUM',title:'Pinewood’s Dry Fountain',
  note:'A single-story public gallery with a double-height glazed atrium. The abandoned fountain anchors orientation and later reveals.'},
 west:{floor:'G',eye:[-19,1.74,-83],target:[-37,1.8,-82],label:'GROUND · WEST RETAIL',title:'Cassette Castle',
  note:'The original record shop retains its recognizable footprint and evidence, without banned substitute shelving.'},
 closedNorth:{floor:'G',eye:[-22,1.75,-51],target:[-22,2.8,-43],label:'GROUND · NORTH FORMER RETAIL',title:'Needle & Thread · Shuttered',
  note:'A bounded original-era closed tenant suite beside the boarded main lobby. The steel shutter is physically sealed.'},
 closedAnnex:{floor:'G',eye:[61,1.75,-69],target:[55.8,2.2,-69],label:'GROUND · ANNEX SERVICE FRONTAGE',title:'East Wing Former Tenants',
  note:'Previously featureless Annex west wall now has actual service-bounded tenant fronts and period shutters.'},
 closedSouth:{floor:'G',eye:[-22,1.75,-104],target:[-23,2.5,-111],label:'GROUND · WEST SERVICE',title:'Old Janitorial Stores',
  note:'The staff supply room is separated from the public gallery by a closed roll-down shutter.'},
 east:{floor:'G',eye:[60,1.75,-54],target:[60,1.75,-97],label:'GROUND · EAST ANNEX',title:'The Later East Wing',
  note:'The East Wing is a period-specific addition to the original mall, with its own employee circulation and sealed thresholds.'},
 security:{floor:'G',eye:[34,1.73,-104],target:[36.5,1.7,-110],label:'GROUND · SECURITY DESK',title:'Security and CCTV',
  note:'A proper room off the original circulation system, connected to the old back-of-house routes.'},
 below:{floor:'B1',eye:[11,-2.45,-101],target:[-24,-2.3,-95],label:'B1 · BELOW GRADE',title:'Basement Service Spine',
  note:'The electrical, relay, feeder, and flood-threat spaces form an actual connected service floor under the mall.'},
 stairs:{floor:'B1',eye:[31.8,-2.42,-112.9],target:[32.1,-.9,-108.7],label:'B1 · NORTH FIRE STAIR',title:'Physical Stairwell',
  note:'Twenty-four actual basement treads rise to the ground floor; no teleport or decorative ramp.'},
 mezz:{floor:'M1',eye:[1.5,7.18,-97],target:[0,2.5,-75],label:'M1 · ADMIN MEZZANINE',title:'Atrium Overlook',
  note:'The administrative mezzanine has offices, real floor slabs, a guard rail, and sightlines into the dark atrium.'},
 pa:{floor:'M1',eye:[72,7.18,-109],target:[73,7.2,-96],label:'M1 · PA CONTROL',title:'Closing and PA Controls',
  note:'The final-phase upper administration and public-address system are spatially linked to the East Wing.'},
 exit:{floor:'G',eye:[77,1.74,-42],target:[87,1.75,-42],label:'GROUND · EMPLOYEE EXIT',title:'Chapter-Gated East Exit',
  note:'The east door is physically barred until the final chapter, when the clock-out route becomes available.'},
 aerial:{floor:'G',eye:[130,103,102],target:[17,0,-72],label:'ALL LEVELS · CUTAWAY',title:'Joined Mall Structure',
  note:'The public mall, basement service level, and administrative mezzanine occupy one consistent world.'}
};
let scene,camera,renderer,orbit,built,surveyLight;
const publicApi={
 ready:false,
 getState:()=>JSON.parse(JSON.stringify(state)),
 goto:setShot,
 setChapter
};
window.__PINEWOOD_MALL_CONSTRUCTION_V67__=publicApi;
function syncReadout(){
 const shot=shots[state.shot];
 document.getElementById('view-floor').textContent=shot.label;
 document.getElementById('view-title').textContent=shot.title;
 document.getElementById('view-note').textContent=shot.note;
 document.querySelectorAll('[data-shot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shot===state.shot)));
 viewSelect.value=state.shot;
 document.getElementById('door-stat').textContent=state.eastExitLocked?'LOCKED':'OPEN';
}
function setShot(name){
 if(!shots[name])throw Error('Unknown inspection camera: '+name);
 state.shot=name;state.floor=shots[name].floor;syncReadout();
 if(!camera)return;
 const s=shots[name];camera.position.set(...s.eye);
 const target=new THREE.Vector3(...s.target);
 camera.lookAt(target);
 if(orbit){
  orbit.target.copy(target);orbit.enabled=name==='aerial';orbit.update();
 }
 if(built)built.setRoofVisible(roofToggle.checked&&name!=='aerial');
 renderer?.render(scene,camera);
}
function setChapter(value){
 const chapter=Number(value);
 if(!Number.isInteger(chapter)||chapter<1||chapter>6)throw Error('Invalid chapter');
 state.chapter=chapter;state.eastExitLocked=chapter<6;
 if(built)built.setChapter(chapter);
 chapterSelect.value=String(chapter);syncReadout();
 renderer?.render(scene,camera);
}
function resize(){
 if(!renderer||!camera)return;
 const w=Math.max(320,world.clientWidth),h=Math.max(300,world.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function renderOnDemand(){if(renderer&&scene&&camera)renderer.render(scene,camera);}
async function begin(){
 try{
  const clock=document.querySelector('#loading progress');
  scene=new THREE.Scene();scene.background=new THREE.Color(0x0c181a);
  scene.fog=new THREE.FogExp2(0x0e1718,.005);
  camera=new THREE.PerspectiveCamera(69,1,.06,650);
  // Survey instrumentation exists ONLY on this review page, never Builder,
  // cinematic, authored scene, or playable game lighting rigs.
  surveyLight=new THREE.PointLight(0xe5e8d6,95,35,2);
  camera.add(surveyLight);
  scene.add(camera);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.16;
  world.prepend(renderer.domElement);
  resize();
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=false;orbit.minDistance=18;orbit.maxDistance=260;orbit.enabled=false;
  orbit.addEventListener('change',renderOnDemand);
  setShot('service');
  clock.value=30;
  built=await renderConstructionScene({scene,chapter:state.chapter});
  clock.value=94;
  state.texturesLoaded=built.texturesLoaded;
  state.modelsLoaded=built.modelsLoaded;
  state.closedBayCount=built.closedBaysV116.length;
  state.closedBayNames=built.closedBaysV116.map(b=>b.name);
  state.checkpointV117={...built.checkpointV117};
  state.storefrontCount=built.storefrontsV115.length;
  state.storefrontNames=built.storefrontsV115.map(f=>f.sign);
  state.storefrontEntries=built.storefrontsV115.map(f=>({room:f.id,entryWidth:f.entryWidth,windowSpan:f.windowSpan}));
  state.walls=built.shells.reduce((n,s)=>n+s.walls.length,0);
  state.ceilingMeshes=built.ceilings.children.length;
  state.ceilingRooms=[...new Set(built.ceilings.children.map(mesh=>mesh.userData.roomCeiling))].sort();
  state.ceilingFinishes=[...new Set(built.ceilings.children.map(mesh=>({
   id:mesh.userData.ceilingFinish,
   texture:mesh.material.map?.image?.src?.split('/').pop()||null
  })).map(x=>JSON.stringify(x)))].map(x=>JSON.parse(x));
  state.allCeilingsTextured=built.ceilings.children.length>0&&built.ceilings.children.every(mesh=>
   mesh.material.isMeshStandardMaterial&&!!mesh.material.map?.image?.width);
  state.errors=[...built.geometryErrors];
  document.getElementById('walls-stat').textContent=String(state.walls);
  document.getElementById('models-stat').textContent=String(state.modelsLoaded);
  document.getElementById('floors-stat').textContent=String(built.shells.length);
  document.getElementById('build-status').textContent=
   '3 joined floors · '+state.walls+' structural partitions · '+state.texturesLoaded+
   ' preloaded material maps · '+state.modelsLoaded+' placed CC0 fixtures · '+
   state.storefrontCount+' glazed shopfronts · '+state.closedBayCount+' enclosed support bays · '+
   state.checkpointV117.cells+' closed service-checkpoint cells. No remote 3D assets.';
  setChapter(state.chapter);
  setShot(state.shot);
  renderer.render(scene,camera);
  // The complete static scene has been rendered before the opaque
  // preloading cover can disappear. Nothing streams into view afterward.
  state.firstFrameFullyLoaded=!!built.firstFrameFullyLoaded;
  state.ready=true;publicApi.ready=true;
  clock.value=100;cover.classList.add('hidden');
 }catch(error){
  state.errors.push(String(error?.stack||error));
  cover.querySelector('strong').textContent='Construction review could not load';
  cover.querySelector('span').textContent=String(error?.message||error);
  document.getElementById('build-status').textContent=String(error?.stack||error);
  console.error(error);
 }
}
for(const b of document.querySelectorAll('[data-shot]'))b.addEventListener('click',()=>setShot(b.dataset.shot));
viewSelect.addEventListener('change',e=>setShot(e.target.value));
chapterSelect.addEventListener('change',e=>setChapter(e.target.value));
roofToggle.addEventListener('change',()=>{built?.setRoofVisible(roofToggle.checked&&state.shot!=='aerial');renderOnDemand()});
surveyToggle.addEventListener('change',()=>{
  state.surveyLightOn=surveyToggle.checked;
  if(surveyLight)surveyLight.intensity=state.surveyLightOn?95:0;
  renderOnDemand();
});
window.addEventListener('resize',()=>{resize();renderOnDemand()});
window.addEventListener('pagehide',()=>{built?.dispose();orbit?.dispose();renderer?.dispose();});
begin();
