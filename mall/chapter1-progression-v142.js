/** V142 original Chapter 1 end-to-end QA and guarded, source-authentic progression.
 * Dev probe exists ONLY with chapter1QA on localhost, no public cheats.
 * All interactions use the real source Game and real THREE first-person raycaster.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {eligibleFreightCredentialV142} from './chapter1-progression-v142.mjs';
import {chapterRouteV70,shortestRouteV70} from './gameplay-layout-v70.mjs';
const localQA=()=>typeof location!=='undefined'&&
 ['127.0.0.1','localhost'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');
export function installChapter1ProgressionV142(game){
 if(!game?.world?.interactables||!game?.__chapter1WorkOrderV137||
  !game?.__chapter1WallPanelsV141||!game?.controls?.yaw||!game?.camera?.updateWorldMatrix)
  throw Error('V142 requires live authored Chapter 1, V137 key and V141 panels');
 if(game.__chapter1ProgressionV142)return game.__chapter1ProgressionV142;
 // V7 freight still tests one generic consumable key even after V137 has
 // recorded the real, already-picked-up Master Service Key as a credential.
 // Restore only the key the original lock is about to CONSUME, never a
 // reusable extra inventory key, and never bypass power or the actual door.
 const originalFreight=game.startElevator;
 game.startElevator=function(e,...args){
  const eligible=eligibleFreightCredentialV142({
   chapter:this.levelIndex+1,breakers:this.breakers,
   recovered:!!this.__chapter1WorkOrderV137?.getState().keyRecovered,
   keys:this.keys,exit:e
  });
  if(!eligible)return originalFreight.call(this,e,...args);
  this.keys=1;
  try{return originalFreight.call(this,e,...args);}
  finally{
   // If an unrelated late controller vetoed opening, never leave a minted
   // generic key in the player's inventory. A successful source elevator
   // lock already decrements this back to zero.
   if(this.keys===1&&!e.userData.serviceUnlocked)this.keys=0;
  }
 };

 const getTarget=(type,id)=>game.world.interactables.find(o=>!!o.parent&&
  o.userData?.type===type&&(type==='exit'||(type==='breaker'?o.userData.id===id:o.userData.label===id)));
 const getState=()=>{
  const e=game.exitObject,u=e?.userData,p=game.controls.yaw.position;
  const local=e?.worldToLocal?.(p.clone());
  return {chapter:game.levelIndex+1,level:game.mallLayoutV70?.level,
   running:!!game.running,dead:!!game.dead,won:!!game.won,
   modal:!!game.modal,breakers:game.breakers,keys:game.keys,decoys:game.decoys,
   work:game.__chapter1WorkOrderV137.getState(),
   position:{x:p.x,y:p.y,z:p.z},insideLocal:local?{x:local.x,z:local.z}:null,
   elevator:e?{x:e.position.x,y:e.position.y,z:e.position.z,
    state:u.state,timer:u.timer,doorOpenFraction:u.doorOpenFraction,
    blockerDisabled:u.doorBlocker?.disabled??null,
    leftZ:u.left?.position?.z,rightZ:u.right?.position?.z,
    opening:u.state==='opening',serviceUnlocked:!!u.serviceUnlocked}:null,
   key:(()=>{const o=getTarget('key','Master Service Key');
    return o?{collected:!!o.userData.collected,x:o.position.x,y:o.position.y,z:o.position.z,
     visible:o.visible,parent:!!o.parent}:null})(),
   evidenceSourceInventory:game.world.interactables
    .filter(o=>['note','tape','journal'].includes(o.userData?.type)||
      /LS-0[123]|last shift|maintenance tag|route sketch/i.test(String(o.userData?.label||o.userData?.id||'')))
    .map(o=>({type:o.userData?.type,label:o.userData?.label||null,id:o.userData?.id||null,
      parent:!!o.parent,visible:o.visible,position:o.position.toArray()})).slice(0,30),
   originalSourceTypes:Object.entries(game.world.interactables.reduce((a,o)=>{
    const t=o.userData?.type||'unknown';a[t]=(a[t]||0)+1;return a;
   },{})),
   notes:['LS-01','LS-02','LS-03'].map(id=>{
    const o=getTarget('note',id)||getTarget('tape',id);
    return {id,found:!!o,collected:!!o?.userData?.collected,
     position:o?{x:o.position.x,y:o.position.y,z:o.position.z}:null,
     text:o?.userData?.text||null};
   }),
   originalNav:{
    entrance:game.mallLayoutV70?.spawn,
    b1:chapterRouteV70(2).spawn,
    liveAtExit:game.world.canStand(17,-113),
    boardCells:[17.7,17.9,18.1,18.2,18.4,18.6].map(x=>({
     x,stand:game.world.canStand(x,-113),
     route:shortestRouteV70(game.mallLayoutV70,game.mallLayoutV70.spawn,{x,z:-113}).length
    }))
   },
   ui:{chapterCopy:document.getElementById('chapterCopy')?.textContent,
    chapterTitle:document.getElementById('chapterTitle')?.textContent,
    objective:document.getElementById('objective')?.textContent,
    hint:document.getElementById('hint')?.textContent,
    screen:document.querySelector('.screen.show')?.id||null}
  };
 };
 const api=Object.freeze({version:142,getState});
 game.__chapter1ProgressionV142=api;
 if(localQA()){
  const ensure=()=>{if(game.levelIndex!==0||!game.running||game.dead||game.modal)
    throw Error('V142 requires original live Chapter 1 first-person scene');};
  const view=(type,id)=>{
   ensure();
   const target=getTarget(type,id);
   if(!target||target.userData.collected)throw Error('Original uncollected source missing: '+type+'/'+id);
   target.updateWorldMatrix(true,true);
   const t=target.getWorldPosition(new THREE.Vector3());
   const p=game.controls.yaw.position;
   const initial={x:p.x,y:p.y,z:p.z,yaw:game.controls.yaw.rotation.y,pitch:game.controls.pitch.rotation.x};
   const attempts=[];
   for(const radius of [1.2,1.45,1.7,1.9]){
    for(let i=0;i<16;i++){
     const a=i*2*Math.PI/16,x=t.x+radius*Math.cos(a),z=t.z+radius*Math.sin(a);
     if(!game.world.canStand(x,z))continue;
     const d=Math.hypot(t.x-x,t.z-z),y=1.7+(game.mallLevelYV70||0);
     const yaw=Math.atan2(-(t.x-x),-(t.z-z));
     for(const elevation of [.03,.1,.22,.38,.7,1.0,1.35,1.6]){
      p.set(x,y,z);game.controls.yaw.rotation.y=yaw;
      game.controls.pitch.rotation.x=-Math.atan2(y-(t.y+elevation),d);
      game.camera.updateWorldMatrix(true,false);
      target.updateWorldMatrix(true,true);
      game.updateInteraction();
      if(game.interactTarget===target){
       const ray=new THREE.Raycaster();ray.setFromCamera({x:0,y:0},game.camera);
       const first=ray.intersectObjects(game.world.interactables,true).slice(0,2);
       return {found:true,type,id,room:game.mallLayoutV70.roomAt(x,z),
        fromEntry:shortestRouteV70(game.mallLayoutV70,game.mallLayoutV70.spawn,{x,z}).length,
        camera:{x,y,z,yaw,pitch:game.controls.pitch.rotation.x},
        source:{x:t.x,y:t.y,z:t.z},
        hits:first.map(h=>({distance:h.distance,mesh:h.object.name})),
        hint:document.getElementById('hint')?.textContent,
        targetReal:game.interactTarget===target};
      }
      attempts.push({x,z,elevation,hit:game.interactTarget?.userData?.label||game.interactTarget?.userData?.id||null});
     }
    }
   }
   p.set(initial.x,initial.y,initial.z);
   game.controls.yaw.rotation.y=initial.yaw;game.controls.pitch.rotation.x=initial.pitch;
   game.camera.updateWorldMatrix(true,false);
   throw Error('Real E raycaster could not target '+type+'/'+id+' '+JSON.stringify({t,attempts:attempts.slice(-8)}));
  };
  const collect=(type,id)=>{
   const before=getState(),aim=view(type,id),source=getTarget(type,id);
   game.interact();game.rebuildJournal();
   return {before,aim,after:getState(),sourceCollected:!!source.userData.collected,
    journal:document.getElementById('journalList')?.textContent};
  };
  window.__PINEWOOD_CH1_PROGRESSION_V142_QA__={
   getState,view,collect,
   activate(id){ensure();const qa=window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__;
    const aimed=qa.viewRealPanel(id);
    if(!aimed.realPanel)throw Error('Original E raycaster missed breaker '+id);
    return {aimed,operated:qa.useVisibleRealPanel(id)};
   },
   callFreight(){
    const aimed=view('exit',null);
    const before=getState();
    game.interact();
    return {aimed,before,after:getState()};
   },
   sampleCab(){
    const g=game,e=g.exitObject,p=g.controls.yaw.position;
    const coords=[15.2,15.5,16,16.5,17,17.3,17.6,17.8,18,18.2,18.3,18.4,18.5];
    return {state:getState(),samples:coords.map(x=>{
     const loc=e.worldToLocal(new THREE.Vector3(x,1.7,-113));
     return {x,physical:g.world.canStand(x,-113),
      origLayout:g.mallLayoutV70.canStand(x,-113),localX:loc.x,localZ:loc.z,
      inside:loc.x>.65&&loc.x<1.82&&Math.abs(loc.z)<.64};
    })};
   },
   advanceElevator(n=1,dt=.04){
    if(n>350||n<1||dt>.05||dt<=0)throw Error('Invalid desktop original update step');
    for(let i=0;i<n;i++){game.time+=dt;game.updateElevator(dt);}
    return getState();
   },
   enterRealCab(){
    const e=game.exitObject,u=e.userData;
    if(u.state!=='waiting')throw Error('Original freight not visibly open');
    const p=game.controls.yaw.position;
    p.set(16,1.7+(game.mallLevelYV70||0),-113);
    if(!game.world.canStand(p.x,p.z))throw Error('Original freight access not walkable at 16,-113');
    const path=[{x:p.x,z:p.z}];
    for(let i=0;i<85&&u.state==='waiting';i++){
     const old=p.x;game.tryMove(.035,0);
     path.push({x:p.x,z:p.z});
     if(p.x-old<.0001)break;
     game.time+=.04;game.updateElevator(.04);
    }
    return {path,after:getState()};
   },
   simulateSpentGenericKeyAfterRealPickup(){
    ensure();
    if(!game.__chapter1WorkOrderV137.getState().keyRecovered)
     throw Error('Cannot spend a missing real Master Service Key');
    const before=game.keys;
    game.keys=0;game.updateHUD();
    return {before,after:game.keys,work:game.__chapter1WorkOrderV137.getState()};
   },
   journal(){
    game.rebuildJournal();return document.getElementById('journalList')?.textContent;
   },
   chapter2(){return getState();}
  };
 }
 return api;
}
