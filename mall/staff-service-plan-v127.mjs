/** V127: subordinate original back-of-house rooms; never change story rooms.
 * Each partition is joined to three existing source room walls. */
import {MALL} from './masterplan-v66.mjs';

export const STAFF_SERVICE_CELLS_V127=Object.freeze([
 {id:'north_spares',room:'north_service',label:'MAINTENANCE SPARES',kind:'locked',x1:7.5,x2:11,z1:-118,z2:-112},
 {id:'security_tapes',room:'security',label:'CCTV TAPE ARCHIVE',kind:'locked',x1:44,x2:46,z1:-115,z2:-101},
 {id:'training_equipment',room:'training_t04',label:'TRAINING AV EQUIPMENT',kind:'locked',x1:79.5,x2:85,z1:-108,z2:-97},
 {id:'break_kitchen',room:'break_room',label:'STAFF KITCHEN',kind:'open',x1:80.5,x2:85,z1:-97,z2:-87},
 {id:'locker_supply',room:'staff_lockers',label:'UNIFORMS AND SUPPLIES',kind:'locked',x1:82,x2:85,z1:-87,z2:-75}
].map(c=>Object.freeze({...c,frontX:c.x1,doorWidth:c.kind==='open'?2.4:1.6})));

const cabinet='assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb';
export const STAFF_SERVICE_FIXTURES_V127=Object.freeze([
 {id:'v127_north_spares_cabinet',room:'north_service',model:cabinet,x:9.4,z:-115,targetHeight:2.1,collisionRadius:.72},
 {id:'v127_security_tape_cabinet',room:'security',model:cabinet,x:45,z:-111.7,targetHeight:2.1,collisionRadius:.72},
 {id:'v127_training_equipment_cabinet',room:'training_t04',model:cabinet,x:82.6,z:-104.5,targetHeight:2.1,collisionRadius:.72},
 {id:'v127_break_kitchen_cabinet',room:'break_room',model:cabinet,x:83.1,z:-93.5,targetHeight:2.1,collisionRadius:.72},
 {id:'v127_locker_supply_cabinet',room:'staff_lockers',model:cabinet,x:83.5,z:-81,targetHeight:2.1,collisionRadius:.72}
].map(f=>Object.freeze(f)));
export const STAFF_SERVICE_AREA_V127=STAFF_SERVICE_CELLS_V127.reduce(
 (sum,c)=>sum+(c.x2-c.x1)*(c.z2-c.z1),0);

const wall=(id,x,start,end,bottom,top,role,thickness=.19)=>({
 id:'v127_'+id,axis:'x',at:x,start,end,bottom,top,role,thickness,
 material:role==='staff-shutter'?'steel':'concrete'
});
export function staffServiceWallsV127(cells=STAFF_SERVICE_CELLS_V127){
 const walls=[];
 for(const c of cells){
  const mid=(c.z1+c.z2)/2,lo=mid-c.doorWidth/2,hi=mid+c.doorWidth/2;
  walls.push(
   wall(c.id+'_south',c.x1,c.z1,lo,0,3.36,'staff-partition'),
   wall(c.id+'_north',c.x1,hi,c.z2,0,3.36,'staff-partition'),
   wall(c.id+'_header',c.x1,lo,hi,2.64,3.36,'staff-header')
  );
  if(c.kind==='locked')walls.push(
   wall(c.id+'_shutter',c.x1,lo,hi,0,2.64,'staff-shutter',.12));
 }
 return walls;
}
export function validateStaffServiceV127(cells=STAFF_SERVICE_CELLS_V127,fixtures=STAFF_SERVICE_FIXTURES_V127){
 const errors=[],ids=new Set(),rooms=new Map(MALL.rooms.map(r=>[r.id,r]));
 const protectedPoints=[
  ['north_service',3,-115,'breaker C'],
  ['security',36,-111,'CCTV'],['security',41,-110,'route console'],
  ['security',43,-105,'Luis route'],['security',43,-107,'LS-05'],
  ['training_t04',72,-102,'Jo notes'],['staff_lockers',74,-80,'locker'],
  ['staff_lockers',72,-81,'LS-06']
 ];
 for(const c of cells){
  if(ids.has(c.id))errors.push('duplicate service cell '+c.id);ids.add(c.id);
  const r=rooms.get(c.room);
  if(!r||r.level!=='G'||r.kind!=='staff')errors.push('non-staff area '+c.id);
  else if(c.x1<r.x1||c.x2!==r.x2||c.z1!==r.z1||c.z2!==r.z2)
   errors.push('not joined to three original walls '+c.id);
  if(c.x2-c.x1<1.9||c.z2-c.z1<5.8||c.doorWidth<1.4||
    c.doorWidth>c.z2-c.z1-2)errors.push('invalid cell dimension '+c.id);
  for(const e of MALL.evidence){
   if(e.room===c.room&&e.x>=c.x1&&e.x<=c.x2&&e.z>=c.z1&&e.z<=c.z2)
    errors.push('sealed evidence '+c.id+'/'+e.id);
  }
  for(const [room,x,z,id] of protectedPoints){
   if(room===c.room&&x>=c.x1&&x<=c.x2&&z>=c.z1&&z<=c.z2)
    errors.push('blocked objective '+id);
  }
 }
 for(const f of fixtures){
  const c=cells.find(c=>c.room===f.room);
  if(!c||f.x<=c.x1+.35||f.x>=c.x2-.35||
    f.z<=c.z1+.65||f.z>=c.z2-.65)
   errors.push('fixture outside attached room '+f.id);
  if(!/^assets\/vendor\/runtime\/[a-f0-9]{16}\/.+\.glb$/.test(f.model))
   errors.push('nonlocal GLB '+f.id);
 }
 if(cells.length!==5||fixtures.length!==5)errors.push('wrong V127 suite count');
 return errors;
}
