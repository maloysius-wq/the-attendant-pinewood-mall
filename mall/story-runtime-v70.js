import {storyTargetV70} from './story-placement-v70.mjs';
import {buildGameplayLayoutV70} from './gameplay-layout-v70.mjs';

const STATE_KEYS=['','ch2V21','ch3V22','ch4V23','ch5V24','ch6V25'];
const SPECIAL={
  2:{gavinRoot:[23,-76],water:[24,-94],floodBlocker:[18,-92]},
  3:{luisRoot:[43,-109]},
  5:{eliRoot:[60,-110]}
};
const RITUAL_CONTROLS_V70={
 ch6_roster_station_v25:[70.7,-105.8],
 ch6_eli_station_v25:[77.4,-105.8],
 ch6_key_station_v25:[69.9,-110.4],
 ch6_service_station_v25:[77.5,-110.7],
 ch6_clockout_station_v25:[70.4,-114.0],
 ch6_employee_exit_v25:[77.3,-113.9]
};
const SETPIECES={
  2:{'flooded-east-low-corridor-v21':[24,-94]},
  3:{'primary-security-cctv-v22':[38,-110],'disconnected-pa-chain-v22':[42,-106],'luis-vhs-station-v22':[43,-108]},
  4:{'tessa-personal-effects-bench-v32':[73,-82]}
};
const isObject=x=>!!x?.isObject3D;

function topChild(root,obj){
 let node=obj;
 while(node?.parent&&node.parent!==root)node=node.parent;
 return node?.parent===root?node:null;
}
function nearestSafe(layout,at){
 if(layout.canStand(at.x,at.z))return at;
 for(let radius=.5;radius<=4;radius+=.5){
  for(let a=0;a<16;a++){
   const ang=a*Math.PI/8,x=at.x+Math.cos(ang)*radius,z=at.z+Math.sin(ang)*radius;
   if(layout.canStand(x,z))return {...at,x,z};
  }
 }
 return at;
}

