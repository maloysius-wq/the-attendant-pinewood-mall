/**
 * V122 real 1979 anchor ceilings and period interior wayfinding.
 * The geometry is tied to the actual G-level 5.3m source ceilings, never
 * arbitrary floor-covering lights or privately saved Builder placements.
 */
import {MALL} from './masterplan-v66.mjs';

export const ANCHOR_FLUORESCENT_ASSET_V122=Object.freeze({
 path:'assets/vendor/builder/models/liminal-spaces-kit/three-d-liminal-spaces-kit-liminal-spaces-kit-ceiling-fluorescent-0299417a.glb',
 sha256:'51cad3ec6b43627251cd5cdce6b1a367fe83e6906334edf096f8dc725dca772d',
 license:'CC0-1.0'
});

const panel=(id,room,x,z,power)=>Object.freeze({id,room,x,z,power});
/** Deliberately irregular lamp failures, not 15 identical showroom lights. */
export const ANCHOR_LIGHTS_V122=Object.freeze([
 panel('fallow_north_west','west_anchor',-43,-52.6,1),
 panel('fallow_north_center','west_anchor',-38,-52.6,0),
 panel('fallow_north_east','west_anchor',-33,-52.6,.28),
 panel('fallow_middle_west','west_anchor',-43,-60.5,0),
 panel('fallow_middle_center','west_anchor',-38,-60.5,.87),
 panel('fallow_middle_east','west_anchor',-33,-60.5,0),
 panel('fallow_south_west','west_anchor',-43,-68.4,.65),
 panel('fallow_south_center','west_anchor',-38,-68.4,0),
 panel('fallow_south_east','west_anchor',-33,-68.4,.35),
 panel('east_north_west','east_original_anchor',33,-47.5,0),
 panel('east_north_center','east_original_anchor',39,-47.5,.86),
 panel('east_north_east','east_original_anchor',43,-47.5,0),
 panel('east_south_west','east_original_anchor',33,-56.5,.38),
 panel('east_south_center','east_original_anchor',39,-56.5,0),
 panel('east_south_east','east_original_anchor',43,-56.5,.73)
]);

/** Wall-attached, head-height retro department signs behind real displays. */
export const ANCHOR_SIGNS_V122=Object.freeze([
 Object.freeze({id:'fallows_main',room:'west_anchor',name:"FALLOW'S",
  subtitle:'APPAREL  ·  ACCESSORIES  ·  HOME',wallX:-46,face:1,z:-60.5,y:3.36,width:7.2,height:.86}),
 Object.freeze({id:'east_main',room:'east_original_anchor',name:'EAST DEPARTMENT',
  subtitle:'HOUSEWARES  ·  CLOTHING  ·  GIFTS',wallX:46,face:-1,z:-52,y:3.52,width:6.2,height:1.00625})
]);

export function validateAnchorIdentityV122(
 {lights=ANCHOR_LIGHTS_V122,signs=ANCHOR_SIGNS_V122}={},
 {ceilings=[]}={}
){
 const errors=[],ids=new Set(),roomIndex=new Map(MALL.rooms.map(r=>[r.id,r]));
 if(lights.length!==15||signs.length!==2)errors.push('V122 original department grid or identity sign missing');
 for(const f of lights){
  if(ids.has(f.id))errors.push('duplicate original fluorescent '+f.id);
  ids.add(f.id);
  const r=roomIndex.get(f.room);
  if(!r||r.level!=='G'||!['west_anchor','east_original_anchor'].includes(r.id)){
   errors.push('fluorescent is not in an original 1979 department store '+f.id);continue;
  }
  if(!(f.x>r.x1+1.45&&f.x<r.x2-1.45&&f.z>r.z1+1.45&&f.z<r.z2-1.45))
   errors.push('2m original lamp clips the actual shop ceiling boundary '+f.id);
  if(![0,.28,.35,.38,.65,.73,.86,.87,1].includes(f.power))
   errors.push('undefined installed-lamp failure state '+f.id);
  const hits=ceilings.filter(c=>c.room===f.room&&f.x>c.x1+1.1&&
   f.x<c.x2-1.1&&f.z>c.z1+1.1&&f.z<c.z2-1.1);
  if(hits.length!==1||Math.abs(hits[0].y-hits[0].thickness/2-5.21)>.02)
   errors.push('original source fluorescent not attached to actual 5.21m soffit '+f.id);
 }
 for(const s of signs){
  if(ids.has(s.id))errors.push('duplicate original internal directory '+s.id);
  ids.add(s.id);
  const r=roomIndex.get(s.room);
  if(!r||r.level!=='G'||!['west_anchor','east_original_anchor'].includes(r.id)){
   errors.push('internal sign outside historic anchor '+s.id);continue;
  }
  const rear=s.face===1?r.x1:r.x2;
  if(Math.abs(s.wallX-rear)>.001||
   s.face!==(s.room==='west_anchor'?1:-1)||
   s.z-s.width/2<r.z1+1||s.z+s.width/2>r.z2-1||
   s.y-s.height/2<2.7||s.y+s.height/2>4.25||
   s.width<5||s.width>9||!s.name.trim())
   errors.push('1979 department sign is detached, oversized or inside a doorway '+s.id);
 }
 if(!lights.some(f=>f.power===0)||!lights.some(f=>f.power>0))
  errors.push('abandoned anchor cannot have all fluorescents identically lit');
 return errors;
}
