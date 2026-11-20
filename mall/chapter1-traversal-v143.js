/** V143 actual Chapter 1 first-person collision-walk QA, not a teleport test.
 * Localhost + chapter1QA only; normal production gameplay remains unchanged.
 * Uses source-original Game.tryMove for EVERY pedestrian step.
 */
import {shortestRouteV70} from './gameplay-layout-v70.mjs';
import {vestibuleInnerPortalV112} from './vestibule-handoff-v112.mjs';

const localQA=()=>typeof location!=='undefined' &&
 ['localhost','127.0.0.1'].includes(location.hostname) &&
 new URLSearchParams(location.search).has('chapter1QA');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const location2=p=>({x:p.x,z:p.z});

export function installChapter1TraversalV143(game){
 if(!localQA()||game.levelIndex!==0)return null;
 if(!game.__chapter1WallPanelsV141||!game.__chapter1ProgressionV142||
  !game.vestibuleDoorControllerV112||!game.mallLayoutV70||
  typeof game.tryMove!=='function'||typeof game.updateInteraction!=='function')
  throw Error('V143 requires original Chapter 1, real V113 E door and V141 breaker meshes');
 const previous=game.__chapter1TraversalV143;
 if(previous)return previous;
 const portal=vestibuleInnerPortalV112(),travel=[];
 const p=()=>game.controls.yaw.position;
 const door=()=>game.vestibuleDoorControllerV112;
 const screen=()=>[...document.querySelectorAll('.screen.show')].map(x=>x.id);
 const ensure=()=>{
  if(game.levelIndex!==0||!game.running||game.dead||game.modal||screen().length)
   throw Error('Source Chapter 1 is not in live playable state '+JSON.stringify({
    chapter:game.levelIndex+1,dead:game.dead,running:game.running,
    modal:game.modal,openScreens:screen()}));
 };
 const getState=()=>({
  chapter:game.levelIndex+1,player:location2(p()),height:p().y,
  room:game.mallLayoutV70.roomAt(p().x,p().z),
  canStand:game.world.canStand(p().x,p().z),layoutCanStand:game.mallLayoutV70.canStand(p().x,p().z),
  power:game.breakers,panels:game.__chapter1WallPanelsV141.getState().panels,
  door:door()?.door?.state,
  doorBlocked:!door()?.blocker?.disabled,
  actualDoorCollider:game.world.colliders.find(c=>c===door()?.blocker)?.disabled===door()?.blocker?.disabled,
  markerCount:travel.length,travelMeters:travel.reduce((sum,v)=>sum+v.moved,0),
  otherChapterSafe:game.mallLayoutV70.chapter===1,
  screen:screen()
 });
 const step=(x,z,tag)=>{
  const before=location2(p());
  const delta={x:x-before.x,z:z-before.z},length=distance(before,{x,z});
  if(length<.0001)return 0;
  if(length>.145)throw Error('Excessive simulated input stride '+length);
  const navBefore=game.world.canStand(before.x,before.z);
  // Invoke the ORIGINAL Game.tryMove used by keyboard locomotion. No setting
  // absolute player coordinates, no collision state edits and no raycast shortcuts.
  game.tryMove(delta.x,delta.z);
  const after=location2(p()),moved=distance(before,after);
  const stand=game.world.canStand(after.x,after.z);
  if(moved<length*.9||!stand){
   const near=game.world.colliders.filter(c=>!c.disabled&&
     after.x>c.minX-.75&&after.x<c.maxX+.75&&
     after.z>c.minZ-.75&&after.z<c.maxZ+.75).slice(0,12).map(c=>({
      id:c.id,kind:c.kind,box:[c.minX,c.maxX,c.minZ,c.maxZ]
     }));
   throw Error('Genuine source pedestrian movement blocked '+JSON.stringify({
     tag,before,to:{x,z},after,moved,expected:length,
     canStandBefore:navBefore,stand,near,doorBlocked:!door()?.blocker?.disabled}));
  }
  travel.push({tag,moved,at:after});
  if(travel.length>10000)throw Error('V143 walking limit exceeded');
  return moved;
 };
 const walkSegment=(dest,tag)=>{
  let iter=0;
  while(distance(location2(p()),dest)>.004){
   if(++iter>3000)throw Error('No bounded progress toward '+tag+' at '+JSON.stringify(dest));
   const now=location2(p()),dx=dest.x-now.x,dz=dest.z-now.z,len=Math.hypot(dx,dz);
   const m=Math.min(.085,len);
   step(now.x+dx*m/len,now.z+dz*m/len,tag);
  }
 };
 const walkTo=(x,z,label='route')=>{
  ensure();
  const layout=game.mallLayoutV70,start=location2(p()),dest={x,z};
  if(!layout.canStand(x,z))throw Error('Requested point not standable on original shell '+JSON.stringify(dest));
  const route=shortestRouteV70(layout,start,dest);
  if(route.length<2)throw Error('Source nav has no route '+JSON.stringify({start,dest,label}));
  const beforeCount=travel.length,beforeMeters=travel.reduce((s,t)=>s+t.moved,0);
  // Snap from exact first-person position to the first integral navigation
  // cell by small Game.tryMove steps, then follow each ACTUAL source tile
  // edge orthogonally. This tests collisions between cells, not just BFS.
  for(let i=0;i<route.length;i++)walkSegment(route[i],label);
  walkSegment(dest,label);
  const end=location2(p());
  if(distance(end,dest)>.015)throw Error('Source traversal missed destination '+label);
  return {label,start,end,gridNodes:route.length,actualSteps:travel.length-beforeCount,
   actualMeters:travel.reduce((s,t)=>s+t.moved,0)-beforeMeters,
   worldCanStand:game.world.canStand(end.x,end.z),
   room:layout.roomAt(end.x,end.z),lastNodes:route.slice(-7)};
 };
 const useRealPanel=id=>{
  ensure();
  const panel=game.world.interactables.find(o=>
   o.parent&&o.userData?.type==='breaker'&&o.userData.id===id);
  if(!panel||panel.userData.on)throw Error('Real unpowered '+id+' panel missing');
  const actual=p(),world=panel.getWorldPosition(panel.position.clone()),
    dx=world.x-actual.x,dz=world.z-actual.z,d=Math.hypot(dx,dz);
  game.controls.yaw.rotation.y=Math.atan2(-dx,-dz);
  game.controls.pitch.rotation.x=-Math.atan2(actual.y-(world.y+.26),d);
  game.camera.updateWorldMatrix(true,false);
  panel.updateWorldMatrix(true,true);game.updateInteraction();
  if(game.interactTarget!==panel)throw Error('Actual E raycaster missed '+id+' after FULL walk '+
   JSON.stringify({distance:d,from:location2(actual),at:location2(world),
    got:game.interactTarget?.userData?.id||game.interactTarget?.userData?.type,
    hint:document.getElementById('hint')?.textContent}));
  const before=game.breakers;
  game.interact();
  if(game.breakers!==before+1||!panel.userData.on)
   throw Error('Original E did not energize source '+id);
  return {id,after:game.breakers,sourceWall:panel.userData.physicalMasonryV141,
   player:location2(actual),distance:d,actualInteraction:true};
 };
 const api=Object.freeze({
  version:143,getState,
  doorApproach:()=>({x:portal.x,z:portal.z+1.5}),
  doorBeyond:()=>({x:portal.x,z:portal.z-1.5}),
  walkTo,travelStats:()=>({steps:travel.length,meters:travel.reduce((sum,t)=>sum+t.moved,0),
   first:travel.slice(0,3),last:travel.slice(-3)}),
  useRealPanel
 });
 game.__chapter1TraversalV143=api;
 window.__PINEWOOD_CH1_TRAVERSAL_V143_QA__=api;
 return api;
}
