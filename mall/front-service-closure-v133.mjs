/** V133 original 1979 boarded-lobby / contractor sealed front interstice.
 * Real single-source geometry only. The rear wall stops INSIDE the existing
 * x=9 source vestibule wall thickness, safely before the licensed V113 hinge
 * swing. This is not another playable room or a second original floor.
 */
import {MALL} from './masterplan-v66.mjs';
export const FRONT_ORIGINAL_CLOSURE_V133=Object.freeze({
 id:'v133_original_front_entry_sealed_relief',x1:7,x2:9,z1:-43,z2:-22.5,
 originalArea:41,wallEndX:8.91,wallThickness:.24,wallTop:3.55,
 hostWallThickness:.24,roofY:12.8,plasterY:3.45
});
export const FRONT_SOURCE_WALL_V133=Object.freeze({
 id:'v133_front_junction_original_concrete',axis:'z',at:-43,start:7,end:8.91,
 bottom:0,top:3.55,thickness:.24,material:'concrete',role:'v133-front-service-partition'
});
export const FRONT_SOURCE_CEILING_V133=Object.freeze({
 id:'v133_front_service_plaster',room:FRONT_ORIGINAL_CLOSURE_V133.id,
 x1:7,x2:9,z1:-43,z2:-22.5,y:3.45,thickness:.18,material:'plaster-ceiling'
});
const EPS=.00001,near=(a,b)=>Math.abs(a-b)<EPS;
const overlap=(a,b)=>Math.max(0,Math.min(a.x2,b.x2)-Math.max(a.x1,b.x1))*
 Math.max(0,Math.min(a.z2,b.z2)-Math.max(a.z1,b.z1));
export function frontSourceWallV133(existingWalls=[]){
 const w=FRONT_SOURCE_WALL_V133;
 // Actual north x9 vestibule face has .24m thick source masonry; the
 // rear endcap overlaps it by .03m, physically sealing the 41m² envelope
 // while keeping an empty 0.19m nominal distance to the real V113 portal.
 if(!(w.end>9-.24/2&&w.end<=8.92))
  throw Error('V133 rear masonry must connect actual x9 host while preserving V113 hinge');
 for(const old of existingWalls){
  if(old.axis===w.axis&&near(old.at,w.at)&&
    Math.min(old.end,w.end)-Math.max(old.start,w.start)>.01&&
    Math.min(old.top,w.top)-Math.max(old.bottom,w.bottom)>.01)
   throw Error('V133 duplicate original rear entry wall '+old.id);
 }
 return {...w};
}
export function frontSourceCeilingV133(){return {...FRONT_SOURCE_CEILING_V133};}
export function validateFrontClosureV133({walls=[],existingWalls=[],ceilings=[],floorPlates=[],portals=[],roofs=[]}={}){
 const errors=[],zone=FRONT_ORIGINAL_CLOSURE_V133,wall=FRONT_SOURCE_WALL_V133;
 if(MALL.rooms.length!==41||MALL.evidence.length!==9||MALL.rooms.some(r=>r.id===zone.id))
  errors.push('original 41 rooms and nine evidence markers must remain unchanged');
 if(walls.length!==1||!walls.some(w=>w.id===wall.id&&w.role===wall.role&&
  near(w.at,-43)&&near(w.start,7)&&near(w.end,8.91)&&near(w.top,3.55)))
  errors.push('missing exact V133 physical rear-wall cutback');
 const has=(axis,at,start,end,top)=>existingWalls.some(w=>
  w.axis===axis&&near(w.at,at)&&w.start<=start+EPS&&w.end>=end-EPS&&
  w.bottom<=EPS&&w.top>=top-EPS);
 if(!has('x',7,-43,-22.5,3.55)||!has('x',9,-43,-22.5,3.55)||
    !has('z',-22.5,7,9,3.55))
  errors.push('front closure not attached to THREE measured original 1979 host walls');
 if(walls.length&&existingWalls.some(w=>w.axis==='z'&&near(w.at,-43)&&
    Math.min(w.end,wall.end)-Math.max(w.start,wall.start)>.01&&
    Math.min(w.top,wall.top)-Math.max(w.bottom,wall.bottom)>.01))
  errors.push('new rear wall duplicates historic source masonry');
 const hinged=portals.find(p=>p.id==='service_vestibule__central_gallery');
 if(!hinged||hinged.axis!=='z'||!near(hinged.at,-43)||
    !near(hinged.start,9.1)||!near(hinged.end,10.9))
  errors.push('licensed V113 original inner hinged portal moved');
 // Game colliders expand physical wall X ends by .025 (V70), so ensure
 // substantial separation to the original hinge pivot at x9.11.
 if(wall.end+.025>=hinged?.start-.12)errors.push('front source wall blocks licensed V113 hinge margin');
 for(const p of portals.filter(p=>p.type==='doorway'))
  if(p.axis==='z'&&near(p.at,-43)&&p.start<wall.end-EPS&&p.end>wall.start+EPS)
   errors.push('front source wall overlaps an existing story doorway '+p.id);
 const caps=ceilings.filter(c=>c.room===zone.id);
 if(caps.length!==1||!caps.some(c=>c.id===FRONT_SOURCE_CEILING_V133.id&&
    near(c.x1,7)&&near(c.x2,9)&&near(c.z1,-43)&&near(c.z2,-22.5)&&
    near(c.y-c.thickness/2,3.36)))
  errors.push('missing one original attached 41m² front ceiling');
 if(caps.some(c=>overlap(c,zone)<41-EPS))
  errors.push('front underside does not cover exact pre-existing single source floor');
 for(const c of caps)for(const other of ceilings.filter(p=>p!==c))
  if(overlap(c,other)>EPS)errors.push('duplicated original ceiling '+c.id+'/'+other.id);
 const floor=floorPlates.reduce((n,p)=>n+overlap(p,zone),0);
 if(!near(floor,41)||floorPlates.some(p=>p.id.startsWith('v133_')))
  errors.push('original 1979 y=0 floor was replaced or doubled');
 const roof=roofs.reduce((n,p)=>n+overlap(p,zone),0);
 if(!near(roof,41))errors.push('authentic weather roof no longer covers original front');
 return errors;
}
