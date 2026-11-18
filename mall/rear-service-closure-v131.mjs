/** V131: original 1979 east-rear inaccessible service envelope.
 * Two specifically SURVEYED missing source faces, and a real three-piece
 * service ceiling that DOES NOT cap the 1.5m² B1→Security fire-stair hole.
 * No new floors, rooms, playable entrances, stand-ins or unlocked routes.
 */
import {MALL} from './masterplan-v66.mjs';
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
import {auditOriginalClosuresV129} from './residual-firebreak-plan-v129.mjs';

const EPS=.001,near=(a,b)=>Math.abs(a-b)<EPS;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
export const REAR_SERVICE_ENVELOPE_V131=Object.freeze({
 id:'v131_original_east_rear_closed_service',name:'1979 East-Rear Sealed Service Envelope',
 x1:29,x2:47,z1:-118.5,z2:-115,level:'G',
 grossFootprint:63,actualFloor:61.5,shaftAperture:1.5,
 height:3.45,ceilingY:3.45,ceilingThickness:.18,access:'CLOSED'
});
export const REAR_NORTH_STAIR_OPENING_V131=Object.freeze({
 x1:30.5,x2:33.5,z1:-115.5,z2:-108
});
/** Original survey confirms rear z=-118.5 and east x=47 are complete,
 * north z=-115 has ONLY x46..47 absent, west x=29 ONLY z-118.5..-118.
 * Avoid a double exterior face or a new invented retail portal. */
export const REAR_SOURCE_PARTITIONS_V131=Object.freeze([
 Object.freeze({id:'v131_north_security_endcap',axis:'z',at:-115,start:46,end:47,
  bottom:0,top:3.45,thickness:.25,material:'concrete',role:'v131-rear-service-partition'}),
 Object.freeze({id:'v131_west_freight_endcap',axis:'x',at:29,start:-118.5,end:-118,
  bottom:0,top:3.45,thickness:.25,material:'concrete',role:'v131-rear-service-partition'})
]);
/** 54+0.75+6.75=61.5 m², with the 3x0.5m live stair-hole
 * excluded from the actual source plaster ceiling, not concealed by it. */
