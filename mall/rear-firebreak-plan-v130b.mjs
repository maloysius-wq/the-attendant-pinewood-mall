/** V130b: real original 1979 east-rear service closure.
 * Two measured missing faces only. Preserve the existing exterior, Security,
 * freight masonry, true y=0 floor and B1 -> Security stair aperture.
 * This is an inaccessible existing rear building seam, NOT a story room.
 */
import {MALL} from './masterplan-v66.mjs';

const EPS=1e-6;
export const REAR_ENVELOPE_V130B=Object.freeze({
 id:'v130b_original_east_rear_fire_service_closure',
 x1:29,x2:47,z1:-118.5,z2:-115,
 area:63,originalFloor:61.5,protectedStairAperture:1.5,
 ceilingY:3.45,ceilingThickness:.18
});
export const REAR_STAIR_HOLE_V130B=Object.freeze({
 x1:30.5,x2:33.5,z1:-115.5,z2:-108
});
export const REAR_SOURCE_WALLS_V130B=Object.freeze([
 Object.freeze({id:'v130b_rear_freight_wall_return',axis:'x',at:29,
  start:-118.5,end:-118,bottom:0,top:3.55,thickness:.24,
  material:'concrete',role:'v130b-original-rear-return'}),
 Object.freeze({id:'v130b_rear_security_wall_return',axis:'z',at:-115,
  start:46,end:47,bottom:0,top:3.55,thickness:.24,
  material:'concrete',role:'v130b-original-rear-return'})
]);
// The real north fire stair pierces the south 0.5m of this envelope
// at x30.5..33.5. Never roof its 1.5m² exposed opening with plaster.
export const REAR_SERVICE_CEILINGS_V130B=Object.freeze([
 Object.freeze({id:'v130b_rear_plaster_west',room:REAR_ENVELOPE_V130B.id,
  x1:29,x2:30.5,z1:-118.5,z2:-115,y:3.45,thickness:.18,material:'plaster-ceiling'}),
 Object.freeze({id:'v130b_rear_plaster_north',room:REAR_ENVELOPE_V130B.id,
  x1:30.5,x2:33.5,z1:-118.5,z2:-115.5,y:3.45,thickness:.18,material:'plaster-ceiling'}),
 Object.freeze({id:'v130b_rear_plaster_east',room:REAR_ENVELOPE_V130B.id,
  x1:33.5,x2:47,z1:-118.5,z2:-115,y:3.45,thickness:.18,material:'plaster-ceiling'})
]);
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const near=(a,b)=>Math.abs(a-b)<EPS;
const samePlaneVolume=(a,b)=>a.axis===b.axis&&near(a.at,b.at)&&
 Math.min(a.end,b.end)-Math.max(a.start,b.start)>.015&&
 Math.min(a.top,b.top)-Math.max(a.bottom,b.bottom)>.015;
export function rearSourceWallsV130B(){return REAR_SOURCE_WALLS_V130B.map(w=>({...w}));}
export function rearSourceCeilingsV130B(){return REAR_SERVICE_CEILINGS_V130B.map(c=>({...c}));}
export function auditRearClosureV130B(){
 const total=REAR_ENVELOPE_V130B.area;
 const ceiling=REAR_SERVICE_CEILINGS_V130B.reduce((s,c)=>s+area(c),0);
 return Object.freeze({
  grossOriginalEnvelopeSqm:total,
  actualEnclosedFloorSqm:ceiling,
  actualOpenStairApertureSqm:overlap(REAR_ENVELOPE_V130B,REAR_STAIR_HOLE_V130B),
  baselineV129ResidualSqm:435,
  residualOutsideRearSqm:435-total,
  physicalUnresolvedIncludingProtectedShaftSqm:435-ceiling,
  noNewGroundSlab:true,noNewStoryRoom:true
 });
}
/** Called on the SAME canonical physical shell as gameplay and Builder.
 * Do not permit a modeled new face to duplicate an existing 1979 wall or
 * bridge a narrative doorway or real staircase.
 */
export function validateRearSourceV130B(shell){
 const errors=[],r=REAR_ENVELOPE_V130B;
 if(!shell||shell.level!=='G')return ['rear enclosure must be evaluated on original G shell'];
 if(MALL.rooms.length!==41||MALL.evidence.length!==9||
  MALL.rooms.some(room=>room.id===r.id))errors.push('canonical rooms/evidence changed');
 const newWalls=shell.walls.filter(w=>w.role==='v130b-original-rear-return');
 if(newWalls.length!==2||newWalls.some(w=>!REAR_SOURCE_WALLS_V130B.some(o=>
  o.id===w.id&&o.axis===w.axis&&near(o.at,w.at)&&near(o.start,w.start)&&
  near(o.end,w.end)&&near(o.bottom,w.bottom)&&near(o.top,w.top))))
  errors.push('requires exactly two source-specific original wall returns');
 for(const w of newWalls){
  for(const existing of shell.walls.filter(x=>x.id!==w.id))
   if(samePlaneVolume(w,existing))errors.push('duplicate source masonry '+w.id+'/'+existing.id);
  for(const p of shell.portals.filter(x=>x.type==='doorway'&&x.axis===w.axis&&near(x.at,w.at)))
   if(p.start<w.end-EPS&&p.end>w.start+EPS)errors.push('blocked real doorway '+p.id);
 }
 const has=(axis,at,start,end,top)=>shell.walls.some(w=>w.axis===axis&&near(w.at,at)&&
  w.start<=start+EPS&&w.end>=end-EPS&&w.top>=top-EPS&&w.bottom<=0);
 if(!has('z',-118.5,29,47,3.55)||!has('x',47,-118.5,-115,3.55)||
  !has('x',29,-118,-115,3.55)||!has('z',-115,29,46,3.55))
  errors.push('missing actual exterior, freight or Security host masonry');
 const newCeilings=shell.ceilings.filter(c=>c.id.startsWith('v130b_'));
 if(newCeilings.length!==3||newCeilings.some(c=>!REAR_SERVICE_CEILINGS_V130B.some(o=>
  o.id===c.id&&near(o.x1,c.x1)&&near(o.x2,c.x2)&&near(o.z1,c.z1)&&
  near(o.z2,c.z2)&&near(o.y,c.y)&&near(o.thickness,c.thickness))))
  errors.push('original ceiling must be the three exact shaft-clipped pieces');
 const ceilingArea=newCeilings.reduce((s,c)=>s+area(c),0);
 if(!near(ceilingArea,61.5)||newCeilings.some(c=>overlap(c,REAR_STAIR_HOLE_V130B)>EPS))
  errors.push('original north stair capped or service ceiling area incorrect');
 for(const c of newCeilings)for(const other of shell.ceilings.filter(x=>x.id!==c.id))
  if(overlap(c,other)>EPS)errors.push('duplicate original service ceiling '+c.id+'/'+other.id);
 const floorArea=shell.floorPlates.reduce((s,p)=>s+overlap(p,r),0);
 if(!near(floorArea,61.5)||shell.floorPlates.some(p=>p.id.startsWith('v130b_')))
  errors.push('real 1979 floor or 1.5m2 shaft hole was altered');
 if(shell.doors.find(d=>d.id==='east_employee_exit')?.minChapter!==6)
  errors.push('real chapter 6 exit altered');
 return errors;
}
