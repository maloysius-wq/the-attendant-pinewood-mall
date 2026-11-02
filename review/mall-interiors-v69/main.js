import * as THREE from '../../vendor/three/build/three.module.js';
import {OrbitControls} from '../../vendor/three/examples/jsm/controls/OrbitControls.js';
import {renderPinewoodV69} from '../../mall/render-shell-v69.js';

const world=document.getElementById('world');
const cover=document.getElementById('loading');
const chapterSelect=document.getElementById('chapter');
const viewSelect=document.getElementById('view-select');
const roofToggle=document.getElementById('roof');
const state={
 ready:false,errors:[],firstFrameFullyLoaded:false,
 texturesLoaded:0,modelsLoaded:0,walls:0,floor:'G',
 chapter:1,eastExitLocked:true,shot:'frontage',
 facadeFeatures:0,signText:'',entryBoarded:false,serviceOpen:false,
 furnishingsLoaded:0,uniqueModels:0,supportChecks:[],clearanceWarnings:[],storyAnchors:[],furnitureManifest:[]
};
const shots={
  "frontage": {
    "floor": "G",
    "eye": [
      0,
      3.45,
      23
    ],
    "target": [
      0,
      6.4,
      -22.5
    ],
    "label": "EXTERIOR / 1979 MALL",
    "title": "Pinewood Mall, Boarded Up",
    "note": "The monumental weathered sign and boarded public entrance remain connected to the original contractor access."
  },
  "atrium": {
    "floor": "G",
    "eye": [
      0,
      1.75,
      -51
    ],
    "target": [
      0,
      1.55,
      -71
    ],
    "label": "GROUND / ATRIUM",
    "title": "The Dry Fountain",
    "note": "One towering public concourse with an abandoned fountain. The first story evidence is placed in the actual atrium."
  },
  "cassette": {
    "floor": "G",
    "eye": [
      -30.9,
      1.72,
      -80.8
    ],
    "target": [
      -41,
      1.45,
      -82
    ],
    "label": "GROUND / WEST RETAIL",
    "title": "Cassette Castle",
    "note": "Three full-height empty licensed shelving units, a proper cashier counter, and the relocated physical register."
  },
  "arcade": {
    "floor": "G",
    "eye": [
      -30.7,
      1.72,
      -94
    ],
    "target": [
      -39.5,
      1.5,
      -102
    ],
    "label": "GROUND / WEST RETAIL",
    "title": "Sunburst Arcade",
    "note": "Real imported claw machine, air-hockey table, basketball machine and surviving arcade cabinets."
  },
  "video": {
    "floor": "G",
    "eye": [
      31,
      1.72,
      -70
    ],
    "target": [
      41,
      1.5,
      -71
    ],
    "label": "GROUND / EAST RETAIL",
    "title": "Video Planet",
    "note": "Imported empty stock racks and a counter with a physically supported VHS tape. LS-03 stays in this room."
  },
  "food": {
    "floor": "G",
    "eye": [
      31,
      1.72,
      -85
    ],
    "target": [
      40,
      1.45,
      -90
    ],
    "label": "GROUND / FOOD COURT",
    "title": "The Food Court",
    "note": "Actual tables, chairs and abandoned tabletop items; each cup and pizza box rests on its measured table."
  },
  "security": {
    "floor": "G",
    "eye": [
      32,
      1.72,
      -104
    ],
    "target": [
      40,
      1.55,
      -110
    ],
    "label": "GROUND / SECURITY",
    "title": "Old CCTV and Security",
    "note": "Existing security desk remains, with a chair and supported radio. Routes to the East Wing stay open."
  },
  "east": {
    "floor": "G",
    "eye": [
      60,
      1.72,
      -54
    ],
    "target": [
      60,
      1.7,
      -97
    ],
    "label": "GROUND / EAST ANNEX",
    "title": "The Later East Wing",
    "note": "The 1988–94 annex keeps separate staff circulation, chapter thresholds and practical door clearances."
  },
  "training": {
    "floor": "G",
    "eye": [
      67,
      1.72,
      -100
    ],
    "target": [
      77,
      1.5,
      -103
    ],
    "label": "GROUND / EAST ANNEX",
    "title": "Training Room T04",
    "note": "A functioning room with fitted desk and chairs, aligned to its door and narrative role."
  },
  "lockers": {
    "floor": "G",
    "eye": [
      67,
      1.72,
      -80
    ],
    "target": [
      80,
      1.6,
      -82
    ],
    "label": "GROUND / STAFF",
    "title": "Staff Lockers",
    "note": "Real cabinet furniture occupies the employee-side room without blocking its entrance or LS-06."
  },
  "b1": {
    "floor": "B1",
    "eye": [
      -27,
      -2.5,
      -88
    ],
    "target": [
      -31,
      -2.3,
      -96
    ],
    "label": "B1 / RELAY ROOM",
    "title": "Below Grade",
    "note": "Imported maintenance equipment marks Relay D/E and the power feeder. Physical stairs connect this level to the mall."
  },
  "mezz": {
    "floor": "M1",
    "eye": [
      1.5,
      7.18,
      -97
    ],
    "target": [
      0,
      2.5,
      -75
    ],
    "label": "M1 / ATRIUM OVERLOOK",
    "title": "Administrative Mezzanine",
    "note": "A partial upper office level, not a second shopping floor. The atrium remains visible from the guard rail."
  },
  "records": {
    "floor": "M1",
    "eye": [
      44,
      7.12,
      -83
    ],
    "target": [
      49,
      6.95,
      -88.9
    ],
    "label": "M1 / RECORDS",
    "title": "Payroll and Roster Records",
    "note": "Office desks, empty records shelving and a book on the real tabletop; LS-07 is still in records."
  },
  "pa": {
    "floor": "M1",
    "eye": [
      71,
      7.1,
      -105
    ],
    "target": [
      74,
      6.95,
      -112
    ],
    "label": "M1 / PUBLIC ADDRESS",
    "title": "PA and Closing Controls",
    "note": "Fitted control desk with its supported radio, linking the upstairs story to the East Wing."
  },
  "aerial": {
    "floor": "G",
    "eye": [
      130,
      103,
      102
    ],
    "target": [
      17,
      0,
      -72
    ],
    "label": "ALL / CUTAWAY",
    "title": "One Connected Property",
    "note": "All sixty new licensed fixtures occupy true coordinates across the original mall, B1 and the administrative mezzanine."
  }
};
let scene,camera,renderer,orbit,built;
const publicApi={
 ready:false,
 getState:()=>JSON.parse(JSON.stringify(state)),
 goto:setShot,
 setChapter
};
window.__PINEWOOD_MALL_INTERIORS_V69__=publicApi;
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
  setShot('frontage');
  clock.value=30;
  built=await renderPinewoodV69({scene,chapter:state.chapter});
  clock.value=94;
  state.texturesLoaded=built.texturesLoaded;
  state.modelsLoaded=built.modelsLoaded;
  state.facadeFeatures=built.facadeFeatures;
  state.furnishingsLoaded=built.furnishingsLoaded;
  state.uniqueModels=built.uniqueModels;
  state.supportChecks=built.supportChecks;
  state.clearanceWarnings=built.clearanceWarnings;
  state.storyAnchors=built.storyAnchors;
  state.furnitureManifest=built.furnitureManifest;
  state.signText=built.signText;
  state.entryBoarded=built.entryBoarded;
  state.serviceOpen=built.serviceOpen;
  state.walls=built.shells.reduce((n,s)=>n+s.walls.length,0);
  state.errors=[...built.geometryErrors];
  document.getElementById('walls-stat').textContent=String(state.walls);
  document.getElementById('models-stat').textContent=String(state.modelsLoaded);
  document.getElementById('floors-stat').textContent=String(built.shells.length);
  document.getElementById('fixture-stat').textContent=String(built.furnishingsLoaded);
  document.getElementById('build-status').textContent=
   '3 joined floors · '+state.walls+' structural partitions · '+state.texturesLoaded+
   ' preloaded material maps · '+state.modelsLoaded+' licensed 3D objects, including '+state.furnishingsLoaded+
   ' new interior fittings across 21 real rooms · '+state.storyAnchors.length+' canonical story positions · '+state.supportChecks.length+' measured table/counter placements. No remote assets.';
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
window.addEventListener('resize',()=>{resize();renderOnDemand()});
window.addEventListener('pagehide',()=>{built?.dispose();orbit?.dispose();renderer?.dispose();});
begin();
