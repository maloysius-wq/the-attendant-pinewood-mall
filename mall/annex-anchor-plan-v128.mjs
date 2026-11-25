/** V128 exact 540m² original East Annex retail anchor.
 * All primary 3D furniture and lights reuse SHA-pinned local CC0 models.
 * Decorative stocked merchandise is original Pinewood artwork, never a
 * procedural substitute for a sourced shelf/counter/cabinet. */
import {MALL} from './masterplan-v66.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from './anchor-retail-source-v121.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';
import {FALLOWS_SOURCES_V160,FALLOWS_SOURCE_DIMENSIONS_V160} from './fallows-sources-v160.mjs';

export const ANNEX_ANCHOR_ROOM_V128=Object.freeze({
 id:'annex_anchor',x1:65,x2:85,z1:-75,z2:-48,area:540,ceilingUnderside:7.61
});
const sources=new Map([...ORIGINAL_RETAIL_CANDIDATES_V121,...FALLOWS_SOURCES_V160].map(s=>[s.shortName,s]));
export const ANNEX_ANCHOR_COUNTER_V128=Object.freeze({
 path:'assets/vendor/runtime/47206cda3d12810c/desk.glb',
 sha256:'0164fe828f028b321730fb8c74502e353583f751be74da1682d42fff7d3c5a42',
 license:'CC0-1.0',targetHeight:.88
});
const fixture=(id,kind,section,x,z,yaw,radius)=>{
 const s=kind==='counter'?ANNEX_ANCHOR_COUNTER_V128:sources.get(kind);
 if(!s||kind==='podium')throw Error('Unlicensed or retired Annex anchor source '+kind);
 return Object.freeze({id,room:'annex_anchor',kind,section,x,z,yaw,
  collisionRadius:radius,source:s.path,sha256:s.sha256,
  targetHeight:s.targetHeight,license:'CC0-1.0'});
};
/** Four distinct shopping departments, real aisle families, a cashier, and
 * the only two original 4.2m doorways kept free. The central 2m exit route
 * is the elbow from (65,-61.5) to (75,-61.5) to (75,-48). */
