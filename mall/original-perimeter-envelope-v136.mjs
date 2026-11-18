/** V136 original 1979/1992 perimeter facade accounting for Issue #119.
 * Source-native structural ledger after V129, V131, V133 and V135 close
 * real service seams. Leave inaccessible 1m old facade/plenum setback voids
 * INTENTIONAL, not unbuilt story rooms or artificial finish rectangles.
 */
import {MALL} from './masterplan-v66.mjs';
import {auditOriginalRemainderV128} from './residual-footprint-audit-v128.mjs';
const EPS=1e-6,near=(a,b)=>Math.abs(a-b)<EPS,area=r=>(r.x2-r.x1)*(r.z2-r.z1);
const rect=(x1,x2,z1,z2)=>({x1,x2,z1,z2});
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
const closed=[
 rect(-46,-29,-48,-43), // V129 physically real NW
 rect(29,47,-118.5,-115), // V131 real rear east and protected stair
 rect(7,9,-43,-22.5), // V133 original front, true V113 hinge clearance
 rect(-17,-11,-118.5,-111) // V135 genuine west rear
];
export const PERIMETER_WEST_REAR_RETURN_V136=Object.freeze({
 id:'v136_original_west_facade_rear_50cm_return',axis:'x',at:-46,
 start:-118.5,end:-118,bottom:0,top:3.45,thickness:.24,
 material:'concrete',role:'v136-original-perimeter-return'
});
function subtract(r,h){
 const x1=Math.max(r.x1,h.x1),x2=Math.min(r.x2,h.x2);
 const z1=Math.max(r.z1,h.z1),z2=Math.min(r.z2,h.z2);
 if(x1>=x2||z1>=z2)return [r];
 return [
  rect(r.x1,x1,r.z1,r.z2),rect(x2,r.x2,r.z1,r.z2),
  rect(x1,x2,r.z1,z1),rect(x1,x2,z2,r.z2)
 ].filter(x=>x.x2-x.x1>EPS&&x.z2-x.z1>EPS);
}
const sourceType=r=>{
 if(near(r.x1,-47)&&near(r.x2,-46))return 'west1979';
 if(near(r.x1,46)&&near(r.x2,47))return 'east1979';
 if(near(r.x1,85)&&near(r.x2,86))return 'east1992';
 if(near(r.z1,-118.5)&&near(r.z2,-118))return 'rear1979';
 return 'unresolved';
};
const face=(r,type)=>{
 if(type==='west1979')return [
  {axis:'x',at:-47,start:r.z1,end:r.z2,outer:true},
  {axis:'x',at:-46,start:r.z1,end:r.z2,outer:false}];
 if(type==='east1979')return [
  {axis:'x',at:47,start:r.z1,end:r.z2,outer:true},
  {axis:'x',at:46,start:r.z1,end:r.z2,outer:false}];
 if(type==='east1992')return [
  {axis:'x',at:86,start:r.z1,end:r.z2,outer:true},
  {axis:'x',at:85,start:r.z1,end:r.z2,outer:false}];
 if(type==='rear1979')return [
  {axis:'z',at:-118.5,start:r.x1,end:r.x2,outer:true},
  {axis:'z',at:-118,start:r.x1,end:r.x2,outer:false}];
 return [];
};
function missing(walls,side){
 const hits=walls.filter(w=>w.axis===side.axis&&near(w.at,side.at)&&
   w.bottom<=EPS&&w.top>=3.45-EPS)
  .map(w=>[Math.max(side.start,w.start),Math.min(side.end,w.end)])
  .filter(([a,b])=>b-a>EPS).sort((a,b)=>a[0]-b[0]);
 const joined=[];for(const [a,b]of hits){
  const last=joined.at(-1);
  if(last&&a<=last[1]+EPS)last[1]=Math.max(last[1],b);
  else joined.push([a,b]);
 }
 const spans=[];let cursor=side.start;
 for(const [a,b]of joined){if(a-cursor>EPS)spans.push([cursor,a]);cursor=Math.max(cursor,b)}
 if(side.end-cursor>EPS)spans.push([cursor,side.end]);
 return spans;
}
export function realWestFacadeReturnV136(existingWalls=[]){
 const w=PERIMETER_WEST_REAR_RETURN_V136;
 if(existingWalls.some(o=>o.axis===w.axis&&near(o.at,w.at)&&
   Math.min(o.end,w.end)-Math.max(o.start,w.start)>EPS&&
   Math.min(o.top,w.top)-Math.max(o.bottom,w.bottom)>EPS))
  throw Error('Original western facade cap would duplicate existing masonry');
 const rear=existingWalls.some(o=>o.axis==='z'&&near(o.at,-118.5)&&
  o.start<=-47+EPS&&o.end>=-46-EPS&&o.top>=3.45-EPS);
 const inner=existingWalls.some(o=>o.axis==='x'&&near(o.at,-46)&&
  o.start<=-118+EPS&&o.end>=-107-EPS&&o.top>=3.45-EPS);
 if(!rear||!inner)throw Error('Original rear exterior or real west receiving wall missing');
 return {...w};
}
export function auditOriginalPerimeterV136(shell){
 if(!shell||shell.level!=='G')throw Error('V136 needs original physical ground shell');
 const old=auditOriginalRemainderV128();
 const cells=old.cells.flatMap(c=>closed.reduce((parts,h)=>parts.flatMap(p=>subtract(p,h)),[c]));
 const total=cells.reduce((n,c)=>n+area(c),0);
 const groups={},unaccounted=[],unexpected=[],intentional=[];
 for(const c of cells){
  const type=sourceType(c),a=area(c),grp=groups[type]??{area:0,count:0};
  grp.area+=a;grp.count++;groups[type]=grp;
  if(type==='unresolved'){unaccounted.push(c);continue}
  for(const f of face(c,type))for(const [a,b]of missing(shell.walls,f)){
   const intentionalConnector=type==='east1979'&&f.outer&&
    near(f.at,47)&&a>=-101.2-EPS&&b<=-101+EPS;
   const sample={type,axis:f.axis,at:f.at,span:[a,b],cell:c};
   (intentionalConnector?intentional:unexpected).push(sample);
  }
 }
 const floorArea=cells.reduce((n,c)=>n+shell.floorPlates.reduce((s,p)=>s+overlap(p,c),0),0);
 const roofArea=cells.reduce((n,c)=>n+shell.roofs.reduce((s,p)=>s+overlap(p,c),0),0);
 const rounded=Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{
  area:Math.round(v.area*1000)/1000,count:v.count}]));
 return Object.freeze({
  originalUnassignedBaselineSqm:old.area,
  physicallyAssignedByActualServiceV129V131V133V135Sqm:234,
  originalSingleSlabSetbackSqm:total,
  originalWeatherRoofOverSetbackSqm:roofArea,
  originalGroundFloorOverSetbackSqm:floorArea,
  groups:rounded,unaccountedCells:unaccounted,
  originalSetbackCells:cells,
  unforeseenMissingMasonry:unexpected,
  originalEastConnectorClearance:intentional,
  intentionallyNonWalkableFacadeSqm:total,
  originalRooms:MALL.rooms.length,originalEvidence:MALL.evidence.length,
  noNewFloorOrStoryRoom:true
 });
}
export function validateOriginalPerimeterV136(shell){
 const s=auditOriginalPerimeterV136(shell),e=[];
 if(s.originalUnassignedBaselineSqm!==520||
  s.originalSingleSlabSetbackSqm!==286||
  s.originalWeatherRoofOverSetbackSqm!==286||
  s.originalGroundFloorOverSetbackSqm!==286)
  e.push('original full 1979 facade setback floor/roof accounting changed');
 if(s.groups.west1979?.area!==96||s.groups.east1979?.area!==88.5||
  s.groups.east1992?.area!==67||s.groups.rear1979?.area!==34.5)
  e.push('original perimeter gap classification incomplete');
 if(s.unaccountedCells.length||s.unforeseenMissingMasonry.length)
  e.push('unresolved real original perimeter masonry: '+JSON.stringify(s.unforeseenMissingMasonry));
 if(s.originalEastConnectorClearance.length!==1||
  s.originalEastConnectorClearance[0].span[1]-s.originalEastConnectorClearance[0].span[0]>.201)
  e.push('original east Annex real 20cm opening return changed');
 if(shell.walls.filter(w=>w.id===PERIMETER_WEST_REAR_RETURN_V136.id).length!==1)
  e.push('missing source-backed original northwest rear 0.5m masonry return');
 if(MALL.rooms.length!==41||MALL.evidence.length!==9)
  e.push('story rooms or evidence changed');
 if(shell.floorPlates.some(p=>p.id.startsWith('v136_'))||
  shell.ceilings.some(c=>c.id.startsWith('v136_')))
  e.push('facade plenum deliberately receives NO fictional floor or soffit');
 return e;
}
