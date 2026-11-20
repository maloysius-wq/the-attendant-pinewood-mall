/** V141 mount the THREE original breaker meshes on REAL Chapter 1 masonry.
 * No proxy boxes, no menu-only interactions, no new source GLBs and no edits
 * to the film/Builder construction property or Chapters 2–6.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {PANEL_BASE_Y_V141,mountedPanelSitesV141} from './chapter1-wall-panels-v141.mjs';
const localQA=()=>typeof location!=='undefined'&&
 ['localhost','127.0.0.1'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');
export function installChapter1WallPanelsV141(game){
 if(!game?.mallLayoutV70?.shell?.walls||!Array.isArray(game.world?.interactables)||
  !game.controls?.yaw||!game.controls?.pitch||!game.camera?.updateWorldMatrix||
  typeof game.updateInteraction!=='function'||typeof game.interact!=='function'||
  !game.__chapter1WorkOrderV137||!game.__chapter1LightsV138)
  throw Error('V141 requires original physical Chapter 1 and A/B/C circuit game');
 if(game.__chapter1WallPanelsV141){
  game.__chapter1WallPanelsV141.bind();
  return game.__chapter1WallPanelsV141;
 }
 let bound=new Map(),lastShell=null;
 const bind=()=>{
  if(game.levelIndex!==0)return;
  const layout=game.mallLayoutV70,report=mountedPanelSitesV141(layout);
  if(report.errors.length)throw Error('V141 original wall verification failed: '+report.errors.join('; '));
  const next=new Map();
  for(const site of report.panels){
   const found=game.world.interactables.filter(x=>x?.userData?.type==='breaker'&&
    x.userData.id===site.id&&x.parent&&x.userData.lamp?.isMesh);
   if(found.length!==1)throw Error('V141 genuine makeBreaker '+site.id+' missing or duplicate');
   const panel=found[0];
   if(!panel.isGroup||!panel.children.some(x=>x.isMesh))
    throw Error('V141 original breaker mesh not found '+site.id);
   panel.position.set(site.position.x,PANEL_BASE_Y_V141+layout.y,site.position.z);
   panel.rotation.set(0,site.yaw,0);
   panel.updateWorldMatrix(true,true);
   // This is source-only useful location metadata, never a new interactable.
   panel.userData.physicalMasonryV141=site.wall.id;
   panel.userData.originalGWallV141=true;
   next.set(site.id,{panel,site});
  }
  bound=next;lastShell=layout.shell;
 };
 const getState=()=>({
  version:141,chapter:game.levelIndex+1,shellBound:lastShell===game.mallLayoutV70?.shell,
  panels:[...bound.values()].map(({panel,site})=>({
   id:site.id,name:panel.name,room:site.room,wallId:site.wall.id,wallRole:site.wall.role,
   wallFace:site.wallFace,wallBack:site.back,source:site.geometry,
   x:panel.position.x,y:panel.position.y,z:panel.position.z,yaw:panel.rotation.y,
   approach:{...site.approach},clearDistance:site.clearDistance,
   mounted:panel.userData.originalGWallV141===true,
   on:!!panel.userData.on,sceneParent:!!panel.parent,site:site.site
  }))
 });
 const api=Object.freeze({version:141,bind,getState});
 game.__chapter1WallPanelsV141=api;
 bind();
 if(localQA()){
  window.__PINEWOOD_CH1_WALL_PANELS_V141_QA__={
   getState,
   viewRealPanel(id){
    if(game.levelIndex!==0||!game.running||game.modal||game.dead)
     throw Error('V141 panel test requires live original Chapter 1');
    const pair=bound.get(id);
    if(!pair)throw Error('No original breaker '+id);
    const {panel,site}=pair;
    if(panel.userData.on)throw Error('Panel already operated '+id);
    const p=site.approach,target=panel.position;
    game.controls.yaw.position.set(p.x,1.7+game.mallLayoutV70.y,p.z);
    const dx=target.x-p.x,dz=target.z-p.z;
    const d=Math.hypot(dx,dz);
    game.controls.yaw.rotation.y=Math.atan2(-dx,-dz);
    game.controls.pitch.rotation.x=-Math.atan2(
     game.controls.yaw.position.y-(target.y+.26),d);
    game.camera.updateWorldMatrix(true,false);
    panel.updateWorldMatrix(true,true);
    game.updateInteraction();
    const actual=game.interactTarget;
    const ray=new THREE.Raycaster();
    ray.setFromCamera({x:0,y:0},game.camera);
    const hits=ray.intersectObjects(game.world.interactables,true).slice(0,5)
     .map(h=>({name:h.object.name,parent:h.object.parent?.name,distance:+h.distance.toFixed(3),
      type:h.object.userData?.type}));
    return {id,targetId:actual?.userData?.id||null,actualType:actual?.userData?.type||null,
     realPanel:actual===panel,wall:site.wall.id,
     camera:{x:p.x,z:p.z,yaw:game.controls.yaw.rotation.y,pitch:game.controls.pitch.rotation.x},
     sourcePosition:panel.position.toArray(),hasLOS:game.world.hasLOS(game.controls.yaw.position,panel.position),
     hits,breakers:game.breakers,scene:getState()};
   },
   useVisibleRealPanel(id){
    const pair=bound.get(id);
    if(!pair||game.interactTarget!==pair.panel)
     throw Error('Real original E target is not wall-mounted panel '+id);
    const before=game.breakers;
    game.interact(); // actual original Game.interact(), V137/138/139/140 hooks included
    if(game.breakers!==before+1||!pair.panel.userData.on)
     throw Error('Original panel E did not switch '+id);
    return {id,breakers:game.breakers,on:pair.panel.userData.on,scene:getState()};
   }
  };
 }
 return api;
}
