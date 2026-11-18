/** V134: source-read-only original west rear janitorial/gallery service gap.
 * 42m² is the roomless interior interstice, 3m² its existing original rear
 * facade cut. No real source floor is missing, and no imaginary room is added.
 */
import {MALL} from './masterplan-v66.mjs';
import {constructPhysicalShell} from './physical-shell-v67.mjs';
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
import {auditRearServiceClosureV131} from './rear-service-closure-v131.mjs';
const EPS=1e-6,near=(a,b)=>Math.abs(a-b)<EPS,round=x=>Math.round(x*1000)/1000;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
export const WEST_REAR_ORIGINAL_V134=Object.freeze({
 id:'v134_original_rear_west_service_interstice',
 x1:-17,x2:-11,z1:-118.5,z2:-111,grossArea:45,
 originalInteriorArea:42,originalFacadeReturn:3
});
function boundary(walls,axis,at,start,end){
 const lines=walls.filter(w=>w.axis===axis&&near(w.at,at)&&w.bottom<=EPS&&w.top>=3.45-EPS)
  .map(w=>[Math.max(start,w.start),Math.min(end,w.end)])
  .filter(([a,b])=>b-a>EPS).sort((a,b)=>a[0]-b[0]);
 const joined=[];
 for(const [a,b]of lines){
  const last=joined.at(-1);
  if(last&&a<=last[1]+EPS)last[1]=Math.max(last[1],b);
  else joined.push([a,b]);
 }
 const absent=[];let cursor=start;
 for(const [a,b]of joined){
  if(a-cursor>EPS)absent.push([cursor,a]);
  cursor=Math.max(cursor,b);
 }
 if(end-cursor>EPS)absent.push([cursor,end]);
 return {axis,at,span:[start,end],
  coverageMetres:round(joined.reduce((sum,[a,b])=>sum+b-a,0)),
  absentMetres:round(absent.reduce((sum,[a,b])=>sum+b-a,0)),
  absentIntervals:absent};
}
export function surveyOriginalWestRearV134(){
 const rect=WEST_REAR_ORIGINAL_V134;
 const old=auditOriginalRemainderV128();
 const rear=auditRearServiceClosureV131();
 const shell=constructPhysicalShell({level:'G',chapter:6});
 const sourceFaces=[
  boundary(shell.walls,'x',rect.x1,rect.z1,rect.z2),
  boundary(shell.walls,'x',rect.x2,rect.z1,rect.z2),
  boundary(shell.walls,'z',rect.z1,rect.x1,rect.x2),
  boundary(shell.walls,'z',rect.z2,rect.x1,rect.x2)
 ];
 const floor=shell.floorPlates.reduce((a,p)=>a+overlap(p,rect),0);
 const ceiling=shell.ceilings.reduce((a,p)=>a+overlap(p,rect),0);
 const roof=shell.roofs.reduce((a,p)=>a+overlap(p,rect),0);
 const unassigned=old.cells.reduce((a,p)=>a+overlap(p,rect),0);
 const portalConflicts=shell.portals.filter(p=>p.type==='doorway'&&sourceFaces.some(f=>
  p.axis===f.axis&&near(p.at,f.at)&&p.start<f.span[1]-EPS&&p.end>f.span[0]+EPS)).map(p=>p.id);
 return Object.freeze({
  source:'single authoritative 1979 original G-level physical shell, read-only',
  scope:{...rect},
  immutableOriginalResidualSqm:old.area,
  afterV131ResidualSqm:rear.physicalResidualRemaining,
  afterFutureV133FrontSqm:rear.physicalResidualRemaining-41,
  verifiedOriginalUnassignedSqm:round(unassigned),
  measuredOriginalFloorSqm:round(floor),
  measuredOriginalCeilingSqm:round(ceiling),
  measuredOriginalWeatherRoofSqm:round(roof),
  sourceFaces,
  portalConflicts,
  adjacentJanitorialBayPresent:shell.closedBays?.some(b=>b.id==='west_janitorial'),
  adjacentCanonicalNorthServicePresent:MALL.rooms.some(r=>r.id==='north_service'),
  adjacentCanonicalWestGalleryPresent:MALL.rooms.some(r=>r.id==='west_gallery'),
  originalRooms:MALL.rooms.length,originalEvidence:MALL.evidence.length,
  constructionApproved:false,
  requiredBeforeConstruction:[
   'Seal only exact absent source masonry spans on four actual old boundaries; never duplicate the long janitorial partition or rear exterior',
   'Do not invent a west-gallery entrance or a false route through the inaccessible service relief',
   'Keep the original x-11 north-service and main-gallery physical threshold accessible',
   'Use the existing single y=0 slab and build an actual attached underside only when all supporting original walls are established',
   'Pass all six chapter and original V113 door checks plus genuine 1440x900 source WebGL review'
  ]
 });
}