export const ANNEX_ANCHOR_FIXTURES_V128=Object.freeze([
 fixture('south_linen_1','wall_cubbies','BED LINENS',66.75,-74.45,0,0.7),
 fixture('south_linen_2','wall_cubbies','BED LINENS',68.25,-74.45,0,0.7),
 fixture('south_linen_3','wall_cubbies','BED LINENS',69.75,-74.45,0,0.7),
 fixture('south_linen_4','wall_cubbies','BED LINENS',71.25,-74.45,0,0.7),
 fixture('south_linen_5','wall_cubbies','BED LINENS',72.75,-74.45,0,0.7),
 fixture('south_linen_6','wall_cubbies','BED LINENS',74.25,-74.45,0,0.7),
 fixture('south_linen_7','wall_cubbies','TABLEWARE',75.75,-74.45,0,0.7),
 fixture('south_linen_8','wall_cubbies','TABLEWARE',77.25,-74.45,0,0.7),
 fixture('south_linen_9','wall_cubbies','TABLEWARE',78.75,-74.45,0,0.7),
 fixture('south_linen_10','wall_cubbies','TABLEWARE',80.25,-74.45,0,0.7),
 fixture('south_linen_11','wall_cubbies','TABLEWARE',81.75,-74.45,0,0.7),
 fixture('south_linen_12','wall_cubbies','TABLEWARE',83.25,-74.45,0,0.7),
 fixture('east_wall_1','wall_cubbies','KITCHENWARE',84.45,-73.25,-1.5707963267948966,0.7),
 fixture('east_wall_2','wall_cubbies','KITCHENWARE',84.45,-71.75,-1.5707963267948966,0.7),
 fixture('east_wall_3','wall_cubbies','KITCHENWARE',84.45,-70.25,-1.5707963267948966,0.7),
 fixture('east_wall_4','wall_cubbies','KITCHENWARE',84.45,-68.75,-1.5707963267948966,0.7),
 fixture('east_wall_5','wall_cubbies','KITCHENWARE',84.45,-67.25,-1.5707963267948966,0.7),
 fixture('east_wall_6','wall_cubbies','GIFTS',84.45,-65.75,-1.5707963267948966,0.7),
 fixture('east_wall_7','wall_cubbies','GIFTS',84.45,-64.25,-1.5707963267948966,0.7),
 fixture('east_wall_8','wall_cubbies','GIFTS',84.45,-62.75,-1.5707963267948966,0.7),
 fixture('east_wall_9','wall_cubbies','GIFTS',84.45,-61.25,-1.5707963267948966,0.7),
 fixture('east_wall_10','wall_cubbies','GIFTS',84.45,-59.75,-1.5707963267948966,0.7),
 fixture('east_wall_11','wall_cubbies','BATH LINENS',84.45,-58.25,-1.5707963267948966,0.7),
 fixture('east_wall_12','wall_cubbies','BATH LINENS',84.45,-56.75,-1.5707963267948966,0.7),
 fixture('east_wall_13','wall_cubbies','BATH LINENS',84.45,-55.25,-1.5707963267948966,0.7),
 fixture('east_wall_14','wall_cubbies','BATH LINENS',84.45,-53.75,-1.5707963267948966,0.7),
 fixture('east_wall_15','wall_cubbies','BATH LINENS',84.45,-52.25,-1.5707963267948966,0.7),
 fixture('east_wall_16','wall_cubbies','BATH LINENS',84.45,-50.75,-1.5707963267948966,0.7),
 fixture('west_south_1','wall_cubbies','BEDDING',65.55,-73.25,1.5707963267948966,0.7),
 fixture('west_south_2','wall_cubbies','BEDDING',65.55,-71.75,1.5707963267948966,0.7),
 fixture('west_south_3','wall_cubbies','BEDDING',65.55,-70.25,1.5707963267948966,0.7),
 fixture('west_south_4','wall_cubbies','BEDDING',65.55,-68.75,1.5707963267948966,0.7),
 fixture('west_south_5','wall_cubbies','BEDDING',65.55,-67.25,1.5707963267948966,0.7),
 fixture('west_south_6','wall_cubbies','BEDDING',65.55,-65.75,1.5707963267948966,0.7),
 fixture('west_north_1','wall_cubbies','HOUSEHOLD',65.55,-57.25,1.5707963267948966,0.7),
 fixture('west_north_2','wall_cubbies','HOUSEHOLD',65.55,-55.75,1.5707963267948966,0.7),
 fixture('west_north_3','wall_cubbies','HOUSEHOLD',65.55,-54.25,1.5707963267948966,0.7),
 fixture('west_north_4','wall_cubbies','HOUSEHOLD',65.55,-52.75,1.5707963267948966,0.7),
 fixture('west_north_5','wall_cubbies','HOUSEHOLD',65.55,-51.25,1.5707963267948966,0.7),
 fixture('west_north_6','wall_cubbies','HOUSEHOLD',65.55,-49.75,1.5707963267948966,0.7),
 fixture('north_sale_1','wall_cubbies','CLEARANCE',67,-48.55,3.141592653589793,0.7),
 fixture('north_sale_2','wall_cubbies','CLEARANCE',68.5,-48.55,3.141592653589793,0.7),
 fixture('north_sale_3','wall_cubbies','CLEARANCE',70,-48.55,3.141592653589793,0.7),
 fixture('north_sale_4','wall_cubbies','CLEARANCE',71.5,-48.55,3.141592653589793,0.7),
 fixture('north_bath_1','wall_cubbies','BATH SETS',78.5,-48.55,3.141592653589793,0.7),
 fixture('north_bath_2','wall_cubbies','BATH SETS',80,-48.55,3.141592653589793,0.7),
 fixture('north_bath_3','wall_cubbies','BATH SETS',81.5,-48.55,3.141592653589793,0.7),
 fixture('north_bath_4','wall_cubbies','BATH SETS',83,-48.55,3.141592653589793,0.7),
 fixture('northstar_gondola_49','gondola','BEDDING',69,-71.5,0,0.85),
 fixture('northstar_gondola_50','gondola','BEDDING',73.1,-71.5,0,0.85),
 fixture('northstar_gondola_51','gondola','BED LINENS',69,-66.5,0,0.85),
 fixture('northstar_gondola_52','gondola','BED LINENS',73.1,-66.5,0,0.85),
 fixture('northstar_gondola_53','gondola','TOWELS',69,-64,0,0.85),
 fixture('northstar_gondola_54','gondola','TOWELS',73.1,-64,0,0.85),
 fixture('northstar_gondola_55','gondola','KITCHENWARE',78,-71.5,0,0.85),
 fixture('northstar_gondola_56','gondola','KITCHENWARE',81.4,-71.5,0,0.85),
 fixture('northstar_gondola_57','gondola','GIFTS',78,-66.5,0,0.85),
 fixture('northstar_gondola_58','gondola','GIFTS',81.4,-66.5,0,0.85),
 fixture('northstar_gondola_59','gondola','TABLEWARE',78,-64,0,0.85),
 fixture('northstar_gondola_60','gondola','TABLEWARE',81.4,-64,0,0.85),
 fixture('northstar_gondola_61','gondola','HOUSEHOLD',68.5,-58.9,0,0.85),
 fixture('northstar_gondola_62','gondola','HOUSEHOLD',71.7,-58.9,0,0.85),
 fixture('northstar_gondola_63','gondola','CLEARANCE',68.5,-55.9,0,0.85),
 fixture('northstar_gondola_64','gondola','CLEARANCE',71.7,-55.9,0,0.85),
 fixture('northstar_gondola_65','gondola','HOUSEHOLD',68.5,-52.9,0,0.85),
 fixture('northstar_gondola_66','gondola','HOUSEHOLD',71.7,-52.9,0,0.85),
 fixture('northstar_gondola_67','gondola','BATH SETS',78.5,-58.9,0,0.85),
 fixture('northstar_gondola_68','gondola','BATH SETS',81.7,-58.9,0,0.85),
 fixture('northstar_gondola_69','gondola','BATH LINENS',78.5,-55.9,0,0.85),
 fixture('northstar_gondola_70','gondola','BATH LINENS',81.7,-55.9,0,0.85),
 fixture('bedding_table','table_large','SLEEP SETS',71,-69.2,0,1.15),
 fixture('gift_table','table_large','BOXED GIFTS',79.7,-69.2,0,1.15),
 fixture('home_table','table_large','HOUSEHOLD',69.8,-50.6,0,1.15),
 fixture('bath_table','table_large','BATH SETS',79.6,-61.2,0,1.15),
 fixture('checkout','counter','SERVICE DESK',79.5,-52.1,1.5707963267948966,1.35)
]);
export const NORTHSTAR_REGISTER_V162=Object.freeze({path:'assets/vendor/runtime/6aeac44b7c9c0f17/cash-register.glb',sha256:'51d57ddbc623921a54782c40add49664072b192d66b0fa7c16f18f0fb0185c8f',license:'CC0-1.0',targetHeight:.27});
export function northstarBoundsV162(f,pad=.09){
 const s=f.kind==='counter'?[1.681,.88,.898]:FALLOWS_SOURCE_DIMENSIONS_V160[f.kind];
 if(!s)throw Error('Unmeasured Northstar source '+f.kind);
 const c=Math.abs(Math.cos(f.yaw)),n=Math.abs(Math.sin(f.yaw));
 const x=(s[0]*c+s[2]*n)/2+pad,z=(s[0]*n+s[2]*c)/2+pad;
 return {minX:f.x-x,maxX:f.x+x,minZ:f.z-z,maxZ:f.z+z};
}
export function northstarSegmentBlockedV162(f,from,to,pad=.09){
 const b=northstarBoundsV162(f,pad);let low=0,high=1;
 for(const [p,d,min,max] of [[from.x,to.x-from.x,b.minX,b.maxX],[from.z,to.z-from.z,b.minZ,b.maxZ]]){
  if(Math.abs(d)<1e-9){if(p<=min||p>=max)return false;continue}
  const a=(min-p)/d,c=(max-p)/d;low=Math.max(low,Math.min(a,c));high=Math.min(high,Math.max(a,c));if(low>=high)return false;
 }return low<high;
}
const lamp=(id,x,z,power)=>Object.freeze({id,room:'annex_anchor',x,z,power,
 model:ANCHOR_FLUORESCENT_ASSET_V122.path,sha256:ANCHOR_FLUORESCENT_ASSET_V122.sha256,
 license:'CC0-1.0'});
