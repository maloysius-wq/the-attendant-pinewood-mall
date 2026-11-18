/** V129 original 1979 Fallow's closed north transfer/firebreak.
 * This is one measured, inaccessible 85m² original footprint seam, not a
 * 42nd story room, user Builder placement or invented retail tenant.
 * Reuses the exact 3.45m existing closed-bay wall height and 1979 source
 * ceiling/floor. No wall may double V116 or V69 physical architecture. */
import {MALL} from './masterplan-v66.mjs';
import {SEALED_BAYS_V116,sealedBayWallsV116} from './sealed-bay-plan-v116.mjs';
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
export const NW_FIREBREAK_V129=Object.freeze({
 id:'v129_fallows_north_firebreak',name:"Fallow's North Stock Transfer (Sealed)",
 level:'G',period:'1979-original-closed-1997',kind:'original-service-firebreak',
 x1:-46,x2:-29,z1:-48,z2:-43,
 height:3.45,ceilingY:3.45,ceilingThickness:.18,front:null,
 area:85,access:'PERMANENTLY CLOSED',builtOnOriginalFloor:true
});
export const FIREBREAK_PLATE_V129=Object.freeze({
 id:'v129_fallows_north_stock_plate',wallX:-29,face:1,z:-45.5,
 y:2.87,width:2.85,height:.46,
 header:"FALLOW'S   ·   NORTH STOCK",subtitle:'TRANSFER CLOSED',
 originalArtwork:true
});
export const FIREBREAK_CEILING_V129=Object.freeze({
 id:'v129_fallows_north_plaster_soffit',room:NW_FIREBREAK_V129.id,
 x1:NW_FIREBREAK_V129.x1,x2:NW_FIREBREAK_V129.x2,
 z1:NW_FIREBREAK_V129.z1,z2:NW_FIREBREAK_V129.z2,
 y:NW_FIREBREAK_V129.ceilingY,thickness:NW_FIREBREAK_V129.ceilingThickness,
 material:'plaster-ceiling'
});
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const near=(a,b)=>Math.abs(a-b)<.001;
/** Original 85 m² pocket lies between a 5.4m licensed department-store
 * enclosure at z=-48 and original V116 3.45m closed front reserve at z=-43.
 * Those two WALLS ALREADY EXIST. Only the two unsupported side faces
 * x=-46 and x=-29 need genuine new source masonry solids. */
