import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {DECOY_RULES_V146,paceOriginalDecoyBeepV146,
 shouldHearDecoyV146,visiblePlayerOverridesDecoyV146}
 from '../mall/chapter1-decoy-response-v146.mjs';
import {installChapter1DecoyResponseV146} from '../mall/chapter1-decoy-response-v146.js';

test('original source Q thrown mesh and original SFX remain; only Chapter 1 beep spacing changes',()=>{
 const pulse="d.pulse=.45;audio.beep();this.emitSound(d.mesh.position,.72,'decoy');";
 const sample="throwDecoy(){}\nupdateDecoys(dt){"+pulse+"}";
 const patched=paceOriginalDecoyBeepV146(sample);
 assert.match(patched,/this.levelIndex===0\?1\.2:\.45/);
 assert.match(patched,/audio\.beep\(\);this\.emitSound\(d\.mesh\.position,\.72,'decoy'\)/);
 assert.ok(!patched.includes(pulse));
 assert.throws(()=>paceOriginalDecoyBeepV146(patched),/signature drifted/);
 assert.equal(DECOY_RULES_V146.beepSecondsChapter1,1.2);
 assert.equal(patched.includes('throwDecoy(){}'),true);
});
test('original path distance blocks distant noises and line-of-sight wins over decoys',()=>{
 const s={chapter:1,type:'decoy',visible:true,
  seesPlayer:false,navDistance:14};
 assert.equal(shouldHearDecoyV146(s),true);
 assert.equal(shouldHearDecoyV146({...s,navDistance:29}),false);
 assert.equal(shouldHearDecoyV146({...s,navDistance:Infinity}),false);
 assert.equal(shouldHearDecoyV146({...s,visible:false}),false);
 assert.equal(shouldHearDecoyV146({...s,seesPlayer:true}),false);
 assert.equal(shouldHearDecoyV146({...s,sameSource:true,secondsSinceAccepted:1.4}),false);
 assert.equal(shouldHearDecoyV146({...s,sameSource:true,secondsSinceAccepted:2.6}),true);
 assert.equal(shouldHearDecoyV146({...s,chapter:2,navDistance:Infinity}),true);
 assert.equal(shouldHearDecoyV146({...s,type:'step',navDistance:Infinity}),true);
 assert.equal(visiblePlayerOverridesDecoyV146({
  chapter:1,decoyUntil:23,time:20,visible:true,seesPlayer:true
 }),true);
 assert.equal(visiblePlayerOverridesDecoyV146({
  chapter:1,decoyUntil:23,time:20,visible:true,seesPlayer:false
 }),false);
 assert.equal(visiblePlayerOverridesDecoyV146({
  chapter:1,decoyUntil:23,time:20,visible:true,seesPlayer:true,hidden:true
 }),false);
 assert.equal(visiblePlayerOverridesDecoyV146({
  chapter:2,decoyUntil:23,time:20,visible:true,seesPlayer:true
 }),false);
});
function fixture(){
 const player=new THREE.Vector3(-17,1.7,-79),root=new THREE.Group();
 root.visible=true;root.position.set(-17,0,-86);
 const a={root,decoyPos:new THREE.Vector3(),decoyUntil:0,state:'hunt',
  path:[],originalCalls:0,updateCalls:0,seeing:false,
  canSee(){return this.seeing;},
  hear(pos,strength,type){
   this.originalCalls++;this.state='investigate';
   this.decoyPos.copy(pos);this.decoyUntil=game.time+5;
   this.path=[{x:pos.x,z:pos.z}];
  },
  update(){this.updateCalls++;}
 };
 const decoy={state:'active',mesh:new THREE.Group()};
 decoy.mesh.position.set(-21,0.1,-79);
 const game={levelIndex:0,time:50,decoys:1,decoyObjs:[decoy],
  controls:{yaw:{position:player}},
  attendant:a,playerHidden:false,
  world:{navDistance:(from,to)=>Math.hypot(from.x-to.x,from.z-to.z)},
  __chapter1StealthV139:{getState(){return {revealed:true};}},
  __chapter1RecoveryV140:{},__chapter1DecoyTagsV145:{},
  throwDecoy(){},updateDecoys(){},
  resetState(){this.time=0;this.decoyObjs=[];}
 };
 return {game,a,decoy};
}
test('real original hearing runs once per physical pulse cluster, not per 0.45s beep',()=>{
 const {game,a,decoy}=fixture();
 const api=installChapter1DecoyResponseV146(game);
 assert.equal(installChapter1DecoyResponseV146(game),api);
 const p=decoy.mesh.position;
 a.hear(p,1,'decoy');assert.equal(a.originalCalls,1);
 assert.equal(api.getState().heard,1);
 assert.deepEqual(api.getState().originalPathEnd,{x:-21,z:-79});
 game.time+=1.2;a.hear(p,.72,'decoy');
 assert.equal(a.originalCalls,1);assert.equal(api.getState().coalesced,1);
 game.time+=1.3;a.hear(p,.72,'decoy');
 assert.equal(a.originalCalls,2);
 a.hear(new THREE.Vector3(37,0,-79),1,'decoy');
 assert.equal(a.originalCalls,2);assert.equal(api.getState().rejectedFar,1);
 a.seeing=true;
 a.hear(new THREE.Vector3(-22,0,-79),1,'decoy');
 assert.equal(a.originalCalls,2);assert.equal(api.getState().rejectedVisible,1);
 a.decoyUntil=game.time+3;a.update(.016,game.time,game.controls.yaw.position,0);
 assert.equal(a.decoyUntil,game.time);
 assert.equal(api.getState().visualPriority,1);
 game.levelIndex=1;a.hear(new THREE.Vector3(300,0,300),.72,'decoy');
 assert.equal(a.originalCalls,3,'later chapters must use unwrapped original hearing');
 game.levelIndex=0;game.resetState();
 assert.equal(api.getState().heard,0);
 assert.equal(api.getState().visualPriority,0);
});
test('runtime uses only real sound source, original actor, zero added objects or network',()=>{
 const bridge=readFileSync('game.js','utf8');
 const controller=readFileSync('mall/chapter1-decoy-response-v146.js','utf8');
 assert.match(bridge,/unifiedSource=paceOriginalDecoyBeepV146\(unifiedSource\);/);
 assert.match(bridge,/installChapter1DecoyTagsV145\(args\.game\);\s*installChapter1DecoyResponseV146\(args\.game\);/);
 assert.match(controller,/game\.world\.navDistance\(this\.root\.position,pos,48\)/);
 assert.match(controller,/originalHear\.call\(this,pos,strength,type/);
 assert.match(controller,/originalUpdate\.apply\(this,args\)/);
 assert.doesNotMatch(controller,/world\.interactables\.push|world\.colliders\.push|new Audio|https?:\/\/|localStorage|indexedDB/);
});
