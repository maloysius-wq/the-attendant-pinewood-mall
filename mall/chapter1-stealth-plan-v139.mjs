/** Original G-floor V139 stealth waypoints. No scene or Builder mutation. */
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from './gameplay-layout-v70.mjs';
export const CHAPTER1_STEALTH_V139=Object.freeze({
 cabinet:Object.freeze({id:'fallow_display',approach:Object.freeze({x:-41,z:-54})}),
 pickups:Object.freeze([
  Object.freeze({label:'Noise Maker',room:'west_gallery',x:-17,z:-79}),
  Object.freeze({label:'Pager Decoy',room:'east_gallery',x:16,z:-72})
 ]),
 revealDelay:7,peekSeconds:2.7,graceSeconds:15,sideFallbackSeconds:15
});
export function validateStealthRoutesV139(){
 const layout=buildGameplayLayoutV70({chapter:1});
 const source=FURNISHINGS_V69.fixtures.find(x=>x.id===CHAPTER1_STEALTH_V139.cabinet.id);
 const faults=[],approach=CHAPTER1_STEALTH_V139.cabinet.approach;
 if(!source||source.role!=='cabinet'||
   source.model!=='assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb'||
   source.x!==-43||source.z!==-54)
  faults.push('Original licensed Fallow cabinet source missing or changed');
 const goals=[{id:'hide-cabinet',...approach},...CHAPTER1_STEALTH_V139.pickups.map(p=>({id:p.label,x:p.x,z:p.z}))];
 const names=new Set();
 for(const p of goals){
  if(names.has(p.id))faults.push('Duplicate source stealth target '+p.id);names.add(p.id);
  if(!layout.canStand(p.x,p.z))faults.push('Unstandable source stealth target '+p.id);
  if(shortestRouteV70(layout,layout.spawn,p).length===0)faults.push('Stealth source unreachable from V113 original spawn '+p.id);
 }
 if(!source||Math.hypot(source.x-approach.x,source.z-approach.z)>2.25||
   Math.hypot(source.x-approach.x,source.z-approach.z)<1.2)
  faults.push('Player cannot safely use the original source cabinet in E range');
 for(const p of CHAPTER1_STEALTH_V139.pickups){
  if(layout.roomAt(p.x,p.z)!==p.room)faults.push('Noise Maker not in original source room '+p.label);
  for(const id of ['A','B','C']){
   const breaker={A:{x:-16,z:-62},B:{x:20,z:-62},C:{x:3,z:-115}}[id];
   if(shortestRouteV70(layout,p,breaker).length===0)
    faults.push('Pickup '+p.label+' cannot reach original circuit '+id);
  }
 }
 return faults;
}
/** Choose only real nav-passable 9–14 m cells with true player LOS.
 * Prefer visible in the camera's forward half-space, never a pop-in at 0.7 m.
 * Return null rather than spawn in a wall/shaft or force a scripted kill.
 */
export function chooseDistantRevealV139({player,forward,walk,passable,sight,allowSide=false}={}){
 if(!player||!forward||!walk||typeof passable!=='function'||typeof sight!=='function')
  return null;
 const candidates=[];
 for(const cell of walk){
  const [x,z]=cell.split(',').map(Number),dx=x-player.x,dz=z-player.z;
  const dist=Math.hypot(dx,dz);
  if(!Number.isFinite(dist)||dist<9||dist>14||!passable(x,z))continue;
  const dot=(forward.x*dx+forward.z*dz)/dist;
  if(dot<(allowSide?-.1:.35))continue;
  if(!sight({x,y:player.y||0,z}))continue;
  candidates.push({x,z,distance:dist,dot,score:Math.abs(dist-11.5)+(1-dot)*3});
 }
 candidates.sort((a,b)=>a.score-b.score||a.x-b.x||a.z-b.z);
 return candidates[0]||null;
}
