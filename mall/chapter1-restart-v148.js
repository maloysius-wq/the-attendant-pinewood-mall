/** V148: opt-in localhost only stage witness for the ORIGINAL game restart.
 * Does not change state transitions, existing physics, authoring, reset order,
 * save format, world colliders, or public UI.
 */
const localQA=()=>typeof location!=='undefined'&&
 ['127.0.0.1','localhost'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');
export function installChapter1RestartWitnessV148(game){
 if(!localQA()||game?.levelIndex!==0)return null;
 if(!game.__chapter1RecoveryV140||!game.__chapter1FirstPeekDecoyV147||
  typeof game.startChapter!=='function'||typeof game.resetState!=='function'||
  typeof game.world?.clear!=='function'||typeof game.world.buildGeometry!=='function')
  throw Error('V148 restart witness requires the real original Game and V140/V147');
 if(game.__chapter1RestartWitnessV148)return game.__chapter1RestartWitnessV148;
 const t0=performance.now(),events=[];let active=false,attempt=0;
 const record=(stage,details={})=>{
  const event={stage,atMillis:Math.round(performance.now()-t0),
   chapter:game.levelIndex+1,levelTime:game.time,...details};
  events.push(event);if(events.length>100)events.shift();
  return event;
 };
 const originalStart=game.startChapter;
 game.startChapter=async function(...args){
  active=true;attempt++;
  record('original-startChapter-begin',{attempt,index:args[0]});
  try{
   const result=await originalStart.apply(this,args);
   record('original-startChapter-finished',{attempt});return result;
  }catch(error){
   record('original-startChapter-failed',{attempt,error:String(error)});
   throw error;
  }finally{active=false;}
 };
 const originalClear=game.world.clear;
 game.world.clear=function(...args){
  if(active)record('original-world-clear-begin',{attempt});
  try{return originalClear.apply(this,args);}
  finally{if(active)record('original-world-clear-end',{attempt});}
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){
  if(active)record('original-resetState-begin',{attempt});
  try{return originalReset.apply(this,args);}
  finally{if(active)record('original-resetState-end',{attempt});}
 };
 const originalGeometry=game.world.buildGeometry;
 game.world.buildGeometry=async function(...args){
  if(active)record('original-world-buildGeometry-begin',{attempt});
  try{
   const result=await originalGeometry.apply(this,args);
   if(active)record('original-world-buildGeometry-end',{attempt});
   return result;
  }catch(error){
   if(active)record('original-world-buildGeometry-failed',{attempt,error:String(error)});
   throw error;
  }
 };
 const getState=()=>({
  chapter:game.levelIndex+1,running:game.running,dead:game.dead,
  won:game.won,modal:game.modal,levelTime:game.time,
  first:game.__chapter1FirstPeekDecoyV147.getState(),
  recovery:game.__chapter1RecoveryV140.getState(),
  realPickupLabels:game.world.interactables.filter(o=>o?.userData?.type==='decoy')
   .map(o=>({label:o.userData.label,attached:!!o.parent,
    collected:!!o.userData.collected})),
  worldColliders:game.world.colliders.length,
  worldInteractables:game.world.interactables.length,
  stage:{
   attempt,active,
   loadText:document.getElementById('loadText')?.textContent,
   loadFill:document.getElementById('loadFill')?.style.width,
   chapterScreen:document.getElementById('chapterScreen')?.classList.contains('show'),
   loadingScreen:document.getElementById('loadingScreen')?.classList.contains('show'),
   deathScreen:document.getElementById('deathScreen')?.classList.contains('show'),
   chapterStartText:document.getElementById('chapterStartBtn')?.textContent
  },
  events:events.slice()
 });
 const api=Object.freeze({version:148,getState});
 game.__chapter1RestartWitnessV148=api;
 window.__PINEWOOD_CH1_RESTART_V148_QA__=api;
 return api;
}
