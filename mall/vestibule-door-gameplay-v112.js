import {vestibuleInnerPortalV112} from './vestibule-handoff-v112.mjs';

// Source-pinned physical fire door: E toggles OPEN/CLOSED from EITHER side.
// The door remains closed through the film and at the first playable frame.
// No scripted auto-open, no wall phasing, and no trapping the player in steel.
export function installVestibuleDoorGameplayV112(game){
 game.vestibuleDoorControllerV112?.dispose();
 game.vestibuleDoorControllerV112=null;
 if(!game?.world?.colliders||game.mallLayoutV70?.level!=='G')return null;
 const door=game.mallV70?.vestibuleDoorV112;
 if(!door)throw Error('Shared vestibule inner source-asset fire door was not mounted');
 // Starting over closes immediately. Ordinary E closing is animated.
 if(game.levelIndex===0)door.reset();
 const portal=vestibuleInnerPortalV112();
 const blocker={id:'vestibule-inner-fire-door-v112',kind:'scripted-fire-door',
  minX:portal.start+.01,maxX:portal.end-.01,
  minZ:portal.z-.115,maxZ:portal.z+.115,
  navBlock:true,physicalBlock:true,disabled:door.state.openFraction>.92,owner:null};
 game.world.colliders.push(blocker);
 game.world.navCache.clear();
 const hint=document.createElement('div');
 hint.id='pinewood-inner-door-hint-v112';hint.setAttribute('role','status');
 Object.assign(hint.style,{position:'fixed',left:'50%',bottom:'76px',
  transform:'translateX(-50%)',zIndex:'14',pointerEvents:'none',display:'none',
  font:'600 14px system-ui,sans-serif',letterSpacing:'.02em',
  background:'rgba(9,16,16,.88)',color:'#e7e4d6',padding:'10px 14px',
  border:'1px solid #75817b',borderRadius:'5px'});
 document.body.append(hint);
 const player=()=>game.controls?.yaw?.position;
 const occupied=()=>{
  const at=player();
  // Keep the corridor free of collision toggles while a human occupies the
  // leaf's swept threshold. The far-side approach also counts.
  return !!at&&at.x>portal.start-.27&&at.x<portal.end+.27&&
   Math.abs(at.z-portal.z)<.58;
 };
 const nearby=()=>{
  const at=player();
  if(!at||game.mallLayoutV70?.level!=='G')return false;
  if(document.querySelector('.screen.show')||
     document.querySelector('#pwm-opening.pwm-active'))return false;
  return Math.hypot(at.x-portal.x,at.z-portal.z)<2.9;
 };
 let disposed=false,raf=0;
 const key=e=>{
  if(disposed||e.repeat||e.code!=='KeyE'||!nearby())return;
  e.preventDefault();e.stopImmediatePropagation();
  // The player may not close a door THROUGH their current position.
  if(door.state.targetOpen&&occupied())return;
  door.toggle();
 };
 document.addEventListener('keydown',key,true);
 const tick=()=>{
  if(disposed)return;
  // If someone steps into the passage while the door is closing, reverse
  // it rather than let a fast player become trapped in the blocking slab.
  if(door.state.closing&&occupied())door.open();
  // Block only while the actual animated source mesh covers the aperture.
  // Deferring blockage while occupied avoids collision appearing on top
  // of the player. Keep nav cache coherent on BOTH open and close.
  const shouldBlock=door.state.openFraction<=.92&&!occupied();
  if(blocker.disabled===shouldBlock){
   blocker.disabled=!shouldBlock;
   game.world.navCache.clear();
  }
  const active=nearby();
  hint.style.display=active?'block':'none';
  if(active)hint.textContent=door.state.targetOpen?
   occupied()?'Move clear of the doorway to close':'E  •  Close the concourse door':
   'E  •  Open the concourse door';
  raf=requestAnimationFrame(tick);
 };
 raf=requestAnimationFrame(tick);
 const api={blocker,door,dispose(){
  if(disposed)return;disposed=true;cancelAnimationFrame(raf);
  document.removeEventListener('keydown',key,true);hint.remove();
 }};
 game.vestibuleDoorControllerV112=api;
 return api;
}
