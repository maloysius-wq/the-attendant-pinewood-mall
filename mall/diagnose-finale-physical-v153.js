/** LOCAL DIAGNOSTIC BRANCH ONLY: actual source chapter 6 movement and E.
 * No alternate world, direct puzzle handlers, state injection or movement
 * teleport. Temporary camera trials are restored before original walking.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {shortestRouteV70} from './gameplay-layout-v70.mjs';
export function installFinalePhysicalProbeV153(g){
 if(!['127.0.0.1','localhost'].includes(location.hostname)||
    !new URLSearchParams(location.search).has('finaleQA')||g.levelIndex!==5)return;
 const p=()=>g.controls.yaw.position;
 const state=()=>{
  const s=g.ch6V25;
  const saved=JSON.parse(localStorage.getItem('pinewood_attendant_reborn_v1')||'{}');
  return {chapter:g.levelIndex+1,level:g.mallLayoutV70?.level,ground:!!g.mallGroundExitV70,
   position:p().toArray(),running:!!g.running,modal:!!g.modal,dead:!!g.dead,won:!!g.won,
   screen:document.querySelector('.screen.show')?.id||null,
   title:document.getElementById('chapterTitle')?.textContent,
   hint:document.getElementById('hint')?.textContent,objective:document.getElementById('objective')?.textContent,
   firstEchoSeen:!!s?.firstEchoSeen,staffAcknowledged:!!s?.staffAcknowledged,keyCleared:!!s?.keyCleared,
   serviceCleared:!!s?.serviceCleared,eliProcessed:!!s?.eliProcessed,accountabilityOne:!!s?.accountabilityOne,
   clockedOut:!!s?.clockedOut,exitOpen:!!s?.exitOpen,recallCount:s?.recallCount,completed:!!s?.completed,
   controls:g.world.interactables.filter(o=>o.userData?.type?.startsWith('ch6_')).map(o=>({
    type:o.userData.type,position:o.position.toArray(),visible:o.visible,parent:!!o.parent
   })),saved};
 };
 const ensure=()=>{if(g.levelIndex!==5||!g.running||g.modal||g.dead||g.won)throw Error('Original live finale required '+JSON.stringify(state()));};
 const xy=()=>({x:p().x,z:p().z});
 const route=(start,end)=>shortestRouteV70({...g.mallLayoutV70,canStand:(x,z)=>g.world.canStand(x,z)},start,end);
 const nearby=()=>g.world.colliders.filter(c=>!c.disabled&&p().x>c.minX-.8&&p().x<c.maxX+.8&&p().z>c.minZ-.8&&p().z<c.maxZ+.8)
  .slice(0,15).map(c=>({id:c.id,kind:c.kind,box:[c.minX,c.maxX,c.minZ,c.maxZ]}));
 let strideCount=0,meters=0;
 const segment=(dest,{allowEnding=false}={})=>{
  for(let i=0;i<1500;i++){
   const now=xy(),dx=dest.x-now.x,dz=dest.z-now.z,d=Math.hypot(dx,dz);
   if(d<.006)return;
   if(g.won&&allowEnding)return;
   ensure();
   const stride=Math.min(.08,d);
   g.tryMove(dx*stride/d,dz*stride/d);
   const moved=Math.hypot(p().x-now.x,p().z-now.z);
   strideCount++;meters+=moved;
   if(moved<stride*.88)throw Error('Original movement blocked '+JSON.stringify({from:now,to:dest,at:p().toArray(),stride,moved,level:g.mallLayoutV70.level,nearby:nearby()}));
   if(g.levelIndex===5&&g.ch6V25?.exitOpen&&g.mallGroundExitV70)g.updateLastShiftV25(.016);
  }
  throw Error('Bounded original movement could not reach '+JSON.stringify(dest));
 };
 const walk=(end,{allowEnding=false}={})=>{
  const start=xy(),points=route(start,end),before=strideCount,dist=meters;
  if(!points.length&&Math.hypot(start.x-end.x,start.z-end.z)>.08)throw Error('No original navigable route '+JSON.stringify({start,end,level:g.mallLayoutV70.level,nearby:nearby()}));
  for(const at of points){if(g.won&&allowEnding)break;segment(at,{allowEnding});}
  if(!g.won)segment(end,{allowEnding});
  return {start,end:xy(),nodes:points.length,steps:strideCount-before,meters:meters-dist,level:g.mallLayoutV70.level};
 };
 function aim(type){
  ensure();
  const o=g.world.interactables.find(o=>o.parent&&o.visible&&o.userData?.type===type);
  if(!o)throw Error('Missing original terminal '+type+' '+JSON.stringify(state().controls));
  const origin=p().clone(),yaw=g.controls.yaw.rotation.y,pitch=g.controls.pitch.rotation.x;
  o.updateWorldMatrix(true,true);
  const t=o.getWorldPosition(new THREE.Vector3()),y=g.mallLevelYV70+1.7;
  let selected=null;
  const orient=(x,z,height)=>{
   g.controls.yaw.rotation.y=Math.atan2(x-t.x,z-t.z);
   g.controls.pitch.rotation.x=-Math.atan2(y-t.y-height,Math.hypot(x-t.x,z-t.z));
   g.camera.updateWorldMatrix(true,false);o.updateWorldMatrix(true,true);g.updateInteraction();
  };
  try{
   search:for(const r of [1.3,1.5,1.7,1.9,2.1])for(let a=0;a<16;a++){
    const x=t.x+r*Math.cos(a*Math.PI/8),z=t.z+r*Math.sin(a*Math.PI/8);
    if(!g.world.canStand(x,z)||!route({x:origin.x,z:origin.z},{x,z}).length)continue;
    p().set(x,y,z);
    for(const h of [.4,.65,.8,1,1.2,1.4,1.65]){
     orient(x,z,h);
     if(g.interactTarget===o){
      const ray=new THREE.Raycaster();ray.setFromCamera({x:0,y:0},g.camera);
      const hit=ray.intersectObject(o,true)[0];
      if(hit&&hit.distance<=2.45){selected={x,z,h};break search;}
     }
    }
   }
  }finally{p().copy(origin);g.controls.yaw.rotation.y=yaw;g.controls.pitch.rotation.x=pitch;g.camera.updateWorldMatrix(true,false);g.updateInteraction();}
  if(!selected)throw Error('No reachable E aim for '+type+' '+JSON.stringify({source:t.toArray(),state:state()}));
  const travel=walk({x:selected.x,z:selected.z});
  orient(p().x,p().z,selected.h);
  if(g.interactTarget!==o)throw Error('Original source E target lost after actual walk '+type);
  const ray=new THREE.Raycaster();ray.setFromCamera({x:0,y:0},g.camera);
  const hit=ray.intersectObject(o,true)[0];
  if(!hit||hit.distance>2.45)throw Error('Original E range failed '+type);
  return {type,source:t.toArray(),camera:p().toArray(),distance:hit.distance,travel,hint:document.getElementById('hint')?.textContent};
 }
 window.__PINEWOOD_PHYSICAL_FINALE_V153_QA__=Object.freeze({
  state,aim,
  observeMemory(){
   ensure();for(let i=0;i<120;i++){g.time+=.04;g.updateLastShiftV25(.04);}
   return state();
  },
  walkStair(){
   ensure();if(!g.ch6V25.exitOpen||g.mallGroundExitV70)throw Error('Employee release required before physical M1 descent');
   const approach=walk({x:51,z:-103});
   const before=state();
   segment({x:51,z:-113.4});
   const after=state();
   if(!after.ground||after.level!=='G'||Math.abs(after.position[1]-1.7)>.2)throw Error('Original stair did not physically descend '+JSON.stringify(after));
   return {approach,before,after,steps:strideCount};
  },
  crossExterior(){
   ensure();if(!g.mallGroundExitV70||!g.ch6V25.exitOpen)throw Error('Original released G employee exit required');
   const route=walk({x:85,z:-42});
   const before=state();
   segment({x:87,z:-42},{allowEnding:true});
   return {route,before,after:state(),steps:strideCount,meters};
  }
 });
}
