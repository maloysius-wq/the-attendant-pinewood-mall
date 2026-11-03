/**
 * The Call v62: restrained, continuous human head movement.
 * Hold the windshield gaze through seated dialogue, turn only at motivated
 * moments, and damp walking transitions instead of whip-panning to targets.
 */
import * as THREE from '../vendor/three/build/three.module.js';
const vec=a=>new THREE.Vector3(...a);
const lerp=(a,b,t)=>a.clone().lerp(b,t);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const E={
 // The previous viewpoint sat behind the imported GLB's seatbacks.
 // Mesh-ray samples place this eye ahead of the upholstery and under
 // the original roof without near-field car geometry blocking the frame.
 driver:[-10.38,1.26,17.05],dashLean:[-10.38,1.24,17.01],
 doorLean:[-10.85,1.25,17.04],doorOutside:[-11.82,1.72,17.12],
 parking:[-9.0,1.73,13.0],pavement:[0,1.73,.0],underCanopy:[8.05,1.73,-13.0],
 access:[12.80,1.63,-20.73],threshold:[12.07,1.71,-23.4],concourse:[9.0,1.72,-26.3]
};
const G={
 ahead:[2,2.9,-22],softAhead:[1.2,2.7,-22],softSign:[.5,3.4,-22],
 sign:[-10.5,13.13,-22],dash:[-9.9,.94,13.30],clockDash:[-9.96,.98,16.43],
 mirror:[-12,2.06,16.1],door:[-14,1.62,17.8],mall:[12,2,-22],
 posters:[-17,3.0,-22],entrance:[12,1.5,-22],keypad:[13.65,1.37,-21.72],
 inside:[10,2.4,-48],directory:[0,2.5,-56],
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
  f(.86,[10.4,1.71,-16.6],G.keypad,'walk'),
  f(.96,E.access,G.keypad,'walk'),
  f(1,E.access,G.keypad)
 ],
 inside:[
  f(0,E.access,G.keypad),
  f(.20,E.access,G.keypad),
  f(.41,E.access,G.keypad),
  f(.65,E.access,G.keypad),
  f(.80,E.access,G.keypad),f(.92,E.access,G.inside),
  f(1,E.access,G.keypad)
 ],
 promise:[
  f(0,E.access,G.keypad),f(.14,[12.0,1.72,-21],G.inside,'walk'),
  f(.33,E.threshold,G.inside,'walk'),
  f(.56,[12.0,1.73,-28.0],G.inside,'walk'),
  f(.77,[11.8,1.73,-34.0],G.inside,'walk'),
  f(1,[10.3,1.73,-40.0],G.inside,'walk')
 ],
 direction:[
  // The canonical service vestibule runs x=9..16 down to z=-43. Only its
  // x≈10 portal joins the atrium; the old preview route clipped its west wall.
  f(0,[10.3,1.73,-40.0],G.inside),
  f(.20,[10.3,1.73,-41.0],G.inside,'walk'),
  f(.34,[10.1,1.73,-44.0],G.directory,'walk'),
  f(.48,[9.4,1.73,-47.0],G.hall,'walk'),
  f(.62,[8.0,1.73,-50.0],G.hall,'walk'),
  f(.78,[7.0,1.73,-54.0],G.hall,'walk'),
  f(1,[5.8,1.73,-58.0],G.hall,'walk')
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
  // Acoustic boundary at the moment the driver passes the open car door:
  // switch to the already-decoded outdoor bed, not a multi-second blend.
  let carWeight=['arrival','clock','closed','work','safety'].includes(id)?1:0;
  let exteriorWeight=['entrance','lights'].includes(id)?1:id==='inside'?1-smooth(clamp((phase-.70)/.30,0,1)):0;
  if(id==='owner'){
   // A real car-door boundary, not a fraction of Renee's long speech.
   // The driver clears the left door when the camera crosses this X-plane.
   const outside=this.eye.x<=-11.15;
   carWeight=outside?0:1;exteriorWeight=outside?1:0;
  }
  if(id==='inside')exteriorWeight=1; // Still standing at the outdoor keypad.
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
