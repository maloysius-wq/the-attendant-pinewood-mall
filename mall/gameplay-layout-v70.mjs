import {MALL} from './masterplan-v66.mjs';
import {constructPhysicalShell} from './physical-shell-v67.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {VESTIBULE_HANDOFF_V112} from './vestibule-handoff-v112.mjs';

const CHAPTERS=Object.freeze([
 {level:'G',room:'service_vestibule',x:VESTIBULE_HANDOFF_V112.x,z:VESTIBULE_HANDOFF_V112.z,from:null},
 {level:'B1',room:'freight_b1',x:23,z:-110,from:'freight_lobby__freight_b1'},
 {level:'G',room:'security',x:35,z:-110,from:'b1_stair__security'},
 {level:'G',room:'annex_threshold',x:52,z:-99,from:'security__annex_threshold'},
 {level:'M1',room:'m1_stair',x:51,z:-103,from:'receiving_r12__m1_stair'},
 {level:'M1',room:'pa_control',x:75,z:-110,from:'mezz_hall__pa_control'}
]);
const ROOM=new Map(MALL.rooms.map(r=>[r.id,r]));
const LEVEL=new Map(MALL.levels.map(l=>[l.id,l]));
const cell=(x,z)=>Math.round(x)+','+Math.round(z);
const within=(v,a,b,pad=0)=>v>=a-pad&&v<=b+pad;

export function chapterRouteV70(chapter){
 if(!Number.isInteger(chapter)||chapter<1||chapter>6)throw new RangeError('Unknown Pinewood chapter: '+chapter);
 const p=CHAPTERS[chapter-1],y=LEVEL.get(p.level).y;
 return {chapter,level:p.level,room:p.room,spawn:{room:p.room,x:p.x,y:y+1.7,z:p.z},transitionFromPrevious:p.from};
}

function addWallCollision(colliders,w){
 const thick=w.thickness+.06;
 if(w.axis==='x')colliders.push({minX:w.at-thick/2,maxX:w.at+thick/2,minZ:w.start-.025,maxZ:w.end+.025,kind:w.role||'wall',id:w.id});
 else colliders.push({minX:w.start-.025,maxX:w.end+.025,minZ:w.at-thick/2,maxZ:w.at+thick/2,kind:w.role||'wall',id:w.id});
}