export const REAR_SERVICE_CEILINGS_V131=Object.freeze([
 Object.freeze({id:'v131_rear_plaster_main',room:REAR_SERVICE_ENVELOPE_V131.id,
  x1:29,x2:47,z1:-118.5,z2:-115.5,y:3.45,thickness:.18,material:'plaster-ceiling'}),
 Object.freeze({id:'v131_rear_plaster_west_stair_cheek',room:REAR_SERVICE_ENVELOPE_V131.id,
  x1:29,x2:30.5,z1:-115.5,z2:-115,y:3.45,thickness:.18,material:'plaster-ceiling'}),
 Object.freeze({id:'v131_rear_plaster_east_stair_cheek',room:REAR_SERVICE_ENVELOPE_V131.id,
  x1:33.5,x2:47,z1:-115.5,z2:-115,y:3.45,thickness:.18,material:'plaster-ceiling'})
]);
export function rearServiceWallsV131(existingWalls=[]){
 // The preceding original V130 audit establishes these exact gaps. Refuse
 // to construct overlapping real source geometry if older walls change.
 for(const w of REAR_SOURCE_PARTITIONS_V131)for(const o of existingWalls)
  if(o.axis===w.axis&&near(o.at,w.at)&&
   Math.min(o.end,w.end)-Math.max(o.start,w.start)>.02&&
   Math.min(o.top,w.top)-Math.max(o.bottom,w.bottom)>.02)
   throw Error('V131 would duplicate source masonry '+w.id+'/'+o.id);
 return REAR_SOURCE_PARTITIONS_V131.map(w=>({...w}));
}
export function auditRearServiceClosureV131(){
 const old=auditOriginalRemainderV128(),last=auditOriginalClosuresV129();
 const assigned=old.cells.reduce((total,c)=>total+overlap(c,REAR_SERVICE_ENVELOPE_V131),0);
 return Object.freeze({
  immutableV128Baseline:old.area,afterV129:last.remaining,
  originalFootprintResolved:assigned,
  actualFloorResolved:REAR_SERVICE_ENVELOPE_V131.actualFloor,
  stillOpenSourceStairShaft:overlap(REAR_SERVICE_ENVELOPE_V131,REAR_NORTH_STAIR_OPENING_V131),
  physicalResidualRemaining:last.remaining-assigned,
  originalOverlaps:old.overlaps,
  storyRoomCount:MALL.rooms.length,evidenceCount:MALL.evidence.length
 });
}
export function validateRearServiceV131({walls=[],existingWalls=[],ceilings=[],
 floorPlates=[],portals=[]}={}){
 const errors=[],zone=REAR_SERVICE_ENVELOPE_V131,stat=auditRearServiceClosureV131();
 if(stat.immutableV128Baseline!==520||stat.afterV129!==435||
  stat.originalFootprintResolved!==63||stat.actualFloorResolved!==61.5||
  stat.stillOpenSourceStairShaft!==1.5||stat.physicalResidualRemaining!==372||
  stat.storyRoomCount!==41||stat.evidenceCount!==9||stat.originalOverlaps!==0)
  errors.push('original V128-V131 floor/shaft accounting or story contract changed');
 if(MALL.rooms.some(r=>r.id===zone.id)||MALL.links.some(l=>
  l.from===zone.id||l.to===zone.id))errors.push('invented inaccessible story room/portal');
 if(walls.length!==2||REAR_SOURCE_PARTITIONS_V131.some(s=>!walls.some(w=>w.id===s.id&&
  w.axis===s.axis&&near(w.at,s.at)&&near(w.start,s.start)&&near(w.end,s.end)&&
  near(w.bottom,0)&&near(w.top,3.45))))
  errors.push('actual two short source-masonry gaps were not closed precisely');
 const all=[...walls,...existingWalls];
 for(const w of walls)for(const o of all.filter(o=>o!==w))
  if(o.axis===w.axis&&near(o.at,w.at)&&
    Math.min(o.end,w.end)-Math.max(o.start,w.start)>.02&&
    Math.min(o.top,w.top)-Math.max(o.bottom,w.bottom)>.02)
   errors.push('duplicate source masonry '+w.id+'/'+o.id);
 const cap=ceilings.filter(c=>c.room===zone.id);
 if(cap.length!==3||REAR_SERVICE_CEILINGS_V131.some(c=>
  !cap.some(o=>o.id===c.id&&near(o.x1,c.x1)&&near(o.x2,c.x2)&&
   near(o.z1,c.z1)&&near(o.z2,c.z2)&&near(o.y-o.thickness/2,3.36)))||
  Math.abs(cap.reduce((sum,c)=>sum+(c.x2-c.x1)*(c.z2-c.z1),0)-61.5)>.001)
  errors.push('original three-piece 61.5m² service underside incorrectly built');
 for(const c of cap){
  if(overlap(c,REAR_NORTH_STAIR_OPENING_V131)>.001)
   errors.push('false ceiling over original stair shaft '+c.id);
  for(const other of ceilings.filter(o=>o!==c))
   if(overlap(c,other)>.001)errors.push('duplicated original ceiling '+c.id+'/'+other.id);
 }
 if(floorPlates.length){
  const floor=floorPlates.reduce((sum,p)=>sum+overlap(p,zone),0);
  if(Math.abs(floor-61.5)>.001||floorPlates.some(p=>p.id.startsWith('v131_')))
   errors.push('original floor/stair opening overlaid or replaced');
 }
 for(const p of portals.filter(p=>p.type==='doorway'))for(const w of walls)
  if(p.axis===w.axis&&near(p.at,w.at)&&p.end>w.start&&p.start<w.end)
   errors.push('blocked original source portal '+p.id);
 return errors;
}
