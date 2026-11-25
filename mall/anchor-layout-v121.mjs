/**
 * V121 measured original 1979 department-store fittings.
 * Every source GLB was independently loaded and rendered in the real
 * Chromium retail asset audition, not guessed from a thumbnail.
 * The 7.3m-wide feature display podium was REJECTED, never installed.
 */
import {MALL} from './masterplan-v66.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121,validateAnchorSourceV121} from './anchor-retail-source-v121.mjs';

const asset=new Map(ORIGINAL_RETAIL_CANDIDATES_V121.map(a=>[a.shortName,a]));
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
 fixture('fallow_wall_bay_n','west_anchor','wall_bay',-43.8,-49.4,Math.PI,0.86),
 fixture('fallow_wall_bay_s','west_anchor','wall_bay',-41.45,-49.4,Math.PI,0.86),
 fixture('fallow_display_n','west_anchor','table_large',-39.5,-54.7,0,1.15),
 fixture('fallow_display_s','west_anchor','table_large',-39.5,-66.4,0,1.15),
 fixture('fallow_haberdashery_spinner','west_anchor','spinner',-33.6,-50.6,0,0.7),
 fixture('fallow_clothing_rail','west_anchor','waterfall',-31.9,-68.6,0,0.84),
 fixture('fallow_north_shelf_1','west_anchor','wall_bay',-39.1,-49.4,Math.PI,0.86),
 fixture('fallow_north_shelf_2','west_anchor','wall_bay',-36.75,-49.4,Math.PI,0.86),
 fixture('fallow_south_shelf_1','west_anchor','wall_bay',-39,-71.6,0,0.86),
 fixture('fallow_south_shelf_2','west_anchor','wall_bay',-36.65,-71.6,0,0.86),
 fixture('fallow_south_shelf_3','west_anchor','wall_bay',-34.3,-71.6,0,0.86),
 fixture('fallow_west_shelf_n','west_anchor','wall_bay',-44.9,-57.2,Math.PI/2,0.86),
 fixture('fallow_display_island_n','west_anchor','table_large',-35.9,-54.7,0,1.15),
 fixture('fallow_display_island_s','west_anchor','table_large',-35.9,-66.4,0,1.15),
 fixture('fallow_spinner_mid_n','west_anchor','spinner',-34,-57.4,0,0.7),
 fixture('fallow_spinner_mid_s','west_anchor','spinner',-34.6,-63.6,0,0.7),
 fixture('fallow_waterfall_n','west_anchor','waterfall',-31.9,-54.7,0,0.84),
 fixture('east_anchor_wall_n','east_original_anchor','wall_bay',44.9,-51.1,-Math.PI/2,.86),
 fixture('east_anchor_wall_s','east_original_anchor','wall_bay',44.9,-55,-Math.PI/2,.86),
 fixture('east_anchor_display_n','east_original_anchor','table_medium',35.8,-46,0,1.10),
 fixture('east_anchor_display_s','east_original_anchor','table_medium',35.8,-58.3,0,1.10),
 fixture('east_anchor_spinner','east_original_anchor','spinner',41.8,-54.5,0,.70),
 fixture('east_anchor_rail','east_original_anchor','waterfall',39.2,-45.1,0,.84),
 fixture('east_north_shelf_1','east_original_anchor','wall_bay',33,-44.3,Math.PI,0.86),
 fixture('east_north_shelf_2','east_original_anchor','wall_bay',43.9,-44.3,Math.PI,0.86),
 fixture('east_south_shelf_1','east_original_anchor','wall_bay',31.5,-59.8,0,0.86),
 fixture('east_south_shelf_2','east_original_anchor','wall_bay',39.5,-59.8,0,0.86),
 fixture('east_spinner_gallery_n','east_original_anchor','spinner',34,-48.7,0,0.7),
 fixture('east_spinner_gallery_s','east_original_anchor','spinner',34,-55.5,0,0.7),
 fixture('east_waterfall_s','east_original_anchor','waterfall',32,-57,0,0.84)
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
 if(fixtures.length!==30)defects.push('expected 30 deliberately placed real department-store source GLBs');
 for(const f of fixtures){
  if(ids.has(f.id))defects.push('duplicate original retail fixture '+f.id);
  ids.add(f.id);
  const source=asset.get(f.source),room=rooms.get(f.room),r=f.collisionRadius;
  if(!source||source.shortName==='podium'||f.model!==source.path||f.sha256!==source.sha256)
   defects.push('unreviewed or oversized model inserted into original 1979 store '+f.id);
  if(!room||room.level!=='G'||!['west_anchor','east_original_anchor'].includes(f.room)){
   defects.push('fixture is not inside an original named 1979 anchor '+f.id);continue;
  }
  if(!(f.x>room.x1+r+.12&&f.x<room.x2-r-.12&&
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
  if(distToSegment(f,from,to)<=r+.35)
   defects.push('new display blocks main original anchor shopping lane '+f.id);
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j];
  if(a.room!==b.room)continue;
  if(distance(a,b)<=a.collisionRadius+b.collisionRadius+.5)
   defects.push('original store fixtures overlap or leave unwalkable aisle '+a.id+'/'+b.id);
 }
 return defects;
}
