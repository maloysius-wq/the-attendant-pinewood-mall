import {vestibuleInnerPortalV112} from './vestibule-handoff-v112.mjs';

// The real shared door stays CLOSED through the entire cinematic. Chapter 1
// installs a physical blocker and a local E interaction; story code is never
// permitted to silently open it during the film/game transition.
export function installVestibuleDoorGameplayV112(game){
 game.vestibuleDoorControllerV112?.dispose();
 game.vestibuleDoorControllerV112=null;
 if(!game?.world?.colliders||game.mallLayoutV70?.level!=='G')return null;
 const door=game.mallV70?.vestibuleDoorV112;
 if(!door)throw Error('Shared vestibule inner fire door was not mounted in game');
 const portal=vestibuleInnerPortalV112();
 const blocker={id:'vestibule-inner-fire-door-v112',kind:'scripted-fire-door',
  minX:portal.start+.01,maxX:portal.end-.01,
  minZ:portal.z-.115,maxZ:portal.z+.115,
  navBlock:true,physicalBlock:true,disabled:door.state.opened,owner:null};
 game.world.colliders.push(blocker);
 game.world.navCache.clear();
 const hint=document.createElement('div');
 hint.id='pinewood-inner-door-hint-v112';hint.setAttribute('role','status');
 hint.textContent='E  •  Open the concourse fire door';
 Object.assign(hint.style,{position:'fixed',left:'50%',bottom:'76px',
  transform:'translateX(-50%)',zIndex:'14',pointerEvents:'none',display:'none',
  font:'600 14px system-ui,sans-serif',letterSpacing:'.02em',
  background:'rgba(9,16,16,.88)',color:'#e7e4d6',padding:'10px 14px',
  border:'1px solid #75817b',borderRadius:'5px'});
 document.body.append(hint);
 const nearby=()=>{
  const at=game.controls?.yaw?.position;
  if(!at||door.state.opened||game.mallLayoutV70?.level!=='G')return false;
  if(document.querySelector('.screen.show')||document.querySelector('#pwm-opening.pwm-active'))return false;
  return Math.hypot(at.x-portal.x,at.z-portal.z)<2.9;
 };
 let disposed=false,raf=0;
 const key=e=>{
  if(disposed||e.repeat||e.code!=='KeyE'||!nearby())return;
  e.preventDefault();e.stopImmediatePropagation();
  if(door.open()){
   blocker.disabled=true;
   game.world.navCache.clear();
   hint.style.display='none';
  }
 };
 document.addEventListener('keydown',key,true);
 const tick=()=>{
  if(disposed)return;
  hint.style.display=nearby()?'block':'none';
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
