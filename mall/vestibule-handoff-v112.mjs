import {constructPhysicalShell} from './physical-shell-v67.mjs';

// One physical point and bearing for the final film frame and Chapter 1.
export const VESTIBULE_HANDOFF_V112=Object.freeze({
 room:'service_vestibule',x:12.5,y:1.7,z:-32.75,yaw:0,pitch:0
});

export function vestibuleInnerPortalV112(shell=constructPhysicalShell({chapter:1,level:'G'})){
 const p=shell.portals.find(p=>p.id==='service_vestibule__central_gallery');
 if(!p||p.type!=='doorway'||p.axis!=='z'||Math.abs(p.at+43)>.001||
    p.width<1.6||p.width>2.1||p.start<9||p.end>11.01)
  throw Error('Physical service vestibule to atrium doorway has changed; do not place a blind door');
 return Object.freeze({id:p.id,axis:p.axis,x:(p.start+p.end)/2,z:p.at,
  start:p.start,end:p.end,width:p.width,height:p.height});
}
