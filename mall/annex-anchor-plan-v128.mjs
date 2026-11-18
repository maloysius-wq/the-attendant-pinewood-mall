/** V128 exact 540m² original East Annex retail anchor.
 * All primary 3D furniture and lights reuse SHA-pinned local CC0 models.
 * Decorative stocked merchandise is original Pinewood artwork, never a
 * procedural substitute for a sourced shelf/counter/cabinet. */
import {MALL} from './masterplan-v66.mjs';
import {ORIGINAL_RETAIL_CANDIDATES_V121} from './anchor-retail-source-v121.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';

export const ANNEX_ANCHOR_ROOM_V128=Object.freeze({
 id:'annex_anchor',x1:65,x2:85,z1:-75,z2:-48,area:540,ceilingUnderside:7.61
});
const sources=new Map(ORIGINAL_RETAIL_CANDIDATES_V121.map(s=>[s.shortName,s]));
export const ANNEX_ANCHOR_COUNTER_V128=Object.freeze({
 path:'assets/vendor/runtime/ae14ac85cb3b895b/KSI_counter.glb',
 sha256:'cf11af690760b66c1a0d1b349269121d7de7afe5413f6fba11df2afa56524976',
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
 fixture('west_housewares','wall_bay','HOUSEWARES',66.5,-70.3,Math.PI/2,.86),
 fixture('west_clearance','wall_bay','CLEARANCE',66.5,-53.2,Math.PI/2,.86),
 fixture('south_bedding_1','wall_bay','BED LINENS',69,-73.3,0,.86),
 fixture('south_bedding_2','wall_bay','BED LINENS',73,-73.3,0,.86),
 fixture('south_bedding_3','wall_bay','PILLOW CASES',77,-73.3,0,.86),
 fixture('south_bedding_4','wall_bay','BLANKETS',81,-73.3,0,.86),
 fixture('east_gifts_1','wall_bay','GIFT SETS',83.6,-71,-Math.PI/2,.86),
 fixture('east_gifts_2','wall_bay','TABLEWARE',83.6,-66.5,-Math.PI/2,.86),
 fixture('east_gifts_3','wall_bay','CERAMICS',83.6,-62,-Math.PI/2,.86),
 fixture('east_gifts_4','wall_bay','BATH SETS',83.6,-57.5,-Math.PI/2,.86),
 fixture('east_gifts_5','wall_bay','HOUSEHOLD',83.6,-53,-Math.PI/2,.86),
 fixture('north_returns','wall_bay','RETURNS',68.5,-49.5,Math.PI,.86),
 fixture('north_stock','wall_bay','CLOSEOUT',82,-49.5,Math.PI,.86),
 fixture('middle_linen_1','wall_bay','TOWELS',70,-65,Math.PI,.86),
 fixture('middle_linen_2','wall_bay','TOWELS',77,-65,Math.PI,.86),
 fixture('middle_linen_3','wall_bay','HOMEWARE',70,-58,0,.86),
 fixture('middle_gifts','wall_bay','GIFT WRAP',80,-60,Math.PI,.86),
 fixture('bedding_table','table_large','SLEEP SETS',71,-69.2,0,1.15),
 fixture('gift_table','table_large','BOXED GIFTS',78,-69.2,0,1.15),
 fixture('home_table','table_medium','HOUSEHOLD',70.3,-54,0,1.10),
 fixture('bath_table','table_medium','BATH SETS',80,-55.8,0,1.10),
 fixture('clearance_spinner','spinner','MARKDOWNS',67.9,-66.5,0,.70),
 fixture('gift_spinner','spinner','ACCESSORIES',81,-63.3,0,.70),
 fixture('checkout','counter','SERVICE DESK',79.5,-52.1,Math.PI/2,1.65)
]);
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
 y:4.6,width:7.0,height:.95
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
 if(fixtures.length!==24||lights.length!==8||posters.length!==5||!identity)
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
  const r=f.collisionRadius;
  if(f.room!=='annex_anchor'||!Number.isFinite(f.x+f.z+f.yaw)||
   r<.65||r>1.7||
   f.x<=room.x1+r+.12||f.x>=room.x2-r-.12||
   f.z<=room.z1+r+.12||f.z>=room.z2-r-.12)
   issues.push('furniture clips real 1992 masonry '+f.id);
  for(const p of doorways){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at};
   const b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(segmentDistance(f,a,b)<=r+1.15)
    issues.push('source display closes original 4.2m employee aperture '+f.id);
  }
  for(const [a,b] of primaryRoutes)
   if(segmentDistance(f,a,b)<=r+.55)
    issues.push('licensed furniture closes continuous east-exit shopping aisle '+f.id);
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++){
  const a=fixtures[i],b=fixtures[j];
  if(dist(a,b)<=a.collisionRadius+b.collisionRadius+.36)
   issues.push('1997 Annex display aisles overlap '+a.id+'/'+b.id);
 }
 const oldCounter=FURNISHINGS_V69.fixtures.find(f=>f.id==='cassette_counter');
 if(!oldCounter||oldCounter.model!==ANNEX_ANCHOR_COUNTER_V128.path)
  issues.push('checkout is no longer genuine prelicensed Kenney CC0 counter');
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
