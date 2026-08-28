import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const choose=a=>a[(Math.random()*a.length)|0];
const withTimeout=(promise,ms,label="asset")=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} timed out`)),ms))]);
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(dt,k=8)=>1-Math.exp(-dt*k);
const key=(x,z)=>`${x},${z}`;
const TAU=Math.PI*2;

const SAVE_KEY='pinewood_attendant_reborn_v1';
const DEFAULT_SAVE={
  started:false, unlockedChapter:0, lastChapter:0,
  journal:{},
  settings:{brightness:1.0,volume:.86,music:1.05,sensitivity:.00215,quality:'high',jumpscares:true,muzak:true,glitch:'full'}
};
function deepClone(v){return JSON.parse(JSON.stringify(v));}
function loadSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY); if(!raw)return deepClone(DEFAULT_SAVE);
    const p=JSON.parse(raw),o=deepClone(DEFAULT_SAVE);
    Object.assign(o,p); o.settings={...o.settings,...(p.settings||{})}; o.journal=p.journal||{}; return o;
  }catch{return deepClone(DEFAULT_SAVE);}
}
let SAVE=loadSave();
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch{}}

const LICENSE_MANIFEST=`CC0 ASSETS USED BY THIS BUILD\n\nKENNEY — Mini Arcade\nLicense: Creative Commons Zero (CC0 1.0)\nSource: https://kenney.nl/assets/mini-arcade\nRuntime mirror: RetroDECK/RetroQUEST, pinned commit dfa19a5602a31f64bd890d15279a61f43b127328\nUsed for: arcade cabinets, air hockey, basketball game, claw machine, cash register.\n\nKENNEY — Furniture Kit\nLicense: Creative Commons Zero (CC0 1.0)\nSource: https://kenney.nl/assets/furniture-kit\nRuntime mirror: RetroDECK/RetroQUEST, pinned commit dfa19a5602a31f64bd890d15279a61f43b127328\nUsed for: plain checkout/service counters, cash registers and Cassette Castle listening tables.\n\nKENNEY — Mini Market\nLicense: Creative Commons Zero (CC0 1.0)\nSource: https://kenney.nl/assets/mini-market\nRuntime mirror: AkiraNim/CLTCrossing, pinned commit 6fe4cd6dcb6fbfa4267d3b9971c0968e0fe375b6\nUsed for: bottle-return fixture and retail cash registers. Stocked shelf/display models are deliberately not used as Video Planet shelving.\n\nKENNEY — Food Kit\nLicense: Creative Commons Zero (CC0 1.0)\nSource: https://kenney.nl/assets/food-kit\nRuntime mirror: AkiraNim/CLTCrossing, pinned commit 6fe4cd6dcb6fbfa4267d3b9971c0968e0fe375b6\nUsed for: pizza, cups and food-court dressing.\n\nPOLY HAVEN\nLicense: Creative Commons Zero (CC0 1.0)\nSources: terrazzo_tiles, dirty_carpet, floor_tiles_06, concrete_wall_001\nhttps://polyhaven.com/a/terrazzo_tiles\nhttps://polyhaven.com/a/dirty_carpet\nhttps://polyhaven.com/a/floor_tiles_06\nhttps://polyhaven.com/a/concrete_wall_001\nUsed for: mall terrazzo, worn arcade/VHS carpet and food-court tile surfaces.\n\nGGBOTNET — VHS Cassette 3D\nLicense: Creative Commons Zero (CC0 1.0)\nSource: https://opengameart.org/content/vhs-cassette-3d\nRuntime mirror: zodiepupper/snow, pinned commit b9dc9c35bec885aacf31cfca729adcd3e304ef90\nUsed for: physical VHS cassettes throughout Video Planet.\n\nNEON SIGN VISUAL REFERENCE\nOpenGameArt Neon Sign 2 and Grungy Lights Texture Pack are CC0/public-domain references used to inform Pinewood's generated dirty neon treatment. The runtime sign art itself is generated locally so flicker/glow remains reliable without cross-origin image dependencies.\nhttps://opengameart.org/content/neon-sign-2\nhttps://opengameart.org/content/grungy-lights-texture-pack\n\nAll Pinewood-specific signage, posters, UI, The Attendant, gore, particle effects and procedural audio are generated/original in this build.\n\nIf a remote CC0 asset cannot be fetched, the game automatically substitutes local procedural geometry so gameplay remains intact.`;
$('licenseText').textContent=LICENSE_MANIFEST;

const RAW_RETRO='https://raw.githubusercontent.com/RetroDECK/RetroQUEST/dfa19a5602a31f64bd890d15279a61f43b127328';
const RAW_CLT='https://raw.githubusercontent.com/AkiraNim/CLTCrossing/6fe4cd6dcb6fbfa4267d3b9971c0968e0fe375b6';
const RAW_VHS='https://raw.githubusercontent.com/zodiepupper/snow/b9dc9c35bec885aacf31cfca729adcd3e304ef90';
const RAW_QUAT='https://raw.githubusercontent.com/BGS3934/BGS3934.github.io/2efb99e0ba4d22a65489c21d01651447be433ef5';
const MODEL_URLS={
  arcade:`${RAW_RETRO}/assets/kenney_mini-arcade/Models/GLB%20format/arcade-machine.glb`,
  airHockey:`${RAW_RETRO}/assets/kenney_mini-arcade/Models/GLB%20format/air-hockey.glb`,
  basketball:`${RAW_RETRO}/assets/kenney_mini-arcade/Models/GLB%20format/basketball-game.glb`,
  claw:`${RAW_RETRO}/assets/kenney_mini-arcade/Models/GLB%20format/claw-machine.glb`,
  arcadeCash:`${RAW_RETRO}/assets/kenney_mini-arcade/Models/GLB%20format/cash-register.glb`,
  table:`${RAW_RETRO}/assets/kenney_furniture-kit/Models/GLTF%20format/table.glb`,
  chair:`${RAW_RETRO}/assets/kenney_furniture-kit/Models/GLTF%20format/chair.glb`,
  sideTable:`${RAW_RETRO}/assets/kenney_furniture-kit/Models/GLTF%20format/sideTable.glb`,
  counterDesk:`${RAW_RETRO}/assets/kenney_furniture-kit/Models/GLTF%20format/desk.glb`,
  qShelfLarge:`${RAW_QUAT}/Assets/Furniture/Shelf%20Large.glb`,
  qTableRound:`${RAW_QUAT}/Assets/Furniture/Table%20Round%20Small.glb`,
  qChair:`${RAW_QUAT}/Assets/Furniture/Chair.glb`,
  marketShelfBoxes:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/shelf-boxes.glb`,
  marketShelfEnd:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/shelf-end.glb`,
  marketDisplayBread:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/display-bread.glb`,
  marketDisplayFruit:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/display-fruit.glb`,
  marketBottleReturn:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/bottle-return.glb`,
  marketShelfBags:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/shelf-bags.glb`,
  marketCash:`${RAW_CLT}/CltCrossingv2/assets/kenney_mini-market/cash-register.glb`,
  pizza:`${RAW_CLT}/CltCrossingv2/assets/kenney_food-kit/pizza.glb`,
  pizzaBox:`${RAW_CLT}/CltCrossingv2/assets/kenney_food-kit/pizza-box.glb`,
  cup:`${RAW_CLT}/CltCrossingv2/assets/kenney_food-kit/cup.glb`,
  vhsCassette:`${RAW_VHS}/assets/vhs_cassette_3d/VHS_cassette.glb`
};
const PH='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k';
const TEXTURE_SETS={
  terrazzo:{diff:`${PH}/terrazzo_tiles/terrazzo_tiles_diff_1k.jpg`,normal:`${PH}/terrazzo_tiles/terrazzo_tiles_nor_gl_1k.jpg`,rough:`${PH}/terrazzo_tiles/terrazzo_tiles_rough_1k.jpg`},
  carpet:{diff:`${PH}/dirty_carpet/dirty_carpet_diff_1k.jpg`,normal:`${PH}/dirty_carpet/dirty_carpet_nor_gl_1k.jpg`,rough:`${PH}/dirty_carpet/dirty_carpet_rough_1k.jpg`},
  checker:{diff:`${PH}/floor_tiles_06/floor_tiles_06_diff_1k.jpg`,normal:`${PH}/floor_tiles_06/floor_tiles_06_nor_gl_1k.jpg`,rough:`${PH}/floor_tiles_06/floor_tiles_06_rough_1k.jpg`},
  wall:{diff:`${PH}/concrete_wall_001/concrete_wall_001_diff_1k.jpg`,normal:`${PH}/concrete_wall_001/concrete_wall_001_nor_gl_1k.jpg`,rough:`${PH}/concrete_wall_001/concrete_wall_001_rough_1k.jpg`}
};

class AssetManager{
  constructor(){this.gltf=new GLTFLoader();this.tex=new THREE.TextureLoader();this.models=new Map();this.materials={};this.failures=[];}
  cloneModel(source){const c=source.clone(true);c.traverse(o=>{if(o.isMesh){o.geometry=o.geometry?.clone?.()||o.geometry;if(Array.isArray(o.material))o.material=o.material.map(m=>m?.clone?.()||m);else o.material=o.material?.clone?.()||o.material;}});return c;}
  async model(name){
    if(this.models.has(name))return this.cloneModel(this.models.get(name));
    const url=MODEL_URLS[name]; if(!url)return null;
    try{
      const gltf=await withTimeout(this.gltf.loadAsync(url),7000,name); const root=gltf.scene;
      root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=true;}});
      this.models.set(name,root); return this.cloneModel(root);
    }catch(e){this.failures.push(`${name}: ${e?.message||e}`); return null;}
  }
  async makePBR(setName,fallback,repeat=5){
    const set=TEXTURE_SETS[setName];
    const mat=new THREE.MeshStandardMaterial({color:fallback,roughness:.76,metalness:.03});
    try{
      const [d,n,r]=await withTimeout(Promise.all([this.tex.loadAsync(set.diff),this.tex.loadAsync(set.normal),this.tex.loadAsync(set.rough)]),7000,`${setName} textures`);
      for(const t of [d,n,r]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=8;}
      d.colorSpace=THREE.SRGBColorSpace; mat.map=d;mat.normalMap=n;mat.roughnessMap=r;mat.color.setHex(0xffffff);mat.needsUpdate=true;
    }catch(e){this.failures.push(`${setName} texture: ${e?.message||e}`);}
    return mat;
  }
  async preload(){
    $('assetStatus').textContent='Loading CC0 models and PBR materials…';
    const mats=await Promise.all([
      this.makePBR('terrazzo',0x77777d,1),this.makePBR('carpet',0x39352f,1),this.makePBR('checker',0x80776b,1),this.makePBR('wall',0x8f8c8e,1)
    ]);
    [this.materials.terrazzo,this.materials.carpet,this.materials.checker,this.materials.wall]=mats;
    await Promise.all(['arcade','airHockey','basketball','claw','sideTable','counterDesk','qShelfLarge','qTableRound','qChair','marketBottleReturn','marketCash','arcadeCash','pizza','pizzaBox','cup'].map(n=>this.model(n)));
    $('assetStatus').textContent=this.failures.length?`CC0 library ready • ${this.failures.length} remote asset(s) using built-in fallback`:'CC0 model + PBR library ready';
  }
}
const assets=new AssetManager();

class PointerControls{
  constructor(camera,dom){this.camera=camera;this.dom=dom;this.locked=false;this.yaw=new THREE.Object3D();this.pitch=new THREE.Object3D();this.pitch.add(camera);this.yaw.add(this.pitch);this.speed=SAVE.settings.sensitivity;
    document.addEventListener('mousemove',e=>{if(!this.locked||GAME?.modal)return;this.yaw.rotation.y-=e.movementX*this.speed;this.pitch.rotation.x-=e.movementY*this.speed;this.pitch.rotation.x=clamp(this.pitch.rotation.x,-1.45,1.45);});
    document.addEventListener('pointerlockchange',()=>{const was=this.locked;this.locked=document.pointerLockElement===this.dom;if(was&&!this.locked&&GAME?.running&&!GAME.dead&&!GAME.won&&!GAME.modal)GAME.pause();});
  }
  lock(){this.dom.requestPointerLock?.();}
  unlock(){if(document.pointerLockElement)document.exitPointerLock();}
}

class AudioSystem{
  constructor(){this.ctx=null;this.master=null;this.amb=null;this.music=null;this.sfx=null;this.voice=null;this.humGain=null;this.noiseGain=null;this.proxGain=null;this.heartTimer=0;this.muzakTimer=0;this.muzakStep=0;this.whisperTimer=0;this.paused=true;}
  ensure(){
    if(this.ctx)return;this.ctx=new (window.AudioContext||window.webkitAudioContext)();
    this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);
    this.amb=this.ctx.createGain();this.music=this.ctx.createGain();this.sfx=this.ctx.createGain();this.voice=this.ctx.createGain();
    for(const g of [this.amb,this.music,this.sfx,this.voice])g.connect(this.master);
    const hum=this.ctx.createOscillator();hum.type='sine';hum.frequency.value=50;
    const hum2=this.ctx.createOscillator();hum2.type='triangle';hum2.frequency.value=100.8;
    this.humGain=this.ctx.createGain();this.humGain.gain.value=.015;hum.connect(this.humGain);hum2.connect(this.humGain);this.humGain.connect(this.amb);hum.start();hum2.start();
    const len=this.ctx.sampleRate;const b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*.25;
    const ns=this.ctx.createBufferSource();ns.buffer=b;ns.loop=true;const bp=this.ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=950;bp.Q.value=.55;this.noiseGain=this.ctx.createGain();this.noiseGain.gain.value=.003;ns.connect(bp);bp.connect(this.noiseGain);this.noiseGain.connect(this.amb);ns.start();
    this.proxGain=this.ctx.createGain();this.proxGain.gain.value=0;this.proxGain.connect(this.amb);const po=this.ctx.createOscillator();po.type='sine';po.frequency.value=58;po.connect(this.proxGain);po.start();
    this.apply();
  }
  resume(){this.ensure();this.ctx.resume?.();}
  apply(){if(!this.master)return;this.master.gain.value=this.paused?0:SAVE.settings.volume;this.music.gain.value=SAVE.settings.music;this.sfx.gain.value=1;this.voice.gain.value=1;}
  setPaused(v){this.paused=v;this.apply();}
  oneShot({type='sine',f=220,f2=null,d=.15,a=.2,bus='sfx',at=0}){if(!this.ctx)return;const now=this.ctx.currentTime+at,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,now);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),now+d*.7);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(a,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+d);o.connect(g);g.connect(this[bus]);o.start(now);o.stop(now+d+.02);}
  step(sprint=false,quiet=false){const a=(sprint?.17:.105)*(quiet?.28:1);this.oneShot({f:sprint?105:92,f2:52,d:.13,a});}
  thud(a=.25){this.oneShot({f:115,f2:42,d:.28,a});}
  slam(){this.oneShot({type:'sawtooth',f:92,f2:30,d:.4,a:.34});}
  pickup(){this.oneShot({f:420,f2:720,d:.16,a:.12});}
  radio(){this.oneShot({type:'square',f:980,f2:430,d:.13,a:.13,bus:'voice'});}
  chime(){this.oneShot({f:650,d:.18,a:.12,bus:'voice'});this.oneShot({f:980,d:.18,a:.11,bus:'voice',at:.12});}
  rip(){this.oneShot({type:'sawtooth',f:190,f2:38,d:.45,a:.5});}
  beep(){this.oneShot({type:'square',f:1020,f2:620,d:.09,a:.07});}
  whisper(pan=0,intensity=.4){if(!this.ctx)return;const now=this.ctx.currentTime,len=Math.floor(this.ctx.sampleRate*.28),b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const src=this.ctx.createBufferSource();src.buffer=b;const bp=this.ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=rand(700,1300);bp.Q.value=1;const g=this.ctx.createGain();g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.12*intensity,now+.025);g.gain.exponentialRampToValueAtTime(.0001,now+.27);src.connect(bp);bp.connect(g);if(this.ctx.createStereoPanner){const p=this.ctx.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(this.amb);}else g.connect(this.amb);src.start(now);}
  tick(dt,near,fear,pan){if(!this.ctx)return;this.humGain.gain.value=lerp(this.humGain.gain.value,.012+fear*.045,smooth(dt,2));this.noiseGain.gain.value=lerp(this.noiseGain.gain.value,.002+fear*.012,smooth(dt,2));this.proxGain.gain.value=lerp(this.proxGain.gain.value,near*near*.08,smooth(dt,5));
    if(SAVE.settings.muzak){this.muzakTimer-=dt;if(this.muzakTimer<=0){this.muzakTimer=near>.55?.23:.56;const chords=[[0,4,7],[0,3,7],[2,5,9],[5,9,12]],c=chords[this.muzakStep++%chords.length];for(let i=0;i<c.length;i++){const base=196*(i?2:1),freq=base*Math.pow(2,c[i]/12)*(1+rand(-1,1)*near*.012);this.oneShot({type:'square',f:freq,d:near>.65?.15:.38,a:.017/(i+1),bus:'music'});}}}
    const n=near;if(n>.13){this.heartTimer-=dt;if(this.heartTimer<=0){const bpm=58+n*n*118;this.heartTimer=60/bpm;this.oneShot({f:58+n*18,f2:38,d:.16,a:.09+n*.11});this.oneShot({f:78+n*20,f2:45,d:.13,a:.065+n*.08,at:.105});}}else this.heartTimer=0;
    if(n>.22){this.whisperTimer-=dt;if(this.whisperTimer<=0){this.whisperTimer=clamp(3.5-n*n*2.9,.45,3.4)*rand(.8,1.2);this.whisper(pan,.25+n*.55);}}
  }
}
const audio=new AudioSystem();

