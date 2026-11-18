/** V127b operational 1992 east Annex, measured against the V66 property.
 * All fixtures are attached to real existing ceilings/walls or grounded
 * within the source staff corridor. Not a second scene or a Builder draft.
 */
import {MALL} from './masterplan-v66.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';

const room=MALL.rooms.find(r=>r.id==='east_wing_spine');
export const ANNEX_SPINE_V127B=Object.freeze({
 room:'east_wing_spine',period:'1992-annex-maintained-1997',
 floor:Object.freeze({x1:56,x2:65,z1:-105,z2:-34}),
 floorMaterial:'tile',
 originalUnderside:3.36,
 throughLane:Object.freeze({x1:59.25,x2:61.75,z1:-105,z2:-34})
});
export const ANNEX_LAMP_SOURCE_V127B=ANCHOR_FLUORESCENT_ASSET_V122;
export const ANNEX_CABINET_SOURCE_V127B=Object.freeze({
 path:'assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb',
 license:'CC0-1.0'
});
const lamp=(id,x,z,power)=>Object.freeze({
 id,room:'east_wing_spine',x,z,power,model:ANNEX_LAMP_SOURCE_V127B.path
});
// Alternating lamps leave an intentionally uneven back-of-house night shift,
// with physically existing 2m source-mesh panels and several failed lenses.
export const ANNEX_LAMPS_V127B=Object.freeze([
 lamp('staff_south_01',58.7,-99,.62),
 lamp('staff_south_02',62.3,-91,0),
 lamp('staff_staff_03',58.7,-83,.36),
 lamp('staff_staff_04',62.3,-75,.76),
 lamp('staff_staff_05',58.7,-67,0),
 lamp('staff_staff_06',62.3,-59,.32),
 lamp('staff_north_07',58.7,-51,.58),
 lamp('staff_north_08',62.3,-43,0)
]);
// These are true, locally vendored licensed filing cupboards, positioned
// against existing eastern masonry BETWEEN the actual staff door openings.
const cabinet=(id,z)=>Object.freeze({
 id,room:'east_wing_spine',model:ANNEX_CABINET_SOURCE_V127B.path,
 x:64.12,z,yaw:-Math.PI/2,targetHeight:2.1,collisionRadius:.72,role:'fixed-staff-filing'
});
export const ANNEX_CABINETS_V127B=Object.freeze([
 cabinet('v127b_training_return_files',-96.8),
 cabinet('v127b_breakroom_notices_files',-87.6),
 cabinet('v127b_annex_old_stores_files',-71.8)
]);
// Staff signs are fixed to the existing x=65 masonry or, where the original
// door is beneath them, to its real V114 overhead lintel (not in midair).
const sign=(id,room,z,label,y=3.01,width=2.25,height=.28)=>Object.freeze({
 id,room,wallX:65,face:-1,z,y,width,height,label
});
export const ANNEX_SIGNS_V127B=Object.freeze([
 sign('training_t04','training_t04',-102.5,'TRAINING T-04'),
 sign('break_room','break_room',-92,'STAFF BREAK ROOM'),
 sign('staff_lockers','staff_lockers',-81,'LOCKERS / UNIFORMS'),
 sign('annex_anchor','annex_anchor',-69.2,'EAST ANNEX STORES',2.74,2.7,.37),
 sign('east_exit_vestibule','east_exit_vestibule',-41,'EMPLOYEE EXIT')
]);
const EPS=1e-5;
const inside=(b,x,z,margin=0)=>x>=b.x1+margin-EPS&&x<=b.x2-margin+EPS&&
 z>=b.z1+margin-EPS&&z<=b.z2-margin+EPS;