export const ANNEX_ANCHOR_LIGHTS_V128=Object.freeze([
 lamp('south_west',70,-71,.72),lamp('south_east',79,-71,.47),
 lamp('center_west',70,-65,0),lamp('center_east',79,-65,.53),
 lamp('north_west',70,-58,.35),lamp('north_east',79,-58,0),
 lamp('exit_west',70,-52,.48),lamp('exit_east',79,-52,.25)
]);
export const ANNEX_ANCHOR_IDENTITY_V128=Object.freeze({
 id:'northstar_original_sign',room:'annex_anchor',name:'NORTHSTAR HOME',
 subtitle:'LINENS  ·  HOUSEWARES  ·  GIFTS',wallX:85,face:-1,z:-63,
 y:4.6,width:7.0,height:1.329375
});
export const ANNEX_ANCHOR_POSTERS_V128=Object.freeze([
 {id:'linen_sale',wall:'south',x:69,z:-74.84,title:'AUTUMN LINENS',subtitle:'REDUCED IN 1997',bg:'#384949'},
 {id:'holiday_home',wall:'south',x:75,z:-74.84,title:'A HOUSE FOR ALL',subtitle:'SEASONAL HOME COLLECTION',bg:'#51403e'},
 {id:'northstar_1997',wall:'south',x:81,z:-74.84,title:'NORTHSTAR HOME',subtitle:'FINAL MARKDOWNS',bg:'#3c483c'},
 {id:'fresh_start',wall:'east',x:84.84,z:-71,title:'FRESH START',subtitle:'PINEWOOD EXCLUSIVE',bg:'#514734'},
 {id:'winter_goods',wall:'east',x:84.84,z:-54,title:'WINTER GOODS',subtitle:'CLEARANCE IN STORE',bg:'#3c4154'}
].map(p=>Object.freeze({...p,originalArtwork:true})));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const segmentDistance=(p,a,b)=>{
 const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz;
 const t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/l)):0;
 return Math.hypot(p.x-a.x-t*dx,p.z-a.z-t*dz);
};
const primaryRoutes=[
 [{x:65,z:-61.5},{x:75,z:-61.5}],
 [{x:75,z:-61.5},{x:75,z:-48}]
];
export function validateAnnexAnchorV128(plan={
 fixtures:ANNEX_ANCHOR_FIXTURES_V128,lights:ANNEX_ANCHOR_LIGHTS_V128,
 identity:ANNEX_ANCHOR_IDENTITY_V128,posters:ANNEX_ANCHOR_POSTERS_V128
},{portals=[],ceilings=[]}={}){
 const issues=[],ids=new Set(),room=MALL.rooms.find(r=>r.id==='annex_anchor');
 if(!room||Object.entries(ANNEX_ANCHOR_ROOM_V128).some(([k,v])=>k==='area'||k==='ceilingUnderside'?false:room[k]!==v)||
  (room.x2-room.x1)*(room.z2-room.z1)!==540||room.kind!=='retail')
  issues.push('V128 canonical 540m² East Annex anchor was altered');
 if(MALL.rooms.length!==41||MALL.evidence.length!==9)
  issues.push('original rooms or nine evidence markers changed');
 const {fixtures=[],lights=[],identity,posters=[]}=plan||{};
 if(fixtures.length!==75||lights.length!==8||posters.length!==5||!identity)
  issues.push('V128 required genuine retail scene content missing');
 const doorways=portals.filter(p=>p.type==='doorway'&&[p.from,p.to].includes('annex_anchor'));
 if(portals.length&&doorways.length!==2)
  issues.push('lost canonical Annex anchor to staff or exit doorway');
 if(doorways.length===2&&!doorways.some(p=>p.axis==='x'&&p.at===65)||
  doorways.length===2&&!doorways.some(p=>p.axis==='z'&&p.at===-48))
  issues.push('Annex anchor two actual 4.2m doorways moved');
 for(const f of fixtures){
  if(ids.has(f.id))issues.push('duplicate retail object '+f.id);ids.add(f.id);
  const src=f.kind==='counter'?ANNEX_ANCHOR_COUNTER_V128:sources.get(f.kind);
  if(!src||src.path!==f.source||src.sha256!==f.sha256||
   f.license!=='CC0-1.0'||src.targetHeight!==f.targetHeight)
   issues.push('unverified original CC0 source fixture '+f.id);
  const r=f.collisionRadius,b=northstarBoundsV162(f);
  if(f.room!=='annex_anchor'||!Number.isFinite(f.x+f.z+f.yaw)||
   r<.65||r>1.7||
   b.minX<=room.x1+.12||b.maxX>=room.x2-.12||
   b.minZ<=room.z1+.12||b.maxZ>=room.z2-.12)
   issues.push('furniture clips real 1992 masonry '+f.id);
  for(const p of doorways){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(northstarSegmentBlockedV162(f,a,b,1.15))
    issues.push('source display closes original 4.2m employee aperture '+f.id);
  }
  for(const [a,b] of primaryRoutes)
   if(northstarSegmentBlockedV162(f,a,b,1.05))
    issues.push('licensed furniture closes continuous east-exit shopping aisle '+f.id);
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j];
  const p=northstarBoundsV162(a),q=northstarBoundsV162(b);
  if(p.minX<q.maxX+.025&&p.maxX>q.minX-.025&&p.minZ<q.maxZ+.025&&p.maxZ>q.minZ-.025)
   issues.push('1997 Annex display aisles overlap '+a.id+'/'+b.id);
 }

 for(const l of lights){
  if(ids.has(l.id))issues.push('duplicate Annex source lamp '+l.id);ids.add(l.id);
  if(l.room!=='annex_anchor'||l.model!==ANCHOR_FLUORESCENT_ASSET_V122.path||
   l.sha256!==ANCHOR_FLUORESCENT_ASSET_V122.sha256||l.license!=='CC0-1.0'||
   l.power<0||l.power>1||l.x<=room.x1+1.4||l.x>=room.x2-1.4||
   l.z<=room.z1+1.4||l.z>=room.z2-1.4)
   issues.push('unsupported original source Annex lamp '+l.id);
  if(ceilings.length){
   const matches=ceilings.filter(c=>c.room===l.room&&
    l.x>c.x1+1.1&&l.x<c.x2-1.1&&l.z>c.z1+1.1&&l.z<c.z2-1.1);
   if(matches.length!==1||
    Math.abs(matches[0].y-matches[0].thickness/2-ANNEX_ANCHOR_ROOM_V128.ceilingUnderside)>.02)
    issues.push('Annex lamp is not mounted to original 7.61m soffit '+l.id);
  }
 }
 if(!lights.some(l=>l.power===0)||!lights.some(l=>l.power>.6))
  issues.push('abandoned Annex cannot have uniform working lights');
 if(!identity||identity.wallX!==85||identity.face!==-1||
  identity.z-identity.width/2<=room.z1+1||identity.z+identity.width/2>=room.z2-1||
  identity.y-identity.height/2<3.5||identity.y+identity.height/2>5.5)
  issues.push('original identity not on actual east shop masonry');
 for(const p of posters){
  if(ids.has(p.id))issues.push('duplicate original retail poster '+p.id);ids.add(p.id);
  if(!p.originalArtwork||!p.title||!p.subtitle||
   (p.wall==='south'&&p.z!==-74.84)||
   (p.wall==='east'&&p.x!==84.84)||!['east','south'].includes(p.wall))
   issues.push('poster lacks period original wall support '+p.id);
 }
 return issues;
}