const UI={
  screens:['titleScreen','chaptersScreen','settingsScreen','journalScreen','creditsScreen','pauseScreen','chapterScreen','deathScreen','loadingScreen'].map($),
  show(id){for(const s of this.screens)s.classList.remove('show');$(id)?.classList.add('show');document.body.classList.add('modal-open');if(GAME){GAME.modal=true;audio.setPaused(true);GAME.controls?.unlock();}},
  hideAll(){for(const s of this.screens)s.classList.remove('show');document.body.classList.remove('modal-open');if(GAME){GAME.modal=false;audio.setPaused(false);}},
  hint(t=''){const e=$('hint');e.textContent=t;e.classList.toggle('show',!!t);},
  subtitle(who,text,kind='radio',ms=3200){const b=$('subtitle');$('speaker').textContent=who;$('subtitleText').textContent=text;b.className=kind;b.classList.add('show');clearTimeout(this.subTimer);this.subTimer=setTimeout(()=>b.classList.remove('show'),ms);},
  static(ms=220){const e=$('static');e.dataset.forced='1';e.classList.add('on');setTimeout(()=>{delete e.dataset.forced;if(GAME?.composure>=.28)e.classList.remove('on');},ms);},
  flash(){const e=$('flash');e.classList.remove('flash');void e.offsetWidth;e.classList.add('flash');}
};

const keysDown={w:false,a:false,s:false,d:false,shift:false,c:false};
window.addEventListener('keydown',e=>{
  if(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight','KeyC','KeyE','KeyF','KeyQ','KeyJ'].includes(e.code))e.preventDefault();
  if(e.code==='KeyW')keysDown.w=true;if(e.code==='KeyA')keysDown.a=true;if(e.code==='KeyS')keysDown.s=true;if(e.code==='KeyD')keysDown.d=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')keysDown.shift=true;if(e.code==='KeyC')keysDown.c=true;
  if(!GAME)return;if(e.code==='KeyE')GAME.interact();if(e.code==='KeyF')GAME.toggleFlashlight();if(e.code==='KeyQ')GAME.throwDecoy();if(e.code==='KeyJ')GAME.openJournal();if(e.code==='Escape'&&GAME.running&&!GAME.modal)GAME.pause();
});
window.addEventListener('keyup',e=>{if(e.code==='KeyW')keysDown.w=false;if(e.code==='KeyA')keysDown.a=false;if(e.code==='KeyS')keysDown.s=false;if(e.code==='KeyD')keysDown.d=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')keysDown.shift=false;if(e.code==='KeyC')keysDown.c=false;});

function makeCanvasTexture(draw,w=512,h=512){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),c);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function fallbackFloorTexture(kind='mall'){
  return makeCanvasTexture((ctx,c)=>{
    if(kind==='carpet'){
      ctx.fillStyle='#332f31';ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<5000;i++){const v=45+Math.random()*35;ctx.fillStyle=`rgba(${v+10},${v},${v+6},.22)`;ctx.fillRect(Math.random()*c.width,Math.random()*c.height,1,rand(1,4));}
    }else if(kind==='checker'){
      const n=8,s=c.width/n;for(let y=0;y<n;y++)for(let x=0;x<n;x++){ctx.fillStyle=(x+y)%2?'#7a6655':'#b9a68d';ctx.fillRect(x*s,y*s,s,s);}for(let i=0;i<800;i++){ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(Math.random()*c.width,Math.random()*c.height,rand(1,4),rand(1,3));}
    }else{
      ctx.fillStyle='#8d8780';ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<2600;i++){ctx.fillStyle=choose(['#b18a87','#7c99a9','#b8a876','#7b967d','#6d6a73']);ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(Math.random()*c.width,Math.random()*c.height,rand(.4,2.5),0,TAU);ctx.fill();}ctx.globalAlpha=1;
    }
  });
}

class MallWorld{
  constructor(scene){this.scene=scene;this.root=new THREE.Group();scene.add(this.root);this.walk=new Set();this.tags=new Map();this.colliders=[];this.dynamicDoors=[];this.interactables=[];this.lights=[];this.neonSigns=[];this.navCache=new Map();this.bounds={minX:-40,maxX:40,minZ:-40,maxZ:40};this.wallMeshes=[];this.floorMeshes=[];}
  clear(){this.scene.remove(this.root);this.root.traverse(o=>{if(o.geometry)o.geometry.dispose?.();});this.root=new THREE.Group();this.scene.add(this.root);this.walk.clear();this.tags.clear();this.colliders=[];this.dynamicDoors=[];this.interactables=[];this.lights=[];this.neonSigns=[];this.navCache.clear();}
  carveRect(x1,z1,x2,z2,tag='mall'){for(let z=Math.min(z1,z2);z<=Math.max(z1,z2);z++)for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++){this.walk.add(key(x,z));this.tags.set(key(x,z),tag);}}
  cellFromWorld(x,z){return{x:Math.floor(x+.5),z:Math.floor(z+.5)};}
  walkableCell(x,z){return this.walk.has(key(x,z));}
  colliderBlocksPoint(px,pz,navOnly=false){for(const c of this.colliders){if(c.disabled)continue;if(navOnly&&!c.navBlock)continue;if(px>c.minX&&px<c.maxX&&pz>c.minZ&&pz<c.maxZ)return true;}return false;}
  canStand(x,z,r=.26){const pts=[[x+r,z],[x-r,z],[x,z+r],[x,z-r],[x+r*.72,z+r*.72],[x-r*.72,z+r*.72],[x+r*.72,z-r*.72],[x-r*.72,z-r*.72],[x,z]];for(const [px,pz] of pts){const c=this.cellFromWorld(px,pz);if(!this.walkableCell(c.x,c.z))return false;if(this.colliderBlocksPoint(px,pz,false))return false;}return true;}
  navPassable(x,z){if(!this.walkableCell(x,z))return false;return !this.colliderBlocksPoint(x,z,true);}
  addCollider(cx,cz,w,d,{navBlock=true,disabled=false,owner=null,pad=.03}={}){const c={minX:cx-w/2-pad,maxX:cx+w/2+pad,minZ:cz-d/2-pad,maxZ:cz+d/2+pad,navBlock,disabled,owner};this.colliders.push(c);return c;}
  addColliderFrom(obj,{navBlock=true,pad=.04}={}){obj.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(obj);const c={minX:b.min.x-pad,maxX:b.max.x+pad,minZ:b.min.z-pad,maxZ:b.max.z+pad,navBlock,disabled:false,owner:obj};this.colliders.push(c);return c;}
  neighbors(c){return[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dz])=>({x:c.x+dx,z:c.z+dz})).filter(n=>this.navPassable(n.x,n.z));}
  astar(start,goal,max=5000){const sk=key(start.x,start.z),gk=key(goal.x,goal.z);if(!this.navPassable(start.x,start.z)||!this.navPassable(goal.x,goal.z))return[];const open=new Map([[sk,start]]),came=new Map(),gs=new Map([[sk,0]]),fs=new Map([[sk,Math.abs(start.x-goal.x)+Math.abs(start.z-goal.z)]]);let iter=0;while(open.size&&iter++<max){let ck=null,b=Infinity;for(const k of open.keys()){const f=fs.get(k)??Infinity;if(f<b){b=f;ck=k;}}const cur=open.get(ck);if(ck===gk){const p=[cur];let k=ck;while(came.has(k)){k=came.get(k);const[a,b]=k.split(',').map(Number);p.push({x:a,z:b});}return p.reverse();}open.delete(ck);for(const n of this.neighbors(cur)){const nk=key(n.x,n.z),tent=(gs.get(ck)??Infinity)+1;if(tent<(gs.get(nk)??Infinity)){came.set(nk,ck);gs.set(nk,tent);fs.set(nk,tent+Math.abs(n.x-goal.x)+Math.abs(n.z-goal.z));open.set(nk,n);}}}return[];}
  navDistance(aPos,bPos,maxDist=80){const a=this.cellFromWorld(aPos.x,aPos.z),b=this.cellFromWorld(bPos.x,bPos.z);if(a.x===b.x&&a.z===b.z)return 0;const q=[a],seen=new Set([key(a.x,a.z)]);let head=0;const dist=new Map([[key(a.x,a.z),0]]);while(head<q.length){const c=q[head++],d=dist.get(key(c.x,c.z));if(d>=maxDist)continue;for(const n of this.neighbors(c)){const k=key(n.x,n.z);if(seen.has(k))continue;if(n.x===b.x&&n.z===b.z)return d+1;seen.add(k);dist.set(k,d+1);q.push(n);}}return Infinity;}
  hasLOS(a,b){let x0=this.cellFromWorld(a.x,a.z).x,z0=this.cellFromWorld(a.x,a.z).z,x1=this.cellFromWorld(b.x,b.z).x,z1=this.cellFromWorld(b.x,b.z).z;let dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dz=-Math.abs(z1-z0),sz=z0<z1?1:-1,err=dx+dz;while(true){if(!this.walkableCell(x0,z0))return false;if(x0===x1&&z0===z1)break;const e2=2*err;if(e2>=dz){err+=dz;x0+=sx;}if(e2<=dx){err+=dx;z0+=sz;}}return true;}
  async buildGeometry(){
    const floorMats={
      mall:assets.materials.terrazzo||new THREE.MeshStandardMaterial({map:fallbackFloorTexture('mall'),roughness:.75}),
      arcade:assets.materials.carpet||new THREE.MeshStandardMaterial({map:fallbackFloorTexture('carpet'),roughness:.9}),
      vhs:assets.materials.carpet||new THREE.MeshStandardMaterial({map:fallbackFloorTexture('carpet'),roughness:.9}),
      music:assets.materials.carpet||new THREE.MeshStandardMaterial({map:fallbackFloorTexture('carpet'),roughness:.9}),
      food:assets.materials.checker||new THREE.MeshStandardMaterial({map:fallbackFloorTexture('checker'),roughness:.72}),
      service:new THREE.MeshStandardMaterial({color:0x34363a,roughness:.92,metalness:.04}),
      archive:new THREE.MeshStandardMaterial({color:0x403c3a,roughness:.88,metalness:.02})
    };
    for(const m of Object.values(floorMats)){if(m.map){m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;}}
    const grouped={};for(const k of this.walk){const tag=this.tags.get(k)||'mall';(grouped[tag]??=[]).push(k);}
    const plane=new THREE.PlaneGeometry(1,1),matrix=new THREE.Matrix4();
    for(const[tag,cells]of Object.entries(grouped)){const mat=floorMats[tag]||floorMats.mall,mesh=new THREE.InstancedMesh(plane,mat,cells.length);mesh.receiveShadow=true;for(let i=0;i<cells.length;i++){const[x,z]=cells[i].split(',').map(Number);matrix.makeRotationX(-Math.PI/2);matrix.setPosition(x,.002,z);mesh.setMatrixAt(i,matrix);}mesh.instanceMatrix.needsUpdate=true;this.root.add(mesh);this.floorMeshes.push(mesh);}
    const ceilMat=new THREE.MeshStandardMaterial({color:0x111216,roughness:1}),wallMat=assets.materials.wall||new THREE.MeshStandardMaterial({color:0x8f8c8e,roughness:.92,metalness:.01}),trimMat=new THREE.MeshStandardMaterial({color:0x292a30,roughness:.75,metalness:.08});
    const wallGeoX=new THREE.BoxGeometry(.10,2.85,1.02),wallGeoZ=new THREE.BoxGeometry(1.02,2.85,.10);const wx=[],wz=[];
    for(const k of this.walk){const[x,z]=k.split(',').map(Number);if(!this.walkableCell(x+1,z))wx.push([x+.5,z]);if(!this.walkableCell(x-1,z))wx.push([x-.5,z]);if(!this.walkableCell(x,z+1))wz.push([x,z+.5]);if(!this.walkableCell(x,z-1))wz.push([x,z-.5]);}
    const makeInst=(geo,list)=>{const m=new THREE.InstancedMesh(geo,wallMat,list.length),mat=new THREE.Matrix4();m.castShadow=true;m.receiveShadow=true;for(let i=0;i<list.length;i++){mat.makeTranslation(list[i][0],1.425,list[i][1]);m.setMatrixAt(i,mat);}m.instanceMatrix.needsUpdate=true;this.root.add(m);this.wallMeshes.push(m);};makeInst(wallGeoX,wx);makeInst(wallGeoZ,wz);
    // dark suspended ceiling by passable cells
    const ceil=new THREE.InstancedMesh(plane,ceilMat,this.walk.size);let ci=0;for(const k of this.walk){const[x,z]=k.split(',').map(Number);matrix.makeRotationX(Math.PI/2);matrix.setPosition(x,2.85,z);ceil.setMatrixAt(ci++,matrix);}ceil.instanceMatrix.needsUpdate=true;this.root.add(ceil);
    // trim + fluorescent panels. Lights are sparse, panels are common.
    let idx=0;const panelGeo=new THREE.BoxGeometry(.72,.035,.22),panelMat=new THREE.MeshStandardMaterial({color:0xe4e1d7,emissive:0xfff0d8,emissiveIntensity:1.4,roughness:.5});
    for(const k of this.walk){const[x,z]=k.split(',').map(Number);const h=((x*73856093)^(z*19349663))>>>0;if(h%17===0){const p=new THREE.Mesh(panelGeo,panelMat.clone());p.position.set(x,2.79,z);p.rotation.y=(h%2)*Math.PI/2;this.root.add(p);if(h%51===0){const l=new THREE.PointLight(0xffe7cc,.55,6.8,2);l.position.set(x,2.55,z);this.root.add(l);this.lights.push({light:l,seed:h,base:.55});}}idx++;}
    // mall wall stripe gives the architecture a 90s identity
    const stripeMat=new THREE.MeshBasicMaterial({color:0xa26483,transparent:true,opacity:.24});const stripeGeoX=new THREE.BoxGeometry(.108,.10,1.02),stripeGeoZ=new THREE.BoxGeometry(1.02,.10,.108);const stripeX=new THREE.InstancedMesh(stripeGeoX,stripeMat,wx.length),stripeZ=new THREE.InstancedMesh(stripeGeoZ,stripeMat,wz.length);for(let i=0;i<wx.length;i++){matrix.makeTranslation(wx[i][0],1.35,wx[i][1]);stripeX.setMatrixAt(i,matrix);}for(let i=0;i<wz.length;i++){matrix.makeTranslation(wz[i][0],1.35,wz[i][1]);stripeZ.setMatrixAt(i,matrix);}stripeX.instanceMatrix.needsUpdate=true;stripeZ.instanceMatrix.needsUpdate=true;this.root.add(stripeX,stripeZ);
  }
}

