/** V147: the real first glimpse visibly reacts to a physical decoy without an early hunt.
 * V139 keeps owning first reveal and all 15 protected seconds; V146 owns later
 * real nav-hearing and A*. This adds no fake actor, path, collider or HUD cue.
 */
import {FIRST_PEEK_V147,canDivertProtectedPeekV147,chooseProtectedPeekEndV147}
 from './chapter1-first-peek-decoy-v147.mjs';
const localQA=()=>typeof location!=='undefined'&&
 ['localhost','127.0.0.1'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');

export function installChapter1FirstPeekDecoyV147(game){
 if(game?.levelIndex!==0||!game.__chapter1StealthV139||
  !game.__chapter1RecoveryV140||!game.__chapter1DecoyResponseV146||
  !game.attendant?.hear||!game.attendant?.update||
  !game.attendant?.root||!game.world?.navDistance||
  !Array.isArray(game.decoyObjs)||typeof game.resetState!=='function')
  throw Error('V147 needs original Chapter 1, real decoys, V139 grace and V146 response');
 if(game.__chapter1FirstPeekDecoyV147)return game.__chapter1FirstPeekDecoyV147;
 const phase={extended:false,extendedAt:null,originalPeekEnd:null,
  diverted:false,diversionCount:0,turns:0,target:null,
  heardNavMetres:null,originalLanding:null,shortenedPeekEnd:null};
 const reset=()=>{
  Object.assign(phase,{extended:false,extendedAt:null,originalPeekEnd:null,
   diverted:false,diversionCount:0,turns:0,target:null,
   heardNavMetres:null,originalLanding:null,shortenedPeekEnd:null});
 };
 const originalHear=game.attendant.hear;
 game.attendant.hear=function(pos,strength,type='generic',...args){
  if(game.levelIndex===0&&type==='decoy'&&pos&&Number.isFinite(pos.x+pos.z)){
   const first=game.__chapter1StealthV139.getState();
   // Only original Game.updateDecoys may supply a valid ACTIVE thrown mesh.
   // No arbitrary calls, synthetic sound origin or QA-only movement.
   const thrown=game.decoyObjs.find(d=>d?.state==='active'&&d?.mesh?.position&&
    Math.hypot(d.mesh.position.x-pos.x,d.mesh.position.z-pos.z)<
     FIRST_PEEK_V147.originalSourceEpsilonMetres);
   const range=this.root?.visible&&thrown?
    game.world.navDistance(this.root.position,pos,48):Infinity;
   if(canDivertProtectedPeekV147({
    chapter:game.levelIndex+1,revealed:first.revealed,now:game.time,
    graceUntil:first.graceUntil,peekUntil:this.peekUntil,
    visible:!!this.root?.visible,state:this.state,
    sourceActive:!!thrown,alreadyDiverted:phase.diverted,pathMetres:range
   })){
    // The protected first appearance remains exactly the original 'stalk'
    // state. A noise lets the player see it turn away and withdraw early,
    // never asks the original AI to investigate/hunt during its safe debut.
    phase.diverted=true;phase.diversionCount++;
    phase.target={x:thrown.mesh.position.x,z:thrown.mesh.position.z};
    phase.originalLanding={x:pos.x,z:pos.z};
    phase.heardNavMetres=range;
    this.peekUntil=chooseProtectedPeekEndV147({
     now:game.time,previousPeekUntil:this.peekUntil});
    phase.shortenedPeekEnd=this.peekUntil;
    return;
   }
  }
  return originalHear.call(this,pos,strength,type,...args);
 };
 const originalUpdate=game.attendant.update;
 game.attendant.update=function(...args){
  const before=game.levelIndex===0?
   game.__chapter1StealthV139.getState().revealed:true;
  const result=originalUpdate.apply(this,args);
  if(game.levelIndex!==0)return result;
  const state=game.__chapter1StealthV139.getState();
  if(!before&&state.revealed&&this.root.visible&&this.state==='stalk'){
   // Slightly longer authentic first glimpse makes Q legible without
   // reducing the immutable 15s non-lethal grace or waking a hunt.
   phase.extended=true;phase.extendedAt=game.time;
   phase.originalPeekEnd=this.peekUntil;
   this.peekUntil=Math.max(this.peekUntil,
    game.time+FIRST_PEEK_V147.minimumRevealSeconds);
  }
  if(phase.diverted&&phase.target&&this.root.visible&&
   this.state==='stalk'&&game.time<this.peekUntil){
   // Original moving actor uses local +Z as forward; apply only AFTER the
   // source stalk updater has looked back at the player.
   const deltaX=phase.target.x-this.root.position.x;
   const deltaZ=phase.target.z-this.root.position.z;
   if(Math.hypot(deltaX,deltaZ)>.01){
    this.root.rotation.y=Math.atan2(deltaX,deltaZ);
    phase.turns++;
   }
  }
  return result;
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){const result=originalReset.apply(this,args);reset();return result;};
 const getState=()=>({
  version:147,chapter:game.levelIndex+1,
  revealed:game.__chapter1StealthV139.getState().revealed,
  graceUntil:game.__chapter1StealthV139.getState().graceUntil,
  gameTime:game.time,peekUntil:game.attendant.peekUntil,
  originalAttendantState:game.attendant.state,
  originalAttendantVisible:!!game.attendant.root.visible,
  originalAttendantAwake:!!game.attendant.awake,
  originalDecoyCount:game.decoys,
  actualOriginalThrown:game.decoyObjs.map(d=>({
   state:d.state,x:d.mesh.position.x,z:d.mesh.position.z
  })),
  extended:phase.extended,originalPeekEnd:phase.originalPeekEnd,
  extendedAt:phase.extendedAt,diverted:phase.diverted,
  diversionCount:phase.diversionCount,turns:phase.turns,
  sourceLanding:phase.originalLanding,sourceNavMetres:phase.heardNavMetres,
  reactionTarget:phase.target,shortenedPeekEnd:phase.shortenedPeekEnd,
  noExtraActors:true,noExtraColliders:true
 });
 const api=Object.freeze({version:147,getState});
 game.__chapter1FirstPeekDecoyV147=api;
 if(localQA()&&typeof window!=='undefined')
  window.__PINEWOOD_CH1_FIRST_PEEK_V147_QA__={getState};
 return api;
}