const footprint=(x,z,portal)=>{
 const a=portal.axis==='x'?{x:portal.at,z:portal.start}:{x:portal.start,z:portal.at};
 const b=portal.axis==='x'?{x:portal.at,z:portal.end}:{x:portal.end,z:portal.at};
 const dx=b.x-a.x,dz=b.z-a.z,len=dx*dx+dz*dz;
 const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/len));
 return Math.hypot(x-(a.x+t*dx),z-(a.z+t*dz));
};
export function validateAnnexSpineV127B(plan=ANNEX_SPINE_V127B,{
 lamps=ANNEX_LAMPS_V127B,cabinets=ANNEX_CABINETS_V127B,signs=ANNEX_SIGNS_V127B,
 portals=[],ceilings=[]
}={}){
 const errors=[],ids=new Set(),named=new Map(MALL.rooms.map(r=>[r.id,r]));
 if(!room||room.level!=='G'||room.kind!=='staff'||
  room.x1!==56||room.x2!==65||room.z1!==-105||room.z2!==-34)
  errors.push('original Annex employee corridor source changed');
 const f=plan.floor;
 if(!f||[f.x1,f.x2,f.z1,f.z2].some((n,i)=>n!==[56,65,-105,-34][i])||
  plan.floorMaterial!=='tile')errors.push('invalid replacement Annex corridor slab');
 if(plan.throughLane.x2-plan.throughLane.x1<2.4||
  plan.throughLane.x1<=f.x1||plan.throughLane.x2>=f.x2)
  errors.push('protected original center lane not clear');
 const doorways=portals.filter(p=>p.type==='doorway'&&
  [p.from,p.to].includes('east_wing_spine'));
 const sourceDoorways=MALL.links.filter(l=>l.type==='passage'&&
  [l.from,l.to].includes('east_wing_spine'));
 if(portals.length&&doorways.length!==sourceDoorways.length)
  errors.push('Annex lost an original staff doorway');
 const unique=id=>{if(ids.has(id))errors.push('duplicate staff object '+id);ids.add(id);};
 if(lamps.length!==8||cabinets.length!==3||signs.length!==5)
  errors.push('original source Annex construction count changed');
 for(const p of lamps){
  unique(p.id);
  if(p.room!==plan.room||p.model!==ANNEX_LAMP_SOURCE_V127B.path||
   !inside(f,p.x,p.z,1.3)||p.x>plan.throughLane.x1&&p.x<plan.throughLane.x2)
   errors.push('misplaced licensed Annex ceiling mesh '+p.id);
  if(p.power<0||p.power>1)errors.push('invalid lamp power '+p.id);
  if(ceilings.length){
   const hits=ceilings.filter(c=>c.room===p.room&&inside(c,p.x,p.z,1.15));
   if(hits.length!==1||Math.abs(hits[0].y-hits[0].thickness/2-plan.originalUnderside)>.02)
    errors.push('Annex lamp not attached to existing 3.36m plaster soffit '+p.id);
  }
 }
 for(let i=0;i<lamps.length;i++)for(let j=i+1;j<lamps.length;j++)
  if(Math.hypot(lamps[i].x-lamps[j].x,lamps[i].z-lamps[j].z)<3.4)
   errors.push('overlapping source lamp panels '+lamps[i].id);
 if(!lamps.some(p=>p.power===0)||!lamps.some(p=>p.power>.5))
  errors.push('Annex is implausibly uniformly illuminated');
 for(const c of cabinets){
  unique(c.id);
  if(c.model!==ANNEX_CABINET_SOURCE_V127B.path||c.room!==plan.room||
   !inside(f,c.x,c.z,c.collisionRadius+.08)||c.x-c.collisionRadius<plan.throughLane.x2+1.1)
   errors.push('cabinet leaves masonry or invades primary circulation '+c.id);
  for(const p of doorways)if(footprint(c.x,c.z,p)<c.collisionRadius+1.4)
   errors.push('cabinet obstructs real original chapter portal '+c.id+'/'+p.id);
 }
 for(let i=0;i<cabinets.length;i++)for(let j=i+1;j<cabinets.length;j++)
  if(Math.hypot(cabinets[i].x-cabinets[j].x,cabinets[i].z-cabinets[j].z)
   <cabinets[i].collisionRadius+cabinets[j].collisionRadius+.65)
   errors.push('staff cabinets overlap '+cabinets[i].id);
 for(const s of signs){
  unique(s.id);
  const r=named.get(s.room);
  if(!r||r.level!=='G'||s.wallX!==65||r.x1!==65||s.face!==-1||
   s.y-s.height/2<2.50||s.y+s.height/2>3.3||
   s.z-s.width/2<r.z1+.05||s.z+s.width/2>r.z2-.05)
   errors.push('wayfinding not attached to existing east Annex wall '+s.id);
  for(const p of doorways.filter(p=>p.to===s.room||p.from===s.room)){
   if(p.axis==='x'&&p.at===s.wallX&&
    s.y-s.height/2<p.height-.01&&s.z+s.width/2>p.start+.01&&
    s.z-s.width/2<p.end-.01)
    errors.push('staff plate hanging inside actual open door '+s.id);
  }
 }
 if(ANNEX_LAMP_SOURCE_V127B.license!=='CC0-1.0'||
  !/^[0-9a-f]{64}$/.test(ANNEX_LAMP_SOURCE_V127B.sha256)||
  ANNEX_CABINET_SOURCE_V127B.license!=='CC0-1.0')
  errors.push('original source asset provenance not retained');
 return errors;
}