/** Keep the authored chapter machinery and evidence, transplanting it into the approved physical shell. */
export function relocateStoryV70({game,layout,THREE}={}){
 if(!game?.world?.root||!layout||!THREE)throw TypeError('Game, mapped floor and Three.js are required');
 const world=game.world,root=world.root,chapter=layout.chapter;
 const legacyColliders=world.colliders.slice(),oldOwners=new Map();
 for(const c of legacyColliders){
  if(c.owner&&isObject(c.owner)&&!oldOwners.has(c.owner)){
   c.owner.updateWorldMatrix(true,false);
   oldOwners.set(c.owner,c.owner.getWorldPosition(new THREE.Vector3()));
  }
 }
 const keep=new Set(),moved=new Set();
 const retain=obj=>{if(!isObject(obj))return;const top=topChild(root,obj);if(top)keep.add(top);};
 for(const o of world.interactables)retain(o);
 for(const o of world.dynamicDoors)retain(o);
 const state=game[STATE_KEYS[chapter-1]]||null;
 if(state){
  for(const [name,value] of Object.entries(state)){
   if(isObject(value))retain(value);
   else if(Array.isArray(value)){
    for(const v of value){
     if(isObject(v))retain(v);
     else if(v&&typeof v==='object')for(const inner of Object.values(v))retain(inner);
    }
   }
  }
 }
 for(const c of root.children){
  const tag=c.userData?.chapter2Setpiece||c.userData?.chapter3Setpiece||c.userData?.chapter4Setpiece||c.userData?.chapter5Setpiece||c.userData?.chapter6StateV25;
  if(tag)keep.add(c);
 }
 for(const c of [...root.children])if(!keep.has(c))root.remove(c);
 function reposition(obj,target){
  if(!isObject(obj)||!obj.parent)return;
  const top=topChild(root,obj);
  if(!top)return;
  if(obj.parent!==root)root.attach(obj);
  const at=nearestSafe(layout,target);
  obj.position.set(at.x,obj.position.y+layout.y,at.z);
  obj.updateWorldMatrix(true,true);
  moved.add(obj);moved.add(top);
 }
 if(chapter===6&&state?.presentGroup){
  // The 1997 replay is a scaled staging vignette, but its physical ritual
  // consoles are separate root objects: each needs its own M1 coordinate.
  for(const group of [state.presentGroup,state.memoryGroup]){
   if(!group?.parent)continue;
   group.position.set(74.5,layout.y,-109);
   group.scale.set(.205,1,.205);
   group.updateWorldMatrix(true,true);
   moved.add(group);
  }
  if(state.echoRoot?.parent&&state.memoryGroup?.parent){
   state.memoryGroup.add(state.echoRoot);
   state.echoRoot.position.set(7.7,.02,13);
   moved.add(state.echoRoot);
  }
  for(const obj of world.interactables){
   if(!obj?.parent||obj===state.presentGroup||obj===state.memoryGroup)continue;
   if(topChild(root,obj)===state.presentGroup||topChild(root,obj)===state.memoryGroup)continue;
   const point=RITUAL_CONTROLS_V70[obj.userData?.type];
   if(point)reposition(obj,{x:point[0],z:point[1]});
  }
  for(const light of [state.presentTaskLight,state.memoryLight]){
   if(!light?.parent)continue;
   light.position.set(74.5,layout.y+2.2,-106.4);
   moved.add(light);
  }
 }else{
  world.interactables.forEach((o,index)=>{
   if(!o?.parent)return;
   const u=o.userData||{};
   const target=storyTargetV70({chapter,type:u.type||'',id:u.id||'',label:u.label||'',
    controlId:u.controlId||'',index});
   reposition(o,target);
  });
 }
 for(const [name,point] of Object.entries(SPECIAL[chapter]||{})){
  if(name==='floodBlocker')continue;
  const obj=state?.[name];
  if(obj?.parent&&!moved.has(obj))reposition(obj,{x:point[0],z:point[1]});
 }
 for(const c of [...root.children]){
  if(moved.has(c))continue;
  const tag=c.userData?.chapter2Setpiece||c.userData?.chapter3Setpiece||c.userData?.chapter4Setpiece||c.userData?.chapter5Setpiece;
  const named=SETPIECES[chapter]?.[tag];
  if(named)reposition(c,{x:named[0],z:named[1]});
  else if(chapter!==6){
   const at=storyTargetV70({chapter,type:c.userData?.type||'',index:root.children.indexOf(c)});
   reposition(c,at);
  }
 }
 // The old floor, walls, storefronts, and their collision boxes are gone.
 // Preserve only authored dynamic blockers whose physical owner remains in the new scene.
 const owned=[];
 for(const c of legacyColliders){
  const owner=c.owner;
  if(!isObject(owner)||!topChild(root,owner))continue;
  const old=oldOwners.get(owner),now=owner.getWorldPosition(new THREE.Vector3());
  if(!old)continue;
  c.minX+=now.x-old.x;c.maxX+=now.x-old.x;
  c.minZ+=now.z-old.z;c.maxZ+=now.z-old.z;
  owned.push(c);
 }
 const shellCollision=layout.colliders.map(c=>({...c,navBlock:true,physicalBlock:true,disabled:false,owner:null}));
 if(chapter===2&&state?.floodBlocker){
  const c=state.floodBlocker;
  const center=SPECIAL[2].floodBlocker;
  const width=c.maxX-c.minX,depth=c.maxZ-c.minZ;
  Object.assign(c,{minX:center[0]-width/2,maxX:center[0]+width/2,
   minZ:center[1]-depth/2,maxZ:center[1]+depth/2});
  owned.push(c);
 }
 world.walk=new Set(layout.walk);world.tags=new Map(layout.tags);
 world.colliders=[...shellCollision,...owned];world.navCache.clear();
 world.wallMeshes=[];world.floorMeshes=[];
 world.hasLOS=(a,b)=>{
  const dist=Math.hypot(b.x-a.x,b.z-a.z),steps=Math.max(1,Math.ceil(dist/.32));
  for(let i=1;i<steps;i++){
   const t=i/steps,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
   if(!world.walk.has(Math.round(x)+','+Math.round(z)))return false;
   if(world.colliders.some(c=>!c.disabled&&c.physicalBlock!==false&&x>c.minX&&x<c.maxX&&z>c.minZ&&z<c.maxZ))return false;
  }
  return true;
 };
 world.bounds={minX:-47,maxX:86,minZ:-119,maxZ:-22};
 game.mallLevelYV70=layout.y;game.mallLayoutV70=layout;
 return {chapter,level:layout.level,kept:root.children.length,interactables:world.interactables.length,
  obstacles:world.colliders.length};
}

/** One-way, physically situated descent out of M1 for the final employee exit. */
export function descendToExitV70(game){
 if(game.levelIndex!==5||!game.ch6V25?.exitOpen||game.mallGroundExitV70)return false;
 const lower=buildGameplayLayoutV70({chapter:6,level:'G'});
 game.world.walk=new Set(lower.walk);
 game.world.tags=new Map(lower.tags);
 game.world.colliders=lower.colliders.map(c=>({...c,navBlock:true,physicalBlock:true,disabled:false,owner:null}));
 game.world.navCache.clear();
 game.mallLayoutV70=lower;
 game.mallLevelYV70=0;
 game.mallGroundExitV70=true;
 if(game.attendant?.root)game.attendant.root.position.y=0;
 if(game.attendant){game.attendant.path=[];game.attendant.pathIndex=0;}
 return true;
}
