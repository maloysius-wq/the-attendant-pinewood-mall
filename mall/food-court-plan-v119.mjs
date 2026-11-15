/**
 * V119: physically measured 1997 food-court zoning against the original
 * 1979 shell. All positions are canonical mall world metres.
 * Counters are already pinned real local CC0 GLBs, never fake masonry slabs.
 */
import {MALL} from './masterplan-v66.mjs';

export const FOOD_COURT_V119=Object.freeze({
 room:'food_court',
 originalRoom:Object.freeze({x1:29,x2:46,z1:-97,z2:-80}),
 storefront:{axis:'x',at:29},
 vendorFrontX:43.65,
 depthBehindFront:2.35,
 height:5.30,
 booths:Object.freeze([
  Object.freeze({id:'slice',name:'PINEWOOD PIZZA',subtitle:'SLICE · SODA',start:-85.70,end:-81.20,
   counter:Object.freeze({x:42.2,z:-83.45})}),
  Object.freeze({id:'coffee',name:'THE COFFEE STOP',subtitle:'COFFEE · PASTRIES',start:-91.00,end:-86.10,
   counter:Object.freeze({x:42.2,z:-88.55})}),
  Object.freeze({id:'grill',name:'OLD MALL GRILL',subtitle:'HOT FOOD · COLD DRINKS',start:-95.80,end:-91.40,
   counter:Object.freeze({x:42.2,z:-93.60})})
 ]),
 dining:Object.freeze([
  Object.freeze({table:'food_table_1',x:33.25,z:-83.8,chairs:['food_chair_1','food_chair_2']}),
  Object.freeze({table:'food_table_2',x:37.75,z:-83.8,chairs:['food_chair_3','food_chair_4']}),
  Object.freeze({table:'food_table_3',x:33.25,z:-93.2,chairs:['food_chair_5','food_chair_6']}),
  Object.freeze({table:'food_table_4',x:37.75,z:-93.2,chairs:['food_chair_7','food_chair_8']})
 ]),
 waypoints:Object.freeze([
  Object.freeze({x:30.0,z:-88.5}),
  Object.freeze({x:35.5,z:-88.5}),
  Object.freeze({x:40.15,z:-88.5}),
 ])
});
const EPS=1e-4;
const close=(a,b)=>Math.abs(a-b)<EPS;
const addWall=(id,axis,at,start,end,bottom,top,role,thickness=.18)=>({
 id:'v119_'+id,axis,at,start,end,bottom,top,role,thickness,
 material:role==='food-court-shutter'?'steel':'concrete'
});

/** A real former concessions strip. Each bay has a solid ceramic kick,
 * a physically closed rolling steel shutter, and source-ceiling overhead
 * header; two masonry returns meet the existing *rear* room wall.
 * There is no fake new entrance from the public arcade or access through
 * an unmaintained stall. Source shell supplies all physical collision.
 */
export function foodCourtWallsV119(plan=FOOD_COURT_V119){
 const x=plan.vendorFrontX,h=plan.height,walls=[];
 for(const booth of plan.booths){
  const id='stall_'+booth.id;
  walls.push(
   addWall(id+'_kick','x',x,booth.start,booth.end,0,1.05,'food-court-kick'),
   addWall(id+'_roller','x',x,booth.start,booth.end,1.05,3.22,'food-court-shutter',.095),
   addWall(id+'_header','x',x,booth.start,booth.end,3.22,h,'food-court-header'),
   // Real 1997 counterwork; source measured, 0.94m tall and .86m deep.
   // The old small white KSI prop was rejected after actual WebGL review.
   addWall(id+'_counter','x',booth.counter.x,booth.start+.42,booth.end-.42,0,.94,'food-court-counter',.86)
  );
 }
 // Exact gaps between concession shutters are genuine structural piers.
 for(let i=0;i<plan.booths.length-1;i++){
  const near=plan.booths[i],next=plan.booths[i+1];
  const start=next.end,end=near.start,z=(start+end)/2;
  walls.push(addWall('pier_'+i,'x',x,start,end,0,h,'food-court-pier'));
  walls.push(addWall('return_'+i,'z',z,x,46,0,h,'food-court-return'));
 }
 // At the ends, the enclosed stalls meet the original north/south
 // room walls through short side partitions, never duplicate the room wall.
 for(const [id,z] of [['north',plan.booths[0].end],['south',plan.booths.at(-1).start]])
  walls.push(addWall('end_'+id,'z',z,x,46,0,h,'food-court-return'));
 walls.push(
  addWall('north_edge_pier','x',x,plan.booths[0].end,plan.originalRoom.z2,0,h,'food-court-pier'),
  addWall('south_edge_pier','x',x,plan.originalRoom.z1,plan.booths.at(-1).start,0,h,'food-court-pier')
 );
 return walls;
}

