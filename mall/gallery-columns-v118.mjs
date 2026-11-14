/**
 * V118 structural gallery rhythm for the real 1979 shopping mall.
 *
 * The central public atrium's paired posts terminate at the ORIGINAL solid
 * roof outside its x=-8…8 skylight, not in the glazing. Gallery posts meet
 * the EXISTING 5.19m soffit underside. Shop-side posts align with authentic
 * tenant boundaries, deliberately not with the 4.2m door midpoints.
 * All positions are world metres, not autonomous visual prop placements.
 */
import {MALL} from './masterplan-v66.mjs';

const sideZ=Object.freeze([-53,-66,-79,-92,-105]);
const patterns=[
 {room:'central_gallery',prefix:'atrium_w',x:-9,rows:sideZ,height:12.8,period:'1979-original-atrium'},
 {room:'central_gallery',prefix:'atrium_e',x:9,rows:sideZ,height:12.8,period:'1979-original-atrium'},
 {room:'west_gallery',prefix:'west_inner',x:-13.4,rows:sideZ,height:5.19,period:'1979-gallery'},
 {room:'east_gallery',prefix:'east_inner',x:13.4,rows:sideZ,height:5.19,period:'1979-gallery'},
 {room:'west_gallery',prefix:'west_shop',x:-26.4,rows:[-48,-73,-90,-107],height:5.19,period:'1979-storefront'},
 {room:'east_gallery',prefix:'east_shop',x:26.4,rows:[-45,-61,-80,-97],height:5.19,period:'1979-storefront'}
];
export const GALLERY_COLUMNS_V118=Object.freeze(patterns.flatMap(pattern=>
 pattern.rows.map((z,i)=>{
  const grand=pattern.room==='central_gallery';
  return Object.freeze({
   id:'v118_'+pattern.prefix+'_'+String(i+1).padStart(2,'0'),
   room:pattern.room,period:pattern.period,x:pattern.x,z,
   baseY:0,topY:pattern.height,
   shaftWidth:grand?.87:.64,
   footWidth:grand?1.28:1.02,
   capitalWidth:grand?1.54:1.20,
   /** Collision matches the *largest floor-level* plinth, not the shaft. */
   collisionRadius:grand?.66:.53
  });
 })));

const EPS=1e-5,rooms=new Map(MALL.rooms.map(room=>[room.id,room]));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const segmentDist=(p,a,b)=>{
 const dx=b.x-a.x,dz=b.z-a.z,span=dx*dx+dz*dz;
 const t=span?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/span)):0;
 return Math.hypot(p.x-(a.x+t*dx),p.z-(a.z+t*dz));
};
export function validateGalleryColumnsV118(columns=GALLERY_COLUMNS_V118,portals=[]){
 const defects=[],ids=new Set();
 if(columns.length!==28)defects.push('expected exactly 28 intentional structural columns');
 for(const c of columns){
  if(ids.has(c.id))defects.push('duplicate structural post '+c.id);
  ids.add(c.id);
  const room=rooms.get(c.room);
  if(!room||room.level!=='G'||!['central_gallery','west_gallery','east_gallery'].includes(c.room)){
   defects.push('column not in an original public gallery '+c.id);continue;
  }
  if(!(c.x>room.x1+c.collisionRadius+.35&&c.x<room.x2-c.collisionRadius-.35&&
   c.z>room.z1+c.collisionRadius+.35&&c.z<room.z2-c.collisionRadius-.35))
   defects.push('column outside gallery / against canonical room wall '+c.id);
  if(c.topY<=4.8||c.baseY!==0||c.footWidth<c.shaftWidth||c.collisionRadius<c.footWidth/2)
   defects.push('unsupported column geometry '+c.id);
  if(c.room==='central_gallery'){
   if(c.topY!==12.8||Math.abs(c.x)<8.5)
    defects.push('atrium post would terminate in unsupported skylight '+c.id);
   if(dist(c,{x:0,z:-71})<=5.1+c.collisionRadius+1.1)
    defects.push('column crowds the actual dry-fountain rim '+c.id);
  }else if(Math.abs(c.topY-5.19)>EPS){
   defects.push('retail column does not reach real gallery soffit '+c.id);
  }
  // Actual 4.2m retail portals remain unobstructed. This also prevents a
  // future planner from aligning a column directly on a tenant entry.
  for(const p of portals.filter(p=>p.type==='doorway'&&p.level==='G'&&
   [p.from,p.to].includes(c.room))){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(segmentDist(c,a,b)<c.collisionRadius+1.0)
    defects.push('column impinges source door '+c.id+'/'+p.id);
  }
 }
 for(let i=0;i<columns.length;i++)for(let j=i+1;j<columns.length;j++){
  const a=columns[i],b=columns[j];
  if(dist(a,b)<a.collisionRadius+b.collisionRadius+.3)
   defects.push('overlapping structural bases '+a.id+'/'+b.id);
 }
 for(const [room,x]of [['west_gallery',-20],['east_gallery',20]]){
  for(const c of columns.filter(p=>p.room===room))
   if(Math.abs(c.x-x)<c.collisionRadius+1.2)
    defects.push('gallery spine clearance lost '+c.id);
 }
 return defects;
}
