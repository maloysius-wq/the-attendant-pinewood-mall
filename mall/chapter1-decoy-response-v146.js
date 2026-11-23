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
  const out=originalHear.call(this,pos,strength,type,...args);
  // Capture the original A* result at the instant genuine hearing runs,
  // before subsequent source stun/search behavior can intentionally repath.
  const end=this.path?.at(-1)||null;
  phase.lastEvent.stateAtHearing=this.state;
  phase.lastEvent.pathAtHearing=end?{x:end.x,z:end.z}:null;
  phase.lastEvent.originalGoalCell=(p=>{
   const c=game.world.cellFromWorld(p.x,p.z);
   return {x:c.x,z:c.z,passable:game.world.navPassable(c.x,c.z)};
  })(pos);
  return out;
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
  originalAttendantPosition:{x:game.attendant.root.position.x,z:game.attendant.root.position.z},
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
    const p=game.controls.yaw.position,a=game.attendant,w=game.world;
    // Pick a REAL original floor route with a physical masonry LOS break,
    // so the launch's faint 'throw' cue cannot itself give the player away.
    // No fake walls, collision toggles, invisibility or teleporting enemy paths.
    const launches=[
     {x:-27,z:-54,yaw:-Math.PI/2,landing:{x:-22.5,z:-54}},
     {x:-27,z:-62,yaw:-Math.PI/2,landing:{x:-22.5,z:-62}},
     {x:-17,z:-79,yaw:Math.PI/2,landing:{x:-21.5,z:-79}},
     {x:16,z:-72,yaw:-Math.PI/2,landing:{x:20.5,z:-72}}
    ];
    const available=[...w.walk].map(v=>{
     const [x,z]=v.split(',').map(Number);return {x,z};
    });
    const attempts=[];
    let choice=null;
    for(const launch of launches){
     if(!w.canStand(launch.x,launch.z)||
        !w.canStand(launch.landing.x,launch.landing.z))continue;
     const prospect=available.filter(enemy=>{
      const d=Math.hypot(enemy.x-launch.x,enemy.z-launch.z);
      return d>=7.5&&d<=18&&w.navPassable(enemy.x,enemy.z)&&
       !w.hasLOS(enemy,launch);
     });
     for(const enemy of prospect){
      const fromPlayer=w.navDistance(enemy,launch,48);
      if(!Number.isFinite(fromPlayer)||fromPlayer<=11||fromPlayer>29)continue;
      const toLanding=w.navDistance(enemy,launch.landing,48);
      if(!Number.isFinite(toLanding)||toLanding>23||toLanding<3)continue;
      attempts.push({launch,enemy,fromPlayer,toLanding});
      const score=Math.abs(toLanding-16)+Math.abs(fromPlayer-19)*.3;
      if(!choice||score<choice.score)choice={launch,enemy,fromPlayer,toLanding,score};
     }
    }
    if(!choice)throw Error('No physical original wall-separated audible decoy route: '+
     JSON.stringify({attempts:attempts.slice(0,3),walk:w.walk.size}));
    const {launch,enemy}=choice;
    game.time=Math.max(game.time,game.__chapter1StealthV139.getState().graceUntil+1);
    p.set(launch.x,1.7,launch.z);
    game.controls.yaw.rotation.y=launch.yaw;game.controls.pitch.rotation.x=0;
    game.camera.updateWorldMatrix(true,false);
    a.awake=true;a.root.visible=true;
    a.root.position.set(enemy.x,game.mallLevelYV70||0,enemy.z);
    a.root.lookAt(enemy.x-4,0,enemy.z);
    a.prevPos.copy(a.root.position);a.state='hunt';a.timer=8;a.repath=-1;
    a.decoyUntil=0;a.lastHeard.copy(a.root.position);a.path=[];a.pathIndex=0;
    if(a.canSee(p)||w.hasLOS(a.root.position,p))
     throw Error('Real source masonry must block Attendant line of sight');
    return {setup:true,range:choice.fromPlayer,heardLandingRange:choice.toLanding,
     genuineMasonryLOSBreak:true,player:launch,attendant:enemy,getState:getState()};
   },
   advanceActualThrownDecoy(steps=36,dt=.06){
    ensure();
    if(!Number.isInteger(steps)||steps<1||steps>160||dt<=0||dt>.15)
     throw Error('QA accepts bounded genuine source decoy physics steps only');
    for(let i=0;i<steps;i++){
     game.time+=dt;game.updateDecoys(dt);
     game.attendant.update(dt,game.time,game.controls.yaw.position,0);
     if(game.dead)throw Error('Unexpected genuine Attendant death in original wall-separated test '+
       JSON.stringify({step:i,position:game.controls.yaw.position.toArray(),
        enemy:game.attendant.root.position.toArray(),state:getState()}));
    }
    return getState();
   },
   sendFarActualSourceSound(){
    ensure();
    const sites=[new THREE.Vector3(-17,0,-79),new THREE.Vector3(16,0,-72)];
    const far=sites.map(target=>({
     target,nav:game.world.navDistance(game.attendant.root.position,target,48)
    })).find(x=>x.nav>DECOY_RULES_V146.maxNavHearingMetres);
    if(!far)throw Error('Original west/east gallery sources unexpectedly near the same Attendant');
    const old=game.attendant.decoyUntil;
    game.attendant.hear(far.target,1,'decoy');
    return {nav:far.nav,source:{x:far.target.x,z:far.target.z},
     untouched:game.attendant.decoyUntil===old,state:getState()};
   },
   proveVisiblePlayerOverridesDecoy(){
    ensure();
    const p=game.controls.yaw.position,a=game.attendant,w=game.world;
    // Find an actually standable, uninterrupted original gallery line.
    // Fixed guesses can land on a source store partition and accidentally
    // test wall occlusion instead of visual prioritization.
    p.set(-17,1.7,-79);game.camera.updateWorldMatrix(true,false);
    if(!w.canStand(p.x,p.z)||game.playerHidden)
     throw Error('Original west gallery source player must be standable and unhidden');
    const candidates=[...w.walk].map(cell=>{
     const [x,z]=cell.split(',').map(Number);
     return {x,z,d:Math.hypot(x-p.x,z-p.z)};
    }).filter(c=>c.d>=3.2&&c.d<=9&&w.canStand(c.x,c.z)&&
     w.navPassable(c.x,c.z)&&w.hasLOS({x:c.x,y:0,z:c.z},p))
     .sort((u,v)=>Math.abs(u.d-6)-Math.abs(v.d-6)||u.x-v.x||u.z-v.z);
    let witness=null;
    a.awake=true;a.root.visible=true;
    for(const site of candidates){
     a.root.position.set(site.x,game.mallLevelYV70||0,site.z);
     // Original moving Attendant faces +Z. Object3D.lookAt would rotate
     // its -Z toward the target and falsely fail original canSee FOV.
     a.root.rotation.y=Math.atan2(p.x-site.x,p.z-site.z);
     if(a.canSee(p)){
      witness={x:site.x,z:site.z,range:site.d};break;
     }
    }
    if(!witness)throw Error('No source-authentic standable LOS + Attendant forward-FOV witness '+JSON.stringify({
     candidates:candidates.slice(0,12),originalRooms:game.mallLayoutV70?.roomAt(p.x,p.z)}));
    a.prevPos.copy(a.root.position);a.state='investigate';a.timer=7;
    a.repath=-1;a.decoyUntil=game.time+6;a.decoyPos.set(-22,0,-79);
    const seen=a.canSee(p),los=w.hasLOS(a.root.position,p);
    if(!seen||!los)throw Error('Selected original LOS witness failed after source setup');
    const before=phase.visualPriority;
    a.update(.016,game.time,p,0);
    return {witness,seen,los,prioritized:phase.visualPriority===before+1,
     decoyExpired:a.decoyUntil<=game.time,state:getState()};

   }
  };
 }
 return api;
}
