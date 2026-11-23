/** V150: mundane human remnants, authored on *existing measured fixture tops*.
 * No narrative reveal, LS evidence, new pickup, room, collision or quest.
 */
import {FURNISHINGS_V69} from './furnishing-plan-v69.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from './gameplay-layout-v70.mjs';

export const STAFF_BELONGINGS_V150=Object.freeze([
 Object.freeze({id:'jo-close-clipboard',person:'Jo Alvarez',
  fixture:'food_table_4',room:'food_court',kind:'clipboard',
  xOffset:0,zOffset:0,width:.37,depth:.28,
  title:'PINEWOOD / CLOSING ROUNDS',owner:'J. ALVAREZ',
  lines:Object.freeze(['FOOD COURT - LAST PASS','Before anyone signs off:','Check stalls, then tables.','Ask the closers in person.'])}),
 Object.freeze({id:'tessa-staff-chart',person:'Tessa Kim',
  fixture:'cassette_counter',room:'cassette_castle',kind:'chart',
  // Cassette's licensed original counter is rotated 90 degrees:
  // its long measured 1.26m axis is WORLD X, not Z. Move the chart
  // toward the player-facing end in X, clear of the original register.
  xOffset:.40,zOffset:0,width:.34,depth:.26,
  title:'CASSETTE CASTLE / STAFF PICKS',owner:'TESSA KIM',
  lines:Object.freeze(['TOP 40 - WEEKLY PICKS','Friday: finish side A','Saturday: make a new mix','Sunday: please let me sleep'])}),
 Object.freeze({id:'luis-copy-sleeve',person:'Luis Ortega',
  fixture:'video_counter',room:'video_planet',kind:'sleeve',
  // The original Video Planet counter is only .8076m wide (real GLB Box3).
  // Move the sleeve lengthwise in Z, away from the actual demo VHS at centre.
  xOffset:0,zOffset:.34,width:.34,depth:.26,
  title:'VIDEO PLANET / COPY REQUEST',owner:'L. ORTEGA',
  lines:Object.freeze(['NIGHT SECURITY / HOLD','Blank tape by the desk','Return after closing','11 / 14 / 97'])})
]);

const APPROACH_OFFSETS=Object.freeze([
 [2,0],[-2,0],[0,2],[0,-2],[2.2,1],[2.2,-1],
 [-2.2,1],[-2.2,-1],[1.1,2.1],[-1.1,2.1],[1.1,-2.1],[-1.1,-2.1],
 [0,2.5],[0,-2.5],[2.5,0],[-2.5,0]
]);
/** Site planning never guesses structural support or bypasses real circulation.
 * The actual height and supporting visible mesh will be measured at bind time.
 */
export function planChapter1StaffBelongingsV150(layout=buildGameplayLayoutV70({chapter:1})){
 if(layout.chapter!==1||layout.level!=='G')throw Error('V150 requires original public G-floor Chapter 1');
 return STAFF_BELONGINGS_V150.map(spec=>{
  const fixture=FURNISHINGS_V69.fixtures.find(f=>f.id===spec.fixture);
  if(!fixture||fixture.room!==spec.room||
    !['table','counter'].includes(fixture.role)||
    !(fixture.targetHeight>.65&&fixture.targetHeight<1.2)||
    !fixture.model.startsWith('assets/vendor/runtime/'))
   throw Error('V150 missing original CC0 measured support: '+spec.fixture);
  const x=fixture.x+spec.xOffset,z=fixture.z+spec.zOffset;
  if(layout.roomAt(x,z)!==spec.room||
    !(spec.width>.20&&spec.width<.6&&spec.depth>.18&&spec.depth<.45))
   throw Error('V150 original support/physical dimensions are invalid: '+spec.id);
  const approaches=APPROACH_OFFSETS.map(([dx,dz])=>({x:fixture.x+dx,z:fixture.z+dz}))
   .filter(p=>layout.roomAt(p.x,p.z)===spec.room&&layout.canStand(p.x,p.z))
   .map(p=>({...p,route:shortestRouteV70(layout,layout.spawn,p).length}))
   .filter(p=>p.route>0);
  if(approaches.length<1)throw Error('V150 no real standable viewing approach: '+spec.id);
  const evidence=FURNISHINGS_V69.storyAnchors.filter(anchor=>anchor.room===spec.room&&
   Math.hypot(anchor.x-x,anchor.z-z)<1.5);
  if(evidence.length)throw Error('V150 intrudes on original LS evidence: '+spec.id);
  const best=approaches[0];
  return Object.freeze({...spec,x,z,originalSupportModel:fixture.model,
   originalSupportHeight:fixture.targetHeight,approach:Object.freeze({x:best.x,z:best.z}),
   originalApproachSteps:best.route});
 });
}