export function validateFoodCourtV119(plan=FOOD_COURT_V119,mall=MALL,portals=[]){
 const errors=[];
 const room=mall.rooms.find(r=>r.id===plan.room);
 if(!room||!close(room.x1,29)||!close(room.x2,46)||
    !close(room.z1,-97)||!close(room.z2,-80))
  return ['food court source room changed, remeasure V119 first'];
 if(!close(plan.vendorFrontX,43.65)||plan.height>5.3||plan.height<5.1)
  errors.push('serving closure does not join actual original roof/room geometry');
 const p=portals.find(p=>p.type==='doorway'&&p.id==='east_gallery__food_court');
 if(portals.length&&(!p||p.axis!=='x'||!close(p.at,29)||p.width<4.0))
  errors.push('original 4.2m food court frontage changed or obstructed');
 if(plan.booths.length!==3||plan.dining.length!==4)errors.push('missing three vendors or four inherited dining tables');
 for(let i=0;i<plan.booths.length;i++){
  const b=plan.booths[i];
  if(!(b.start<b.end&&b.start>room.z1+.8&&b.end<room.z2-.8&&b.end-b.start>3.9))
   errors.push('vendor bay outside original rear wall '+b.id);
  if(!(b.counter.x<plan.vendorFrontX-1.1&&b.counter.x>40&&b.counter.z>b.start+1&&b.counter.z<b.end-1))
   errors.push('fixed built-in concession counter obstructs its own closed steel shutter '+b.id);
  if(i&&!(b.end<plan.booths[i-1].start-.25))
   errors.push('food vendor piers overlap '+b.id);
 }
 const tableIds=new Set(),chairs=new Set();
 for(const t of plan.dining){
  if(tableIds.has(t.table)||t.chairs.length!==2)errors.push('invalid seating pair '+t.table);
  tableIds.add(t.table);
  for(const chair of t.chairs){
   if(chairs.has(chair))errors.push('duplicate chair '+chair);
   chairs.add(chair);
  }
  if(!(t.x>31.8&&t.x<39.2&&(close(t.z,-83.8)||close(t.z,-93.2))))
   errors.push('dining row encroaches service or center entrance '+t.table);
  if(plan.booths.some(b=>Math.hypot(t.x-b.counter.x,t.z-b.counter.z)<2.6))
   errors.push('table encroaches service counter '+t.table);
 }
 if(chairs.size!==8)errors.push('eight licensed chairs required for four tables');
 for(const point of plan.waypoints){
  if(point.x<29.65||point.x>=plan.vendorFrontX-2.3||
    Math.abs(point.z+88.5)>.01)errors.push('center approach is not physically usable');
 }
 const w=foodCourtWallsV119(plan);
 if(w.length!==20)errors.push('vendor strip missing actual steel shutters or partition solids');
 for(const e of w)if(!(e.start<e.end&&e.top>e.bottom&&e.bottom>=0&&e.top<=plan.height))
  errors.push('invalid measured serving wall '+e.id);
 for(const b of plan.booths){
  const counter=w.find(x=>x.id==='v119_stall_'+b.id+'_counter');
  if(!counter||counter.role!=='food-court-counter'||!close(counter.at,b.counter.x)||
   counter.thickness<.8||counter.top<.9||
   !close(counter.start,b.start+.42)||!close(counter.end,b.end-.42))
   errors.push('missing real service counter frontage '+b.id);
 }
 return errors;
}
