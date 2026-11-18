/** V135: source-backed original 1979 west-rear closed service seam.
 * Do NOT invent a new room, floor or janitorial entrance. Build only
 * genuinely absent original masonry spans against the measured existing
 * sealed V116 west janitorial, north-service and authentic rear exterior.
 *
 * Staged separately while V133/V134 release gates are processing. Do not
 * install or merge until the read-only V134 face survey proves every gap.
 */
import {MALL} from './masterplan-v66.mjs';
const EPS=1e-6,near=(a,b)=>Math.abs(a-b)<EPS;
export const WEST_REAR_SERVICE_V135=Object.freeze({
 id:'v135_original_west_rear_sealed_service',
 x1:-17,x2:-11,z1:-118.5,z2:-111,area:45,
 existingSingleOriginalFloor:true,noNewStoryRoom:true,
 sourceCeilingY:3.45,sourceCeilingThickness:.18,
 originalExteriorZ:-118.5
});
export const WEST_REAR_SOURCE_CEILING_V135=Object.freeze({
 id:'v135_original_rear_west_plaster',room:WEST_REAR_SERVICE_V135.id,
 x1:-17,x2:-11,z1:-118.5,z2:-111,
 y:3.45,thickness:.18,material:'plaster-ceiling'
});
export const WEST_REAR_MISSING_FACES_V135=Object.freeze([
 Object.freeze({axis:'x',at:-17,start:-118.5,end:-111,host:'V116 west janitorial partition'}),
 Object.freeze({axis:'x',at:-11,start:-118.5,end:-111,host:'1979 original north service'}),
 Object.freeze({axis:'z',at:-111,start:-17,end:-11,host:'closed 1979 west gallery service threshold'})
]);
function overlaps(a,b){return Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1))}
function liveIntervals(existing,face){
 const lines=existing.filter(w=>w.axis===face.axis&&near(w.at,face.at)&&
  w.bottom<=EPS&&w.top>=3.45-EPS)
  .map(w=>[Math.max(w.start,face.start),Math.min(w.end,face.end)])
  .filter(([a,b])=>b-a>EPS).sort((a,b)=>a[0]-b[0]);
 const merged=[];
 for(const [a,b]of lines){
  const last=merged.at(-1);
  if(last&&a<=last[1]+EPS)last[1]=Math.max(last[1],b);
  else merged.push([a,b]);
 }
 return merged;
}
function missing(existing,face){
 let pos=face.start;
 const absent=[];
 for(const [a,b]of liveIntervals(existing,face)){
  if(a-pos>EPS)absent.push([pos,a]);
  pos=Math.max(pos,b);
 }
 if(face.end-pos>EPS)absent.push([pos,face.end]);
 return absent;
}
export function westRearSourceWallsV135(existing=[]){
 const closure=WEST_REAR_MISSING_FACES_V135.flatMap((face,i)=>
  missing(existing,face).map(([start,end],j)=>({
   id:'v135_west_rear_'+i+'_'+j,axis:face.axis,at:face.at,
   start,end,bottom:0,top:3.45,thickness:.24,
   material:'concrete',role:'v135-west-rear-partition'
  })));
 // The exact original old west and east bays must supply 7m and 6m of
 // already-present wall. Only four actual remaining missing segments.
 const expected=[
  ['x',-17,-118.5,-118],
  ['x',-11,-118.5,-118],
  ['x',-11,-112,-111],
  ['z',-111,-17,-11]
 ];
 if(closure.length!==expected.length||
    expected.some(([axis,at,start,end])=>!closure.some(w=>
     w.axis===axis&&near(w.at,at)&&near(w.start,start)&&near(w.end,end))))
  throw Error('V135 actual V116/north-service source wall gaps changed: re-survey before construction');
 const rear=existing.some(w=>w.axis==='z'&&near(w.at,-118.5)&&
  w.start<=-17+EPS&&w.end>=-11-EPS&&w.bottom<=EPS&&w.top>=3.45-EPS);
 if(!rear)throw Error('Original 1979 true rear exterior missing: do not fake original walls');
 return closure;
}
export function westRearCeilingV135(){return {...WEST_REAR_SOURCE_CEILING_V135};}
export function validateWestRearV135({walls=[],existingWalls=[],floorPlates=[],ceilings=[],roofs=[],portals=[]}={}){
 const errors=[],zone=WEST_REAR_SERVICE_V135;
 if(MALL.rooms.length!==41||MALL.evidence.length!==9||
    MALL.rooms.some(r=>r.id===zone.id))
  errors.push('original story room/evidence contract changed');
 let expected=[];
 try{expected=westRearSourceWallsV135(existingWalls);}
 catch(e){errors.push(String(e));}
 if(expected.length!==4||walls.length!==4||
    expected.some(w=>!walls.some(a=>a.axis===w.axis&&near(a.at,w.at)&&
     near(a.start,w.start)&&near(a.end,w.end)&&near(a.bottom,w.bottom)&&near(a.top,w.top))))
  errors.push('four measured original absent source masonry segments must be built');
 for(const p of portals.filter(p=>p.type==='doorway'))for(const w of walls)
  if(p.axis===w.axis&&near(p.at,w.at)&&p.start<w.end-EPS&&p.end>w.start+EPS)
   errors.push('source construction blocks actual original passage '+p.id);
 const sourceFloor=floorPlates.reduce((n,p)=>n+overlaps(p,zone),0);
 const sourceRoof=roofs.reduce((n,p)=>n+overlaps(p,zone),0);
 if(!near(sourceFloor,45)||floorPlates.some(p=>p.id.startsWith('v135_')))
  errors.push('original single y=0 floor changed or doubled');
 if(!near(sourceRoof,45))errors.push('true original 1979 weather roof no longer covers seam');
 const plasters=ceilings.filter(c=>c.room===zone.id);
 if(plasters.length!==1||!plasters.some(c=>c.id===WEST_REAR_SOURCE_CEILING_V135.id&&
  near(c.x1,-17)&&near(c.x2,-11)&&near(c.z1,-118.5)&&near(c.z2,-111)&&
  near(c.y-c.thickness/2,3.36)))
  errors.push('source-built actual 45m² original plaster underside missing');
 for(const c of plasters)for(const other of ceilings.filter(o=>o!==c))
  if(overlaps(c,other)>EPS)errors.push('duplicate source ceiling '+c.id+'/'+other.id);
 return errors;
}
