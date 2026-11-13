import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {VESTIBULE_HANDOFF_V112,vestibuleInnerPortalV112} from '../mall/vestibule-handoff-v112.mjs';
import {HumanCameraRig} from '../opening/camera-v65.js';
import {buildGameplayLayoutV70,chapterRouteV70} from '../mall/gameplay-layout-v70.mjs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('last cinematic frame is precisely Chapter 1 spawn, with level straight-ahead gaze',()=>{
 const h=VESTIBULE_HANDOFF_V112,spawn=chapterRouteV70(1).spawn;
 assert.deepEqual([spawn.x,spawn.y,spawn.z],[h.x,h.y,h.z]);
 const camera=new HumanCameraRig();
 const last=camera.sample('direction',28,28,1/60);
 assert.deepEqual(last.position.toArray(),[h.x,h.y,h.z]);
 assert.deepEqual(last.lookAt.toArray(),[h.x,h.y,h.z-18]);
 assert.equal(h.yaw,0);assert.equal(h.pitch,0);
 const nearEnd=camera.sample('direction',27,28,1/60);
 assert.deepEqual(nearEnd.position.toArray(),[h.x,h.y,h.z],
  'end of final dialogue cannot drift after reaching middle of room');
 assert.deepEqual(nearEnd.lookAt.toArray(),last.lookAt.toArray());
 const layout=buildGameplayLayoutV70({chapter:1});
 assert.equal(layout.canStand(h.x,h.z),true);
 assert.equal(layout.roomAt(h.x,h.z),'service_vestibule');
});

test('inner fire door is located within actual 1.8 m measured service-to-atrium wall opening',()=>{
 const p=vestibuleInnerPortalV112();
 assert.equal(p.id,'service_vestibule__central_gallery');
 assert.equal(p.axis,'z');assert.equal(p.z,-43);
 assert.ok(p.start>=9&&p.end<=11&&p.width>=1.6&&p.width<=2.1);
 assert.ok(VESTIBULE_HANDOFF_V112.z>p.z+9,'player ends well before closed door');
 const movie=read('opening/intro-v65.js'),renderer=read('mall/authored-scene-v111.js');
 assert.match(renderer,/mountVestibuleInnerDoorV112\(building\)/);
 assert.match(movie,/get vestibuleInnerDoorV112\(\)/);
});

test('game adds a real impassable door and explicit E interaction; no autoplay gate',()=>{
 const game=read('game.js'),door=read('mall/vestibule-door-gameplay-v112.js'),
  model=read('mall/vestibule-inner-door-v112.js');
 assert.match(game,/installVestibuleDoorGameplayV112\(args\.game\)/);
 assert.match(door,/physicalBlock:true,disabled:door\.state\.openFraction>\.92/);
 assert.match(door,/if\(game\.levelIndex===0\)door\.close\(\)/,'restarting Chapter 1 closes the inner door');
 assert.match(door,/e\.code!=='KeyE'/);
 assert.match(door,/blocker\.disabled=true/);
 assert.match(model,/let fraction=0,target=0/);
 assert.match(model,/pivot\.rotation\.y=Math\.PI\*\.53\*eased/);
 const bridge=read('patches/unified-mall-v70.js.txt');
 assert.match(bridge,/if\(idx===0\)\{this\.controls\.yaw\.rotation\.y=0/);
});
