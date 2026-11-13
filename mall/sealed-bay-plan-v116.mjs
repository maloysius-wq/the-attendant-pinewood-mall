/** V116: close real unallocated portions of the original 1979/1992 building.
 * These are inaccessible physical spaces adjoining, not replacing, 41 canonical
 * narrative rooms. No new unlocked story routes or fake standable floors.
 */
import {MALL} from './masterplan-v66.mjs';
import {auditArchitecturalCoverageV114} from './architecture-audit-v114.mjs';

const EPS=1e-6;
const near=(a,b)=>Math.abs(a-b)<EPS;
const area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const intersection=(a,b)=>
 Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const specs=[
 // Unused facade recesses around the boarded original public entrance.
 {id:'west_dept_reserve',label:'Fallow\'s Closed North Wing',kind:'retail',x1:-46,x2:-29,z1:-43,z2:-22.5},
 {id:'needle_thread',label:'Needle & Thread',kind:'retail',x1:-29,x2:-17,z1:-43,z2:-22.5,
  front:{axis:'z',at:-43,side:-1,adjacent:'west_gallery',sign:'NEEDLE & THREAD',tag:'SHUTTERED SINCE 1997'}},
 {id:'photo_finish',label:'Photo Finish',kind:'retail',x1:16,x2:29,z1:-43,z2:-22.5,
  front:{axis:'z',at:-43,side:-1,adjacent:'east_gallery',sign:'PHOTO FINISH',tag:'FILM · PRINTS · PORTRAITS'}},
 {id:'east_dept_backstock',label:'East Department Back Stock',kind:'retail',x1:29,x2:46,z1:-43,z2:-22.5},
 // Rear loading and support, behind the original retail bays.
 {id:'west_rear_receiving',label:'West Loading Dock',kind:'service',x1:-46,x2:-29,z1:-118,z2:-107},
 {id:'west_janitorial',label:'Old Janitorial Supplies',kind:'service',x1:-29,x2:-17,z1:-118,z2:-111,
  front:{axis:'z',at:-111,side:1,adjacent:'west_gallery',sign:'STAFF SUPPLY',tag:'ACCESS RESTRICTED'}},
 // The complete, previously featureless western flank of the 1992 annex
 // becomes an actual sequence of bounded former tenants beside the staff spine.
 {id:'annex_records',label:'Records Overflow',kind:'service',x1:47,x2:56,z1:-97,z2:-87,
  front:{axis:'x',at:56,side:1,adjacent:'east_wing_spine',sign:'RECORDS',tag:'AUTHORIZED PERSONNEL ONLY'}},
 {id:'parkway_tailors',label:'Parkway Tailors',kind:'retail',x1:47,x2:56,z1:-87,z2:-75,
  front:{axis:'x',at:56,side:1,adjacent:'east_wing_spine',sign:'PARKWAY TAILORS',tag:'ALTERATIONS & REPAIRS'}},
 {id:'terra_ceramics',label:'Terra Ceramics',kind:'retail',x1:47,x2:56,z1:-75,z2:-61,
  front:{axis:'x',at:56,side:1,adjacent:'east_wing_spine',sign:'TERRA CERAMICS',tag:'KILN ROOM CLOSED'}},
 {id:'lantern_supply',label:'Lantern Supply',kind:'retail',x1:47,x2:56,z1:-61,z2:-48,
  front:{axis:'x',at:56,side:1,adjacent:'east_wing_spine',sign:'LANTERN SUPPLY',tag:'LIGHTING & HARDWARE'}},
 {id:'annex_service_file',label:'Annex Personnel Archive',kind:'service',x1:47,x2:56,z1:-48,z2:-34,
  front:{axis:'x',at:56,side:1,adjacent:'east_wing_spine',sign:'PERSONNEL FILES',tag:'LOCKED · STAFF ONLY'}},
 // A bounded service plant behind Receiving R-12 and Training T-04.
 {id:'annex_rear_plant',label:'Annex Boiler & Vent Plant',kind:'service',x1:56,x2:65,z1:-115,z2:-105},
 {id:'annex_bulk_store',label:'East Wing Bulk Storage',kind:'service',x1:65,x2:85,z1:-115,z2:-108}
];
export const SEALED_BAYS_V116=Object.freeze(specs.map(s=>Object.freeze({
 ...s,level:'G',ceilingY:3.48,
 // Adjacent 1992 service/retail bays share one continuous 3.45m partition;
 // mixed-height full walls would duplicate faces at every boundary.
 height:3.45,
 front:s.front?Object.freeze({...s.front}):null
})));

function existingCoverageFor(w,axis,at,start,end,bottom,top){
 if(w.axis!==axis||!near(w.at,at)||w.bottom>bottom+EPS||w.top<top-EPS)return null;
 const lo=Math.max(start,w.start),hi=Math.min(end,w.end);
 return hi-lo>EPS?[lo,hi]:null;
}
function uncovered(start,end,cover){
 let parts=[[start,end]];
 for(const [lo,hi]of cover){
  parts=parts.flatMap(([a,b])=>(hi<=a+EPS||lo>=b-EPS)?[[a,b]]:
   [[a,Math.min(b,lo)],[Math.max(a,hi),b]].filter(([x,y])=>y-x>.025));
 }
 return parts;
}
/** Create real closure walls without doubling original exterior / room walls
 * or stacking adjacent sealed room walls on the same 3D plane. */
