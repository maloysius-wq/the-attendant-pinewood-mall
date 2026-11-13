/** V114 measured architectural coverage, without modifying the world. */
import {MALL} from './masterplan-v66.mjs';

const near=(a,b)=>Math.abs(a-b)<1e-6;
const inside=(r,x,z)=>x>=r.x1&&x<r.x2&&z>=r.z1&&z<r.z2;
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const round=n=>Math.round(n*1000)/1000;
function levelFootprints(plan,level){
 return level==='G'?[plan.footprints.original,plan.footprints.annex]:
  [plan.footprints[level]];
}
export function auditArchitecturalCoverageV114(plan=MALL){
 const reports=[];
 for(const level of plan.levels.map(l=>l.id)){
  const footprints=levelFootprints(plan,level),rooms=plan.rooms.filter(r=>r.level===level);
  const xCuts=[...new Set([...footprints,...rooms].flatMap(r=>[r.x1,r.x2]))].sort((a,b)=>a-b);
  const zCuts=[...new Set([...footprints,...rooms].flatMap(r=>[r.z1,r.z2]))].sort((a,b)=>a-b);
  let footprintArea=0,assignedArea=0,unassignedArea=0,overlapArea=0;
  const unassignedTiles=[];
  for(let i=1;i<xCuts.length;i++)for(let j=1;j<zCuts.length;j++){
   const x1=xCuts[i-1],x2=xCuts[i],z1=zCuts[j-1],z2=zCuts[j];
   if(x2<=x1||z2<=z1)continue;
   const x=(x1+x2)/2,z=(z1+z2)/2;
   if(!footprints.some(r=>inside(r,x,z)))continue;
   const a=(x2-x1)*(z2-z1),count=rooms.filter(r=>inside(r,x,z)).length;
   footprintArea+=a;
   if(count)assignedArea+=a;
   if(count>1)overlapArea+=a;
   if(!count){unassignedArea+=a;unassignedTiles.push({x1,x2,z1,z2,area:round(a)});}
  }
  const intersections=[];
  for(let i=0;i<rooms.length;i++)for(let j=i+1;j<rooms.length;j++){
   const a=rooms[i],b=rooms[j];
   const x=Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1));
   const z=Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
   if(x*z>1e-6)intersections.push({rooms:[a.id,b.id],area:round(x*z)});
  }
  reports.push({level,roomCount:rooms.length,
   footprintArea:round(footprintArea),assignedArea:round(assignedArea),
   unassignedArea:round(unassignedArea),unassignedPercent:round(100*unassignedArea/footprintArea),
   overlapArea:round(overlapArea),intersections,
   largestUnassignedTiles:unassignedTiles.sort((a,b)=>b.area-a.area).slice(0,12),
   sumRoomArea:round(rooms.reduce((s,r)=>s+area(r),0))});
 }
 return reports;
}
