/** V144: physical stealth cues, using original masonry and existing local CC0 sounds. */
import * as THREE from '../vendor/three/build/three.module.js';
import {CHAPTER1_SOUNDS_V144,planChapter1NoticesV144} from './chapter1-atmosphere-v144.mjs';
const localQA=()=>typeof location!=='undefined'&&
 ['127.0.0.1','localhost'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');
function makeNotice(site){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=536;
 const c=canvas.getContext('2d');
 if(!c)throw Error('V144 needs 2D canvas to paint a physical notice');
 c.fillStyle='#b9af8d';c.fillRect(0,0,1024,536);
 c.fillStyle='#242923';c.fillRect(32,26,960,7);c.fillRect(32,502,960,6);
 c.strokeStyle='#4c4837';c.lineWidth=5;c.strokeRect(24,18,976,500);
 for(let i=0;i<115;i++){
  c.fillStyle='rgba(53,45,31,0.07)';
  c.fillRect(44+(i*137)%930,50+(i*73)%430,2+(i%3),1+(i%4));
 }
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#282d27';
 c.font='bold 45px Arial, sans-serif';c.fillText(site.heading,512,112,916);
 c.fillRect(80,169,864,3);c.font='bold 42px Arial, sans-serif';
 for(let i=0;i<site.lines.length;i++)
  c.fillText(site.lines[i],512,240+i*90,926);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({
  map:texture,roughness:1,metalness:0,side:THREE.FrontSide,
  emissive:new THREE.Color('#635d48'),emissiveIntensity:.06
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(site.width,site.height),material);
 mesh.name='v144_original_wall_notice_'+site.id;
 mesh.position.set(site.x,site.y,site.z);mesh.rotation.y=site.yaw;
 mesh.userData={chapter1PhysicalNoticeV144:true,wallId:site.wallId,
  breaker:site.breaker,kind:site.id};
 return mesh;
}
export function installChapter1AtmosphereV144(game){
 if(game?.levelIndex!==0||!game.mallV70?.group?.add||!game.mallLayoutV70||
  !game.__chapter1WallPanelsV141||!game.__chapter1StealthV139||
  !game.__chapter1RecoveryV140||typeof game.attendant?.update!=='function'||
  typeof game.resetState!=='function')
  throw Error('V144 requires original Chapter 1, real masonry and fair stealth');
 if(game.__chapter1AtmosphereV144){
  game.__chapter1AtmosphereV144.bind();return game.__chapter1AtmosphereV144;
 }
 let boundGroup=null,notices=[];
 const sounded={firstSighting:false,firstHunt:false},playing=new Set();
 const dispose=()=>{
  for(const m of notices){
   m.removeFromParent();m.geometry.dispose();m.material.map.dispose();m.material.dispose();
  }
  notices=[];boundGroup=null;
 };
 const bind=()=>{
  if(game.levelIndex!==0)return;
  const group=game.mallV70.group;
  if(group===boundGroup&&notices.length===3)return;
  const sites=planChapter1NoticesV144(game.mallLayoutV70);
  dispose();
  // No new scene collision and no new source interactable: these are printed marks.
  if(typeof document!=='undefined'){
   notices=sites.map(makeNotice);
   for(const m of notices)group.add(m);
  }
  boundGroup=group;
 };
 const play=(kind,origin,volume)=>{
  if(typeof Audio==='undefined'||!game.running||game.modal||game.dead||game.won)return;
  const p=game.controls?.yaw?.position;
  const distance=p&&origin?Math.hypot(p.x-origin.x,p.z-origin.z):0;
  const attenuation=Math.max(0,1-distance/26);
  if(attenuation<.05)return;
  const file=CHAPTER1_SOUNDS_V144[kind];
  if(!file)return;
  const audio=new Audio(new URL('../assets/audio/cc0/'+file,import.meta.url).href);
  audio.volume=Math.min(.17,Math.max(0,volume*attenuation));
  playing.add(audio);
  audio.addEventListener('ended',()=>playing.delete(audio),{once:true});
  try{const promise=audio.play();
   if(promise?.catch)promise.catch(()=>playing.delete(audio));
  }catch{playing.delete(audio);}
 };
 const previousUpdate=game.attendant.update;
 game.attendant.update=function(...args){
  const result=previousUpdate.apply(this,args);
  if(game.levelIndex!==0||game.dead||game.won)return result;
  if(!sounded.firstSighting&&game.__chapter1StealthV139.getState().revealed){
   sounded.firstSighting=true;play('firstSighting',this.root?.position,.19);
  }
  if(!sounded.firstHunt&&this.state==='hunt'){
   sounded.firstHunt=true;play('firstHunt',null,.12);
  }
  return result;
 };
 const previousReset=game.resetState;
 game.resetState=function(...args){
  const result=previousReset.apply(this,args);
  for(const a of playing)a.pause();
  playing.clear();sounded.firstSighting=false;sounded.firstHunt=false;
  if(this.levelIndex===0)bind();
  return result;
 };
 const getState=()=>({
  version:144,chapter:game.levelIndex+1,
  physicalNotices:notices.map(m=>({
   name:m.name,attached:m.parent===boundGroup,originalWall:m.userData.wallId,
   breaker:m.userData.breaker,x:m.position.x,y:m.position.y,z:m.position.z
  })),
  firstSightingHeard:sounded.firstSighting,firstHuntHeard:sounded.firstHunt,
  independentColliders:0,independentInteractables:0,
  localSounds:Object.values(CHAPTER1_SOUNDS_V144)
 });
 const api=Object.freeze({version:144,bind,getState});
 game.__chapter1AtmosphereV144=api;bind();
 if(localQA()&&typeof window!=='undefined')
  window.__PINEWOOD_CH1_ATMOSPHERE_V144_QA__={getState};
 return api;
}
