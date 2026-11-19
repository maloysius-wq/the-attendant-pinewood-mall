/** V138: only REAL original 1979 G-floor architectural luminaires.
 * A = central public emergency ring; B = west retail branch; C = freight.
 * No replacement geometry, remote assets, extra monsters or story rewrites. */
export const CIRCUIT_LABELS_V138=Object.freeze({
 A:'Public concourse emergency lights',
 B:'Retail emergency lighting',
 C:'Freight service corridor lights'
});
const CIRCUITS=Object.freeze(Object.keys(CIRCUIT_LABELS_V138));
export function circuitLevelV138(online){return online?4.5:.16;}
const sourceBulbLevelV138=online=>online?1:.16;
export function installChapter1CircuitLightsV138(game){
 if(!game?.mallV70?.group?.traverse||typeof game.interact!=='function'||
    typeof game.resetState!=='function')
  throw Error('V138 requires real authored mall and the original Game hooks');
 if(game.__chapter1LightsV138){
  game.__chapter1LightsV138.sync();
  return game.__chapter1LightsV138;
 }
 let source=[],boundGroup=null;
 const active=new Set();
 const bindCurrentScene=()=>{
  const group=game.mallV70?.group;
  if(!group?.traverse)throw Error('V138 current authored mall group is unavailable');
  if(group===boundGroup)return;
  // Gameplay recreates a physical source scene on every chapter/retry.
  // Rebind the ACTUAL new lamp nodes, never keep dangling references to a
  // previous chapter's scene and never resurrect a prior run's power state.
  const current=[];
  group.traverse(node=>{
   const id=node.userData?.chapter1CircuitV138;
   if(!CIRCUITS.includes(id))return;
   if(node.isPointLight)current.push({id,kind:'light',node,original:node.intensity});
   else if(node.isMesh&&node.material)current.push({id,kind:'bulb',node,
    original:node.material.opacity??1,
    originalTransparent:!!node.material.transparent});
  });
  for(const id of CIRCUITS){
   if(!current.some(x=>x.id===id&&x.kind==='light')||
      !current.some(x=>x.id===id&&x.kind==='bulb'))
    throw Error('V138 source architectural luminaire missing for circuit '+id);
  }
  source=current;boundGroup=group;active.clear();
 };
 const sync=()=>{
  bindCurrentScene();
  const chapter1=game.levelIndex===0;
  for(const entry of source){
   const factor=chapter1?(entry.kind==='light'?
    circuitLevelV138(active.has(entry.id)):
    sourceBulbLevelV138(active.has(entry.id))):1;
   if(entry.kind==='light')entry.node.intensity=entry.original*factor;
   else{
    entry.node.material.transparent=chapter1||entry.originalTransparent;
    entry.node.material.opacity=entry.original*factor;
    entry.node.material.needsUpdate=true;
   }
  }
 };
 bindCurrentScene();
 const originalInteract=game.interact;
 game.interact=function(...args){
  const target=this.interactTarget,u=target?.userData;
  const id=String(u?.id||'').trim().toUpperCase();
  const before=!!u?.on;
  const result=originalInteract.apply(this,args);
  if(this.levelIndex===0&&u?.type==='breaker'&&!before&&u.on&&CIRCUITS.includes(id)){
   active.add(id);
   sync();
  }
  return result;
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){
  const result=originalReset.apply(this,args);
  active.clear();sync();
  return result;
 };
 const api=Object.freeze({
  version:138,sync,
  getState:()=>({
   chapter:game.levelIndex+1,active:[...active].sort(),
   sources:Object.fromEntries(CIRCUITS.map(id=>[id,source.filter(x=>x.id===id).map(x=>({
    kind:x.kind,current:x.kind==='light'?x.node.intensity:x.node.material.opacity,
    original:x.original
   }))]))
  })
 });
 game.__chapter1LightsV138=api;
 sync();
 if(typeof location!=='undefined'&&
    ['localhost','127.0.0.1'].includes(location.hostname)&&
    new URLSearchParams(location.search).has('chapter1QA'))
  window.__PINEWOOD_CH1_LIGHTS_V138_QA__={getState:()=>api.getState()};
 return api;
}
