import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {CHAPTER1_RECOVERY_V140,isPhysicalContactV140,
 pursueLastKnownV140,afterSearchCooldownV140} from '../mall/chapter1-recovery-rules-v140.mjs';
import {installChapter1RecoveryV140} from '../mall/chapter1-recovery-v140.js';
test('only original unoccluded same-floor contact is lethal, never through walls/cabinets',()=>{
 const player={x:0,z:0},attendant={x:.4,y:0,z:0};
 const args={player,attendant,levelY:0,sight:()=>true};
 assert.equal(isPhysicalContactV140(args),true);
 assert.equal(isPhysicalContactV140({...args,sight:()=>false}),false);
 assert.equal(isPhysicalContactV140({...args,hidden:true}),false);
 assert.equal(isPhysicalContactV140({...args,enteringTime:.8}),false);
 assert.equal(isPhysicalContactV140({...args,enteringTime:.25}),true);
 assert.equal(isPhysicalContactV140({...args,attendant:{x:.4,y:5.4,z:0}}),false);
 assert.equal(isPhysicalContactV140({...args,attendant:{x:1,y:0,z:0}}),false);
});
test('hunt cannot follow live player after losing sight; a real decoy/other chapters stay unchanged',()=>{
 const player={x:20,z:30},last={x:3,z:-5};
 const base={levelIndex:0,state:'hunt',player,target:player,visible:false,lastKnown:last};
 assert.equal(pursueLastKnownV140(base),last);
 assert.equal(pursueLastKnownV140({...base,visible:true}),player);
 assert.equal(pursueLastKnownV140({...base,decoyActive:true}),player);
 assert.equal(pursueLastKnownV140({...base,levelIndex:1}),player);
 assert.equal(pursueLastKnownV140({...base,state:'search'}),player);
 assert.equal(pursueLastKnownV140({...base,lastKnown:null}),player);
});
test('cooldown applies only after completed Chapter 1 source AI search',()=>{
 assert.equal(afterSearchCooldownV140({before:'search',after:'dormant',current:5}),12);
 assert.equal(afterSearchCooldownV140({before:'search',after:'dormant',current:22}),22);
 assert.equal(afterSearchCooldownV140({levelIndex:1,before:'search',after:'dormant',current:5}),5);
 assert.equal(afterSearchCooldownV140({before:'hunt',after:'search',current:4}),4);
});
function fixture(){
 const player=new THREE.Vector3(10,1.7,0),root=new THREE.Group();
 root.position.set(.3,0,0);root.visible=true;
 const a={root,state:'hunt',nextStalk:2,lastHeard:new THREE.Vector3(2,0,2),
  decoyUntil:0,path:[],target:null,
  canSee(){return false;},
  setPath(to){this.target=to;this.path=[{x:to.x,z:to.z}];},
  update(dt){if(this.state==='hunt')this.setPath(player);
   else if(this.state==='search'){this.state='dormant';this.nextStalk=5;this.root.visible=false;}},
 };
 let genuine=0,resetCalls=0,interacts=0;
 const game={levelIndex:0,time:50,breakers:1,decoys:1,dead:false,
  running:true,modal:false,won:false,flashFlicker:0,
  controls:{yaw:{position:player}},attendant:a,mallLevelYV70:0,
  world:{hasLOS:()=>false},__chapter1StealthV139:{getState:()=>({
   cabinet:{interactive:true},pickups:[]})},
  die(){this.dead=true;genuine++;},resetState(){resetCalls++;this.dead=false;this.breakers=0;},
  updateInteraction(){interacts++;}};
 return {game,a,player,read:()=>({genuine,resetCalls,interacts})};
}
test('real original AI methods are wrapped only once; no psychic path and blocked wall death',()=>{
 const {game,a,player,read}=fixture(),api=installChapter1RecoveryV140(game);
 assert.equal(installChapter1RecoveryV140(game),api);
 a.update(.04,game.time,player,0);
 assert.equal(a.target,a.lastHeard);
 assert.equal(api.getState().lostPlayerPaths,1);
 game.die(CHAPTER1_RECOVERY_V140.contactDeathReason);
 assert.equal(game.dead,false);
 assert.equal(api.getState().blockedGhostContact,1);
 assert.equal(read().genuine,0);
 game.world.hasLOS=()=>true;
 game.controls.yaw.position.set(.5,1.7,0);
 game.die(CHAPTER1_RECOVERY_V140.contactDeathReason);
 assert.equal(game.dead,true);
 assert.equal(read().genuine,1);
});
test('search ends with a real respite and resets all cue/recovery state on chapter restart',()=>{
 const {game,a}=fixture(),api=installChapter1RecoveryV140(game);
 a.state='hunt';a.canSee=()=>true;a.update(.02,game.time,game.controls.yaw.position,0);
 assert.ok(api.getState().lostPlayerPaths===0);
 a.state='search';a.update(.05,game.time,game.controls.yaw.position,0);
 assert.equal(api.getState().searchCooldowns,1);
 assert.equal(api.getState().nextStalk,12);
 a.state='hunt';game.attendant.state='hunt';
 game.levelIndex=1;game.die(CHAPTER1_RECOVERY_V140.contactDeathReason);
 assert.equal(game.dead,true,'later chapters retain unmodified death behavior');
 game.resetState();
 assert.equal(api.getState().lostPlayerPaths,0);
 assert.equal(api.getState().blockedGhostContact,0);
 assert.equal(api.getState().searchCooldowns,0);
 assert.equal(api.getState().nextStalk,12,'reset is responsible for original attendant reset separately');
});
