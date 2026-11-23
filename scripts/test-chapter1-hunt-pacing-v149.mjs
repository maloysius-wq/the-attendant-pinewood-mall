import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three/build/three.module.js';
import {SEARCH_RULES_V149,capLostSightHuntV149,chooseLastHeardSweepV149}
 from '../mall/chapter1-hunt-pacing-v149.mjs';
import {installChapter1HuntPacingV149}
 from '../mall/chapter1-hunt-pacing-v149.js';

test('sustained hunt cap only after genuine player LOS is broken and original decoy expires',()=>{
 const source={chapter:1,state:'hunt',visible:true,seen:false,hidden:false,
  decoyUntil:0,now:21,timer:8.8};
 assert.equal(capLostSightHuntV149(source),6.25);
 for(const bad of [
  {chapter:2},{state:'stalk'},{state:'search'},
  {visible:false},{seen:true},{decoyUntil:25},
  {timer:4.4}
 ])assert.equal(capLostSightHuntV149({...source,...bad}),
  bad.timer??source.timer,'unqualified hunt cap triggered '+JSON.stringify(bad));
});
const nav=(blocked=new Set(),unreachable=new Set())=>({
 cellFromWorld:(x,z)=>({x:Math.round(x),z:Math.round(z)}),
 navPassable:(x,z)=>!blocked.has(x+','+z),
 astar(start,goal){
  if(unreachable.has(goal.x+','+goal.z)||blocked.has(goal.x+','+goal.z))return [];
  return [{...start},{x:goal.x,z:goal.z}];
 }
});
test('original source A* sweep picks audible memory first, then reachable neighbors',()=>{
 const world=nav();
 const query={world,source:{x:-27,z:-62},actor:{x:-27,z:-54},step:0};
 const first=chooseLastHeardSweepV149(query);
 assert.deepEqual(first.goal,{x:-27,z:-62});
 assert.equal(first.index,0);assert.equal(first.routeLength,2);
 const next=chooseLastHeardSweepV149({...query,step:1});
 assert.deepEqual(next.goal,{x:-26,z:-62});
 const disconnected=nav(new Set(),new Set(['-27,-62','-26,-62']));
 const reroute=chooseLastHeardSweepV149({...query,world:disconnected,step:0});
 assert.deepEqual(reroute.goal,{x:-27,z:-61});
 const allBlocked=new Set(SEARCH_RULES_V149.offsets.map(([dx,dz])=>
  (-27+dx)+','+(-62+dz)));
 assert.equal(chooseLastHeardSweepV149({...query,world:nav(allBlocked)}),null);
 assert.equal(chooseLastHeardSweepV149({...query,source:{x:Infinity,z:-62}}),null);
});
function fixture(){
 const player=new THREE.Vector3(-41,1.7,-54);
 const actorRoot=new THREE.Group();actorRoot.position.set(-27,0,-54);actorRoot.visible=true;
 const originalWorld=nav();
 const a={
  root:actorRoot,state:'hunt',awake:true,
  timer:9,repath:0,path:[],pathIndex:0,
  decoyUntil:0,lastHeard:new THREE.Vector3(-27,0,-62),
  nextStalk:1,seen:false,
  canSee(){return this.seen;},
  setPath(target){
   const from=originalWorld.cellFromWorld(this.root.position.x,this.root.position.z);
   const to=originalWorld.cellFromWorld(target.x,target.z);
   this.path=originalWorld.astar(from,to);this.pathIndex=this.path.length>1?1:0;
  },
  update(dt){
   this.timer-=dt;
   if(this.state==='hunt'){
    this.setPath(player);
    if(this.timer<=0){this.state='search';this.timer=5;}
   }else if(this.state==='search'){
    if(this.repath<=0){this.setPath({x:100,z:100});this.repath=1;}
   }
   this.repath-=dt;
  }
 };
 const game={levelIndex:0,time:35,attendant:a,
  controls:{yaw:{position:player}},world:originalWorld,
  __chapter1StealthV139:{getState:()=>({revealed:true})},
  __chapter1RecoveryV140:{},__chapter1DecoyResponseV146:{},
  __chapter1FirstPeekDecoyV147:{},dead:false,won:false,
  resetState(){this.time=0;this.attendant.state='dormant';}
 };
 return {game,a};
}
test('source original Attendant hunt continues, safely caps unseen memory, then searches original A* near last heard',()=>{
 const {game,a}=fixture();
 const api=installChapter1HuntPacingV149(game);
 assert.equal(installChapter1HuntPacingV149(game),api);
 a.update(.016,game.time,game.controls.yaw.position,0);
 assert.equal(a.state,'hunt');
 assert.equal(a.timer,SEARCH_RULES_V149.lostSightHuntCapSeconds);
 assert.equal(api.getState().postSightCaps,1);
 a.timer=.002;
 a.update(.02,game.time,game.controls.yaw.position,0);
 assert.equal(a.state,'search');
 assert.equal(api.getState().searchEntries,1);
 assert.deepEqual(api.getState().originalPathEnd,{x:-27,z:-62});
 assert.equal(api.getState().sourceSweepPaths,1);
 assert.deepEqual(api.getState().sourceLastHeard,{x:-27,z:-62});
 a.repath=0;
 a.update(.4,game.time,game.controls.yaw.position,0);
 assert.deepEqual(api.getState().originalPathEnd,{x:-26,z:-62});
 assert.equal(api.getState().sourceSweepPaths,2);
 assert.equal(api.getState().lastSweep.originalCellPassable,true);
 assert.equal(api.getState().inaccessibleSourcePaths,0);
 a.state='hunt';a.seen=true;a.timer=9;
 a.update(.016,game.time,game.controls.yaw.position,0);
 assert.ok(a.timer>8.9,'actual visible player still triggers original sustained hunt');
 game.levelIndex=1;
 a.state='search';a.setPath({x:38,z:39});
 assert.deepEqual(a.path.at(-1),{x:38,z:39},
  'later chapters preserve original search destination untouched');
 game.levelIndex=0;game.resetState();
 assert.equal(api.getState().sourceSweepPaths,0);
 assert.equal(api.getState().postSightCaps,0);
 assert.equal(api.getState().searchEntries,0);
});
test('V149 cannot create fake paths, props, AI, network or HUD tips',()=>{
 const src=readFileSync('mall/chapter1-hunt-pacing-v149.js','utf8');
 const game=readFileSync('game.js','utf8');
 assert.match(game,/installChapter1FirstPeekDecoyV147\(args\.game\);\s*installChapter1RestartWitnessV148\(args\.game\);\s*installChapter1HuntPacingV149\(args\.game\);/);
 assert.match(src,/originalUpdate\.apply\(this,args\)/);
 assert.match(src,/originalSetPath\.call\(this,next\.goal/);
 assert.match(src,/originalReset\.apply\(this,args\)/);
 assert.doesNotMatch(src,/new THREE|\.colliders\.push|\.interactables\.push|window\.addEventListener|new Audio|https?:\/\/|fetch\(|localStorage|indexedDB|\bhint\.textContent/);
});
