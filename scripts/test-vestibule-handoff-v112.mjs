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

test('source-pinned physical door fills wall header and E opens/closes without trapping player',()=>{
 const game=read('game.js'),controller=read('mall/vestibule-door-gameplay-v112.js'),
  model=read('mall/vestibule-inner-door-v112.js');
 assert.ok(game.includes('installVestibuleDoorGameplayV112(args.game)'));
 assert.ok(controller.includes('physicalBlock:true,disabled:door.state.openFraction>.92'));
 assert.ok(controller.includes('if(game.levelIndex===0)door.reset()'),
  'a Chapter 1 restart must force the door shut');
 assert.ok(controller.includes("e.code!=='KeyE'"));
 assert.ok(controller.includes('door.toggle()'),'E must toggle opened and closed');
 assert.ok(controller.includes('occupied()'),'closing cannot trap the player');
 assert.ok(controller.includes('blocker.disabled=!shouldBlock'),
  'both opening and closing must update the real navigation collider');
 assert.ok(model.includes('GLTFLoader'),'door leaf must be a real original licensed GLB');
 assert.ok(model.includes('sourceDoorMeshes:leafMeshes.length'));
 assert.ok(model.includes('sourceFrameMeshes:frameMeshes.length'));
 assert.ok(model.includes('existingVestibuleWall(building,portal)'));
 assert.ok(model.includes('new THREE.BoxGeometry(portal.width,headerHeight,segment.thickness)'));
 assert.ok(model.includes('pivot.rotation.y=Math.PI*.53*eased'));
 assert.ok(model.includes('toggle()'));
 assert.ok(model.includes('reset()'));
 const bridge=read('patches/unified-mall-v70.js.txt');
 assert.ok(bridge.includes('this.controls.yaw.rotation.y=idx===0?0:-Math.PI/2'),
  'first Chapter 1 playable camera heading must remain identical to the film');
});
