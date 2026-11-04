import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {HumanCameraRig} from '../opening/camera-v65.js';

const manifest=JSON.parse(await readFile(new URL('../opening/audio/manifest.json',import.meta.url),'utf8')).files;
const dialogue=JSON.parse(await readFile(new URL('../opening/script.json',import.meta.url),'utf8')).lines;
const durations=Object.fromEntries(dialogue.map(line=>[line.id,manifest[line.id].duration+line.pause]));
const hypot=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const samples=(rig,id,seconds,step=1/60)=>{
 const result=[];
 for(let t=0;t<=seconds+1e-4;t+=step)result.push({t,pose:rig.sample(id,t,seconds,step)});
 result.push({t:seconds,pose:rig.sample(id,seconds,seconds,step)});
 return result;
};
test('exterior approach reaches the contractor pad before the first number press, without a late sprint',()=>{
 const rig=new HumanCameraRig();
 samples(rig,'owner',durations.owner);
 const entrance=samples(rig,'entrance',durations.entrance);
 const lights=samples(rig,'lights',durations.lights);
 for(const [id,frames] of [['entrance',entrance],['lights',lights]]){
  let fastest=0;
  for(let i=1;i<frames.length;i++){
   const dt=frames[i].t-frames[i-1].t;
   if(dt>0)fastest=Math.max(fastest,hypot(frames[i].pose.position.toArray(),frames[i-1].pose.position.toArray())/dt);
  }
  assert.ok(fastest<3.25,id+' approach suddenly sprints at '+fastest.toFixed(2)+' m/s');
 }
 const voiceEnd=manifest.lights.duration;
 const arrival=lights.reduce((best,item)=>Math.abs(item.t-voiceEnd)<Math.abs(best.t-voiceEnd)?item:best);
 const pad=[12.80,1.63,-20.73];
 assert.ok(hypot(arrival.pose.position.toArray(),pad)<.45,
  'camera is still '+hypot(arrival.pose.position.toArray(),pad).toFixed(2)+'m from keypad when the arm begins entering code');
 for(const frames of [entrance,lights]){
  for(let t=1.5;t<frames.at(-1).t-2;t+=1.5){
   const before=frames.reduce((a,b)=>Math.abs(a.t-t)<Math.abs(b.t-t)?a:b);
   const after=frames.reduce((a,b)=>Math.abs(a.t-t-1.5)<Math.abs(b.t-t-1.5)?a:b);
   assert.ok(hypot(before.pose.position.toArray(),after.pose.position.toArray())>.55,
    'camera stalls for more than 1.5 seconds at '+t.toFixed(1)+'s');
  }
 }
});
test('access grant quickly swings the actual door and camera crosses during the confirmation',()=>{
 const rig=new HumanCameraRig();
 for(const id of ['owner','entrance','lights'])samples(rig,id,durations[id]);
 const interior=samples(rig,'inside',durations.inside);
 const twoSec=interior.reduce((best,item)=>Math.abs(item.t-2)<Math.abs(best.t-2)?item:best);
 assert.ok(twoSec.pose.doorOpen>.95,'door must open within two seconds of access confirmation');
 const crossing=interior.find(item=>item.pose.position.z<-22.55);
 assert.ok(crossing,'camera must enter the vestibule during the confirmation line');
 assert.ok(crossing.pose.doorOpen>.95,'real service door must be fully open before threshold crossing');
 const last=interior.at(-1).pose;
 assert.ok(last.position.z<-26&&last.position.x>9&&last.position.x<16,'end the confirmation inside the actual contractor vestibule');
 assert.ok(last.rain.outside<.1,'outdoor rain should stop upon entering the physical mall');
 const promiseFirst=rig.sample('promise',0,durations.promise,1/60);
 assert.ok(hypot(last.position.toArray(),promiseFirst.position.toArray())<.30,'next dialogue must not jump camera backward toward outside');
});
