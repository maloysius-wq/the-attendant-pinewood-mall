/** V128 independent exact-coordinate residual property survey.
 * Read-only audit. No guessed walls, filler shops or playable room changes. */
import {MALL} from './masterplan-v66.mjs';
import {SEALED_BAYS_V116} from './sealed-bay-plan-v116.mjs';
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const inside=(r,x,z)=>x>=r.x1&&x<r.x2&&z>=r.z1&&z<r.z2;
const cuts=(rects,coord)=>[...new Set(rects.flatMap(r=>[r[coord+'1'],r[coord+'2']]))].sort((a,b)=>a-b);
export const ORIGINAL_REMAINDER_POCKETS_V128=Object.freeze([
 Object.freeze({id:'west_original_facade_relief',x1:-46,x2:-29,z1:-48,z2:-43,area:85,
  constraint:'original Fallow\'s north wall and shutter geometry; source facade review required'}),
 Object.freeze({id:'east_rear_loading_relief',x1:29,x2:46,z1:-118,z2:-115,area:51,
  constraint:'rear dock/security and B1 north stair; preserve exterior/freight clearance'}),
 Object.freeze({id:'main_entry_service_seam',x1:7,x2:9,z1:-43,z2:-22.5,area:41,
  constraint:'boarded front lobby versus precise V113 contractor approach; preserve door/camera'})
]);
const rounded=v=>Math.round(v*1000)/1000;
export function auditOriginalRemainderV128({
 plan=MALL,sealed=SEALED_BAYS_V116
}={}){
 const footprints=[plan.footprints.original,plan.footprints.annex];
 const ground=plan.rooms.filter(r=>r.level==='G');
 const all=[...footprints,...ground,...sealed];
 const xs=cuts(all,'x'),zs=cuts(all,'z');
 const cells=[];let residual=0,overlaps=0,covered=0;
 for(let i=1;i<xs.length;i++)for(let j=1;j<zs.length;j++){
  const c={x1:xs[i-1],x2:xs[i],z1:zs[j-1],z2:zs[j]};
  const centerX=(c.x1+c.x2)/2,centerZ=(c.z1+c.z2)/2;
  if(!footprints.some(f=>inside(f,centerX,centerZ)))continue;
  const hits=ground.filter(r=>inside(r,centerX,centerZ)).length+
   sealed.filter(r=>inside(r,centerX,centerZ)).length;
  if(hits>1)overlaps+=area(c);
  if(hits===0){const a=area(c);residual+=a;cells.push({...c,area:rounded(a)});}
  else covered+=area(c);
 }
 const pocketAudit=ORIGINAL_REMAINDER_POCKETS_V128.map(p=>{
  const a=cells.filter(c=>c.x1>=p.x1&&c.x2<=p.x2&&c.z1>=p.z1&&c.z2<=p.z2)
   .reduce((sum,c)=>sum+c.area,0);
  return {...p,verifiedUnassignedArea:rounded(a),fitsExactly:Math.abs(a-p.area)<.001};
 });
 return {
  area:rounded(residual),covered:rounded(covered),overlaps:rounded(overlaps),
  cells,cellCount:cells.length,largestCells:[...cells].sort((a,b)=>b.area-a.area).slice(0,16),
  knownPockets:pocketAudit,knownPocketsArea:177,
  otherUnassignedArea:rounded(residual-177),
  status:'survey-only; no new geometry or fictional sealed bays allocated'
 };
}
