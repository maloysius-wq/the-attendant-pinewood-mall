/** V134: exact exhaustive original-mall residual ledger for Issue #119.
 * Recompute every source cell, not a hand-tallied "unallocated" number.
 * Distinguish true missing service architecture from intentional 1m exterior
 * masonry setback cavities. Never claim a setback has real walls without
 * reporting its actual source-backed inner and outer wall coverage.
 */
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
import {constructPhysicalShell} from './physical-shell-v67.mjs';
const EPS=1e-6,area=r=>(r.x2-r.x1)*(r.z2-r.z1),round=n=>Math.round(n*1000)/1000;
const rect=(x1,x2,z1,z2)=>({x1,x2,z1,z2});
const closures=Object.freeze([
 rect(-46,-29,-48,-43), // V129 physically shipped
 rect(29,47,-118.5,-115), // V131 physically shipped
 rect(7,9,-43,-22.5) // V133 pending physical source release
]);
function subtract(a,h){
 const x1=Math.max(a.x1,h.x1),x2=Math.min(a.x2,h.x2);
 const z1=Math.max(a.z1,h.z1),z2=Math.min(a.z2,h.z2);
 if(x1>=x2||z1>=z2)return [a];
 return [
  rect(a.x1,x1,a.z1,a.z2),rect(x2,a.x2,a.z1,a.z2),
  rect(x1,x2,a.z1,z1),rect(x1,x2,z2,a.z2)
 ].filter(q=>q.x2-q.x1>EPS&&q.z2-q.z1>EPS);
}
function category(r){
 if(r.x1===-47&&r.x2===-46)return 'originalWestFacade';
 if(r.x1===46&&r.x2===47)return 'originalEastFacade';
 if(r.x1===85&&r.x2===86)return 'annexEastFacade';
 if(r.z1===-118.5&&r.z2===-118)return 'originalRearFacade';
 if(r.x1===-17&&r.x2===-11&&r.z1>=-118&&r.z2<=-111)return 'westRearServiceCore';
 return 'unclassified';
}
function coverage(walls,axis,at,start,end){
 const all=walls.filter(w=>w.axis===axis&&Math.abs(w.at-at)<EPS&&
  w.bottom<=EPS&&w.top>=3.45-EPS)
  .map(w=>[Math.max(start,w.start),Math.min(end,w.end)])
  .filter(([a,b])=>b-a>EPS).sort((a,b)=>a[0]-b[0]);
 const intervals=[];
 for(const [a,b]of all){
  const last=intervals.at(-1);
  if(last&&a<=last[1]+EPS)last[1]=Math.max(last[1],b);
  else intervals.push([a,b]);
 }
 const gaps=[];let cursor=start;
 for(const [a,b]of intervals){if(a-cursor>EPS)gaps.push([cursor,a]);cursor=Math.max(cursor,b)}
 if(end-cursor>EPS)gaps.push([cursor,end]);
 return {metres:round(intervals.reduce((n,[a,b])=>n+b-a,0)),gaps};
}
function face(cell,type){
 if(type==='originalWestFacade')return [
  {axis:'x',at:-47,start:cell.z1,end:cell.z2},
  {axis:'x',at:-46,start:cell.z1,end:cell.z2}];
 if(type==='originalEastFacade')return [
  {axis:'x',at:47,start:cell.z1,end:cell.z2},
  {axis:'x',at:46,start:cell.z1,end:cell.z2}];
 if(type==='annexEastFacade')return [
  {axis:'x',at:86,start:cell.z1,end:cell.z2},
  {axis:'x',at:85,start:cell.z1,end:cell.z2}];
 if(type==='originalRearFacade')return [
  {axis:'z',at:-118.5,start:cell.x1,end:cell.x2},
  {axis:'z',at:-118,start:cell.x1,end:cell.x2}];
 return [];
}
export function auditOriginalResidualRegisterV134(){
 const original=auditOriginalRemainderV128(),shell=constructPhysicalShell({level:'G',chapter:6});
 const cells=original.cells.flatMap(c=>closures.reduce((pieces,h)=>
  pieces.flatMap(p=>subtract(p,h)),[c]));
 const grouped={},evidence=[];
 for(const c of cells){
  const type=category(c),a=area(c);
  const group=grouped[type]??{area:0,count:0};
  group.area+=a;group.count++;
  grouped[type]=group;
  if(type==='westRearServiceCore'||type==='unclassified')continue;
  const checks=face(c,type).map(f=>({...f,...coverage(shell.walls,f.axis,f.at,f.start,f.end)}));
  if(checks.some(q=>q.gaps.length))evidence.push({cell:c,category:type,checks});
 }
 for(const g of Object.values(grouped))g.area=round(g.area);
 const total=round(cells.reduce((n,c)=>n+area(c),0));
 return Object.freeze({
  source:'exact disjoint V128 original footprint cells less real V129/V131 and pending V133',
  originalBaselineSqm:original.area,
  originalAlreadyClosedV129Sqm:85,originalAlreadyClosedV131Sqm:63,
  proposedFrontClosureV133Sqm:41,
  residualIfV133ShipsSqm:total,
  westRearSourceCandidateSqm:round((grouped.westRearServiceCore?.area||0)+3),
  perimeterFacadeRemainderBeforeWestRearClosureSqm:
   round(total-(grouped.westRearServiceCore?.area||0)-3),
  expectedAfterWestRearClosureSqm:round(total-45),
  groups:grouped,
  unclassifiedCells:cells.filter(c=>category(c)==='unclassified'),
  perimeterWallCoverageFindings:evidence,
  zeroDuplicatePlanarCells:original.overlaps===0,
  statement:'read-only; 1m cavity is NOT automatically a finished wall or gameplay route'
 });
}
