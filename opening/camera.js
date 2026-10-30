/**
 * The Call v35: authored first-person head/body blocking.
 * These are eye positions and gaze targets, NOT a Ken Burns zoom.
 * Glances complete in ~0.3 seconds, long dialogue beats hold a gaze,
 * and physical travel receives independent footfall/head-inertia motion.
 */
import * as THREE from '../vendor/three/build/three.module.js';
const vec=a=>new THREE.Vector3(...a);
const lerp=(a,b,t)=>a.clone().lerp(b,t);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const E={
 // Driver eye is IN FRONT of the upholstery blocking v42 and far enough from
 // the vendor steering wheel that it stays in the lower-left of the picture.
 driver:[-10.20,1.24,17.60],dashLean:[-10.20,1.22,17.55],
 doorLean:[-10.84,1.25,17.59],doorOutside:[-11.82,1.72,17.30],
 parking:[-9.0,1.73,13.0],pavement:[0,1.73,.0],underCanopy:[8.05,1.73,-13.0],
 access:[12.35,1.67,-19.6],threshold:[12.07,1.71,-23.4],concourse:[9.0,1.72,-26.3]
};
const G={
 ahead:[2,2.9,-22],sign:[0,7.55,-22],dash:[-9.9,.94,13.30],
 mirror:[-12,2.06,16.1],door:[-14,1.62,17.8],mall:[12,2,-22],
 posters:[-17,3.0,-22],entrance:[12,1.5,-22],keypad:[13.65,1.37,-21.72],
 inside:[0,2.5,-39],directory:[0,2.5,-31.2],
 storefront:[-13,3.1,-39],hall:[0,2.4,-50]
};
// Normalized cue times: f=0..1, eye=[x,y,z], gaze=[x,y,z], mode "walk" or "hold".
// A hold turns the eyes/head rapidly near its mark, then remains still,
// rather than slowly dollying through an entire spoken line.
const f=(at,eye,gaze,mode='hold')=>({at,eye:vec(eye),gaze:vec(gaze),mode});
const cues={
 arrival:[
  f(0,E.driver,G.ahead),f(.20,E.driver,[-9.0,2.2,-18]),
  f(.38,E.driver,G.ahead),f(.64,E.driver,G.dash),
  f(.76,E.driver,G.dash),f(1,E.driver,G.ahead)
 ],
 clock:[
  f(0,E.driver,G.ahead),f(.12,E.driver,G.dash),
  f(.34,E.dashLean,G.dash),f(.48,E.driver,G.mirror),
  f(.56,E.driver,G.ahead),f(.80,E.driver,G.sign),
  f(1,E.driver,G.ahead)
 ],
 closed:[
  f(0,E.driver,G.ahead),f(.08,E.dashLean,G.dash),
  f(.53,E.dashLean,G.dash),f(.65,E.driver,G.ahead),
  f(.76,E.driver,G.posters),f(.88,E.dashLean,G.dash),
  f(1,E.dashLean,G.dash)
 ],
 work:[
  f(0,E.dashLean,G.dash),f(.20,E.dashLean,G.dash),
  f(.36,E.driver,G.ahead),f(.45,E.driver,G.sign),
  f(.56,E.dashLean,G.dash),f(.83,E.dashLean,G.dash),
  f(1,E.driver,G.ahead)
 ],
 safety:[
  f(0,E.driver,G.ahead),f(.10,E.driver,G.dash),
  f(.49,E.dashLean,G.dash),f(.65,E.driver,G.ahead),
  f(.83,E.driver,G.mirror),f(1,E.driver,G.ahead)
 ],
 owner:[
  f(0,E.driver,G.ahead),f(.12,E.driver,G.door),
  f(.22,E.doorLean,G.door,'walk'),
  f(.37,E.doorOutside,[-18,1.9,13],'walk'),
  f(.52,[-11.8,1.74,16.0],G.mall,'walk'),
  f(.72,[-10.7,1.73,14.7],G.sign,'walk'),
  f(.88,E.parking,G.mall,'walk'),f(1,E.parking,G.entrance)
 ],
 entrance:[
  f(0,E.parking,G.mall),
  f(.20,[-7.8,1.74,10],G.posters,'walk'),
  f(.39,[-5.4,1.74,7],G.sign,'walk'),
  f(.58,[-3.1,1.74,3.6],G.entrance,'walk'),
  f(.80,[-1.3,1.73,1.1],G.entrance,'walk'),
  f(1,E.pavement,G.entrance,'walk')
 ],
 lights:[
  f(0,E.pavement,G.entrance),
  f(.20,[2,1.72,-2.4],G.entrance,'walk'),
  f(.39,[4.1,1.72,-5.9],G.posters,'walk'),
  f(.55,[5.5,1.73,-8.3],G.entrance,'walk'),
  f(.75,[6.9,1.73,-10.9],G.keypad,'walk'),
  f(1,E.underCanopy,G.keypad,'walk')
 ],
 inside:[
  f(0,E.underCanopy,G.entrance),
  f(.20,[9.9,1.73,-16.1],G.keypad,'walk'),
  f(.41,[11.1,1.69,-18.1],G.keypad,'walk'),
  f(.65,E.access,G.keypad,'walk'),
  f(.80,E.access,G.keypad),f(.92,E.access,G.inside),
  f(1,E.access,G.keypad)
 ],
 promise:[
  f(0,E.access,G.keypad),f(.14,[12.0,1.72,-21],G.inside,'walk'),
  f(.33,E.threshold,G.directory,'walk'),
  f(.56,[10.5,1.73,-24.5],G.storefront,'walk'),
  f(.77,E.concourse,G.directory,'walk'),
  f(1,E.concourse,G.inside)
 ],
 direction:[
  f(0,E.concourse,G.inside),
  f(.20,[8.2,1.73,-27.6],G.directory,'walk'),
  f(.34,[7.4,1.73,-28.6],G.directory,'walk'),
  f(.48,[6.8,1.73,-29.2],G.storefront,'walk'),
  f(.62,[6.6,1.73,-30.2],G.inside,'walk'),
  f(.78,[5.7,1.73,-31.9],G.hall,'walk'),
  f(1,[5.4,1.73,-33.0],G.hall,'walk')
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
  const eyeBlend=right.mode==='walk'?smooth(norm):smooth(clamp(norm*segmentSecs/.43,0,1));
  // A glance is a quick attention shift, not a 16-second target interpolation.
  const gazeBlend=right.mode==='walk'?smooth(clamp(norm*segmentSecs/Math.min(segmentSecs,.90),0,1)):smooth(clamp(norm*segmentSecs/.38,0,1));
  const desiredEye=lerp(left.eye,right.eye,eyeBlend);
  const desiredFocus=lerp(left.gaze,right.gaze,gazeBlend);
  const jump=!this.initialized||elapsed<this.lastElapsed-.15;
  if(jump){this.eye.copy(desiredEye);this.focus.copy(desiredFocus);}
  else{
   this.eye.lerp(desiredEye,1-Math.exp(-dt*12));
   this.focus.lerp(desiredFocus,1-Math.exp(-dt*16));
  }
  this.initialized=true;
  const horizontal=Math.hypot(this.eye.x-this.prevEye.x,this.eye.z-this.prevEye.z);
  const locomotion=WALK_CUES.has(id)&&horizontal>.0003;
  this.distance+=locomotion?Math.min(horizontal,.055):0;
  this.prevEye.copy(this.eye);this.lastCue=id;this.lastElapsed=elapsed;
  const at=this.eye.clone(),look=this.focus.clone();
  if(!reducedMotion&&!paused){
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
  const interior=indoor.has(id),isExit=id==='owner';
  const doorOpen=interior?1:id==='inside'?smooth(clamp((phase-.68)/.24,0,1)):0;
  // Rain crossfade is tied to the position in the exiting action, not to a cut.
  let carWeight=id==='owner'?1-smooth(clamp((phase-.18)/.31,0,1)):['arrival','clock','closed','work','safety'].includes(id)?1:0;
  let exteriorWeight=id==='owner'?smooth(clamp((phase-.23)/.35,0,1)):['entrance','lights'].includes(id)?1:id==='inside'?1-smooth(clamp((phase-.70)/.30,0,1)):0;
  if(id==='owner')exteriorWeight=clamp(exteriorWeight,0,1);
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
