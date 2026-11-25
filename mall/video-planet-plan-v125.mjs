/** V125: source-pinned, 1997 Video Planet rental tenant in the original 1979 shell.
 * No private Builder placements, borrowed movie posters or new remote assets.
 */
import {MALL} from './masterplan-v66.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from './anchor-retail-source-v121.mjs';
import {MEDIA_SHELF_V158} from './media-shelf-source-v158.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';

export const VIDEO_PLANET_ROOM_V125=Object.freeze({id:'video_planet',x1:29,x2:46,z1:-80,z2:-61});
const sources=new Map([...ORIGINAL_RETAIL_CANDIDATES_V121,MEDIA_SHELF_V158].map(f=>[f.shortName,f]));
const fixture=(id,kind,section,x,z,yaw,collisionRadius)=>{
 const original=sources.get(kind);
 if(!original||!['wall_bay','table_medium','spinner'].includes(kind))
  throw Error('V125 unapproved video rental fixture '+kind);
 return Object.freeze({id,room:'video_planet',kind,section,x,z,yaw,collisionRadius,
  source:original.path,sha256:original.sha256,targetHeight:original.targetHeight,
  license:'CC0-1.0',period:'1979–1997'});
};
/** The west wall has an EXISTING open 4.2m source entrance at x29.
 * Keep the original V69 counter/racks, LS-03 at (40,-70), and a central
 * continuous customer path clear. Sectioned perimeter runs, not a scatter.
 */
export const VIDEO_PLANET_FIXTURES_V125=Object.freeze([
 fixture('new_releases_north','wall_bay', 'NEW RELEASES',31.6,-62.4,Math.PI,.86),
 fixture('drama_north','wall_bay','DRAMA',37.8,-62.4,Math.PI,.86),
 fixture('thrillers_north','wall_bay','THRILLERS',41,-62.4,Math.PI,.86),
 fixture('family_south','wall_bay','FAMILY',31.6,-78.6,0,.86),
 fixture('classics_south','wall_bay','CLASSICS',40.2,-78.6,0,.86),
 fixture('horror_east','wall_bay','HORROR',44.8,-69.0,-Math.PI/2,.86),
 fixture('scifi_east','wall_bay','SCI-FI',44.8,-73.3,-Math.PI/2,.86),
 fixture('rewind_west','wall_bay','RETURNED TODAY',36.3,-74.5,0,.86),
 // Two deliberately bounded customer browsing aisles inside the actual
 // 323m2 rental floor. Both keep the entry-to-LS-03 and cashier corridors free.
 fixture('front_comedy','wall_bay','COMEDY',32.2,-67,Math.PI,.86),
 fixture('evening_drama','wall_bay','DRAMA PICKS',35.7,-68,Math.PI,.86),
 fixture('late_night_thrillers','wall_bay','LATE NIGHT',41,-66.6,Math.PI,.86),
 fixture('summer_rentals','wall_bay','WEEKEND',32.7,-74.5,0,.86),
 fixture('sci_fi_classics','wall_bay','CULT FAVORITES',39.6,-74.5,0,.86),
 fixture('membership_spinner','spinner','MEMBERSHIP',30.55,-64.6,0,.70),
 fixture('rental_accessories','spinner','REWIND KITS',42.5,-75.5,0,.70),
 fixture('staff_picks_table','table_medium','STAFF PICKS',36.8,-72.2,0,1.10)
]);
const lamp=(id,x,z,power)=>Object.freeze({
 id,room:'video_planet',x,z,power,model:ANCHOR_FLUORESCENT_ASSET_V122.path,
 sha256:ANCHOR_FLUORESCENT_ASSET_V122.sha256,license:'CC0-1.0'
});
export const VIDEO_PLANET_LIGHTS_V125=Object.freeze([
 lamp('front_dim',34,-67,.57),lamp('front_burned',40,-67,0),
 lamp('rear_dim',34,-75,.29),lamp('rear_burned',40,-75,0)
]);
export const VIDEO_PLANET_SIGN_V125=Object.freeze({
 id:'video_planet_inside_identity',name:'VIDEO PLANET',
 subtitle:'MOVIES  ·  GAMES  ·  OVERNIGHT RENTALS',
 wallX:46,face:-1,z:-67,y:3.4,width:6.3,height:.84
});
export const VIDEO_PLANET_POSTERS_V125=Object.freeze([
 {id:'silent_frequency',wall:'north',x:33,z:-61.15,title:'SILENT FREQUENCY',subtitle:'AVAILABLE ON VIDEO',bg:'#242b48'},
 {id:'last_lighthouse',wall:'north',x:39,z:-61.15,title:'THE LAST LIGHTHOUSE',subtitle:'NEW THIS WEEK',bg:'#4a3840'},
 {id:'willow_street',wall:'north',x:43,z:-61.15,title:'WILLOW STREET',subtitle:'FRIDAY NIGHT FAVORITE',bg:'#40533c'},
 {id:'night_shift',wall:'south',x:33,z:-79.85,title:'NIGHT SHIFT',subtitle:'PLEASE REWIND',bg:'#4a3c37'},
 {id:'blue_horizon',wall:'south',x:39,z:-79.85,title:'BLUE HORIZON',subtitle:'TWO NIGHTS ONLY',bg:'#25414d'},
 {id:'tomorrow_station',wall:'east',x:45.84,z:-76,title:'TOMORROW STATION',subtitle:'1997 RENTAL PREMIERE',bg:'#524a35'}
].map(p=>Object.freeze({...p,originalArtwork:true})));