export function buildGameplayLayoutV70({chapter,level}={}){
 const canonical=chapterRouteV70(chapter);
 const activeLevel=level||canonical.level;
 if(!LEVEL.has(activeLevel))throw RangeError('Invalid gameplay floor '+activeLevel);
 const route=activeLevel===canonical.level?canonical:{...canonical,level:activeLevel,spawn:{room:'receiving_r12',x:51,y:1.7,z:-111}};
 const shell=constructPhysicalShell({level:activeLevel,chapter});
 const rooms=MALL.rooms.filter(r=>r.level===activeLevel);
 const walk=new Set(),tags=new Map(),colliders=[];
 for(const room of rooms){
  for(let z=Math.ceil(room.z1-.4);z<=Math.floor(room.z2+.4);z++){
   for(let x=Math.ceil(room.x1-.4);x<=Math.floor(room.x2+.4);x++){
    if(!within(x,room.x1,room.x2,.4)||!within(z,room.z1,room.z2,.4))continue;
    const k=cell(x,z);walk.add(k);tags.set(k,room.id);
   }
  }
 }
 for(const w of [...shell.walls,...shell.gates,...shell.railings])
  if(!['lintel','storefront-spandrel'].includes(w.role))addWallCollision(colliders,w); // Overhead solids are not walk-level obstacles.
 // Floor openings are real holes in the v67 mesh; never let the legacy
 // 2D walk grid place a suspended player over an elevator or stair void.
 const openings=activeLevel==='G'?
  [{id:'freight-shaft',x1:18.5,x2:22.5,z1:-115.8,z2:-110.5},
   {id:'north-stair-void',x1:30.5,x2:33.5,z1:-115.5,z2:-108}]:
  activeLevel==='M1'?
  [{id:'mezz-stair-void',x1:49.7,x2:52.3,z1:-114.5,z2:-104}]:[];
 for(const o of openings)colliders.push({minX:o.x1,maxX:o.x2,minZ:o.z1,maxZ:o.z2,kind:'open-shaft',id:o.id});
 // The Chapter 6 exit is a real threshold at x=86, not a trigger
 // three metres inside a room. A short off-property apron lets the
 // player cross the door plane before the ending takes control.
 if(chapter===6&&activeLevel==='G'){
  for(let x=86;x<=89;x++)for(let z=-43;z<=-41;z++){
   walk.add(cell(x,z));tags.set(cell(x,z),'east_employee_exit_apron');
  }
 }

 const furniture=FURNISHINGS_V69.fixtures.filter(f=>ROOM.get(f.room)?.level===route.level);
 for(const f of furniture){
  if(!Number.isFinite(f.radius)||f.radius<=0)continue;
  // Circular footprint for large licensed props, square AABB for the legacy AI grid.
  const r=f.radius*.83;
  colliders.push({minX:f.x-r,maxX:f.x+r,minZ:f.z-r,maxZ:f.z+r,kind:'furnishing',id:f.id});
 }
 const blocked=(x,z)=>colliders.some(c=>x>c.minX&&x<c.maxX&&z>c.minZ&&z<c.maxZ);
 const canStand=(x,z,r=.26)=>{
  if(!Number.isFinite(x)||!Number.isFinite(z))return false;
  const samples=[[x,z],[x+r,z],[x-r,z],[x,z+r],[x,z-r],
   [x+r*.72,z+r*.72],[x-r*.72,z+r*.72],[x+r*.72,z-r*.72],[x-r*.72,z-r*.72]];
  return samples.every(([px,pz])=>walk.has(cell(px,pz))&&!blocked(px,pz));
 };
 const roomAt=(x,z)=>rooms.find(r=>within(x,r.x1,r.x2)&&within(z,r.z1,r.z2))?.id||null;
 return {version:70,chapter,level:route.level,y:shell.y,shell,rooms,walk,tags,colliders,spawn:route.spawn,
  blocked,canStand,roomAt,storyAnchors:FURNISHINGS_V69.storyAnchors.filter(a=>ROOM.get(a.room)?.level===route.level)};
}

export function shortestRouteV70(layout,start,finish,{limit=12000}={}){
 if(!layout.canStand(start.x,start.z)||!layout.canStand(finish.x,finish.z))return [];
 const from={x:Math.round(start.x),z:Math.round(start.z)};
 const to={x:Math.round(finish.x),z:Math.round(finish.z)};
 const first=cell(from.x,from.z),goal=cell(to.x,to.z);
 const queue=[from],parents=new Map([[first,null]]);
 for(let i=0;i<queue.length&&i<limit;i++){
  const p=queue[i],k=cell(p.x,p.z);
  if(k===goal){const route=[];let at=k;while(at){const[x,z]=at.split(',').map(Number);route.push({x,z});at=parents.get(at)}return route.reverse();}
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const n={x:p.x+dx,z:p.z+dz},key=cell(n.x,n.z);
   if(parents.has(key)||!layout.canStand(n.x,n.z))continue;
   parents.set(key,k);queue.push(n);
  }
 }
 return [];
}

/** Eye line follows the real thirty-tread Receiving→M1 staircase, not a fictitious ramp. */
export function eyeHeightOnMezzStairV70(z){
 const bottomZ=-113.4,topZ=-104.7,rise=5.4;
 if(z<=bottomZ)return 1.7;
 if(z>=topZ)return 7.1;
 const t=(z-bottomZ)/(topZ-bottomZ);
 return 1.7+rise*t;
}
