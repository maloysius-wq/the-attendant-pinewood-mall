/** Builder-only intermittent service-vestibule fixture at the *existing*
 * authored light, never a replacement for playable game illumination.
 */
import {VESTIBULE_LIGHT_POINT_V107} from './vestibule-patina-plan-v107.mjs';

const near=(a,b)=>Math.abs(a-b)<.025;
const schedule=random=>9+random()*18; // long irregular rests, no constant blinking
const boundedRandom=random=>Math.min(.999999,Math.max(0,Number(random())));

export function createVestibuleLightSequencerV107({random=Math.random}={}){
 const roll=()=>boundedRandom(random);
 let phase={kind:'steady',level:1,duration:schedule(roll)};
 let remaining=phase.duration,queue=[],events=0,lastEvent=null;
 function makeEvent(){
  const mode=roll()<.53?'dim':'flicker';
  events++;lastEvent=mode;
  if(mode==='dim'){
   // One sickly drop for roughly a second rather than machine-gun flashing.
   return [{kind:'dim',level:.22+roll()*.20,duration:.8+roll()*.52}];
  }
  // Two discrete dropouts, separated by sustained on periods. Fewer than
  // three power interruptions per second, with no stroboscopic rapid pulses.
  return [
   {kind:'off',level:.015,duration:.12+roll()*.05},
   {kind:'on',level:1,duration:.30+roll()*.15},
   {kind:'off',level:.035,duration:.12+roll()*.06},
   {kind:'recovery',level:.75+roll()*.20,duration:.24+roll()*.18}
  ];
 }
 function update(seconds){
  if(!Number.isFinite(seconds)||seconds<0)throw Error('Invalid vestibule light clock step');
  let dt=Math.min(seconds,120);
  for(let guard=0;guard<100&&dt>=remaining;guard++){
   dt-=remaining;
   if(queue.length===0){
    queue=phase.kind==='steady'?
     [...makeEvent(),{kind:'steady',level:1,duration:schedule(roll)}]:
     [{kind:'steady',level:1,duration:schedule(roll)}];
   }
   phase=queue.shift();
   remaining=phase.duration;
  }
  remaining-=dt;
  return getState();
 }
 function restart(){
  queue=[];phase={kind:'steady',level:1,duration:schedule(roll)};
  remaining=phase.duration;return getState();
 }
 function getState(){return {phase:phase.kind,level:phase.level,remaining,
   events,lastEvent};}
 return {update,restart,getState};
}

export function createVestibuleFixtureLightV107(building,{random=Math.random,enabled=true}={}){
 const point=VESTIBULE_LIGHT_POINT_V107;
 const fixtures=building.group.children.filter(o=>o.isPointLight&&
  near(o.position.x,point.x)&&near(o.position.y,point.y)&&near(o.position.z,point.z));
 if(fixtures.length!==1)throw Error('Missing/ambiguous authentic contractor-vestibule overhead light');
 const light=fixtures[0],originalIntensity=light.intensity;
 // installLights() already supplies the small physical glass bulb, with its
 // own MeshBasicMaterial. Modulate that bulb too or it would appear brightly
 // lit while the real light is off.
 const bulbs=building.group.children.filter(o=>o.isMesh&&
  near(o.position.x,point.x)&&near(o.position.y,point.y)&&near(o.position.z,point.z));
 if(bulbs.length!==1)throw Error('Missing/ambiguous physical vestibule lamp bulb');
 const bulb=bulbs[0],originalColor=bulb.material.color.clone();
 const sequencer=createVestibuleLightSequencerV107({random});
 let active=!!enabled;
 function apply(level){
  light.intensity=originalIntensity*level;
  bulb.material.color.copy(originalColor).multiplyScalar(Math.max(.01,level));
 }
 function update(dt){
  if(active)apply(sequencer.update(dt).level);
  return getState();
 }
 function getState(){
  return {enabled:active,lightIntensity:light.intensity,baseIntensity:originalIntensity,
   bulbColor:bulb.material.color.getHexString(),position:{...point},...sequencer.getState()};
 }
 function setEnabled(value){
  active=!!value;
  if(!active){sequencer.restart();apply(1)}
  else {sequencer.restart();apply(1)}
  return getState();
 }
 if(!active)apply(1);
 return {getState,setEnabled,update,dispose(){
  active=false;apply(1);bulb.material.color.copy(originalColor);
 }};
}
