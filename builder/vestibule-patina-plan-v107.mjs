/** Authored, Builder-only v107 patina. Every mark is placed relative to the
 * actual 7 x 20.5 m contractor vestibule, not scattered by a random generator.
 * "why" records the physical cause; "review" records the checked exclusion.
 * These are non-saveable atmospheric meshes, NOT edits to a user's v1 layout.
 */
import {MALL} from '../mall/masterplan-v66.mjs';

export const VESTIBULE_V107=MALL.rooms.find(r=>r.id==='service_vestibule');
export const VESTIBULE_LIGHT_POINT_V107=Object.freeze({x:12,y:2.9,z:-30});
const floor=(id,asset,x,z,scale,turn,opacity,why,review)=>({
 id,asset,surface:'floor',position:{x,y:.024,z},scale,turn,opacity,why,review
});
const wall=(id,asset,x,y,z,normal,scale,turn,opacity,why,review)=>({
 id,asset,surface:'wall',position:{x,y,z},normal,scale,turn,opacity,why,review
});
const ceiling=(id,asset,x,z,scale,turn,opacity,why,review)=>({
 id,asset,surface:'ceiling',position:{x,y:3.337,z},normal:[0,-1,0],scale,turn,opacity,why,review
});

/** Thoughtful layout: entrance -> traffic -> work edge -> quiet rear, never
 * evenly sprinkled. The centre of the doorway and main passage remain clear.
 * Placed with real source-pinned ambientCG floor stains and v98 cobweb art.
 */
export const VESTIBULE_PATINA_PLAN_V107=Object.freeze([
 floor('entry-grit','decay-v105-tracked-soil',12.25,-24.7,.94,-.14,.79,
  'Shoes bring outside soil through the contractor door','Centred inside threshold, with no pile obstructing the 1.78 m opening'),
 floor('entry-scuff','decay-v105-dark-shoe-scuffs',12.55,-27.0,.94,.20,.87,
  'Repeated boots pivot toward the long corridor','Does not repeat the same stain at the threshold'),
 floor('entry-edge-left','grime-dust-floor-corner',9.8,-24.2,.75,.22,.77,
  'Dust catches in the sheltered left jamb corner','Kept off the centre walking strip'),
 floor('entry-edge-right','grime-dirt-floor-edges',15.08,-24.5,.77,-.16,.82,
  'Road dirt settles along the right skirting','Narrow strip stays next to the wall'),
 floor('left-wall-dust','decay-v105-gritty-dust',10.20,-31.3,.57,.32,.90,
  'Untraveled floor by the left partition collects gritty dust','Scaled to fit inside the x=9 wall without spanning the path'),
 floor('right-wall-dust','decay-v105-gritty-dust',14.83,-30.8,.57,-.18,.84,
  'Protected zone beside the contractor work wall','Counterbalances rather than mirrors left edge'),
 floor('right-drag','decay-v105-floor-drag',14.30,-35.0,.89,.27,.88,
  'Carts and equipment scraped the right-hand service lane','Length follows traffic, not the cross-room escape path'),
 floor('rear-dust','grime-dust-floor-heavy',12.90,-40.85,.96,.48,.87,
  'Lower footfall near the rear wall leaves settled powder','Not across the rear-left mall passage'),
 floor('rear-rubble','decay-v105-scattered-debris',14.93,-40.45,.60,-.25,.85,
  'Broken construction grit accumulates against the rear-right wall','Reduced size to avoid dumping large rubble in the walking lane'),
 floor('rear-left-corner','grime-dust-floor-corner-2',9.72,-41.85,.78,.18,.78,
  'Stagnant air collects dust at the far corner','Localized corner smudge, not a wall-to-wall carpet'),
 floor('heel-pivot-rear','grime-floor-scuffs',11.60,-38.1,.83,-.32,.73,
  'Boot heels pivot where the route turns into the mall','Small footprint and lower contrast distinguish it from drag gouges'),
 floor('left-aisle-haze','grime-dust-aisle',10.45,-35.4,.68,.25,.58,
  'Foot traffic redistributes dust into a faint trail','Subtle haze rather than another heavy opaque patch'),
 wall('right-base-front','decay-v105-baseboard-dirt',15.85,.52,-26.7,[-1,0,0],.79,0,.84,
  'Dust and mop residue cling to the low right wall','Above floor and well away from the door leaf'),
 wall('right-cart-scrapes','decay-v105-wall-scrapes',15.85,1.10,-34.5,[-1,0,0],.86,-.04,.91,
  'Equipment dragged along the right work side marks shoulder and cart height','Gouges stay on wall, not floating in room'),
 wall('left-low-grime','grime-grime-wall-lower',9.15,.43,-36.8,[1,0,0],.99,.01,.79,
  'Dust builds on the opposite baseboard in a quiet zone','Distanced from the prominent right-hand scrape'),
 wall('left-wall-bloom','grime-wall-dust-bloom',9.15,2.02,-30.7,[1,0,0],.79,-.1,.65,
  'Old plaster holds diffuse dust near a stationary wall seam','Gentle bloom, not a second sharp damage streak'),
 wall('entry-doorframe','grime-wall-old-scuffs',14.45,1.13,-22.75,[0,0,-1],.84,-.04,.82,
  'People and tools rub against the right side of the entry','Entire mark is right of the x=12 entry opening'),
 wall('rear-wall-kick','decay-v105-baseboard-dirt',13.90,.49,-42.84,[0,0,1],.52,-.02,.78,
  'Neglected skirting by the service-room rear wall is dirty','Right of rear-left passage; does not cover doorway'),
 wall('right-upper-strands','cobweb-wall-draped',15.85,2.75,-39.3,[-1,0,0],.73,.06,.66,
  'Undisturbed upper rear wall collects hanging webs','High enough to remain clear of moving carts'),
 wall('left-upper-web','cobweb-wall-corner',9.15,2.93,-26.7,[1,0,0],.76,-.10,.63,
  'Webs take hold above a disused wall corner','Separated from the fixture and door jamb'),
 ceiling('entry-ceiling-web','cobweb-corner-fine',9.71,-23.55,.87,.18,.68,
  'Sheltered ceiling seam above entrance-side corner','Not suspended over the walkable centre or door'),
 ceiling('rear-ceiling-web','cobweb-corner-dense',15.23,-42.23,.91,-.13,.77,
  'Most neglected rear-right junction accumulates dense webbing','Tucked into true ceiling corner, not centre of room'),
 ceiling('rear-left-web','cobweb-ceiling-old',9.79,-41.96,.81,.28,.68,
  'Ageing web in the still back-left ceiling seam','Does not cover the mall passage below'),
 ceiling('far-right-wisps','cobweb-ceiling-wisps',15.18,-33.05,.67,-.33,.59,
  'Sparse strands collect where the side wall meets ceiling','Kept clear of the light at x=12, z=-30'),
 ceiling('fixture-adjacent-dust','cobweb-ceiling-old',13.84,-30.86,.53,.12,.48,
  'Dust settles on ceiling near, not on, the overhead fixture','Subtle and offset, so light is never mistaken for a web'),
 ceiling('front-right-seam','cobweb-corner-fine',15.23,-23.62,.71,-.17,.57,
  'High corner behind the swinging door remains untouched','Small enough not to cloak doorway or fixture')
]);

