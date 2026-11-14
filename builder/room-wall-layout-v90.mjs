/**
 * Builder-only geometry plan for room-specific interior wall finishes.
 * Uses the actual physical wall solids and the replacement cinematic frontage.
 * Does not add colliders, alter canonical architecture, or fill real doorways.
 */
const EPS=1e-5;
const near=(a,b)=>Math.abs(a-b)<.07;
const distinct=values=>[...new Set(values.map(n=>Math.round(n*1e5)/1e5))].sort((a,b)=>a-b);

/** Extract the FIVE original cinematic wall blocks, including the door lintel,
 * from the actual scene meshes. Never guess how thick the visible facade is.
 */
export function getCinematicFrontWallV90(stage){
 const entry=stage?.serviceEntry;
 const anchor=entry?.leftInfill;
 const wallZ=entry?.opening?.wallZ;
 const depth=anchor?.geometry?.parameters?.depth;
 if(!Number.isFinite(wallZ)||!Number.isFinite(depth)||depth<=0)
  throw Error('Cinematic entrance front-wall geometry is unavailable');
 const blocks=stage.world.children.filter(o=>
  o.isMesh&&o.material===anchor.material&&
  Math.abs(o.position.z-wallZ)<.001&&
  Math.abs(o.geometry?.parameters?.depth-depth)<.001&&
  o.geometry.parameters.width>.01&&o.geometry.parameters.height>.01);
 if(blocks.length!==5||!blocks.includes(anchor)||!blocks.includes(entry.rightInfill)||
    !blocks.includes(entry.headerInfill))
  throw Error('Cinematic exterior five-piece front wall changed; room finishes need an updated mapping');
 const segments=blocks.map((o,index)=>{
  const {width,height}=o.geometry.parameters;
  return {id:'cinematic_front_'+index,axis:'z',at:wallZ,
   start:o.position.x-width/2,end:o.position.x+width/2,
   bottom:o.position.y-height/2,top:o.position.y+height/2,
   thickness:depth,role:'exterior'};
 });
 if(segments.some(s=>![s.start,s.end,s.bottom,s.top].every(Number.isFinite)))
  throw Error('Invalid cinematic wall measurements');
 return {axis:'z',at:wallZ,thickness:depth,interiorFaceZ:wallZ-depth/2,segments};
}

function finishCeiling(room,shell){
 const slabs=shell.ceilings.filter(p=>p.room===room.id);
 if(slabs.length)return Math.min(...slabs.map(p=>p.y-p.thickness/2));
 // Basement and mezzanine rooms have no individual ceiling slab geometry.
 // Never paint their shared exterior wall above the physical room height.
 if(room.level==='B1')return shell.y+3.45;
 if(room.level==='M1')return shell.y+3.0;
 return Infinity; // central atrium has a much taller exposed wall.
}

/** Returns non-overlapping interior-facing wall rectangles for this room.
 * A room may legitimately have open sides: paint only actual wall solids.
 */
export function planRoomWallFacesV90(room,shell,frontWall=null){
 if(room.level!==shell.level)throw Error('Room/shell level mismatch: '+room.id);
 const ceiling=finishCeiling(room,shell);
 const sides=[
  {axis:'x',at:room.x1,lo:room.z1,hi:room.z2,inward:1},
  {axis:'x',at:room.x2,lo:room.z1,hi:room.z2,inward:-1},
  {axis:'z',at:room.z1,lo:room.x1,hi:room.x2,inward:1},
  {axis:'z',at:room.z2,lo:room.x1,hi:room.x2,inward:-1}
 ];
 const replaced=room.level==='G'&&frontWall;
 const walls=shell.walls.filter(w=>w.role!=='railing'&&w.role!=='gate'&&
  !w.role.startsWith('storefront-')&& // Never paint over real glass or retail signage.
  !w.role.startsWith('closed-bay-')&& // Non-story sealed tenant shells are not room-finish editable.
  !(replaced&&w.role==='exterior'&&w.axis==='z'&&near(w.at,frontWall.at)));
 if(replaced)walls.push(...frontWall.segments);
 const planned=[];
 for(const side of sides){
  const candidates=walls.filter(w=>w.axis===side.axis&&near(w.at,side.at))
   .map(w=>({...w,start:Math.max(w.start,side.lo),
    end:Math.min(w.end,side.hi),
    bottom:Math.max(w.bottom,shell.y),
    top:Math.min(w.top,ceiling)}))
   .filter(w=>w.end-w.start>.06&&w.top-w.bottom>.06);
  if(!candidates.length)continue;
  // Room partitions sometimes overlap when neighboring rooms have different
  // heights. Split along both axes, choosing the innermost physical surface,
  // so one finish never z-fights another or hides behind a thicker wall.
  const cuts=distinct(candidates.flatMap(w=>[w.start,w.end]));
  for(let i=0;i<cuts.length-1;i++){
   const start=cuts[i],end=cuts[i+1];
   if(end-start<.06)continue;
   const crossing=candidates.filter(w=>w.start<end-EPS&&w.end>start+EPS);
   const heights=distinct(crossing.flatMap(w=>[w.bottom,w.top]));
   for(let j=0;j<heights.length-1;j++){
    const bottom=heights[j],top=heights[j+1];
    if(top-bottom<.06)continue;
    const active=crossing.filter(w=>w.bottom<top-EPS&&w.top>bottom+EPS)
     .sort((a,b)=>b.thickness-a.thickness);
    if(!active.length)continue;
    const w=active[0],face=side.at+side.inward*(w.thickness/2+.013);
    planned.push({
     room:room.id,side:side.axis+(side.inward>0?'-start':'-end'),
     source:w.id,axis:side.axis,at:side.at,
     start,end,bottom,top,thickness:w.thickness,
     x:side.axis==='x'?face:(start+end)/2,
     y:(bottom+top)/2,
     z:side.axis==='z'?face:(start+end)/2,
     width:end-start,height:top-bottom,
     rotationY:side.axis==='x'?(side.inward>0?Math.PI/2:-Math.PI/2):
      (side.inward>0?0:Math.PI)
    });
   }
  }
 }
 return planned;
}
