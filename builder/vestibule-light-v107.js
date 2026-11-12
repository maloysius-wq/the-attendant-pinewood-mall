/** Builder-only faulty electrical supply for the EXISTING contractor
 * point-light, fitted to a real source-pinned fluorescent ceiling model.
 * Reuses the v107 API entry point for backwards-compatible Builder tests.
 */
import {VESTIBULE_LIGHT_POINT_V107} from './vestibule-patina-plan-v107.mjs';

// Room-local Builder lamp strength. Original v108 was 10 * 1.7 = 17.
// Halve BOTH the light cast and the actual panel glow for a foreboding entry.
export const VESTIBULE_BRIGHTNESS_V110=.5;
const near=(a,b)=>Math.abs(a-b)<.025;
const boundedRandom=random=>{
 const n=Number(random());
 if(!Number.isFinite(n))throw Error('Invalid vestibule light random source');
 return Math.min(.999999,Math.max(0,n));
};

// This faulty ballast now sputters every 1.15-3.5 s, instead of the old 9-27
// seconds. Within each fault, several sub-second voltage dips may occur.
// Roughly 15% are genuine fully dead, followed by an uneven restart.
export function createVestibuleLightSequencerV107({random=Math.random}={}){
 const roll=()=>boundedRandom(random);
 const schedule=()=>1.15+roll()*2.35;
 let phase={kind:'steady',level:1,duration:schedule()};
 let remaining=phase.duration,queue=[],events=0,lastEvent=null;
 function makeEvent(){
  const p=roll();
  const mode=p<.55?'flutter':p<.85?'brownout':'blackout';
  events++;lastEvent=mode;
  if(mode==='flutter'){
   const sequence=[],pulses=2+Math.floor(roll()*3);
   for(let i=0;i<pulses;i++){
    sequence.push({kind:'flicker',level:.07+roll()*.42,duration:.045+roll()*.07});
    sequence.push({kind:'rebound',level:.76+roll()*.24,duration:.055+roll()*.09});
   }
   return sequence;
  }
  if(mode==='brownout')return [
   {kind:'dim',level:.12+roll()*.27,duration:.16+roll()*.29},
   {kind:'rebound',level:.70+roll()*.23,duration:.07+roll()*.10},
   {kind:'flicker',level:.08+roll()*.30,duration:.045+roll()*.07},
   {kind:'recovery',level:.87+roll()*.13,duration:.09+roll()*.16}
  ];
  return [
   {kind:'off',level:0,duration:.16+roll()*.31},
   {kind:'rebound',level:.28+roll()*.37,duration:.065+roll()*.085},
   {kind:'off',level:0,duration:.065+roll()*.095},
   {kind:'recovery',level:.70+roll()*.24,duration:.09+roll()*.14}
  ];
 }
 function update(seconds){
  if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid vestibule light clock step');
  let dt=Math.min(seconds,120);
  for(let guard=0;dt>=remaining;guard++){
   if(guard>4000)throw Error('Vestibule light state did not advance');
   dt-=remaining;
   if(!queue.length){
    queue=phase.kind==='steady'?
     [...makeEvent(),{kind:'steady',level:1,duration:schedule()}]:
     [{kind:'steady',level:1,duration:schedule()}];
   }
   phase=queue.shift();remaining=phase.duration;
  }
  remaining-=dt;
  return getState();
 }
 function restart(){
  queue=[];phase={kind:'steady',level:1,duration:schedule()};
  remaining=phase.duration;return getState();
 }
 function getState(){return {phase:phase.kind,level:phase.level,remaining,
  events,lastEvent};}
 return {update,restart,getState};
}

export function createVestibuleFixtureLightV107(building,{
 random=Math.random,enabled=true,fixture
}={}){
 if(!fixture||typeof fixture.setLevel!=='function'||!fixture.emitter)
  throw Error('Builder fixture must mount a real pinned fluorescent model before flickering');
 const point=VESTIBULE_LIGHT_POINT_V107;
 const lights=building.group.children.filter(o=>o.isPointLight&&
  near(o.position.x,point.x)&&near(o.position.y,point.y)&&near(o.position.z,point.z));
 if(lights.length!==1)throw Error('Missing/ambiguous canonical vestibule overhead light');
 const light=lights[0],originalPosition=light.position.clone(),originalIntensity=light.intensity;
 const bulbs=building.group.children.filter(o=>o.isMesh&&
  near(o.position.x,point.x)&&near(o.position.y,point.y)&&near(o.position.z,point.z));
 if(bulbs.length!==1)throw Error('Missing original lamp bulb for safe replacement');
 const originalBulb=bulbs[0],originalBulbVisible=originalBulb.visible;
 // No more 12cm glowing orb floating 45cm below the ceiling. The original
 // canonical bulb is hidden only in the Builder and restored on teardown.
 originalBulb.visible=false;
 light.position.set(fixture.emitter.x,fixture.emitter.y,fixture.emitter.z);
 const litIntensity=originalIntensity*1.7*VESTIBULE_BRIGHTNESS_V110;
 const sequencer=createVestibuleLightSequencerV107({random});
 let active=!!enabled;
 function apply(level){
  light.intensity=litIntensity*level;  // Exact 0 means fully electrically OFF.
  fixture.setLevel(level*VESTIBULE_BRIGHTNESS_V110); // Dim actual source lens too.
 }
 function update(dt){if(active)apply(sequencer.update(dt).level);return getState();}
 function getState(){
  const state=sequencer.getState(),model=fixture.getState();
  return {enabled:active,lightIntensity:light.intensity,
   baseIntensity:originalIntensity,onIntensity:litIntensity,
   brightnessScale:VESTIBULE_BRIGHTNESS_V110,
   position:{x:light.position.x,y:light.position.y,z:light.position.z},
   originalBulbHidden:!originalBulb.visible,
   fixture:model,...state};
 }
 function setEnabled(value){
  active=!!value;
  sequencer.restart();
  apply(1);
  return getState();
 }
 apply(1);
 return {getState,setEnabled,update,dispose(){
  active=false;apply(1);
  light.intensity=originalIntensity;
  light.position.copy(originalPosition);
  originalBulb.visible=originalBulbVisible;
  fixture.dispose();
 }};
}
