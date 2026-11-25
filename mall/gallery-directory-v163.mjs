/** Accurate face-oriented plan of the original public ground floor. */
import {MALL} from './masterplan-v66.mjs';
export const DIRECTORY_PRINT_V163=Object.freeze({width:760,height:1424,meshWidth:.95,meshHeight:1.78,metrePixels:6.5});
export const DIRECTORY_TENANTS_V163=Object.freeze([
 ['west_anchor',"Fallow's"],['cassette_castle','Cassette Castle'],['sunburst_arcade','Sunburst Arcade'],
 ['east_original_anchor','East Department'],['video_planet','Video Planet'],['food_court','Food Court']
].map(([id,label],i)=>Object.freeze({id,label,number:i+1})));
const publicIds=['central_gallery','west_gallery','east_gallery','boarded_lobby',...DIRECTORY_TENANTS_V163.map(t=>t.id)];
export function directoryLayoutV163(plan,face){
 if(![1,-1].includes(face)||!['north','south'].includes(plan.facing))throw Error('Directory requires actual facing and face');
 const northUp=(plan.facing==='south')===(face===1),d=northUp?1:-1;
 const point=(x,z)=>({x:380+d*x*DIRECTORY_PRINT_V163.metrePixels,y:520+d*(z+67.25)*DIRECTORY_PRINT_V163.metrePixels});
 const rooms=publicIds.map(id=>{
  const room=MALL.rooms.find(r=>r.id===id&&r.level==='G');if(!room)throw Error('Lost canonical directory room '+id);
  const a=point(room.x1,room.z1),b=point(room.x2,room.z2);
  return {id,kind:room.kind,number:DIRECTORY_TENANTS_V163.find(t=>t.id===id)?.number||null,
   x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)};
 });
 return {northUp,rooms,marker:point(plan.x,plan.z),markerWorld:{x:plan.x,z:plan.z},
  fountain:{...point(0,-71),radius:5.1*DIRECTORY_PRINT_V163.metrePixels},orientation:northUp?'N':'S'};
}