export function residualFirebreakWallsV129(existing=[],enclosure=NW_FIREBREAK_V129){
 return sealedBayWallsV116([enclosure],existing).map(w=>({
  ...w,id:'v129_firebreak_'+w.axis+'_'+w.at+'_'+w.start,
  role:'v129-firebreak-partition',material:'concrete'
 }));
}
const stairHole=Object.freeze({x1:30.5,x2:33.5,z1:-115.5,z2:-108});
const freightLift=Object.freeze({x1:18.5,x2:22.5,z1:-115.8,z2:-110.5});
export function auditOriginalClosuresV129(plan=NW_FIREBREAK_V129){
 const old=auditOriginalRemainderV128();
 const covered=old.cells.reduce((sum,c)=>sum+overlap(plan,c),0);
 const contains=old.cells.every(c=>overlap(c,plan)<=area(c)+.00001);
 return {
  originalTotal:old.area,originalCells:old.cellCount,originalOverlap:old.overlaps,
  newlyEnclosed:Math.round(covered*1000)/1000,
  remaining:Math.round((old.area-covered)*1000)/1000,
  stillProtected:{
   rearEast:51,entryContractor:41,otherPerimeterAndRelief:343
  },
  originalShaftsAvoided:overlap(plan,stairHole)===0&&overlap(plan,freightLift)===0,
  exactSourceCells:contains&&near(covered,area(plan)),
  originalSurveyUnmodified:old.status==='survey-only; no new geometry or fictional sealed bays allocated',
  noNewStoryRoom:!MALL.rooms.some(r=>r.id===plan.id),
  originalEvidenceUnmodified:MALL.evidence.length===9
 };
}
export function validateFirebreakV129({
 enclosure=NW_FIREBREAK_V129,plate=FIREBREAK_PLATE_V129,
 ceiling=FIREBREAK_CEILING_V129,walls=[],existingWalls=[],portals=[]
}={}){
 const errors=[],west=MALL.rooms.find(r=>r.id==='west_anchor');
 const reserve=SEALED_BAYS_V116.find(r=>r.id==='west_dept_reserve');
 const survey=auditOriginalClosuresV129(enclosure);
 if(!west||!reserve||MALL.rooms.length!==41||MALL.evidence.length!==9)
  errors.push('lost canonical 41 rooms/nine LS evidence or north neighbor');
 if([enclosure.x1,enclosure.x2,enclosure.z1,enclosure.z2].join(',')!=='-46,-29,-48,-43'||
  enclosure.level!=='G'||enclosure.height!==3.45||enclosure.front!==null||
  area(enclosure)!==85)errors.push('invented geometry outside original 85m² north seam');
 if(!west||west.z2!==enclosure.z1||west.x1!==enclosure.x1||west.x2!==enclosure.x2||
  !reserve||reserve.z1!==enclosure.z2||
  reserve.x1!==enclosure.x1||reserve.x2!==enclosure.x2)
  errors.push('north firebreak does not connect existing Fallow\'s and reserve masonry');
 if(!survey.exactSourceCells||!survey.originalSurveyUnmodified||
  !survey.originalShaftsAvoided||survey.remaining!==435||survey.originalOverlap!==0)
  errors.push('85m² new closure is not exact safe source original ground');
 if(!survey.noNewStoryRoom||!survey.originalEvidenceUnmodified)
  errors.push('fictitious story room or lost original evidence');
 if(MALL.links.some(l=>l.from===enclosure.id||l.to===enclosure.id))
  errors.push('closed firebreak introduced a story access portal');
 const sides=[{axis:'x',at:-46},{axis:'x',at:-29}];
 if(walls.length&&
  (walls.length!==2||sides.some(side=>!walls.some(w=>w.axis===side.axis&&
   near(w.at,side.at)&&near(w.start,-48)&&near(w.end,-43)&&
   near(w.bottom,0)&&near(w.top,3.45)&&w.role==='v129-firebreak-partition'))))
  errors.push('real north firebreak needs exactly TWO physically new source wall faces');
 if(walls.length){
  for(const w of walls){
   for(const o of [...existingWalls,...walls.filter(x=>x!==w)]){
    if(o.axis!==w.axis||!near(o.at,w.at))continue;
    const sameSpan=Math.max(0,Math.min(o.end,w.end)-Math.max(o.start,w.start));
    const sameHeight=Math.max(0,Math.min(o.top,w.top)-Math.max(o.bottom,w.bottom));
    if(sameSpan>.02&&sameHeight>.02)
     errors.push('duplicate existing 1979 or V116 masonry '+w.id+'/'+o.id);
   }
  }
 }
 if(!ceiling||ceiling.room!==enclosure.id||
  !near(ceiling.y-ceiling.thickness/2,3.36)||
  !near(ceiling.x1,-46)||!near(ceiling.x2,-29)||
  !near(ceiling.z1,-48)||!near(ceiling.z2,-43))
  errors.push('source 3.36m service soffit missing from genuine original 85m² seam');
 if(!plate||plate.wallX!==-29||plate.face!==1||
  plate.z!==-45.5||plate.width>4.6||plate.height>.6||
  plate.y+plate.height/2>=3.30||!plate.originalArtwork)
  errors.push('original 1997 service plate detached from new public-facing masonry');
 for(const p of portals.filter(p=>p.type==='doorway')){
  // A new wall may not close ANY canonical real original doorway.
  if(walls.some(w=>p.axis===w.axis&&near(p.at,w.at)&&p.end>w.start&&p.start<w.end))
   errors.push('V129 firebreak blocks source story portal '+p.id);
 }
 return errors;
}
