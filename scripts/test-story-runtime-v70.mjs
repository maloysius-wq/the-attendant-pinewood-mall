import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/build/three.module.js';
import {buildGameplayLayoutV70} from '../mall/gameplay-layout-v70.mjs';
import {relocateStoryV70} from '../mall/story-runtime-v70.js';

function fakeGame(chapter){
 const root=new THREE.Group(),scene=new THREE.Scene();scene.add(root);
 const world={root,walk:new Set(),tags:new Map(),colliders:[],interactables:[],dynamicDoors:[],navCache:new Map(),bounds:{}};
 return {scene,world,levelIndex:chapter-1,attendant:{root:new THREE.Group()}};
}
function interact(type,label,x,z,y=.18){
 const o=new THREE.Group();o.position.set(x,y,z);o.userData={type,label};return o;
}

test('migration preserves live pickup identity while removing obsolete legacy mall geometry',()=>{
 const game=fakeGame(1),layout=buildGameplayLayoutV70({chapter:1});
 const oldWall=new THREE.Mesh(new THREE.BoxGeometry(10,3,1),new THREE.MeshBasicMaterial());
 game.world.root.add(oldWall);
 const log=interact('journal','LS-01',-23,0);
 game.world.root.add(log);game.world.interactables.push(log);
 relocateStoryV70({game,layout,THREE});
 assert.equal(oldWall.parent,null,'old flat-room mesh should leave the scene');
 assert.equal(log.parent,game.world.root,'same pickup object remains interactive');
 assert.equal(log.position.x,7);
 assert.equal(log.position.z,-66);
 assert.equal(log.userData.label,'LS-01');
 assert.ok(game.world.walk.size>100);
 assert.equal(game.world.colliders.some(c=>c.kind==='wall'||c.kind==='partition'),true);
});

test('basement story setpieces retain their scene references at correct elevation',()=>{
 const game=fakeGame(2),layout=buildGameplayLayoutV70({chapter:2});
 const gav=new THREE.Group();gav.position.set(24,0,-11);game.world.root.add(gav);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(4,12),new THREE.MeshBasicMaterial());water.position.set(9,.035,-11);game.world.root.add(water);
 game.ch2V21={gavinRoot:gav,water};
 relocateStoryV70({game,layout,THREE});
 assert.equal(gav.parent,game.world.root);
 assert.ok(gav.position.y<-4);
 assert.equal(water.parent,game.world.root);
 assert.ok(water.position.z<-80&&water.position.z>-105);
});

test('final closing-memory groups remain together and are scaled into the PA room',()=>{
 const game=fakeGame(6),layout=buildGameplayLayoutV70({chapter:6});
 const present=new THREE.Group(),memory=new THREE.Group();
 const console=interact('ch6_control_v25','Staff Accountability',-22,12,.1);present.add(console);
 game.world.root.add(present,memory);game.world.interactables.push(console);
 game.ch6V25={presentGroup:present,memoryGroup:memory};
 relocateStoryV70({game,layout,THREE});
 assert.equal(console.parent,present);
 assert.equal(present.parent,game.world.root);
 assert.equal(memory.parent,game.world.root);
 assert.ok(present.scale.x<.5);
 assert.equal(present.position.y,5.4);
});

test('Attendant sight does not pass through a drawn storefront wall',()=>{
 const game=fakeGame(1),layout=buildGameplayLayoutV70({chapter:1});
 relocateStoryV70({game,layout,THREE});
 assert.equal(game.world.hasLOS({x:20,z:-77},{x:40,z:-77}),false);
 assert.equal(game.world.hasLOS({x:20,z:-70},{x:39,z:-70}),true);
});

test('chapter six terminals occupy the actual PA room rather than the demolished abstract map',()=>{
 const game=fakeGame(6),layout=buildGameplayLayoutV70({chapter:6});
 const present=new THREE.Group(),memory=new THREE.Group(),echo=new THREE.Group();
 game.world.root.add(present,memory,echo);
 const controls=[
  ['ch6_roster_station_v25',-5.2,12.5],
  ['ch6_eli_station_v25',5.2,12.5],
  ['ch6_key_station_v25',-22,-12],
  ['ch6_service_station_v25',22,-12],
  ['ch6_clockout_station_v25',-24.5,-14],
  ['ch6_employee_exit_v25',27.2,-14]
 ];
 for(const [type,x,z] of controls){
  const o=interact(type,type,x,z,.02);
  game.world.root.add(o);game.world.interactables.push(o);
 }
 const lights=[
  ['present-task',0,12],['memory-1997',0,12]
 ];
 for(const [tag,x,z] of lights){
  const l=new THREE.PointLight();l.position.set(x,2.2,z);l.userData.chapter6LightV25=tag;game.world.root.add(l);
 }
 game.ch6V25={presentGroup:present,memoryGroup:memory,echoRoot:echo,presentTaskLight:game.world.root.children.find(o=>o.userData.chapter6LightV25==='present-task'),memoryLight:game.world.root.children.find(o=>o.userData.chapter6LightV25==='memory-1997')};
 const out=relocateStoryV70({game,layout,THREE});
 assert.equal(out.interactables,controls.length);
 for(const o of game.world.interactables){
  assert.ok(o.position.x>=68&&o.position.x<=80,o.userData.type+' must be in M1 PA');
  assert.ok(o.position.z>=-116&&o.position.z<=-102,o.userData.type+' must be in M1 PA');
  assert.equal(o.position.y,5.42);
 }
 assert.equal(echo.parent,memory,'1997 echo should remain inside the scaled reconstruction');
 for(const l of game.world.root.children.filter(c=>c.userData.chapter6LightV25)){
  assert.ok(l.position.z<-100,'chapter-six task lights must illuminate the real PA room');
 }
});
