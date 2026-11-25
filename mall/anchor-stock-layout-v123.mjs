/**
 * V123: deliberate source-grounded orphan merchandise and a small late-close
 * receiving cluster. NOT an arbitrary decorative scatter pass.
 * Supports are exact existing V121 tested CC0 display tables, not new
 * floating shelves or owner-private Builder placements.
 */
import {MALL} from './masterplan-v66.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {ORIGINAL_ANCHOR_FIXTURES_V121} from './anchor-layout-v121.mjs';
import {ANCHOR_STOCK_CANDIDATES_V123,validateAnchorStockSourcesV123} from './anchor-stock-sources-v123.mjs';

const sources=new Map(ANCHOR_STOCK_CANDIDATES_V123.map(a=>[a.key,a]));
const original=new Map(ORIGINAL_ANCHOR_FIXTURES_V121.map(f=>[f.id,f]));
const rooms=new Map(MALL.rooms.map(r=>[r.id,r]));
const item=(id,room,key,x,z,{support=null,radius=0,yaw=0}={})=>{
 const a=sources.get(key);
 if(!a)throw Error('Stock fixture requires original CC0 source '+key);
 return Object.freeze({
  id,room,source:key,model:a.path,sha256:a.sha256,license:a.license,
  targetHeight:a.targetHeight,x,z,yaw,support,collisionRadius:radius,
  category:support?'supported-stock':'grounded-original-stock'
 });
};
export const ORIGINAL_ANCHOR_STOCK_V123=Object.freeze([
 // Fallow's retained clearance and counter-top merchandise; the original
 // 4.2m shop doorway and central entry-to-register route remain empty.
 item('fallow_folded_knitwear','west_anchor','folded_stock_cube',-42.15,-64.7,{radius:.65}),
 item('fallow_last_clearance','west_anchor','promo_bin',-31.4,-63.5,{radius:.65}),
 item('fallow_carton_closed','west_anchor','stock_box_closed',-45,-70.7,{radius:.32}),
 item('fallow_carton_open','west_anchor','stock_box_open',-44.1,-70.7,{radius:.45}),
 item('fallow_north_catalogues','west_anchor','gift_books',-39.5,-54.7,{support:'fallow_display_n'}),
 item('fallow_south_returns','west_anchor','stock_box_open',-39.5,-66.4,{support:'fallow_display_s'}),
 item('fallow_north_gift_books','west_anchor','gift_books',-35.9,-54.7,{support:'fallow_display_island_n'}),
 item('fallow_south_display_cube','west_anchor','gift_books',-35.9,-66.4,{support:'fallow_display_island_s'}),
 // East Department's original housewares and returns layout, intentionally
 // less stocked than the west anchor. No toy-size giant shoe fixture.
 item('east_left_clearance','east_original_anchor','promo_bin',32.2,-49.6,{radius:.65}),
 item('east_return_knitwear','east_original_anchor','folded_stock_cube',42.5,-48.2,{radius:.65}),
 item('east_carton_closed','east_original_anchor','stock_box_closed',41.6,-59.6,{radius:.32}),
 item('east_north_gift_books','east_original_anchor','gift_books',35.8,-46.4,{support:'east_anchor_display_n'}),
 item('east_south_open_returns','east_original_anchor','stock_box_open',35.8,-57.8,{support:'east_anchor_display_s'})
]);

const gap=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function segmentDistance(p,a,b){
 const dx=b.x-a.x,dz=b.z-a.z,m=dx*dx+dz*dz;
 const t=m?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/m)):0;
 return Math.hypot(p.x-(a.x+t*dx),p.z-(a.z+t*dz));
}
export function validateAnchorStockLayoutV123(
 stock=ORIGINAL_ANCHOR_STOCK_V123,{portals=[]}={}
){
 const errors=[...validateAnchorStockSourcesV123()],ids=new Set();
 if(stock.length!==13)errors.push('V123 original 13-source stock arrangement is incomplete');
 for(const f of stock){
  if(ids.has(f.id))errors.push('duplicate period stock '+f.id);
  ids.add(f.id);
  const a=sources.get(f.source),r=rooms.get(f.room);
  if(!a||a.path!==f.model||a.sha256!==f.sha256||f.license!=='CC0-1.0')
   errors.push('unlicensed replacement stock '+f.id);
  if(!r||r.level!=='G'||!['west_anchor','east_original_anchor'].includes(f.room)){
   errors.push('source stock escaped canonical original department '+f.id);continue;
  }
  if(f.support){
   const base=original.get(f.support);
   if(!base||base.room!==f.room||
    !['table_large','table_medium'].includes(base.source)||
    Math.abs(f.x-base.x)>.001||Math.abs(f.z-base.z)>.001||
    f.collisionRadius!==0||f.targetHeight>.8)
    errors.push('stock has no exact full-size existing CC0 retail support '+f.id);
  }else{
   const radius=f.collisionRadius;
   if(!(radius>.2&&radius<.9&&f.x>r.x1+radius+.15&&f.x<r.x2-radius-.15&&
    f.z>r.z1+radius+.15&&f.z<r.z2-radius-.15))
    errors.push('ground stock clips 1979 room wall '+f.id);
   for(const p of portals.filter(p=>p.type==='doorway'&&[p.from,p.to].includes(f.room))){
    const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
    const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
    if(segmentDistance(f,a,b)<radius+1.0)
     errors.push('period stock blocks real 4.2m glazed store entry '+f.id);
   }
   const aisleZ=f.room==='west_anchor'?-60.5:-52;
   const a={x:f.room==='west_anchor'?-29:29,z:aisleZ};
   const b={x:f.room==='west_anchor'?-41:41,z:aisleZ};
   if(segmentDistance(f,a,b)<radius+.36)
    errors.push('period stock blocks canonical original store main aisle '+f.id);
   for(const base of ORIGINAL_ANCHOR_FIXTURES_V121.filter(x=>x.room===f.room))
    if(gap(f,base)<=radius+base.collisionRadius+.27)
     errors.push('late-close stock overlaps authentic source fixture '+f.id+'/'+base.id);
   for(const base of FURNISHINGS_V69.fixtures.filter(x=>x.room===f.room&&x.radius>0))
    if(gap(f,base)<=radius+base.radius+.27)
     errors.push('late-close stock overlaps protected legacy register/rack '+f.id+'/'+base.id);
  }
 }
 const floor=stock.filter(f=>!f.support);
 for(let i=0;i<floor.length;i++)for(let j=i+1;j<floor.length;j++){
  const a=floor[i],b=floor[j];
  if(a.room===b.room&&gap(a,b)<=a.collisionRadius+b.collisionRadius+.05)
   errors.push('late-close cartons/displays intersect '+a.id+'/'+b.id);
 }
 return errors;
}
