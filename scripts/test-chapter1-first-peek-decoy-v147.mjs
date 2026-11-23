import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {FIRST_PEEK_V147,canDivertProtectedPeekV147,chooseProtectedPeekEndV147}
 from '../mall/chapter1-first-peek-decoy-v147.mjs';
import {installChapter1FirstPeekDecoyV147}
 from '../mall/chapter1-first-peek-decoy-v147.js';

test('first-sighting response requires a real audible active decoy within protected visible peek',()=>{
 const args={chapter:1,revealed:true,now:12,graceUntil:25,
  peekUntil:16,visible:true,state:'stalk',sourceActive:true,
  pathMetres:15,alreadyDiverted:false};
 assert.equal(canDivertProtectedPeekV147(args),true);
 for(const changes of [
  {chapter:2},{revealed:false},{now:25},{graceUntil:12},
  {peekUntil:12.25},{visible:false},{state:'hunt'},
  {sourceActive:false},{alreadyDiverted:true},{pathMetres:Infinity},
  {pathMetres:28},{pathMetres:-1}
 ])assert.equal(canDivertProtectedPeekV147({...args,...changes}),false,
  'invalid protected intro decoy accepted: '+JSON.stringify(changes));
 assert.equal(FIRST_PEEK_V147.audibleOriginalNavMetres,27);
 assert.equal(chooseProtectedPeekEndV147({now:12,previousPeekUntil:16}),
  12+FIRST_PEEK_V147.soundTurnSeconds);
 assert.equal(chooseProtectedPeekEndV147({now:12,previousPeekUntil:12.7}),12.7);
 assert.throws(()=>chooseProtectedPeekEndV147({now:13,previousPeekUntil:12}),/non-expired/);
});
function fixture(){
 const root=new THREE.Group(),decoy={state:'active',mesh:new THREE.Group()};
 decoy.mesh.position.set(-21.5,.1,-79);root.position.set(-26,0,-79);
 let revealed=false,realHear=0,realUpdate=0;
 const attendant={root,awake:true,state:'dormant',peekUntil:0,
  hear(){realHear++;},update(){
   realUpdate++;
   if(!revealed){
    revealed=true;this.state='stalk';this.peekUntil=game.time+2.7;
    this.root.visible=true;
   }else if(this.state==='stalk'&&game.time>=this.peekUntil){
    this.state='dormant';this.root.visible=false;
   }else if(this.state==='stalk'){
    this.root.rotation.y=-.3; // genuine stalk would look at the player
   }
  }};
 root.visible=false;
 const game={time:10,levelIndex:0,attendant,decoyObjs:[decoy],decoys:0,
  __chapter1StealthV139:{getState:()=>({revealed,graceUntil:25})},
  __chapter1RecoveryV140:{},__chapter1DecoyResponseV146:{},
  world:{navDistance:()=>15},resetState(){this.time=0;revealed=false;this.attendant.state='dormant';}};
 return {game,decoy,attendant,read:()=>({realHear,realUpdate})};
}
test('original actor reacts to REAL thrown source during peek without changing protected grace or starting hunt',()=>{
 const {game,decoy,attendant,read}=fixture();
 const ctrl=installChapter1FirstPeekDecoyV147(game);
 assert.equal(installChapter1FirstPeekDecoyV147(game),ctrl,'no double original wrapper');
 attendant.update(.016,game.time,{},0);
 const before=ctrl.getState();
 assert.equal(before.extended,true);
 assert.equal(before.graceUntil,25);
 assert.equal(before.peekUntil,game.time+FIRST_PEEK_V147.minimumRevealSeconds);
 assert.equal(before.originalPeekEnd,game.time+2.7);
 const p=decoy.mesh.position;
 game.time=10.8;attendant.hear(p,1,'decoy');
 const after=ctrl.getState();
 assert.equal(after.diverted,true);assert.equal(after.diversionCount,1);
 assert.deepEqual(after.sourceLanding,{x:p.x,z:p.z});
 assert.equal(after.sourceNavMetres,15);
 assert.equal(after.shortenedPeekEnd,game.time+FIRST_PEEK_V147.soundTurnSeconds);
 assert.equal(after.originalAttendantState,'stalk');
 assert.equal(after.originalAttendantVisible,true);
 assert.equal(after.graceUntil,25,'V139 first 15-second nonlethal interval unchanged');
 assert.equal(read().realHear,0,'never call original hear which would start a hunt during grace');
 attendant.update(.016,game.time,{},0);
 assert.equal(ctrl.getState().turns,1);
 assert.ok(attendant.root.rotation.y>1,'original +Z actor physically faces real sound');
 game.time=after.shortenedPeekEnd+.01;
 attendant.update(.016,game.time,{},0);
 assert.equal(ctrl.getState().originalAttendantVisible,false,'first stalk naturally exits early');
 assert.equal(ctrl.getState().originalAttendantState,'dormant');
 assert.equal(read().realHear,0);
 game.resetState();assert.equal(ctrl.getState().diverted,false);
 assert.equal(ctrl.getState().extended,false);
 assert.equal(ctrl.getState().diversionCount,0);
});
test('distant, phantom, pre-reveal and other-chapter sounds never hijack original hearing',()=>{
 const {game,decoy,attendant,read}=fixture();
 installChapter1FirstPeekDecoyV147(game);
 attendant.hear(decoy.mesh.position,1,'decoy');
 assert.equal(read().realHear,1,'normal pre-reveal original chain retained');
 attendant.update(.016,game.time,{},0);
 game.time+=1;
 const original=attendant.peekUntil;
 const distant=game.world.navDistance;
 game.world.navDistance=()=>38;
 attendant.hear(decoy.mesh.position,1,'decoy');
 assert.equal(attendant.peekUntil,original);
 assert.equal(read().realHear,2);
 game.world.navDistance=distant;
 decoy.state='fly';attendant.hear(decoy.mesh.position,1,'decoy');
 assert.equal(read().realHear,3,'phantom flight must not fake landing');
 decoy.state='active';
 game.levelIndex=1;attendant.hear(decoy.mesh.position,1,'decoy');
 assert.equal(read().realHear,4,'later chapters preserve original hearing');
});
test('only original source actor, no fabricated pickup, collider, voice or network',()=>{
 const controller=readFileSync('mall/chapter1-first-peek-decoy-v147.js','utf8');
 const bridge=readFileSync('game.js','utf8');
 assert.match(bridge,/installChapter1DecoyResponseV146\(args\.game\);\s*installChapter1FirstPeekDecoyV147\(args\.game\);/);
 assert.match(controller,/game\.decoyObjs\.find/);
 assert.match(controller,/game\.world\.navDistance\(this\.root\.position,pos,48\)/);
 assert.match(controller,/originalUpdate\.apply\(this,args\)/);
 assert.match(controller,/originalHear\.call\(this,pos,strength,type/);
 assert.doesNotMatch(controller,/world\.interactables\.push|world\.colliders\.push|new Audio|https?:\/\/|localStorage|indexedDB|new THREE\.Mesh/);
});
