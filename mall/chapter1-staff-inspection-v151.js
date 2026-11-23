/** V151: optional E inspect of the *real* V150 paper surface, no new E pickups.
 * Original Game.updateInteraction always wins for breakers, keys, doors,
 * hiding, decoys, Last Shift and exits. Only an otherwise empty E is used.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {STAFF_BELONGINGS_V150} from './chapter1-staff-belongings-v150.mjs';

const ORIGINAL_E_RANGE=2.45;
const DISPLAY_SECONDS=8;
const STAFF_IDS=Object.freeze({
 'jo-close-clipboard':'jo',
 'tessa-staff-chart':'tessa',
 'luis-copy-sleeve':'luis'
});
const localQA=()=>typeof location!=='undefined'&&
 ['localhost','127.0.0.1'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');

function createInspectionPanel(){
 let card=document.getElementById('v151-people-inspection');
 if(card)return card;
 card=document.createElement('section');card.id='v151-people-inspection';
 card.setAttribute('role','status');
 card.setAttribute('aria-live','polite');
 card.setAttribute('aria-atomic','true');
 Object.assign(card.style,{
  position:'fixed',left:'50%',top:'9%',transform:'translateX(-50%)',
  width:'min(515px,88vw)',maxHeight:'62vh',overflow:'hidden',
  padding:'15px 20px',boxSizing:'border-box',
  border:'1px solid rgba(216,204,167,.62)',borderRadius:'9px',
  background:'rgba(20,24,25,.95)',color:'#e8e0c6',
  font:'15px/1.45 Arial, sans-serif',letterSpacing:'.02em',
  boxShadow:'0 6px 24px rgba(0,0,0,.38)',zIndex:'9',
  pointerEvents:'none',display:'none',textAlign:'left'
 });
 document.body.append(card);
 return card;
}
function showCard(card,site,newlyKnown){
 card.replaceChildren();
 const add=(text,opts={})=>{
  const node=document.createElement('div');
  node.textContent=text;
  Object.assign(node.style,opts);
  card.append(node);return node;
 };
 add(site.person.toUpperCase()+'  ·  PINEWOOD, 1997',
  {fontWeight:'bold',fontSize:'12px',letterSpacing:'.12em',color:'#b3bbad'});
 add(site.title,{fontWeight:'bold',fontSize:'18px',margin:'8px 0 9px'});
 for(const text of site.lines)add(text,{color:'#d3cfc4',fontSize:'14px'});
 add(newlyKnown?'Name added to PEOPLE. Press J for the journal.':
  'Recorded under PEOPLE. Press J for the journal.',
  {marginTop:'12px',paddingTop:'8px',borderTop:'1px solid #524e43',
   fontSize:'12px',color:'#a8cabc'});
 card.style.display='block';
}
export function installChapter1StaffInspectionV151(game){
 if(game?.levelIndex!==0||!game.__chapter1StaffBelongingsV150||
  !game.mallV70?.group?.getObjectByName||!game.storyV17?.recognizeStaffV151||
  !game.storyV17?.staffRecognitionStateV151||
  typeof game.updateInteraction!=='function'||
  typeof game.interact!=='function'||typeof game.resetState!=='function'||
  typeof game.rebuildJournal!=='function'||
  !game.controls?.yaw||!game.camera?.updateWorldMatrix)
  throw Error('V151 needs original E, original journal and physical V150 Chapter 1');
 if(game.__chapter1StaffInspectionV151)return game.__chapter1StaffInspectionV151;
 const ray=new THREE.Raycaster();
 let focused=null,card=null,cardUntil=0,inspections=0;
 const inspected=new Set();
 const panel=()=>card||(card=createInspectionPanel());
 const hideCard=()=>{if(card)card.style.display='none';cardUntil=0;};
 const clear=()=>{focused=null;inspections=0;inspected.clear();hideCard();};
 const possible=()=>game.levelIndex===0&&game.running&&!game.modal&&!game.dead&&
  !game.won&&!game.playerHidden&&!game.hideTransition&&
  !!game.mallV70?.group&&!!game.mallLayoutV70;
 const select=()=>{
  if(!possible()||game.interactTarget)return null;
  const p=game.controls.yaw.position;
  const room=game.mallLayoutV70.roomAt(p.x,p.z);
  ray.setFromCamera({x:0,y:0},game.camera);
  let nearest=null;
  for(const site of STAFF_BELONGINGS_V150){
   if(site.room!==room)continue;
   const root=game.mallV70.group.getObjectByName(
    'v150_physical_staff_belonging_'+site.id,true);
   if(!root||root.parent!==game.mallV70.group||
    root.userData?.staffBelongingV150!==true||!root.visible)continue;
   root.updateWorldMatrix(true,true);
   const hit=ray.intersectObject(root,true).find(h=>h.distance<=ORIGINAL_E_RANGE);
   if(!hit||nearest&&nearest.distance<=hit.distance)continue;
   nearest={site,root,distance:hit.distance,object:hit.object.name};
  }
  return nearest;
 };
 const originalUpdateInteraction=game.updateInteraction;
 game.updateInteraction=function(...args){
  const result=originalUpdateInteraction.apply(this,args);
  focused=select();
  if(cardUntil>0&&(!possible()||this.time>=cardUntil))hideCard();
  if(focused&&typeof document!=='undefined'){
   const hint=document.getElementById('hint');
   if(hint){
    hint.textContent='E  Examine '+focused.site.title;
    hint.classList.add('show');
   }
  }
  return result;
 };
 const originalInteract=game.interact;
 game.interact=function(...args){
  // Source actions ALWAYS keep priority even if a paper sits near them.
  if(this.interactTarget||!possible())return originalInteract.apply(this,args);
  // Revalidate gaze/distance at E time, not against a stale display hint.
  const target=select();
  if(!target)return originalInteract.apply(this,args);
  const id=STAFF_IDS[target.site.id];
  if(!id)throw Error('V151 cannot record a noncanonical name');
  const added=this.storyV17.recognizeStaffV151(id);
  inspections++;
  inspected.add(target.site.id);
  this.rebuildJournal(); // existing V17 PEOPLE list, not a second save/UI
  showCard(panel(),target.site,added);
  cardUntil=this.time+DISPLAY_SECONDS;
  focused=target;
  return;
 };
 const priorReset=game.resetState;
 game.resetState=function(...args){
  const result=priorReset.apply(this,args);
  // V148 invariant: world.clear BEFORE resetState; never bind missing meshes.
  clear();return result;
 };
 const getState=()=>({
  version:151,chapter:game.levelIndex+1,running:!!game.running,
  originalSourceTarget:game.interactTarget?.userData?.type||null,
  originalSourceLabel:game.interactTarget?.userData?.label||null,
  focusedId:focused?.site.id||null,
  focusedDistance:focused?.distance??null,
  focusedMesh:focused?.object||null,
  inspections,inspectedIds:[...inspected],
  recognition:Object.fromEntries(Object.entries(STAFF_IDS).map(([site,id])=>
   [id,game.storyV17.staffRecognitionStateV151(id)])),
  cardVisible:!!card&&card.style.display==='block',
  cardText:card?.textContent||'',
  addedOriginalInteractables:0,addedOriginalColliders:0
 });
 const api=Object.freeze({version:151,getState});
 game.__chapter1StaffInspectionV151=api;
 if(localQA()&&typeof window!=='undefined'){
  window.__PINEWOOD_CH1_STAFF_INSPECTION_V151_QA__={
   getState,
   aimActualPaperForTest(id){
    if(!possible())throw Error('V151 requires real live Chapter 1');
    const view=window.__PINEWOOD_CH1_STAFF_BELONGINGS_V150_QA__?.
     viewOriginalBelongingForTest(id);
    if(!view?.actualRayIntersection)throw Error('No first-person original paper hit '+id);
    game.updateInteraction();
    if(!focused||focused.site.id!==id||game.interactTarget)
     throw Error('Original camera did not select optional '+id);
    return {view,aim:getState(),hint:document.getElementById('hint')?.textContent};
   },
   inspectActualPaperWithOriginalE(id){
    const aimed=this.aimActualPaperForTest(id);
    game.interact(); // actual original Game.interact; E key also invokes it
    return {...aimed,after:getState()};
   }
  };
 }
 return api;
}
