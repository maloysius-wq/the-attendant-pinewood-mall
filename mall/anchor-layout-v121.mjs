/**
 * V121 measured original 1979 department-store fittings.
 * Every source GLB was independently loaded and rendered in the real
 * Chromium retail asset audition, not guessed from a thumbnail.
 * The 7.3m-wide feature display podium was REJECTED, never installed.
 */
import {MALL} from './masterplan-v66.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121,validateAnchorSourceV121} from './anchor-retail-source-v121.mjs';

import {FALLOWS_SOURCES_V160,anchorBoundsV160,anchorSegmentBlockedV160} from './fallows-sources-v160.mjs';
const asset=new Map([...ORIGINAL_RETAIL_CANDIDATES_V121,...FALLOWS_SOURCES_V160].map(a=>[a.shortName,a]));
const fixture=(id,room,source,x,z,yaw,collisionRadius)=>{
 const a=asset.get(source);
 if(!a)throw Error('Unknown tested original CC0 retail GLB '+source);
 return Object.freeze({
  id,room,source,model:a.path,sha256:a.sha256,license:'CC0-1.0',
  x,z,yaw,baseY:0,targetHeight:a.targetHeight,collisionRadius,
  kind:a.role,period:'1979-original-anchor'
 });
};

/** Position based on the REAL source x/z of each original 17m wide store.
 * Keep the center-front 4.2m actual glass threshold free, preserve V69
 * registers and cabinets and arrange aisle-connected display families.
 */