export const VESTIBULE_PATINA_EXPECTED_V107=Object.freeze({floor:12,wall:8,ceiling:6,total:26});

export function validateVestibulePatinaPlanV107(placements=VESTIBULE_PATINA_PLAN_V107){
 const errors=[],ids=new Set(),room=VESTIBULE_V107;
 if(!room||room.level!=='G'||room.x1!==9||room.x2!==16||room.z1!==-43||room.z2!==-22.5)
  errors.push('Contractor vestibule geometry changed, review all patina anchors');
 for(const p of placements){
  if(ids.has(p.id))errors.push('Duplicate mark '+p.id);
  ids.add(p.id);
  if(!['floor','wall','ceiling'].includes(p.surface)||!p.asset||
   !Number.isFinite(p.scale)||p.scale<=.4||p.scale>1.1||
   !Number.isFinite(p.turn)||!Number.isFinite(p.opacity)||p.opacity<.4||p.opacity>1||
   !p.why||!p.review)errors.push('Unreviewed mark '+p.id);
  const {x,y,z}=p.position;
  if(x<room.x1+.05||x>room.x2-.05||z<room.z1+.05||z>room.z2-.05)
   errors.push('Mark not in vestibule '+p.id);
  if(p.surface==='floor'&&Math.abs(y-.024)>.002||
     p.surface==='ceiling'&&Math.abs(y-3.337)>.002||
     p.surface==='wall'&&(!p.normal||p.normal.length!==3||!p.normal.every(Number.isFinite)))
    errors.push('Wrong attachment plane '+p.id);
  if(p.surface==='wall'&&z>room.z2-.4&&y<2.27&&Math.abs(x-12)<1.3)
   errors.push('Mark covers service door aperture '+p.id);
  if(p.surface==='wall'&&z<room.z1+.4&&x<11.15)
   errors.push('Mark covers mall passage '+p.id);
  if(p.surface==='ceiling'&&Math.hypot(x-12,z+30)<1.15)
   errors.push('Web overlaps overhead lamp '+p.id);
 }
 for(const [type,count] of Object.entries(VESTIBULE_PATINA_EXPECTED_V107)){
  const actual=type==='total'?placements.length:placements.filter(p=>p.surface===type).length;
  if(actual!==count)errors.push(type+' planned count '+actual+' expected '+count);
 }
 return errors;
}
