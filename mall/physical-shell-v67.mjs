import {MALL} from './masterplan-v66.mjs';

const EPS=1e-6;
const TEXTURES=Object.freeze({
 terrazzo:'assets/vendor/runtime/4c5fa06ac517f4a9/terrazzo_tiles_diff_1k.jpg',
 terrazzoRough:'assets/vendor/runtime/8cc2ac446022dc40/terrazzo_tiles_rough_1k.jpg',
 carpet:'assets/vendor/runtime/282ba676c940051b/dirty_carpet_diff_1k.jpg',
 carpetRough:'assets/vendor/runtime/4b2be4a9d4c4d56d/dirty_carpet_rough_1k.jpg',
 concrete:'assets/vendor/runtime/2cc17a586ae39128/concrete_wall_001_diff_1k.jpg',
 concreteRough:'assets/vendor/runtime/b9a1b6af3c621e74/concrete_wall_001_rough_1k.jpg',
 tile:'assets/vendor/runtime/5e2a13faf5d98437/floor_tiles_06_diff_1k.jpg',
 tileRough:'assets/vendor/runtime/465619dc64de605e/floor_tiles_06_rough_1k.jpg'
});
const CIRCULATION=new Set([
 'central_gallery','west_gallery','east_gallery','annex_threshold',
 'east_wing_spine','b1_spine','b1_cross','flooded_walk','mezz_hall'
]);
const room=id=>MALL.rooms.find(r=>r.id===id);
const levelData=id=>MALL.levels.find(l=>l.id===id);
const near=(a,b)=>Math.abs(a-b)<EPS;
const clip=(a,b,min,max)=>[Math.max(a,min),Math.min(b,max)];
const contains=(r,x,z)=>x>=r.x1-EPS&&x<=r.x2+EPS&&z>=r.z1-EPS&&z<=r.z2+EPS;
const rect=(x1,x2,z1,z2)=>({x1,x2,z1,z2});
const center=(a,b)=>(a+b)/2;

