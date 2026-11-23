/** V145: physical paper clues beside the ORIGINAL, still-interactive decoy pickups.
 * V139 keeps owning E collection, the inventory, Q throws and the Attendant AI.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {planChapter1DecoyTagsV145} from './chapter1-decoy-tags-v145.mjs';
const LOCAL_QA=()=>typeof location!=='undefined'&&
 ['localhost','127.0.0.1'].includes(location.hostname)&&
 new URLSearchParams(location.search).has('chapter1QA');

function drawOriginalPaperV145(site){
 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=640;
 const c=canvas.getContext('2d');
 if(!c)throw Error('V145 original paper requires local 2D texture canvas');
 c.fillStyle='#bdb49a';c.fillRect(0,0,1024,640);
 c.fillStyle='#535044';c.fillRect(38,37,948,5);c.fillRect(38,589,948,5);
 c.strokeStyle='#6b6352';c.lineWidth=4;c.strokeRect(24,24,976,590);
 // Quiet print wear, without generating a new physical room or object proxy.
 for(let i=0;i<90;i++){
  c.fillStyle='rgba(32,31,25,.065)';
  c.fillRect(40+(i*107)%940,56+(i*67)%500,2+(i%4),1+(i%3));
 }
 c.textAlign='center';c.textBaseline='middle';
 c.fillStyle='#413b30';c.font='bold 36px Arial, sans-serif';
 c.fillText(site.stamp,512,115,920);
 c.fillStyle='#22251f';c.font='bold 75px Arial, sans-serif';
 c.fillText(site.heading,512,284,922);
 c.fillStyle='#625747';c.fillRect(78,382,868,3);
 c.fillStyle='#292a22';c.font='bold 30px Arial, sans-serif';
 c.fillText(site.instruction,512,470,922);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({
  map:texture,roughness:1,metalness:0,side:THREE.FrontSide,
  emissive:new THREE.Color('#6c5d42'),emissiveIntensity:.05
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(site.width,site.height),material);
 // Paper lies on the original physical floor, not a floating UI billboard.
 mesh.name='v145_original_decoy_note_'+site.id;
 mesh.position.set(site.x,0.032,site.z);
 mesh.rotation.x=-Math.PI/2;
 mesh.userData={decoyNoteV145:true,originalLabel:site.label,
  originalRoom:site.room,sourceX:site.pickup.x,sourceZ:site.pickup.z};
 return mesh;
}

export function installChapter1DecoyTagsV145(game){
 if(game?.levelIndex!==0||!game.mallV70?.group?.add||
   !game.mallLayoutV70||!Array.isArray(game.world?.interactables)||
   !game.__chapter1StealthV139||typeof game.interact!=='function'||
   typeof game.resetState!=='function')
  throw Error('V145 needs authored Chapter 1 and genuine V139 decoy mechanics');
 if(game.__chapter1DecoyTagsV145){
  game.__chapter1DecoyTagsV145.bind();
  return game.__chapter1DecoyTagsV145;
 }
 let boundGroup=null,entries=[];
 const dispose=()=>{
  for(const {paper} of entries){
   paper.removeFromParent();
   paper.geometry.dispose();paper.material.map.dispose();paper.material.dispose();
  }
  entries=[];boundGroup=null;
 };
 const syncVisibility=()=>{
  for(const {pickup,paper} of entries)
   paper.visible=!!pickup.parent&&!pickup.userData.collected&&pickup.visible!==false;
 };
 const bind=()=>{
  if(game.levelIndex!==0)return;
  const group=game.mallV70.group;
  const sites=planChapter1DecoyTagsV145(game.mallLayoutV70);
  const items=sites.map(site=>{
   const found=game.world.interactables.filter(o=>o?.userData?.type==='decoy'&&
    o.userData.label===site.label&&!!o.parent);
   if(found.length!==1)throw Error('V145 requires exactly one original '+site.label+' interactable');
   const pickup=found[0],p=pickup.position;
   if(Math.hypot(p.x-site.pickup.x,p.z-site.pickup.z)>.4)
    throw Error('V145 source pickup moved away from genuine Chapter 1 route '+site.label);
   return pickup;
  });
  if(group===boundGroup&&entries.length===2&&
    entries.every((entry,i)=>entry.pickup===items[i])){
   syncVisibility();return;
  }
  dispose();
  if(typeof document!=='undefined'){
   entries=sites.map((site,i)=>({site,pickup:items[i],paper:drawOriginalPaperV145(site)}));
   for(const {paper} of entries)group.add(paper);
  }
  boundGroup=group;
  syncVisibility();
 };
 const originalInteract=game.interact;
 game.interact=function(...args){
  const out=originalInteract.apply(this,args);
  if(this.levelIndex===0)syncVisibility();
  return out;
 };
 const originalReset=game.resetState;
 game.resetState=function(...args){
  const out=originalReset.apply(this,args);
  // Original Game.startChapter calls world.clear() BEFORE resetState(), then
  // carves/builds the NEW Chapter 1 scene and only later invokes the V70
  // relocateStory bridge. At reset time the original E decoy pickups do not
  // exist yet: rebinding now throws and leaves Death -> Restart at 48%.
  // Release old floor-paper resources; bind() runs when V70 has rebuilt the
  // real pickup meshes and invokes installChapter1DecoyTagsV145 again.
  dispose();
  return out;
 };
 const getState=()=>({
  version:145,chapter:game.levelIndex+1,
  physicalPaper:entries.map(({site,pickup,paper})=>({
   label:site.label,originalRoom:site.room,attached:paper.parent===boundGroup,
   paperVisible:paper.visible,originalSource:pickup.userData.type,
   originalCollected:!!pickup.userData.collected,
   realPickupAttached:!!pickup.parent,originalX:pickup.position.x,originalZ:pickup.position.z,
   noteX:paper.position.x,noteY:paper.position.y,noteZ:paper.position.z,
   flatOnFloor:Math.abs(paper.rotation.x+Math.PI/2)<1e-7
  })),
  originalDecoysInInventory:game.decoys,extraPickups:0,extraColliders:0,
  newHUDTips:0
 });
 const api=Object.freeze({version:145,bind,getState});
 game.__chapter1DecoyTagsV145=api;bind();
 if(LOCAL_QA()&&typeof window!=='undefined')
  window.__PINEWOOD_CH1_DECOY_TAGS_V145_QA__={getState};
 return api;
}
