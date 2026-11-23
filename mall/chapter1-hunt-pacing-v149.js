/** V149: source-authentic Chapter 1 hunt-to-search with reachable memory sweep.
 * Original Attendant, wall collision, source A*, V140 fair contact, V146 Q
 * and V147 first protected glimpse remain authoritative.
 */
import {SEARCH_RULES_V149,capLostSightHuntV149,chooseLastHeardSweepV149}
 from './chapter1-hunt-pacing-v149.mjs';
const localQA=()=>typeof location!=='undefined'&&
 ['localhost','127.0.0.1'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');

export function installChapter1HuntPacingV149(game){
 if(game?.levelIndex!==0||!game.__chapter1StealthV139||
  !game.__chapter1RecoveryV140||!game.__chapter1DecoyResponseV146||
  !game.__chapter1FirstPeekDecoyV147||!game.attendant?.setPath||
  !game.attendant?.update||!game.attendant?.lastHeard||
  !game.world?.astar||!game.world?.navPassable||!game.world?.cellFromWorld||
  typeof game.resetState!=='function')
  throw Error('V149 requires real Chapter 1 original Attendant and V140/V146/V147');
 if(game.__chapter1HuntPacingV149)return game.__chapter1HuntPacingV149;
 const phase={searchEntries:0,searchExits:0,sourceSweepPaths:0,
  inaccessibleSourcePaths:0,postSightCaps:0,sweepIndex:0,
  lastSweep:null,sourceLastHeard:null};
 const reset=()=>Object.assign(phase,{searchEntries:0,searchExits:0,
  sourceSweepPaths:0,inaccessibleSourcePaths:0,postSightCaps:0,
  sweepIndex:0,lastSweep:null,sourceLastHeard:null});
 const originalSetPath=game.attendant.setPath;
 game.attendant.setPath=function(target,...args){
  if(game.levelIndex!==0||this.state!=='search')
   return originalSetPath.call(this,target,...args);
  const next=chooseLastHeardSweepV149({
   world:game.world,source:this.lastHeard,
   actor:this.root.position,step:phase.sweepIndex
  });
  if(!next){
   phase.inaccessibleSourcePaths++;
   this.path=[];this.pathIndex=0;
   return;
  }
  phase.sweepIndex=(next.index+1)%SEARCH_RULES_V149.offsets.length;
  phase.sourceSweepPaths++;
  phase.lastSweep={x:next.goal.x,z:next.goal.z,
   sourceX:next.centre.x,sourceZ:next.centre.z,
   originalRouteSteps:next.routeLength,
   originalCellPassable:game.world.navPassable(next.goal.x,next.goal.z)};
  return originalSetPath.call(this,next.goal,...args);
 };
 const originalUpdate=game.attendant.update;
 game.attendant.update=function(...args){
  const before=this.state;
  const result=originalUpdate.apply(this,args);
  if(game.levelIndex!==0||game.dead||game.won)return result;
  if(this.state==='hunt'&&this.root?.visible&&
   game.__chapter1StealthV139.getState().revealed){
   const p=game.controls.yaw.position;
   const capped=capLostSightHuntV149({
    chapter:1,state:this.state,visible:true,seen:this.canSee(p),
    hidden:!!game.playerHidden,decoyUntil:this.decoyUntil,
    now:game.time,timer:this.timer
   });
   if(capped<this.timer){this.timer=capped;phase.postSightCaps++;}
  }
  if(before!=='search'&&this.state==='search'&&this.root?.visible){
   phase.searchEntries++;phase.sweepIndex=0;
   phase.sourceLastHeard={x:this.lastHeard.x,z:this.lastHeard.z};
   // The original hunt path may still point down a corridor toward a
   // now-unseen player. Stop carrying it into the search and start on the
   // last actual sound/observation using original source A*.
   this.path=[];this.pathIndex=0;
   this.setPath(this.lastHeard);
   this.repath=1;
  }else if(before==='search'&&this.state==='dormant'){
   phase.searchExits++;
  }
  return result;
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){
  const result=originalReset.apply(this,args);reset();return result;
 };
 const getState=()=>({
  version:149,chapter:game.levelIndex+1,
  originalAIState:game.attendant.state,
  originalActorVisible:!!game.attendant.root.visible,
  originalTimer:game.attendant.timer,
  originalNextStalk:game.attendant.nextStalk,
  originalLastHeard:{
   x:game.attendant.lastHeard.x,z:game.attendant.lastHeard.z
  },
  originalPathEnd:(p=>p?{x:p.x,z:p.z}:null)(game.attendant.path?.at(-1)),
  ...phase
 });
 const api=Object.freeze({version:149,getState});
 game.__chapter1HuntPacingV149=api;
 if(localQA()&&typeof window!=='undefined'){
  window.__PINEWOOD_CH1_HUNT_PACING_V149_QA__={
   getState,
   examineActualFallowSearch(){
    if(game.levelIndex!==0||!game.running||game.modal||game.breakers<1)
     throw Error('V149 real original Chapter 1 circuit must be running');
    const a=game.attendant,p=game.controls.yaw.position;
    game.time=Math.max(game.time,
     game.__chapter1StealthV139.getState().graceUntil+3);
    p.set(-41,1.7,-54);game.camera.updateWorldMatrix(true,false);
    a.awake=true;a.root.visible=true;
    a.root.position.set(-27,0,-54);a.prevPos.copy(a.root.position);
    a.root.rotation.y=Math.PI/2;
    a.state='hunt';a.timer=9;a.repath=-1;a.decoyUntil=0;
    a.lastHeard.set(-27,0,-62);
    const actualLOS=game.world.hasLOS(a.root.position,p);
    const initialAISee=a.canSee(p);
    if(actualLOS||initialAISee)throw Error('Original Fallow wall has lost LOS safety');
    a.update(.016,game.time,p,0);
    const capped=getState();
    a.timer=.002;
    a.update(.04,game.time,p,0);
    const source=getState();
    const realFirstPath=a.path?.slice()||[];
    a.repath=0;a.update(1.05,game.time,p,0);
    const sweep=getState();
    return {actualLOS,initialAISee,capped,source,sweep,realFirstPath,
     originalSourceWalkable:game.world.navPassable(-27,-62),
     lastHeardOriginalRoute:game.world.astar(
      game.world.cellFromWorld(-27,-54),game.world.cellFromWorld(-27,-62)
     ).length};
   }
  };
 }
 return api;
}