function addBox(parent,pos,size,mat,rotY=0){const m=new THREE.Mesh(new THREE.BoxGeometry(size.x,size.y,size.z),mat);m.position.copy(pos);m.rotation.y=rotY;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function makeSign(text,theme='mall',w=4.2,h=.78){
  const colors={arcade:['#14051f','#78ffe2'],food:['#241207','#ffc65c'],vhs:['#23051f','#ff75cc'],music:['#07152d','#70aaff'],mall:['#101116','#f3d4e6']};
  const[c1,c2]=colors[theme]||colors.mall;
  const tex=makeCanvasTexture((ctx,c)=>{
    const g=ctx.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'#09090d');g.addColorStop(.55,c1);g.addColorStop(1,'#050508');ctx.fillStyle=g;ctx.fillRect(0,0,c.width,c.height);
    for(let i=0;i<180;i++){ctx.strokeStyle=`rgba(255,255,255,${rand(.005,.035)})`;ctx.lineWidth=rand(.5,2);ctx.beginPath();ctx.moveTo(rand(0,c.width),rand(0,c.height));ctx.lineTo(rand(0,c.width),rand(0,c.height));ctx.stroke();}
    ctx.strokeStyle=c2;ctx.shadowColor=c2;ctx.shadowBlur=34;ctx.lineWidth=10;ctx.strokeRect(24,24,c.width-48,c.height-48);
    ctx.font='900 72px Arial Black, Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.strokeStyle=c2;ctx.lineWidth=7;ctx.strokeText(text,c.width/2,c.height/2+2);ctx.fillStyle='#fff9fb';ctx.shadowBlur=22;ctx.fillText(text,c.width/2,c.height/2+2);
    // A few dead tube chips make the sign look old even while lit.
    ctx.shadowBlur=0;for(let i=0;i<8;i++){ctx.fillStyle='rgba(4,4,7,.72)';ctx.fillRect(rand(45,c.width-70),rand(38,c.height-55),rand(6,22),rand(2,5));}
  },1024,256);
  const root=new THREE.Group();
  const backing=new THREE.Mesh(new THREE.BoxGeometry(w,h,.10),new THREE.MeshStandardMaterial({color:0x08090b,roughness:.48,metalness:.32}));root.add(backing);
  const mat=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:new THREE.Color(c2),emissiveIntensity:2.45,roughness:.4,metalness:.03,transparent:false});
  const face=new THREE.Mesh(new THREE.PlaneGeometry(w*.97,h*.92),mat);face.position.z=.056;root.add(face);
  const light=new THREE.PointLight(new THREE.Color(c2),.72,6.5,2);light.position.set(0,-.08,.5);root.add(light);
  root.userData.neon={mat,light,baseEmissive:2.45,baseLight:.72,next:rand(4.5,15),burst:0,phase:rand(0,TAU)};
  return root;
}
function makePoster(title,sub,color='#d86fa8'){
  const tex=makeCanvasTexture((ctx,c)=>{ctx.fillStyle='#141419';ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<500;i++){ctx.fillStyle=`rgba(255,255,255,${Math.random()*.035})`;ctx.fillRect(Math.random()*c.width,Math.random()*c.height,rand(1,8),rand(1,8));}ctx.fillStyle=color;ctx.globalAlpha=.22;ctx.fillRect(35,180,c.width-70,230);ctx.globalAlpha=1;ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=8;ctx.strokeRect(18,18,c.width-36,c.height-36);ctx.fillStyle='#fff';ctx.font='900 49px Arial';ctx.textAlign='center';ctx.fillText(title,c.width/2,105);ctx.font='700 24px Arial';ctx.fillStyle='#d7d7dd';ctx.fillText(sub,c.width/2,155);ctx.font='900 35px Arial';ctx.fillStyle='#fff';ctx.fillText(choose(['TODAY ONLY','MEMBERS SAVE','NEW ARRIVAL','WHILE SUPPLIES LAST']),c.width/2,250);},512,640);
  return new THREE.Mesh(new THREE.PlaneGeometry(.9,1.12),new THREE.MeshStandardMaterial({map:tex,roughness:.85}));
}
function modelFallback(kind){
  const g=new THREE.Group(),dark=new THREE.MeshStandardMaterial({color:0x18191d,roughness:.78,metalness:.1}),accent=new THREE.MeshStandardMaterial({color:0x101012,emissive:0x6fffd6,emissiveIntensity:.4,roughness:.5});
  if(kind==='arcade'){const b=addBox(g,new THREE.Vector3(0,.65,0),new THREE.Vector3(.55,1.3,.65),dark);addBox(g,new THREE.Vector3(0,1.15,.34),new THREE.Vector3(.4,.28,.03),accent);}
  else if(kind==='table'){const top=addBox(g,new THREE.Vector3(0,.72,0),new THREE.Vector3(1,.08,1),dark);for(const[x,z]of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])addBox(g,new THREE.Vector3(x,.35,z),new THREE.Vector3(.08,.7,.08),dark);}
  else if(kind==='chair'){addBox(g,new THREE.Vector3(0,.43,0),new THREE.Vector3(.55,.08,.55),dark);addBox(g,new THREE.Vector3(0,.85,-.25),new THREE.Vector3(.55,.8,.08),dark);}
  else if(kind==='shelf'){addBox(g,new THREE.Vector3(0,1,0),new THREE.Vector3(1.2,2,.4),dark);for(let y=.25;y<1.8;y+=.4)addBox(g,new THREE.Vector3(0,y,.22),new THREE.Vector3(1.1,.04,.38),accent);}
  else addBox(g,new THREE.Vector3(0,.5,0),new THREE.Vector3(.8,1,.6),dark);return g;
}
function normalizeModelToMeters(obj,{targetHeight=null,targetLongest=null}={}){
  obj.position.set(0,0,0);obj.updateWorldMatrix(true,true);
  const box=new THREE.Box3().setFromObject(obj),size=new THREE.Vector3();box.getSize(size);const factors=[];
  if(targetHeight&&size.y>1e-5)factors.push(targetHeight/size.y);
  const longest=Math.max(size.x,size.z);
  if(targetLongest&&longest>1e-5)factors.push(targetLongest/longest);
  if(factors.length)obj.scale.multiplyScalar(Math.min(...factors));
  obj.updateWorldMatrix(true,true);const grounded=new THREE.Box3().setFromObject(obj);return -grounded.min.y;
}
function yawFacing(fromX,fromZ,toX,toZ,offset=0){return Math.atan2(toX-fromX,toZ-fromZ)+offset;}
async function placeModel(parent,name,pos,{scale=1,rot=0,collide=true,navBlock=true,fallback='box',targetHeight=null,targetLongest=null,ground=true,pad=.06}={}){
  let m=await assets.model(name);if(!m)m=modelFallback(fallback);
  m.rotation.y=rot;m.scale.setScalar(scale);m.position.set(0,0,0);
  const groundOffset=normalizeModelToMeters(m,{targetHeight,targetLongest});
  m.position.set(pos.x,ground?pos.y+groundOffset:pos.y,pos.z);parent.add(m);m.updateWorldMatrix(true,true);
  if(collide)GAME.world.addColliderFrom(m,{navBlock,pad});return m;
}

function makeCabinet(pos,rot=0){
  const root=new THREE.Group();root.position.copy(pos);root.rotation.y=rot;const steel=new THREE.MeshStandardMaterial({color:0x24262a,roughness:.58,metalness:.28}),inner=new THREE.MeshStandardMaterial({color:0x08090b,roughness:.9}),handle=new THREE.MeshStandardMaterial({color:0x0b0c0e,metalness:.55,roughness:.3});
  addBox(root,new THREE.Vector3(0,1,0),new THREE.Vector3(.94,2,.62),steel);addBox(root,new THREE.Vector3(0,1,.32),new THREE.Vector3(.84,1.88,.025),inner);
  const l=new THREE.Group(),r=new THREE.Group();l.position.set(-.44,.06,.335);r.position.set(.44,.06,.335);root.add(l,r);const dg=new THREE.BoxGeometry(.43,1.86,.035);const ld=new THREE.Mesh(dg,steel),rd=new THREE.Mesh(dg,steel);ld.position.set(.215,.94,0);rd.position.set(-.215,.94,0);l.add(ld);r.add(rd);
  for(const door of [ld,rd]){for(let i=0;i<9;i++)addBox(door,new THREE.Vector3(0,.35+i*.09,.021),new THREE.Vector3(.29,.018,.012),inner);}
  addBox(ld,new THREE.Vector3(.1,1.05,.03),new THREE.Vector3(.035,.20,.035),handle);addBox(rd,new THREE.Vector3(-.1,1.05,.03),new THREE.Vector3(.035,.20,.035),handle);
  root.userData={type:'cabinet',hingeL:l,hingeR:r,open:0,baseRot:rot};return root;
}
function setCabinetDoors(cab,t){cab.userData.open=t;cab.userData.hingeL.rotation.y=-t*1.42;cab.userData.hingeR.rotation.y=t*1.42;}

function makeBreaker(pos,rot=0,id='A'){
  const g=new THREE.Group();g.position.copy(pos);g.rotation.y=rot;const steel=new THREE.MeshStandardMaterial({color:0x33363a,roughness:.7,metalness:.25}),dark=new THREE.MeshStandardMaterial({color:0x111216,roughness:.9}),led=new THREE.MeshStandardMaterial({color:0x080808,emissive:0x991c12,emissiveIntensity:1});addBox(g,new THREE.Vector3(0,.25,0),new THREE.Vector3(.42,.5,.14),steel);addBox(g,new THREE.Vector3(0,.26,.08),new THREE.Vector3(.34,.42,.02),dark);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.025,12,12),led);lamp.position.set(-.12,.37,.10);g.add(lamp);g.userData={type:'breaker',id,on:false,lamp};return g;
}
function makePickup(type,pos,label,text=null){const g=new THREE.Group();g.position.copy(pos);const mat=new THREE.MeshStandardMaterial({color:type==='key'?0xb6b7b9:(type==='decoy'?0x463441:0xd9d1bb),roughness:.45,metalness:type==='key'?.45:.08,emissive:type==='decoy'?0x5e1539:0x000000,emissiveIntensity:type==='decoy'?.5:0});if(type==='key'){const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.2,10),mat);shaft.rotation.z=Math.PI/2;g.add(shaft);const ring=new THREE.Mesh(new THREE.TorusGeometry(.06,.014,8,18),mat);ring.position.x=-.12;g.add(ring);}else if(type==='decoy'){addBox(g,new THREE.Vector3(0,.04,0),new THREE.Vector3(.22,.09,.15),mat);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.018,10,10),mat);bulb.position.set(.07,.10,.06);g.add(bulb);}else{addBox(g,new THREE.Vector3(0,.03,0),new THREE.Vector3(.24,.04,.18),mat);}g.userData={type,label,text,collected:false,floatBase:pos.y,phase:rand(0,TAU)};return g;}

const LEVELS=[
  {name:'Chapter 1: Closing Time',short:'Closing Time',intro:'Pinewood dispatch has a routine emergency call: restore circuits A, B and C, then leave by the freight elevator. The work order says the mall has been empty for six years.',goal:'Restore the emergency electrical ring and reach the freight elevator.',breakers:3},
  {name:'Chapter 2: Service Level',short:'Service Level',intro:'The freight elevator did not go up. It went down. Find the security keycard, restore two service relays and open the north stairwell while the Dispatcher tries to determine who created your work order.',goal:'Restore both service relays and unlock the north stairwell.',breakers:2},
  {name:'Chapter 3: The Last Shift',short:'The Last Shift',intro:'The east wing archive contains the previous contractor’s final recordings. Recover the three Last Shift tapes, reach the PA control room, and clock Pinewood out for good.',goal:'Recover the Last Shift tapes and shut down the closing routine.',breakers:0}
];

function carveChapter(world,idx){
  if(idx===0){
    // The mall maze: deliberate corridor network, with stores authored as separate single-entrance rooms.
    world.carveRect(-25,-2,25,2,'mall');
    // Wider concourses in front of the stores keep their large signs readable and give hunts room to breathe.
    world.carveRect(-20,-16,-16,2,'mall');world.carveRect(5,-16,9,2,'mall');world.carveRect(-20,-16,10,-10,'mall');
    world.carveRect(-9,-2,-5,18,'mall');world.carveRect(16,-2,20,18,'mall');world.carveRect(-9,12,20,18,'mall');
    world.carveRect(-2,-11,2,12,'mall');world.carveRect(-25,7,-5,10,'mall');world.carveRect(9,7,20,10,'mall');world.carveRect(-25,-2,-22,10,'mall');
    // Store rooms remain single-entrance rooms, but their throats are now five cells wide.
    world.carveRect(-26,-30,-11,-19,'arcade');world.carveRect(-21,-19,-15,-15,'arcade');
    world.carveRect(1,-30,15,-19,'vhs');world.carveRect(5,-19,11,-15,'vhs');
    world.carveRect(-15,20,1,31,'food');world.carveRect(-10,17,-4,20,'food');
    world.carveRect(11,20,27,31,'music');world.carveRect(15,17,21,20,'music');
    // service/elevator alcove
    world.carveRect(25,-1,29,1,'service');
  } else if(idx===1){
    world.carveRect(-24,-2,24,2,'service');world.carveRect(-20,-17,-16,2,'service');world.carveRect(-7,-2,-3,18,'service');world.carveRect(7,-18,11,2,'service');world.carveRect(17,-2,21,18,'service');
    world.carveRect(-18,-17,9,-13,'service');world.carveRect(-5,14,19,18,'service');world.carveRect(-24,7,-5,10,'service');world.carveRect(9,7,21,10,'service');
    world.carveRect(-29,-10,-21,-4,'service');world.carveRect(-24,-7,-21,-5,'service'); // loading room single throat
    world.carveRect(20,-16,29,-7,'service');world.carveRect(20,-7,21,-2,'service'); // security room, single throat to east corridor
    world.carveRect(-15,20,-3,29,'service');world.carveRect(-8,18,-6,20,'service'); // maintenance
    world.carveRect(23,17,28,19,'service');world.carveRect(21,17,23,18,'service'); // stairwell alcove throat
  } else {
    world.carveRect(-26,-2,26,2,'archive');world.carveRect(-22,-18,-18,2,'archive');world.carveRect(-10,-2,-6,18,'archive');world.carveRect(3,-18,7,2,'archive');world.carveRect(16,-2,20,18,'archive');
    world.carveRect(-20,-18,5,-14,'archive');world.carveRect(-8,14,18,18,'archive');world.carveRect(-26,7,-8,10,'archive');world.carveRect(7,7,20,10,'archive');
    world.carveRect(-30,-29,-16,-20,'archive');world.carveRect(-23,-20,-21,-18,'archive'); // records room
    world.carveRect(-2,-30,12,-20,'archive');world.carveRect(4,-20,6,-18,'archive'); // old east store
    world.carveRect(14,21,30,31,'archive');world.carveRect(17,18,19,21,'archive'); // PA core
  }
}

