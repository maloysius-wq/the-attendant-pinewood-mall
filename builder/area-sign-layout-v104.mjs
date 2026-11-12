import {MALL} from '../mall/masterplan-v66.mjs';
import {constructPhysicalShell} from '../mall/physical-shell-v67.mjs';

// Builder-only developer wayfinding. These authoritative, canonical names
// never enter the playable campaign or the user's exported layout.
const CIRCULATION=new Set([
 'central_gallery','west_gallery','east_gallery','annex_threshold',
 'east_wing_spine','b1_spine','b1_cross','flooded_walk','mezz_hall'
]);
const LEVELS=new Map(MALL.levels.map(level=>[level.id,level]));
const HEIGHT=room=>room.level==='B1'?3.45:room.level==='M1'?3:
 room.id==='annex_anchor'?7.8:room.kind==='retail'?5.4:room.id==='central_gallery'?12:3.55;
const center=room=>({x:(room.x1+room.x2)/2,z:(room.z1+room.z2)/2});
const clamp=(n,low,high)=>Math.min(high,Math.max(low,n));
export function makeAreaSignPlanV104(){
 const portals=MALL.levels.flatMap(level=>constructPhysicalShell({level:level.id,chapter:6}).portals);
 return MALL.rooms.map(room=>{
  const floor=LEVELS.get(room.level);
  const candidates=CIRCULATION.has(room.id)?[]:portals.filter(p=>p.level===room.level&&
   p.type==='doorway'&&(p.from===room.id||p.to===room.id));
  candidates.sort((a,b)=>{
   const score=p=>{
    const other=p.from===room.id?p.to:p.from;
    // Public-facing storefronts are more useful than an interior back door.
    const isPublic=['central_gallery','west_gallery','east_gallery'].includes(other);
    return (isPublic?100:CIRCULATION.has(other)?50:0)+Math.min(p.width,8);
   };
   return score(b)-score(a)||a.id.localeCompare(b.id);
  });
  const p=candidates[0];
  const c=center(room),height=HEIGHT(room);
  let position,axis,width,signHeight,portalId=null;
  if(p){
   axis=p.axis;portalId=p.id;
   const inward=p.axis==='x'?Math.sign(c.x-p.at):Math.sign(c.z-p.at);
   const coordinate=p.at+(inward||1)*.18;
   position={
    x:p.axis==='x'?coordinate:(p.start+p.end)/2,
    z:p.axis==='z'?coordinate:(p.start+p.end)/2,
    y:0
   };
   width=clamp(p.width-.18,.70,4.25);
   signHeight=clamp(height-p.height-.17,.28,.60);
   position.y=floor.y+Math.min(height-signHeight/2-.12,p.height+signHeight/2+.06);
  }else{
   // Continuous corridors and stair landings have no reliable door head.
   // Put a clear editor-only area marker at their navigable room center.
   axis='z';position={...c,y:floor.y+Math.min(2.67,height-.42)};
   width=Math.min(3.5,Math.max(1.6,room.x2-room.x1-.35));
   signHeight=.50;
  }
  const plan={id:room.id,label:room.label,level:room.level,kind:room.kind,
   position,axis,width,height:signHeight,portalId};
  if(!Number.isFinite(position.x+position.y+position.z+width+signHeight))throw Error('Invalid area sign '+room.id);
  if(position.y-signHeight/2<=floor.y+1.8||
   position.y+signHeight/2>floor.y+height-.08)throw Error('Area sign violates usable room volume: '+room.id);
  return plan;
 });
}
