import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {CHAPTER1_STEALTH_V139,chooseDistantRevealV139,validateStealthRoutesV139}
 from '../mall/chapter1-stealth-plan-v139.mjs';
import {FURNISHINGS_V69} from '../mall/furnishing-plan-v69.mjs';
import {installChapter1StealthV139,restoreChapter1StealthPickupsV139}
 from '../mall/chapter1-stealth-v139.js';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';

test('original source GLB has separate real hingeable left/right door meshes',()=>{
 const src=FURNISHINGS_V69.fixtures.find(f=>f.id===CHAPTER1_STEALTH_V139.cabinet.id);
 assert.equal(src.role,'cabinet');
 const bin=readFileSync(src.model);
 assert.equal(bin.toString('ascii',0,4),'glTF');
 const len=bin.readUInt32LE(12),json=JSON.parse(bin.subarray(20,20+len).toString('utf8'));
 const left=json.nodes.find(n=>n.name==='doorLeft'),right=json.nodes.find(n=>n.name==='doorRight');
 assert.ok(left?.mesh>=0&&right?.mesh>=0&&left.mesh!==right.mesh);
 assert.ok(json.meshes[left.mesh].primitives.length>0);
 assert.ok(json.meshes[right.mesh].primitives.length>0);
});
test('physical cabinet and both recovered original decoys remain reachable',()=>{
 assert.deepEqual(validateStealthRoutesV139(),[]);
 for(const item of CHAPTER1_STEALTH_V139.pickups){
  const point=storyTargetV70({chapter:1,type:'decoy',label:item.label});
  assert.deepEqual([point.room,point.x,point.z],[item.room,item.x,item.z]);
  assert.equal(point.canonical,true);
 }
});
test('restore original in-game decoy pickups once without obsolete store shells',()=>{
 const sample="function makePickup(type,pos,label,text=null){}\nworld.root.add(masterServiceKeyV137);world.interactables.push(masterServiceKeyV137);";
 const patched=restoreChapter1StealthPickupsV139(sample);
 assert.equal((patched.match(/makePickup\('decoy'/g)||[]).length,2);
 assert.match(patched,/Noise Maker/);
 assert.match(patched,/Pager Decoy/);
 assert.doesNotMatch(patched,/buildArcade\(world\)/);
 assert.throws(()=>restoreChapter1StealthPickupsV139(patched),/missing or repeated/);
});
test('distant reveal requires real walk and LOS, in forward view and never within grabbing range',()=>{
 const walk=new Set(['10,0','11,0','12,0','3,0','11,10','-11,0','0,-12']);
 const player={x:0,y:1.7,z:0},forward={x:1,z:0};
 const selected=chooseDistantRevealV139({player,forward,walk,
  passable:(x,z)=>x!==10,sight:pt=>pt.x!==12});
 assert.deepEqual([selected.x,selected.z],[11,0]);
 assert.ok(selected.distance>=9&&selected.distance<=14);
 assert.equal(chooseDistantRevealV139({player,forward,walk,
  passable:()=>false,sight:()=>true}),null);
 assert.equal(chooseDistantRevealV139({player,forward,walk:new Set(['0,-12']),
  passable:()=>true,sight:()=>true}),null);
});
function makeGame(){
 const building=new THREE.Group(),model=new THREE.Group();
 model.name='furnished_fallow_display';
 model.userData={fixtureId:'fallow_display',role:'cabinet',modelSource:'assets/vendor/runtime/3d7dfedf514e5c4e/bookcaseClosedDoors.glb'};
 model.position.set(-43,0,-54);
 const l=new THREE.Group(),r=new THREE.Group();
 l.name='doorLeft';r.name='doorRight';model.add(l,r);building.add(model);
 const attendant={root:new THREE.Group(),state:'dormant',awake:false,
  prevPos:new THREE.Vector3(),heard:0,updates:0,awakeCalls:0,
  hear(){this.heard++;},awaken(){this.awake=true;this.awakeCalls++;},
  update(){this.updates++;},reset(){this.awake=false;this.state='dormant';this.root.visible=false;}};
 attendant.root.visible=false;
 const game={mallV70:{group:building},levelIndex:0,breakers:0,decoys:0,time:0,
  world:{interactables:[],walk:new Set(['11,0','12,0','3,0','-11,0']),
   navPassable:(x,z)=>x!==3,hasLOS:()=>true},
  controls:{yaw:{position:new THREE.Vector3(0,1.7,0)},pitch:{rotation:{x:0}}},
  camera:{getWorldDirection(out){return out.set(1,0,0)}},
  attendant,entered:null,interactTarget:null,running:true,modal:false,playerHidden:false,
  enterCabinet(cab){this.entered=cab;},updateInteraction(){},
  interact(){
   const o=this.interactTarget;if(!o)return;
   if(o.userData.type==='cabinet')this.enterCabinet(o);
   else if(o.userData.type==='breaker'&&!o.userData.on){
    o.userData.on=true;this.breakers++;this.attendant.awaken();this.attendant.hear(this.controls.yaw.position,.78,'breaker');
   }else if(o.userData.type==='decoy'&&!o.userData.collected){
    o.userData.collected=true;this.decoys++;
   }
  },
  resetState(){this.breakers=0;this.decoys=0;this.time=0;this.attendant.reset();}
 };
 return {game,model,l,r,attendant};
}
test('real licensed cabinet is interactive with original-meter hide camera and actual GLB doors',()=>{
 const {game,model,l,r}=makeGame();
 const ctrl=installChapter1StealthV139(game);
 assert.equal(installChapter1StealthV139(game),ctrl,'do not double wrap');
 assert.ok(game.world.interactables.includes(model));
 assert.equal(model.parent,game.mallV70.group,'do not move the authored model out of its film/Builder scene');
 assert.equal(model.userData.modelSource,ctrl.getState().cabinet.source);
 game.interactTarget=model;game.interact();
 assert.notEqual(game.entered,model,'original GLB source scale must not corrupt eye height');
 assert.equal(game.entered.userData.hingeL,l);
 assert.equal(game.entered.userData.hingeR,r);
 const target=game.entered.localToWorld(new THREE.Vector3(0,1.70,.04));
 assert.ok(Math.abs(target.y-1.7)<1e-8,'hide eye stays true 1.7m from original solid floor');
 assert.ok(Math.abs(target.x+43)<.1&&Math.abs(target.z+54)<.1);
 game.entered.userData.hingeL.rotation.y=-1.42;
 game.entered.userData.hingeR.rotation.y=1.42;
 game.resetState();
 assert.equal(l.rotation.y,0);assert.equal(r.rotation.y,0);
});
test('first breaker creates an LOS-reachable safe reveal BEFORE authentic hunt',()=>{
 const {game,attendant}=makeGame(),ctrl=installChapter1StealthV139(game);
 game.interactTarget={userData:{type:'breaker',id:'A',on:false}};
 game.interact();
 assert.equal(game.breakers,1);assert.equal(attendant.awake,false);
 assert.equal(attendant.heard,0,'first breaker may not instantly trigger blind hunt');
 const state=ctrl.getState();assert.equal(state.revealed,false);
 assert.ok(state.revealAt-state.firstCircuitAt>=CHAPTER1_STEALTH_V139.revealDelay);
 game.time=state.revealAt+.01;
 attendant.update(.016,game.time,game.controls.yaw.position,.1);
 assert.equal(ctrl.getState().revealed,true);
 assert.equal(attendant.root.visible,true);
 assert.equal(attendant.state,'stalk');
 assert.ok(attendant.root.position.distanceTo(new THREE.Vector3(0,0,0))>=9);
 attendant.hear(game.controls.yaw.position,1,'breaker');
 assert.equal(attendant.heard,0,'protected window must remain a safe first sighting');
 assert.ok(ctrl.getState().graceUntil>game.time+10);
 game.time=ctrl.getState().graceUntil+.01;
 attendant.hear(game.controls.yaw.position,1,'step');
 assert.equal(attendant.heard,1,'real threat returns after protected first sighting');
 assert.ok(attendant.updates>0,'original Attendant animation resumes');
 game.resetState();
 assert.equal(ctrl.getState().revealed,false);
 assert.equal(ctrl.getState().firstCircuitAt,null);
 game.levelIndex=1;
 attendant.awaken();assert.equal(attendant.awakeCalls,1,'later chapters must preserve existing AI');
});
