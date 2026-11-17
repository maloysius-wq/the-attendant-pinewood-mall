/** V126. The actual original 17 x 17m 1979 Sunburst Arcade, abandoned 1997.
 * Uses the already-vendored Token Gesture CC0 real-metre arcade model pack.
 * 17 existing V30 source mesh names have a prior independent geometry audit.
 * All cabinet titles and printed game advertisements below are Pinewood fiction.
 */
import {MALL} from './masterplan-v66.mjs';
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {ANCHOR_FLUORESCENT_ASSET_V122} from './anchor-identity-plan-v122.mjs';

export const SUNBURST_ROOM_V126=Object.freeze({id:'sunburst_arcade',x1:-46,x2:-29,z1:-107,z2:-90});
export const SUNBURST_PACK_V126=Object.freeze({
 path:'assets/vendor/arcade-v30/token_gesture/pack.glb',
 sha256:'52d71e90341d89e628330c65716669c46a110b6a6cadf96b28c5477d9865201e',
 license:'CC0-1.0',scale:'1 real metre per Blender unit'
});
// Source: diagnostics/arcade-v30-geometry.json, extracted from genuine
// original GLB. Dimensions in metres, not guessed proportions.
const sourceSizes=Object.freeze({
 arcade_upright_alpha:[.72,1.85,.9461],
 arcade_upright_beta:[.94,1.85,.9672],
 arcade_upright_gamma:[.68,1.95,.9461],
 pinball:[.596,1.285,1.346],
 arcade_cocktail:[.75,.756,.89],
 driving_cab:[.76,1.59,1.3388],
 token_changer:[.55,1.475,.385],
 dance_stage:[.98,1.89,1.28],
 skee_ball:[.70,2.05,2.616],
 ticket_eater:[.40,1.115,.42],
 prize_wall:[1.2,1.88,.42],
 claw_machine:[.72,1.9,.83]
});
export const SUNBURST_SOURCE_SIZES_V126=sourceSizes;
const fixture=(id,node,title,x,z,yaw=0)=>{
 const size=sourceSizes[node];
 if(!size)throw Error('V126 refused unmeasured real CC0 arcade machine '+node);
 // True source-footprint enclosing radius plus 0.10m clearance.
 const collisionRadius=Math.ceil((Math.hypot(size[0],size[2])/2+.1)*100)/100;
 return Object.freeze({id,room:'sunburst_arcade',node,title,x,z,yaw,
  source:SUNBURST_PACK_V126.path,sha256:SUNBURST_PACK_V126.sha256,
  license:'CC0-1.0',sourceSize:size,collisionRadius,period:'1979–1997'});
};
/** Deliberate departments, not randomly scattered props:
 * north wall cabinet bank; west pinball/prize wall; central cockpit/cocktail
 * games; southern high-score and skee-ball corner. Original four V69 pieces
 * and two original physical-shell machines are not moved.
 */
export const SUNBURST_FIXTURES_V126=Object.freeze([
 fixture('wall_claw','claw_machine','LITTLE COMET',-44.4,-91.62),
 fixture('cab_stellar','arcade_upright_alpha','STELLAR RUSH',-41,-91.65),
 fixture('cab_cinder','arcade_upright_beta','CINDER DRIVE',-38.65,-91.65),
 fixture('cab_midnight','arcade_upright_gamma','MIDNIGHT ORBIT',-36.15,-91.65),
 fixture('cab_tide','arcade_upright_alpha','TIDAL SHOCK',-33.8,-91.65),
 fixture('cab_meteor','arcade_upright_beta','METEOR RALLY',-31.35,-91.65),
 fixture('pinball_west','pinball','LAST QUARTER',-44.62,-97.1,Math.PI/2),
 fixture('upright_west','arcade_upright_gamma','VOID RUNNER',-44.62,-100,Math.PI/2),
 fixture('cocktail_chess','arcade_cocktail','BYTE DUEL',-40,-94.65),
 fixture('drive_duo','driving_cab','COASTLINE 97',-37.35,-94.65),
 fixture('pinball_east','pinball','GHOST LIGHTS',-33.5,-94.75),
 fixture('coin_machine','token_changer','TOKEN EXCHANGE',-30.75,-93.9),
 fixture('dance_stage','dance_stage','STEP CIRCUIT',-36.9,-101.45),
 fixture('skee_ball','skee_ball','GOLDEN ROLL',-39.4,-99.9),
 fixture('ticket_eater','ticket_eater','TICKET REDEMPTION',-30.9,-102.1),
 fixture('prize_wall','prize_wall','PRIZE COUNTER',-44.45,-103,Math.PI/2),
 fixture('back_upright','arcade_upright_beta','SHADOW CIRCUIT',-42.1,-103.2),
 fixture('front_upright','arcade_upright_alpha','COSMIC PILOT',-31.3,-96.5)
]);
const light=(id,x,z,power)=>Object.freeze({id,room:'sunburst_arcade',
 x,z,power,model:ANCHOR_FLUORESCENT_ASSET_V122.path,
 sha256:ANCHOR_FLUORESCENT_ASSET_V122.sha256,license:'CC0-1.0'});
