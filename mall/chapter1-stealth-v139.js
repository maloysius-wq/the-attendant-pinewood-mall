/** V139: real Chapter 1 hiding and Noise Maker restoration.
 * Source GLB is already in the shared authored mall, not a new prop or proxy.
 * The game's original cabinet/decoy/Attendant mechanics remain authoritative.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {CHAPTER1_STEALTH_V139,chooseDistantRevealV139} from './chapter1-stealth-plan-v139.mjs';
const SOURCE=FURNISHINGS_V69.fixtures.find(f=>f.id===CHAPTER1_STEALTH_V139.cabinet.id);
if(!SOURCE||SOURCE.role!=='cabinet')throw Error('V139 canonical Fallow cabinet source missing');
const LOCAL_HOST=()=>typeof location!=='undefined'&&
 ['127.0.0.1','localhost'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');
export function restoreChapter1StealthPickupsV139(source){
 if(typeof source!=='string')throw TypeError('V139 requires the exact V137 original runtime');
 const marker='world.root.add(masterServiceKeyV137);world.interactables.push(masterServiceKeyV137);';
 if(source.split(marker).length!==2||
    source.includes('const noiseMakerV139=makePickup('))
  throw Error('V139 original key/pickup anchor missing or repeated');
 const addition=String.raw`
    // Two actual original prototype pickups lost with the old stores.
    // V70 moves them into genuine measured Chapter 1 walkable locations.
    const noiseMakerV139=makePickup('decoy',new THREE.Vector3(-19.7,.16,-28.1),'Noise Maker');
    world.root.add(noiseMakerV139);world.interactables.push(noiseMakerV139);
    const pagerDecoyV139=makePickup('decoy',new THREE.Vector3(-2.7,.16,28.3),'Pager Decoy');
    world.root.add(pagerDecoyV139);world.interactables.push(pagerDecoyV139);`;
 return source.replace(marker,marker+addition);
}
export function installChapter1StealthV139(game){
 if(!game?.mallV70?.group?.getObjectByName||!Array.isArray(game.world?.interactables)||
    typeof game.enterCabinet!=='function'||typeof game.interact!=='function'||
    typeof game.resetState!=='function'||typeof game.updateInteraction!=='function'||
    typeof game.attendant?.update!=='function'||typeof game.attendant?.hear!=='function'||
    typeof game.attendant?.awaken!=='function')
  throw Error('V139 requires original Game, Attendant and authored mall');
 if(game.__chapter1StealthV139){game.__chapter1StealthV139.bind();return game.__chapter1StealthV139;}
 let sourceModel=null,logical=null,doorLeft=null,doorRight=null;
 const phase={firstCircuitAt:null,revealAt:null,revealed:false,graceUntil:0,tutorialUntil:0};
 const resetPhase=()=>{
  Object.assign(phase,{firstCircuitAt:null,revealAt:null,revealed:false,graceUntil:0,tutorialUntil:0});
  if(doorLeft)doorLeft.rotation.y=0;
  if(doorRight)doorRight.rotation.y=0;
 };
 const bind=()=>{
  if(game.levelIndex!==0)return;
  const model=game.mallV70.group.getObjectByName('cc0_'+SOURCE.id,true);
  if(!model||model.userData?.cc0ProvenancePath!==SOURCE.model)
   throw Error('V139 original CC0 hide cabinet missing from the true mall');
  const left=model.getObjectByName('doorLeft',true),right=model.getObjectByName('doorRight',true);
  if(!left?.isObject3D||!right?.isObject3D||left===right)
   throw Error('V139 genuine licensed hinged door meshes unavailable');
  if(model!==sourceModel){
   sourceModel=model;doorLeft=left;doorRight=right;
   logical=new THREE.Group();logical.name='v139_logical_cabinet_no_geometry';
   logical.position.set(SOURCE.x,0,SOURCE.z);
   logical.rotation.y=SOURCE.yaw||0;
   logical.userData={type:'cabinet',hingeL:left,hingeR:right,open:0,sourceId:SOURCE.id};
  }
  // Real GLB mesh is the raycast target. There is no added visual mesh or
  // duplicated floor collider; original licensed furniture already blocks.
  model.userData.type='cabinet';
  if(!game.world.interactables.includes(model))game.world.interactables.push(model);
  left.rotation.y=0;right.rotation.y=0;logical.userData.open=0;
 };
 const origEnter=game.enterCabinet;
 game.enterCabinet=function(cab){
  // Its GLB root has a source-scale transform; the original hide camera
  // expects metre-space localToWorld at y=1.7. Supply a separate invisible
  // logical transform, while animating the ACTUAL doorLeft/doorRight meshes.
  return origEnter.call(this,cab===sourceModel?logical:cab);
 };
 const origAwaken=game.attendant.awaken;
 game.attendant.awaken=function(...args){
  if(game.levelIndex===0&&!phase.revealed)return;
  return origAwaken.apply(this,args);
 };
 const origHear=game.attendant.hear;
 game.attendant.hear=function(...args){
  if(game.levelIndex===0&&(!phase.revealed||game.time<phase.graceUntil))return;
  return origHear.apply(this,args);
 };
 const origUpdate=game.attendant.update;
 game.attendant.update=function(...args){
  if(game.levelIndex!==0)return origUpdate.apply(this,args);
  if(phase.firstCircuitAt===null&&game.breakers>0){
   phase.firstCircuitAt=game.time;phase.revealAt=game.time+CHAPTER1_STEALTH_V139.revealDelay;
  }
  if(!phase.revealed){
   if(phase.revealAt===null||game.time<phase.revealAt)return;
   const p=game.controls?.yaw?.position;
   const forward=new THREE.Vector3();
   if(!p||!game.camera?.getWorldDirection)return;
   game.camera.getWorldDirection(forward);forward.y=0;
   if(forward.lengthSq()<.01)return;forward.normalize();
   const at=chooseDistantRevealV139({
    player:p,forward,walk:game.world.walk,
    passable:(x,z)=>game.world.navPassable(x,z),
    sight:(pt)=>game.world.hasLOS(p,pt),
    allowSide:game.time-phase.revealAt>CHAPTER1_STEALTH_V139.sideFallbackSeconds
   });
   if(!at)return;
   this.awake=true;
   this.root.position.set(at.x,game.mallLevelYV70??0,at.z);
   this.prevPos.copy(this.root.position);
   this.root.visible=true;this.root.lookAt(p.x,game.mallLevelYV70??0,p.z);
   this.state='stalk';this.path=[];this.pathIndex=0;
   this.peekUntil=game.time+CHAPTER1_STEALTH_V139.peekSeconds;
   this.nextStalk=CHAPTER1_STEALTH_V139.graceSeconds+8;
   phase.revealed=true;phase.graceUntil=game.time+CHAPTER1_STEALTH_V139.graceSeconds;
   phase.tutorialUntil=game.time+6.5;
  }
  // Prevent any real hunt before the sighting is over and the player has
  // received a recoverable breathing/hiding/decoy tutorial window.
  if(game.time<phase.graceUntil&&this.state!=='stalk')return;
  return origUpdate.apply(this,args);
 };
 const origInteract=game.interact;
 game.interact=function(...args){
  const before=this.breakers;
  const out=origInteract.apply(this,args);
  if(this.levelIndex===0&&before===0&&this.breakers>0&&phase.firstCircuitAt===null){
   phase.firstCircuitAt=this.time;phase.revealAt=this.time+CHAPTER1_STEALTH_V139.revealDelay;
  }
  return out;
 };
 const origUpdateInteraction=game.updateInteraction;
 game.updateInteraction=function(...args){
  const result=origUpdateInteraction.apply(this,args);
  if(this.levelIndex===0&&this.running&&!this.modal&&!this.playerHidden&&
     !this.interactTarget&&this.time<phase.tutorialUntil){
   const hint=typeof document!=='undefined'?document.getElementById('hint'):null;
   if(hint){
    hint.textContent='Stay quiet: E hide in a cabinet  •  C hold breath  •  Q throw Noise Maker';
    hint.classList.add('show');
   }
  }
  return result;
 };
 const origReset=game.resetState;
 game.resetState=function(...args){const result=origReset.apply(this,args);resetPhase();return result;};
 const snapshot=()=>({
  version:139,chapter:game.levelIndex+1,attached:!!sourceModel,
  cabinet:{id:SOURCE.id,source:SOURCE.model,
   interactive:!!sourceModel&&game.world.interactables.includes(sourceModel),
   leftDoorY:doorLeft?.rotation.y??null,rightDoorY:doorRight?.rotation.y??null},
  pickups:game.world.interactables.filter(x=>x.userData?.type==='decoy').map(x=>({
   label:x.userData.label,x:x.position.x,z:x.position.z,collected:!!x.userData.collected})),
  firstCircuitAt:phase.firstCircuitAt,revealAt:phase.revealAt,
  revealed:phase.revealed,graceUntil:phase.graceUntil,
  attendantState:game.attendant.state,attendantVisible:!!game.attendant.root.visible,
  attendantPosition:{x:game.attendant.root.position.x,z:game.attendant.root.position.z},
  playerHidden:!!game.playerHidden,decoys:game.decoys
 });
 const api=Object.freeze({version:139,bind,getState:snapshot});
 game.__chapter1StealthV139=api;
 bind();
 if(LOCAL_HOST()&&typeof window!=='undefined'){
  window.__PINEWOOD_CH1_STEALTH_V139_QA__={
   getState:snapshot,
   collectRealNoiseMakerForTest(){
    if(game.levelIndex!==0||!game.running||game.modal)throw Error('Chapter 1 must be playing');
    const dec=game.world.interactables.find(o=>o.userData?.type==='decoy'&&
      o.userData.label==='Noise Maker'&&!o.userData.collected);
    if(!dec)throw Error('Genuine original Noise Maker pickup missing');
    const old=game.interactTarget;try{game.interactTarget=dec;game.interact();}
    finally{game.interactTarget=old;}
    return snapshot();
   },
   enterRealCabinetForTest(){
    if(game.levelIndex!==0||!game.running||game.modal)throw Error('Chapter 1 must be playing');
    const old=game.interactTarget;
    try{game.interactTarget=sourceModel;game.interact();game.updateHide(1.25);}
    finally{game.interactTarget=old;}
    return snapshot();
   },
   exitRealCabinetForTest(){
    if(!game.playerHidden)throw Error('Player not genuinely hidden');
    game.interact();game.updateHide(1.17);return snapshot();
   },
   throwRealDecoyForTest(){
    if(game.decoys<1)throw Error('No real decoy collected');
    game.throwDecoy();return {state:snapshot(),liveThrown:game.decoyObjs.length};
   },
   revealFromActualSceneForTest(){
    if(game.levelIndex!==0||game.breakers<1||phase.revealAt===null)
     throw Error('Actual breaker not activated');
    game.time=Math.max(game.time,phase.revealAt+.01);
    game.attendant.update(.016,game.time,game.controls.yaw.position,0);
    return snapshot();
   }
  };
 }
 return api;
}
