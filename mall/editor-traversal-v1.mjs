import {MALL} from './masterplan-v66.mjs';
const inPlate=(x,z,p)=>x>=p.x1&&x<=p.x2&&z>=p.z1&&z<=p.z2;
const exteriorSurface=(x,z)=>
 (x>=-50&&x<=90&&z>=-22.5&&z<=43)||
 (x>=86&&x<=91&&z>=-44&&z<=-39);

/** Highest structural floor beneath avatar feet, using the v67 shaft-cut plates. */
export function findGroundBelow(x,y,z,shells){
 if(![x,y,z].every(Number.isFinite))return null;
 const candidates=[];
 for(const shell of shells){
  for(const p of shell.floorPlates){
   if(inPlate(x,z,p)&&p.y<=y+.0001)candidates.push(p.y);
  }
 }
 if(exteriorSurface(x,z)&&y>=0)candidates.push(0);
 return candidates.length?Math.max(...candidates):null;
}

/** On disabling flight, restore the real walk surface (or last safe spot). */
export function resolveFlyLanding(eye,lastGrounded,shells,{eyeHeight=1.7}={}){
 const floor=findGroundBelow(eye.x,eye.y-eyeHeight,eye.z,shells);
 if(floor===null)return {...lastGrounded};
 return {x:eye.x,y:floor+eyeHeight,z:eye.z};
}

/** Editor-only addressable physical leaf geometry, never campaign gate state. */
export function doorDescriptors(shells){
 const doorMap=new Map();
 for(const shell of shells){
  for(const p of shell.portals){
   if(p.type!=='doorway'||!p.axis)continue;
   doorMap.set(p.id,{
    id:p.id,label:p.from.replace(/_/g,' ')+' / '+p.to.replace(/_/g,' '),
    kind:'interior',axis:p.axis,at:p.at,start:p.start,end:p.end,
    width:p.width,height:p.height,y:shell.y,boarded:false
   });
  }
  for(const d of shell.doors){
   const width=d.width;
   const axis=d.id==='east_employee_exit'?'x':'z';
   const at=axis==='x'?d.x:d.z;
   const center=axis==='x'?d.z:d.x;
   doorMap.set(d.id,{
    id:d.id,label:d.label,kind:'exterior',axis,at,start:center-width/2,
    end:center+width/2,width,height:d.height,y:shell.y,
    boarded:d.status==='boarded'
   });
  }
 }
 return [...doorMap.values()];
}

/** Segment intersects a closed physical door aperture at body height. */
export function crossesClosedDoor(from,to,doors,openIds=new Set()){
 if(!from||!to)return false;
 return doors.some(d=>{
  if(openIds.has(d.id))return false;
  const a=d.axis==='x'?from.x:from.z,b=d.axis==='x'?to.x:to.z;
  if((a-d.at)*(b-d.at)>0||Math.abs(a-b)<1e-9)return false;
  const t=(d.at-a)/(b-a);
  if(t<0||t>1)return false;
  const side=d.axis==='x'?from.z+(to.z-from.z)*t:from.x+(to.x-from.x)*t;
  return side>d.start+.02&&side<d.end-.02;
 });
}
