/** V115: source-anchored, physical retail frontage.
 * No new rooms, no fantasy bays or unapproved Builder draft placements.
 * The source portal stays full width, so story routes remain walkable.
 */
import {MALL} from './masterplan-v66.mjs';

const STORES=Object.freeze([
 {room:'west_anchor',gallery:'west_gallery',name:"FALLOW'S",subtitle:'DEPARTMENT STORE',color:0x9a775c},
 {room:'cassette_castle',gallery:'west_gallery',name:'CASSETTE CASTLE',subtitle:'MUSIC · TAPES · RECORDS',color:0xb3a46d},
 {room:'sunburst_arcade',gallery:'west_gallery',name:'SUNBURST ARCADE',subtitle:'GAMES · TOKENS · PRIZES',color:0xc08c71},
 {room:'east_original_anchor',gallery:'east_gallery',name:'EAST DEPARTMENT',subtitle:'CLOSED FOR RENOVATION',color:0x8a8470},
 {room:'video_planet',gallery:'east_gallery',name:'VIDEO PLANET',subtitle:'RENTALS · RETURN SLOT',color:0x759a9f},
 {room:'food_court',gallery:'east_gallery',name:'PINEWOOD FOOD COURT',subtitle:'DINING · TAKEAWAY',color:0xbd9a7a},
 {room:'annex_anchor',gallery:'east_wing_spine',name:'EAST WING ANCHOR',subtitle:'EST. 1992',color:0x858eab}
]);
const EPS=1e-4;
const close=(a,b)=>Math.abs(a-b)<EPS;
export const STOREFRONT_SPECS_V115=STORES;

/** Return one front for each formerly bare public-retail wall. */
export function planStorefrontsV115(portals,rooms=MALL.rooms){
 const byId=new Map(rooms.map(r=>[r.id,r]));
 return STORES.map(spec=>{
  const room=byId.get(spec.room),gallery=byId.get(spec.gallery);
  const portal=portals.find(p=>p.type==='doorway'&&
   [p.from,p.to].includes(spec.room)&&[p.from,p.to].includes(spec.gallery));
  if(!room||!gallery||!portal||room.level!=='G'||portal.axis!=='x')
   throw Error('V115 storefront cannot resolve source retail opening: '+spec.room);
  const facing=close(room.x2,portal.at)&&gallery.x1>=portal.at?1:
   close(room.x1,portal.at)&&gallery.x2<=portal.at?-1:0;
  if(!facing||portal.start<=room.z1+.45||portal.end>=room.z2-.45||
    portal.width<3.6||portal.width>5.0)
   throw Error('V115 storefront lacks safe measured frontage: '+spec.room);
  return Object.freeze({...spec,level:'G',at:portal.at,
   start:room.z1,end:room.z2,doorStart:portal.start,doorEnd:portal.end,
   portalId:portal.id,entryWidth:portal.width,facing,
   wallTop:room.id==='annex_anchor'?7.8:5.4,
   windowTop:3.5,era:room.id==='annex_anchor'?'1992':'1979'});
 });
}

/** True physical building envelope for transparent shop windows.
 * These walls *do* close the non-entry frontage and join the walk colliders.
 */
export function storefrontPhysicalWallsV115(fronts){
 const walls=[];
 for(const f of fronts){
  const add=(kind,from,to,bottom,top,thickness=.16)=>{
   if(to-from<.02||top-bottom<.02)return;
   walls.push({id:'v115_'+kind+'_'+f.room+'_'+from.toFixed(2),axis:'x',
    at:f.at,start:from,end:to,bottom,top,thickness,
    role:'storefront-'+kind,material:kind==='glass'?'glass':'storefront'});
  };
  // Material pilasters sit at actual original store boundaries; neither
  // crosses the 4.2 metre doorway nor overlaps its real header.
  add('pier',f.start,f.start+.44,0,f.wallTop,.22);
  add('pier',f.end-.44,f.end,0,f.wallTop,.22);
  for(const [begin,end] of [[f.start+.44,f.doorStart],[f.doorEnd,f.end-.44]]){
   add('kick',begin,end,0,.43);
   add('glass',begin,end,.43,f.windowTop,.055);
   add('spandrel',begin,end,f.windowTop,f.wallTop,.16);
  }
 }
 return walls;
}

export function validateStorefrontsV115(fronts,portals){
 const issues=[],ids=new Set();
 for(const f of fronts){
  if(ids.has(f.room))issues.push('duplicate storefront '+f.room);
  ids.add(f.room);
  const p=portals.find(p=>p.id===f.portalId);
  if(!p||p.axis!=='x'||!close(p.at,f.at)||
   !close(p.start,f.doorStart)||!close(p.end,f.doorEnd))
   issues.push('front not connected to real source portal '+f.room);
  if(f.doorStart-f.start<.6||f.end-f.doorEnd<.6)
   issues.push('insufficient physical window frontage '+f.room);
  if(f.entryWidth<3.6||f.facing===0)issues.push('blocked store entry '+f.room);
 }
 if(fronts.length!==STORES.length)issues.push('not all known retail stores have a facade');
 const physical=storefrontPhysicalWallsV115(fronts);
 for(const f of fronts)for(const w of physical.filter(w=>w.id.includes('_'+f.room+'_'))){
  if(w.start<f.start-EPS||w.end>f.end+EPS||w.end>w.start&&w.start<f.doorEnd&&w.end>f.doorStart)
   issues.push('physical frontage crosses doorway or room '+w.id);
  if(w.bottom<0||w.top>f.wallTop+EPS)issues.push('front too tall '+w.id);
 }
 return issues;
}
