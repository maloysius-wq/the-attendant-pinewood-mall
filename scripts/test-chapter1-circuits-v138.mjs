import test from 'node:test';
import assert from 'node:assert/strict';
import {circuitLevelV138,installChapter1CircuitLightsV138} from '../mall/chapter1-circuit-lights-v138.js';
import {storyTargetV70} from '../mall/story-placement-v70.mjs';
import {buildGameplayLayoutV70,shortestRouteV70} from '../mall/gameplay-layout-v70.mjs';
const source=[...['A','A','A','A','B','C']].flatMap(circuit=>[
 {isPointLight:true,userData:{chapter1CircuitV138:circuit},intensity:10},
 {isMesh:true,userData:{chapter1CircuitV138:circuit},material:{opacity:1}}
]);
const createGame=()=>{
 const game={levelIndex:0,mallV70:{group:{traverse(fn){for(const x of source)fn(x)}}},
  interactTarget:null,interact(){this.interactTarget.userData.on=true;return true;},
  resetState(){return true}};
 return game;
};
test('real original architectural A/B/C fixture groups light independently',()=>{
 const game=createGame(),api=installChapter1CircuitLightsV138(game);
 assert.deepEqual(api.getState().active,[]);
 assert.ok(api.getState().sources.A.every(x=>x.current===x.original*circuitLevelV138(false)));
 for(const id of ['C','A','B']){
  game.interactTarget={userData:{type:'breaker',id,on:false}};
  game.interact();
  assert.ok(api.getState().sources[id].every(x=>x.current===x.original));
 }
 assert.deepEqual(api.getState().active,['A','B','C']);
 game.interactTarget={userData:{type:'breaker',id:'A',on:true}};game.interact();
 assert.deepEqual(api.getState().active,['A','B','C'],'duplicate E cannot re-fire old source');
 game.levelIndex=1;api.sync();
 assert.ok(source.filter(x=>x.isMesh).every(x=>x.material.transparent===false),
  'later chapters must restore original source-opaque physical bulb materials');
 for(const key of ['A','B','C'])
  assert.ok(api.getState().sources[key].every(x=>x.current===x.original),
   'later chapters retain original exact source brightness');
 game.levelIndex=0;game.resetState();
 assert.deepEqual(api.getState().active,[]);
 assert.ok(api.getState().sources.C.every(x=>x.current===x.original*.34));
 assert.equal(installChapter1CircuitLightsV138(game),api,'no double-wrap');
});
test('only real authored breaker power affects circuit lighting',()=>{
 const game=createGame(),api=installChapter1CircuitLightsV138(game);
 game.interactTarget={userData:{type:'key',id:'A',on:false}};
 game.interact();assert.deepEqual(api.getState().active,[]);
 game.interactTarget={userData:{type:'breaker',id:'D',on:false}};
 game.interact();assert.deepEqual(api.getState().active,[]);
});
test('canonical Chapter 1 breaker and service key centers lie in the true G level',()=>{
 const map=buildGameplayLayoutV70({chapter:1});
 const names=['breaker:A','breaker:B','breaker:C'];
 for(const name of names){
  const id=name.split(':')[1],target=storyTargetV70({chapter:1,type:'breaker',id});
  assert.ok(target.canonical,name+' must not use unordered fallback');
  assert.equal(map.roomAt(target.x,target.z),target.room);
  assert.equal(map.canStand(target.x,target.z),true,name+' actual control must be on walkable floor');
 }
 const key=storyTargetV70({chapter:1,type:'key',label:'Master Service Key'});
 assert.equal(key.canonical,true);assert.ok(map.canStand(key.x,key.z),'actual key must be accessible');
 const exit=storyTargetV70({chapter:1,type:'exit'});
 assert.equal(exit.canonical,true);assert.ok(map.canStand(exit.x,exit.z));
 const portal=map.shell.portals.find(p=>p.id==='east_gallery__freight_lobby');
 assert.deepEqual([portal.at,portal.start,portal.end],[-110,14.25,16.75]);
 assert.ok(portal.end+1.5<18.5,'actual freight entry is well west of the original open lift shaft');
 assert.ok(shortestRouteV70(map,key,exit).length>0,
  'the real Chapter 1 freight lobby must be connected to the retail mall on original solid floor');
 for(const name of names){
  const target=storyTargetV70({chapter:1,type:'breaker',id:name.split(':')[1]});
  const route=shortestRouteV70(map,key,target);
  assert.ok(route.length>0,'real original G-floor walk route missing from key to '+name);
 }
});

test('reloading Chapter 1 rebinds new REAL source lamps and clears prior-run breaker state',()=>{
 const game=createGame(),api=installChapter1CircuitLightsV138(game);
 game.interactTarget={userData:{type:'breaker',id:'A',on:false}};
 game.interact();
 assert.deepEqual(api.getState().active,['A']);
 const fresh=[...['A','A','A','A','B','C']].flatMap(id=>[
  {isPointLight:true,userData:{chapter1CircuitV138:id},intensity:14},
  {isMesh:true,userData:{chapter1CircuitV138:id},material:{opacity:1,transparent:false}}
 ]);
 game.mallV70={group:{traverse(fn){for(const node of fresh)fn(node)}}};
 const reloaded=installChapter1CircuitLightsV138(game);
 assert.equal(reloaded,api,'same Game may be reused across chapters but new scene must rebind');
 assert.deepEqual(reloaded.getState().active,[],'fresh chapter cannot inherit old circuit state');
 for(const id of ['A','B','C'])
  assert.ok(reloaded.getState().sources[id].every(x=>Math.abs(x.current-x.original*.34)<1e-9),
   'fresh original physical light of circuit '+id+' must begin dim again');
 game.interactTarget={userData:{type:'breaker',id:'C',on:false}};
 game.interact();
 assert.deepEqual(reloaded.getState().active,['C']);
 assert.ok(reloaded.getState().sources.C.every(x=>x.current===x.original));
 game.levelIndex=1;reloaded.sync();
 assert.ok(fresh.filter(x=>x.isMesh).every(x=>x.material.transparent===false),
  'new source bulb materials must restore for Chapter 2–6');
});
