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
 // The imported left-side steering wheel is ~45 cm forward of a seated
 // driver's eye after the 5.2-source-unit car is scaled to 1.86 m wide.
 assert.ok(driverSeatPose[0]<-10.25&&driverSeatPose[0]>-10.52);
 assert.ok(driverSeatPose[1]>=1.14&&driverSeatPose[1]<=1.38);
 assert.ok(driverSeatPose[2]>=17.52&&driverSeatPose[2]<=17.92);
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
 assert.ok(frames[firstOutside-1].rain.car>.9);
});
