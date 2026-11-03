import test from 'node:test';
import assert from 'node:assert/strict';
import {HumanCameraRig} from '../opening/camera-v65.js';

// Mutations this test must catch: a dialogue-phase rain cut, a delayed
// crossfade, or an exterior bed triggered before the driver clears the door.
test('the outdoor bed changes on the first frame the camera leaves the enclosed car',()=>{
 const rig=new HumanCameraRig();
 const seconds=22;
 let physicalExit=null,acousticExit=null,earlyOutside=false;
 for(let frame=0;frame<=1320;frame++){
  const t=frame/60,pose=rig.sample('owner',t,seconds,1/60);
  const outside=pose.position.x<=-11.15;
  if(outside&&physicalExit===null)physicalExit=t;
  if(pose.rain.outside>=.95&&acousticExit===null)acousticExit=t;
  if(!outside&&pose.rain.outside>.05)earlyOutside=true;
 }
 assert.ok(physicalExit!==null,'camera must leave through the driver-side door');
 assert.ok(acousticExit!==null,'outdoor rain must be triggered');
 assert.equal(earlyOutside,false,'do not play the exterior bed while still in the car');
 assert.ok(Math.abs(acousticExit-physicalExit)<=1/60+.001,
  'acoustic change must coincide with physical door crossing, not dialogue progress');
});
