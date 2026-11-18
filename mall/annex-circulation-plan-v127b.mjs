/** V127b: source-attached east Annex circulation. All measurements are real
 * world metres and every mounted item belongs to the canonical mall scene. */
import {MALL} from './masterplan-v66.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';

export const ANNEX_SPINE_V127B=Object.freeze({
 room:'east_wing_spine',x1:56,x2:65,z1:-105,z2:-34,
 floor:'tile',ceilingUnderside:3.36,clearCentralX1:59,clearCentralX2:63
});
export const ANNEX_LAMP_SOURCE_V127B=ANCHOR_FLUORESCENT_ASSET_V122;
export const ANNEX_LIGHTS_V127B=Object.freeze(
 [-100,-93,-86,-79,-72,-65,-58,-51,-44,-37].map((z,i)=>Object.freeze({
 id:'annex_spine_light_'+(i+1),room:'east_wing_spine',x:60.5,z,
 power:[.55,.85,0,.43,.7,0,.6,.3,.72,.35][i]
 })));
/** All five plates mount on an intact east-side *source masonry segment*,
 * NEVER in the original door cuts. */
export const ANNEX_SIGNS_V127B=Object.freeze([
 {id:'training',room:'training_t04',text:'TRAINING T-04',detail:'STAFF DEVELOPMENT',z:-106.2},
 {id:'break',room:'break_room',text:'BREAK ROOM',detail:'EMPLOYEES ONLY',z:-95.3},
 {id:'lockers',room:'staff_lockers',text:'LOCKERS',detail:'PERSONAL EFFECTS',z:-85.2},
 {id:'anchor',room:'annex_anchor',text:'EAST WING',detail:'FORMER RETAIL',z:-70},
 {id:'exit',room:'east_exit_vestibule',text:'EMPLOYEE EXIT',detail:'CLOCK-OUT REQUIRED',z:-45.5}
].map(s=>Object.freeze({...s,wallX:65,face:-1,y:2.59,width:2.0,height:.58})));
/** Shallow overhead plaster break-lines, all above the 2.5m staff doors;
 * decorative only. The full 9m employee passage remains unobstructed. */
export const ANNEX_BULKHEADS_V127B=Object.freeze(
 [-98.4,-75,-48.2].map((z,i)=>Object.freeze({
 id:'annex_bulkhead_'+i,x:60.5,z,width:9,depth:.32,
 bottom:3.075,top:3.35
 })));
const eq=(a,b)=>Math.abs(a-b)<.001;
export function validateAnnexCirculationV127b(
 {spine=ANNEX_SPINE_V127B,lights=ANNEX_LIGHTS_V127B,
  signs=ANNEX_SIGNS_V127B,bulkheads=ANNEX_BULKHEADS_V127B}={},
 {walls=[],portals=[],ceilings=[]}={}
){
 const errors=[],room=MALL.rooms.find(r=>r.id===spine.room),ids=new Set();
 if(!room||room.level!=='G'||room.x1!==spine.x1||room.x2!==spine.x2||
  room.z1!==spine.z1||room.z2!==spine.z2)
  errors.push('Annex spine no longer matches canonical story room');
 if(spine.clearCentralX2-spine.clearCentralX1<3.5||
  spine.clearCentralX1<=spine.x1||spine.clearCentralX2>=spine.x2)
  errors.push('insufficient free continuous employee route');
 if(spine.floor!=='tile')errors.push('Annex source-floor finish changed');
 if(lights.length!==10||signs.length!==5||bulkheads.length!==3)
  errors.push('missing V127b corridor components');
 for(const l of lights){
  if(ids.has(l.id))errors.push('duplicate ID '+l.id);ids.add(l.id);
  if(l.room!==spine.room||l.x<spine.x1+1.4||l.x>spine.x2-1.4||
   l.z<spine.z1+1.4||l.z>spine.z2-1.4||l.power<0||l.power>1)
   errors.push('invalid Annex lamp location/state '+l.id);
  const support=ceilings.filter(c=>c.room===spine.room&&
   l.x>c.x1+1.1&&l.x<c.x2-1.1&&l.z>c.z1+1.1&&l.z<c.z2-1.1&&
   eq(c.y-c.thickness/2,spine.ceilingUnderside));
  if(support.length!==1)errors.push('lamp missing real Annex ceiling '+l.id);
 }
 for(const s of signs){
  if(ids.has(s.id))errors.push('duplicate ID '+s.id);ids.add(s.id);
  if(s.wallX!==spine.x2||s.face!==-1||s.y-s.height/2<2.25||
   s.y+s.height/2>3.1||!s.text||!s.detail)
   errors.push('unanchored Annex plate '+s.id);
  const sourceWall=walls.filter(w=>w.axis==='x'&&eq(w.at,s.wallX)&&
   w.start<=s.z-s.width/2-.02&&w.end>=s.z+s.width/2+.02&&
   w.bottom===0&&w.top>=3.3&&w.role==='partition');
  if(sourceWall.length!==1)errors.push('plate intersects canonical portal '+s.id);
  const sourceRoom=MALL.rooms.find(r=>r.id===s.room);
  if(!sourceRoom||s.z-s.width/2<sourceRoom.z1+.3||
   s.z+s.width/2>sourceRoom.z2-.3)
   errors.push('plate beyond its actual room '+s.id);
  if(portals.some(p=>p.type==='doorway'&&p.axis==='x'&&eq(p.at,65)&&
   s.z+s.width/2>p.start&&s.z-s.width/2<p.end))
   errors.push('Annex sign obscures door '+s.id);
 }
 for(const b of bulkheads){
  if(ids.has(b.id))errors.push('duplicate ID '+b.id);ids.add(b.id);
  if(b.x-b.width/2!==spine.x1||b.x+b.width/2!==spine.x2||
   b.bottom<3||b.top>spine.ceilingUnderside||
   b.z-b.depth/2<spine.z1||b.z+b.depth/2>spine.z2)
   errors.push('Annex bulkhead blocks circulation '+b.id);
 }
 if(!lights.some(l=>l.power===0)||!lights.some(l=>l.power>.6))
  errors.push('Annex lights lack credible partial outage');
 return errors;
}
