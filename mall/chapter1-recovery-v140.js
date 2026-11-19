/** V140: fair original Chapter 1 pursuit, contact and death/restart recovery.
 * Adds no paths, assets, enemy clones, panels, or new voice lines.
 */
import {CHAPTER1_RECOVERY_V140,isPhysicalContactV140,pursueLastKnownV140,
 afterSearchCooldownV140} from './chapter1-recovery-rules-v140.mjs';
const LOCAL_QA=()=>typeof window!=='undefined'&&
 ['127.0.0.1','localhost'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');
export function installChapter1RecoveryV140(game){
 if(!game||!game.__chapter1StealthV139||!game.attendant?.setPath||
    !game.attendant?.canSee||!game.attendant?.update||
    !game.die||!game.resetState||!game.updateInteraction||!game.world?.hasLOS)
  throw Error('V140 requires complete V139 and original game/Attendant machinery');
 if(game.__chapter1RecoveryV140)return game.__chapter1RecoveryV140;
 const phase={lostPlayerPaths:0,blockedGhostContact:0,
  huntCues:0,searchCues:0,searchCooldowns:0,
  cueUntil:0,cueText:'',lastTransition:null};
 const reset=()=>Object.assign(phase,{lostPlayerPaths:0,blockedGhostContact:0,
  huntCues:0,searchCues:0,searchCooldowns:0,
  cueUntil:0,cueText:'',lastTransition:null});
 const originalSetPath=game.attendant.setPath;
 game.attendant.setPath=function(target,...args){
  // The original hunt uses playerPos EVERY repath, even when occluded.
  // After breaking line of sight, investigate the last *observed/heard*
  // floor cell, not a clairvoyantly updated position behind a shop wall.
  const actual=pursueLastKnownV140({
   levelIndex:game.levelIndex,state:this.state,
   player:game.controls.yaw.position,target,
   visible:this.canSee(game.controls.yaw.position),
   decoyActive:this.decoyUntil>game.time,lastKnown:this.lastHeard
  });
  if(actual!==target)phase.lostPlayerPaths++;
  return originalSetPath.call(this,actual,...args);
 };
 const originalDie=game.die;
 game.die=function(reason,...args){
  if(this.levelIndex===0&&reason===CHAPTER1_RECOVERY_V140.contactDeathReason){
   const player=this.controls?.yaw?.position,attendant=this.attendant?.root?.position;
   const valid=isPhysicalContactV140({
    player,attendant,levelY:this.mallLevelYV70??0,
    hidden:!!this.playerHidden,
    enteringTime:this.hideTransition?.mode==='enter'?this.hideTransition.t:null,
    sight:(a,b)=>this.world.hasLOS(a,b)
   });
   if(!valid){phase.blockedGhostContact++;return;}
  }
  return originalDie.call(this,reason,...args);
 };
 const originalUpdate=game.attendant.update;
 game.attendant.update=function(...args){
  const before=this.state;
  const result=originalUpdate.apply(this,args);
  if(game.levelIndex!==0||game.dead||game.won)return result;
  this.nextStalk=afterSearchCooldownV140({levelIndex:0,before,
   after:this.state,current:this.nextStalk});
  if(before==='search'&&this.state==='dormant')phase.searchCooldowns++;
  if(before!==this.state){
   phase.lastTransition={from:before,to:this.state,time:game.time};
   if(this.state==='hunt'&&phase.huntCues<1){
    phase.huntCues++;
    phase.cueUntil=game.time+CHAPTER1_RECOVERY_V140.huntCueSeconds;
    phase.cueText='Break sight behind real walls. Quiet footsteps or a Noise Maker can misdirect it.';
    game.flashFlicker=Math.max(game.flashFlicker||0,.28);
   }else if(this.state==='search'&&phase.searchCues<1){
    phase.searchCues++;
    phase.cueUntil=game.time+CHAPTER1_RECOVERY_V140.searchCueSeconds;
    phase.cueText='It is searching your last known location. Stay out of sight until it leaves.';
   }
  }
  return result;
 };
 const originalInteraction=game.updateInteraction;
 game.updateInteraction=function(...args){
  const result=originalInteraction.apply(this,args);
  if(this.levelIndex===0&&this.running&&!this.modal&&!this.dead&&
   !this.playerHidden&&!this.hideTransition&&!this.interactTarget&&
   phase.cueUntil>this.time&&typeof document!=='undefined'){
   const hint=document.getElementById('hint');
   if(hint){hint.textContent=phase.cueText;hint.classList.add('show');}
  }
  return result;
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){const result=originalReset.apply(this,args);reset();return result;};
 const getState=()=>({
  version:140,chapter:game.levelIndex+1,dead:!!game.dead,running:!!game.running,
  breakers:game.breakers,decoys:game.decoys,playerHidden:!!game.playerHidden,
  lostPlayerPaths:phase.lostPlayerPaths,blockedGhostContact:phase.blockedGhostContact,
  huntCues:phase.huntCues,searchCues:phase.searchCues,
  searchCooldowns:phase.searchCooldowns,lastTransition:phase.lastTransition,
  cueUntil:phase.cueUntil,attendantState:game.attendant.state,
  nextStalk:game.attendant.nextStalk,
  attendantVisible:!!game.attendant.root.visible,
  realCabinet:game.__chapter1StealthV139.getState().cabinet,
  realPickups:game.__chapter1StealthV139.getState().pickups
 });
 const api=Object.freeze({version:140,getState});
 game.__chapter1RecoveryV140=api;
 if(LOCAL_QA()){
  window.__PINEWOOD_CH1_RECOVERY_V140_QA__={
   getState,
   testBrokenSightFromRealFallowRoom(){
    if(game.levelIndex!==0||!game.running||game.modal||game.breakers<1)
     throw Error('An original live Chapter 1 breaker is required');
    const g=game,a=g.attendant,p=g.controls.yaw.position;
    g.time=Math.max(g.time,g.__chapter1StealthV139.getState().graceUntil+1);
    p.set(-41,1.7,-54);g.camera.updateWorldMatrix(true,false);
    a.root.visible=true;a.awake=true;a.state='hunt';a.timer=3;
    a.repath=-1;a.root.position.set(-27,0,-54);
    a.root.rotation.y=Math.PI/2;
    a.prevPos.copy(a.root.position);
    a.lastHeard.set(-27,0,-62);a.decoyUntil=0;
    const los=g.world.hasLOS(a.root.position,p);
    const beforePaths=phase.lostPlayerPaths;
    a.update(.016,g.time,p,.1);
    const last=a.path?.at(-1)||null;
    return {los,seen:a.canSee(p),pathEnd:last?{x:last.x,z:last.z}:null,
     expectedLastHeard:{x:-27,z:-62},lostPlayerPathsDelta:phase.lostPlayerPaths-beforePaths,
     state:getState()};
   },
   testRealSearchCooldown(){
    if(game.levelIndex!==0||!game.running||game.modal||game.breakers<1)
     throw Error('An original live Chapter 1 breaker is required');
    const g=game,a=g.attendant,p=g.controls.yaw.position;
    g.time=Math.max(g.time,g.__chapter1StealthV139.getState().graceUntil+2);
    a.root.visible=true;a.awake=true;a.state='search';a.timer=.001;
    a.repath=-1;a.root.position.set(-17,0,-79);a.prevPos.copy(a.root.position);
    p.set(16,1.7,-72);g.camera.updateWorldMatrix(true,false);
    a.update(.04,g.time,p,0);
    return getState();
   },
   testBlockedWallContact(){
    if(game.levelIndex!==0||!game.running||game.modal)throw Error('Original Chapter 1 must be playing');
    // Test the live game world's *actual* canonical Fallow wall geometry
    // with a short cross-wall segment, never teleporting or saving a draft.
    const before=phase.blockedGhostContact;
    const oldP=game.controls.yaw.position.clone(),oldA=game.attendant.root.position.clone();
    const oldDead=game.dead;
    try{
     const testPositions=[
      [{x:-29.25,z:-54},{x:-28.80,z:-54}],
      [{x:-29.2,z:-56},{x:-28.8,z:-56}],
      [{x:29.2,z:-51},{x:28.8,z:-51}]
     ];
     for(const [a,p] of testPositions){
      const los=game.world.hasLOS(a,p);
      if(los)continue;
      game.controls.yaw.position.set(p.x,1.7,p.z);
      game.attendant.root.position.set(a.x,game.mallLevelYV70??0,a.z);
      game.die(CHAPTER1_RECOVERY_V140.contactDeathReason);
      return {test:{a,p,los},blocked:phase.blockedGhostContact-before,
       dead:game.dead};
     }
     return {test:null,blocked:0,dead:game.dead,unverified:true};
    }finally{
     if(!game.dead){game.controls.yaw.position.copy(oldP);
      game.attendant.root.position.copy(oldA);}
    }
   },
   triggerGenuineAttendantContact(){
    if(game.levelIndex!==0||!game.running||game.modal||game.breakers<1)
     throw Error('Original Chapter 1 must be playing with real power');
    const g=game,a=g.attendant,p=g.controls.yaw.position;
    g.time=Math.max(g.time,g.__chapter1StealthV139.getState().graceUntil+3);
    p.set(-17,1.7,-79);g.camera.updateWorldMatrix(true,false);
    a.root.position.set(-17.35,0,-79);
    a.prevPos.copy(a.root.position);a.root.visible=true;
    a.awake=true;a.state='hunt';a.timer=8;a.repath=.5;a.decoyUntil=0;
    const los=g.world.hasLOS(a.root.position,p);
    if(!los)throw Error('Genuine contact test is not on one LOS-clear walkable gallery');
    a.update(.016,g.time,p,0);
    return {los,state:getState()};
   }
  };
 }
 return api;
}
