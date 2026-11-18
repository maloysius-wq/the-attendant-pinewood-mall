/** V132 independent read-only original main-entry/contractor seam survey.
 * No wall, floor, collision, cinematic, publication or Builder changes.
 * A zero-thickness source boundary is not permission to build a new wall:
 * the authentic V113 hinged entry has measurable adjacent clearances.
 */
import {MALL} from './masterplan-v66.mjs';
import {constructPhysicalShell} from './physical-shell-v67.mjs';
import {VESTIBULE_HANDOFF_V112,vestibuleInnerPortalV112} from './vestibule-handoff-v112.mjs';
import {CHECKPOINT_V117} from './vestibule-checkpoint-v117.mjs';
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from './residual-firebreak-plan-v129.mjs';
import {auditRearServiceClosureV131} from './rear-service-closure-v131.mjs';

const EPS=1e-6,round=x=>Math.round(x*1000)/1000;
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
export const ORIGINAL_FRONT_SEAM_V132=Object.freeze({
 id:'v132_original_main_entry_contractor_interstice',
 x1:7,x2:9,z1:-43,z2:-22.5,area:41
});
/** Coverage by genuine existing G-level masonry at walk height.
 * Reports EXACT absent source intervals, not assumed new partitions.
 */
function faceCoverage(walls,axis,at,start,end){
 const spans=walls.filter(w=>w.axis===axis&&Math.abs(w.at-at)<EPS&&
  w.bottom<=EPS&&w.top>=3.45-EPS)
  .map(w=>[Math.max(start,w.start),Math.min(end,w.end)])
  .filter(([a,b])=>b-a>EPS).sort((a,b)=>a[0]-b[0]);
 const joined=[];
 for(const [a,b] of spans){
  const last=joined.at(-1);
  if(last&&a<=last[1]+EPS)last[1]=Math.max(last[1],b);
  else joined.push([a,b]);
 }
 const absent=[];let cursor=start;
 for(const [a,b] of joined){
  if(a-cursor>EPS)absent.push([cursor,a]);
  cursor=Math.max(cursor,b);
 }
 if(end-cursor>EPS)absent.push([cursor,end]);
 return Object.freeze({
  axis,at,span:[start,end],
  coveredMetres:round(joined.reduce((n,[a,b])=>n+b-a,0)),
  absentMetres:round(absent.reduce((n,[a,b])=>n+b-a,0)),
  absentIntervals:absent
 });
}
export function surveyOriginalFrontSeamV132(){
 const seam=ORIGINAL_FRONT_SEAM_V132;
 const old=auditOriginalRemainderV128();
 const nw=auditOriginalClosuresV129();
 const rear=auditRearServiceClosureV131();
 const shell=constructPhysicalShell({level:'G',chapter:1});
 const originalCells=old.cells.reduce((n,c)=>n+overlap(c,seam),0);
 const actualFloor=shell.floorPlates.reduce((n,p)=>n+overlap(p,seam),0);
 const interiorCeiling=shell.ceilings.reduce((n,c)=>n+overlap(c,seam),0);
 const weatherRoof=shell.roofs.reduce((n,r)=>n+overlap(r,seam),0);
 const existingSourceFaces=[
  faceCoverage(shell.walls,'x',seam.x1,seam.z1,seam.z2), // original boarded lobby
  faceCoverage(shell.walls,'x',seam.x2,seam.z1,seam.z2), // actual contractor vestibule
  faceCoverage(shell.walls,'z',seam.z2,seam.x1,seam.x2), // original front exterior
  faceCoverage(shell.walls,'z',seam.z1,seam.x1,seam.x2)  // true central atrium junction
 ];
 const hinged=vestibuleInnerPortalV112(shell);
 const service=shell.doors.find(d=>d.id==='service_entry');
 const boarded=shell.doors.find(d=>d.id==='main_entry');
 const east=shell.doors.find(d=>d.id==='east_employee_exit');
 const facePortalOverlaps=shell.portals.filter(p=>p.type==='doorway'&&
  existingSourceFaces.some(f=>p.axis===f.axis&&Math.abs(p.at-f.at)<EPS&&
  p.start<f.span[1]-EPS&&p.end>f.span[0]+EPS)).map(p=>p.id);
 const actualDoorProximity=Object.freeze({
  hingedSourceId:hinged.id,
  originalHingePlaneZ:hinged.z,
  originalHingedDoorWidth:hinged.width,
  innerPortalStartX:hinged.start,innerPortalEndX:hinged.end,
  clearNominalXBetweenSeamAndHinge:round(hinged.start-seam.x2),
  contractorExteriorDoorX:service?.x,contractorExteriorDoorZ:service?.z,
  separationFromExteriorDoorX:round(service.x-seam.x2),
  filmEndpoint:{...VESTIBULE_HANDOFF_V112},
  separationFromOriginalFilmEyeX:round(VESTIBULE_HANDOFF_V112.x-seam.x2),
  checkpointApproachWestX:CHECKPOINT_V117.approach.west,
  checkpointApproachEastX:CHECKPOINT_V117.approach.east,
  boardedMainDoorX:boarded?.x,
  originalChapter6ExitLocked:shell.doors.some(d=>d.id==='east_employee_exit'&&d.locked),
  finalExitMinChapter:east?.minChapter
 });
 return Object.freeze({
  source:'1979 canonical original ground shell; read-only V132',
  originalFootprint:{...seam},
  preliminarySourceAreaSqm:seam.area,
  verifiedV128ResidualInSeamSqm:round(originalCells),
  immutableV128ResidualSqm:old.area,
  afterV129ResidualSqm:nw.remaining,
  afterV131ResidualSqm:rear.physicalResidualRemaining,
  projectedOutsideFrontIfFutureFullClosureSqm:round(rear.physicalResidualRemaining-originalCells),
  actualExistingFloorSqm:round(actualFloor),
  existingInteriorCeilingSqm:round(interiorCeiling),
  originalWeatherRoofAboveSqm:round(weatherRoof),
  sourceFaces:existingSourceFaces,
  touchingRealDoorways:facePortalOverlaps,
  criticalDoorProximity:actualDoorProximity,
  originalRoomCount:MALL.rooms.length,
  originalEvidenceCount:MALL.evidence.length,
  noNewNarrativeRoom:!MALL.rooms.some(r=>r.id===seam.id),
  constructionApproved:false,
  constructionHoldReasons:[
   'Confirm the actual west and east lobby masonry and original north/front facade returns at full source height',
   'Audit whether a 2m new source rear partition and any interior soffit would intrude on the original licensed V113 hinged-door clearance',
   'Check original Chapter 1 cinematic endpoint, contractor walkway and genuine boarded public frontage on real desktop source imagery',
   'Preserve the authentic 12.8m exterior roof and high atrium instead of creating a floating decorative wall or second floor',
   'Apply the original-door and full six-chapter desktop tests before any real construction'
  ]
 });
}