function boundaryContact(a,b){
 if(a.level!==b.level)return null;
 const xSpan=clip(a.x1,a.x2,b.x1,b.x2),zSpan=clip(a.z1,a.z2,b.z1,b.z2);
 if(near(a.x2,b.x1)&&zSpan[1]-zSpan[0]>.1)return {axis:'x',at:a.x2,span:zSpan};
 if(near(a.x1,b.x2)&&zSpan[1]-zSpan[0]>.1)return {axis:'x',at:a.x1,span:zSpan};
 if(near(a.z2,b.z1)&&xSpan[1]-xSpan[0]>.1)return {axis:'z',at:a.z2,span:xSpan};
 if(near(a.z1,b.z2)&&xSpan[1]-xSpan[0]>.1)return {axis:'z',at:a.z1,span:xSpan};
 if(xSpan[1]-xSpan[0]>.1&&zSpan[1]-zSpan[0]>.1)return {axis:null,at:null,span:null};
 return null;
}
function openingFor(link,a,b){
 const c=boundaryContact(a,b);
 if(!c)return null;
 if(!c.axis)return {id:link.from+'__'+link.to,from:a.id,to:b.id,level:a.level,type:'overlap',minChapter:link.minChapter,locked:false};
 const shared=c.span[1]-c.span[0];
 const isRetail=a.kind==='retail'||b.kind==='retail';
 const isPublic=a.kind==='public'||b.kind==='public';
 const isCirculation=CIRCULATION.has(a.id)&&CIRCULATION.has(b.id);
 const desired=isCirculation?shared:isRetail?4.2:isPublic?3.7:2.55;
 const width=isCirculation?shared:Math.min(desired,Math.max(.8,shared-.2));
 const mid=center(...c.span);
 return {id:link.from+'__'+link.to,from:a.id,to:b.id,level:a.level,type:'doorway',
  axis:c.axis,at:c.at,start:mid-width/2,end:mid+width/2,width,
  height:isRetail?3.6:2.5,minChapter:link.minChapter,locked:false};
}
function subtractRect(base,hole){
 const ix1=Math.max(base.x1,hole.x1),ix2=Math.min(base.x2,hole.x2);
 const iz1=Math.max(base.z1,hole.z1),iz2=Math.min(base.z2,hole.z2);
 if(ix1>=ix2||iz1>=iz2)return [base];
 return [
  rect(base.x1,ix1,base.z1,base.z2),
  rect(ix2,base.x2,base.z1,base.z2),
  rect(ix1,ix2,base.z1,iz1),
  rect(ix1,ix2,iz2,base.z2)
 ].filter(r=>r.x2-r.x1>.01&&r.z2-r.z1>.01);
}
function pieces(base,holes){
 let result=[base];
 for(const hole of holes)result=result.flatMap(r=>subtractRect(r,hole));
 return result;
}
function withoutGaps(start,end,gaps){
 const clipped=gaps.map(g=>[Math.max(start,g[0]),Math.min(end,g[1])]).filter(g=>g[1]-g[0]>.001).sort((a,b)=>a[0]-b[0]);
 const merged=[];
 for(const gap of clipped){
  const last=merged.at(-1);
  if(last&&gap[0]<=last[1]+EPS)last[1]=Math.max(last[1],gap[1]);
  else merged.push(gap.slice());
 }
 const intervals=[];let pos=start;
 for(const [a,b]of merged){if(a-pos>.02)intervals.push([pos,a]);pos=Math.max(pos,b)}
 if(end-pos>.02)intervals.push([pos,end]);
 return intervals;
}
function wall(id,axis,at,start,end,bottom,height,material,role='partition'){
 return {id,axis,at,start,end,bottom,top:bottom+height,thickness:role==='exterior'?.46:.24,material,role};
}
function roomSides(r){
 return [
  {axis:'x',at:r.x1,start:r.z1,end:r.z2},
  {axis:'x',at:r.x2,start:r.z1,end:r.z2},
  {axis:'z',at:r.z1,start:r.x1,end:r.x2},
  {axis:'z',at:r.z2,start:r.x1,end:r.x2}
 ];
}
function roomHeight(r){
 if(r.level==='B1')return 3.45;
 if(r.level==='M1')return 3.0;
 if(r.id==='annex_anchor')return 7.8;
 if(r.kind==='retail')return 5.4;
 return 3.55;
}
function roomWalls(level,portals){
 const result=[],used=new Set();
 for(const r of MALL.rooms.filter(r=>r.level===level&&!CIRCULATION.has(r.id))){
  for(const side of roomSides(r)){
   const footprints=level==='G'?[MALL.footprints.original,MALL.footprints.annex]:[MALL.footprints[level]];
   // Shared outer shell has one authoritative surface; no hidden second
   // room wall may accidentally block its actual service or exit aperture.
   if(footprints.some(f=>
     side.axis==='x'&&(near(side.at,f.x1)||near(side.at,f.x2))&&side.start>=f.z1&&side.end<=f.z2 ||
     side.axis==='z'&&(near(side.at,f.z1)||near(side.at,f.z2))&&side.start>=f.x1&&side.end<=f.x2))continue;
   const gaps=portals.filter(p=>p.axis===side.axis&&near(p.at,side.at)&&p.type==='doorway'
    &&[p.from,p.to].includes(r.id)).map(p=>[p.start,p.end]);
   for(const [start,end]of withoutGaps(side.start,side.end,gaps)){
    const h=roomHeight(r),y=levelData(level).y;
    const w=wall(r.id+'_'+side.axis+'_'+side.at+'_'+start,side.axis,side.at,start,end,y,h,
      level==='B1'?'concrete':level==='M1'?'carpet':'concrete');
    const key=[level,w.axis,w.at.toFixed(3),w.start.toFixed(3),w.end.toFixed(3),w.bottom,w.top].join('|');
    if(!used.has(key)){used.add(key);result.push(w);}
   }
  }
 }
 return result;
}
function exterior(level){
 const f=MALL.footprints;const ret=[];
 const add=(id,axis,at,start,end,openings,height=12.8)=>{
  for(const [a,b]of withoutGaps(start,end,openings)){
   ret.push(wall(id+'_'+a.toFixed(2),axis,at,a,b,levelData(level).y,height,'concrete','exterior'));
  }
 };
 if(level==='G'){
  add('front_original','z',-22.5,-47,47,[[12-1.78/2,12+1.78/2]]);
  add('rear_original','z',f.original.z1,-47,47,[]);
  add('west_original','x',-47,f.original.z1,f.original.z2,[]);
  add('east_seam','x',47,f.original.z1,f.original.z2,[[-101.2,-96.8]]);
  add('annex_front','z',-34,47,86,[],8.5);
  add('annex_rear','z',-115,47,86,[],8.5);
  add('annex_east','x',86,-115,-34,[[-43,-41]],8.5);
 }else if(level==='B1'){
  const b=f.B1;
  add('basement_west','x',b.x1,b.z1,b.z2,[],4);
  add('basement_east','x',b.x2,b.z1,b.z2,[],4);
  add('basement_north','z',b.z1,b.x1,b.x2,[],4);
  add('basement_south','z',b.z2,b.x1,b.x2,[],4);
 }
 return ret;
}
function makeStairs(link){
 const from=room(link.from),to=room(link.to);
 const bottomLevel=levelData(from.level).y<levelData(to.level).y?from.level:to.level;
 const topLevel=bottomLevel===from.level?to.level:from.level;
 const bottomY=levelData(bottomLevel).y,topY=levelData(topLevel).y;
 const isBasement=bottomLevel==='B1';
 const count=isBasement?24:30,run=isBasement?6.24:8.7,width=isBasement?2.1:2.3;
 const startZ=isBasement?-114.8:-113.4;
 const tread=run/count;
 const steps=Array.from({length:count},(_,i)=>{
  const rise=(topY-bottomY)/count;
  return {x:link.at.x,z:startZ+(i+.5)*tread,y:bottomY+(i+1)*rise,
   w:width,depth:tread,height:rise};
 });
 return {id:link.from+'__'+link.to,from:link.from,to:link.to,type:'stairs',at:link.at,
  bottomLevel,topLevel,bottomY,topY,rise:topY-bottomY,steps,run,width};
}
function verticalTransitions(level){
 return MALL.links.filter(l=>l.type!=='passage'&&[room(l.from)?.level,room(l.to)?.level].includes(level))
  .map(l=>({id:l.from+'__'+l.to,from:l.from,to:l.to,type:l.type,at:l.at,
   levels:[room(l.from).level,room(l.to).level],minChapter:l.minChapter,
   shaft:l.type==='elevator'?rect(18.5,22.5,-115.8,-110.5):undefined}));
}
function fixture(id,model,roomId,x,z,targetHeight){
 return {id,model,room:roomId,x,z,y:levelData(room(roomId).level).y,targetHeight};
}
function floorPlates(level){
 const y=levelData(level).y;
 if(level==='G'){
  const holeLift=rect(18.5,22.5,-115.8,-110.5),holeStair=rect(30.5,33.5,-115.5,-108);
  return [...pieces(MALL.footprints.original,[holeLift,holeStair]).map((b,i)=>({...b,id:'original_'+i,y,material:'terrazzo'})),
   {...MALL.footprints.annex,id:'annex',y,material:'carpet'}];
 }
 if(level==='B1')return [{...MALL.footprints.B1,id:'basement',y,material:'tile'}];
 return MALL.rooms.filter(r=>r.level==='M1').flatMap(r=>
  pieces(rect(r.x1,r.x2,r.z1,r.z2),r.id==='m1_stair'?[rect(49.7,52.3,-114.5,-104.0)]:[])
   .map((b,i)=>({...b,id:r.id+'_'+i,y,material:'carpet'})));
}
function roofPlates(level){
 if(level!=='G')return level==='M1'?MALL.rooms.filter(r=>r.level==='M1'&&r.kind!=='stairs'&&r.kind!=='admin').map(r=>({...rect(r.x1,r.x2,r.z1,r.z2),type:'mezz-office-roof',y:8.6,material:'concrete'})):[];
 const skylight=rect(-8,8,-106,-45);
 return [
 ...pieces(MALL.footprints.original,[skylight]).map(b=>({...b,type:'original-atrium-roof',y:12.8,material:'concrete'})),
 {...skylight,type:'atrium-skylight',y:12.8,material:'glass'},
 {...MALL.footprints.annex,type:'annex-roof',y:8.5,material:'concrete'}];
}
function exposedDoors(level,chapter){
 if(level!=='G')return [];
 return MALL.doors.map(d=>({...d,width:d.id==='service_entry'?1.78:d.id==='east_employee_exit'?2.0:9.6,
  height:d.id==='service_entry'?2.27:d.id==='east_employee_exit'?2.5:5.7,
  locked:d.status==='boarded'||(d.status==='gated'&&chapter<d.minChapter)}));
}
function fixtures(level){
 if(level==='G')return [
  fixture('dry_fountain_art','assets/vendor/runtime/8cefa5be6dbaf538/pavement-fountain.glb','central_gallery',0,-71,2.0),
  fixture('cassette_register','assets/vendor/runtime/6aeac44b7c9c0f17/cash-register.glb','cassette_castle',-38,-80,.3),
  fixture('arcade_one','assets/vendor/runtime/5b4443e3640efa71/arcade-machine.glb','sunburst_arcade',-38,-97,1.85),
  fixture('arcade_two','assets/vendor/runtime/5b4443e3640efa71/arcade-machine.glb','sunburst_arcade',-42,-101,1.85),
  fixture('security_desk','assets/vendor/runtime/47206cda3d12810c/desk.glb','security',37,-109,.76),
  fixture('breakroom_table','assets/vendor/runtime/a69293dc3a9140d3/table.glb','break_room',74,-93,.75)
 ];
 if(level==='B1')return [
  fixture('service_floor_panel','assets/vendor/runtime/398aecafb7b7882b/floor.glb','feeder_room',1,-93,.2),
  fixture('service_wall_panel','assets/vendor/runtime/15d58f77f28b6ea3/structure-wall.glb','relay_d',-30,-90,2.7)
 ];
 return [
  fixture('kessler_desk','assets/vendor/runtime/47206cda3d12810c/desk.glb','kessler_office',60,-88,.76),
  fixture('records_chair','assets/vendor/runtime/47ff560e83dfc315/Chair.glb','roster_records',48,-87,.95)
 ];
}
function insertGates(shell){
 const gates=[];
 for(const p of shell.portals){
  if(p.type!=='doorway'||p.minChapter<=shell.chapter)continue;
  gates.push(wall('gate_'+p.id,p.axis,p.at,p.start,p.end,shell.y,p.height,'steel','gate'));
 }
 for(const d of shell.doors){
  if(!d.locked||d.status==='boarded')continue;
  if(d.id==='east_employee_exit')gates.push(wall('gate_east_exit','x',d.x,d.z-d.width/2,d.z+d.width/2,shell.y,d.height,'steel','gate'));
 }
 return gates;
}
export function constructPhysicalShell({level='G',chapter=1}={}){
 if(!levelData(level))throw new Error('Unknown Pinewood floor: '+level);
 if(!Number.isInteger(chapter)||chapter<1||chapter>6)throw new Error('Invalid Pinewood chapter '+chapter);
 const planar=MALL.links.filter(l=>l.type==='passage'&&room(l.from).level===level)
  .map(l=>openingFor(l,room(l.from),room(l.to))).filter(Boolean);
 const shell={version:67,level,chapter,y:levelData(level).y,footprints:MALL.footprints,
  floorPlates:floorPlates(level),walls:[],portals:planar,doors:exposedDoors(level,chapter),
  railings:level==='M1'?[{id:'atrium_overlook_guard',axis:'z',at:-94,start:-11,end:29,bottom:5.4,top:6.65,thickness:.12,material:'steel',role:'railing'}]:[],
  roofs:roofPlates(level),stairs:MALL.links.filter(l=>l.type==='stairs'&&[room(l.from).level,room(l.to).level].includes(level)).map(makeStairs),
  verticals:verticalTransitions(level),fixtures:fixtures(level),texturePaths:{...TEXTURES}};
 shell.portals.forEach(p=>{if(p.minChapter>chapter)p.locked=true});
 shell.walls=[...exterior(level),...roomWalls(level,planar)];
 shell.gates=insertGates(shell);
 return shell;
}
function crossLine(w,a,b){
 if(w.axis==='x'){
  const d=b.x-a.x;
  if(Math.abs(d)<EPS)return false;
  const t=(w.at-a.x)/d;
  if(t<EPS||t>1-EPS)return false;
  const at=a.z+t*(b.z-a.z);
  return at>w.start+EPS&&at<w.end-EPS;
 }
 const d=b.z-a.z;
 if(Math.abs(d)<EPS)return false;
 const t=(w.at-a.z)/d;
 if(t<EPS||t>1-EPS)return false;
 const at=a.x+t*(b.x-a.x);
 return at>w.start+EPS&&at<w.end-EPS;
}
export function isSegmentBlocked(shell,from,to){
 if(!shell||!from||!to)throw new TypeError('shell and endpoints are required');
 return [...shell.walls,...shell.gates,...shell.railings].some(w=>crossLine(w,from,to));
}
export function validatePhysicalShell(shell){
 const errors=[];
 if(shell.version!==67||!levelData(shell.level))errors.push('unknown physical shell version/level');
 for(const w of [...shell.walls,...shell.gates,...shell.railings]){
  if(!(w.start<w.end&&w.top>w.bottom&&Number.isFinite(w.at)))errors.push('invalid wall '+w.id);
 }
 for(const p of shell.portals){
  if(p.type==='overlap')continue;
  const from=p.axis==='x'?{x:p.at-.3,z:center(p.start,p.end)}:{x:center(p.start,p.end),z:p.at-.3};
  const to=p.axis==='x'?{x:p.at+.3,z:center(p.start,p.end)}:{x:center(p.start,p.end),z:p.at+.3};
  if(p.minChapter<=shell.chapter&&isSegmentBlocked(shell,from,to))errors.push('blocked open portal '+p.id);
 }
 for(const s of shell.stairs){
  if(Math.abs(s.topY-s.bottomY-s.rise)>EPS||s.steps.length<20)errors.push('impossible staircase '+s.id);
 }
 for(const f of shell.fixtures)if(!contains(room(f.room),f.x,f.z))errors.push('fixture outside room '+f.id);
 return errors;
}
