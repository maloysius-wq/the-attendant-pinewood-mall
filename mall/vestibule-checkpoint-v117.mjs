/**
 * V117: a source-measured after-hours contractor approach, not a seven-metre
 * empty rectangular room. The canonical service_vestibule remains a single
 * STORY room: side service cells are permanently sealed and never become
 * additional gameplay passages or Builder-draft objects.
 */
import {MALL} from './masterplan-v66.mjs';
import {VESTIBULE_HANDOFF_V112} from './vestibule-handoff-v112.mjs';

export const CHECKPOINT_V117=Object.freeze({
 room:'service_vestibule',wallTop:3.45,
 approach:Object.freeze({west:11.05,east:13.65,startZ:-36.5,endZ:-25.4}),
 cells:Object.freeze([
  Object.freeze({id:'west_service_riser',label:'ELECTRICAL / MAINTENANCE',
   x1:9,x2:11.05,z1:-36.5,z2:-25.4,kind:'sealed-riser'}),
  Object.freeze({id:'east_checkin',label:'SECURITY CHECK-IN / CLOSED',
   x1:13.65,x2:16,z1:-36.5,z2:-25.4,kind:'closed-checkpoint'})
 ]),
 window:Object.freeze({axis:'x',at:13.65,start:-33.25,end:-29.0,bottom:1.03,top:2.36}),
 path:Object.freeze([
  Object.freeze({x:12,z:-23.6}), // existing external contractor door
  Object.freeze({x:12.5,z:-32.75}), // locked cinematic/Chapter 1 eye
  Object.freeze({x:12,z:-38}), // widening turn after the side rooms
  Object.freeze({x:10,z:-40.8}) // licensed inner hinged door approach
 ])
});
const EPS=1e-5;
const between=(v,a,b)=>v>=a-EPS&&v<=b+EPS;
function wall(id,axis,at,start,end,bottom,top,role,thickness=.20){
 return {id:'v117_'+id,axis,at,start,end,bottom,top,role,thickness,
  material:role==='checkpoint-glass'?'glass':'concrete'};
}
/** Walls are *inside* the existing 7 x 20.5m room, sharing the source side
 * walls at x=9 and x=16 rather than placing another coincident mesh over them.
 * The long central approach is 2.6m clear and widens before the real fire door.
 */
export function checkpointWallsV117(plan=CHECKPOINT_V117){
 const {cells,window:win,wallTop:h}=plan;
 const walls=[];
 for(const cell of cells){
  const west=cell.id==='west_service_riser',innerX=west?cell.x2:cell.x1;
  const prefix=cell.id;
  walls.push(
   wall(prefix+'_front','z',cell.z2,cell.x1,cell.x2,0,h,'checkpoint-partition'),
   wall(prefix+'_back','z',cell.z1,cell.x1,cell.x2,0,h,'checkpoint-partition')
  );
  if(west)walls.push(wall(prefix+'_corridor','x',innerX,cell.z1,cell.z2,0,h,'checkpoint-partition'));
  else{
   // A real observation pane has an actual non-masonry opening in the
   // structural wall. Its physically blocking glass remains a collider.
   walls.push(
    wall(prefix+'_side_south','x',innerX,cell.z1,win.start,0,h,'checkpoint-partition'),
    wall(prefix+'_side_north','x',innerX,win.end,cell.z2,0,h,'checkpoint-partition'),
    wall(prefix+'_window_kick','x',innerX,win.start,win.end,0,win.bottom,'checkpoint-partition'),
    wall(prefix+'_window_glass','x',innerX,win.start,win.end,win.bottom,win.top,'checkpoint-glass',.055),
    wall(prefix+'_window_header','x',innerX,win.start,win.end,win.top,h,'checkpoint-header')
   );
  }
 }
 return walls;
}
export function checkpointCeilingsV117(plan=CHECKPOINT_V117){
 return plan.cells.map(cell=>({
  id:'v117_ceiling_'+cell.id,room:'v117_'+cell.id,
  x1:cell.x1,x2:cell.x2,z1:cell.z1,z2:cell.z2,
  y:3.22,thickness:.16,material:'plaster-ceiling'
 }));
}
export function validateCheckpointV117(plan=CHECKPOINT_V117,mall=MALL){
 const errors=[];
 const room=mall.rooms.find(r=>r.id===plan.room);
 if(!room)return ['missing original service_vestibule source geometry'];
 if(room.x1!==9||room.x2!==16||room.z1!==-43||room.z2!==-22.5)
  errors.push('original service vestibule changed; remeasure v117');
 if(plan.cells.length!==2)errors.push('two closed source-adjacent service cells required');
 const [west,east]=plan.cells;
 if(!west||!east||west.x1!==9||east.x2!==16||
  west.x2!==plan.approach.west||east.x1!==plan.approach.east)
  errors.push('service cells must terminate on actual existing side walls');
 if(plan.approach.east-plan.approach.west<2.4)
  errors.push('central after-hours route too narrow');
 if(plan.approach.startZ!==-36.5||plan.approach.endZ!==-25.4)
  errors.push('checkpoint would move protected internal route');
 if(!between(VESTIBULE_HANDOFF_V112.x,plan.approach.west+.28,plan.approach.east-.28)||
  !between(VESTIBULE_HANDOFF_V112.z,plan.approach.startZ,plan.approach.endZ))
  errors.push('terminal cinematic eye intersects new checkpoint corridor');
 if(plan.window.bottom<.95||plan.window.top>plan.wallTop-.55)
  errors.push('observation window needs structural sill and header');
 for(const cell of plan.cells){
  if(cell.x1>=cell.x2||cell.z1>=cell.z2||cell.z1!==plan.approach.startZ||
   cell.z2!==plan.approach.endZ||!between(cell.x1,room.x1,room.x2)||
   !between(cell.x2,room.x1,room.x2))
   errors.push('enclosure outside exact vestibule '+cell.id);
  if(mall.links.some(l=>l.to===cell.id||l.from===cell.id))
   errors.push('private service room must not be a story passage '+cell.id);
 }
 // This space opens to the original inner real door AFTER the checkpoint
 // cells end. There must be free lateral space to turn toward x=10.
 if(!(plan.approach.startZ>-43+2.5&&plan.path.at(-1).z>-43+1.5&&
  plan.path.at(-1).x>=9.1&&plan.path.at(-1).x<=10.9))
  errors.push('licensed fire door turn and approach obscured');
 return errors;
}