function addStorefront(world,{name,theme,x,z,face='south',opening=6.15}){
  const g=new THREE.Group();world.root.add(g);const frame=new THREE.MeshStandardMaterial({color:0x18191f,roughness:.72,metalness:.16}),trim=new THREE.MeshStandardMaterial({color:theme==='arcade'?0x3d264c:theme==='food'?0x5a4932:theme==='vhs'?0x4b2945:0x253851,roughness:.75,metalness:.08});
  const alongX=(face==='south'||face==='north');
  // facade around a deliberately empty/open doorway, no physical door.
  if(alongX){addBox(g,new THREE.Vector3(x-opening/2-.75,1.42,z),new THREE.Vector3(1.3,2.84,.16),frame);addBox(g,new THREE.Vector3(x+opening/2+.75,1.42,z),new THREE.Vector3(1.3,2.84,.16),frame);addBox(g,new THREE.Vector3(x,2.58,z),new THREE.Vector3(opening, .52,.16),trim);}else{addBox(g,new THREE.Vector3(x,1.42,z-opening/2-.75),new THREE.Vector3(.16,2.84,1.3),frame);addBox(g,new THREE.Vector3(x,1.42,z+opening/2+.75),new THREE.Vector3(.16,2.84,1.3),frame);addBox(g,new THREE.Vector3(x,2.58,z),new THREE.Vector3(.16,.52,opening),trim);}
  const s=makeSign(name,theme,theme==='arcade'?4.72:4.48,.78);s.position.set(x,2.52,z);if(face==='north')s.rotation.y=Math.PI;else if(face==='east')s.rotation.y=Math.PI/2;else if(face==='west')s.rotation.y=-Math.PI/2;else s.rotation.y=0;
  // Nudge sign a centimeter toward the corridor-facing side of the physical lintel: visually flush, no hovering.
  if(face==='south')s.position.z+=.086;if(face==='north')s.position.z-=.086;if(face==='east')s.position.x+=.086;if(face==='west')s.position.x-=.086;g.add(s);world.neonSigns.push(s);
  return g;
}

function addWallPoster(world,poster,pos,rotY=0){poster.position.copy(pos);poster.rotation.y=rotY;poster.position.y=1.55;world.root.add(poster);}
function addNeonTube(world,a,b,color=0xff66bb){const mat=new THREE.MeshStandardMaterial({color:0x111111,emissive:color,emissiveIntensity:3,roughness:.35});const mid=a.clone().add(b).multiplyScalar(.5),len=a.distanceTo(b);const m=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,len,8),mat);m.position.copy(mid);const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());m.quaternion.copy(q);world.root.add(m);return m;}

async function buildArcade(world){
  addStorefront(world,{name:'SUNBURST ARCADE',theme:'arcade',x:-18,z:-18.48,face:'south'});
  addWallPoster(world,makePoster('HIGH SCORE','NO REFUNDS','#7042a4'),new THREE.Vector3(-26.44,1.55,-24),Math.PI/2);
  addWallPoster(world,makePoster('TOKEN NIGHT','2 FOR 1','#2a8270'),new THREE.Vector3(-10.56,1.55,-25),-Math.PI/2);
  addWallPoster(world,makePoster('PRIZE WALL','WIN SOMETHING','#9d6035'),new THREE.Vector3(-23,1.55,-30.44),0);
  addNeonTube(world,new THREE.Vector3(-25.4,2.35,-20),new THREE.Vector3(-25.4,2.35,-28),0xff58c8);
  addNeonTube(world,new THREE.Vector3(-11.6,2.35,-20),new THREE.Vector3(-11.6,2.35,-28),0x77ffe1);
  const games=[[-24,-22,.18],[-23.3,-25,.28],[-21.5,-27.7,-.12],[-16,-27.5,.16],[-13,-25,-.25],[-12.3,-22,-.18]];
  for(const[x,z,r]of games)await placeModel(world.root,'arcade',new THREE.Vector3(x,0,z),{targetHeight:1.78,targetLongest:.92,rot:r,collide:true,fallback:'arcade'});
  await placeModel(world.root,'airHockey',new THREE.Vector3(-18.8,0,-23.6),{targetHeight:.82,targetLongest:2.05,rot:.12,collide:true,fallback:'table'});
  await placeModel(world.root,'basketball',new THREE.Vector3(-15.2,0,-21.5),{targetHeight:2.15,targetLongest:2.35,rot:Math.PI,collide:true,fallback:'arcade'});
  await placeModel(world.root,'claw',new THREE.Vector3(-22,0,-20.7),{targetHeight:1.85,targetLongest:1.0,rot:Math.PI,collide:true,fallback:'arcade'});
  await placeModel(world.root,'counterDesk',new THREE.Vector3(-14.1,0,-29),{targetHeight:1.0,targetLongest:2.45,rot:0,collide:true,fallback:'table'});
  await placeModel(world.root,'arcadeCash',new THREE.Vector3(-14.7,1.01,-28.9),{targetHeight:.28,targetLongest:.42,rot:Math.PI,collide:false,fallback:'box'});
  const prizeMat=[0xff7b98,0x78d9ff,0xffce6d,0x7cffb6,0xb388ff].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.7}));for(let i=0;i<30;i++){const m=new THREE.Mesh(i%3?new THREE.BoxGeometry(.16,.14,.12):new THREE.SphereGeometry(.08,8,8),prizeMat[i%prizeMat.length]);m.position.set(-12.1+rand(-.35,.35),.35+(i%6)*.22,-29.25+rand(-.04,.04));world.root.add(m);}
  const cab=makeCabinet(new THREE.Vector3(-24.7,0,-28.8),0);world.root.add(cab);world.addCollider(-24.7,-28.8,.95,.65,{navBlock:true,owner:cab});world.interactables.push(cab);
  const dec=makePickup('decoy',new THREE.Vector3(-19.7,.16,-28.1),'Noise Maker');world.root.add(dec);world.interactables.push(dec);
}

function seededUnit(seed,n=0){const x=Math.sin((seed+1)*12.9898+n*78.233)*43758.5453;return x-Math.floor(x);}
function makeVHSCase(seed=0,faceOut=false){
  const titles=['DEAD AIR','NIGHT LINE','VIOLET RUN','STATIC SUMMER','LAST EXIT','MIDNIGHT MALL','RED SIGNAL','BLUE ROOM','AFTER HOURS','THE CALLER','CLOSING TIME','DARK AISLE'];
  const palette=['#15151b','#61263b','#284e73','#5b4b1e','#315d52','#513568','#7a342c','#ddd4bd'];
  const shell=palette[Math.floor(seededUnit(seed,1)*palette.length)%palette.length],accent=palette[Math.floor(seededUnit(seed,2)*palette.length)%palette.length];
  const title=titles[seed%titles.length];const g=new THREE.Group();
  if(faceOut){
    const body=new THREE.Mesh(new THREE.BoxGeometry(.112,.188,.027),new THREE.MeshStandardMaterial({color:shell,roughness:.68}));body.position.y=.094;g.add(body);
    const tex=makeCanvasTexture((ctx,c)=>{ctx.fillStyle=shell;ctx.fillRect(0,0,c.width,c.height);const hue=Math.floor(seededUnit(seed,3)*360);ctx.fillStyle=`hsl(${hue} 48% 32%)`;ctx.fillRect(12,12,c.width-24,c.height*.48);ctx.strokeStyle=accent;ctx.lineWidth=8;ctx.strokeRect(8,8,c.width-16,c.height-16);ctx.fillStyle='#f5efe8';ctx.font='900 42px Arial';ctx.textAlign='center';ctx.fillText(title,c.width/2,c.height*.72);ctx.font='700 19px Arial';ctx.fillStyle='#d9d2cc';ctx.fillText(choose(['VIDEO PLANET','NEW RELEASE','2 NIGHT RENTAL']),c.width/2,c.height*.83);},256,384);
    const cover=new THREE.Mesh(new THREE.PlaneGeometry(.104,.178),new THREE.MeshStandardMaterial({map:tex,roughness:.72}));cover.position.set(0,.096,.0145);g.add(cover);
  }else{
    const body=new THREE.Mesh(new THREE.BoxGeometry(.038,.188,.116),new THREE.MeshStandardMaterial({color:shell,roughness:.7}));body.position.y=.094;g.add(body);
    const tex=makeCanvasTexture((ctx,c)=>{ctx.fillStyle=shell;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=accent;ctx.fillRect(0,0,c.width,24);ctx.fillStyle='#f4eee6';ctx.font='900 22px Arial';ctx.save();ctx.translate(c.width/2,c.height/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText(title,0,7);ctx.restore();},96,384);
    const spine=new THREE.Mesh(new THREE.PlaneGeometry(.034,.178),new THREE.MeshStandardMaterial({map:tex,roughness:.74}));spine.position.set(0,.096,.059);g.add(spine);
  }
  return g;
}
async function stockVHSDisplay(world,x,z,rot=0,cols=14,rows=4,doubleSided=true){
  const rack=new THREE.Group();rack.position.set(x,0,z);rack.rotation.y=rot;let seed=(Math.abs(Math.round(x*13+z*19))%1000);
  const sides=doubleSided?[1,-1]:[1];
  for(const side of sides){for(let row=0;row<rows;row++){
    const y=.29+row*.36;let slot=0;
    while(slot<cols){const faceOut=(slot===cols-3&&row%2===0);const v=makeVHSCase(seed++,faceOut);if(faceOut){v.position.set(-.62+slot*(1.24/(cols-1)),y,side*.31);v.rotation.y=side<0?Math.PI:0;slot+=3;}else{v.position.set(-.62+slot*(1.24/(cols-1)),y,side*.31);v.rotation.y=(side<0?Math.PI:0)+rand(-.035,.035);v.rotation.z=rand(-.025,.025);slot++;}rack.add(v);}
  }}world.root.add(rack);
}
async function buildVHS(world){
  addStorefront(world,{name:'VIDEO PLANET',theme:'vhs',x:8,z:-18.48,face:'south'});
  addWallPoster(world,makePoster('BE KIND','REWIND','#8c3d76'),new THREE.Vector3(.56,1.55,-24),Math.PI/2);
  addWallPoster(world,makePoster('NEW RELEASES','FRIDAY','#5d4a8f'),new THREE.Vector3(15.44,1.55,-23),-Math.PI/2);
  addWallPoster(world,makePoster('2 NIGHTS','1 PRICE','#3a658f'),new THREE.Vector3(8,1.55,-30.44),0);
  const racks=[[4,-22,0],[9,-22,0],[4,-26,0],[9,-26,0],[13,-24,Math.PI/2],[2.6,-28.7,0],[6.0,-28.7,0]];
  for(const[x,z,r]of racks){await placeModel(world.root,'qShelfLarge',new THREE.Vector3(x,0,z),{targetHeight:1.78,targetLongest:1.72,rot:r,collide:true,fallback:'shelf',pad:.09});await stockVHSDisplay(world,x,z,r,14,4,z>-28);}
  await placeModel(world.root,'counterDesk',new THREE.Vector3(12.3,0,-20.7),{targetHeight:1.0,targetLongest:2.45,rot:-.08,collide:true,fallback:'table'});
  await placeModel(world.root,'marketCash',new THREE.Vector3(12.0,1.01,-20.55),{targetHeight:.28,targetLongest:.42,rot:Math.PI,collide:false,fallback:'box'});
  await placeModel(world.root,'marketBottleReturn',new THREE.Vector3(14.6,0,-27),{targetHeight:1.55,targetLongest:1.0,rot:-Math.PI/2,collide:true,fallback:'shelf'});
  const cab=makeCabinet(new THREE.Vector3(13.7,0,-29),Math.PI);world.root.add(cab);world.addCollider(13.7,-29,.95,.65,{navBlock:true,owner:cab});world.interactables.push(cab);
  const keyp=makePickup('key',new THREE.Vector3(6.9,.18,-28.2),'Master Service Key');world.root.add(keyp);world.interactables.push(keyp);
}

async function buildFoodCourt(world){
  addStorefront(world,{name:'PINEWOOD FOOD COURT',theme:'food',x:-7,z:19.48,face:'north'});
  addWallPoster(world,makePoster('SLICE CITY','HOT • FAST','#9b5d31'),new THREE.Vector3(-15.44,1.55,25),Math.PI/2);
  addWallPoster(world,makePoster('POLAR POP','FREE REFILLS','#3d7394'),new THREE.Vector3(1.44,1.55,25),-Math.PI/2);
  addWallPoster(world,makePoster('COMBO #4','$3.99','#7a8450'),new THREE.Vector3(-7,1.55,31.44),Math.PI);
  // Three plain CC0 Kenney desks act as proper service counters. No bakery/produce displays are used here.
  for(const[label,x]of[['SLICE CITY',-12],['WOK THIS WAY',-7],['POLAR POP',-2]]){
    await placeModel(world.root,'counterDesk',new THREE.Vector3(x,0,29.25),{targetHeight:.98,targetLongest:2.45,rot:Math.PI,collide:true,fallback:'table'});
    const sign=makeSign(label,'food',2.75,.54);sign.position.set(x,2.18,31.42);sign.rotation.y=Math.PI;world.root.add(sign);world.neonSigns.push(sign);
  }
  await placeModel(world.root,'marketCash',new THREE.Vector3(-11.7,.99,29.12),{targetHeight:.28,targetLongest:.42,rot:0,collide:false,fallback:'box'});
  // Four uncluttered seating islands leave a generous center aisle from the storefront to the counters.
  const spots=[[-12.0,22.6],[-2.2,22.6],[-12.0,26.0],[-2.2,26.0]];
  for(let si=0;si<spots.length;si++){const[x,z]=spots[si];
    await placeModel(world.root,'qTableRound',new THREE.Vector3(x,0,z),{targetHeight:.75,targetLongest:1.02,rot:si*.18,collide:true,fallback:'table'});
    for(let a=0;a<4;a++){const ang=a*Math.PI/2,radius=.82,px=x+Math.cos(ang)*radius,pz=z+Math.sin(ang)*radius;
      await placeModel(world.root,'qChair',new THREE.Vector3(px,0,pz),{targetHeight:.90,targetLongest:.54,rot:yawFacing(px,pz,x,z),collide:true,fallback:'chair',pad:.035});
    }
  }
  // Food is normalized by BOTH height and footprint, and is grounded on the tabletop rather than the floor.
  await placeModel(world.root,'pizza',new THREE.Vector3(-12.0,.76,22.6),{targetHeight:.045,targetLongest:.32,rot:.4,collide:false,fallback:'box'});
  await placeModel(world.root,'cup',new THREE.Vector3(-11.68,.76,22.78),{targetHeight:.18,targetLongest:.09,rot:0,collide:false,fallback:'box'});
  await placeModel(world.root,'pizzaBox',new THREE.Vector3(-2.2,.76,22.6),{targetHeight:.055,targetLongest:.36,rot:-.2,collide:false,fallback:'box'});
  const cab=makeCabinet(new THREE.Vector3(-14.5,0,29),Math.PI);world.root.add(cab);world.addCollider(-14.5,29,.95,.65,{navBlock:true,owner:cab});world.interactables.push(cab);
  const dec=makePickup('decoy',new THREE.Vector3(-2.7,.16,28.3),'Pager Decoy');world.root.add(dec);world.interactables.push(dec);
}

async function buildMusic(world){
  addStorefront(world,{name:'CASSETTE CASTLE',theme:'music',x:18,z:19.48,face:'north'});
  addWallPoster(world,makePoster('NEW WAVE','THIS WEEK','#355d92'),new THREE.Vector3(10.56,1.55,25),Math.PI/2);addWallPoster(world,makePoster('MIX TAPE','STATION','#6d4c93'),new THREE.Vector3(27.44,1.55,25),-Math.PI/2);addWallPoster(world,makePoster('TOP 40','PINEWOOD','#8b5639'),new THREE.Vector3(18,1.55,31.44),Math.PI);
  const shelves=[[14,23,0],[18,23,0],[22,23,0],[14,27,0],[20,27,0]];for(const[x,z,r]of shelves)await placeModel(world.root,'qShelfLarge',new THREE.Vector3(x,0,z),{targetHeight:1.55,targetLongest:1.7,rot:r,collide:true,fallback:'shelf'});
  for(const z of[22.5,25,27.5]){await placeModel(world.root,'sideTable',new THREE.Vector3(25.3,0,z),{targetHeight:.72,targetLongest:.8,rot:Math.PI/2,collide:true,fallback:'table'});const ring=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,8,20),new THREE.MeshStandardMaterial({color:0x86adff,emissive:0x17305d,emissiveIntensity:.6,roughness:.55}));ring.position.set(24.95,1.15,z);ring.rotation.y=Math.PI/2;world.root.add(ring);}
  await placeModel(world.root,'counterDesk',new THREE.Vector3(13.2,0,29.1),{targetHeight:1.0,targetLongest:2.45,rot:Math.PI,collide:true,fallback:'table'});
  await placeModel(world.root,'arcadeCash',new THREE.Vector3(13.5,1.01,29),{targetHeight:.28,targetLongest:.42,rot:0,collide:false,fallback:'box'});
  const cab=makeCabinet(new THREE.Vector3(25.4,0,29.2),Math.PI);world.root.add(cab);world.addCollider(25.4,29.2,.95,.65,{navBlock:true,owner:cab});world.interactables.push(cab);
}

