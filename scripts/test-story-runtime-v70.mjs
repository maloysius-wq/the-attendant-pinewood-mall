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
