import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {HumanCameraRig,driverSeatPose} from '../opening/camera-v65.js';

const path='opening/assets/v75/low-poly_sedan_car.glb';
const sha='224db7dfd80b36dccf868f8bc71e221a284df6b8e7dca9986843c382c7722b7e';

test('chosen Sketchfab sedan is a pinned, fully local GLB with real independent front doors',async()=>{
 const bytes=await readFile(path);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),sha);
 assert.equal(bytes.toString('ascii',0,4),'glTF');
 assert.equal(bytes.readUInt32LE(4),2);
 assert.equal(bytes.readUInt32LE(8),bytes.length);
 const jsonLength=bytes.readUInt32LE(12);
 const gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString('utf8'));
 assert.equal(gltf.asset.extras.author,'scailman (https://sketchfab.com/scailman)');
 assert.match(gltf.asset.extras.license,/CC-BY-4\.0/);
 assert.equal(gltf.meshes.length,44);
 assert.equal(gltf.images?.length??0,0);
 const names=new Set(gltf.nodes.map(n=>n.name));
 for(const name of ['Chassis','Interior','Windows','Steerwheel','FL_Door','FR_Door','RL_Door','RR_Door']){
  assert.ok(names.has(name),'separate physical car component missing: '+name);
 }
 const meta=JSON.parse(await readFile('opening/assets/v75/manifest.json','utf8'));
 assert.equal(meta.source,gltf.asset.extras.source);
 assert.equal(meta.sha256,sha);
 assert.equal(meta.license,'CC-BY-4.0');
});
test('seated eye stays behind the new sedan steering wheel, not in the dashboard',()=>{
 // The actual front-left doorway ends at world Z 17.50, and the wheel
 // occupies Z 16.86–17.02. Seat the eye comfortably behind that wheel
 // but decisively ahead of the rear passenger door (Z >= 17.58).
 assert.ok(driverSeatPose[0]<-10.25&&driverSeatPose[0]>-10.52);
 assert.ok(driverSeatPose[1]>=1.14&&driverSeatPose[1]<=1.38);
 assert.ok(driverSeatPose[2]>=17.15&&driverSeatPose[2]<=17.48,
  'driver eye is behind the wheel but inside the front-door seating bay: '+driverSeatPose[2]);
 const p=new HumanCameraRig().sample('arrival',0,8,0);
 assert.ok(p.position.distanceToSquared({x:driverSeatPose[0],y:driverSeatPose[1],z:driverSeatPose[2]})<.00001);
});
test('exit route crosses the real left-side threshold without jumping outdoors early',()=>{
 const rig=new HumanCameraRig();
 const frames=[];
 for(let i=0;i<=90;i++){
  const elapsed=23*i/90;
  const p=rig.sample('owner',elapsed,23,23/90);
  frames.push(p);
 }
 assert.ok(frames[0].position.x>-11.15);
 assert.ok(frames.at(-1).position.x>-10);
 const firstOutside=frames.findIndex(p=>p.position.x<=-11.15);
 assert.ok(firstOutside>0,'driver must cross left door during owner cue');
 assert.ok(frames[firstOutside].rain.outside>.9);
 const beforeDoor=rig.sample('owner',23*.05,23,23/90);
 const afterDoor=rig.sample('owner',23*.07,23,23/90);
 assert.ok(beforeDoor.rain.car>.95,'inside sound until door starts opening');
 assert.ok(afterDoor.rain.outside>.95,'outside rain before physically crossing door');
});

test('exit crosses the front-left opening, never the solid rear door',()=>{
 // Actual GLB world-space door bounds at 1.86 m vehicle width:
 // FL_Door Z 16.62..17.50; RL_Door Z 17.582..18.297.
 // Only consider the exit beat (phase <= .42); later the player crosses
 // the same X coordinate again while walking well ahead of the car.
 // The left-side body seam is x=-10.77. Measure the real interpolated
 // eye position as it crosses the sedan side, not the hand-authored cue list.
 const rig=new HumanCameraRig();
 const crossed=[];
 for(let i=0;i<=180;i++){
  const phase=i/180;
  const frame=rig.sample('owner',23*phase,23,23/180,{reducedMotion:true});
  if(phase<=.42&&frame.position.x<=-10.77&&frame.position.x>=-11.30)
   crossed.push({phase,x:frame.position.x,z:frame.position.z});
 }
 assert.ok(crossed.length>4,'camera must move through the front-left doorway');
 for(const point of crossed){
  assert.ok(point.z>=16.65&&point.z<=17.47,
   'camera intersects rear door rather than open front door: '+JSON.stringify(point));
 }
});