function makeShutter(pos,axis='x',locked=false,label='Service Shutter'){
  const g=new THREE.Group();g.position.copy(pos);const frame=new THREE.MeshStandardMaterial({color:0x16171a,roughness:.65,metalness:.32}),slabMat=new THREE.MeshStandardMaterial({color:0x393a3d,roughness:.58,metalness:.36});
  const alongZ=axis==='x';const size=alongZ?new THREE.Vector3(.16,2.65,5.1):new THREE.Vector3(5.1,2.65,.16);addBox(g,new THREE.Vector3(0,1.35,0),alongZ?new THREE.Vector3(.35,2.8,5.35):new THREE.Vector3(5.35,2.8,.35),frame);const slab=addBox(g,new THREE.Vector3(0,1.32,0),size,slabMat);for(let y=.25;y<2.5;y+=.18)addBox(slab,new THREE.Vector3(alongZ?.09:0,y-1.32,alongZ?0:.09),alongZ?new THREE.Vector3(.02,.025,5.0):new THREE.Vector3(5,.025,.02),frame);g.userData={type:'door',open:false,locked,label,slab,axis,anim:0,collider:null};return g;
}
function makeExitElevator(pos,face='west'){
  const g=new THREE.Group();g.position.copy(pos);const steel=new THREE.MeshStandardMaterial({color:0x26282c,roughness:.42,metalness:.52}),dark=new THREE.MeshStandardMaterial({color:0x090a0c,roughness:.8,metalness:.18}),lamp=new THREE.MeshStandardMaterial({color:0x080808,emissive:0x74ffd1,emissiveIntensity:.5});
  addBox(g,new THREE.Vector3(0,1.38,0),new THREE.Vector3(.28,2.76,2.5),dark);const l=addBox(g,new THREE.Vector3(-.16,1.2,-.58),new THREE.Vector3(.08,2.35,1.10),steel),r=addBox(g,new THREE.Vector3(-.16,1.2,.58),new THREE.Vector3(.08,2.35,1.10),steel);const indicator=addBox(g,new THREE.Vector3(-.20,2.55,0),new THREE.Vector3(.05,.13,.6),lamp);g.userData={type:'exit',left:l,right:r,open:0,state:'idle',timer:0};return g;
}

async function decorateLevel(world,idx){
  if(idx===0){
    await buildArcade(world);await buildVHS(world);await buildFoodCourt(world);await buildMusic(world);
    // A dry fountain and benches help the mall read as a place rather than pure corridors.
    const stone=new THREE.MeshStandardMaterial({color:0x777476,roughness:.82,metalness:.02});const basin=new THREE.Mesh(new THREE.CylinderGeometry(1.45,1.65,.38,28),stone);basin.position.set(0,.19,0);world.root.add(basin);const inner=new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,.41,28),new THREE.MeshStandardMaterial({color:0x17191b,roughness:.88}));inner.position.set(0,.25,0);world.root.add(inner);world.addCollider(0,0,3.2,3.2,{navBlock:true,pad:.05});
    // break boxes and gating shutter
    for(const[id,x,z,r]of[['A',-18,-13,0],['B',7,-13,0],['C',-7,15,Math.PI]]){const b=makeBreaker(new THREE.Vector3(x,.85,z),r,id);world.root.add(b);world.interactables.push(b);}
    const shutter=makeShutter(new THREE.Vector3(26,0,0),'x',true,'East Service Shutter');shutter.scale.z=.62;world.root.add(shutter);shutter.userData.collider=world.addCollider(26,0,1.0,3.2,{navBlock:true,owner:shutter});world.dynamicDoors.push(shutter);world.interactables.push(shutter);
    const elevator=makeExitElevator(new THREE.Vector3(29.32,0,0));world.root.add(elevator);world.interactables.push(elevator);GAME.exitObject=elevator;
    // Last Shift logs
    const notes=[[-23,0,'LS-01','LAST SHIFT 01\nThe fountain motor is disconnected. If you hear water, do not follow it.'],[-1,-13,'LS-02','LAST SHIFT 02\nThe closing announcements are not recordings. I watched the tape deck with the power cord in my hand.'],[19,15,'LS-03','LAST SHIFT 03\nIt does not chase through walls. It follows the route you would have to walk. Remember that when the heartbeat starts.']];for(const[x,z,id,text]of notes){const n=makePickup('note',new THREE.Vector3(x,.18,z),id,text);world.root.add(n);world.interactables.push(n);}
  }else if(idx===1){
    for(const[id,x,z,r]of[['D',-18,-15,0],['E',9,-15,0]]){const b=makeBreaker(new THREE.Vector3(x,.85,z),r,id);world.root.add(b);world.interactables.push(b);}
    const keyp=makePickup('key',new THREE.Vector3(25,.18,-12),'Security Keycard');world.root.add(keyp);world.interactables.push(keyp);
    const shutter=makeShutter(new THREE.Vector3(22,0,18),'x',true,'North Stairwell Gate');shutter.scale.z=.8;world.root.add(shutter);shutter.userData.collider=world.addCollider(22,18,1.0,4.0,{navBlock:true,owner:shutter});world.dynamicDoors.push(shutter);world.interactables.push(shutter);GAME.exitObject=shutter;
    const cab=makeCabinet(new THREE.Vector3(-27.8,0,-8.6),Math.PI/2);world.root.add(cab);world.addCollider(-27.8,-8.6,.7,1.0,{navBlock:true,owner:cab});world.interactables.push(cab);
    const dec=makePickup('decoy',new THREE.Vector3(-11,.18,16),'Maintenance Buzzer');world.root.add(dec);world.interactables.push(dec);
    const notes=[[-22,-6,'LS-04','LAST SHIFT 04\nDispatch said my name before I gave it. I stopped answering the radio after that.'],[-6,23,'LS-05','LAST SHIFT 05\nThe thing in the halls is wearing the idea of an employee. Do not let the eyes convince you there is a face behind them.'],[18,8,'LS-06','LAST SHIFT 06\nI threw my pager down the loading hall. It followed the beeping. Bought me maybe six seconds.']];for(const[x,z,id,text]of notes){const n=makePickup('note',new THREE.Vector3(x,.18,z),id,text);world.root.add(n);world.interactables.push(n);}
    // Service props / pipes / crates
    const crateMat=new THREE.MeshStandardMaterial({color:0x5b4a37,roughness:.94});for(const[x,z]of[[-27,-6],[-25,-8],[-5,22],[25,-10],[15,16]]){const c=addBox(world.root,new THREE.Vector3(x,.45,z),new THREE.Vector3(.9,.9,.9),crateMat,rand(0,TAU));world.addColliderFrom(c,{navBlock:true});}
  }else{
    // Three actual tapes gate the ending.
    for(const[x,z,id,text]of[[-23,-25,'LS-07','LAST SHIFT 07\nI found the service schedule. Pinewood has been running the same closing checklist every night since 1997.'],[5,-25,'LS-08','LAST SHIFT 08\nThe Attendant only appears after the building calls for staff. It is not the voice. I think it is what answers the voice.'],[18,16,'LS-09','LAST SHIFT 09\nIf you reach PA control, do not kill the power. End the shift. Make the building believe everyone clocked out.']]){const n=makePickup('tape',new THREE.Vector3(x,.18,z),id,text);world.root.add(n);world.interactables.push(n);}
    const cab=makeCabinet(new THREE.Vector3(8,0,-27),Math.PI);world.root.add(cab);world.addCollider(8,-27,.95,.65,{navBlock:true,owner:cab});world.interactables.push(cab);
    const dec=makePickup('decoy',new THREE.Vector3(-20,.18,-23),'Dead Pager');world.root.add(dec);world.interactables.push(dec);
    // PA core: humming console at far end.
    const consoleMat=new THREE.MeshStandardMaterial({color:0x1c1f24,roughness:.44,metalness:.45,emissive:0x10261d,emissiveIntensity:.5});const console=new THREE.Group();console.position.set(26,0,27);addBox(console,new THREE.Vector3(0,.65,0),new THREE.Vector3(2.6,1.3,1.1),consoleMat);for(let i=0;i<18;i++){const led=new THREE.Mesh(new THREE.SphereGeometry(.025,8,8),new THREE.MeshStandardMaterial({color:0x080808,emissive:i%3?0x63ffc7:0xff6f5d,emissiveIntensity:1.4}));led.position.set(-1.05+(i%6)*.4,1.02,-.56);console.add(led);}console.userData={type:'core'};world.root.add(console);world.addCollider(26,27,2.8,1.3,{navBlock:true});world.interactables.push(console);GAME.exitObject=console;
    const notes=[[-24,0,'PA-01','ARCHIVE MEMO\nPinewood Closing System: staff accountability must return ZERO before security state can end.'],[0,0,'PA-02','ARCHIVE MEMO\nDo not manually interrupt the closing routine while an accountability fault is active.'],[18,8,'PA-03','ARCHIVE MEMO\nMall management requested the automated attendance feature remain undocumented.']];for(const[x,z,id,text]of notes){const n=makePickup('note',new THREE.Vector3(x,.18,z),id,text);world.root.add(n);world.interactables.push(n);}
  }
}

let GAME=null;