export const SUNBURST_LIGHTS_V126=Object.freeze([
 light('front_late',-35,-94.1,.32),
 light('north_dead',-41,-94.1,0),
 light('back_late',-35,-102.8,.21),
 light('west_dead',-41,-102.8,0)
]);
export const SUNBURST_SIGN_V126=Object.freeze({id:'sunburst_wall_identity',
 title:'SUNBURST ARCADE',subtitle:'TOKENS  ·  GAMES  ·  PRIZES',
 wallX:-46,face:1,z:-94.5,y:3.52,width:5.6,height:.9,originalArtwork:true});
export const SUNBURST_POSTERS_V126=Object.freeze([
 {id:'high_score',wall:'north',x:-35.0,z:-90.14,title:'THE HIGH SCORE CLUB',subtitle:'ONE MORE GAME',ink:'#ddb96b'},
 {id:'galaxy_strike',wall:'north',x:-41.2,z:-90.14,title:'GALAXY STRIKE',subtitle:'TWO PLAYER CHALLENGE',ink:'#9bc5d0'},
 {id:'token_frenzy',wall:'south',x:-44,z:-106.86,title:'TOKEN FRENZY',subtitle:'25 CENTS TO PLAY',ink:'#d4a4a4'},
 {id:'prize_vault',wall:'south',x:-31.2,z:-106.86,title:'PRIZE VAULT',subtitle:'REDEEM YOUR TICKETS',ink:'#a5bb8b'},
 {id:'last_quarter',wall:'west',x:-45.85,z:-100,title:'LAST QUARTER',subtitle:'1997 CHAMPIONSHIP',ink:'#c7aadd'}
].map(p=>Object.freeze({...p,originalArtwork:true})));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function segmentDistance(p,a,b){
 const dx=b.x-a.x,dz=b.z-a.z,d=dx*dx+dz*dz;
 const t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/d)):0;
 return Math.hypot(p.x-(a.x+t*dx),p.z-(a.z+t*dz));
}
export function validateSunburstArcadeV126(plan={
 fixtures:SUNBURST_FIXTURES_V126,lights:SUNBURST_LIGHTS_V126,
 sign:SUNBURST_SIGN_V126,posters:SUNBURST_POSTERS_V126
},{portals=[],ceilings=[]}={}){
 const errors=[],seen=new Set(),room=MALL.rooms.find(r=>r.id==='sunburst_arcade');
 if(!room||Object.entries(SUNBURST_ROOM_V126).some(([k,v])=>room[k]!==v))
  errors.push('Canonical original 17x17m Sunburst Arcade room changed');
 if(MALL.rooms.length!==41||MALL.evidence.length!==9)
  errors.push('Original six-chapter narrative topology changed');
 const existing=FURNISHINGS_V69.fixtures.filter(f=>f.room==='sunburst_arcade');
 if(existing.length!==4||!['arcade_claw','arcade_air_hockey','arcade_basketball','arcade_stool'].every(id=>existing.some(f=>f.id===id)))
  errors.push('V69 original four arcade props missing');
 const legacy=[...existing.filter(f=>f.radius>0).map(f=>({id:f.id,x:f.x,z:f.z,r:f.radius})),
  {id:'arcade_one',x:-38,z:-97,r:.9},{id:'arcade_two',x:-42,z:-101,r:.9}];
 const {fixtures=[],lights=[],sign,posters=[]}=plan||{};
 if(fixtures.length!==18||lights.length!==4||posters.length!==5||!sign)
  errors.push('Missing V126 authentic arcade machines, light panels or original-era art');
 for(const f of fixtures){
  if(seen.has(f.id))errors.push('Duplicate source cabinet '+f.id);seen.add(f.id);
  const dims=sourceSizes[f.node],r=f.collisionRadius;
  if(!dims||f.source!==SUNBURST_PACK_V126.path||
   f.sha256!==SUNBURST_PACK_V126.sha256||f.license!=='CC0-1.0'||
   JSON.stringify(f.sourceSize)!==JSON.stringify(dims)||
   Math.abs(r-(Math.ceil((Math.hypot(dims[0],dims[2])/2+.1)*100)/100))>.001)
   errors.push('Unverified or resized original arcade mesh '+f.id);
  if(f.room!=='sunburst_arcade'||!Number.isFinite(f.x+f.z+f.yaw)||
   !(r>.3&&r<1.6)||f.x<=room.x1+r+.12||f.x>=room.x2-r-.12||
   f.z<=room.z1+r+.12||f.z>=room.z2-r-.12)
   errors.push('Arcade cabinet clips true original suite wall '+f.id);
  for(const old of legacy)if(distance(f,old)<=r+old.r+.18)
   errors.push('Arcade machine intersects original V69/V67 '+f.id+'/'+old.id);
  for(const p of portals.filter(p=>p.type==='doorway'&&[p.to,p.from].includes('sunburst_arcade'))){
   const a=p.axis==='x'?{x:p.at,z:p.start}:{x:p.start,z:p.at},
    b=p.axis==='x'?{x:p.at,z:p.end}:{x:p.end,z:p.at};
   if(segmentDistance(f,a,b)<=r+.85)
    errors.push('Arcade cabinet obstructs true 4.2m original shop entrance '+f.id);
  }
 }
 for(let i=0;i<fixtures.length;i++)for(let j=i+1;j<fixtures.length;j++)
  if(distance(fixtures[i],fixtures[j])<=fixtures[i].collisionRadius+
   fixtures[j].collisionRadius+.35)
   errors.push('Insufficient arcade play-space aisle '+fixtures[i].id+'/'+fixtures[j].id);
 for(const l of lights){
  if(seen.has(l.id))errors.push('duplicate arcade ceiling fitting '+l.id);seen.add(l.id);
  if(l.room!=='sunburst_arcade'||l.model!==ANCHOR_FLUORESCENT_ASSET_V122.path||
   l.sha256!==ANCHOR_FLUORESCENT_ASSET_V122.sha256||l.license!=='CC0-1.0'||
   ![0,.21,.32].includes(l.power)||l.x<=-44||l.x>=-31||
   l.z<=-105||l.z>=-92)
   errors.push('Unlicensed / wrong 1997 ceiling light '+l.id);
  if(ceilings.length){
   const hits=ceilings.filter(s=>s.room==='sunburst_arcade'&&
    l.x>s.x1+1.1&&l.x<s.x2-1.1&&l.z>s.z1+1.1&&l.z<s.z2-1.1);
   if(hits.length!==1||Math.abs(hits[0].y-hits[0].thickness/2-5.21)>.02)
    errors.push('Arcade light is not fixed to measured original source soffit '+l.id);
  }
 }
 if(!sign||sign.wallX!==-46||sign.face!==1||sign.z-sign.width/2<=-106.8||
  sign.z+sign.width/2>=-90.2||sign.y-sign.height/2<=2.8||
  sign.y+sign.height/2>=4.6||!sign.originalArtwork)
  errors.push('Original Sunburst identity is not mounted on western masonry');
 for(const p of posters){
  if(seen.has(p.id))errors.push('duplicate original fictional poster '+p.id);seen.add(p.id);
  if(!p.originalArtwork||!p.title||!['north','south','west'].includes(p.wall)||
   (p.wall==='north'&&p.z!==-90.14)||(p.wall==='south'&&p.z!==-106.86)||
   (p.wall==='west'&&p.x!==-45.85))
   errors.push('Unlicensed, floating or non-original arcade wall print '+p.id);
 }
 return errors;
}