// V160 first Fallow's reflow: grouped perimeter runs, paired display islands,
// an unobstructed entrance spine and window-side accessory stations.
export const ORIGINAL_ANCHOR_FIXTURES_V121=Object.freeze([
 fixture('fallow_wall_bay_n','west_anchor','wall_cubbies',-44.25,-48.55,Math.PI,0.7),
 fixture('fallow_wall_bay_s','west_anchor','wall_cubbies',-42.75,-48.55,Math.PI,0.7),
 fixture('fallow_north_shelf_1','west_anchor','wall_cubbies',-41.25,-48.55,Math.PI,0.7),
 fixture('fallow_north_shelf_2','west_anchor','wall_cubbies',-39.75,-48.55,Math.PI,0.7),
 fixture('fallow_north_shelf_3','west_anchor','wall_cubbies',-38.25,-48.55,Math.PI,0.7),
 fixture('fallow_north_shelf_4','west_anchor','wall_cubbies',-36.75,-48.55,Math.PI,0.7),
 fixture('fallow_north_shelf_5','west_anchor','wall_cubbies',-35.25,-48.55,Math.PI,0.7),
 fixture('fallow_north_shelf_6','west_anchor','wall_cubbies',-33.75,-48.55,Math.PI,0.7),
 fixture('fallow_south_shelf_1','west_anchor','wall_cubbies',-39.3,-72.45,0,0.7),
 fixture('fallow_south_shelf_2','west_anchor','wall_cubbies',-37.8,-72.45,0,0.7),
 fixture('fallow_south_shelf_3','west_anchor','wall_cubbies',-36.3,-72.45,0,0.7),
 fixture('fallow_south_shelf_4','west_anchor','wall_cubbies',-34.8,-72.45,0,0.7),
 fixture('fallow_south_shelf_5','west_anchor','wall_cubbies',-33.3,-72.45,0,0.7),
 fixture('fallow_south_shelf_6','west_anchor','wall_cubbies',-31.8,-72.45,0,0.7),
 fixture('fallow_west_shelf_n','west_anchor','wall_cubbies',-45.45,-51,Math.PI/2,0.7),
 fixture('fallow_west_shelf_2','west_anchor','wall_cubbies',-45.45,-52.5,Math.PI/2,0.7),
 fixture('fallow_west_shelf_3','west_anchor','wall_cubbies',-45.45,-54,Math.PI/2,0.7),
 fixture('fallow_west_shelf_4','west_anchor','wall_cubbies',-45.45,-55.5,Math.PI/2,0.7),
 fixture('fallow_west_shelf_5','west_anchor','wall_cubbies',-45.45,-57,Math.PI/2,0.7),
 fixture('fallow_haberdashery_spinner','west_anchor','gondola',-33,-51.8,0,0.85),
 fixture('fallow_waterfall_n','west_anchor','gondola',-31.1,-55,Math.PI/2,0.85),
 fixture('fallow_spinner_mid_n','west_anchor','gondola',-34,-57.5,0,0.85),
 fixture('fallow_spinner_mid_s','west_anchor','gondola',-34.8,-63.6,0,0.85),
 fixture('fallow_clothing_rail','west_anchor','gondola',-31.5,-68.5,Math.PI/2,0.85),
 fixture('fallow_north_gondola_1','west_anchor','gondola',-42.4,-51.8,0,0.85),
 fixture('fallow_north_gondola_2','west_anchor','gondola',-39.4,-51.8,0,0.85),
 fixture('fallow_north_gondola_3','west_anchor','gondola',-36.4,-51.8,0,0.85),
 fixture('fallow_north_gondola_4','west_anchor','gondola',-42.4,-57.5,0,0.85),
 fixture('fallow_north_gondola_5','west_anchor','gondola',-39.8,-57.5,0,0.85),
 fixture('fallow_south_gondola_1','west_anchor','gondola',-39,-63.6,0,0.85),
 fixture('fallow_south_gondola_2','west_anchor','gondola',-38.6,-69.4,0,0.85),
 fixture('fallow_south_gondola_3','west_anchor','gondola',-35.5,-69.4,0,0.85),
 fixture('fallow_display_n','west_anchor','table_large',-39.5,-54.7,0,1.15),
 fixture('fallow_display_island_n','west_anchor','table_large',-35.9,-54.7,0,1.15),
 fixture('fallow_display_s','west_anchor','table_large',-39.5,-66.4,0,1.15),
 fixture('fallow_display_island_s','west_anchor','table_large',-35.9,-66.4,0,1.15),
 fixture('east_north_cubby_1','east_original_anchor','wall_cubbies',31.5,-43.55,Math.PI,0.7),
 fixture('east_north_cubby_2','east_original_anchor','wall_cubbies',33,-43.55,Math.PI,0.7),
 fixture('east_north_cubby_3','east_original_anchor','wall_cubbies',34.5,-43.55,Math.PI,0.7),
 fixture('east_north_cubby_4','east_original_anchor','wall_cubbies',36,-43.55,Math.PI,0.7),
 fixture('east_north_cubby_5','east_original_anchor','wall_cubbies',37.5,-43.55,Math.PI,0.7),
 fixture('east_north_cubby_6','east_original_anchor','wall_cubbies',39,-43.55,Math.PI,0.7),
 fixture('east_north_cubby_7','east_original_anchor','wall_cubbies',40.5,-43.55,Math.PI,0.7),
 fixture('east_rear_cubby_1','east_original_anchor','wall_cubbies',45.45,-44.8,-Math.PI/2,0.7),
 fixture('east_rear_cubby_2','east_original_anchor','wall_cubbies',45.45,-46.3,-Math.PI/2,0.7),
 fixture('east_rear_cubby_3','east_original_anchor','wall_cubbies',45.45,-47.8,-Math.PI/2,0.7),
 fixture('east_rear_cubby_4','east_original_anchor','wall_cubbies',45.45,-49.3,-Math.PI/2,0.7),
 fixture('east_rear_cubby_8','east_original_anchor','wall_cubbies',45.45,-50.9,-Math.PI/2,.7),
 fixture('east_rear_cubby_9','east_original_anchor','wall_cubbies',45.45,-52.5,-Math.PI/2,.7),
 fixture('east_rear_cubby_5','east_original_anchor','wall_cubbies',45.45,-55.2,-Math.PI/2,0.7),
 fixture('east_rear_cubby_6','east_original_anchor','wall_cubbies',45.45,-56.7,-Math.PI/2,0.7),
 fixture('east_rear_cubby_7','east_original_anchor','wall_cubbies',45.45,-58.2,-Math.PI/2,0.7),
 fixture('east_south_cubby_1','east_original_anchor','wall_cubbies',31.5,-60.45,0,0.7),
 fixture('east_south_cubby_2','east_original_anchor','wall_cubbies',33,-60.45,0,0.7),
 fixture('east_south_cubby_3','east_original_anchor','wall_cubbies',34.5,-60.45,0,0.7),
 fixture('east_south_cubby_4','east_original_anchor','wall_cubbies',36,-60.45,0,0.7),
 fixture('east_south_cubby_5','east_original_anchor','wall_cubbies',37.5,-60.45,0,0.7),
 fixture('east_south_cubby_6','east_original_anchor','wall_cubbies',39,-60.45,0,0.7),
 fixture('east_clearance_gondola_1','east_original_anchor','gondola',31.2,-46.6,Math.PI/2,0.85),
 fixture('east_clearance_gondola_2','east_original_anchor','gondola',34.4,-50.05,0,0.85),
 fixture('east_clearance_gondola_3','east_original_anchor','gondola',38,-50.05,0,0.85),
 fixture('east_clearance_gondola_4','east_original_anchor','gondola',34.5,-53.95,0,0.85),
 fixture('east_clearance_gondola_5','east_original_anchor','gondola',38.3,-53.95,0,0.85),
 fixture('east_clearance_gondola_6','east_original_anchor','gondola',31.5,-57.3,Math.PI/2,0.85),
 fixture('east_clearance_gondola_7','east_original_anchor','gondola',41.6,-50.05,0,.85),
 fixture('east_clearance_gondola_8','east_original_anchor','gondola',41.4,-53.95,0,.85),
 fixture('east_anchor_display_n','east_original_anchor','table_large',35.8,-46.4,0,1.15),
 fixture('east_clearance_table_n','east_original_anchor','table_large',39.3,-46.4,0,1.15),
 fixture('east_anchor_display_s','east_original_anchor','table_large',35.8,-57.8,0,1.15),
 fixture('east_returns_table_s','east_original_anchor','table_large',39.3,-57.8,0,1.15)
]);