function createAttendantVisual(){
  const root=new THREE.Group(),rig=new THREE.Group();root.add(rig);
  const black=new THREE.MeshStandardMaterial({color:0x000000,roughness:.93,metalness:.02}),shell=new THREE.MeshBasicMaterial({color:0x020203,transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide}),eyeMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:5,roughness:.08});
  const hips=new THREE.Group();hips.position.y=.82;rig.add(hips);const torsoPivot=new THREE.Group();torsoPivot.position.y=1.48;rig.add(torsoPivot);const headPivot=new THREE.Group();headPivot.position.y=2.23;rig.add(headPivot);
  const pelvis=new THREE.Mesh(new THREE.CapsuleGeometry(.19,.3,5,10),black);pelvis.position.y=.02;hips.add(pelvis);const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.78,6,12),black);torso.position.y=.02;torso.scale.set(1,1.05,.82);torsoPivot.add(torso);
  const torsoShell=torso.clone();torsoShell.material=shell;torsoShell.scale.multiplyScalar(1.10);torsoPivot.add(torsoShell);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.19,14,14),black);head.scale.set(.92,1.16,.86);headPivot.add(head);const headShell=head.clone();headShell.material=shell;headShell.scale.multiplyScalar(1.14);headPivot.add(headShell);
  const eyes=new THREE.Group();eyes.position.set(0,.02,.165);headPivot.add(eyes);for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.027,10,10),eyeMat);e.position.set(.063*sx,.01,0);e.scale.set(1.15,1.55,.8);eyes.add(e);}
  function limb(len1,len2,rad1,rad2){const root=new THREE.Group(),upper=new THREE.Group(),knee=new THREE.Group();root.add(upper);const m1=new THREE.Mesh(new THREE.CylinderGeometry(rad1*.85,rad1,len1,9),black);m1.position.y=-len1/2;upper.add(m1);knee.position.y=-len1;upper.add(knee);const m2=new THREE.Mesh(new THREE.CylinderGeometry(rad2*.78,rad2,len2,9),black);m2.position.y=-len2/2;knee.add(m2);return{root,upper,knee};}
  const armL=limb(.62,.62,.065,.052),armR=limb(.62,.62,.065,.052);armL.root.position.set(-.29,.34,0);armR.root.position.set(.29,.34,0);torsoPivot.add(armL.root,armR.root);
  const legL=limb(.68,.70,.082,.065),legR=limb(.68,.70,.082,.065);legL.root.position.set(-.13,.02,0);legR.root.position.set(.13,.02,0);hips.add(legL.root,legR.root);
  // Long fingers. They hang lower than a normal human hand and catch flashlight silhouettes.
  const fingerMat=new THREE.MeshStandardMaterial({color:0x000000,roughness:1});for(const [arm,sx]of[[armL,-1],[armR,1]]){for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.009,.014,.25+Math.random()*.1,6),fingerMat);f.position.set(.015*sx*(i-1.5),-.65,0);f.rotation.z=sx*rand(.08,.22);arm.knee.add(f);}}
  // Fuzz halo: sparse charcoal particles around the silhouette.
  const pts=[];for(let i=0;i<420;i++){const y=rand(.05,2.5),bodyW=y>1.6?.32:y>.75?.24:.17;pts.push(rand(-bodyW,bodyW),y,rand(-.18,.18));}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const pm=new THREE.PointsMaterial({color:0x050507,size:.035,transparent:true,opacity:.55,depthWrite:false});const fuzz=new THREE.Points(geo,pm);rig.add(fuzz);
  // Glitch afterimages: dark translucent slices behind the body.
  const ghosts=[];for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(.92,2.65),new THREE.MeshBasicMaterial({color:0x030305,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));p.position.y=1.28;p.rotation.y=Math.PI;root.add(p);ghosts.push(p);}
  let phase=0,glitch=0,nextGlitch=rand(.7,2.2),lastSpeed=0;
  function update(dt,t,state,speed,fear,playerPos){
    const motion=clamp(speed/2.6,0,1),hunt=state==='hunt'?1:0;phase+=dt*(2.15+motion*4.7+hunt*1.3);lastSpeed=lerp(lastSpeed,motion,smooth(dt,5));const s=Math.sin(phase),s2=Math.sin(phase+Math.PI);
    hips.position.y=.82+Math.abs(Math.sin(phase*2))*.025*lastSpeed;hips.rotation.z=Math.sin(phase)*.035*lastSpeed;torsoPivot.rotation.z=-hips.rotation.z*.55;torsoPivot.rotation.y=Math.sin(phase)*.045*lastSpeed;
    legL.upper.rotation.x=s*.72*lastSpeed;legR.upper.rotation.x=s2*.72*lastSpeed;legL.knee.rotation.x=Math.max(0,-s)*.62*lastSpeed;legR.knee.rotation.x=Math.max(0,-s2)*.62*lastSpeed;
    armL.upper.rotation.x=-s*.68*lastSpeed-.12*hunt;armR.upper.rotation.x=-s2*.68*lastSpeed-.12*hunt;armL.knee.rotation.x=-.18-Math.max(0,s)*.24;armR.knee.rotation.x=-.18-Math.max(0,s2)*.24;
    headPivot.rotation.z=Math.sin(t*.72)*.035;headPivot.rotation.x=-.08+Math.sin(t*1.1)*.025;eyes.rotation.y=Math.sin(t*.55)*.05;
    eyeMat.emissiveIntensity=(4.6+fear*3.0+hunt*1.4)*(Math.random()<.035?.28:1);
    fuzz.rotation.y+=dt*.08;fuzz.position.x=Math.sin(t*9.1)*.008;pm.opacity=.38+fear*.25;
    nextGlitch-=dt;if(nextGlitch<=0){const chance=.15+fear*.5+hunt*.3;if(Math.random()<chance){glitch=rand(.07,.22);nextGlitch=rand(.45,1.6)-fear*.35;if(SAVE.settings.glitch==='full'&&SAVE.settings.jumpscares)UI.static(110);}else nextGlitch=.25;}
    const intensity=SAVE.settings.glitch==='reduced'?.45:1;
    if(glitch>0){glitch-=dt;rig.position.x=rand(-.12,.12)*intensity;rig.position.z=rand(-.08,.08)*intensity;rig.scale.set(1+rand(-.035,.06)*intensity,1+rand(-.05,.07)*intensity,1+rand(-.04,.04)*intensity);for(let i=0;i<ghosts.length;i++){ghosts[i].material.opacity=(.08-i*.018)*intensity;ghosts[i].position.x=rand(-.18,.18);ghosts[i].position.z=rand(-.12,.12);}}else{rig.position.x=lerp(rig.position.x,0,smooth(dt,12));rig.position.z=lerp(rig.position.z,0,smooth(dt,12));rig.scale.lerp(new THREE.Vector3(1,1,1),smooth(dt,12));for(const g of ghosts)g.material.opacity=lerp(g.material.opacity,0,smooth(dt,12));}
  }
  root.scale.setScalar(1.08);return{root,update};
}

class Attendant{
  constructor(scene,world){this.scene=scene;this.world=world;this.visual=createAttendantVisual();this.root=this.visual.root;scene.add(this.root);this.reset();}
  reset(){this.root.visible=false;this.root.position.set(999,-50,999);this.state='dormant';this.awake=false;this.timer=0;this.path=[];this.pathIndex=0;this.repath=0;this.target=new THREE.Vector3();this.lastHeard=new THREE.Vector3();this.decoyUntil=0;this.decoyPos=new THREE.Vector3();this.stunUntil=0;this.peekUntil=0;this.nextStalk=rand(5,9);this.prevPos=this.root.position.clone();this.speed=0;}
  awaken(){if(this.awake)return;this.awake=true;this.state='dormant';this.nextStalk=GAME.time+rand(2.5,4.5);}
  chooseHiddenCell(nearPos,min=7,max=16){const pc=this.world.cellFromWorld(nearPos.x,nearPos.z),candidates=[];for(const k of this.world.walk){const[x,z]=k.split(',').map(Number),md=Math.abs(x-pc.x)+Math.abs(z-pc.z);if(md<min||md>max||!this.world.navPassable(x,z))continue;const p=new THREE.Vector3(x,0,z);if(this.world.hasLOS(nearPos,p))continue;candidates.push({x,z});}return candidates.length?choose(candidates):null;}
  spawnHidden(nearPos){const c=this.chooseHiddenCell(nearPos);if(!c)return false;this.root.position.set(c.x,0,c.z);this.prevPos.copy(this.root.position);this.root.visible=true;return true;}
  stalk(playerPos){if(!this.spawnHidden(playerPos))return;this.state='stalk';this.peekUntil=GAME.time+rand(.8,1.55);this.root.lookAt(playerPos.x,0,playerPos.z);audio.whisper(0,.7);if(SAVE.settings.jumpscares)UI.static(180);}
  hear(pos,strength,type='generic'){
    if(!this.awake)return;
    if(type==='decoy'){this.decoyUntil=GAME.time+rand(4.5,6.8);this.decoyPos.copy(pos);this.lastHeard.copy(pos);if(!this.root.visible)this.spawnHidden(pos);this.state='investigate';this.timer=6.5;this.setPath(pos);return;}
    if(this.decoyUntil>GAME.time&&strength<.9)return;
    if(!this.root.visible){if(strength>.48&&Math.random()<strength*.75){this.spawnHidden(pos);this.state='investigate';this.timer=rand(3.5,6);this.lastHeard.copy(pos);this.setPath(pos);}return;}
    const d=this.world.navDistance(this.root.position,pos,46);if(!isFinite(d))return;const range=4+strength*28;if(d<=range){this.lastHeard.copy(pos);this.state=strength>.75?'hunt':'investigate';this.timer=this.state==='hunt'?rand(7,11):rand(4,7);this.setPath(pos);}
  }
  setPath(pos){const s=this.world.cellFromWorld(this.root.position.x,this.root.position.z),g=this.world.cellFromWorld(pos.x,pos.z);this.path=this.world.astar(s,g);this.pathIndex=this.path.length>1?1:0;}
  canSee(playerPos){if(!this.root.visible||GAME.playerHidden)return false;const dx=playerPos.x-this.root.position.x,dz=playerPos.z-this.root.position.z,dist=Math.hypot(dx,dz);if(dist>15)return false;if(dist<3.0)return this.world.hasLOS(this.root.position,playerPos);const fwd=new THREE.Vector3(0,0,1).applyQuaternion(this.root.quaternion).normalize(),to=new THREE.Vector3(dx,0,dz).normalize();if(fwd.dot(to)<.28)return false;return this.world.hasLOS(this.root.position,playerPos);}
  update(dt,t,playerPos,fear){
    if(!this.awake)return;this.nextStalk-=dt;
    if(!this.root.visible){if(this.nextStalk<=0){this.nextStalk=rand(7,12)-fear*2.5;if(Math.random()<.58)this.stalk(playerPos);}return;}
    const moved=this.root.position.distanceTo(this.prevPos);this.speed=moved/Math.max(dt,.0001);this.prevPos.copy(this.root.position);this.visual.update(dt,t,this.state,this.speed,fear,playerPos);
    if(GAME.time<this.stunUntil){this.state='stunned';return;}else if(this.state==='stunned'){this.state='search';this.timer=3;}
    if(this.state==='stalk'){
      this.root.lookAt(playerPos.x,0,playerPos.z);if(this.canSee(playerPos)){GAME.composure=clamp(GAME.composure-dt*.08,0,1);}if(GAME.time>=this.peekUntil){this.root.visible=false;this.root.position.set(999,-50,999);this.state='dormant';}return;
    }
    if(!GAME.playerHidden&&Math.hypot(this.root.position.x-playerPos.x,this.root.position.z-playerPos.z)<.72){GAME.die('The Attendant reached you. Pinewood has converted you to store property.');return;}
    if(this.canSee(playerPos)){this.state='hunt';this.timer=8;this.lastHeard.copy(playerPos);}
    this.timer-=dt;this.repath-=dt;
    if(this.state==='hunt'){
      let target=playerPos;if(this.decoyUntil>GAME.time)target=this.decoyPos;if(GAME.playerHidden)target=this.lastHeard;if(this.repath<=0){this.repath=.28;this.setPath(target);}if(this.timer<=0){this.state='search';this.timer=5;}
    }else if(this.state==='investigate'){
      const target=this.decoyUntil>GAME.time?this.decoyPos:this.lastHeard;if(this.repath<=0){this.repath=.5;this.setPath(target);}if(this.timer<=0){this.state='search';this.timer=rand(3,5);}
    }else if(this.state==='search'){
      if(this.timer<=0){this.root.visible=false;this.root.position.set(999,-50,999);this.state='dormant';this.nextStalk=rand(4,8);return;}if(this.repath<=0){this.repath=1.0;const c=this.world.cellFromWorld(this.lastHeard.x+rand(-5,5),this.lastHeard.z+rand(-5,5));if(this.world.navPassable(c.x,c.z))this.setPath(new THREE.Vector3(c.x,0,c.z));}
    }
    if(this.path.length&&this.pathIndex<this.path.length){const n=this.path[this.pathIndex],target=new THREE.Vector3(n.x,0,n.z),v=target.clone().sub(this.root.position),d=v.length();if(d<.12){this.pathIndex++;}else{const sp=this.state==='hunt'?2.55:this.state==='investigate'?1.55:1.25;v.normalize();this.root.position.addScaledVector(v,sp*dt);this.root.rotation.y=Math.atan2(v.x,v.z);}}
  }
}