const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const segmentDistance=(p,a,b)=>{
 const dx=b.x-a.x,dz=b.z-a.z,s=dx*dx+dz*dz;
 const t=s?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/s)):0;
 return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);
};
export function validateVideoPlanetV125(plan={
 fixtures:VIDEO_PLANET_FIXTURES_V125,lights:VIDEO_PLANET_LIGHTS_V125,
 sign:VIDEO_PLANET_SIGN_V125,posters:VIDEO_PLANET_POSTERS_V125
},{portals=[],ceilings=[]}={}){
 const errors=[],seen=new Set();
 const canonical=MALL.rooms.find(r=>r.id==='video_planet');
 if(!canonical||Object.entries(VIDEO_PLANET_ROOM_V125).some(([key,value])=>canonical[key]!==value))
  errors.push('Canonical original 17 x 19m Video Planet room changed');
 if(MALL.rooms.length!==41||MALL.evidence.length!==9||
  !MALL.evidence.some(e=>e.id==='LS-03'&&e.room==='video_planet'))
  errors.push('Original story rooms / Luis LS-03 evidence changed');
 const old=FURNISHINGS_V69.fixtures.filter(f=>f.room==='video_planet');
 if(old.length!==5||!old.some(f=>f.id==='video_counter')||
  old.filter(f=>f.id.startsWith('video_rack_')).length!==3)
  errors.push('Lost original 1997 counter, racks or supported VHS tape');
 const {fixtures=[],lights=[],sign,posters=[]}=plan||{};
 if(fixtures.length!==16||lights.length!==4||posters.length!==6||!sign)
  errors.push('Incomplete period rental furnishings / original signage');
 const entrance={x:29,z:-70.5},evidence={x:40,z:-70},
  counter={x:35,z:-65};
 for(const f of fixtures){
  if(seen.has(f.id))errors.push('duplicate rental fixture '+f.id);seen.add(f.id);
  const src=sources.get(f.kind),r=f.collisionRadius;
  if(!src||src.path!==f.source||src.sha256!==f.sha256||
   src.targetHeight!==f.targetHeight||f.license!=='CC0-1.0')
   errors.push('unlicensed / replaced source rental fixture '+f.id);
  if(f.room!=='video_planet'||!Number.isFinite(f.x+f.z+f.yaw)||
   !(r>=.65&&r<=1.10)||f.x<=29+r+.08||f.x>=46-r-.08||
   f.z<=-80+r+.08||f.z>=-61-r-.08)
   errors.push('source rental fixture clips original masonry '+f.id);
  if(segmentDistance(f,entrance,evidence)<=r+.52||
   segmentDistance(f,evidence,counter)<=r+.42||
   distance(f,evidence)<=r+1.25)
   errors.push('rental fixture blocks Luis LS-03 or checkout route '+f.id);
  for(const p of portals.filter(p=>p.type==='doorway'&&[p.to,p.from].includes('video_planet'))){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(segmentDistance(f,a,b)<=r+1.03)
    errors.push('fixture blocks original 4.2m shop entrance '+f.id);
  }
  for(const legacy of old.filter(o=>o.radius>0)){
   if(distance(f,legacy)<=r+legacy.radius+.28)
    errors.push('video fixture intersects existing 1997 counter / rack '+f.id+'/'+legacy.id);
  }
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  if(distance(fixtures[i],fixtures[j])<=
   fixtures[i].collisionRadius+fixtures[j].collisionRadius+.32)
   errors.push('inadequate original rental browsing aisle '+fixtures[i].id+'/'+fixtures[j].id);
 }
 for(const l of lights){
  if(seen.has(l.id))errors.push('duplicate ceiling fluorescent '+l.id);seen.add(l.id);
  if(l.room!=='video_planet'||l.model!==ANCHOR_FLUORESCENT_ASSET_V122.path||
   l.sha256!==ANCHOR_FLUORESCENT_ASSET_V122.sha256||l.license!=='CC0-1.0'||
   ![0,.29,.57].includes(l.power)||l.x<=30.45||l.x>=44.55||
   l.z<=-78.55||l.z>=-62.45)
   errors.push('unverified licensed video-store fluorescent '+l.id);
  if(ceilings.length){
   const hits=ceilings.filter(s=>s.room==='video_planet'&&
    l.x>s.x1+1.1&&l.x<s.x2-1.1&&l.z>s.z1+1.1&&l.z<s.z2-1.1);
   if(hits.length!==1||Math.abs(hits[0].y-hits[0].thickness/2-5.21)>.02)
    errors.push('video-store fluorescent not fixed to measured soffit '+l.id);
  }
 }
 if(!sign||sign.wallX!==46||sign.face!==-1||sign.z-sign.width/2<=-79||
  sign.z+sign.width/2>=-62||sign.y-sign.height/2<2.7||
  sign.y+sign.height/2>4.4)
  errors.push('original rear Video Planet sign detached from masonry');
 for(const p of posters){
  if(seen.has(p.id))errors.push('duplicate original fictional movie print '+p.id);
  seen.add(p.id);
  if(!p.originalArtwork||!p.title||!['north','south','east'].includes(p.wall)||
   (p.wall==='north'&&p.z!==-61.15)||
   (p.wall==='south'&&p.z!==-79.85)||
   (p.wall==='east'&&p.x!==45.84))
   errors.push('unmounted / unoriginal 1997 video poster '+p.id);
 }
 return errors;
}
