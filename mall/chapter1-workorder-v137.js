/** V137 Chapter 1 work order and freight departure requirements.
 * Install against the REAL Game instance after V70's authored-story relocation.
 * No new story rooms, no fake pickups, no changes to other chapters.
 */
const KEY_NAME='Master Service Key';
const MAX_CIRCUITS=3;
export function chapter1WorkOrderStateV137({breakers=0,keyRecovered=false,elevator='idle'}={}){
 const n=Math.min(MAX_CIRCUITS,Math.max(0,Number.isFinite(Number(breakers))?Math.trunc(Number(breakers)):0));
 if(n<MAX_CIRCUITS)return Object.freeze({
  stage:'circuits',current:n,required:MAX_CIRCUITS,ready:false,
  text:'Restore emergency circuits A–C ('+n+'/'+MAX_CIRCUITS+')',
  hint:n===0?'Look for the three emergency electrical panels.'
   :'Continue restoring the emergency electrical ring.'
 });
 if(!keyRecovered)return Object.freeze({
  stage:'service_key',current:n,required:MAX_CIRCUITS,ready:false,
  text:'Recover the Master Service Key',
  hint:'The freight service lock requires the original maintenance key.'
 });
 const progress=String(elevator||'idle');
 if(progress==='opening')return Object.freeze({
  stage:'elevator_opening',current:n,required:MAX_CIRCUITS,ready:true,
  text:'Wait for the freight doors to open',hint:'Do not cross the closed door.'
 });
 if(progress==='waiting')return Object.freeze({
  stage:'elevator_board',current:n,required:MAX_CIRCUITS,ready:true,
  text:'Enter the open freight elevator',hint:'Step completely inside the cab.'
 });
 if(progress==='closing'||progress==='ride')return Object.freeze({
  stage:'elevator_descent',current:n,required:MAX_CIRCUITS,ready:true,
  text:'Remain inside the freight elevator',hint:'Keep away from the closing doors.'
 });
 return Object.freeze({
  stage:'freight_exit',current:n,required:MAX_CIRCUITS,ready:true,
  text:'Call the east freight elevator',hint:'Emergency circuits and service key verified.'
 });
}
const isMasterKey=o=>o?.userData?.type==='key'&&
 String(o.userData.label||'').trim()===KEY_NAME;
function findNode(id){
 return typeof document!=='undefined'?document.getElementById(id):null;
}
export function installChapter1WorkOrderV137(game){
 if(!game||typeof game.updateHUD!=='function'||typeof game.interact!=='function'||
    typeof game.startElevator!=='function'||typeof game.updateInteraction!=='function'||
    typeof game.resetState!=='function')
  throw Error('V137 requires original Game objective, interaction, reset and freight controls');
 if(game.__chapter1WorkOrderV137)return game.__chapter1WorkOrderV137;
 const state={keyRecovered:false,deniedAttempts:0};
 const snapshot=()=>chapter1WorkOrderStateV137({
  breakers:game.breakers,keyRecovered:state.keyRecovered,
  elevator:game.exitObject?.userData?.state
 });
 const origHUD=game.updateHUD;
 game.updateHUD=function(...args){
  const result=origHUD.apply(this,args);
  if(this.levelIndex===0){
   const s=snapshot(),node=findNode('objective');
   if(node){node.textContent='WORK ORDER  '+s.text;node.dataset.chapter1Stage=s.stage;}
   const inventory=findNode('inventory');
   if(inventory&&state.keyRecovered&&!inventory.textContent.includes('SERVICE KEY VERIFIED'))
    inventory.textContent+='   •   SERVICE KEY VERIFIED';
  }
  return result;
 };
 const origInteract=game.interact;
 game.interact=function(...args){
  const target=this.interactTarget,master=isMasterKey(target);
  const collectedBefore=master?!!target.userData.collected:false;
  const result=origInteract.apply(this,args);
  if(this.levelIndex===0&&master&&!collectedBefore&&target.userData.collected){
   state.keyRecovered=true;
   this.updateHUD();
  }
  return result;
 };
 const origElevator=game.startElevator;
 game.startElevator=function(...args){
  if(this.levelIndex===0&&this.breakers>=MAX_CIRCUITS&&!state.keyRecovered){
   state.deniedAttempts++;
   const hint=findNode('hint');
   if(hint){hint.textContent='Service lock requires the Master Service Key.';hint.classList.add('show');}
   this.updateHUD();
   return false;
  }
  return origElevator.apply(this,args);
 };
 const origUpdateInteraction=game.updateInteraction;
 game.updateInteraction=function(...args){
  const result=origUpdateInteraction.apply(this,args);
  if(this.levelIndex===0&&this.interactTarget?.userData?.type==='exit'&&
     this.breakers>=MAX_CIRCUITS&&!state.keyRecovered){
   const hint=findNode('hint');
   if(hint){hint.textContent='Master Service Key required to call the freight elevator.';hint.classList.add('show');}
  }
  return result;
 };
 const origReset=game.resetState;
 game.resetState=function(...args){
  const result=origReset.apply(this,args);
  state.keyRecovered=false;state.deniedAttempts=0;
  return result;
 };
 const controller=Object.freeze({version:137,getState:()=>({
  chapter:game.levelIndex+1,keyRecovered:state.keyRecovered,
  deniedAttempts:state.deniedAttempts,...snapshot()
 })});
 game.__chapter1WorkOrderV137=controller;
 if(typeof window!=='undefined'&&typeof location!=='undefined'){
  const params=new URLSearchParams(location.search);
  if(params.has('chapter1QA')&&['localhost','127.0.0.1'].includes(location.hostname)){
   window.__PINEWOOD_CH1_V137_QA__={
    getState:()=>controller.getState()
   };
  }
 }
 return controller;
}