const rooms=new Map(MALL.rooms.map(r=>[r.id,r]));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const near=(a,b)=>Math.abs(a-b)<.005;
const distToSegment=(p,a,b)=>{
 const dx=b.x-a.x,dz=b.z-a.z,n=dx*dx+dz*dz;
 const t=n?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/n)):0;
 return Math.hypot(p.x-(a.x+t*dx),p.z-(a.z+t*dz));
};
export function validateAnchorLayoutV121(fixtures=ORIGINAL_ANCHOR_FIXTURES_V121,{portals=[]}={}){
 const defects=[...validateAnchorSourceV121()],ids=new Set();
 if(fixtures.length!==70||fixtures.filter(f=>f.room==='west_anchor').length!==36||fixtures.filter(f=>f.room==='east_original_anchor').length!==34)defects.push('original department-store authored fixture set is incomplete');
 for(const f of fixtures){
  if(ids.has(f.id))defects.push('duplicate original retail fixture '+f.id);
  ids.add(f.id);
  const source=asset.get(f.source),room=rooms.get(f.room),r=f.collisionRadius;
  if(!source||source.shortName==='podium'||f.model!==source.path||f.sha256!==source.sha256)
   defects.push('unreviewed or oversized model inserted into original 1979 store '+f.id);
  if(!room||room.level!=='G'||!['west_anchor','east_original_anchor'].includes(f.room)){
   defects.push('fixture is not inside an original named 1979 anchor '+f.id);continue;
  }
  const exact=['west_anchor','east_original_anchor'].includes(f.room),b=anchorBoundsV160(f);
  if(exact?!(b.minX>room.x1+.12&&b.maxX<room.x2-.12&&b.minZ>room.z1+.12&&b.maxZ<room.z2-.12):!(f.x>room.x1+r+.12&&f.x<room.x2-r-.12&&
   f.z>room.z1+r+.12&&f.z<room.z2-r-.12))
   defects.push('store item clips actual source room wall '+f.id);
  if(f.baseY!==0||f.targetHeight<=.7||f.targetHeight>3)
   defects.push('floating or unbelievable original shop fitting '+f.id);
  // A 1979 west/east anchor has its only public door on the gallery-side
  // x=-29 or 29. Keep at least 1.1m+physical extent off that threshold.
  for(const p of portals.filter(p=>p.type==='doorway'&&[p.to,p.from].includes(f.room))){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(distToSegment(f,a,b)<=r+1.1)defects.push('full-size item closes original glass shop entry '+f.id);
  }
  // The actual middle shopping lane must lead from the center of the
  // 4.2m public storefront to the legacy service register, unobstructed.
  const z=f.room==='west_anchor'?-60.5:-52;
  const from={x:f.room==='west_anchor'?-29:29,z};
  const to={x:f.room==='west_anchor'?-41:41,z};
  if(exact?anchorSegmentBlockedV160(f,from,to,1.05):distToSegment(f,from,to)<=r+.35)
   defects.push('new display blocks main original anchor shopping lane '+f.id);
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j];
  if(a.room!==b.room)continue;
  const p=anchorBoundsV160(a),q=anchorBoundsV160(b);
  if(['west_anchor','east_original_anchor'].includes(a.room)?(p.minX<q.maxX+.025&&p.maxX>q.minX-.025&&p.minZ<q.maxZ+.025&&p.maxZ>q.minZ-.025):distance(a,b)<=a.collisionRadius+b.collisionRadius+.5)
   defects.push('original store fixtures overlap or leave unwalkable aisle '+a.id+'/'+b.id);
 }
 return defects;
}
