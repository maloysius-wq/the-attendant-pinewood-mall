/** V130 read-only original-rear source survey.
 * Never render a guessed room, fill a fire-stair opening, change a private
 * Builder draft, or count footprint area as an existing walkable slab.
 */
import {MALL} from './masterplan-v66.mjs';
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from './residual-firebreak-plan-v129.mjs';
import {constructPhysicalShell} from './physical-shell-v67.mjs';

const EPS=1e-6,round=n=>Math.round(n*1000)/1000;
const rectArea=r=>(r.x2-r.x1)*(r.z2-r.z1);
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));

/** The actual 1979 rear exterior is z=-118.5, NOT the preliminary
 * 51m² pocket's arbitrary z=-118 survey cut. Its east wall is x=47,
 * NOT x=46, the internal boundary of Security/CCTV. */
export const ORIGINAL_REAR_SOURCE_ENVELOPE_V130=Object.freeze({
 id:'original_east_rear_service_source_envelope',
 x1:29,x2:47,z1:-118.5,z2:-115
});
export const ORIGINAL_NORTH_STAIR_OPENING_V130=Object.freeze({
 x1:30.5,x2:33.5,z1:-115.5,z2:-108
});
export const ORIGINAL_REAR_POCKET_V128=Object.freeze({
 x1:29,x2:46,z1:-118,z2:-115
});

function boundaryCoverage(walls,axis,at,start,end){
 const intervals=walls.filter(w=>w.axis===axis&&Math.abs(w.at-at)<EPS&&
  w.bottom<=EPS&&w.top>=3.45-EPS)
  .map(w=>[Math.max(start,w.start),Math.min(end,w.end)])
  .filter(([a,b])=>b-a>EPS).sort((a,b)=>a[0]-b[0]);
 const merged=[];
 for(const [a,b] of intervals){
  const last=merged.at(-1);
  if(last&&a<=last[1]+EPS)last[1]=Math.max(last[1],b);
  else merged.push([a,b]);
 }
 const open=[];let cursor=start;
 for(const [a,b] of merged){
  if(a-cursor>EPS)open.push([cursor,a]);
  cursor=Math.max(cursor,b);
 }
 if(end-cursor>EPS)open.push([cursor,end]);
 return {
  axis,at,span:[start,end],
  coveredMetres:round(merged.reduce((sum,[a,b])=>sum+b-a,0)),
  absentMetres:round(open.reduce((sum,[a,b])=>sum+b-a,0)),
  absentIntervals:open
 };
}

/** Existing source-data diagnostics ONLY. No constructors or render changes. */
export function surveyOriginalRearV130(){
 const zone=ORIGINAL_REAR_SOURCE_ENVELOPE_V130;
 const old=auditOriginalRemainderV128();
 const last=auditOriginalClosuresV129();
 const shell=constructPhysicalShell({level:'G',chapter:6});
 // Preserve the independently verified PRE-V131 original masonry/ceiling
 // baseline for future regressions, even after those two gaps are built.
 const originalWalls=shell.walls.filter(w=>w.role!=='v131-rear-service-partition');
 const originalCeilings=shell.ceilings.filter(c=>!c.id.startsWith('v131_'));
 const unassigned=old.cells.reduce((a,c)=>a+overlap(c,zone),0);
 const actualFloor=shell.floorPlates.reduce((a,p)=>a+overlap(p,zone),0);
 const shaftCut=overlap(zone,ORIGINAL_NORTH_STAIR_OPENING_V130);
 const otherPockets=unassigned-overlap(zone,ORIGINAL_REAR_POCKET_V128);
 const sides=[
  boundaryCoverage(originalWalls,'z',zone.z1,zone.x1,zone.x2),
  boundaryCoverage(originalWalls,'x',zone.x2,zone.z1,zone.z2),
  boundaryCoverage(originalWalls,'z',zone.z2,zone.x1,zone.x2),
  boundaryCoverage(originalWalls,'x',zone.x1,zone.z1,zone.z2)
 ];
 const actualCeiling=originalCeilings.reduce((a,c)=>a+overlap(c,zone),0);
 const actualRoof=shell.roofs.reduce((a,r)=>a+overlap(r,zone),0);
 const stair=MALL.links.find(l=>l.type==='stairs'&&
  l.from==='b1_stair'&&l.to==='security');
 const physicalStair=shell.stairs.find(s=>s.from==='b1_stair'&&s.to==='security');
 const doorwayConflicts=shell.portals.filter(p=>p.type==='doorway'&&sides.some(side=>
  p.axis===side.axis&&Math.abs(p.at-side.at)<EPS&&
  p.end>side.span[0]+EPS&&p.start<side.span[1]-EPS));
 return Object.freeze({
  source:'original 1979 physical shell; read-only pre-V131 baseline',
  scope:{...zone},grossFootprintSqm:round(rectArea(zone)),
  v128PreClosureResidualSqm:old.area,v129StillUnassignedSqm:last.remaining,
  prelimPocketSqm:round(overlap(zone,ORIGINAL_REAR_POCKET_V128)),
  additionalRealEnvelopeReliefSqm:round(otherPockets),
  originalUnassignedInsideEnvelopeSqm:round(unassigned),
  actualSourceFloorSqm:round(actualFloor),
  originalStairHoleSqm:round(shaftCut),
  sourceFloorAbsentSqm:round(rectArea(zone)-actualFloor),
  originalRoofAboveSqm:round(actualRoof),
  originalInteriorCeilingSqm:round(actualCeiling),
  originalBoundaryFaces:sides,
  originalStairLink:stair?{...stair.at,minimumChapter:stair.minChapter}:null,
  physicalStairPresent:Boolean(physicalStair),
  portalConflicts:doorwayConflicts.map(p=>p.id),
  chapter6ExitStillGatedAtEarlierChapters:shell.doors.some(d=>
   d.id==='east_employee_exit'&&d.minChapter===6),
  canonicalRooms:MALL.rooms.length,originalEvidence:MALL.evidence.length,
  constructionApproved:false,
  requiredBeforeConstruction:[
   'Respect the real ground-slab stair opening; never build a fake floor over it',
   'Design real source walls for any absent boundary intervals, without sealing a true doorway',
   'Supply physically attached, shaft-aware original service ceiling rather than borrowing the roof as a room lid',
   'Audit reachable Chapter 3 north-stair entry, freight transfer and original rear exterior',
   'Run real shared-source desktop WebGL inspection before merging any construction'
  ]
 });
}