class Game{
  constructor(){
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x020203);this.scene.fog=new THREE.Fog(0x030305,4,34);
    this.camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,.05,100);
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setSize(innerWidth,innerHeight);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(this.renderer.domElement);
    this.controls=new PointerControls(this.camera,this.renderer.domElement);this.scene.add(this.controls.yaw);this.controls.yaw.position.set(0,1.7,0);
    this.ambient=new THREE.HemisphereLight(0xc7d4e4,0x181318,.15);this.scene.add(this.ambient);
    this.flashlight=new THREE.SpotLight(0xfff5e9,4.2,17,Math.PI/8,.42,1.25);this.flashlight.castShadow=true;this.flashlight.shadow.mapSize.set(512,512);this.scene.add(this.flashlight);this.scene.add(this.flashlight.target);
    this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.scene,this.camera));this.bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.34,.55,.84);this.composer.addPass(this.bloom);
    this.world=new MallWorld(this.scene);this.attendant=new Attendant(this.scene,this.world);
    this.goreRoot=new THREE.Group();this.scene.add(this.goreRoot);this.gore=[];
    this.raycaster=new THREE.Raycaster();this.clock=new THREE.Clock();this.modal=true;this.running=false;this.dead=false;this.won=false;this.levelIndex=0;this.time=0;this.stepTravel=0;this.stamina=1;this.breath=1;this.composure=1;this.keys=0;this.decoys=0;this.breakers=0;this.tapes=0;this.flashlightOn=true;this.flashFlicker=0;this.noise=0;this.interactTarget=null;this.playerHidden=false;this.hideTransition=null;this.hiddenYaw=0;this.hiddenPitch=0;this.decoyObjs=[];this.exitObject=null;this.storyQueue=[];this.nextAnnouncement=20;this.pathTimer=0;this.pathDistance=Infinity;this.near=0;this.coughReady=true;this.returnAfterJournal='title';
    window.addEventListener('resize',()=>this.resize());this.applySettings();requestAnimationFrame(()=>this.loop());
  }
  applySettings(){this.controls.speed=SAVE.settings.sensitivity;this.renderer.toneMappingExposure=SAVE.settings.brightness;const q=SAVE.settings.quality;this.renderer.setPixelRatio(q==='high'?Math.min(devicePixelRatio,1.75):q==='medium'?Math.min(devicePixelRatio,1.25):1);this.renderer.shadowMap.enabled=q!=='low';this.bloom.strength=q==='low'?.17:q==='medium'?.27:.34;audio.apply();}
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.composer.setSize(innerWidth,innerHeight);}
  resetState(){this.running=false;this.dead=false;this.won=false;this.time=0;this.stepTravel=0;this.stamina=1;this.breath=1;this.composure=1;this.keys=0;this.decoys=0;this.breakers=0;this.tapes=0;this.flashlightOn=true;this.flashFlicker=0;this.noise=0;this.interactTarget=null;this.playerHidden=false;this.hideTransition=null;this.decoyObjs=[];this.exitObject=null;this.storyQueue=[];this.nextAnnouncement=rand(18,26);this.pathTimer=0;this.pathDistance=Infinity;this.near=0;this.coughReady=true;$('peekMask').classList.remove('show');this.attendant.reset();this.clearGore();}
  async startChapter(idx){
    idx=clamp(idx,0,LEVELS.length-1);this.levelIndex=idx;UI.show('loadingScreen');$('loadText').textContent='Verifying emergency route…';$('loadFill').style.width='22%';if(preloadPromise)await preloadPromise;$('loadFill').style.width='48%';
    this.world.clear();this.resetState();carveChapter(this.world,idx);await this.world.buildGeometry();$('loadFill').style.width='68%';await decorateLevel(this.world,idx);$('loadFill').style.width='92%';
    const starts=[new THREE.Vector3(-24,1.70,0),new THREE.Vector3(-23,1.70,0),new THREE.Vector3(-25,1.70,0)];this.controls.yaw.position.copy(starts[idx]);this.controls.yaw.rotation.y=-Math.PI/2;this.controls.pitch.rotation.x=0;
    SAVE.started=true;SAVE.lastChapter=idx;save();this.updateMenu();this.updateHUD();$('loadFill').style.width='100%';
    $('chapterKicker').textContent='WORK ORDER';$('chapterTitle').textContent=LEVELS[idx].name;$('chapterCopy').textContent=LEVELS[idx].intro+'\n\n'+LEVELS[idx].goal;$('chapterStartBtn').textContent='Begin Shift';$('chapterStartBtn').onclick=()=>this.beginPlay();$('chapterQuitBtn').style.display='inline-block';UI.show('chapterScreen');
  }
  beginPlay(){UI.hideAll();audio.resume();audio.setPaused(false);this.running=true;this.modal=false;this.controls.lock();this.queueStory(.7,'radio','DISPATCH',this.startLine());}
  startLine(){return[
    'Pinewood dispatch to contractor fourteen. Copy arrival. Restore emergency circuits A through C, then use the east freight elevator. Keep your radio open.',
    'Dispatch. I have you below grade. That is not where the freight car was supposed to go. Find the service relays. I am checking the original work order now.',
    'Dispatch. If you can still hear me, the east-wing PA room is beyond the old records corridor. Find the Last Shift tapes before you touch the closing system.'
  ][this.levelIndex];}
  pause(){if(this.dead||this.won||this.modal)return;this.running=false;UI.show('pauseScreen');}
  resume(){UI.hideAll();audio.resume();audio.setPaused(false);this.running=true;this.modal=false;this.controls.lock();}
  quit(){this.running=false;this.dead=false;this.won=false;this.controls.unlock();$('peekMask').classList.remove('show');this.playerHidden=false;this.hideTransition=null;UI.show('titleScreen');this.updateMenu();}
  restart(){this.startChapter(this.levelIndex);}
  openJournal(fromPause=false){this.returnAfterJournal=(this.running||fromPause)?'pause':'title';if(this.running)this.pause();this.rebuildJournal();UI.show('journalScreen');}
  closeJournal(){if(this.returnAfterJournal==='pause')UI.show('pauseScreen');else UI.show('titleScreen');}
  queueStory(delay,kind,who,text){this.storyQueue.push({at:this.time+delay,kind,who,text});this.storyQueue.sort((a,b)=>a.at-b.at);}
  updateStory(){while(this.storyQueue.length&&this.storyQueue[0].at<=this.time){const l=this.storyQueue.shift();if(l.kind==='radio')audio.radio();else audio.chime();UI.subtitle(l.who,l.text,l.kind,l.kind==='log'?4400:3400);}}
  playRandomIntercom(){const sets=[
    ['Attention shoppers. Pinewood is now closed. Employees remain until released.','Cleanup requested at the fountain. Do not use the nearest exit.','Would contractor fourteen please report to Customer Service.'],
    ['Staff reminder: the north stairwell is not an approved exit.','Security inspection in progress. Remain where you can be counted.','Contractor fourteen, Dispatch requests that you stop moving.'],
    ['Closing checklist incomplete. One staff member remains unaccounted for.','The east wing will remain open until all employees have clocked out.','Thank you for your service. Please proceed to the attendance terminal.']
  ];audio.chime();UI.subtitle('INTERCOM',choose(sets[this.levelIndex]),'intercom',3600);this.nextAnnouncement=this.time+rand(18,30);}
  emitSound(pos,strength,type='generic'){this.noise=clamp(this.noise+strength*.4,0,1);this.attendant.hear(pos.clone(),strength,type);}
  tryMove(dx,dz){const p=this.controls.yaw.position;const nx=p.x+dx,nz=p.z+dz;if(this.world.canStand(nx,p.z))p.x=nx;if(this.world.canStand(p.x,nz))p.z=nz;p.y=1.7;}
  toggleFlashlight(){if(this.modal)return;this.flashlightOn=!this.flashlightOn;audio.beep();}
  updateInteraction(){
    if(this.playerHidden||this.hideTransition){this.interactTarget=this.hideTransition?.cab||this.hideCab;UI.hint(this.hideTransition?'…':this.playerHidden?'E  Leave cabinet':'');return;}
    this.interactTarget=null;this.raycaster.setFromCamera({x:0,y:0},this.camera);const hits=this.raycaster.intersectObjects(this.world.interactables,true);for(const h of hits){if(h.distance>2.45)break;let o=h.object;while(o&&o!==this.scene&&!o.userData?.type)o=o.parent;if(o?.userData?.type){this.interactTarget=o;break;}}
    const o=this.interactTarget;if(!o){UI.hint('');return;}const t=o.userData.type;if(t==='breaker')UI.hint(o.userData.on?'Circuit online':'E  Restore circuit '+o.userData.id);else if(t==='door')UI.hint(`E  ${o.userData.open?'Lower':'Raise'} ${o.userData.label}`);else if(t==='cabinet')UI.hint('E  Hide in cabinet');else if(t==='key')UI.hint('E  Take '+o.userData.label);else if(t==='decoy')UI.hint('E  Take '+o.userData.label);else if(t==='note'||t==='tape')UI.hint('E  Recover '+o.userData.label);else if(t==='exit')UI.hint(this.breakers<LEVELS[this.levelIndex].breakers?'Elevator has no emergency power':'E  Call freight elevator');else if(t==='core')UI.hint(this.tapes<3?'Three Last Shift tapes are required':'E  End the closing routine');
  }
  interact(){
    if(this.modal||this.dead||this.won||!this.running)return;if(this.hideTransition)return;if(this.playerHidden){this.exitCabinet();return;}const o=this.interactTarget;if(!o)return;const t=o.userData.type,p=this.controls.yaw.position.clone();
    if(t==='breaker'){
      if(o.userData.on)return;o.userData.on=true;o.userData.lamp.material.emissive.setHex(0x55ff99);this.breakers++;audio.slam();this.emitSound(p,.78,'breaker');UI.flash();this.attendant.awaken();
      if(this.breakers===1){this.queueStory(.8,'radio','DISPATCH',this.levelIndex===0?'Good. I have one leg of the emergency ring. I also have movement on a camera that should not exist. Keep working.':'First relay is up. I found your work order. It was filed in 1997.');this.queueStory(2.3,'intercom','INTERCOM',this.levelIndex===0?'Attention shoppers. Closing has been extended. Employees remain at their stations.':'Maintenance staff must report to Security for evaluation.');}
      if(this.breakers>=LEVELS[this.levelIndex].breakers){this.queueStory(.8,'radio','DISPATCH',this.levelIndex===0?'All three circuits are stable. Freight elevator should answer now. Get out. Do not stop for the PA.':'Both relays are online. North stairwell has power. Find the security keycard and go.');}
    }else if(t==='key'){
      if(o.userData.collected)return;o.userData.collected=true;o.visible=false;this.keys++;audio.pickup();this.emitSound(p,.20,'pickup');UI.hint('Key acquired');
      if(this.levelIndex===0)this.queueStory(.6,'intercom','INTERCOM','Employee key inventory discrepancy detected. Please return borrowed property to Security.');
    }else if(t==='decoy'){
      if(o.userData.collected)return;o.userData.collected=true;o.visible=false;this.decoys++;audio.pickup();UI.hint('Decoy acquired • Q to throw');
    }else if(t==='note'||t==='tape'){
      if(o.userData.collected)return;o.userData.collected=true;o.visible=false;SAVE.journal[o.userData.label]=o.userData.text;save();audio.pickup();if(t==='tape')this.tapes++;UI.subtitle('THE LAST SHIFT',o.userData.text,'log',5200);this.composure=clamp(this.composure+.12,0,1);
      if(this.levelIndex===2&&this.tapes===3){this.queueStory(.5,'radio','DISPATCH','I heard all three recordings. The last one is right. Do not cut power. End the shift from PA control.');this.queueStory(2.0,'intercom','INTERCOM','All employees must remain until accountability reaches zero.');}
    }else if(t==='door'){
      if(this.levelIndex===1&&this.exitObject===o&&this.breakers<2){UI.hint('The stairwell motor has no power. Restore both relays.');audio.beep();return;}
      if(o.userData.locked){if(this.keys<=0){UI.hint('Locked. A service key is required.');audio.thud(.12);this.emitSound(p,.3,'rattle');return;}this.keys--;o.userData.locked=false;UI.hint('Unlocked.');audio.pickup();}
      o.userData.open=!o.userData.open;if(o.userData.open)audio.slam();else audio.thud(.28);this.emitSound(o.position.clone(),.8,'door');
      if(this.levelIndex===1&&this.exitObject===o&&o.userData.open){this.queueStory(.4,'radio','DISPATCH','Go. North stairwell. I am losing your signal.');setTimeout(()=>{if(!this.dead)this.winChapter();},1500);}
    }else if(t==='cabinet')this.enterCabinet(o);
    else if(t==='exit'){if(this.breakers<LEVELS[this.levelIndex].breakers){audio.beep();UI.hint('No emergency power.');return;}this.startElevator(o);}
    else if(t==='core'){if(this.tapes<3){audio.beep();UI.hint('The attendance terminal rejects the command. Three shift tapes are missing.');return;}this.endClosingRoutine(o);}
    this.updateHUD();
  }
  enterCabinet(cab){const saved=this.controls.yaw.position.clone(),savedYaw=this.controls.yaw.rotation.y,savedPitch=this.controls.pitch.rotation.x,target=cab.localToWorld(new THREE.Vector3(0,1.70,.04));this.hideCab=cab;this.hideTransition={mode:'enter',cab,t:0,saved,savedYaw,savedPitch,target,targetYaw:cab.rotation.y+Math.PI};this.emitSound(saved,.13,'cabinet');audio.thud(.09);}
  exitCabinet(){if(!this.playerHidden||!this.hideCab)return;const cab=this.hideCab;this.playerHidden=false;$('peekMask').classList.remove('show');this.hideTransition={mode:'exit',cab,t:0,saved:this.hideSaved.clone(),savedYaw:this.hideSavedYaw,savedPitch:this.hideSavedPitch,start:this.controls.yaw.position.clone(),startYaw:this.controls.yaw.rotation.y};audio.thud(.08);this.emitSound(cab.position.clone(),.18,'cabinet');}
  updateHide(dt){const h=this.hideTransition;if(!h){if(this.playerHidden){const dy=THREE.MathUtils.euclideanModulo(this.controls.yaw.rotation.y-this.hiddenYaw+Math.PI,TAU)-Math.PI;this.controls.yaw.rotation.y=this.hiddenYaw+clamp(dy,-.32,.32);this.controls.pitch.rotation.x=clamp(this.controls.pitch.rotation.x,this.hiddenPitch-.24,this.hiddenPitch+.24);}return;}h.t+=dt;const c=h.cab;
    if(h.mode==='enter'){const t=h.t;let door=0;if(t<.32)door=clamp(t/.32,0,1);else if(t<.74)door=1;else door=1-clamp((t-.74)/.46,0,1);setCabinetDoors(c,door);const mt=clamp((t-.22)/.56,0,1),e=mt*mt*(3-2*mt);this.controls.yaw.position.lerpVectors(h.saved,h.target,e);this.controls.yaw.rotation.y=lerp(h.savedYaw,h.targetYaw,e);this.controls.pitch.rotation.x=lerp(h.savedPitch,0,e);if(t>=1.22){setCabinetDoors(c,0);this.hideTransition=null;this.playerHidden=true;this.hideSaved=h.saved;this.hideSavedYaw=h.savedYaw;this.hideSavedPitch=h.savedPitch;this.hiddenYaw=h.targetYaw;this.hiddenPitch=0;$('peekMask').classList.add('show');}}
    else{const t=h.t;let door=t<.30?clamp(t/.30,0,1):t<.72?1:1-clamp((t-.72)/.38,0,1);setCabinetDoors(c,door);const mt=clamp((t-.22)/.55,0,1),e=mt*mt*(3-2*mt);this.controls.yaw.position.lerpVectors(h.start,h.saved,e);this.controls.yaw.rotation.y=lerp(h.startYaw,h.savedYaw,e);this.controls.pitch.rotation.x=lerp(0,h.savedPitch,e);if(t>=1.12){setCabinetDoors(c,0);this.controls.yaw.position.copy(h.saved);this.controls.yaw.rotation.y=h.savedYaw;this.controls.pitch.rotation.x=h.savedPitch;this.hideTransition=null;this.hideCab=null;}}
  }
  throwDecoy(){if(this.modal||!this.running||this.dead||this.playerHidden||this.hideTransition)return;if(this.decoys<=0){UI.hint('No decoys. Search the stores.');audio.beep();return;}this.decoys--;const p=this.controls.yaw.position.clone(),f=new THREE.Vector3();this.camera.getWorldDirection(f);f.y=0;f.normalize();const mat=new THREE.MeshStandardMaterial({color:0x222328,emissive:0xb52d68,emissiveIntensity:.7,roughness:.4,metalness:.2}),m=new THREE.Mesh(new THREE.BoxGeometry(.16,.10,.12),mat);m.position.copy(p).add(f.clone().multiplyScalar(.55));m.position.y=1.25;this.world.root.add(m);this.decoyObjs.push({mesh:m,vel:f.multiplyScalar(6).add(new THREE.Vector3(0,2.0,0)),state:'fly',life:7,pulse:0});audio.thud(.12);this.emitSound(p,.18,'throw');this.updateHUD();}
  updateDecoys(dt){const alive=[];for(const d of this.decoyObjs){if(d.state==='fly'){d.vel.y-=9.2*dt;const old=d.mesh.position.clone();d.mesh.position.addScaledVector(d.vel,dt);const c=this.world.cellFromWorld(d.mesh.position.x,d.mesh.position.z);if(d.mesh.position.y<=.10||!this.world.walkableCell(c.x,c.z)){d.mesh.position.y=.10;if(!this.world.walkableCell(c.x,c.z))d.mesh.position.x=old.x,d.mesh.position.z=old.z;d.state='active';d.life=6;d.pulse=0;audio.slam();this.emitSound(d.mesh.position,1,'decoy');}d.mesh.rotation.x+=dt*4;d.mesh.rotation.y+=dt*6;}else{d.life-=dt;d.pulse-=dt;d.mesh.material.emissiveIntensity=Math.random()<.5?.9:.18;if(d.pulse<=0){d.pulse=.45;audio.beep();this.emitSound(d.mesh.position,.72,'decoy');if(this.attendant.root.visible&&this.world.navDistance(this.attendant.root.position,d.mesh.position,8)<3)this.attendant.stunUntil=Math.max(this.attendant.stunUntil,this.time+.65);}if(d.life<=0){this.world.root.remove(d.mesh);continue;}}alive.push(d);}this.decoyObjs=alive;}
  startElevator(o){if(o.userData.state!=='idle')return;o.userData.state='opening';o.userData.timer=0;audio.chime();this.emitSound(o.position.clone(),.75,'elevator');}
  updateElevator(dt){const e=this.exitObject;if(!e||e.userData.type!=='exit'||e.userData.state==='idle')return;e.userData.timer+=dt;if(e.userData.state==='opening'){const t=clamp(e.userData.timer/.9,0,1);e.userData.left.position.z=-.58-t*.58;e.userData.right.position.z=.58+t*.58;if(t>=1){e.userData.state='waiting';e.userData.timer=0;UI.hint('Freight elevator open.');}}else if(e.userData.state==='waiting'&&e.userData.timer>1.2){e.userData.state='closing';e.userData.timer=0;}else if(e.userData.state==='closing'){const t=clamp(e.userData.timer/.8,0,1);e.userData.left.position.z=-1.16+t*.58;e.userData.right.position.z=1.16-t*.58;if(t>=1){e.userData.state='ride';e.userData.timer=0;UI.static(500);}}else if(e.userData.state==='ride'&&e.userData.timer>1.0)this.winChapter();}
  endClosingRoutine(core){this.running=false;audio.chime();UI.static(480);this.attendant.stunUntil=this.time+999;UI.subtitle('INTERCOM','Accountability override received.','intercom',1800);setTimeout(()=>{audio.chime();UI.subtitle('INTERCOM','All staff accounted for. Pinewood Mall is now closed.','intercom',4200);},700);setTimeout(()=>this.winChapter(),2600);}
  spawnGore(pos){this.clearGore();const mats=[0x700710,0x33040a,0x15311f,0x1d0f17].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.62,transparent:true}));for(let i=0;i<90;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(rand(.025,.07),7,7),choose(mats));mesh.position.set(pos.x,1.35,pos.z);const v=new THREE.Vector3(rand(-1,1),rand(.15,1.2),rand(-1,1)).normalize().multiplyScalar(rand(2,7));this.goreRoot.add(mesh);this.gore.push({mesh,v,life:rand(1.2,2.5)});}}
  updateGore(dt){for(const g of this.gore){g.life-=dt;g.v.y-=9.2*dt;g.mesh.position.addScaledVector(g.v,dt);if(g.mesh.position.y<.03){g.mesh.position.y=.03;g.v.y=Math.abs(g.v.y)*.25;g.v.x*=.65;g.v.z*=.65;}if(g.life<.5){g.mesh.material.opacity=clamp(g.life/.5,0,1);}}this.gore=this.gore.filter(g=>g.life>0);}
  clearGore(){for(const g of this.gore)this.goreRoot.remove(g.mesh);this.gore=[];}
  die(reason){if(this.dead||this.won)return;this.dead=true;this.running=false;this.controls.unlock();audio.rip();UI.static(430);$('blood').classList.remove('show');void $('blood').offsetWidth;$('blood').classList.add('show');this.spawnGore(this.controls.yaw.position);$('deathCopy').textContent=reason;setTimeout(()=>UI.show('deathScreen'),650);}
  winChapter(){if(this.won||this.dead)return;this.won=true;this.running=false;this.controls.unlock();SAVE.unlockedChapter=Math.max(SAVE.unlockedChapter,Math.min(LEVELS.length-1,this.levelIndex+1));SAVE.lastChapter=Math.min(LEVELS.length-1,this.levelIndex+1);save();this.updateMenu();const next=this.levelIndex+1<LEVELS.length;if(next){$('chapterKicker').textContent='SHIFT CHECKPOINT';$('chapterTitle').textContent='Chapter complete';$('chapterCopy').textContent=this.levelIndex===0?'The freight car closes around you. The floor indicator does not rise. It counts downward.':'You force the stairwell gate and climb toward the abandoned east wing. The Dispatcher’s signal returns in fragments.';$('chapterStartBtn').textContent='Continue';$('chapterStartBtn').onclick=()=>this.startChapter(this.levelIndex+1);$('chapterQuitBtn').style.display='inline-block';UI.show('chapterScreen');}else{const all=Array.from({length:9},(_,i)=>`LS-${String(i+1).padStart(2,'0')}`).every(id=>SAVE.journal[id]);$('chapterKicker').textContent='END OF SHIFT';$('chapterTitle').textContent=all?'EVERYONE CLOCKED OUT':'PINEWOOD IS CLOSED';$('chapterCopy').textContent=all?'You enter the Last Shift names into the attendance terminal one by one, including the contractor who never left. The PA clicks. For the first time, the mall does not announce another closing. In the hallway, two white eyes go dark.\n\nYou leave through the employee entrance at dawn. The work order vanishes from your phone before you reach the parking lot.':'The attendance counter reaches zero and the security state releases. The white eyes stop at the far end of the corridor, motionless. You leave Pinewood before sunrise.\n\nLater, you realize three Last Shift recordings are still somewhere inside. The next night, at 10:00 PM, your phone receives a work order.';$('chapterStartBtn').textContent='Return to Title';$('chapterStartBtn').onclick=()=>this.quit();$('chapterQuitBtn').style.display='none';UI.show('chapterScreen');}}
  updateHUD(){const l=LEVELS[this.levelIndex];$('chapterName').textContent=l?.name||'Pinewood Mall';let obj='';if(this.levelIndex<2)obj=this.breakers<l.breakers?`Restore relays ${this.breakers}/${l.breakers}`:this.levelIndex===0?'Reach the freight elevator':'Open the north stairwell';else obj=this.tapes<3?`Recover Last Shift tapes ${this.tapes}/3`:'Reach PA control and end the shift';$('objective').textContent='OBJECTIVE  '+obj;$('inventory').textContent=`Keys ${this.keys}   •   Decoys ${this.decoys}   •   Flashlight ${this.flashlightOn?'ON':'OFF'}`;$('staminaFill').style.width=`${this.stamina*100}%`;$('breathFill').style.width=`${this.breath*100}%`;$('sanityFill').style.width=`${this.composure*100}%`;$('sanityFill').classList.toggle('danger',this.composure<.35);}
  updateMenu(){$('continueBtn').disabled=!SAVE.started;$('chaptersList').innerHTML=LEVELS.map((l,i)=>`<div class="chapterCard"><b>${l.name}</b><div class="tiny">${l.intro}</div><div class="buttons"><button data-ch="${i}" ${i>SAVE.unlockedChapter?'disabled':''}>${i>SAVE.unlockedChapter?'Locked':'Play'}</button></div></div>`).join('');document.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>this.startChapter(+b.dataset.ch));}
  rebuildJournal(){const ids=[...Object.keys(SAVE.journal)].sort();$('journalList').innerHTML=ids.length?ids.map(id=>`<div class="chapterCard"><b>${id}</b><div class="tiny" style="white-space:pre-line;color:#d1d3d7">${SAVE.journal[id]}</div></div>`).join(''):'No Last Shift material recovered yet.';}
  updateNeon(dt){for(const sign of this.world.neonSigns){const n=sign.userData.neon;if(!n)continue;n.next-=dt;if(n.next<=0&&n.burst<=0){n.burst=rand(.12,.72);n.next=rand(4.5,15);}if(n.burst>0){n.burst-=dt;const on=Math.random()>.38;n.mat.emissiveIntensity=on?n.baseEmissive*rand(.55,1.08):rand(.02,.18);n.light.intensity=on?n.baseLight*rand(.35,1.0):0;}else{const pulse=.93+Math.sin(this.time*2.2+n.phase)*.07;n.mat.emissiveIntensity=n.baseEmissive*pulse;n.light.intensity=n.baseLight*pulse;}}}
  update(dt){
    this.time+=dt;this.updateNeon(dt);this.noise=clamp(this.noise-dt*.48,0,1);this.updateStory();if(this.time>this.nextAnnouncement)this.playRandomIntercom();this.updateHide(dt);this.updateDecoys(dt);this.updateElevator(dt);
    const p=this.controls.yaw.position;this.flashlight.position.copy(p);const dir=new THREE.Vector3();this.camera.getWorldDirection(dir);this.flashlight.target.position.copy(p).add(dir.clone().multiplyScalar(3));
    this.pathTimer-=dt;if(this.pathTimer<=0){this.pathTimer=.22;this.pathDistance=this.attendant.root.visible?this.world.navDistance(this.attendant.root.position,p,60):Infinity;}this.near=isFinite(this.pathDistance)?clamp((24-this.pathDistance)/24,0,1):0;
    const holding=keysDown.c&&!this.playerHidden&&!this.hideTransition;if(holding){this.breath-=dt*.30;if(this.breath<=0&&this.coughReady){this.breath=0;this.coughReady=false;this.emitSound(p,1,'cough');audio.whisper(0,.9);UI.hint('You gasp for air.');setTimeout(()=>this.coughReady=true,1400);}}else this.breath+=dt*.19;this.breath=clamp(this.breath,0,1);
    const moving=!this.playerHidden&&!this.hideTransition&&(keysDown.w||keysDown.a||keysDown.s||keysDown.d),sprint=keysDown.shift&&moving&&!holding&&this.stamina>.06;if(sprint)this.stamina-=dt*.34;else this.stamina+=dt*(moving?.18:.28);this.stamina=clamp(this.stamina,0,1);
    const baseSpeed=holding?1.45:2.35,speed=baseSpeed*(sprint?1.68:1);if(moving){const f=new THREE.Vector3(),r=new THREE.Vector3();this.camera.getWorldDirection(f);f.y=0;f.normalize();r.crossVectors(f,new THREE.Vector3(0,1,0)).normalize();let mf=(keysDown.w?1:0)-(keysDown.s?1:0),mr=(keysDown.d?1:0)-(keysDown.a?1:0),mag=Math.hypot(mf,mr)||1;mf/=mag;mr/=mag;this.tryMove((f.x*mf+r.x*mr)*speed*dt,(f.z*mf+r.z*mr)*speed*dt);this.stepTravel+=speed*dt;const stepLen=sprint?.94:holding?1.28:1.12;while(this.stepTravel>=stepLen){this.stepTravel-=stepLen;audio.step(sprint,holding);const loud=holding?.11:sprint?.72:.32;this.emitSound(p,loud,'step');}}else this.stepTravel=0;
    // True path-distance fear only. Walls genuinely protect the player from proximity effects.
    const darkness=this.flashlightOn?.34:.72;this.composure-=dt*(darkness*.008+this.near*this.near*.052+(sprint?.008:0));if(this.near<.08&&this.flashlightOn)this.composure+=dt*.014;this.composure=clamp(this.composure,0,1);const fear=clamp(this.near*.9+(1-this.composure)*.55+this.noise*.25,0,1);
    const fwd=new THREE.Vector3();this.camera.getWorldDirection(fwd);fwd.y=0;fwd.normalize();const right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize();let pan=0;if(this.attendant.root.visible){const ta=this.attendant.root.position.clone().sub(p);ta.y=0;if(ta.lengthSq()>.001){ta.normalize();pan=clamp(ta.dot(right),-1,1);}}audio.tick(dt,this.near,fear,pan);
    if(this.flashlightOn&&this.near>.72&&Math.random()<dt*(1+(this.near-.72)*8))this.flashFlicker=Math.max(this.flashFlicker,.14+this.near*.15);this.flashFlicker=Math.max(0,this.flashFlicker-dt);this.flashlight.intensity=this.flashlightOn?(this.flashFlicker>0&&Math.random()<.48?0:4.2*SAVE.settings.brightness):0;
    $('vignette').style.opacity=String(clamp(.35+(1-this.composure)*.42+this.near*.15,.35,.88));if(this.composure<.28&&SAVE.settings.glitch==='full')$('static').classList.add('on');else if(!$('static').dataset.forced)$('static').classList.remove('on');
    for(const h of this.world.lights){let m=.82+.18*Math.sin(this.time*(2+(h.seed%3))+(h.seed%10));if(this.breakers===0)m*=.55;if(Math.random()<dt*.008)m*=.1;h.light.intensity=h.base*m*SAVE.settings.brightness;}
    for(const d of this.world.dynamicDoors){d.userData.anim=lerp(d.userData.anim,d.userData.open?1:0,smooth(dt,8));d.userData.slab.position.y=1.32+d.userData.anim*2.7;if(d.userData.collider)d.userData.collider.disabled=d.userData.anim>.72;}
    for(const o of this.world.interactables){if(['key','decoy','note','tape'].includes(o.userData.type)&&!o.userData.collected){o.position.y=o.userData.floatBase+Math.sin(this.time*2+o.userData.phase)*.055;o.rotation.y+=dt*.65;}}
    this.attendant.update(dt,this.time,p,fear);this.updateInteraction();this.updateHUD();
  }
  loop(){const dt=Math.min(.04,this.clock.getDelta());this.updateGore(dt);if(this.running&&!this.modal&&!this.dead&&!this.won)this.update(dt);this.composer.render();requestAnimationFrame(()=>this.loop());}
}

