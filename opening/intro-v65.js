import * as THREE from '../vendor/three/build/three.module.js';
import {makeOpeningScene} from './scene.js?v=83';
import {installAbandonedFacadeV65} from './facade-v65.js?v=65';
import {enlargeImportedLandscapeV64} from './landscape-scale-v64.js?v=64';
import {renderPinewoodV69} from '../mall/render-shell-v69.js';
import {installDashboardClockV71} from './dashboard-clock-v71.js?v=83';
import {KeypadReachHandV72} from './keypad-reach-v72.js?v=81';
import {HumanCameraRig} from './camera-v65.js?v=83';
import {OpeningAmbience} from './ambience-v62.js?v=62';
import {OpeningCinematicSfx} from './cinematic-sfx-v82.js?v=83';
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
   this.stage=makeOpeningScene({useImportedLandscape:true,useAbandonedFacade:true});
   // Preload the timber and build the entire boarded-up mall behind the
   // first-frame cover, alongside v64 imported planters/car and textures.
   const facadeReady=installAbandonedFacadeV65(this.stage);
   const environmentReady=this.stage.assetReady;
   this.stage.assetReady=Promise.all([environmentReady,facadeReady])
    .then(([environment,facadeV65])=>{
     if(environment?.state!=='ready'||facadeV65?.state!=='ready')
      throw Error('V65 cinematic mall facade or environment did not finish preloading');
     environment.facadeV65=facadeV65;
     return enlargeImportedLandscapeV64(this.stage,environment);
    });
   // The actual playable mall is already unified; render that same interior
   // after the entrance threshold without overlapping the exterior facade.
   this.interiorScene=new THREE.Scene();
   this.interiorScene.background=new THREE.Color(0x0b1418);
   this.interiorScene.fog=new THREE.FogExp2(0x151e20,.012);
   this.interiorReady=renderPinewoodV69({scene:this.interiorScene,chapter:1});
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
   this.keypadReach=new KeypadReachHandV72(this.phoneCamera,this.handheld,this.stage.scene);
   this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
   this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
   this.renderer.toneMappingExposure=1.20;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));
   this.canvasSlot.append(this.renderer.domElement);this.resize();
  }catch(e){this.root.classList.add('pwm-no-webgl');this.initError=e;
   console.warn('Opening in accessible fallback:',e);}
  // Open the local rain buffers while the scene loads, at zero gain. The
  // first voiced line and all scene animation wait until the first full frame.
  this.ambience.start();
  this.sfx=new OpeningCinematicSfx(this.ambience.ctx);
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
   const [environment,interior]=await Promise.all([
    this.stage.assetReady,this.interiorReady,this.handheld.handLoad,this.keypadReach.ready,this.ambience.ready,this.sfx.ready
   ]);
   this.interiorBuilding=interior;
   if(this.finished){this.disposeScenes();return;}
   if(environment?.state!=='ready'||environment.car!=='loaded'||environment.maps?.length!==3)
    throw Error('Local Pinewood environment not ready: '+JSON.stringify(environment?.errors||environment));
   if(!interior?.firstFrameFullyLoaded||interior.uniqueModels<10)
    throw Error('Canonical licensed interior did not finish preloading');
   this.dashboardClock=installDashboardClockV71(this.stage.car);
   if(this.handheld.playerHand.state!=='ready')
    throw Error('Connected source hand did not load: '+this.handheld.playerHand.error);
   if(this.keypadReach.hand.state!=='ready')
    throw Error('Keypad forearm did not preload: '+this.keypadReach.hand.error);
   if(this.ambience.ctx&&(!this.ambience.buffers.car||!this.ambience.buffers.outside))
    throw Error('Local indoor or outdoor rain did not decode before cinematic reveal');
   // GPU uploads and shader setup are also done UNDER the opaque loading
   // cover. The player must never see a first frame of procedural gray walls.
   const openingLine=this.lines[0],seconds=Math.max(1,Number(this.voices?.files?.[openingLine.id]?.duration)||8);
   const pose=this.eyeRig.sample(openingLine.id,0,seconds,0,{reducedMotion:this.reduced});
   this.camera.position.copy(pose.position);this.camera.lookAt(pose.lookAt);
   // A front-seat eye needs only a small first-person near plane; all the
   // vendor seat, roof and dashboard geometry remains intact.
   this.camera.near=.18;this.camera.updateProjectionMatrix();
   this.stage.pivot.rotation.y=0;
   this.renderer.render(this.stage.scene,this.camera);
   // Prime the same real CC0 arm/hand, phone app CanvasTexture and lighting
   // before it appears later at check-in; restore the first camera frame.
   this.handheld.update(openingLine.id,seconds*.44,seconds,{reducedMotion:this.reduced});
   this.renderer.autoClear=false;this.renderer.clearDepth();
   this.renderer.render(this.phoneScene,this.phoneCamera);
   this.renderer.autoClear=true;
   this.handheld.update(openingLine.id,0,seconds,{reducedMotion:this.reduced});
   // Prewarm all indoor model shaders before any scene is visible.
   const originalPos=this.camera.position.clone(),originalQuat=this.camera.quaternion.clone();
   this.camera.position.set(11.8,1.73,-25.2);
   this.camera.lookAt(5,2.4,-34);
   this.renderer.render(this.interiorScene,this.camera);
   // Compile the licensed keypad hand under the same opaque cover as the
   // real mall, so the physical contact animation cannot flash on first use.
   this.camera.position.set(12.8,1.63,-20.73);
   this.camera.lookAt(13.65,1.37,-21.68);
   this.keypadReach.update(.375,true,this.camera);
   this.renderer.render(this.stage.scene,this.camera);
   this.keypadReach.update(0,false,this.camera);
   // One continuous 3D world: preloaded v69 mall behind the existing v65
   // frontage. Retire the older front elevation to prevent intersections.
   const canonical=this.interiorBuilding.group;
   this.interiorBuilding.facade.group.visible=false;
   let hiddenFrontWalls=0;
   canonical.traverse(obj=>{
    if(obj.userData?.boundary?.id?.startsWith('front_original_')){
     obj.visible=false;hiddenFrontWalls++;
    }
   });
   if(hiddenFrontWalls<2)throw Error('Could not retire duplicate canonical front elevation');
   this.stage.scene.add(canonical);
   this.stage.canonicalMall=canonical;
   this.stage.hiddenCanonicalFrontWalls=hiddenFrontWalls;
   this.camera.position.copy(originalPos);this.camera.quaternion.copy(originalQuat);
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
   this.sfx?.update(this.line.id,this.elapsed,this.voiceSeconds,this.wait,
    {scrubbing:this.scrubOverride!==null});
   if(this.stage&&this.renderer){
    this.camera.position.copy(pose.position);
    this.camera.lookAt(pose.lookAt);
    const enclosed=['arrival','clock','closed','work','safety'].includes(this.line.id)
     ||(this.line.id==='owner'&&pose.position.x>-11.15);
    const worldNear=enclosed ? .18 : .08;
    if(this.camera.near!==worldNear){this.camera.near=worldNear;this.camera.updateProjectionMatrix();}
    // Include the post-voice pause: CHECK IN happens after Renee's instruction.
    this.handheld?.update(this.line.id,this.elapsed,this.voiceSeconds,{reducedMotion:this.reduced});
    this.root.dataset.phoneRaised=this.handheld?.raised?'true':'false';
    this.stage.pivot.rotation.y=-Math.PI*.48*pose.doorOpen;
     this.stage.sedanDoor?.update(this.line.id,pose.phase,this.elapsed,this.wait);
    // Visible button presses follow the voice, before Renee confirms entry.
    const accessProgress=this.line.id==='lights'
     ?clamp((this.elapsed-this.voiceSeconds)/Math.max(.1,this.line.pause||2),0,1)
     :this.index>7?1:0;
    this.stage.accessPad.update(accessProgress);
    this.keypadReach?.update(accessProgress,this.line.id==='lights',this.camera);
    if(!this.reduced){const a=this.stage.rain.geometry.attributes.position.array;for(let i=1;i<a.length;i+=3){a[i]-=delta*11.6;if(a[i]<.1)a[i]+=12.9;}this.stage.rain.geometry.attributes.position.needsUpdate=true;}
    const throughDoor=this.camera.position.z< -22.55;
    this.root.dataset.renderWorld=throughDoor?'unified-mall':'exterior';
    // The same interior geometry remains visible across the threshold.
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
   this.sfx?.destroy();this.ambience.destroy();
   this.handheld?.dispose();
   if(this.stage?.canonicalMall)this.stage.scene.remove(this.stage.canonicalMall);
   this.interiorBuilding?.dispose();
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
  if(!skipped)window.__PINEWOOD_INTRO_COMPLETED_FOR_GAME__=true;
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
 get carDoorState(){return active?.stage?.sedanDoor?.status||null;},
 get cinematicSfx(){return location.pathname.includes('/review/')?active?.sfx?.status||null:null;},
 qaSfxAdvance({cue,elapsed,voiceSeconds,waitSeconds}={}){
  if(!location.pathname.includes('/review/')||!active?.sfx)return null;
  active.sfx.update(cue,elapsed,voiceSeconds,waitSeconds);
  return active.sfx.status;
 },
 get cockpitSightlines(){
  const model=active?.stage?.sedanV75?.model,cam=active?.camera;
  if(!model||!cam)return null;
  cam.updateWorldMatrix(true,false);
  const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),cam);ray.near=.18;
  const hit=ray.intersectObject(model,true).find(h=>!/windows|glass/i.test(h.object.name||''));
  return {centerForwardDistance:hit?.distance??20,hitMesh:hit?.object.name||null};
 },
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
  get dashboardClock(){return active?.dashboardClock||null;},
  get dashboardClockView(){
   const display=active?.stage?.car?.getObjectByName('12:47 AM inset display');
   if(!display||!active?.camera)return null;
   display.updateWorldMatrix(true,false);
   active.camera.updateWorldMatrix(true,false);
   const corners=[[-.109,-.0385],[.109,-.0385],[-.109,.0385],[.109,.0385]]
    .map(([x,y])=>display.localToWorld(new THREE.Vector3(x,y,0)).project(active.camera));
   const xs=corners.map(p=>(p.x+1)/2),ys=corners.map(p=>(1-p.y)/2);
   return {viewportWidth:Math.max(...xs)-Math.min(...xs),
    inFrame:xs.every(x=>x>.05&&x<.95)&&ys.every(y=>y>.05&&y<.95),
    bounds:[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]};
  },
  get accessPad(){return active?.stage?.accessPad?.status||null;},
  get keypadView(){
   if(!active?.stage||!active.camera)return null;
   const bounds=[[13.41,.94,-21.65],[13.89,.94,-21.65],
    [13.41,1.82,-21.65],[13.89,1.82,-21.65]]
    .map(p=>new THREE.Vector3(...p).project(active.camera));
   const xs=bounds.map(p=>(p.x+1)/2),ys=bounds.map(p=>(1-p.y)/2);
   const pad=active.stage.accessPad.status,reach=active.keypadReach?.status;
   return {entered:pad.entered,displayedCode:pad.displayedCode,
    granted:pad.granted,legibleDigits:pad.legibleDigits,
    inFrame:xs.every(x=>x>=.03&&x<=.97)&&ys.every(y=>y>=.03&&y<=.97),
    viewportWidth:Math.max(...xs)-Math.min(...xs),
    viewportBounds:{left:Math.min(...xs),right:Math.max(...xs),top:Math.min(...ys),bottom:Math.max(...ys)},
    forearmVisible:!!reach?.visible&&!!reach.realAnatomicalForearm,
    finger:reach};
  },
  get entryContinuity(){return active?.stage?{
   canonicalMounted:!!active.interiorBuilding?.group&&active.interiorBuilding.group.parent===active.stage.scene,
   retiredExteriorFacades:active.interiorBuilding?.facade?.group?.visible?1:0,
   hiddenCanonicalFrontWalls:active.stage.hiddenCanonicalFrontWalls||0,
   sameWorldFrame:!!active.stage.canonicalMall&&active.stage.canonicalMall.parent===active.stage.scene,
   doorSwingRadians:active.stage.pivot.rotation.y
  }:null;},
  get cinematicWorld(){return active?{
   mode:active.root.dataset.renderWorld||'exterior',
   interiorReady:!!active.interiorBuilding?.firstFrameFullyLoaded,
   uniqueLicensedModels:active.interiorBuilding?.uniqueModels||0,
   retiredInteriorMeshes:active.stage?.retiredInteriorMeshes??null
  }:null;},
 get handheldPhone(){return active?.handheld?.status||null;},
 qaRenderNow(){
  if(!location.pathname.includes('/review/')||!active?.renderer)return false;
  const arm=active.keypadReach?.root,renderer=active.renderer,gl=renderer.getContext();
  const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
  const renderRead=()=>{
   renderer.render(active.stage.scene,active.camera);
   const calls=renderer.info.render.calls,rgba=new Uint8Array(width*height*4);
   gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
   return {calls,rgba};
  };
  const withArm=renderRead(),wasVisible=arm?.visible;
  if(arm)arm.visible=false;
  const withoutArm=renderRead();
  if(arm)arm.visible=wasVisible;
  renderer.render(active.stage.scene,active.camera);
  let differentPixels=0;
  for(let y=Math.floor(height*.10);y<Math.floor(height*.75);y+=2){
   for(let x=Math.floor(width*.53);x<Math.floor(width*.97);x+=2){
    const i=(y*width+x)*4,a=withArm.rgba,b=withoutArm.rgba;
    if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>85)
     differentPixels++;
   }
  }
  const image=new ImageData(width,height),pixels=image.data;
  for(let row=0;row<height;row++)
   pixels.set(withArm.rgba.subarray(row*width*4,(row+1)*width*4),(height-1-row)*width*4);
  const capture=document.createElement('canvas');capture.width=width;capture.height=height;
  capture.getContext('2d').putImageData(image,0,0);
  return {withArmCalls:withArm.calls,withoutArmCalls:withoutArm.calls,differentPixels,
   armOnStage:arm?.parent===active.stage.scene,framebufferPng:capture.toDataURL('image/png')};
 },
 get qaKeypadHand(){return location.pathname.includes('/review/')?active?.keypadReach?.hand||null:null;},
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
 get exteriorDecay(){
  if(!location.pathname.includes('/review/')||!active?.stage)return null;
  const groups=active.stage.world.children.filter(o=>o.name?.startsWith('V63 imported CC0 exterior planter '));
  const plants=groups.map(group=>{
   const pot=group.children.find(o=>o.name.includes('weathering-steel-planter.glb'));
   const bush=group.children.find(o=>o.name.includes('rounded-landscape-shrub.glb'));
   let vertexColors=0,potColor=null,leafColor=null;
   pot?.traverse(o=>{if(o.isMesh&&!potColor)potColor=o.material?.color?.getHexString?.()||null});
   bush?.traverse(o=>{if(o.isMesh){vertexColors+=o.geometry?.getAttribute('color')?.count||0;
    if(!leafColor)leafColor=o.material?.color?.getHexString?.()||null;}});
   return {pot:!!pot,bush:!!bush,vertexColors,potColor,leafColor,
    bushTilt:[bush?.rotation?.x||0,bush?.rotation?.z||0]};
  });
  return {skyIsTexture:!!active.stage.scene.background?.isTexture,
   skyFile:active.stage.v37?.sky?.file||null,plants};
 },
 get sidewalkFinish(){
  if(!location.pathname.includes('/review/'))return null;
  const slab=active?.stage?.world?.getObjectByName('front_mall_sidewalk');
  const texture=slab?.material?.map;
  return slab?{name:slab.name,textureLoaded:!!texture?.image?.width,
   textureURL:texture?.image?.src||null,wrapS:texture?.wrapS,wrapT:texture?.wrapT,
   topUVRepeat:[slab.geometry.attributes.uv.getX(8),slab.geometry.attributes.uv.getY(8),
    slab.geometry.attributes.uv.getX(10),slab.geometry.attributes.uv.getY(10)],
   materialRoughness:slab.material.roughness}:null;
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
