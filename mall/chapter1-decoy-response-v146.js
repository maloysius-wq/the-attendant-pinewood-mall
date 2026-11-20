/** V146: original Attendant listens to real landing/pulses, not phantom distant sources.
 * No AI clones, path-grid edits, fabricated player safety or extra dialogue.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {DECOY_RULES_V146,shouldHearDecoyV146,visiblePlayerOverridesDecoyV146}
 from './chapter1-decoy-response-v146.mjs';
const localQA=()=>typeof location!=='undefined'&&
 ['localhost','127.0.0.1'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');

export function installChapter1DecoyResponseV146(game){
 if(game?.levelIndex!==0||!game.__chapter1StealthV139||
   !game.__chapter1RecoveryV140||!game.__chapter1DecoyTagsV145||
   !game.attendant?.hear||!game.attendant?.update||
   typeof game.attendant.canSee!=='function'||
   typeof game.world?.navDistance!=='function'||
   !Array.isArray(game.decoyObjs)||typeof game.throwDecoy!=='function'||
   typeof game.updateDecoys!=='function'||typeof game.resetState!=='function')
  throw Error('V146 requires original source Attendant, decoys, V140 fairness and V145 pickup');
 if(game.__chapter1DecoyResponseV146)return game.__chapter1DecoyResponseV146;
 const phase={heard:0,rejectedFar:0,rejectedVisible:0,rejectedHidden:0,
  coalesced:0,visualPriority:0,lastEvent:null};
 let lastPerDecoy=new WeakMap();
 const reset=()=>{
  Object.assign(phase,{heard:0,rejectedFar:0,rejectedVisible:0,rejectedHidden:0,
   coalesced:0,visualPriority:0,lastEvent:null});
  lastPerDecoy=new WeakMap();
 };
 const originalHear=game.attendant.hear;
 game.attendant.hear=function(pos,strength,type='generic',...args){
  if(game.levelIndex!==0||type!=='decoy')
   return originalHear.call(this,pos,strength,type,...args);
  // The original thrown THREE mesh and original updateDecoys land/pulse are
  // always the source: never synthesize a noise or target coordinates.
  const source=game.decoyObjs.find(d=>d?.state==='active'&&d?.mesh?.position&&
   Math.hypot(d.mesh.position.x-pos.x,d.mesh.position.z-pos.z)<
    DECOY_RULES_V146.sameSourceMetres);
  const prior=source?lastPerDecoy.get(source):null;
  const visible=!!this.root?.visible,player=game.controls?.yaw?.position;
  const seesPlayer=visible&&!game.playerHidden&&player?this.canSee(player):false;
  const range=visible?game.world.navDistance(this.root.position,pos,48):Infinity;
  const allowed=shouldHearDecoyV146({
   chapter:1,type,visible,seesPlayer,navDistance:range,
   sameSource:!!prior,secondsSinceAccepted:prior?game.time-prior.time:Infinity
  });
  if(!allowed){
   if(!visible)phase.rejectedHidden++;
   else if(seesPlayer)phase.rejectedVisible++;
   else if(!Number.isFinite(range)||range>DECOY_RULES_V146.maxNavHearingMetres)
    phase.rejectedFar++;
   else phase.coalesced++;
   return;
  }
  phase.heard++;
  phase.lastEvent={at:game.time,originalPosition:{x:pos.x,z:pos.z},navMetres:range,
   originalSource:source?'active-thrown-decoy':'original-emitted-decoy-event'};
  if(source)lastPerDecoy.set(source,{time:game.time});
  return originalHear.call(this,pos,strength,type,...args);
 };
 const originalUpdate=game.attendant.update;
 game.attendant.update=function(...args){
  if(game.levelIndex===0&&this.root?.visible&&
    visiblePlayerOverridesDecoyV146({
     chapter:1,visible:true,hidden:!!game.playerHidden,
     time:game.time,decoyUntil:this.decoyUntil,
     seesPlayer:this.canSee(game.controls.yaw.position)
    })){
   // The original visual perception takes precedence over a decoy if the
   // human is actually seen. No through-wall omniscience or automatic stun.
   this.decoyUntil=game.time;phase.visualPriority++;
  }
  return originalUpdate.apply(this,args);
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){
  const result=originalReset.apply(this,args);
  reset();return result;
 };
 const getState=()=>({
  version:146,chapter:game.levelIndex+1,
  heard:phase.heard,rejectedFar:phase.rejectedFar,
  rejectedVisible:phase.rejectedVisible,rejectedHidden:phase.rejectedHidden,
  coalesced:phase.coalesced,visualPriority:phase.visualPriority,
  lastEvent:phase.lastEvent,
  originalAttendantState:game.attendant.state,
  originalDecoyActiveUntil:game.attendant.decoyUntil,
  originalDecoyPosition:{x:game.attendant.decoyPos.x,z:game.attendant.decoyPos.z},
  originalPathEnd:(()=>{
   const p=game.attendant.path?.at(-1);
   return p?{x:p.x,z:p.z}:null;
  })(),
  originalPlayer:{x:game.controls.yaw.position.x,z:game.controls.yaw.position.z},
  activeOriginalDecoys:game.decoyObjs.map(d=>({
   state:d.state,life:d.life,pulse:d.pulse,
   x:d.mesh.position.x,z:d.mesh.position.z
  })),
  originalInventory:game.decoys
 });
 const api=Object.freeze({version:146,getState});
 game.__chapter1DecoyResponseV146=api;
 if(localQA()&&typeof window!=='undefined'){
  const ensure=()=>{
   if(game.levelIndex!==0||!game.running||game.dead||game.modal||
      game.breakers<1||!game.__chapter1StealthV139.getState().revealed)
    throw Error('Real live Chapter 1 breaker and distant sighting are necessary');
  };
  window.__PINEWOOD_CH1_DECOY_RESPONSE_V146_QA__={
   getState,
   prepareActualGalleryHunt(){
    ensure();
    const p=game.controls.yaw.position,a=game.attendant;
    const player={x:-17,z:-79},enemy={x:-20,z:-79};
    if(!game.world.canStand(player.x,player.z)||!game.world.navPassable(enemy.x,enemy.z))
     throw Error('V146 original west gallery route no longer standable');
    const range=game.world.navDistance(enemy,player,48);
    if(!Number.isFinite(range)||range>20)
     throw Error('V146 original nearby gallery route no longer connected');
    game.time=Math.max(game.time,game.__chapter1StealthV139.getState().graceUntil+1);
    p.set(player.x,1.7,player.z);
    game.controls.yaw.rotation.y=Math.PI/2;game.controls.pitch.rotation.x=0;
    game.camera.updateWorldMatrix(true,false);
    a.awake=true;a.root.visible=true;
    a.root.position.set(enemy.x,game.mallLevelYV70||0,enemy.z);
    a.root.lookAt(enemy.x-8,0,enemy.z); // Real gallery: looking west, player east.
    a.prevPos.copy(a.root.position);a.state='hunt';a.timer=8;a.repath=-1;
    a.decoyUntil=0;a.lastHeard.copy(p);a.path=[];a.pathIndex=0;
    if(a.canSee(p))throw Error('Actual player is wrongly visible to backwards-facing threat');
    return {setup:true,range,getState:getState()};
   },
   advanceActualThrownDecoy(steps=36,dt=.06){
    ensure();
    if(!Number.isInteger(steps)||steps<1||steps>160||dt<=0||dt>.15)
     throw Error('QA accepts bounded genuine source decoy physics steps only');
    for(let i=0;i<steps;i++){
     game.time+=dt;game.updateDecoys(dt);
     game.attendant.update(dt,game.time,game.controls.yaw.position,0);
     if(game.dead)throw Error('Original Attendant unfairly killed player during decoy investigation');
    }
    return getState();
   },
   sendFarActualSourceSound(){
    ensure();
    const target=new THREE.Vector3(16,0,-72);
    const nav=game.world.navDistance(game.attendant.root.position,target,48);
    if(!Number.isFinite(nav)||nav<=DECOY_RULES_V146.maxNavHearingMetres)
     throw Error('Actual distant east gallery must exceed the bounded audible range '+nav);
    const old=game.attendant.decoyUntil;
    game.attendant.hear(target,1,'decoy');
    return {nav,untouched:game.attendant.decoyUntil===old,state:getState()};
   },
   proveVisiblePlayerOverridesDecoy(){
    ensure();
    const p=game.controls.yaw.position,a=game.attendant;
    p.set(-17,1.7,-79);game.camera.updateWorldMatrix(true,false);
    a.root.position.set(-17,game.mallLevelYV70||0,-86);
    a.root.lookAt(p.x,0,p.z);
    a.state='investigate';a.timer=7;a.repath=-1;a.awake=true;a.root.visible=true;
    a.decoyUntil=game.time+6;a.decoyPos.set(-22,0,-79);
    const seen=a.canSee(p),los=game.world.hasLOS(a.root.position,p);
    if(!seen||!los)throw Error('Original visible-gallery vision must be true to test priority');
    const before=phase.visualPriority;
    a.update(.016,game.time,p,0);
    return {seen,los,prioritized:phase.visualPriority===before+1,
     decoyExpired:a.decoyUntil<=game.time,state:getState()};
   }
  };
 }
 return api;
}