export function sealedBayWallsV116(bays=SEALED_BAYS_V116,canonicalWalls=[]){
 const built=[];
 const add=(bay,axis,at,start,end,bottom,top,role)=>{
  const covers=[...canonicalWalls,...built].map(w=>existingCoverageFor(w,axis,at,start,end,bottom,top)).filter(Boolean);
  for(const [a,b]of uncovered(start,end,covers))
   built.push({id:'v116_'+bay.id+'_'+role+'_'+axis+'_'+at+'_'+a.toFixed(2),
    axis,at,start:a,end:b,bottom,top,thickness:role==='closed-bay-shutter'?.18:.25,
    role,material:role==='closed-bay-shutter'?'steel':'concrete'});
 };
 for(const bay of bays){
  const f=bay.front;
  for(const side of[
   {axis:'x',at:bay.x1,start:bay.z1,end:bay.z2},
   {axis:'x',at:bay.x2,start:bay.z1,end:bay.z2},
   {axis:'z',at:bay.z1,start:bay.x1,end:bay.x2},
   {axis:'z',at:bay.z2,start:bay.x1,end:bay.x2}
  ]){
   if(f&&side.axis===f.axis&&near(side.at,f.at)){
    const width=side.end-side.start;
    const shutterWidth=Math.min(3.8,width-1.6);
    const mid=(side.start+side.end)/2,lo=mid-shutterWidth/2,hi=mid+shutterWidth/2;
    add(bay,side.axis,side.at,side.start,lo,0,bay.height,'closed-bay-partition');
    add(bay,side.axis,side.at,hi,side.end,0,bay.height,'closed-bay-partition');
    add(bay,side.axis,side.at,lo,hi,0,2.94,'closed-bay-shutter');
    add(bay,side.axis,side.at,lo,hi,2.94,bay.height,'closed-bay-header');
   }else add(bay,side.axis,side.at,side.start,side.end,0,bay.height,'closed-bay-partition');
  }
 }
 return built;
}
export function validateSealedBaysV116(bays=SEALED_BAYS_V116,plan=MALL){
 const errors=[];
 const footprints=[plan.footprints.original,plan.footprints.annex];
 const ground=plan.rooms.filter(r=>r.level==='G');
 const ids=new Set();
 for(const bay of bays){
  if(ids.has(bay.id))errors.push('duplicate sealed room '+bay.id);
  ids.add(bay.id);
  if(!footprints.some(f=>bay.x1>=f.x1&&bay.x2<=f.x2&&bay.z1>=f.z1&&bay.z2<=f.z2))
   errors.push('outside building '+bay.id);
  if(area(bay)<40)errors.push('implausible microscopic bay '+bay.id);
  for(const r of ground)if(intersection(bay,r)>EPS)errors.push('story room intersection '+bay.id+'/'+r.id);
  if(bay.front){
   const f=bay.front,neighbor=ground.find(r=>r.id===f.adjacent);
   if(!neighbor||neighbor.kind!=='public'&&neighbor.id!=='east_wing_spine')
    errors.push('unknown circulation frontage '+bay.id);
   const at=f.axis==='x'?(f.side>0?bay.x2:bay.x1):(f.side>0?bay.z2:bay.z1);
   if(!near(f.at,at))errors.push('front not attached to physical bay '+bay.id);
   if(neighbor){
    const touches=f.axis==='x'?(f.side>0?near(neighbor.x1,f.at):near(neighbor.x2,f.at)):
     (f.side>0?near(neighbor.z1,f.at):near(neighbor.z2,f.at));
    const span=f.axis==='x'?Math.max(0,Math.min(bay.z2,neighbor.z2)-Math.max(bay.z1,neighbor.z1)):
     Math.max(0,Math.min(bay.x2,neighbor.x2)-Math.max(bay.x1,neighbor.x1));
    if(!touches||span<4)errors.push('front not facing circulation '+bay.id);
   }
  }
 }
 for(let i=0;i<bays.length;i++)for(let j=i+1;j<bays.length;j++)
  if(intersection(bays[i],bays[j])>EPS)errors.push('overlapping sealed bays '+bays[i].id+'/'+bays[j].id);
 return errors;
}
export function auditSealedBayCoverageV116(bays=SEALED_BAYS_V116){
 const ground=auditArchitecturalCoverageV114().find(x=>x.level==='G');
 const assigned=bays.reduce((sum,b)=>sum+area(b),0);
 return {canonicalRooms:22,ancillaryBays:bays.length,sealedSquareMetres:assigned,
  formerlyUnallocatedSquareMetres:ground.unassignedArea,
  unassignedRemainderSquareMetres:ground.unassignedArea-assigned,
  assignedPercent:100*assigned/ground.unassignedArea,
  storefronts:bays.filter(b=>b.front).length};
}
