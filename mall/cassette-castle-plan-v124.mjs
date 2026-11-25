/**
 * V124: Cassette Castle source-authored 1979 music shop, deserted in 1997.
 * Reuses three precisely measured and genuinely licensed V121 GLB sources.
 * Hand-authored cassette / vinyl models are identified as ORIGINAL artwork;
 * the physical racks themselves are not substituted by generated boxes.
 */
import {MALL} from './masterplan-v66.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from './anchor-retail-source-v121.mjs';
import {MEDIA_SHELF_V158} from './media-shelf-source-v158.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';
const source=new Map([...ORIGINAL_RETAIL_CANDIDATES_V121,MEDIA_SHELF_V158].map(a=>[a.shortName,a]));
export const CASSETTE_ROOM_V124=Object.freeze({id:'cassette_castle',x1:-46,x2:-29,z1:-90,z2:-73});
const fixture=(id,kind,x,z,yaw,collisionRadius,section)=>{
 const a=source.get(kind);
 if(!a||a.shortName==='podium')throw Error('V124 refused unmeasured CC0 source '+kind);
 return Object.freeze({id,room:'cassette_castle',kind,section,x,z,yaw,
  collisionRadius,source:a.path,sha256:a.sha256,license:a.license,
  targetHeight:a.targetHeight,period:'1979/1997'});
};
/** Measured against the six ORIGINAL V69 shop pieces, source aisle to checkout
 * and the only 4.2m real glazed entry at x=-29,z=-81.5.
 * No invented room boundaries or residual-floor allocations.
 */
export const CASSETTE_FIXTURES_V124=Object.freeze([
 fixture('imports_north','wall_bay',-35.6,-74.4,Math.PI,.86,'IMPORTS'),
 fixture('classics_north','wall_bay',-44.9,-74.5,Math.PI/2,.86,'CLASSICS'),
 fixture('old_rock_west','wall_bay',-44.9,-77.8,Math.PI/2,.86,'ROCK'),
 fixture('rare_tapes_west','wall_bay',-44.9,-88.5,Math.PI/2,.86,'RARE TAPES'),
 fixture('clearance_west','wall_bay',-31.9,-88.6,0,.86,'CLEARANCE'),
 fixture('country_south','wall_bay',-41.7,-88.6,0,.86,'COUNTRY'),
 fixture('jazz_south','wall_bay',-38.4,-88.6,0,.86,'JAZZ'),
 fixture('now_playing_table','table_medium',-39,-74.7,0,1.10,'NEW ARRIVALS'),
 fixture('singles_table','table_medium',-33,-77,0,1.10,'SINGLES'),
 fixture('archive_table','table_medium',-40.3,-83.6,0,1.10,'BACK CATALOG'),
 fixture('headphone_spinner','spinner',-33.2,-85.6,0,.70,'HEADPHONES'),
 fixture('mixtape_spinner','spinner',-41.9,-86.2,0,.70,'MIX TAPES')
]);
const lamp=(id,x,z,power)=>Object.freeze({id,room:'cassette_castle',x,z,power,
 model:ANCHOR_FLUORESCENT_ASSET_V122.path,
 sha256:ANCHOR_FLUORESCENT_ASSET_V122.sha256,license:'CC0-1.0'});
