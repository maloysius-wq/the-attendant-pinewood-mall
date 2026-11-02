import * as THREE from '../vendor/three/build/three.module.js';
import {makeOpeningScene} from './scene.js?v=63';
import {HumanCameraRig} from './camera-v62.js?v=62';
import {OpeningAmbience} from './ambience-v62.js?v=62';
import {HandheldCheckInPhone} from './phone-v62.js?v=62';
import {buildCaptionTrack,captionAt} from './caption-sync-v45.js?v=45';
const $=id=>document.getElementById(id);
const query=new URLSearchParams(location.search);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
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
  this.root.classList.remove('pwm-no-webgl');
  this.root.dataset.preloadState='loading';this.root.setAttribute('aria-busy','true');
  this.preload=this.root.querySelector('[data-intro-preload]');
  this.preload.hidden=false;this.preloading=true;this.firstFrameRendered=false;
  this.preload.querySelector('[data-intro-preload-title]').textContent='PREPARING YOUR SHIFT';
  this.preload.querySelector('[data-intro-preload-message]').textContent='Loading Pinewood Mall, the enclosed car, and scene textures…';
  this.preloadSkip=this.root.querySelector('[data-intro-preload-skip]');
  this.transport=this.root.querySelector('.pwm-transport');this.transport.inert=true;
  this.backgroundScreens=[...document.querySelectorAll('.screen')].map(el=>({el,inert:el.inert}));
  for(const {el} of this.backgroundScreens)el.inert=true;
  this.index=-1;this.elapsed=0;this.wait=0;this.finished=false;this.paused=false;this.muted=false;this.captioned=true;
  this.scrubOverride=null;this.audioFailed=false;this.postroll=0;this.startupWait=0;
  this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.canvasSlot=this.root.querySelector('.pwm-render');this.last=performance.now();
  this.ambience=new OpeningAmbience();
  this.eyeRig=new HumanCameraRig();this.lastCameraPose=null;
  this.resize=()=>{if(!this.renderer)return;const w=this.root.clientWidth||innerWidth,h=this.root.clientHeight||innerHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();if(this.phoneCamera){this.phoneCamera.aspect=w/h;this.phoneCamera.updateProjectionMatrix()}};
  this.keydown=e=>{
   if(this.preloading){
    if(e.key==='Tab'){e.preventDefault();this.preloadSkip.focus();return;}
    if(e.code==='Escape'||(e.code==='KeyS'&&e.altKey)){
     e.preventDefault();e.stopImmediatePropagation();this.finish(true);return;
    }
   }
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
  this.preloadSkip.addEventListener('click',()=>this.finish(true));
  this.root.querySelector('[data-intro-skip]').addEventListener('click',()=>this.finish(true));
  this.root.querySelector('[data-intro-pause]').addEventListener('click',()=>this.togglePause());
  this.root.querySelector('[data-intro-voice]').addEventListener('click',()=>this.toggleVoice());
  this.root.querySelector('[data-intro-captions]').addEventListener('click',()=>this.toggleCaptions());
  this.root.querySelector('[data-intro-pause]').setAttribute('aria-pressed','false');
  this.root.querySelector('[data-intro-voice]').setAttribute('aria-pressed','true');
  this.root.querySelector('[data-intro-captions]').setAttribute('aria-pressed','true');
  this.preloadSkip.focus({preventScroll:true});
  try{
   this.stage=makeOpeningScene({useImportedLandscape:true});
   this.camera=new THREE.PerspectiveCamera(66,1,.08,230);
   this.stage.scene.add(this.camera);
   // The car and the handheld are rendered with separate depth buffers.
   this.phoneScene=new THREE.Scene();
   this.phoneCamera=new THREE.PerspectiveCamera(66,1,.08,230);
   this.phoneScene.add(this.phoneCamera);
   this.phoneScene.add(new THREE.AmbientLight(0xffffff,1.5));
   const handsetKey=new THREE.DirectionalLight(0xffead5,1.9);
   handsetKey.position.set(-1.5,2,3);
   this.phoneScene.add(handsetKey);
   this.handheld=new HandheldCheckInPhone(this.phoneCamera);
   this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
   this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
   this.renderer.toneMappingExposure=1.20;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
   this.canvasSlot.append(this.renderer.domElement);this.resize();
  }catch(e){this.root.classList.add('pwm-no-webgl');this.initError=e;
   console.warn('Opening in accessible fallback:',e);}
  // Open the local rain buffers while the scene loads, at zero gain. The
  // first voiced line and all scene animation wait until the first full frame.
  this.ambience.start();
  // Prime Renee's FIRST clip silently from the New Game gesture, so a slow
  // 3D load cannot turn voice playback into blocked post-gesture autoplay.
  this.primedVoice=this.lineAudio(this.lines[0].id);
  if(this.primedVoice){
   this.primedVoice.muted=true;this.primedVoice.loop=true;
   this.primedVoice.play().catch(()=>{});
  }
  if(this.initError)this.startTextFallback();
  else this.prepareAssets();
 }
 async prepareAssets(){
  try{
   const [environment]=await Promise.all([this.stage.assetReady,this.handheld.handLoad,this.ambience.ready]);
   if(this.finished){this.disposeScenes();return;}
   if(environment?.state!=='ready'||environment.car!=='loaded'||environment.maps?.length!==3)
    throw Error('Local Pinewood environment not ready: '+JSON.stringify(environment?.errors||environment));
   if(this.handheld.playerHand.state!=='ready')
    throw Error('Connected source hand did not load: '+this.handheld.playerHand.error);
   if(this.ambience.ctx&&(!this.ambience.buffers.car||!this.ambience.buffers.outside))
    throw Error('Local indoor or outdoor rain did not decode before cinematic reveal');
   // GPU uploads and shader setup are also done UNDER the opaque loading
   // cover. The player must never see a first frame of procedural gray walls.
   const openingLine=this.lines[0],seconds=Math.max(1,Number(this.voices?.files?.[openingLine.id]?.duration)||8);
   const pose=this.eyeRig.sample(openingLine.id,0,seconds,0,{reducedMotion:this.reduced});
   this.camera.position.copy(pose.position);this.camera.lookAt(pose.lookAt);
   this.stage.pivot.rotation.y=0;
   this.renderer.render(this.stage.scene,this.camera);
   // Prime the same real CC0 arm/hand, phone app CanvasTexture and lighting
   // before it appears later at check-in; restore the first camera frame.
   this.handheld.update(openingLine.id,seconds*.44,seconds,{reducedMotion:this.reduced});
   this.renderer.autoClear=false;this.renderer.clearDepth();
   this.renderer.render(this.phoneScene,this.phoneCamera);
   this.renderer.autoClear=true;
   this.handheld.update(openingLine.id,0,seconds,{reducedMotion:this.reduced});
   this.renderer.render(this.stage.scene,this.camera);
   this.firstFrameRendered=true;this.eyeRig=new HumanCameraRig();
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   if(this.finished){this.disposeScenes();return;}
   this.revealReady();
  }catch(error){
   if(this.finished){this.disposeScenes();return;}
   this.showPreloadFailure(error);
  }
 }
 revealReady(){
  this.preloading=false;this.root.dataset.preloadState='ready';
  this.root.removeAttribute('aria-busy');this.transport.inert=false;
  this.root.querySelector('[data-intro-pause]').focus({preventScroll:true});
  this.preload.hidden=true;
  this.last=performance.now();this.next();
  this.frame=this.frame.bind(this);
  this.raf=requestAnimationFrame(this.frame);
 }
 startTextFallback(){
  // No WebGL means no partial 3D frame to expose. Preserve the existing
  // caption-led accessible fallback instead of hanging on scene preparation.
  this.revealReady();
 }
 showPreloadFailure(error){
  console.error('[The Call] Scene assets unavailable before opening:',error);
  this.root.dataset.preloadState='failed';this.root.removeAttribute('aria-busy');
  this.preload.querySelector('[data-intro-preload-title]').textContent='SCENE NOT READY';
  this.preload.querySelector('[data-intro-preload-message]').textContent=
   'Pinewood did not finish loading. Refresh to try again, or skip the intro.';
  this.preloadSkip.focus({preventScroll:true});
 }
 disposeScenes(){
  for(const scene of [this.stage?.scene,this.phoneScene])scene?.traverse(o=>{
   o.geometry?.dispose?.();
   for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){
    m.map?.dispose?.();m.dispose?.();
   }
  });
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
  if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio=null;}
  this.index++;
  if(this.index>=this.lines.length){this.finish(false);return;}
  this.line=this.lines[this.index];
  this.elapsed=0;this.postroll=0;this.startupWait=0;this.scrubOverride=null;this.audioFailed=false;
  const voice=this.voices?.files?.[this.line.id];
  const fallbackSeconds=clamp(this.line.text.split(/\s+/).length/2.35,6,36);
  this.voiceSeconds=Number(voice?.duration)>0?Number(voice.duration):fallbackSeconds;
  this.wait=this.voiceSeconds+(this.line.pause||1.5);
  this.captionTrack=buildCaptionTrack(this.line.text,this.voiceSeconds);
  this.captionSeconds=0;this.captionIndex=0;
  this.audio=this.index===0&&this.primedVoice?this.primedVoice:this.lineAudio(this.line.id);
  if(this.audio===this.primedVoice){
   this.primedVoice=null;this.audio.loop=false;this.audio.muted=this.muted;
   if(this.audio.readyState>=1)this.audio.currentTime=0;
   else this.audio.addEventListener('loadedmetadata',()=>{if(this.audio)this.audio.currentTime=0;},{once:true});
  }
  if(this.audio){
   const ref=this.audio;
   ref.addEventListener('loadedmetadata',()=>{
    if(this.audio!==ref||!Number.isFinite(ref.duration)||ref.duration<=0)return;
    this.voiceSeconds=ref.duration;
    this.wait=this.voiceSeconds+(this.line.pause||1.5);
    this.captionTrack=buildCaptionTrack(this.line.text,this.voiceSeconds);
    this.renderCaption();
   },{once:true});
   // A heavy WebGL render may throttle requestAnimationFrame independently
   // of the OGG clock. Drive actual captions from media events instead.
   // Each handler belongs to this particular clip, so stale outgoing clips
   // cannot advance the new line after a seek or chapter transition.
   const onMediaTick=()=>{
    if(this.audio===ref&&!this.finished&&!this.paused)this.renderCaption();
   };
   for(const event of ['timeupdate','playing','seeked','ended'])
    ref.addEventListener(event,onMediaTick);
   ref.addEventListener('error',()=>{if(this.audio===ref)this.audioFailed=true;},{once:true});
   ref.play().catch(()=>{if(this.audio===ref)this.audioFailed=true;});
  }
  this.root.dataset.shot=this.line.shot;
  $('pwm-location').textContent=this.index>=9?'INTERIOR / PUBLIC CONCOURSE':this.index>=6?'EAST SERVICE ENTRANCE':'PINEWOOD MALL / AFTER HOURS';
  this.handheld?.update(this.line.id,0,this.voiceSeconds,{reducedMotion:this.reduced});
  this.renderCaption();
 }
 voiceTime(){
  if(this.scrubOverride!==null)return Math.min(this.scrubOverride,this.voiceSeconds);
  if(this.audio&&!this.audioFailed)return Math.min(this.voiceSeconds,this.audio.currentTime);
  return Math.min(this.voiceSeconds,this.elapsed);
 }
 renderCaption(){
  if(!this.captioned||!this.captionTrack)return;
  // The recording owns the caption clock, including load stalls, pauses and
  // playback-rate changes. No wall-clock read-speed or scene-pause estimates.
  this.captionSeconds=this.voiceTime();
  const cue=captionAt(this.captionTrack,this.captionSeconds);
  this.captionIndex=cue.index;
  if($('pwm-caption').textContent!==cue.text)$('pwm-caption').textContent=cue.text;
 }
 frame(now){
  if(this.finished)return;
  const delta=clamp((now-this.last)/1000,0,.12);this.last=now;
  if(!this.paused){
   if(this.scrubOverride!==null){
    this.elapsed=this.scrubOverride;
   }else if(this.audio&&!this.audioFailed){
    if(this.audio.ended){
     this.postroll+=delta;
     this.elapsed=this.voiceSeconds+this.postroll;
    }else if(!this.audio.paused||this.audio.currentTime>.001){
     // Never pretend the voice has advanced while the browser is still
     // decoding or waiting for the first packet.
     if(this.audio.currentTime<.01){
      this.startupWait+=delta;
      if(this.startupWait>8){
       this.audio.pause();this.audioFailed=true;this.elapsed+=delta;
      }else this.elapsed=0;
     }else{
      this.startupWait=0;
      this.elapsed=this.audio.currentTime;
     }
    }else{
     // If the browser blocks autoplay, keep the text-only cinematic moving.
     this.startupWait+=delta;
     if(this.startupWait>2){this.audioFailed=true;this.elapsed+=delta;}
    }
   }else this.elapsed+=delta;
   this.renderCaption();
   // The camera, rain and phone all use the media-following shot timeline.
   const pose=this.eyeRig.sample(this.line.id,this.elapsed,this.wait,delta,{reducedMotion:this.reduced});
   this.lastCameraPose=pose;
   this.ambience.update(delta,this.line.shot,!!this.audio&&!this.audio.ended&&!this.audio.paused,pose.rain);
   if(this.stage&&this.renderer){
    this.camera.position.copy(pose.position);
    this.camera.lookAt(pose.lookAt);
    // Include the post-voice pause: CHECK IN happens after Renee's instruction.
    this.handheld?.update(this.line.id,this.elapsed,this.voiceSeconds,{reducedMotion:this.reduced});
    this.root.dataset.phoneRaised=this.handheld?.raised?'true':'false';
    this.stage.pivot.rotation.y=-Math.PI*.48*pose.doorOpen;
    if(!this.reduced){const a=this.stage.rain.geometry.attributes.position.array;for(let i=1;i<a.length;i+=3){a[i]-=delta*5.2;if(a[i]<.1)a[i]+=12.9;}this.stage.rain.geometry.attributes.position.needsUpdate=true;}
    this.renderer.render(this.stage.scene,this.camera);
    if(this.handheld?.raised){
     this.renderer.autoClear=false;
     this.renderer.clearDepth();
     this.renderer.render(this.phoneScene,this.phoneCamera);
     this.renderer.autoClear=true;
    }
   }
   const filled=(this.index+clamp(this.elapsed/Math.max(this.wait,.1),0,1))/this.lines.length;
   this.root.querySelector('.pwm-progress').style.width=(filled*100).toFixed(2)+'%';
   if(this.scrubOverride===null&&this.elapsed>=this.wait&&(!this.audio||this.audio.ended||this.audioFailed))this.next();
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
  // Release keyboard focus and the modal BEFORE slow WebGL disposal. This
  // guarantees accessible Skip works even on low-power mobile renderers.
  this.root.classList.remove('pwm-active');this.root.hidden=true;
  const clone=this.root.cloneNode(true);this.root.replaceWith(clone);
  for(const {el,inert} of this.backgroundScreens)el.inert=inert;
  if(this.returnFocus?.isConnected)this.returnFocus.focus({preventScroll:true});
  try {
   if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();}
   if(this.primedVoice){this.primedVoice.pause();this.primedVoice.removeAttribute('src');this.primedVoice.load();this.primedVoice=null;}
   this.ambience.destroy();
   this.handheld?.dispose();
   this.disposeScenes();
   this.renderer?.dispose();
  } catch(error) {
   // A resource cleanup failure must not leave the cinematic focus-trapped.
   console.warn('[The Call] Resource cleanup after closing:',error);
  } finally {
   this.renderer?.domElement.remove();
  }
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
 get startupStatus(){return active?{state:active.root.dataset.preloadState,
  firstFrameRendered:!!active.firstFrameRendered,preloading:active.preloading,
  voicedLineStarted:active.index>=0}:null;},
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
   opening:{...entry.opening},doorSpecs:{...entry.doorSpecs},
   door:bbox(entry.doorSlab),leftInfill:bbox(entry.leftInfill),
   rightInfill:bbox(entry.rightInfill),headerInfill:bbox(entry.headerInfill),
   leftJamb:bbox(entry.leftJamb),rightJamb:bbox(entry.rightJamb),
   head:bbox(entry.head),sill:bbox(entry.sill),canopy:bbox(entry.canopy)
  };
 },
 get dashboardPhone(){return null;}, // No dashboard mount; the prop is held in hand.
 get handheldPhone(){return active?.handheld?.status||null;},
 get qaPlayerHand(){return location.pathname.includes('/review/')?active?.handheld?.playerHand||null:null;},
 get captionTiming(){if(active&&!active.paused)active.renderCaption();return active?{line:active.line?.id,voiceSeconds:active.voiceSeconds,
   mediaSeconds:active.audio?.currentTime??null,captionSeconds:active.captionSeconds,
   captionIndex:active.captionIndex,source:active.scrubOverride!==null?'preview-scrub':
   active.audio&&!active.audioFailed?'media':'text-fallback',
   waitSeconds:active.wait,paused:active.paused}:null;},
 qaCockpitProbe({x=-10.41,y=1.12,z=17.42,dx=0,dy=1.4,dz=-20}={}){
  if(!location.pathname.includes('/review/')||!active?.stage||!active.renderer)return false;
  active.paused=true;
  active.camera.position.set(x,y,z);
  active.camera.lookAt(dx,dy,dz);
  active.renderer.render(active.stage.scene,active.camera);
  return true;
 },
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
  let meshes=0,signs=[];
  active.stage.scene.traverse(o=>{if(o.isMesh)meshes++;if(o.userData?.openingWallPaper)signs.push({text:o.userData.openingWallPaper,position:o.position.toArray()});});
  return {meshCount:meshes,wallNotices:signs,rainParticles:active.stage.rain.geometry.attributes.position.count,doorAngle:active.stage.pivot.rotation.y};
 },
 async preview(){if(active&&!active.finished)return;const [script,voices]=await loadResources();active=new Intro(script,voices,{preview:true});},
 seek(index){return active?.seek(index)||false;},
 scrub(fraction){if(!active?.line)return false;active.scrubOverride=clamp(fraction,0,.97)*active.wait;
  active.elapsed=active.scrubOverride;active.audio?.pause();active.eyeRig=new HumanCameraRig();active.renderCaption();return true;},
 skip(){active?.finish(true);},
 mute(){active?.toggleVoice();}
};
// Prefetch authored local script/voice metadata before New Game is clicked, preserving user-gesture audio playback.
loadResources().catch(()=>{});
if(query.has('openingPreview'))window.__PINEWOOD_OPENING_V34__.preview().catch(console.error);
