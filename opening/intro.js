import * as THREE from '../vendor/three/build/three.module.js';
import {makeOpeningScene} from './scene.js?v=42';
import {HumanCameraRig} from './camera.js?v=42';
import {OpeningAmbience} from './ambience.js?v=35';
const $=id=>document.getElementById(id);
const query=new URLSearchParams(location.search);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const sentences=text=>text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(x=>x.trim()).filter(Boolean)||[text];
const scriptURL=new URL('./script.json',import.meta.url);
const voiceManifestURL=new URL('./audio/manifest.json',import.meta.url);
let bypass=false,active=null,resources=null;
async function loadResources(){
 if(!resources)resources=Promise.all([
  fetch(scriptURL).then(r=>{if(!r.ok)throw Error('Missing local intro script');return r.json()}),
  fetch(voiceManifestURL).then(r=>r.ok?r.json():null).catch(()=>null)
 ]);
 return resources;
}
class Intro{
 constructor(script,voices,{preview=false}={}){
  this.lines=script.lines;this.voices=voices;this.preview=preview;
  // Isolate the modal preview from underlying title/settings controls while active.
  this.returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  this.root=$('pwm-opening');this.root.hidden=false;this.root.classList.add('pwm-active');
  this.backgroundScreens=[...document.querySelectorAll('.screen')].map(el=>({el,inert:el.inert}));
  for(const {el} of this.backgroundScreens)el.inert=true;
  this.index=-1;this.elapsed=0;this.wait=0;this.finished=false;this.paused=false;this.muted=false;this.captioned=true;
  this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.canvasSlot=this.root.querySelector('.pwm-render');this.last=performance.now();
  this.ambience=new OpeningAmbience();
  this.eyeRig=new HumanCameraRig();this.lastCameraPose=null;
  this.resize=()=>{if(!this.renderer)return;const w=this.root.clientWidth||innerWidth,h=this.root.clientHeight||innerHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix()};
  this.keydown=e=>{
   if(e.key==='Tab'){
    const controls=[...this.root.querySelectorAll('.pwm-transport button:not([disabled])')];
    const first=controls[0],last=controls[controls.length-1];
    if(!controls.includes(document.activeElement)){
     e.preventDefault();first?.focus();return;
    }
    if((e.shiftKey&&document.activeElement===first)||(!e.shiftKey&&document.activeElement===last)){
     e.preventDefault();(e.shiftKey?last:first)?.focus();return;
    }
   }
   if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.togglePause();}
   else if(e.code==='KeyS'&&e.altKey){e.preventDefault();e.stopImmediatePropagation();this.finish(true);}
  };
  document.addEventListener('keydown',this.keydown,true);addEventListener('resize',this.resize);
  this.root.querySelector('[data-intro-skip]').addEventListener('click',()=>this.finish(true));
  this.root.querySelector('[data-intro-pause]').addEventListener('click',()=>this.togglePause());
  this.root.querySelector('[data-intro-voice]').addEventListener('click',()=>this.toggleVoice());
  this.root.querySelector('[data-intro-captions]').addEventListener('click',()=>this.toggleCaptions());
  this.root.querySelector('[data-intro-pause]').setAttribute('aria-pressed','false');
  this.root.querySelector('[data-intro-voice]').setAttribute('aria-pressed','true');
  this.root.querySelector('[data-intro-captions]').setAttribute('aria-pressed','true');
  this.root.querySelector('[data-intro-pause]').focus({preventScroll:true});
  try{
   this.stage=makeOpeningScene();
   this.camera=new THREE.PerspectiveCamera(66,1,.08,230);
   this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
   this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
   this.renderer.toneMappingExposure=1.20;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
   this.canvasSlot.append(this.renderer.domElement);this.resize();
  }catch(e){this.root.classList.add('pwm-no-webgl');console.warn('Opening in accessible fallback:',e);}
  this.next();
  this.ambience.start();
  this.frame=this.frame.bind(this);
  this.raf=requestAnimationFrame(this.frame);
 }
 lineAudio(id){
  const entry=this.voices?.files?.[id],file=entry?.file;
  if(typeof file!=='string'||!/^[a-z][a-z0-9-]*\.ogg$/.test(file))return null;
  const clipUrl=new URL('./audio/'+file,import.meta.url);
  if(typeof entry.sha256==='string'&&/^[a-f0-9]{64}$/.test(entry.sha256))clipUrl.searchParams.set('v',entry.sha256.slice(0,14));
  const a=new Audio(clipUrl.href);a.preload='auto';a.volume=.75;a.muted=this.muted;
  return a;
 }
 next(){
  if(this.finished)return;
  if(this.audio){this.audio.pause();this.audio.src='';this.audio=null;}
  this.index++;
  if(this.index>=this.lines.length){this.finish(false);return;}
  this.line=this.lines[this.index];this.elapsed=0;
  this.wait=clamp(this.line.text.split(/\s+/).length/2.35,6,36)+(this.line.pause||1.5);
  this.audio=this.lineAudio(this.line.id);
  if(this.audio){
   const ref=this.audio;
   ref.addEventListener('loadedmetadata',()=>{if(Number.isFinite(ref.duration))this.wait=Math.max(this.wait,ref.duration+(this.line.pause||1.5));},{once:true});
   ref.play().catch(()=>{});
  }
  // v41: no phone/UI object. Dispatch remains audio-only over the truck radio.
  this.root.dataset.shot=this.line.shot;
  // The work phone now lives on a real dashboard bracket and never pops up as an HTML card.
  this.root.querySelector('.pwm-phone-sheet').hidden=true;
  $('pwm-location').textContent=this.index>=9?'INTERIOR / PUBLIC CONCOURSE':this.index>=6?'EAST SERVICE ENTRANCE':'PINEWOOD MALL / AFTER HOURS';
  this.renderCaption();
 }
 renderCaption(){
  if(!this.captioned)return;
  const chunks=sentences(this.line.text),n=clamp(Math.floor(clamp(this.elapsed/Math.max(.1,this.wait-this.line.pause),0,.999)*chunks.length),0,chunks.length-1);
  // Identical writes every animation frame retrigger aria-live mutations.
  const caption=chunks[n]||'';
  if($('pwm-caption').textContent!==caption)$('pwm-caption').textContent=caption;
 }
 frame(now){
  if(this.finished)return;
  const delta=clamp((now-this.last)/1000,0,.12);this.last=now;
  if(!this.paused){
   this.elapsed+=delta;this.renderCaption();
   // Blocked like a real person's eyes: quick glances, attentive holds and footstep-driven travel.
   const pose=this.eyeRig.sample(this.line.id,this.elapsed,this.wait,delta,{reducedMotion:this.reduced});
   this.lastCameraPose=pose;
   this.ambience.update(delta,this.line.shot,!!this.audio&&!this.audio.ended&&!this.audio.paused,pose.rain);
   if(this.stage&&this.renderer){
    this.camera.position.copy(pose.position);
    this.camera.lookAt(pose.lookAt);
    this.stage.pivot.rotation.y=-Math.PI*.48*pose.doorOpen;
    if(!this.reduced){const a=this.stage.rain.geometry.attributes.position.array;for(let i=1;i<a.length;i+=3){a[i]-=delta*5.2;if(a[i]<.1)a[i]+=12.9;}this.stage.rain.geometry.attributes.position.needsUpdate=true;}
    this.renderer.render(this.stage.scene,this.camera);
   }
   const filled=(this.index+clamp(this.elapsed/Math.max(this.wait,.1),0,1))/this.lines.length;
   this.root.querySelector('.pwm-progress').style.width=(filled*100).toFixed(2)+'%';
   if(this.elapsed>=this.wait&&(!this.audio||this.audio.ended||this.audio.paused||this.elapsed>57))this.next();
  }
  this.raf=requestAnimationFrame(this.frame);
 }
 togglePause(){
  this.paused=!this.paused;if(this.audio){if(this.paused)this.audio.pause();else this.audio.play().catch(()=>{});}
  if(this.paused)this.ambience.pause();else this.ambience.resume();
  this.root.querySelector('[data-intro-pause]').textContent=this.paused?'Resume':'Pause';
  this.root.querySelector('[data-intro-pause]').setAttribute('aria-pressed',String(this.paused));
  this.root.dataset.paused=String(this.paused);
 }
 toggleVoice(){
  this.muted=!this.muted;if(this.audio)this.audio.muted=this.muted;
  this.root.querySelector('[data-intro-voice]').textContent=this.muted?'Voice off':'Voice on';
  this.root.querySelector('[data-intro-voice]').setAttribute('aria-pressed',String(!this.muted));
 }
 toggleCaptions(){
  this.captioned=!this.captioned;this.root.classList.toggle('pwm-hide-captions',!this.captioned);
  this.root.querySelector('[data-intro-captions]').textContent=this.captioned?'Captions on':'Captions off';
  this.root.querySelector('[data-intro-captions]').setAttribute('aria-pressed',String(this.captioned));
  if(this.captioned)this.renderCaption();
 }
 seek(index){if(index<0||index>=this.lines.length)return false;this.index=index-1;this.next();return true;}
 finish(skipped){
  if(this.finished)return;this.finished=true;cancelAnimationFrame(this.raf);
  document.removeEventListener('keydown',this.keydown,true);removeEventListener('resize',this.resize);
  if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();}
  this.ambience.destroy();
  this.stage?.scene.traverse(o=>{
   o.geometry?.dispose?.();
   for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){m.map?.dispose?.();m.dispose?.();}
  });
  // No phone exists in the vendor-only utility cabin. Clean up conditionally.
  this.stage?.phoneUi?.texture?.dispose?.();
  this.renderer?.dispose();this.renderer?.domElement.remove();
  this.root.classList.remove('pwm-active');this.root.hidden=true;
  const clone=this.root.cloneNode(true);this.root.replaceWith(clone);
  for(const {el,inert} of this.backgroundScreens)el.inert=inert;
  if(this.returnFocus?.isConnected)this.returnFocus.focus({preventScroll:true});
  document.dispatchEvent(new CustomEvent('pinewood-intro-finished',{detail:{skipped,preview:this.preview}}));
  if(this.preview)return;
  // The full game loader assembles the six-chapter runtime asynchronously.
  // A fast skip may finish before the classic New Game click handler is attached.
  // Retry the native click until its existing title screen actually transitions.
  const button=$('newBtn');
  let retries=0;
  const deliver=()=>{
   const title=$('titleScreen'),chapter=$('chapterScreen'),loading=$('loadingScreen');
   if(!button||!title||!title.classList.contains('show')||chapter?.classList.contains('show')||loading?.classList.contains('show'))return;
   if(retries++>=100){console.error('[Opening] Native game did not acknowledge New Game within handoff budget');return;}
   bypass=true;try{button.click();}finally{bypass=false;}
   if(title.classList.contains('show'))setTimeout(deliver,1200);
  };
  deliver();
 }
}
function intercept(e){
 const target=e.target?.closest?.('#newBtn');
 if(!target||bypass||query.has('openingDisabled'))return;
 e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
 if(active&&!active.finished)return;
 loadResources().then(([script,voices])=>{
  if(!script?.lines?.length)throw Error('No opening lines');
  active=new Intro(script,voices);
 }).catch(error=>{
  console.error('Could not load The Call, using original New Game:',error);
  bypass=true;try{$('newBtn')?.click();}finally{bypass=false;}
 });
}
document.addEventListener('click',intercept,true);
window.__PINEWOOD_OPENING_V34__={
 get active(){return !!active&&!active.finished;},
 get cue(){return active?.line?.id||null;},
 get index(){return active?.index??-1;},
 get total(){return active?.lines?.length||0;},
 get audioStatus(){return {available:!!active?.audio,paused:active?.audio?.paused??true,muted:active?.audio?.muted??false,time:active?.audio?.currentTime??0,ambient:active?.ambience?.status||null};},
 get cameraPosition(){return active?.camera?.position.toArray()||null;},
 get eyeMotion(){const p=active?.lastCameraPose;return p?{cue:p.cue,phase:p.phase,gaze:p.gazeTarget,walking:p.isWalking,rain:p.rain,doorOpen:p.doorOpen}:null;},
 get environmentV37(){return active?.stage?.v37||null;},
 get serviceEntryGeometry(){
  const entry=active?.stage?.serviceEntry;
  if(!entry)return null;
  // Report actual mesh world-space bounds for browser-side fit tests.
  const bbox=mesh=>{
   mesh.updateWorldMatrix(true,false);
   const b=new THREE.Box3().setFromObject(mesh);
   return {min:b.min.toArray(),max:b.max.toArray(),size:b.getSize(new THREE.Vector3()).toArray()};
  };
  return {
   opening:{...entry.opening},
   door:bbox(entry.doorSlab),leftInfill:bbox(entry.leftInfill),
   rightInfill:bbox(entry.rightInfill),headerInfill:bbox(entry.headerInfill),
   leftJamb:bbox(entry.leftJamb),rightJamb:bbox(entry.rightJamb),
   head:bbox(entry.head),sill:bbox(entry.sill),canopy:bbox(entry.canopy)
  };
 },
 get dashboardPhone(){return null;},
 qaDriverView(height,z=17.15){
  if(!location.pathname.includes('/review/')||!active?.stage||!active.renderer)return false;
  active.paused=true;
  active.camera.position.set(-10.25,height,z);
  active.camera.lookAt(-10.15,1.45,-20);
  active.renderer.render(active.stage.scene,active.camera);
  return true;
 },
  qaExteriorCar(){
  if(!location.pathname.includes('/review/')||!active?.stage||!active.renderer)return false;
  active.paused=true;active.camera.position.set(-13.8,2.6,21.0);
  active.camera.lookAt(-10,1.0,17.5);
  active.renderer.render(active.stage.scene,active.camera);
  return true;
 },
 get sceneStats(){
  if(!active?.stage)return null;
  let meshes=0,signs=[],phoneTexture=null;
  active.stage.scene.traverse(o=>{if(o.isMesh)meshes++;if(o.userData?.openingWallPaper)signs.push({text:o.userData.openingWallPaper,position:o.position.toArray()});});
  return {meshCount:meshes,wallNotices:signs,phoneTexture:[phoneTexture?.width||0,phoneTexture?.height||0],rainParticles:active.stage.rain.geometry.attributes.position.count,doorAngle:active.stage.pivot.rotation.y};
 },
 async preview(){if(active&&!active.finished)return;const [script,voices]=await loadResources();active=new Intro(script,voices,{preview:true});},
 seek(index){return active?.seek(index)||false;},
 scrub(fraction){if(!active?.line)return false;active.elapsed=clamp(fraction,0,.97)*active.wait;active.eyeRig=new HumanCameraRig();return true;},
 skip(){active?.finish(true);},
 mute(){active?.toggleVoice();}
};
// Prefetch authored local script/voice metadata before New Game is clicked, preserving user-gesture audio playback.
loadResources().catch(()=>{});
if(query.has('openingPreview'))window.__PINEWOOD_OPENING_V34__.preview().catch(console.error);