/** Real CC0 ceiling panels, source-lit unevenly, never floating emitters. */
export const CASSETTE_LIGHTS_V124=Object.freeze([
 lamp('shop_front_west',-42,-77.2,.62),
 lamp('shop_front_east',-35,-77.2,0),
 lamp('shop_rear_west',-42,-85.0,.32),
 lamp('shop_rear_east',-35,-85.0,0)
]);
export const CASSETTE_SIGN_V124=Object.freeze({
 id:'cassette_shop_rear_identity',name:'CASSETTE CASTLE',
 subtitle:'TAPES   ·   VINYL   ·   IMPORTS',room:'cassette_castle',
 wallX:-46,face:1,z:-83,y:3.12,width:5.4,height:.82
});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function distanceToSegment(p,a,b){
 const dx=b.x-a.x,dz=b.z-a.z,m=dx*dx+dz*dz;
 const t=m?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/m)):0;
 return Math.hypot(p.x-(a.x+t*dx),p.z-(a.z+t*dz));
}
export function validateCassetteCastleV124(plan={
 fixtures:CASSETTE_FIXTURES_V124,lights:CASSETTE_LIGHTS_V124,sign:CASSETTE_SIGN_V124
},{portals=[],ceilings=[]}={}){
 const errors=[],ids=new Set(),room=MALL.rooms.find(r=>r.id==='cassette_castle');
 if(!room||Object.entries(CASSETTE_ROOM_V124).some(([k,v])=>room[k]!==v))
  errors.push('Canonical 17 × 17m music shop was changed');
 if(MALL.rooms.length!==41||MALL.evidence.length!==9)errors.push('Original story topology/evidence changed');
 const {fixtures=[],lights=[],sign}=plan||{};
 if(fixtures.length!==12||lights.length!==4||!sign)errors.push('Lost period fixtures or identity');
 const legacy=FURNISHINGS_V69.fixtures.filter(f=>f.room==='cassette_castle');
 if(legacy.length!==6)errors.push('Cassette Castle original six V69 pieces changed');
 const from={x:-29,z:-81.5},to={x:-42,z:-77.4};
 for(const f of fixtures){
  if(ids.has(f.id))errors.push('duplicate source rack '+f.id);ids.add(f.id);
  const src=source.get(f.kind),r=f.collisionRadius;
  if(!src||src.shortName==='podium'||src.path!==f.source||
   src.sha256!==f.sha256||src.targetHeight!==f.targetHeight||f.license!=='CC0-1.0')
   errors.push('unaudited or substituted 3D music-shop model '+f.id);
  if(!Number.isFinite(f.x+f.z+f.yaw)||!r||r<.5||r>1.2||
   f.x<=room.x1+r+.12||f.x>=room.x2-r-.12||
   f.z<=room.z1+r+.12||f.z>=room.z2-r-.12)
   errors.push('source fixture clips actual Cassette Castle masonry '+f.id);
  if(distanceToSegment(f,from,to)<r+.32)
   errors.push('Cassette Castle original entrance-to-register aisle blocked '+f.id);
  for(const p of portals.filter(p=>p.type==='doorway'&&[p.to,p.from].includes(room.id))){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(distanceToSegment(f,a,b)<=r+1.02)
    errors.push('CC0 shop rack blocks real 4.2m glass entry '+f.id);
  }
  for(const old of legacy.filter(x=>x.radius>0))
   if(distance(f,old)<=r+old.radius+.31)
    errors.push('music shop rack intersects original cashier/bookcase '+f.id+'/'+old.id);
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++)
  if(distance(fixtures[i],fixtures[j])<=
   fixtures[i].collisionRadius+fixtures[j].collisionRadius+.35)
   errors.push('shop browsing aisle too narrow '+fixtures[i].id+'/'+fixtures[j].id);
 for(const l of lights){
  if(ids.has(l.id))errors.push('duplicate licensed original ceiling fixture '+l.id);
  ids.add(l.id);
  if(l.room!=='cassette_castle'||l.model!==ANCHOR_FLUORESCENT_ASSET_V122.path||
   l.sha256!==ANCHOR_FLUORESCENT_ASSET_V122.sha256||
   l.license!=='CC0-1.0'||![0,.32,.62].includes(l.power)||
   l.x<=room.x1+1.4||l.x>=room.x2-1.4||
   l.z<=room.z1+1.4||l.z>=room.z2-1.4)
   errors.push('unsupported original source fluorescent '+l.id);
  if(ceilings.length){
   const ceiling=ceilings.filter(s=>s.room===l.room&&l.x>s.x1+1.1&&
    l.x<s.x2-1.1&&l.z>s.z1+1.1&&l.z<s.z2-1.1);
   if(ceiling.length!==1||
    Math.abs(ceiling[0].y-ceiling[0].thickness/2-5.21)>.02)
    errors.push('music-shop original CC0 light detached from 5.21m ceiling '+l.id);
  }
 }
 if(sign){
  if(sign.room!=='cassette_castle'||sign.wallX!==room.x1||sign.face!==1||
   sign.z-sign.width/2<=room.z1+1||sign.z+sign.width/2>=room.z2-1||
   sign.y-sign.height/2<2.7||sign.y+sign.height/2>4.5)
   errors.push('Cassette Castle interior logo not attached to source masonry');
 }
 return errors;
}
