import test from 'node:test';
import assert from 'node:assert/strict';
import {chapter1WorkOrderStateV137,installChapter1WorkOrderV137,restoreChapter1PickupV137}
 from '../mall/chapter1-workorder-v137.js';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';

const elements=new Map([
 ['objective',{textContent:'',dataset:{}}],
 ['inventory',{textContent:'',dataset:{}}],
 ['hint',{textContent:'',classList:{show:false,add(x){if(x==='show')this.show=true;}}}]
]);
const oldDocument=globalThis.document;
function makeGame(){
 const calls={start:0,interact:0,updates:0,resets:0,interaction:0};
 const game={levelIndex:0,breakers:0,keys:0,interactTarget:null,exitObject:null,
  updateHUD(){calls.updates++;elements.get('objective').textContent='OLD OBJECTIVE';
   elements.get('inventory').textContent='Keys '+this.keys;},
  interact(){calls.interact++;if(this.interactTarget?.userData?.type==='key'&&
     !this.interactTarget.userData.collected){
    this.interactTarget.userData.collected=true;this.keys++;
   }},
  startElevator(){calls.start++;return 'opening';},
  updateInteraction(){calls.interaction++;elements.get('hint').textContent='E Call freight elevator';},
  resetState(){calls.resets++;this.breakers=0;this.keys=0;}
 };
 return {game,calls};
}
test('work-order stage is deterministic, spoiler-free and never invents an electrical order',()=>{
 assert.deepEqual([0,1,2].map(n=>chapter1WorkOrderStateV137({breakers:n}).stage),
  ['circuits','circuits','circuits']);
 for(const n of [-10,0,1,2,3,8,NaN])
  assert.ok(chapter1WorkOrderStateV137({breakers:n}).current>=0);
 assert.equal(chapter1WorkOrderStateV137({breakers:3}).stage,'service_key');
 assert.equal(chapter1WorkOrderStateV137({breakers:3,keyRecovered:true}).stage,'freight_exit');
 for(const [e,s] of [['opening','elevator_opening'],['waiting','elevator_board'],
  ['closing','elevator_descent'],['ride','elevator_descent']])
  assert.equal(chapter1WorkOrderStateV137({breakers:3,keyRecovered:true,elevator:e}).stage,s);
});
test('only collecting the real named Master Service Key unlocks chapter-one exit',()=>{
 globalThis.document={getElementById:id=>elements.get(id)||null};
 try{
  const {game,calls}=makeGame();
  const installed=installChapter1WorkOrderV137(game);
  assert.equal(installChapter1WorkOrderV137(game),installed,'must not wrap twice');
  game.breakers=3;
  game.updateHUD();assert.equal(elements.get('objective').dataset.chapter1Stage,'service_key');
  assert.equal(game.startElevator(),false,'power alone cannot allow leaving without key');
  assert.equal(calls.start,0,'must not invoke canonical elevator before key');
  assert.match(elements.get('hint').textContent,/Master Service Key/);
  game.interactTarget={userData:{type:'key',label:'A Different Service Key',collected:false}};
  game.interact();assert.equal(installed.getState().keyRecovered,false);
  assert.equal(game.startElevator(),false);
  game.interactTarget={userData:{type:'key',label:'Master Service Key',collected:false}};
  game.interact();
  assert.equal(installed.getState().keyRecovered,true);
  assert.equal(elements.get('objective').dataset.chapter1Stage,'freight_exit');
  assert.match(elements.get('inventory').textContent,/SERVICE KEY VERIFIED/);
  assert.equal(game.startElevator(),'opening');
  assert.equal(calls.start,1);
  game.keys=0;
  assert.equal(game.startElevator(),'opening','recovered service credential is persistent even if another door consumes the physical key');
  game.exitObject={userData:{state:'waiting'}};
  game.updateHUD();
  assert.equal(elements.get('objective').dataset.chapter1Stage,'elevator_board');
  game.resetState();
  assert.equal(installed.getState().keyRecovered,false,'restarting must not inherit previous attempt credential');
  assert.equal(game.startElevator(),'opening','legacy no-power denial stays owned by original elevator');
 }finally{globalThis.document=oldDocument;}
});
test('Chapter 2–6 retain their original HUD, doors and freight behavior',()=>{
 globalThis.document={getElementById:id=>elements.get(id)||null};
 try{
  const {game,calls}=makeGame();
  installChapter1WorkOrderV137(game);
  for(let i=1;i<=5;i++){
   game.levelIndex=i;game.breakers=3;
   game.updateHUD();assert.equal(elements.get('objective').textContent,'OLD OBJECTIVE');
   assert.equal(game.startElevator(),'opening');
  }
  assert.equal(calls.start,5);
 }finally{globalThis.document=oldDocument;}
});
test('original interaction hint is not overwritten away from the Chapter 1 freight exit',()=>{
 globalThis.document={getElementById:id=>elements.get(id)||null};
 try{
  const {game}=makeGame();installChapter1WorkOrderV137(game);
  game.breakers=3;
  game.interactTarget={userData:{type:'exit'}};
  game.updateInteraction();assert.match(elements.get('hint').textContent,/Master Service Key/);
  game.interactTarget={userData:{type:'breaker'}};
  game.updateInteraction();assert.equal(elements.get('hint').textContent,'E Call freight elevator');
 }finally{globalThis.document=oldDocument;}
});

test('real original arcade-era source key is restored once without reviving retired arcade',()=>{
 const synthetic="function makePickup(type,pos,label,text=null){}\n    // Retail is supplied by the actual approved shell and licensed v69 fixtures.\n";
 const restored=restoreChapter1PickupV137(synthetic);
 assert.match(restored,/makePickup\('key',new THREE.Vector3\(6\.9,\.18,-28\.2\),'Master Service Key'\)/);
 assert.match(restored,/world\.interactables\.push\(masterServiceKeyV137\)/);
 assert.equal((restored.match(/makePickup\('key'/g)||[]).length,1);
 assert.throws(()=>restoreChapter1PickupV137(restored),/hook missing or repeated/);
 const location=storyTargetV70({chapter:1,type:'key',label:'Master Service Key'});
 assert.equal(location.canonical,true,'original pickup must have a canonical source position');
 assert.equal(location.room,'central_gallery');
 const layout=buildGameplayLayoutV70({chapter:1});
 assert.equal(layout.canStand(location.x,location.z),true,
  'real Chapter 1 physical mall must allow retrieving the key at its location');
});
