/**
 * The Call v62: restrained, continuous human head movement.
 * Hold the windshield gaze through seated dialogue, turn only at motivated
 * moments, and damp walking transitions instead of whip-panning to targets.
 */
import * as THREE from '../vendor/three/build/three.module.js';
import {CAR_DOOR_OPEN_PHASE} from './cinematic-sfx-cues-v82.mjs?v=83-door5';
import {VESTIBULE_HANDOFF_V112} from '../mall/vestibule-handoff-v112.mjs';
const vec=a=>new THREE.Vector3(...a);
const lerp=(a,b,t)=>a.clone().lerp(b,t);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const E={
 // The sedan's wheel is at world z 16.86..17.02 and its true front-left
 // doorway ends at z 17.50. Position the head at z 17.42, well forward of
 // the rear door's front edge at z 17.58.
 driver:[-10.33,1.22,17.42],dashLean:[-10.33,1.18,17.37],
 doorLean:[-10.88,1.26,17.19],doorOutside:[-11.82,1.72,17.05],
 parking:[-9.0,1.73,13.0],pavement:[0,1.73,.0],underCanopy:[8.05,1.73,-13.0],
 access:[13.25,1.63,-20.73],threshold:[12.07,1.71,-23.4],
 handoff:[VESTIBULE_HANDOFF_V112.x,VESTIBULE_HANDOFF_V112.y,VESTIBULE_HANDOFF_V112.z]
};
const G={
 ahead:[2,2.9,-22],softAhead:[1.2,2.7,-22],softSign:[.5,3.4,-22],
 sign:[-10.5,13.13,-22],dash:[-9.9,.94,13.30],clockDash:[-9.96,.98,16.88],
 mirror:[-12,2.06,16.1],door:[-14,1.62,17.18],mall:[12,2,-22],
 posters:[-17,3.0,-22],entrance:[12,1.5,-22],keypad:[13.65,1.37,-21.72],
 inside:[10,2.4,-48],forward:[VESTIBULE_HANDOFF_V112.x,VESTIBULE_HANDOFF_V112.y,VESTIBULE_HANDOFF_V112.z-18],directory:[0,2.5,-56],
 storefront:[-13,3.1,-59],hall:[0,2.4,-71]
};
// Normalized cue times: f=0..1, eye=[x,y,z], gaze=[x,y,z], mode "walk" or "hold".
// A hold turns the eyes/head rapidly near its mark, then remains still,
// rather than slowly dollying through an entire spoken line.
const f=(at,eye,gaze,mode='hold')=>({at,eye:vec(eye),gaze:vec(gaze),mode});
const cues={
 arrival:[
  f(0,E.driver,G.ahead),f(.63,E.driver,G.ahead),
  f(.84,E.driver,G.softAhead),f(1,E.driver,G.softAhead)
 ],
 clock:[
  // Renee apologizes for the hour: a brief motivated downward glance at
  // the real dashboard readout, returning to the windshield afterward.
  f(0,E.driver,G.softAhead),f(.16,E.driver,G.softAhead),
  f(.29,E.driver,G.clockDash),f(.48,E.driver,G.clockDash),
  f(.62,E.driver,G.softAhead),f(.84,E.driver,G.ahead),
  f(1,E.driver,G.ahead)
 ],
 closed:[
  f(0,E.driver,G.ahead),f(.68,E.driver,G.ahead),
  f(.88,E.driver,G.softAhead),f(1,E.driver,G.softAhead)
 ],
 work:[
  f(0,E.driver,G.softAhead),f(.26,E.driver,G.softAhead),
  f(.46,E.driver,G.ahead),f(1,E.driver,G.ahead)
 ],
 safety:[
  f(0,E.driver,G.ahead),f(.83,E.driver,G.ahead),
  f(1,E.driver,G.softAhead)
 ],
 owner:[
  f(0,E.driver,G.ahead),f(.12,E.driver,G.door),
  f(.22,E.doorLean,G.door,'walk'),
  f(.37,E.doorOutside,[-18,1.9,13],'walk'),
  // Exit at the real front door, then keep walking during Renee's long
  // explanation. The next dialogue must not inherit 20m of travel debt.
  f(.52,[-10.9,1.74,15.0],G.mall,'walk'),
  f(.72,[-7.3,1.73,10.0],G.sign,'walk'),
  f(.88,[-4.0,1.73,6.5],G.entrance,'walk'),
  f(1,[-2.0,1.73,3.5],G.entrance,'walk')
 ],
 entrance:[
  f(0,[-2.0,1.73,3.5],G.entrance),
  f(.20,[-.3,1.73,1.0],G.posters,'walk'),
  f(.39,[1.4,1.73,-1.5],G.sign,'walk'),
  f(.58,[3.0,1.73,-4.5],G.entrance,'walk'),
  f(.80,[4.8,1.73,-7.6],G.keypad,'walk'),
  f(1,[6.0,1.73,-10.0],G.keypad,'walk')
 ],
 lights:[
  // Constant ~1.3m/s walking pace through the final approach. Previous
  // .76→.82 segment traveled 2.05m in .72s, causing a visible late sprint.
  // Stop just to the left of the keypad for a near-frontal look at the LCD.
  f(0,[6.0,1.73,-10.0],G.keypad),
  f(.20,[7.77,1.73,-12.62],G.keypad,'walk'),
  f(.40,[9.54,1.73,-15.24],G.keypad,'walk'),
  f(.60,[11.31,1.72,-17.85],G.keypad,'walk'),
  f(.76,[12.72,1.68,-19.94],G.keypad,'walk'),
  f(.82,E.access,G.keypad,'walk'),
  f(1,E.access,G.keypad)
 ],
 inside:[
  // Code is already accepted. Turn toward the actual doorway as it opens,
  // then enter the real vestibule WHILE dispatch gives the confirmation.
  f(0,E.access,G.keypad),
  f(.08,E.access,G.keypad),
  f(.17,E.access,G.inside),
  f(.24,[12.0,1.72,-21.05],G.inside,'walk'),
  f(.34,[12.0,1.71,-22.15],G.inside,'walk'),
  f(.54,[12.0,1.71,-24.4],G.inside,'walk'),
  f(.78,[12.0,1.72,-26.6],G.forward,'walk'),
  f(1,[12.25,1.72,-28.4],G.forward,'walk')
 ],
 promise:[
  f(0,[12.25,1.72,-28.4],G.forward),
  f(.22,[12.30,1.72,-29.1],G.forward,'walk'),
  f(.64,[12.38,1.72,-30.1],G.forward,'walk'),
  f(1,[12.45,1.72,-30.85],G.forward,'walk')
 ],
 direction:[
  // The film stops halfway down the physical 20.5 m service vestibule,
  // looking forward at its CLOSED interior fire door. It never crosses
  // the x≈10, z=-43 portal into the atrium.
  f(0,[12.45,1.72,-30.85],G.forward),
  f(.30,[12.48,1.71,-31.65],G.forward,'walk'),
  f(.55,E.handoff,G.forward,'walk'),
  f(.78,E.handoff,G.forward),
  f(1,E.handoff,G.forward)
 ]
};
const WALK_CUES=new Set(['owner','entrance','lights','inside','promise','direction']);
const indoor=new Set(['promise','direction']);
export class HumanCameraRig{
 constructor(){
  this.eye=vec(E.driver);this.focus=vec(G.ahead);
  this.prevEye=vec(E.driver);this.distance=0;this.initialized=false;
  this.lastCue='';this.lastElapsed=0;
 }
 sample(id,elapsed,duration,dt,{reducedMotion=false,paused=false}={}){
  const sequence=cues[id]||cues.arrival;
  const phase=clamp(elapsed/Math.max(.001,duration),0,1);
  let i=sequence.findIndex((frame,index)=>index+1<sequence.length&&phase<sequence[index+1].at);
  if(i<0)i=sequence.length-2;
  const left=sequence[i],right=sequence[i+1];
  const norm=clamp((phase-left.at)/Math.max(.00001,right.at-left.at),0,1);
  const segmentSecs=(right.at-left.at)*duration;
  // Eye position: 1) short lean when seated, 2) sustained physical travel when walking.
  // Walking carries its momentum THROUGH path markers; seated shifts are
  // slow, deliberate movements with a sustained gaze between them.
  const eyeBlend=right.mode==='walk'?norm:smooth(clamp(norm*segmentSecs/.90,0,1));
  const gazeBlend=right.mode==='walk'?norm:smooth(clamp(norm*segmentSecs/1.15,0,1));
  const desiredEye=lerp(left.eye,right.eye,eyeBlend);
  const desiredFocus=lerp(left.gaze,right.gaze,gazeBlend);
  // Advancing to another spoken line must never snap the head to its new first pose.
  const jump=!this.initialized||(id===this.lastCue&&elapsed<this.lastElapsed-.15);
  if(jump){this.eye.copy(desiredEye);this.focus.copy(desiredFocus);}
  else{
   this.eye.lerp(desiredEye,1-Math.exp(-dt*5.0));
   this.focus.lerp(desiredFocus,1-Math.exp(-dt*4.5));
  }
  // Freeze the handoff pose at the end of the final voiced cue. The
  // gameplay camera must not inherit smoothed drift from the movie.
  if(id==='direction'&&phase>=.78){this.eye.copy(E.handoff);this.focus.copy(vec(G.forward));}
  this.initialized=true;
  const horizontal=Math.hypot(this.eye.x-this.prevEye.x,this.eye.z-this.prevEye.z);
  const locomotion=WALK_CUES.has(id)&&horizontal>.0003;
  this.distance+=locomotion?Math.min(horizontal,.055):0;
  this.prevEye.copy(this.eye);this.lastCue=id;this.lastElapsed=elapsed;
  const at=this.eye.clone(),look=this.focus.clone();
  if(!reducedMotion&&!paused&&!(id==='direction'&&phase>=.78)){
   // Driven by actual walked distance. No perpetual idle vertical bob.
   if(locomotion){
    const step=this.distance*10.4;
    at.y+=Math.sin(step)*.017+Math.sin(step*2)*.007;
    at.x+=Math.sin(step)*.006;
    look.y+=Math.cos(step)*.009;
   }else{
    const breath=Math.sin(elapsed*.94)*.0035;
    at.y+=breath;
    look.y+=breath*.55;
   }
  }
  const interior=indoor.has(id);
  // The contractor latch grants access at the end of 'lights', so the steel
  // door begins opening immediately on the confirmation instead of waiting
  // ten seconds for the end of the following dialogue.
  const doorOpen=id==='inside'
   ?smooth(clamp((phase-.01)/.12,0,1))*(1-smooth(clamp((phase-.54)/.08,0,1)))
   :0;
  // Rain crosses from cabin to outdoors on the first door-opening movement:
  // both ambience sources are already decoded for an immediate 45ms handoff.
  let carWeight=['arrival','clock','closed','work','safety'].includes(id)?1:0;
  let exteriorWeight=['entrance','lights'].includes(id)?1:id==='inside'?(at.z>=-22.55?1:0):0;
  if(id==='owner'){
   // The exterior bed starts precisely as the door first swings, before the
   // camera crosses the sill. Never revert while walking toward the mall.
   const outside=phase>=CAR_DOOR_OPEN_PHASE;
   carWeight=outside?0:1;exteriorWeight=outside?1:0;
  }
  // Once the player crosses the threshold, indoor acoustics take over.
  if(id==='promise'||id==='direction')
   exteriorWeight=this.eye.z>=-22.55?1:0;
  return{
   position:at,lookAt:look,doorOpen,
   rain:{car:clamp(carWeight,0,1),outside:clamp(exteriorWeight,0,1)},
   isWalking:locomotion,
   cue:id,phase,
   gazeTarget:look.toArray()
  };
 }
}
export const humanCameraCues=Object.freeze(Object.keys(cues));
export const driverSeatPose=Object.freeze([...E.driver]);
export const dashboardGazeTarget=Object.freeze([...G.dash]);