let preloadPromise=null;
function syncSettingsUI(){
  $('brightRange').value=SAVE.settings.brightness;$('volumeRange').value=SAVE.settings.volume;$('musicRange').value=SAVE.settings.music;$('sensRange').value=SAVE.settings.sensitivity;$('qualitySelect').value=SAVE.settings.quality;$('glitchSelect').value=SAVE.settings.glitch;
  $('brightVal').textContent=(+SAVE.settings.brightness).toFixed(2);$('volumeVal').textContent=(+SAVE.settings.volume).toFixed(2);$('musicVal').textContent=(+SAVE.settings.music).toFixed(2);$('sensVal').textContent=(+SAVE.settings.sensitivity).toFixed(4);$('jumpsBtn').textContent=`Jumpscares: ${SAVE.settings.jumpscares?'ON':'OFF'}`;$('muzakBtn').textContent=`Muzak: ${SAVE.settings.muzak?'ON':'OFF'}`;
}
function bindUI(){
  $('newBtn').onclick=()=>{const settings={...SAVE.settings};SAVE=deepClone(DEFAULT_SAVE);SAVE.settings=settings;save();GAME.startChapter(0);};
  $('continueBtn').onclick=()=>GAME.startChapter(clamp(SAVE.lastChapter||0,0,LEVELS.length-1));
  $('chaptersBtn').onclick=()=>{GAME.updateMenu();UI.show('chaptersScreen');};$('settingsBtn').onclick=()=>{syncSettingsUI();UI.show('settingsScreen');};$('journalBtn').onclick=()=>{GAME.returnAfterJournal='title';GAME.rebuildJournal();UI.show('journalScreen');};$('creditsBtn').onclick=()=>UI.show('creditsScreen');
  $('resumeBtn').onclick=()=>GAME.resume();$('pauseJournalBtn').onclick=()=>GAME.openJournal(true);$('restartBtn').onclick=()=>GAME.restart();$('quitBtn').onclick=()=>GAME.quit();$('deathRestartBtn').onclick=()=>GAME.restart();$('deathQuitBtn').onclick=()=>GAME.quit();$('chapterQuitBtn').onclick=()=>GAME.quit();
  document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{if(b.closest('#journalScreen'))GAME.closeJournal();else UI.show('titleScreen');});
  $('brightRange').oninput=e=>{SAVE.settings.brightness=+e.target.value;$('brightVal').textContent=SAVE.settings.brightness.toFixed(2);save();GAME.applySettings();};
  $('volumeRange').oninput=e=>{SAVE.settings.volume=+e.target.value;$('volumeVal').textContent=SAVE.settings.volume.toFixed(2);save();GAME.applySettings();};
  $('musicRange').oninput=e=>{SAVE.settings.music=+e.target.value;$('musicVal').textContent=SAVE.settings.music.toFixed(2);save();GAME.applySettings();};
  $('sensRange').oninput=e=>{SAVE.settings.sensitivity=+e.target.value;$('sensVal').textContent=SAVE.settings.sensitivity.toFixed(4);save();GAME.applySettings();};
  $('qualitySelect').onchange=e=>{SAVE.settings.quality=e.target.value;save();GAME.applySettings();};$('glitchSelect').onchange=e=>{SAVE.settings.glitch=e.target.value;save();};
  $('jumpsBtn').onclick=()=>{SAVE.settings.jumpscares=!SAVE.settings.jumpscares;save();syncSettingsUI();};$('muzakBtn').onclick=()=>{SAVE.settings.muzak=!SAVE.settings.muzak;save();syncSettingsUI();};
  $('resetBtn').onclick=()=>{const settings={...SAVE.settings};localStorage.removeItem(SAVE_KEY);SAVE=deepClone(DEFAULT_SAVE);SAVE.settings=settings;save();GAME.updateMenu();GAME.rebuildJournal();syncSettingsUI();$('assetStatus').textContent='Save progress reset. CC0 asset cache unchanged.';};
}

async function boot(){
  GAME=new Game();syncSettingsUI();bindUI();GAME.updateMenu();GAME.rebuildJournal();UI.show('titleScreen');preloadPromise=assets.preload();try{await preloadPromise;}catch(e){console.warn('Asset preload completed with fallbacks',e);}GAME.applySettings();
}
boot();
